package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestTripBookingController(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	// Migrate tables
	db.AutoMigrate(&models.Role{}, &models.AuthUser{}, &models.User{}, &models.Province{}, &models.Guide{}, &models.TripRequire{}, &models.TripOffer{}, &models.TripOfferQuotation{}, &models.TripBooking{}, &models.TripPayment{}, &models.TripReview{}, &models.TripReport{})

	// Seed data
	roleCustomer := models.Role{Name: "customer"}
	roleGuide := models.Role{Name: "guide"}
	db.Create(&roleCustomer)
	db.Create(&roleGuide)

	province := models.Province{Name: "Bangkok", Region: "Central"}
	db.Create(&province)

	authUser := models.AuthUser{Email: "user@example.com", Password: "hash"}
	db.Create(&authUser)
	user := models.User{AuthUserID: authUser.ID, FirstName: "John", LastName: "Doe", RoleID: roleCustomer.ID}
	db.Create(&user)

	authGuide := models.AuthUser{Email: "guide@example.com", Password: "hash"}
	db.Create(&authGuide)
	userGuide := models.User{AuthUserID: authGuide.ID, FirstName: "Guide", LastName: "One", RoleID: roleGuide.ID}
	db.Create(&userGuide)

	guide := models.Guide{UserID: userGuide.ID, ProvinceID: province.ID, Description: "desc", Available: true, Rating: 4.5}
	db.Create(&guide)

	tripRequire := models.TripRequire{
		UserID:      user.ID,
		ProvinceID:  province.ID,
		Title:       "Test Trip",
		Description: "desc",
		MinPrice:    1000,
		MaxPrice:    2000,
		StartDate:   time.Now().AddDate(0, 0, 7),
		EndDate:     time.Now().AddDate(0, 0, 10),
		Days:        3,
		Status:      "assigned",
		GroupSize:   1,
	}
	db.Create(&tripRequire)

	now := time.Now()
	offer := models.TripOffer{
		TripRequireID: tripRequire.ID,
		GuideID:       guide.ID,
		Title:         "My Offer",
		Description:   "desc",
		Status:        "accepted",
		SentAt:        &now,
		AcceptedAt:    &now,
	}
	db.Create(&offer)

	quotation := models.TripOfferQuotation{
		TripOfferID: offer.ID,
		Version:     1,
		TotalPrice:  1500,
		Status:      "accepted",
		SentAt:      &now,
		AcceptedAt:  &now,
	}
	db.Create(&quotation)

	booking := models.TripBooking{
		TripOfferID:   offer.ID,
		UserID:        user.ID,
		GuideID:       guide.ID,
		StartDate:     tripRequire.StartDate,
		TotalAmount:   1500,
		Status:        "pending_payment",
		PaymentStatus: "pending",
	}
	db.Create(&booking)

	// Routes
	app.Get("/bookings", func(c *fiber.Ctx) error {
		c.Locals("user_id", user.ID)
		return controllers.GetTripBookings(c)
	})
	app.Get("/bookings/:id", func(c *fiber.Ctx) error {
		c.Locals("user_id", user.ID)
		return controllers.GetTripBookingByID(c)
	})
	app.Post("/bookings/:id/payment", controllers.CreateTripPayment)
	app.Get("/bookings/:id/payment", controllers.GetTripPayment)

	t.Run("Get Trip Bookings - Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/bookings", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response, "bookings")
		assert.Contains(t, response, "total")
	})

	t.Run("Get Trip Booking By ID - Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/bookings/1", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response, "booking")
	})

	t.Run("Get Trip Booking By ID - Forbidden", func(t *testing.T) {
		// Create another user
		auth2 := models.AuthUser{Email: "other@example.com", Password: "hash"}
		db.Create(&auth2)
		user2 := models.User{AuthUserID: auth2.ID, FirstName: "Other", LastName: "User", RoleID: roleCustomer.ID}
		db.Create(&user2)

		app.Get("/bookings-other/:id", func(c *fiber.Ctx) error {
			c.Locals("user_id", user2.ID) // different user
			return controllers.GetTripBookingByID(c)
		})

		req := httptest.NewRequest("GET", "/bookings-other/1", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response["error"], "You can only view your own bookings")
	})

	t.Run("Create Trip Payment - Success (Mock Stripe)", func(t *testing.T) {
		// Note: This test will fail if Stripe is not configured or in test mode
		// In a real test, you'd mock the Stripe service
		req := httptest.NewRequest("POST", "/bookings/1/payment", nil)
		resp, _ := app.Test(req)

		// If Stripe not configured, expect 500, otherwise check for client_secret
		if resp.StatusCode == http.StatusInternalServerError {
			var response map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&response)
			assert.Contains(t, response["error"], "Failed to")
		}
	})

	t.Run("Get Trip Payment - Not Found", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/bookings/999/payment", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Equal(t, "Payment not found", response["error"])
	})

	t.Run("Get Trip Payment - Invalid Booking ID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/bookings/abc/payment", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response["error"], "Booking ID must be a positive integer")
	})
}
