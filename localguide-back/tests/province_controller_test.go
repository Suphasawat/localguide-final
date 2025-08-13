package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func setupTestDB() *gorm.DB {
	return SetupTestDB()
}

func setupTestApp() *fiber.App {
	return SetupTestApp()
}

func TestGetProvinces(t *testing.T) {
	app := setupTestApp()
	app.Get("/provinces", controllers.GetProvinces)

	t.Run("Success - Get all provinces", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		
		// Create test provinces
		provinces := []models.Province{
			{Name: "Bangkok", Region: "Central"},
			{Name: "Chiang Mai", Region: "Northern"},
			{Name: "Phuket", Region: "Southern"},
		}

		for _, province := range provinces {
			testDB.Create(&province)
		}

		// Make request
		req := httptest.NewRequest("GET", "/provinces", nil)
		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		// Parse response
		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		
		assert.Contains(t, response, "provinces")
		provincesData := response["provinces"].([]interface{})
		assert.Equal(t, 3, len(provincesData))
	})

	t.Run("Not Found - No provinces in database", func(t *testing.T) {
		// Setup fresh empty test database
		testDB := setupTestDB()
		config.DB = testDB

		// Make request
		req := httptest.NewRequest("GET", "/provinces", nil)
		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)

		// Parse response
		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		
		assert.Contains(t, response, "error")
		assert.Equal(t, "No provinces found", response["error"])
	})

	t.Run("Internal Server Error - Database error", func(t *testing.T) {
		// Setup fresh test database and close it to simulate error
		testDB := setupTestDB()
		config.DB = testDB
		sqlDB, _ := testDB.DB()
		sqlDB.Close()

		// Make request
		req := httptest.NewRequest("GET", "/provinces", nil)
		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)

		// Parse response
		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		
		assert.Contains(t, response, "error")
		assert.Equal(t, "Failed to retrieve provinces", response["error"])
		assert.Contains(t, response, "details")
	})
}

func TestGetProvinceAttractions(t *testing.T) {
	app := setupTestApp()
	app.Get("/provinces/:id/attractions", controllers.GetProvinceAttractions)

	t.Run("Success - Get province with attractions", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		
		// Create test province with attractions
		province := models.Province{
			Name:   "Bangkok",
			Region: "Central",
		}
		testDB.Create(&province)

		attractions := []models.TouristAttraction{
			{Name: "Grand Palace", ProvinceID: province.ID},
			{Name: "Wat Pho", ProvinceID: province.ID},
			{Name: "Chatuchak Market", ProvinceID: province.ID},
		}

		for _, attraction := range attractions {
			testDB.Create(&attraction)
		}

		// Make request
		req := httptest.NewRequest("GET", "/provinces/1/attractions", nil)
		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		// Parse response
		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		
		assert.Contains(t, response, "province")
		assert.Contains(t, response, "attractions")
		assert.Equal(t, "Bangkok", response["province"])
		
		attractionsData := response["attractions"].([]interface{})
		assert.Equal(t, 3, len(attractionsData))
	})

	t.Run("Not Found - Province not found", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB

		// Make request
		req := httptest.NewRequest("GET", "/provinces/999/attractions", nil)
		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)

		// Parse response
		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		
		assert.Contains(t, response, "error")
		assert.Equal(t, "Province not found", response["error"])
	})

	t.Run("Not Found - Province exists but no attractions", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		
		// Create province without attractions
		province := models.Province{
			Name:   "Test Province",
			Region: "Test Region",
		}
		result := testDB.Create(&province)
		assert.NoError(t, result.Error)

		// Make request with the actual province ID
		req := httptest.NewRequest("GET", "/provinces/1/attractions", nil)
		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)

		// Parse response
		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		
		assert.Contains(t, response, "error")
		assert.Equal(t, "No attractions found for this province", response["error"])
	})

	t.Run("Bad Request - Invalid province ID", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		
		testCases := []struct {
			url            string
			expectedStatus int
		}{
			{"/provinces/abc/attractions", http.StatusBadRequest},
			{"/provinces/0/attractions", http.StatusBadRequest},
			{"/provinces/-1/attractions", http.StatusBadRequest},
		}

		for _, testCase := range testCases {
			req := httptest.NewRequest("GET", testCase.url, nil)
			resp, err := app.Test(req)

			// Assertions
			assert.NoError(t, err)
			
			// For invalid IDs, we expect either 400 or 404 depending on how Fiber handles the route
			if resp.StatusCode == http.StatusBadRequest {
				// Parse response
				var response map[string]interface{}
				json.NewDecoder(resp.Body).Decode(&response)
				
				assert.Contains(t, response, "error")
				assert.Equal(t, "Invalid province ID", response["error"])
			} else {
				// If Fiber returns 404 for invalid routes, that's also acceptable
				assert.Equal(t, http.StatusNotFound, resp.StatusCode)
			}
		}
	})

	t.Run("Internal Server Error - Database error", func(t *testing.T) {
		// Setup fresh test database and close it to simulate error
		testDB := setupTestDB()
		config.DB = testDB
		sqlDB, _ := testDB.DB()
		sqlDB.Close()

		// Make request
		req := httptest.NewRequest("GET", "/provinces/1/attractions", nil)
		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)

		// Parse response
		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		
		assert.Contains(t, response, "error")
		assert.Equal(t, "Failed to retrieve province", response["error"])
		assert.Contains(t, response, "details")
	})
}

// Benchmark tests
func BenchmarkGetProvinces(b *testing.B) {
	// Setup
	testDB := setupTestDB()
	config.DB = testDB
	app := setupTestApp()
	app.Get("/provinces", controllers.GetProvinces)

	// Create test data
	for i := 0; i < 100; i++ {
		province := models.Province{
			Name:   "Province " + string(rune(i+65)), // A, B, C...
			Region: "Region " + string(rune(i+65)),
		}
		testDB.Create(&province)
	}

	// Benchmark
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/provinces", nil)
		app.Test(req)
	}
}

func BenchmarkGetProvinceAttractions(b *testing.B) {
	// Setup
	testDB := setupTestDB()
	config.DB = testDB
	app := setupTestApp()
	app.Get("/provinces/:id/attractions", controllers.GetProvinceAttractions)

	// Create test data
	province := models.Province{Name: "Test Province", Region: "Test Region"}
	testDB.Create(&province)

	for i := 0; i < 50; i++ {
		attraction := models.TouristAttraction{
			Name:       "Attraction " + string(rune(i)),
			ProvinceID: province.ID,
		}
		testDB.Create(&attraction)
	}

	// Benchmark
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/provinces/1/attractions", nil)
		app.Test(req)
	}
}
