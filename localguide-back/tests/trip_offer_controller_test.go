package tests

import (
	"bytes"
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

func TestTripOfferController(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	// Migrate tables
	db.AutoMigrate(&models.Role{}, &models.AuthUser{}, &models.User{}, &models.Province{}, &models.Guide{}, &models.TripRequire{}, &models.TripOffer{}, &models.TripOfferQuotation{}, &models.TripBooking{})

	// Seed data
	roleCustomer := models.Role{Name: "customer"}
	roleGuide := models.Role{Name: "guide"}
	db.Create(&roleCustomer)
	db.Create(&roleGuide)

	authUser := models.AuthUser{Email: "user@example.com", Password: "hash"}
	db.Create(&authUser)
	user := models.User{AuthUserID: authUser.ID, FirstName: "John", LastName: "Doe", RoleID: roleCustomer.ID}
	db.Create(&user)

	authGuide := models.AuthUser{Email: "guide@example.com", Password: "hash"}
	db.Create(&authGuide)
	userGuide := models.User{AuthUserID: authGuide.ID, FirstName: "Guide", LastName: "One", RoleID: roleGuide.ID}
	db.Create(&userGuide)

	province := models.Province{Name: "Bangkok", Region: "Central"}
	db.Create(&province)

	guide := models.Guide{UserID: userGuide.ID, ProvinceID: province.ID, Description: "Experienced guide", Available: true, Rating: 4.5}
	db.Create(&guide)

	tripRequire := models.TripRequire{
		UserID:      user.ID,
		ProvinceID:  province.ID,
		Title:       "Need a guide",
		Description: "Looking for guide",
		MinPrice:    1000,
		MaxPrice:    3000,
		StartDate:   time.Now().AddDate(0, 0, 7),
		EndDate:     time.Now().AddDate(0, 0, 10),
		Days:        3,
		Status:      "open",
		GroupSize:   2,
	}
	db.Create(&tripRequire)

	// Routes
	app.Post("/trip-offers", func(c *fiber.Ctx) error {
		c.Locals("user_id", userGuide.ID)
		return controllers.CreateTripOffer(c)
	})
	app.Get("/trip-requires/:id/offers", controllers.GetTripOffers)
	app.Get("/trip-offers/:id", controllers.GetTripOfferByID)
	app.Put("/trip-offers/:id/accept", func(c *fiber.Ctx) error {
		c.Locals("user_id", user.ID)
		return controllers.AcceptTripOffer(c)
	})
	app.Put("/trip-offers/:id/reject", func(c *fiber.Ctx) error {
		c.Locals("user_id", user.ID)
		return controllers.RejectTripOffer(c)
	})

	t.Run("Create Trip Offer - Success", func(t *testing.T) {
		payload := map[string]interface{}{
			"trip_require_id":    tripRequire.ID,
			"title":              "My Offer",
			"description":        "I can guide you",
			"itinerary":          "Day 1: Temple, Day 2: Market",
			"included_services":  "Transportation, Lunch",
			"excluded_services":  "Accommodation",
			"total_price":        2000.0,
			"price_breakdown":    "Guide fee: 1500, Transport: 500",
			"offer_notes":        "Looking forward",
			"valid_days":         7,
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/trip-offers", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Equal(t, "Offer created successfully", response["message"])
		assert.NotNil(t, response["offer"])
		assert.NotNil(t, response["quotation"])
	})

	t.Run("Create Trip Offer - Price Out of Range", func(t *testing.T) {
		// Create separate trip require for this test
		tr2 := models.TripRequire{
			UserID:      user.ID,
			ProvinceID:  province.ID,
			Title:       "Price Test",
			Description: "test",
			MinPrice:    1000,
			MaxPrice:    2000,
			StartDate:   time.Now().AddDate(0, 0, 7),
			EndDate:     time.Now().AddDate(0, 0, 10),
			Days:        3,
			Status:      "open",
			GroupSize:   1,
		}
		db.Create(&tr2)

		payload := map[string]interface{}{
			"trip_require_id": tr2.ID,
			"title":           "Expensive Offer",
			"description":     "Too expensive",
			"total_price":     5000.0, // exceeds max_price
			"valid_days":      7,
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/trip-offers", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response["error"], "Price is outside the requested range")
	})

	t.Run("Get Trip Offers - Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/trip-requires/1/offers", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response, "offers")
	})

	t.Run("Accept Trip Offer - Success", func(t *testing.T) {
		// Create a new trip require and offer for this test
		tr := models.TripRequire{
			UserID:      user.ID,
			ProvinceID:  province.ID,
			Title:       "Accept Test",
			Description: "Test",
			MinPrice:    1000,
			MaxPrice:    2000,
			StartDate:   time.Now().AddDate(0, 0, 7),
			EndDate:     time.Now().AddDate(0, 0, 10),
			Days:        3,
			Status:      "open",
			GroupSize:   1,
		}
		db.Create(&tr)

		now := time.Now()
		offer := models.TripOffer{
			TripRequireID: tr.ID,
			GuideID:       guide.ID,
			Title:         "Test Offer",
			Description:   "desc",
			Status:        "sent",
			SentAt:        &now,
		}
		db.Create(&offer)

		quotation := models.TripOfferQuotation{
			TripOfferID: offer.ID,
			Version:     1,
			TotalPrice:  1500,
			Status:      "sent",
			SentAt:      &now,
		}
		db.Create(&quotation)

		req := httptest.NewRequest("PUT", "/trip-offers/"+string(rune(offer.ID+48))+"/accept", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Equal(t, "Offer accepted successfully", response["message"])
		assert.NotNil(t, response["booking"])

		// Check trip require status changed to "assigned"
		var updatedTR models.TripRequire
		db.First(&updatedTR, tr.ID)
		assert.Equal(t, "assigned", updatedTR.Status)
	})

	t.Run("Reject Trip Offer - Success", func(t *testing.T) {
		// Create a new trip require and offer for this test
		tr := models.TripRequire{
			UserID:      user.ID,
			ProvinceID:  province.ID,
			Title:       "Reject Test",
			Description: "Test",
			MinPrice:    1000,
			MaxPrice:    2000,
			StartDate:   time.Now().AddDate(0, 0, 7),
			EndDate:     time.Now().AddDate(0, 0, 10),
			Days:        3,
			Status:      "open",
			GroupSize:   1,
		}
		db.Create(&tr)

		now := time.Now()
		offer := models.TripOffer{
			TripRequireID: tr.ID,
			GuideID:       guide.ID,
			Title:         "Test Offer to Reject",
			Description:   "desc",
			Status:        "sent",
			SentAt:        &now,
		}
		db.Create(&offer)

		// Create quotation for this offer
		quotation := models.TripOfferQuotation{
			TripOfferID: offer.ID,
			Version:     1,
			TotalPrice:  1500,
			Status:      "sent",
			SentAt:      &now,
		}
		db.Create(&quotation)

		payload := map[string]interface{}{
			"reason": "Not suitable",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("PUT", "/trip-offers/"+string(rune(offer.ID+48))+"/reject", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		// Check offer status changed to "rejected"
		var updatedOffer models.TripOffer
		db.First(&updatedOffer, offer.ID)
		assert.Equal(t, "rejected", updatedOffer.Status)
	})
}
