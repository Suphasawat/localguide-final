package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"localguide-back/services"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ConfirmUserNoShow - User ยืนยันว่าตัวเองไม่ได้ไป -> ไกด์ได้ 50% + คืนเงินส่วนที่เหลือให้ user
func ConfirmUserNoShow(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil || bookingID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Booking ID must be a positive integer",
		})
	}

	var booking models.TripBooking
	if err := config.DB.First(&booking, bookingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "Booking not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get booking",
		})
	}

	// ตรวจสอบว่าเป็นเจ้าของ booking หรือไม่
	userID := c.Locals("userID").(uint)
	if booking.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "You can only confirm no-show for your own bookings",
		})
	}

	if booking.Status != "paid" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid booking status for no-show confirmation",
		})
	}

	// Update booking status
	now := time.Now()
	booking.Status = "no_show_confirmed"
	booking.NoShowAt = &now
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update booking",
		})
	}

	// Get payment
	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ?", bookingID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Payment not found",
		})
	}

	// Release 50% payment to guide
	guideRelease := models.PaymentRelease{
		TripPaymentID: payment.ID,
		ReleaseType:   "first_payment",
		Amount:        payment.FirstPayment,
		RecipientType: "guide",
		RecipientID:   booking.GuideID,
		Reason:        "user_confirmed_no_show",
		ScheduledAt:   now,
		ProcessedAt:   &now,
		Status:        "processed",
	}
	
	if err := config.DB.Create(&guideRelease).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create guide payment release",
		})
	}

	// Refund remaining 50% to user via Stripe
	stripeService := services.NewStripeService()
	refundAmount := int64(payment.SecondPayment * 100) // Convert to cents
	
	stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, refundAmount, "user_confirmed_no_show")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to process Stripe refund: " + err.Error(),
		})
	}

	userRefund := models.PaymentRelease{
		TripPaymentID:  payment.ID,
		ReleaseType:    "refund",
		Amount:         payment.SecondPayment,
		RecipientType:  "user",
		RecipientID:    booking.UserID,
		Reason:         "user_confirmed_no_show",
		ScheduledAt:    now,
		ProcessedAt:    &now,
		Status:         "processed",
		TransactionRef: stripeRefund.ID, // Stripe refund ID
		Notes:          "User confirmed no-show, refunded via Stripe",
	}
	
	if err := config.DB.Create(&userRefund).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create user refund record",
		})
	}

	// Update payment status
	payment.Status = "partially_refunded"
	payment.RefundedAt = &now
	payment.RefundAmount = payment.SecondPayment
	payment.RefundReason = "user_confirmed_no_show"
	if err := config.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update payment status",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":       "No-show confirmed by user: 50% paid to guide, 50% refunded to user",
		"booking":       booking,
		"guide_release": guideRelease,
		"user_refund":   userRefund,
	})
}

// ReportUserNoShow - Guide รีพอร์ต user ไม่มา -> รอ user ยืนยัน หรือ admin ตัดสิน
func ReportUserNoShow(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil || bookingID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Booking ID must be a positive integer",
		})
	}

	var booking models.TripBooking
	if err := config.DB.First(&booking, bookingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "Booking not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get booking",
		})
	}

	// ตรวจสอบว่าเป็นไกด์ของ booking นี้หรือไม่
	userID := c.Locals("userID").(uint)
	if booking.GuideID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "You can only report no-show for your own bookings",
		})
	}

	if booking.Status != "paid" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid booking status for no-show report",
		})
	}

	// ตรวจสอบว่า user ยืนยันแล้วหรือยัง (ใช้สถานะแทน)
	if booking.Status == "no_show_confirmed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "User has already confirmed no-show. Use admin process or wait for auto-process.",
		})
	}

	// Update booking status to reported (รอ user ยืนยัน)
	now := time.Now()
	booking.Status = "no_show_reported"
	booking.NoShowAt = &now
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update booking",
		})
	}

	// TODO: ส่ง notification ให้ user ให้ยืนยันหรือคัดค้าน
	// TODO: ตั้ง timer ให้ auto-process หลังจาก 24-48 ชั่วโมง ถ้า user ไม่ตอบสนอง

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "No-show reported. Waiting for user confirmation or admin review.",
		"booking": booking,
		"status":  "reported",
		"note":    "User has 24 hours to respond. After that, admin will review the case.",
	})
}

