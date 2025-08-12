package services

import (
	"fmt"
	"localguide-back/models"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"github.com/stripe/stripe-go/v76/refund"
)

type StripeService struct{}

func NewStripeService() *StripeService {
	return &StripeService{}
}

// CreatePaymentIntent สร้าง PaymentIntent สำหรับการชำระเงิน
func (s *StripeService) CreatePaymentIntent(booking *models.TripBooking, userEmail string) (*stripe.PaymentIntent, error) {
	// แปลง amount เป็น cents (Stripe ใช้หน่วยย่อยสุด)
	amountInCents := int64(booking.TotalAmount * 100)
	
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(amountInCents),
		Currency: stripe.String("thb"), // Thai Baht
		Customer: stripe.String(userEmail),
		Metadata: map[string]string{
			"booking_id": fmt.Sprintf("%d", booking.ID),
			"guide_id":   fmt.Sprintf("%d", booking.GuideID),
			"user_id":    fmt.Sprintf("%d", booking.UserID),
		},
		Description: stripe.String(fmt.Sprintf("Payment for trip booking #%d", booking.ID)),
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment intent: %w", err)
	}

	return pi, nil
}

// ConfirmPayment ยืนยันการชำระเงิน
func (s *StripeService) ConfirmPayment(paymentIntentID string) (*stripe.PaymentIntent, error) {
	pi, err := paymentintent.Get(paymentIntentID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment intent: %w", err)
	}

	if pi.Status != stripe.PaymentIntentStatusSucceeded {
		return nil, fmt.Errorf("payment not completed, status: %s", pi.Status)
	}

	return pi, nil
}

// RefundPayment คืนเงิน
func (s *StripeService) RefundPayment(paymentIntentID string, amount int64, reason string) (*stripe.Refund, error) {
	params := &stripe.RefundParams{
		PaymentIntent: stripe.String(paymentIntentID),
		Amount:        stripe.Int64(amount),
		Reason:        stripe.String(reason),
	}

	refund, err := refund.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create refund: %w", err)
	}

	return refund, nil
}

// GetPaymentIntent ดึงข้อมูล PaymentIntent
func (s *StripeService) GetPaymentIntent(paymentIntentID string) (*stripe.PaymentIntent, error) {
	pi, err := paymentintent.Get(paymentIntentID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment intent: %w", err)
	}

	return pi, nil
}
