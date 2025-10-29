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
	userID := c.Locals("user_id").(uint)

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
	if user.Role.Name == "guide" || user.RoleID == 2 {
		// ถ้าเป็น guide ต้องหา guide_id ก่อน
		var guide models.Guide
		if err := config.DB.Where("user_id = ?", userID).First(&guide).Error; err != nil {
			// ถ้าไม่พบ guide record (ยังไม่ได้ลงทะเบียน) ให้ return empty
			return c.Status(fiber.StatusOK).JSON(fiber.Map{
				"bookings": []fiber.Map{},
				"total":   0,
				"message": "No guide profile found",
			})
		}
		// ใช้ guide.ID ในการกรอง
		query = query.Where("guide_id = ?", guide.ID)
	} else {
		// ถ้าเป็น user ให้ดู booking ที่ตัวเองเป็น user
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Order("created_at DESC").Find(&bookings).Error; err != nil {
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

		// Check if user has reviewed this booking
		hasReview := false
		if user.Role.Name != "guide" {
			var reviewCount int64
			config.DB.Model(&models.TripReview{}).Where("trip_booking_id = ? AND user_id = ?", booking.ID, userID).Count(&reviewCount)
			hasReview = reviewCount > 0
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
			"has_review":      hasReview,
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

	userID := c.Locals("user_id").(uint)

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
	isOwner := booking.UserID == userID
	isGuideOwner := false
	
	// ตรวจสอบว่าเป็นไกด์ของ booking หรือไม่ (ต้องตรวจสอบว่า Guide และ User ไม่เป็น nil)
	if booking.Guide.ID != 0 {
		// Load guide user if not loaded
		if booking.Guide.User.ID == 0 {
			config.DB.Preload("User").First(&booking.Guide, booking.GuideID)
		}
		if booking.Guide.User.ID == userID {
			isGuideOwner = true
		}
	}
	
	if !isOwner && !isGuideOwner {
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

	// Check if the current user has reviewed this booking
	hasReview := false
	if isOwner {
		var reviewCount int64
		config.DB.Model(&models.TripReview{}).Where("trip_booking_id = ? AND user_id = ?", booking.ID, userID).Count(&reviewCount)
		hasReview = reviewCount > 0
	}

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
		"has_review":      hasReview,

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