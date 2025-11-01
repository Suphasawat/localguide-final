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

	"github.com/stretchr/testify/assert"
)

func TestAdminController(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	// Migrate tables
	db.AutoMigrate(&models.Role{}, &models.AuthUser{}, &models.User{}, &models.Province{}, &models.Guide{}, &models.GuideVertification{}, &models.GuideCertification{}, &models.TripReport{}, &models.TripBooking{}, &models.TripPayment{}, &models.PaymentRelease{})

	// Seed data
	roleCustomer := models.Role{Name: "customer"}
	roleGuide := models.Role{Name: "guide"}
	db.Create(&roleCustomer)
	db.Create(&roleGuide)

	province := models.Province{Name: "Bangkok", Region: "Central"}
	db.Create(&province)

	authUser := models.AuthUser{Email: "pendingguide@example.com", Password: "hash"}
	db.Create(&authUser)
	user := models.User{AuthUserID: authUser.ID, FirstName: "Pending", LastName: "Guide", RoleID: roleCustomer.ID}
	db.Create(&user)

	// Routes
	app.Put("/admin/guides/:id/approve", controllers.ApproveGuide)
	app.Get("/admin/guides", controllers.GetAllGuides)
	app.Get("/admin/verifications", controllers.GetPendingVerifications)
	app.Get("/admin/reports", controllers.GetAllTripReports)
	app.Put("/admin/reports/:id", controllers.HandleTripReport)

	t.Run("Approve Guide - Success", func(t *testing.T) {
		// Create pending verification
		verification := models.GuideVertification{
			UserID:            user.ID,
			Status:            "pending",
			VerificationDate:  time.Now(),
			Bio:               "Test bio",
			Description:       "Test description",
			ProvinceID:        province.ID,
			CertificationData: "CERT123",
		}
		db.Create(&verification)

		payload := map[string]interface{}{
			"status": "approved",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("PUT", "/admin/guides/"+string(rune(verification.ID+48))+"/approve", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Equal(t, "Guide status updated successfully", response["message"])
		assert.Equal(t, "approved", response["status"])

		// Verify guide was created
		var guide models.Guide
		err = db.Where("user_id = ?", user.ID).First(&guide).Error
		assert.NoError(t, err)
		assert.Equal(t, user.ID, guide.UserID)

		// Verify user role changed to guide
		var updatedUser models.User
		db.First(&updatedUser, user.ID)
		assert.Equal(t, uint(2), updatedUser.RoleID)

		// Verify certification created
		var cert models.GuideCertification
		err = db.Where("guide_id = ?", guide.ID).First(&cert).Error
		assert.NoError(t, err)
		assert.Equal(t, "CERT123", cert.CertificationNumber)
	})

	t.Run("Approve Guide - Reject Status", func(t *testing.T) {
		// Create another pending verification
		auth2 := models.AuthUser{Email: "reject@example.com", Password: "hash"}
		db.Create(&auth2)
		user2 := models.User{AuthUserID: auth2.ID, FirstName: "Reject", LastName: "Test", RoleID: roleCustomer.ID}
		db.Create(&user2)

		verification := models.GuideVertification{
			UserID:           user2.ID,
			Status:           "pending",
			VerificationDate: time.Now(),
			Bio:              "Test",
			Description:      "Test",
			ProvinceID:       province.ID,
		}
		db.Create(&verification)

		payload := map[string]interface{}{
			"status": "rejected",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("PUT", "/admin/guides/"+string(rune(verification.ID+48))+"/approve", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		// Verify no guide was created
		var guide models.Guide
		err = db.Where("user_id = ?", user2.ID).First(&guide).Error
		assert.Error(t, err) // Should not exist
	})

	t.Run("Get All Guides - Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/guides", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response, "guides")
	})

	t.Run("Get Pending Verifications - Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/verifications", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response, "verifications")
	})

	t.Run("Get All Trip Reports - Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/admin/reports", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Contains(t, response, "reports")
	})

	t.Run("Handle Trip Report - Success", func(t *testing.T) {
		// Create test booking and report
		authGuide := models.AuthUser{Email: "guidereport@example.com", Password: "hash"}
		db.Create(&authGuide)
		guideUser := models.User{AuthUserID: authGuide.ID, FirstName: "Guide", LastName: "Report", RoleID: roleGuide.ID}
		db.Create(&guideUser)
		guide := models.Guide{UserID: guideUser.ID, ProvinceID: province.ID, Description: "desc", Available: true}
		db.Create(&guide)

		authCust := models.AuthUser{Email: "customer@example.com", Password: "hash"}
		db.Create(&authCust)
		customer := models.User{AuthUserID: authCust.ID, FirstName: "Cust", LastName: "Test", RoleID: roleCustomer.ID}
		db.Create(&customer)

		booking := models.TripBooking{
			UserID:      customer.ID,
			GuideID:     guide.ID,
			TotalAmount: 1000,
			Status:      "trip_completed",
		}
		db.Create(&booking)

		report := models.TripReport{
			TripBookingID:  booking.ID,
			ReporterID:     customer.ID,
			ReportedUserID: guideUser.ID,
			ReportType:     "inappropriate_behavior",
			Title:          "Issue",
			Description:    "Test issue",
			Status:         "pending",
		}
		db.Create(&report)

		payload := map[string]interface{}{
			"status":      "resolved",
			"admin_notes": "Issue resolved",
			"actions":     "Warned the guide",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("PUT", "/admin/reports/"+string(rune(report.ID+48)), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&response)
		assert.Equal(t, "Trip report updated successfully", response["message"])

		// Verify report status changed
		var updatedReport models.TripReport
		db.First(&updatedReport, report.ID)
		assert.Equal(t, "resolved", updatedReport.Status)
		assert.Equal(t, "Issue resolved", updatedReport.AdminNotes)
		assert.NotNil(t, updatedReport.ResolvedAt)
	})
}
