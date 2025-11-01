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

func TestBrowseTripRequires_FiltersByProvinceAndMinRating(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	// migrate needed tables
	db.AutoMigrate(&models.AuthUser{}, &models.User{}, &models.Guide{}, &models.Province{}, &models.TripRequire{}, &models.TripOffer{})

	// Create provinces
	p1 := models.Province{Name: "Bangkok", Region: "Central"}
	p2 := models.Province{Name: "Chiang Mai", Region: "Northern"}
	db.Create(&p1)
	db.Create(&p2)

	// Create a guide user and guide in p1 with rating 3.5
	auGuide := models.AuthUser{Email: "guide@example.com", Password: "hash"}
	db.Create(&auGuide)
	uGuide := models.User{AuthUserID: auGuide.ID, FirstName: "Guide", LastName: "One", RoleID: 2}
	db.Create(&uGuide)
	guide := models.Guide{UserID: uGuide.ID, ProvinceID: p1.ID, Description: "desc", Available: true, Rating: 3.5}
	db.Create(&guide)

	// Create a customer
	auCust := models.AuthUser{Email: "cust@example.com", Password: "hash"}
	db.Create(&auCust)
	uCust := models.User{AuthUserID: auCust.ID, FirstName: "Cust", LastName: "One", RoleID: 1}
	db.Create(&uCust)

	// Trip requires in both provinces (status open)
	trP1Low := models.TripRequire{UserID: uCust.ID, ProvinceID: p1.ID, Title: "P1 low", Description: "", MinPrice: 100, MaxPrice: 200, Days: 1, StartDate: NowUTC(), EndDate: NowUTC(), Status: "open", MinRating: 0}
	trP1High := models.TripRequire{UserID: uCust.ID, ProvinceID: p1.ID, Title: "P1 high", Description: "", MinPrice: 100, MaxPrice: 200, Days: 1, StartDate: NowUTC(), EndDate: NowUTC(), Status: "open", MinRating: 4.0}
	trP2Any := models.TripRequire{UserID: uCust.ID, ProvinceID: p2.ID, Title: "P2 any", Description: "", MinPrice: 100, MaxPrice: 200, Days: 1, StartDate: NowUTC(), EndDate: NowUTC(), Status: "open", MinRating: 0}
	db.Create(&trP1Low)
	db.Create(&trP1High)
	db.Create(&trP2Any)

	// Helper route wrapper to set guide user context
	app.Get("/browse/trip-requires", func(c *fiber.Ctx) error {
		c.Locals("user_id", uGuide.ID) // pass guide's user id
		return controllers.BrowseTripRequires(c)
	})

	// 1) Default (no province_id): should show only P1 and min_rating <= 3.5 => only trP1Low
	req := httptest.NewRequest("GET", "/browse/trip-requires", nil)
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	var out struct{ TripRequires []map[string]interface{} `json:"tripRequires"` }
	json.NewDecoder(resp.Body).Decode(&out)
	assert.Equal(t, 1, len(out.TripRequires))
	if len(out.TripRequires) == 1 {
		assert.Equal(t, "P1 low", out.TripRequires[0]["Title"])
	}

	// 2) With province_id of p2: can see other province but still min_rating enforced (0 here)
	req2 := httptest.NewRequest("GET", "/browse/trip-requires?province_id=2", nil)
	resp2, err := app.Test(req2)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp2.StatusCode)
	var out2 struct{ TripRequires []map[string]interface{} `json:"tripRequires"` }
	json.NewDecoder(resp2.Body).Decode(&out2)
	assert.Equal(t, 1, len(out2.TripRequires))
	if len(out2.TripRequires) == 1 {
		assert.Equal(t, "P2 any", out2.TripRequires[0]["Title"])
	}
}

// NowUTC returns a fixed valid time in UTC for testing
func NowUTC() time.Time { return time.Now().UTC() }
