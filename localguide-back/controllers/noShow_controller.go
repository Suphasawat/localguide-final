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
			"error": "Booking ID must be a positive integer",
		})
	}

	var booking models.TripBooking
	if err := config.DB.First(&booking, bookingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Booking not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get booking",
		})
	}

	// ตรวจสอบสิทธิ์
	userID := c.Locals("user_id").(uint)
	if booking.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only confirm no-show for your own bookings",
		})
	}

	// Validate status
	// ยอมให้ผู้ใช้ยืนยันการไม่มาได้เฉพาะเมื่อไกด์ได้รีพอร์ตแล้วเท่านั้น
	if booking.Status != "user_no_show_reported" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":  "Invalid booking status for no-show confirmation",
			"status": booking.Status,
			"message": "User can only confirm no-show after guide reports it",
		})
	}

	// ป้องกันการยืนยันซ้ำหรือการดำเนินการกับ booking ที่ถูกตัดสินแล้ว
	if booking.Status == "user_no_show_confirmed" || booking.Status == "user_no_show_disputed" || booking.Status == "guide_no_show_confirmed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No-show already handled",
			"status": booking.Status,
		})
	}

	// 🔧 แก้ไข: เทียบแค่วัน ไม่สนเวลา
	now := time.Now()
	startYear, startMonth, startDay := booking.StartDate.Date()
	nowYear, nowMonth, nowDay := now.Date()
	startDateOnly := time.Date(startYear, startMonth, startDay, 0, 0, 0, 0, booking.StartDate.Location())
	nowDateOnly := time.Date(nowYear, nowMonth, nowDay, 0, 0, 0, 0, now.Location())

	if nowDateOnly.Before(startDateOnly) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot confirm no-show before trip start date",
		})
	}

	// Get payment
	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ?", bookingID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Payment not found",
		})
	}

	// ป้องกันการคืนเงินซ้ำ หาก payment ถูกคืนบางส่วนหรือคืนเต็มไปแล้ว
	if payment.Status == "partially_refunded" || payment.Status == "refunded" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment already refunded or partially refunded",
			"payment_status": payment.Status,
		})
	}

	// คำนวณเงิน: Guide ได้ 50%, User refund 50%
	guideAmount := payment.TotalAmount * 0.5
	userRefundAmount := payment.TotalAmount * 0.5

	// Release 50% payment to guide
	guideRelease := models.PaymentRelease{
		TripPaymentID: payment.ID,
		ReleaseType:   "partial_release",
		Amount:        guideAmount,
		RecipientType: "guide",
		RecipientID:   booking.GuideID,
		Reason:        "user_confirmed_no_show",
		ScheduledAt:   now,
		ProcessedAt:   &now,
		Status:        "processed",
		Notes:         "Guide compensation for user no-show (50%)",
	}

	if err := config.DB.Create(&guideRelease).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create guide payment release",
		})
	}

	// Refund 50% to user via Stripe
	stripeService := services.NewStripeService()
	refundAmountCents := int64(userRefundAmount * 100)

	stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, refundAmountCents, "requested_by_customer")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process Stripe refund: " + err.Error(),
		})
	}

	userRefund := models.PaymentRelease{
		TripPaymentID:  payment.ID,
		ReleaseType:    "refund",
		Amount:         userRefundAmount,
		RecipientType:  "user",
		RecipientID:    booking.UserID,
		Reason:         "user_confirmed_no_show",
		ScheduledAt:    now,
		ProcessedAt:    &now,
		Status:         "processed",
		TransactionRef: stripeRefund.ID,
		Notes:          "50% refund - user confirmed no-show",
	}

	if err := config.DB.Create(&userRefund).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user refund record",
		})
	}

	// Update payment status
	payment.Status = "partially_refunded"
	payment.RefundedAt = &now
	payment.RefundAmount = userRefundAmount
	payment.RefundReason = "user_confirmed_no_show"
	if err := config.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update payment status",
		})
	}

	// Update booking status
	booking.Status = "user_no_show_confirmed"
	booking.NoShowAt = &now
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update booking",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":       "No-show confirmed: Guide receives 50%, User refunded 50%",
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
			"error": "Booking ID must be a positive integer",
		})
	}

	// Parse request body for reason, description, and evidence
	var requestData struct {
		Reason      string `json:"reason"`
		Description string `json:"description"`
		Evidence    string `json:"evidence"`
	}
	// Not required, so don't fail if parsing fails
	c.BodyParser(&requestData)

	var booking models.TripBooking
	if err := config.DB.First(&booking, bookingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Booking not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get booking",
		})
	}

	// ตรวจสอบสิทธิ์ - ต้องเป็นไกด์ของ booking นี้
	userID := c.Locals("user_id").(uint)
	
	// หา guide_id จาก user_id
	var guide models.Guide
	if err := config.DB.Where("user_id = ?", userID).First(&guide).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Guide profile not found",
		})
	}
	
	if booking.GuideID != guide.ID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only report no-show for your own bookings",
		})
	}

	// Validate status
	if booking.Status != "paid" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid booking status for no-show report",
		})
	}

	// 🔧 แก้ไข: เทียบแค่วัน ไม่สนเวลา
	now := time.Now()
	startYear, startMonth, startDay := booking.StartDate.Date()
	nowYear, nowMonth, nowDay := now.Date()
	startDateOnly := time.Date(startYear, startMonth, startDay, 0, 0, 0, 0, booking.StartDate.Location())
	nowDateOnly := time.Date(nowYear, nowMonth, nowDay, 0, 0, 0, 0, now.Location())

	if nowDateOnly.Before(startDateOnly) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot report no-show before trip start date",
		})
	}

	// อัปเดต booking status
	booking.Status = "user_no_show_reported"
	booking.NoShowAt = &now
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update booking",
		})
	}

	// สร้าง TripReport
	description := requestData.Description
	if description == "" {
		description = requestData.Reason
	}
	if description == "" {
		description = "Guide reported that user did not show up for the trip."
	}

	report := models.TripReport{
		TripBookingID:  uint(bookingID),
		ReporterID:     userID,
		ReportedUserID: booking.UserID,
		ReportType:     "user_no_show",
		Title:          "Guide reports user no-show",
		Description:    description,
		Evidence:       requestData.Evidence,
		Severity:       "high",
		Status:         "pending",
		AdminNotes:     "",
		Actions:        "",
	}

	if err := config.DB.Create(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create no-show report",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "User no-show reported. User has 24 hours to respond, or admin will review.",
		"booking": booking,
		"report":  report,
		"status":  "reported",
		"note":    "User can confirm or dispute this report within 24 hours",
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
	userID := c.Locals("user_id").(uint)
	if booking.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "You can only dispute reports for your own bookings",
		})
	}

	if booking.Status != "user_no_show_reported" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "No active no-show report to dispute",
		})
	}

	// Update booking status to disputed (รอ admin ตัดสิน)
	booking.Status = "user_no_show_disputed"
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
		AdminNotes:     "",
		Actions:        "",
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

