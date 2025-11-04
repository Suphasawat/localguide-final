package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestGuideRatingUpdatesOnReviewCRUD(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	// Routes
	app.Post("/reviews", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.CreateReview(c) })
	app.Put("/reviews/:id", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.UpdateReview(c) })
	app.Delete("/reviews/:id", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.DeleteReview(c) })

	// migrate
	db.AutoMigrate(&models.AuthUser{}, &models.User{}, &models.Guide{}, &models.Province{}, &models.TripRequire{}, &models.TripOffer{}, &models.TripBooking{}, &models.TripReview{})

	// Seed province, users, guide, booking
	p := models.Province{Name: "Bangkok", Region: "Central"}
	db.Create(&p)
	au := models.AuthUser{Email: "u@example.com", Password: "hash"}
	db.Create(&au)
	u := models.User{AuthUserID: au.ID, FirstName: "John", LastName: "Doe", RoleID: 1}
	db.Create(&u)
	aGuide := models.AuthUser{Email: "g@example.com", Password: "hash"}
	db.Create(&aGuide)
	ug := models.User{AuthUserID: aGuide.ID, FirstName: "Guide", LastName: "A", RoleID: 2}
	db.Create(&ug)
	guide := models.Guide{UserID: ug.ID, ProvinceID: p.ID, Description: "desc", Available: true, Rating: 0}
	db.Create(&guide)
	req := models.TripRequire{UserID: u.ID, ProvinceID: p.ID, Title: "Trip", Description: "", MinPrice: 100, MaxPrice: 200, Days: 1, StartDate: time.Now(), EndDate: time.Now(), Status: "open"}
	db.Create(&req)
	offer := models.TripOffer{TripRequireID: req.ID, GuideID: guide.ID, Title: "Offer", Description: "desc", Status: "accepted"}
	db.Create(&offer)
	booking := models.TripBooking{TripOfferID: offer.ID, UserID: u.ID, GuideID: guide.ID, StartDate: time.Now(), TotalAmount: 1000, Status: "trip_completed"}
	db.Create(&booking)

	// Create review rating=5 (user_id=1 must be booking.UserID, so ensure IDs align)
	// Ensure u.ID == 1
	if u.ID != 1 {
		t.Fatalf("expected test user id to be 1, got %d", u.ID)
	}
	payload := map[string]interface{}{
		"trip_booking_id": booking.ID,
		"rating": 5,
		"comment": "great",
		"service_rating": 5,
		"knowledge_rating": 5,
		"communication_rating": 5,
		"punctuality_rating": 5,
	}
	b, _ := json.Marshal(payload)
	reqHTTP := httptest.NewRequest("POST", "/reviews", bytes.NewBuffer(b))
	reqHTTP.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(reqHTTP)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	// Check guide rating == 5
	var g models.Guide
	db.First(&g, guide.ID)
	assert.InDelta(t, 5.0, g.Rating, 0.001)

	// Update review to 3
	var created struct{ Review struct{ ID uint `json:"ID"` } `json:"review"` }
	json.NewDecoder(resp.Body).Decode(&created)
	upd := map[string]interface{}{
		"rating": 3,
		"comment": "ok",
		"service_rating": 3,
		"knowledge_rating": 3,
		"communication_rating": 3,
		"punctuality_rating": 3,
	}
	ub, _ := json.Marshal(upd)
	reqUp := httptest.NewRequest("PUT", "/reviews/"+strconv.FormatUint(uint64(created.Review.ID), 10), bytes.NewBuffer(ub))
	reqUp.Header.Set("Content-Type", "application/json")
	respUp, err := app.Test(reqUp)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, respUp.StatusCode)

	// Check guide rating == 3
	db.First(&g, guide.ID)
	assert.InDelta(t, 3.0, g.Rating, 0.001)

	// Delete review -> rating back to 0
	reqDel := httptest.NewRequest("DELETE", "/reviews/"+strconv.FormatUint(uint64(created.Review.ID), 10), nil)
	respDel, err := app.Test(reqDel)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, respDel.StatusCode)
	db.First(&g, guide.ID)
	assert.InDelta(t, 0.0, g.Rating, 0.001)
}
