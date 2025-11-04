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
	userID := c.Locals("user_id").(uint)
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

	// Ensure there is a pending TripReport for this booking
	var disputeReport models.TripReport
	err = config.DB.Where("trip_booking_id = ? AND report_type = ? AND status = ?", bookingID, "dispute_no_show", "pending").First(&disputeReport).Error
	if err != nil {
		var originalReport models.TripReport
		err2 := config.DB.Where("trip_booking_id = ? AND report_type = ? AND status = ?", bookingID, "user_no_show", "pending").First(&originalReport).Error
		if err2 != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "No active dispute to resolve",
				"status":  booking.Status,
			})
		}
	}

	// Validate decision
	if requestData.Decision != "guide_wins" && requestData.Decision != "user_wins" && requestData.Decision != "split_cost" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid decision. Must be 'guide_wins', 'user_wins', or 'split_cost'",
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

	// Helper: updates all related reports to resolved
	resolveReports := func(notes string) {
		config.DB.Model(&models.TripReport{}).
			Where("trip_booking_id = ? AND status = ?", bookingID, "pending").
			Updates(map[string]interface{}{
				"status":      "resolved",
				"resolved_at": &now,
				"admin_notes": notes,
			})
	}

	switch requestData.Decision {
	case "guide_wins":
		// 50/50 split
		// Check refundable amount for second payment before refunding
		remaining, err := stripeService.GetRefundableAmountCents(payment.StripePaymentIntentID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to check refundable amount: " + err.Error()})
		}
		amountToRefund := int64(payment.SecondPayment * 100)
		if remaining <= 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payment already fully refunded"})
		}
		if amountToRefund > remaining {
			amountToRefund = remaining
		}

		// Process 50% release + refund via helper (keeps logic consistent)
		if amountToRefund <= 0 {
			// If nothing left to refund, still release guide portion and mark reports
			err = config.DB.Transaction(func(tx *gorm.DB) error {
				booking.Status = "no_show_confirmed"
				booking.CancellationReason = "admin_decision_guide_wins"
				if err := tx.Save(&booking).Error; err != nil { return err }
				guideRelease := models.PaymentRelease{
					TripPaymentID: payment.ID,
					ReleaseType:   "first_payment",
					Amount:        payment.FirstPayment,
					RecipientType: "guide",
					RecipientID:   booking.GuideID,
					Reason:        "admin_decision_guide_wins",
					ScheduledAt:   now,
					ProcessedAt:   &now,
					Status:        "processed",
				}
				if err := tx.Create(&guideRelease).Error; err != nil { return err }
				payment.Status = "partially_refunded"
				payment.RefundedAt = &now
				if payment.RefundAmount == 0 { payment.RefundAmount = payment.SecondPayment }
				payment.RefundReason = "admin_decision_guide_wins"
				return tx.Save(&payment).Error
			})
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update records: " + err.Error()})
			}
			resolveReports(requestData.Reason)
			return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Guide wins processed without additional refund (already refunded)", "booking": booking})
		}

		// Normal path uses existing helper
		resp := processNoShowPayment(c, &booking, &payment, stripeService, now, "admin_decision_guide_wins")
		if resp != nil { return resp }
		resolveReports(requestData.Reason)
		return nil

	case "user_wins":
		// Full refund to user
		remaining, err := stripeService.GetRefundableAmountCents(payment.StripePaymentIntentID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to check refundable amount: " + err.Error()})
		}
		amountToRefund := int64(payment.TotalAmount * 100)
		if remaining <= 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payment already fully refunded"})
		}
		if amountToRefund > remaining { amountToRefund = remaining }

		booking.Status = "cancelled"
		booking.CancelledAt = &now
		booking.CancellationReason = "admin_decision_user_wins"
		if err := config.DB.Save(&booking).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update booking"})
		}

		stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, amountToRefund, "requested_by_customer")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to process Stripe refund: " + err.Error()})
		}

		userRefund := models.PaymentRelease{
			TripPaymentID:  payment.ID,
			ReleaseType:    "refund",
			Amount:         float64(amountToRefund) / 100.0,
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
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user refund record"})
		}

		payment.Status = "refunded"
		payment.RefundedAt = &now
		payment.RefundAmount = float64(amountToRefund) / 100.0
		payment.RefundReason = "admin_decision_user_wins"
		if err := config.DB.Save(&payment).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update payment status"})
		}

		resolveReports(requestData.Reason)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Admin decision: User wins. Refund processed.", "booking": booking, "user_refund": userRefund, "decision": requestData.Decision})

	case "split_cost":
		remaining, err := stripeService.GetRefundableAmountCents(payment.StripePaymentIntentID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to check refundable amount: " + err.Error()})
		}
		guideAmount := payment.TotalAmount * 0.25
		userRefundAmount := payment.TotalAmount * 0.75
		amountToRefund := int64(userRefundAmount * 100)
		if remaining <= 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payment already fully refunded"})
		}
		if amountToRefund > remaining { amountToRefund = remaining }

		booking.Status = "no_show_split"
		booking.CancellationReason = "admin_decision_split_cost"
		if err := config.DB.Save(&booking).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update booking"})
		}

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
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create guide payment release"})
		}

		stripeRefund, err := stripeService.RefundPayment(payment.StripePaymentIntentID, amountToRefund, "requested_by_customer")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to process Stripe refund: " + err.Error()})
		}

		userRefund := models.PaymentRelease{
			TripPaymentID:  payment.ID,
			ReleaseType:    "refund",
			Amount:         float64(amountToRefund) / 100.0,
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
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user refund record"})
		}

		payment.Status = "partially_refunded"
		payment.RefundedAt = &now
		payment.RefundAmount = float64(amountToRefund) / 100.0
		payment.RefundReason = "admin_decision_split_cost"
		if err := config.DB.Save(&payment).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update payment status"})
		}

		resolveReports(requestData.Reason)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Admin decision: Split cost processed.", "booking": booking, "guide_release": guideRelease, "user_refund": userRefund, "decision": requestData.Decision})
	}

	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid decision. Must be 'guide_wins', 'user_wins', or 'split_cost'"})
}