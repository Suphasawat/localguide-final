package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestTripRequireController(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	// Migrate tables
	db.AutoMigrate(&models.Role{}, &models.AuthUser{}, &models.User{}, &models.Province{}, &models.TripRequire{})

	// Seed data
	role := models.Role{Name: "customer"}
	db.Create(&role)
	auth := models.AuthUser{Email: "user@example.com", Password: "hash"}
	db.Create(&auth)
	user := models.User{AuthUserID: auth.ID, FirstName: "John", LastName: "Doe", RoleID: role.ID}
	db.Create(&user)
	province := models.Province{Name: "Bangkok", Region: "Central"}
	db.Create(&province)

	// Routes
	app.Post("/trip-requires", func(c *fiber.Ctx) error {
		c.Locals("user_id", user.ID)
		return controllers.CreateTripRequire(c)
	})
	app.Get("/trip-requires", func(c *fiber.Ctx) error {
		c.Locals("user_id", user.ID)
		return controllers.GetTripRequires(c)
	})
	app.Get("/trip-requires/:id", controllers.GetTripRequireByID)
	app.Delete("/trip-requires/:id", func(c *fiber.Ctx) error {
		c.Locals("user_id", user.ID)
		return controllers.DeleteTripRequire(c)
	})

	t.Run("Create Trip Require - Success", func(t *testing.T) {
		payload := map[string]interface{}{
			"province_id":  province.ID,
			"title":        "Trip to Bangkok",
			"description":  "Looking for a guide",
			"min_price":    1000.0,
			"max_price":    2000.0,
			"start_date":   "01/01/2026",
			"end_date":     "03/01/2026",
			"days":         3,
			"min_rating":   0.0,
			"group_size":   2,
			"requirements": "English speaking",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/trip-requires", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Equal(t, "Trip requirement created successfully", response["message"])
		assert.NotNil(t, response["tripRequire"])
	})

	t.Run("Create Trip Require - Invalid Price Range", func(t *testing.T) {
		payload := map[string]interface{}{
			"province_id": province.ID,
			"title":       "Invalid Trip",
			"description": "Test",
			"min_price":   2000.0,
			"max_price":   1000.0, // max < min
			"start_date":  "01/01/2026",
			"end_date":    "03/01/2026",
			"days":        3,
			"group_size":  1,
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/trip-requires", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response["error"], "Max price must be greater than or equal to min price")
	})

	t.Run("Create Trip Require - Invalid Date Format", func(t *testing.T) {
		payload := map[string]interface{}{
			"province_id": province.ID,
			"title":       "Invalid Date",
			"description": "Test",
			"min_price":   1000.0,
			"max_price":   2000.0,
			"start_date":  "2026-01-01", // wrong format
			"end_date":    "03/01/2026",
			"days":        3,
			"group_size":  1,
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/trip-requires", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response["error"], "Invalid start_date format")
	})

	t.Run("Get Trip Requires - Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/trip-requires", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response, "tripRequires")
	})

	t.Run("Get Trip Require By ID - Success", func(t *testing.T) {
		// Create a trip require first
		tr := models.TripRequire{
			UserID:      user.ID,
			ProvinceID:  province.ID,
			Title:       "Test Trip",
			Description: "Desc",
			MinPrice:    1000,
			MaxPrice:    2000,
			Days:        2,
			Status:      "open",
		}
		db.Create(&tr)

		req := httptest.NewRequest("GET", "/trip-requires/"+string(rune(tr.ID+48)), nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("Delete Trip Require - Success", func(t *testing.T) {
		// Create a trip require
		tr := models.TripRequire{
			UserID:      user.ID,
			ProvinceID:  province.ID,
			Title:       "Delete Test",
			Description: "Desc",
			MinPrice:    1000,
			MaxPrice:    2000,
			Days:        1,
			Status:      "open",
		}
		db.Create(&tr)

		req := httptest.NewRequest("DELETE", "/trip-requires/"+string(rune(tr.ID+48)), nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Equal(t, "Trip requirement deleted successfully", response["message"])
	})

	t.Run("Delete Trip Require - Cannot Delete Assigned", func(t *testing.T) {
		// Create a trip require with assigned status
		tr := models.TripRequire{
			UserID:      user.ID,
			ProvinceID:  province.ID,
			Title:       "Assigned Trip",
			Description: "Desc",
			MinPrice:    1000,
			MaxPrice:    2000,
			Days:        1,
			Status:      "assigned",
		}
		db.Create(&tr)

		req := httptest.NewRequest("DELETE", "/trip-requires/"+string(rune(tr.ID+48)), nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response["error"], "Cannot delete trip requirement with status")
	})
}
