package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

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

	// สร้างการแจ้งเตือนให้กับ guide ว่าได้รับเงิน 50% แรก
	bookingIDPtr := booking.ID
	CreateNotification(
		booking.GuideID,
		"payment_released",
		"First Payment Released",
		"50% of payment has been released to you. Trip has started!",
		&bookingIDPtr,
		"trip_booking",
		map[string]interface{}{
			"booking_id":     booking.ID,
			"amount":         payment.FirstPayment,
			"release_type":   "first_payment",
		},
	)

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

	// สร้างการแจ้งเตือนให้กับ guide ว่าได้รับเงิน 50% ที่เหลือ
	bookingIDPtr := booking.ID
	CreateNotification(
		booking.GuideID,
		"payment_released",
		"Final Payment Released",
		"Remaining 50% of payment has been released to you. Trip completed!",
		&bookingIDPtr,
		"trip_booking",
		map[string]interface{}{
			"booking_id":     booking.ID,
			"amount":         payment.SecondPayment,
			"release_type":   "second_payment",
		},
	)

	// สร้างการแจ้งเตือนให้กับ user ว่าทริปเสร็จสมบูรณ์
	CreateNotification(
		booking.UserID,
		"trip_completed",
		"Trip Completed",
		"Your trip has been completed. Thank you for using our service!",
		&bookingIDPtr,
		"trip_booking",
		map[string]interface{}{
			"booking_id": booking.ID,
		},
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Trip completed, remaining 50% payment released to guide",
		"booking": booking,
		"release": release,
	})
}