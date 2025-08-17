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

// CreateTripPayment - สร้าง PaymentIntent กับ Stripe
func CreateTripPayment(c *fiber.Ctx) error {
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

	// Get user and auth user details for email
	var user models.User
	if err := config.DB.First(&user, booking.UserID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get user details",
		})
	}

	var authUser models.AuthUser
	if err := config.DB.First(&authUser, user.AuthUserID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get user email",
		})
	}

	// Check if payment already exists
	if booking.PaymentStatus == "paid" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Payment already completed",
		})
	}

	// สร้าง Stripe PaymentIntent
	stripeService := services.NewStripeService()
	paymentIntent, err := stripeService.CreatePaymentIntent(&booking, authUser.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create payment intent: " + err.Error(),
		})
	}

	// Create payment record
	now := time.Now()
	payment := models.TripPayment{
		TripBookingID:         uint(bookingID),
		PaymentNumber:         "PAY" + strconv.Itoa(int(now.Unix())),
		TransactionID:         paymentIntent.ID,
		StripePaymentIntentID: paymentIntent.ID,
		StripeClientSecret:    paymentIntent.ClientSecret,
		StripeStatus:         string(paymentIntent.Status),
		TotalAmount:          booking.TotalAmount,
		FirstPayment:         booking.TotalAmount * 0.5,  // 50% for first release
		SecondPayment:        booking.TotalAmount * 0.5,  // 50% for second release
		PaymentMethod:        "stripe_card",
		Status:               "pending", // รอการชำระเงินจาก user
	}

	if err := config.DB.Create(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create payment record",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"payment":            payment,
		"client_secret":      paymentIntent.ClientSecret,
		"payment_intent_id":  paymentIntent.ID,
		"amount":            booking.TotalAmount,
		"message":           "Payment intent created. Complete payment on client side.",
	})
}

// GetTripPayment - ดูข้อมูลการจ่ายเงิน
func GetTripPayment(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil || bookingID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Booking ID must be a positive integer",
		})
	}

	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ?", bookingID).First(&payment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "Payment not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get payment",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"payment": payment,
	})
}

// GetTripBookings - ดู bookings ของตัวเอง (enrich response)
func GetTripBookings(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	// ดู role ว่าเป็น user หรือ guide
	var user models.User
	if err := config.DB.Preload("Role").First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get user info",
		})
	}

	var bookings []models.TripBooking
	query := config.DB.Preload("TripOffer.TripRequire.Province").
		Preload("TripOffer.Guide.User").
		Preload("User").
		Preload("Guide.User")

	// Filter ตาม role
	if user.Role.Name == "guide" {
		// ถ้าเป็น guide ให้ดู booking ที่ตัวเองเป็น guide
		query = query.Where("guide_id = ?", userID)
	} else {
		// ถ้าเป็น user ให้ดู booking ที่ตัวเองเป็น user
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Find(&bookings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get bookings",
		})
	}

	// Enrich response
	var enrichedBookings []fiber.Map
	for _, booking := range bookings {
		// Get payment info
		var payment models.TripPayment
		hasPayment := false
		if config.DB.Where("trip_booking_id = ?", booking.ID).First(&payment).Error == nil {
			hasPayment = true
		}

		// Get payment releases
		var releases []models.PaymentRelease
		if hasPayment {
			config.DB.Where("trip_payment_id = ?", payment.ID).Find(&releases)
		}

		enriched := fiber.Map{
			"id":               booking.ID,
			"trip_offer_id":    booking.TripOfferID,
			"user_id":          booking.UserID,
			"guide_id":         booking.GuideID,
			"start_date":       booking.StartDate,
			"total_amount":     booking.TotalAmount,
			"status":           booking.Status,
			"payment_status":   booking.PaymentStatus,
			"trip_started_at":  booking.TripStartedAt,
			"trip_completed_at": booking.TripCompletedAt,
			"cancelled_at":     booking.CancelledAt,
			"no_show_at":       booking.NoShowAt,
			"cancellation_reason": booking.CancellationReason,
			"special_requests": booking.SpecialRequests,
			"notes":           booking.Notes,
			"created_at":      booking.CreatedAt,
			"updated_at":      booking.UpdatedAt,
		}

		// Add trip require info
		if booking.TripOffer.TripRequire.Province.Name != "" {
			enriched["province_name"] = booking.TripOffer.TripRequire.Province.Name
		}
		enriched["trip_title"] = booking.TripOffer.TripRequire.Title

		// Add user info (สำหรับ guide)
		if user.Role.Name == "guide" && booking.User.FirstName != "" {
			enriched["user_name"] = booking.User.FirstName + " " + booking.User.LastName
		}

		// Add guide info (สำหรับ user)
		if user.Role.Name != "guide" && booking.Guide.User.FirstName != "" {
			enriched["guide_name"] = booking.Guide.User.FirstName + " " + booking.Guide.User.LastName
		}

		// Add payment info
		if hasPayment {
			enriched["payment"] = fiber.Map{
				"total_amount":      payment.TotalAmount,
				"first_payment":     payment.FirstPayment,
				"second_payment":    payment.SecondPayment,
				"payment_method":    payment.PaymentMethod,
				"status":           payment.Status,
				"paid_at":          payment.PaidAt,
				"first_released_at": payment.FirstReleasedAt,
				"second_released_at": payment.SecondReleasedAt,
				"refunded_at":      payment.RefundedAt,
				"refund_amount":    payment.RefundAmount,
				"refund_reason":    payment.RefundReason,
			}
			enriched["payment_releases"] = releases
		}

		enrichedBookings = append(enrichedBookings, enriched)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"bookings": enrichedBookings,
		"total":   len(enrichedBookings),
	})
}

