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