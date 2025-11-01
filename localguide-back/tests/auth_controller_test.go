package tests

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/models"

	"github.com/stretchr/testify/assert"
)

func TestAuthController(t *testing.T) {
	app := setupTestApp()
	
	// Setup auth routes
	app.Post("/register", controllers.Register)
	app.Post("/login", controllers.Login)

	t.Run("Register Success", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		// migrate required tables
		testDB.AutoMigrate(&models.AuthUser{}, &models.User{})

		registerData := map[string]interface{}{
			"email":      "newuser@example.com",
			"password":   "password123",
			"first_name": "New",
			"last_name":  "User",
			"phone":      "0812345678",
		}

		body, _ := json.Marshal(registerData)
		req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		// Check response contains token and user
		b, _ := io.ReadAll(resp.Body)
		var out map[string]interface{}
		json.Unmarshal(b, &out)
		assert.NotEmpty(t, out["token"])
		assert.NotNil(t, out["user"])
	})

	t.Run("Register Invalid Email", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		// migrate required tables
		testDB.AutoMigrate(&models.AuthUser{}, &models.User{})

		registerData := map[string]interface{}{
			"email":      "invalid-email",
			"password":   "password123",
			"first_name": "Test",
			"last_name":  "User",
			"phone":      "0812345678",
		}

		body, _ := json.Marshal(registerData)
		req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Login Success", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		// migrate required tables
		testDB.AutoMigrate(&models.AuthUser{}, &models.User{})

		// First register a user via the API
		registerData := map[string]interface{}{
			"email":      "loginuser@example.com",
			"password":   "password123",
			"first_name": "Login",
			"last_name":  "User",
			"phone":      "0812345678",
		}
		breg, _ := json.Marshal(registerData)
		reqReg := httptest.NewRequest("POST", "/register", bytes.NewBuffer(breg))
		reqReg.Header.Set("Content-Type", "application/json")
		respReg, err := app.Test(reqReg)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, respReg.StatusCode)

		// Now login with same credentials
		loginData := map[string]interface{}{
			"email":    "loginuser@example.com",
			"password": "password123",
		}
		blogin, _ := json.Marshal(loginData)
		req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(blogin))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		b, _ := io.ReadAll(resp.Body)
		var out map[string]interface{}
		json.Unmarshal(b, &out)
		assert.NotEmpty(t, out["token"])
	})

	t.Run("Login Invalid Credentials", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		// migrate required tables
		testDB.AutoMigrate(&models.AuthUser{}, &models.User{})

		loginData := map[string]interface{}{
			"email":    "nonexistent@example.com",
			"password": "wrongpassword",
		}

		body, _ := json.Marshal(loginData)
		req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Missing Request Body", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB
		// migrate required tables
		testDB.AutoMigrate(&models.AuthUser{}, &models.User{})

		req := httptest.NewRequest("POST", "/register", nil)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}