// GetTripBookingByID - ดู booking รายการเดียว (enrich response)
func GetTripBookingByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Booking ID must be a positive integer",
		})
	}

	userID := c.Locals("userID").(uint)

	var booking models.TripBooking
	if err := config.DB.Preload("TripOffer.TripRequire.Province").
		Preload("TripOffer.Guide.User").
		Preload("User").
		Preload("Guide.User").
		First(&booking, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Booking not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get booking",
		})
	}

	// ตรวจสอบสิทธิ์ - ต้องเป็นเจ้าของ booking หรือไกด์ของ booking
	if booking.UserID != userID && booking.GuideID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only view your own bookings",
		})
	}

	// Get payment info
	var payment models.TripPayment
	hasPayment := false
	if config.DB.Where("trip_booking_id = ?", booking.ID).First(&payment).Error == nil {
		hasPayment = true
	}

	// Get payment releases
	var releases []models.PaymentRelease
	if hasPayment {
		config.DB.Where("trip_payment_id = ?", payment.ID).Find(&releases)
	}

	// Get trip reviews
	var reviews []models.TripReview
	config.DB.Where("trip_booking_id = ?", booking.ID).Find(&reviews)

	// Get trip reports
	var reports []models.TripReport
	config.DB.Where("trip_booking_id = ?", booking.ID).Find(&reports)

	// Build enriched response
	enrichedBooking := fiber.Map{
		"id":               booking.ID,
		"trip_offer_id":    booking.TripOfferID,
		"user_id":          booking.UserID,
		"guide_id":         booking.GuideID,
		"start_date":       booking.StartDate,
		"total_amount":     booking.TotalAmount,
		"status":           booking.Status,
		"payment_status":   booking.PaymentStatus,
		"trip_started_at":  booking.TripStartedAt,
		"trip_completed_at": booking.TripCompletedAt,
		"cancelled_at":     booking.CancelledAt,
		"no_show_at":       booking.NoShowAt,
		"cancellation_reason": booking.CancellationReason,
		"special_requests": booking.SpecialRequests,
		"notes":           booking.Notes,
		"created_at":      booking.CreatedAt,
		"updated_at":      booking.UpdatedAt,

		// Trip info
		"trip_title":       booking.TripOffer.TripRequire.Title,
		"trip_description": booking.TripOffer.TripRequire.Description,
		"province_name":    booking.TripOffer.TripRequire.Province.Name,
		"trip_days":        booking.TripOffer.TripRequire.Days,

		// Offer info
		"offer_title":           booking.TripOffer.Title,
		"offer_description":     booking.TripOffer.Description,
		"offer_itinerary":       booking.TripOffer.Itinerary,
		"offer_included_services": booking.TripOffer.IncludedServices,
		"offer_excluded_services": booking.TripOffer.ExcludedServices,

		// User info
		"user_name": booking.User.FirstName + " " + booking.User.LastName,

		// Guide info
		"guide_name": booking.Guide.User.FirstName + " " + booking.Guide.User.LastName,
		"guide_bio":  booking.Guide.Bio,
		"guide_rating": booking.Guide.Rating,
	}

	// Add payment info
	if hasPayment {
		enrichedBooking["payment"] = fiber.Map{
			"id":               payment.ID,
			"payment_number":   payment.PaymentNumber,
			"total_amount":     payment.TotalAmount,
			"first_payment":    payment.FirstPayment,
			"second_payment":   payment.SecondPayment,
			"payment_method":   payment.PaymentMethod,
			"transaction_id":   payment.TransactionID,
			"status":          payment.Status,
			"paid_at":         payment.PaidAt,
			"first_released_at": payment.FirstReleasedAt,
			"second_released_at": payment.SecondReleasedAt,
			"refunded_at":     payment.RefundedAt,
			"refund_amount":   payment.RefundAmount,
			"refund_reason":   payment.RefundReason,
			"notes":          payment.Notes,
		}
		enrichedBooking["payment_releases"] = releases
	}

	// Add reviews
	enrichedBooking["reviews"] = reviews

	// Add reports
	enrichedBooking["reports"] = reports

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"booking": enrichedBooking,
	})
}

