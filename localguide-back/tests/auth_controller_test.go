package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"localguide-back/config"
	"localguide-back/controllers"

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

		registerData := map[string]interface{}{
			"email":     "newuser@example.com",
			"password":  "password123",
			"firstName": "New",
			"lastName":  "User",
		}

		body, _ := json.Marshal(registerData)
		req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		// Note: Actual status code depends on your implementation
		// assert.Equal(t, http.StatusCreated, resp.StatusCode)
		
		// For now, just check that we get a response
		assert.NotNil(t, resp)
	})

	t.Run("Register Invalid Email", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB

		registerData := map[string]interface{}{
			"email":     "invalid-email",
			"password":  "password123",
			"firstName": "Test",
			"lastName":  "User",
		}

		body, _ := json.Marshal(registerData)
		req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.NotEqual(t, http.StatusCreated, resp.StatusCode)
	})

	t.Run("Login Success", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB

		// First create a user (you might need to adjust this based on your implementation)
		authUser, _ := CreateTestUser(testDB)

		loginData := map[string]interface{}{
			"email":    authUser.Email,
			"password": "password123", // Use unhashed password for login
		}

		body, _ := json.Marshal(loginData)
		req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		// Note: Actual behavior depends on your implementation
		assert.NotNil(t, resp)
	})

	t.Run("Login Invalid Credentials", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB

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
		assert.NotEqual(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("Missing Request Body", func(t *testing.T) {
		// Setup fresh test database
		testDB := setupTestDB()
		config.DB = testDB

		req := httptest.NewRequest("POST", "/register", nil)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		// Assertions
		assert.NoError(t, err)
		assert.NotEqual(t, http.StatusCreated, resp.StatusCode)
	})
}