// DisputeNoShowReport - User คัดค้านการรีพอร์ต no-show จากไกด์
func DisputeNoShowReport(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil || bookingID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Booking ID must be a positive integer",
		})
	}

	var requestData struct {
		Reason      string `json:"reason"`
		Description string `json:"description"`
		Evidence    string `json:"evidence"` // URL ของหลักฐาน เช่น รูปภาพ
	}

	if err := c.BodyParser(&requestData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid request data",
		})
	}

	var booking models.TripBooking
	if err := config.DB.First(&booking, bookingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "Booking not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get booking",
		})
	}

	// ตรวจสอบว่าเป็นเจ้าของ booking หรือไม่
	userID := c.Locals("userID").(uint)
	if booking.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "You can only dispute reports for your own bookings",
		})
	}

	if booking.Status != "no_show_reported" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "No active no-show report to dispute",
		})
	}

	// Update booking status to disputed (รอ admin ตัดสิน)
	booking.Status = "no_show_disputed"
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update booking",
		})
	}

	// สร้าง TripReport สำหรับการคัดค้าน
	report := models.TripReport{
		TripBookingID:  uint(bookingID),
		ReporterID:     userID,
		ReportedUserID: booking.GuideID,
		ReportType:     "dispute_no_show",
		Title:          "User disputes no-show report",
		Description:    requestData.Description,
		Evidence:       requestData.Evidence,
		Severity:       "medium",
		Status:         "pending",
	}

	if err := config.DB.Create(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create dispute report",
		})
	}

	// TODO: ส่ง notification ให้ admin สำหรับการตัดสิน

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "No-show report disputed successfully. Admin will review the case.",
		"booking": booking,
		"report":  report,
		"status":  "disputed",
	})
}

// Helper function สำหรับประมวลผล no-show payment (50%-50%)
func processNoShowPayment(c *fiber.Ctx, booking *models.TripBooking, payment *models.TripPayment, stripeService *services.StripeService, now time.Time, reason string) error {
	booking.Status = "no_show_confirmed"
	booking.CancellationReason = reason
	if err := config.DB.Save(booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update booking",
		})
	}

	// Release 50% payment to guide
	guideRelease := models.PaymentRelease{
		TripPaymentID: payment.ID,
		ReleaseType:   "first_payment",
		Amount:        payment.FirstPayment,
		RecipientType: "guide",
		RecipientID:   booking.GuideID,
		Reason:        reason,
		ScheduledAt:   now,
		ProcessedAt:   &now,
		Status:        "processed",
	}

	if err := config.DB.Create(&guideRelease).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create guide payment release",
		})
	}

	// Refund remaining 50% to user via Stripe
	refundAmount := int64(payment.SecondPayment * 100) // Convert to cents
	stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, refundAmount, reason)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to process Stripe refund: " + err.Error(),
		})
	}

	userRefund := models.PaymentRelease{
		TripPaymentID:  payment.ID,
		ReleaseType:    "refund",
		Amount:         payment.SecondPayment,
		RecipientType:  "user",
		RecipientID:    booking.UserID,
		Reason:         reason,
		ScheduledAt:    now,
		ProcessedAt:    &now,
		Status:         "processed",
		TransactionRef: stripeRefund.ID,
		Notes:          "50% refund - no-show confirmed",
	}

	if err := config.DB.Create(&userRefund).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create user refund record",
		})
	}

	// Update payment status
	payment.Status = "partially_refunded"
	payment.RefundedAt = &now
	payment.RefundAmount = payment.SecondPayment
	payment.RefundReason = reason
	if err := config.DB.Save(payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update payment status",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":       "No-show confirmed: 50% paid to guide, 50% refunded to user",
		"booking":       booking,
		"guide_release": guideRelease,
		"user_refund":   userRefund,
		"decision":      "guide_wins",
	})
}