// ConfirmGuideArrival - User ยืนยันไกด์มา -> ไกด์ได้เงิน 50%
func ConfirmGuideArrival(c *fiber.Ctx) error {
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

	if booking.Status != "paid" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Booking must be paid before confirming guide arrival",
		})
	}

	// Update booking status
	now := time.Now()
	booking.Status = "trip_started"
	booking.TripStartedAt = &now
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update booking",
		})
	}

	// Get payment to calculate first release
	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ?", bookingID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Payment not found",
		})
	}

	// Create payment release record for guide (50%)
	release := models.PaymentRelease{
		TripPaymentID: payment.ID,
		ReleaseType:   "first_payment",
		Amount:        payment.FirstPayment,
		RecipientType: "guide",
		RecipientID:   booking.GuideID,
		Reason:        "trip_started",
		ScheduledAt:   now,
		ProcessedAt:   &now,
		Status:        "processed",
	}
	
	if err := config.DB.Create(&release).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create payment release",
		})
	}

	// Update payment status
	payment.Status = "first_released"
	payment.FirstReleasedAt = &now
	if err := config.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update payment status",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Guide arrival confirmed, 50% payment released to guide",
		"booking": booking,
		"release": release,
	})
}

// ConfirmTripComplete - User ยืนยันทริปเสร็จ -> ไกด์ได้เงินเต็ม
func ConfirmTripComplete(c *fiber.Ctx) error {
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

	if booking.Status != "trip_started" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Trip must be started before completion",
		})
	}

	// Update booking status
	now := time.Now()
	booking.Status = "trip_completed"
	booking.TripCompletedAt = &now
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update booking",
		})
	}

	// Get payment for second release
	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ?", bookingID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Payment not found",
		})
	}

	// Release remaining 50% payment to guide
	release := models.PaymentRelease{
		TripPaymentID: payment.ID,
		ReleaseType:   "second_payment",
		Amount:        payment.SecondPayment,
		RecipientType: "guide",
		RecipientID:   booking.GuideID,
		Reason:        "trip_completed",
		ScheduledAt:   now,
		ProcessedAt:   &now,
		Status:        "processed",
	}
	
	if err := config.DB.Create(&release).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create payment release",
		})
	}

	// Update payment status
	payment.Status = "fully_released"
	payment.SecondReleasedAt = &now
	if err := config.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update payment status",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Trip completed, remaining 50% payment released to guide",
		"booking": booking,
		"release": release,
	})
}

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

