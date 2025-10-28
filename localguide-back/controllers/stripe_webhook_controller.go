package controllers

import (
	"encoding/json"
	"fmt"
	"localguide-back/config"
	"localguide-back/models"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

// StripeWebhook - จัดการ Stripe webhooks
func StripeWebhook(c *fiber.Ctx) error {
	payload := c.Body()
	sig := c.Get("Stripe-Signature")
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

	// Verify webhook signature
	event, err := webhook.ConstructEvent(payload, sig, endpointSecret)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid signature",
		})
	}

	// Handle the event
	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse payment intent",
			})
		}
		
		// อัปเดตการชำระเงินในฐานข้อมูล
		if err := handlePaymentSuccess(&paymentIntent); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process payment success",
			})
		}

	case "payment_intent.payment_failed":
		var paymentIntent stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse payment intent",
			})
		}
		
		// จัดการเมื่อการชำระเงินล้มเหลว
		if err := handlePaymentFailed(&paymentIntent); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process payment failure",
			})
		}

	default:
		fmt.Printf("Unhandled event type: %s\n", event.Type)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"received": true,
	})
}

// handlePaymentSuccess - จัดการเมื่อการชำระเงินสำเร็จ
func handlePaymentSuccess(paymentIntent *stripe.PaymentIntent) error {
	// ค้นหา payment record จาก PaymentIntent ID
	var payment models.TripPayment
	if err := config.DB.Where("stripe_payment_intent_id = ?", paymentIntent.ID).First(&payment).Error; err != nil {
		return fmt.Errorf("payment record not found: %w", err)
	}

	// อัปเดตสถานะ payment
	now := time.Now()
	payment.Status = "paid"
	payment.StripeStatus = string(paymentIntent.Status)
	payment.PaidAt = &now

	if err := config.DB.Save(&payment).Error; err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	// อัปเดตสถานะ booking
	var booking models.TripBooking
	if err := config.DB.Preload("TripOffer.TripRequire").First(&booking, payment.TripBookingID).Error; err != nil {
		return fmt.Errorf("booking not found: %w", err)
	}

	booking.PaymentStatus = "paid"
	booking.Status = "paid"
	if err := config.DB.Save(&booking).Error; err != nil {
		return fmt.Errorf("failed to update booking: %w", err)
	}

	return nil
}

// handlePaymentFailed - จัดการเมื่อการชำระเงินล้มเหลว
func handlePaymentFailed(paymentIntent *stripe.PaymentIntent) error {
	// ค้นหา payment record
	var payment models.TripPayment
	if err := config.DB.Where("stripe_payment_intent_id = ?", paymentIntent.ID).First(&payment).Error; err != nil {
		return fmt.Errorf("payment record not found: %w", err)
	}

	// อัปเดตสถานะ payment
	payment.Status = "failed"
	payment.StripeStatus = string(paymentIntent.Status)
	payment.Notes = "Payment failed via Stripe webhook"

	if err := config.DB.Save(&payment).Error; err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	// อัปเดตสถานะ booking
	var booking models.TripBooking
	if err := config.DB.First(&booking, payment.TripBookingID).Error; err != nil {
		return fmt.Errorf("booking not found: %w", err)
	}

	booking.PaymentStatus = "failed"
	booking.Status = "pending_payment" // กลับไปเป็น pending payment
	if err := config.DB.Save(&booking).Error; err != nil {
		return fmt.Errorf("failed to update booking: %w", err)
	}

	return nil
}