// ReportGuideNoShow - User รีพอร์ตว่าไกด์ไม่มา -> คืนเงินเต็มจำนวนทันที
func ReportGuideNoShow(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil || bookingID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Booking ID must be a positive integer",
		})
	}

	// Parse request body (optional)
	var requestData struct {
		Reason      string `json:"reason"`
		Description string `json:"description"`
		Evidence    string `json:"evidence"`
	}
	// ไม่ return error ถ้า parse ไม่ได้ เพราะ request body เป็น optional
	c.BodyParser(&requestData)
	
	// ถ้าไม่มี reason ให้ใช้ค่า default
	if requestData.Reason == "" {
		requestData.Reason = "Guide did not show up"
	}

	var booking models.TripBooking
	if err := config.DB.First(&booking, bookingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Booking not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get booking",
		})
	}

	// ตรวจสอบสิทธิ์
	userID := c.Locals("user_id").(uint)
	if booking.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only report guide no-show for your own bookings",
		})
	}

	// Validate status
	if booking.Status != "paid" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid booking status for guide no-show report",
			"status":  booking.Status,
			"message": "Booking must be in 'paid' status to report guide no-show",
		})
	}

	// 🔧 แก้ไข: เทียบแค่วัน ไม่สนเวลา
	now := time.Now()
	startYear, startMonth, startDay := booking.StartDate.Date()
	nowYear, nowMonth, nowDay := now.Date()
	startDateOnly := time.Date(startYear, startMonth, startDay, 0, 0, 0, 0, booking.StartDate.Location())
	nowDateOnly := time.Date(nowYear, nowMonth, nowDay, 0, 0, 0, 0, now.Location())

	if nowDateOnly.Before(startDateOnly) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":      "Cannot report guide no-show before trip start date",
			"start_date": booking.StartDate.Format("2006-01-02"),
			"now":        now.Format("2006-01-02"),
		})
	}

	// อัปเดต booking status
	booking.Status = "guide_no_show_confirmed"
	booking.NoShowAt = &now
	booking.CancellationReason = "guide_no_show"
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update booking",
		})
	}

	// สร้าง TripReport
	description := requestData.Description
	if description == "" {
		description = requestData.Reason
	}
	if description == "" {
		description = "User reported that guide did not show up for the trip."
	}

	report := models.TripReport{
		TripBookingID:  uint(bookingID),
		ReporterID:     userID,
		ReportedUserID: booking.GuideID,
		ReportType:     "guide_no_show",
		Title:          "User reports guide no-show",
		Description:    description,
		Evidence:       requestData.Evidence,
		Severity:       "critical",
		Status:         "pending",
		AdminNotes:     "",
		Actions:        "",
	}

	if err := config.DB.Create(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create guide no-show report",
		})
	}

	// คืนเงินเต็มจำนวนให้ลูกค้าทันที
	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ?", bookingID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Payment not found",
		})
	}

	stripeService := services.NewStripeService()
	refundAmountCents := int64(payment.TotalAmount * 100)
	
	stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, refundAmountCents, "requested_by_customer")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process Stripe refund: " + err.Error(),
		})
	}

	userRefund := models.PaymentRelease{
		TripPaymentID:  payment.ID,
		ReleaseType:    "refund",
		Amount:         payment.TotalAmount,
		RecipientType:  "user",
		RecipientID:    booking.UserID,
		Reason:         "guide_no_show",
		ScheduledAt:    now,
		ProcessedAt:    &now,
		Status:         "processed",
		TransactionRef: stripeRefund.ID,
		Notes:          "Full refund - guide no-show",
	}
	
	if err := config.DB.Create(&userRefund).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create refund record",
		})
	}

	// อัปเดต payment status
	payment.Status = "refunded"
	payment.RefundedAt = &now
	payment.RefundAmount = payment.TotalAmount
	payment.RefundReason = "guide_no_show"
	if err := config.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update payment status",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Guide no-show reported. Full refund issued immediately.",
		"booking":     booking,
		"report":      report,
		"user_refund": userRefund,
		"status":      "refunded",
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
	stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, refundAmount, "requested_by_customer")
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