// AdminResolveNoShowDispute - Admin ตัดสินกรณีมีการ dispute no-show report
func AdminResolveNoShowDispute(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil || bookingID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Booking ID must be a positive integer",
		})
	}

	var requestData struct {
		Decision    string `json:"decision"`    // "guide_wins", "user_wins", "split_cost"
		Reason      string `json:"reason"`
		AdminNotes  string `json:"admin_notes"`
	}

	if err := c.BodyParser(&requestData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid request data",
		})
	}

	// ตรวจสอบว่าเป็น admin หรือไม่
	userID := c.Locals("userID").(uint)
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get user info",
		})
	}

	// Get user role manually
	var role models.Role
	if err := config.DB.First(&role, user.RoleID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get user role",
		})
	}

	if role.Name != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "Only admin can resolve disputes",
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

	if booking.Status != "no_show_disputed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "No active dispute to resolve",
		})
	}

	// Get payment
	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ?", bookingID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Payment not found",
		})
	}

	now := time.Now()
	stripeService := services.NewStripeService()

	switch requestData.Decision {
	case "guide_wins":
		// ไกด์ได้ 50%, คืน user 50%
		return processNoShowPayment(c, &booking, &payment, stripeService, now, "admin_decision_guide_wins")

	case "user_wins":
		// คืนเงินให้ user 100%
		booking.Status = "cancelled"
		booking.CancelledAt = &now
		booking.CancellationReason = "admin_decision_user_wins"
		
		if err := config.DB.Save(&booking).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to update booking",
			})
		}

		// Refund 100% to user
		refundAmount := int64(payment.TotalAmount * 100) // Convert to cents
		stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, refundAmount, "admin_decision_user_wins")
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to process Stripe refund: " + err.Error(),
			})
		}

		userRefund := models.PaymentRelease{
			TripPaymentID:  payment.ID,
			ReleaseType:    "refund",
			Amount:         payment.TotalAmount,
			RecipientType:  "user",
			RecipientID:    booking.UserID,
			Reason:         "admin_decision_user_wins",
			ScheduledAt:    now,
			ProcessedAt:    &now,
			Status:         "processed",
			TransactionRef: stripeRefund.ID,
			Notes:          "Full refund by admin decision",
		}

		if err := config.DB.Create(&userRefund).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to create user refund record",
			})
		}

		payment.Status = "refunded"
		payment.RefundedAt = &now
		payment.RefundAmount = payment.TotalAmount
		payment.RefundReason = "admin_decision_user_wins"
		if err := config.DB.Save(&payment).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to update payment status",
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message":     "Admin decision: User wins. Full refund processed.",
			"booking":     booking,
			"user_refund": userRefund,
			"decision":    requestData.Decision,
		})

	case "split_cost":
		// แบ่งค่าเสียหาย - ไกด์ได้ 25%, คืน user 75%
		guideAmount := payment.TotalAmount * 0.25
		userRefundAmount := payment.TotalAmount * 0.75

		booking.Status = "no_show_split"
		booking.CancellationReason = "admin_decision_split_cost"
		if err := config.DB.Save(&booking).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to update booking",
			})
		}

		// Payment to guide (25%)
		guideRelease := models.PaymentRelease{
			TripPaymentID: payment.ID,
			ReleaseType:   "first_payment",
			Amount:        guideAmount,
			RecipientType: "guide",
			RecipientID:   booking.GuideID,
			Reason:        "admin_decision_split_cost",
			ScheduledAt:   now,
			ProcessedAt:   &now,
			Status:        "processed",
		}

		if err := config.DB.Create(&guideRelease).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to create guide payment release",
			})
		}

		// Refund to user (75%)
		refundAmount := int64(userRefundAmount * 100)
		stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, refundAmount, "admin_decision_split_cost")
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to process Stripe refund: " + err.Error(),
			})
		}

		userRefund := models.PaymentRelease{
			TripPaymentID:  payment.ID,
			ReleaseType:    "refund",
			Amount:         userRefundAmount,
			RecipientType:  "user",
			RecipientID:    booking.UserID,
			Reason:         "admin_decision_split_cost",
			ScheduledAt:    now,
			ProcessedAt:    &now,
			Status:         "processed",
			TransactionRef: stripeRefund.ID,
			Notes:          "75% refund by admin decision (split cost)",
		}

		if err := config.DB.Create(&userRefund).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to create user refund record",
			})
		}

		payment.Status = "partially_refunded"
		payment.RefundedAt = &now
		payment.RefundAmount = userRefundAmount
		payment.RefundReason = "admin_decision_split_cost"
		if err := config.DB.Save(&payment).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to update payment status",
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message":       "Admin decision: Split cost. Guide gets 25%, User gets 75% refund.",
			"booking":       booking,
			"guide_release": guideRelease,
			"user_refund":   userRefund,
			"decision":      requestData.Decision,
		})

	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid decision. Must be 'guide_wins', 'user_wins', or 'split_cost'",
		})
	}
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

// ConfirmTripPayment - ยืนยันการชำระเงินหลังจากที่ Stripe ชำระเงินสำเร็จ
func ConfirmTripPayment(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil || bookingID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Booking ID must be a positive integer",
		})
	}

	var requestData struct {
		PaymentIntentID string `json:"payment_intent_id"`
	}

	if err := c.BodyParser(&requestData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid request data",
		})
	}

	// ตรวจสอบสถานะการชำระเงินจาก Stripe
	stripeService := services.NewStripeService()
	paymentIntent, err := stripeService.ConfirmPayment(requestData.PaymentIntentID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Payment not completed: " + err.Error(),
		})
	}

	// อัปเดตสถานะ payment ในฐานข้อมูล
	var payment models.TripPayment
	if err := config.DB.Where("trip_booking_id = ? AND stripe_payment_intent_id = ?", bookingID, requestData.PaymentIntentID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Payment record not found",
		})
	}

	// อัปเดตสถานะ
	now := time.Now()
	payment.Status = "paid"
	payment.StripeStatus = string(paymentIntent.Status)
	payment.PaidAt = &now

	if err := config.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update payment status",
		})
	}

	// อัปเดตสถานะ booking
	var booking models.TripBooking
	if err := config.DB.First(&booking, bookingID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to get booking",
		})
	}

	booking.PaymentStatus = "paid"
	booking.Status = "paid"
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update booking status",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Payment confirmed successfully",
		"payment": payment,
		"booking": booking,
	})
}