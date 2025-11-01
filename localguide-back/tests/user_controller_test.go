package tests

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestUserProfile_GetUpdateAvatarFlow(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	// Routes with user context
	app.Get("/me", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.GetUserProfile(c) })
	app.Put("/me", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.UpdateUserProfile(c) })
	app.Post("/me/avatar", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.UploadProfileAvatar(c) })
	app.Delete("/me/avatar", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.DeleteProfileAvatar(c) })

	// Migrate tables
	db.AutoMigrate(&models.Role{}, &models.AuthUser{}, &models.User{})

	// Seed role, user
	role := models.Role{Name: "customer"}
	db.Create(&role)
	auth := models.AuthUser{Email: "user@example.com", Password: "hash"}
	db.Create(&auth)
	user := models.User{AuthUserID: auth.ID, FirstName: "John", LastName: "Doe", RoleID: role.ID, Phone: "0800000000"}
	db.Create(&user)
	if user.ID != 1 {
		t.Fatalf("expected user id to be 1, got %d", user.ID)
	}

	// 1) Get profile
	req := httptest.NewRequest("GET", "/me", nil)
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	var getOut map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&getOut)
	assert.NotNil(t, getOut["user"])

	// 2) Update profile
	upd := map[string]interface{}{
		"first_name":   "Jane",
		"last_name":    "Smith",
		"nickname":     "JJ",
		"birth_date":   "1990-12-01",
		"phone":        "0899999999",
		"nationality":  "TH",
		"sex":          "female",
	}
	bupd, _ := json.Marshal(upd)
	reqUp := httptest.NewRequest("PUT", "/me", bytes.NewBuffer(bupd))
	reqUp.Header.Set("Content-Type", "application/json")
	respUp, err := app.Test(reqUp)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, respUp.StatusCode)
	var upOut map[string]interface{}
	json.NewDecoder(respUp.Body).Decode(&upOut)
	assert.Equal(t, "Profile updated successfully", upOut["message"])

	// Verify DB updated
	var u models.User
	db.First(&u, user.ID)
	assert.Equal(t, "Jane", u.FirstName)
	assert.Equal(t, "Smith", u.LastName)
	assert.Equal(t, "JJ", u.Nickname)
	assert.Equal(t, "0899999999", u.Phone)
	assert.Equal(t, "TH", u.Nationality)
	assert.Equal(t, "female", u.Sex)
	if u.BirthDate == nil || u.BirthDate.Format("2006-01-02") != "1990-12-01" {
		t.Fatalf("birth date not parsed correctly: %+v", u.BirthDate)
	}

	// 3) Upload avatar (valid image)
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	fw, _ := mw.CreateFormFile("avatar", "avatar.png")
	// minimal PNG header bytes + padding
	img := append([]byte{0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a}, bytes.Repeat([]byte{0x00}, 1024)...)
	fw.Write(img)
	mw.Close()
	reqUpA := httptest.NewRequest("POST", "/me/avatar", &body)
	reqUpA.Header.Set("Content-Type", mw.FormDataContentType())
	respA, err := app.Test(reqUpA)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, respA.StatusCode)
	var upA map[string]interface{}
	json.NewDecoder(respA.Body).Decode(&upA)
	avatarURL, _ := upA["avatar_url"].(string)
	assert.True(t, strings.HasPrefix(avatarURL, "/uploads/avatars/"))

	// Check DB and file exists
	db.First(&u, user.ID)
	assert.Equal(t, avatarURL, u.Avatar)
	filePath := "." + avatarURL
	if _, err := os.Stat(filePath); err != nil {
		t.Fatalf("expected avatar file to exist at %s: %v", filePath, err)
	}

	// 4) Delete avatar
	reqDel := httptest.NewRequest("DELETE", "/me/avatar", nil)
	respDel, err := app.Test(reqDel)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, respDel.StatusCode)
	// DB cleared
	db.First(&u, user.ID)
	assert.Equal(t, "", u.Avatar)
	// File removed (best-effort; allow not-exist)
	_, statErr := os.Stat(filePath)
	assert.True(t, os.IsNotExist(statErr))
}

func TestUserProfile_ErrorCases(t *testing.T) {
	// Setup DB and App
	db := setupTestDB()
	config.DB = db
	app := setupTestApp()

	app.Get("/me", func(c *fiber.Ctx) error { c.Locals("user_id", uint(999)); return controllers.GetUserProfile(c) })
	app.Post("/me/avatar", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return controllers.UploadProfileAvatar(c) })

	// Migrate and seed minimal
	db.AutoMigrate(&models.Role{}, &models.AuthUser{}, &models.User{})
	role := models.Role{Name: "customer"}
	db.Create(&role)
	auth := models.AuthUser{Email: "e@e.com", Password: "x"}
	db.Create(&auth)
	u := models.User{AuthUserID: auth.ID, FirstName: "A", LastName: "B", RoleID: role.ID}
	db.Create(&u)

	// 1) Get profile not found
	req := httptest.NewRequest("GET", "/me", nil)
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)

	// 2a) Upload avatar with wrong type
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	fw, _ := mw.CreateFormFile("avatar", "note.txt")
	fw.Write([]byte("this is not an image"))
	mw.Close()
	reqBad := httptest.NewRequest("POST", "/me/avatar", &body)
	reqBad.Header.Set("Content-Type", mw.FormDataContentType())
	respBad, err := app.Test(reqBad)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, respBad.StatusCode)

	// 2b) Upload avatar with missing file field
	reqNoFile := httptest.NewRequest("POST", "/me/avatar", strings.NewReader(""))
	reqNoFile.Header.Set("Content-Type", "multipart/form-data; boundary=----nope")
	respNoFile, err := app.Test(reqNoFile)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, respNoFile.StatusCode)
}

// Ensure uploaded files are cleaned up if any remain after tests
func TestCleanupUploadsDir(t *testing.T) {
	_ = os.RemoveAll(filepath.Clean("./uploads"))
	// Recreate to not affect other tests that might expect dir creation
	_ = os.MkdirAll("./uploads/avatars", 0755)
	_ = os.Chtimes("./uploads/avatars", time.Now(), time.Now())
}
