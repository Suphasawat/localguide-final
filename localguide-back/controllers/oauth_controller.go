package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"localguide-back/config"
	"localguide-back/models"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func getGoogleOauthConfig() *oauth2.Config {
    return &oauth2.Config{
        RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
        Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
        Endpoint:     google.Endpoint,
    }
}

func GoogleLogin(c *fiber.Ctx) error {
    state := "randomstate" // ในการใช้งานจริงควรใช้ random string
    url := getGoogleOauthConfig().AuthCodeURL(state)
    return c.Redirect(url)
}

func GoogleCallback(c *fiber.Ctx) error {
    code := c.Query("code")
    if code == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No code provided"})
    }

    // แลกเปลี่ยน code เป็น token
    token, err := getGoogleOauthConfig().Exchange(context.Background(), code)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to exchange token"})
    }

    // ดึงข้อมูล user จาก Google API
    client := getGoogleOauthConfig().Client(context.Background(), token)
    resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get user info"})
    }
    defer resp.Body.Close()

    var googleUser struct {
        ID       string `json:"id"`
        Email    string `json:"email"`
        Name     string `json:"name"`
        Picture  string `json:"picture"`
        GivenName string `json:"given_name"`
        FamilyName string `json:"family_name"`
    }

    if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse user info"})
    }

    // ตรวจสอบว่า user มีอยู่แล้วหรือไม่
    var authUser models.AuthUser
    var user models.User
    
    tx := config.DB.Begin()
    defer tx.Rollback()

    if err := tx.Where("email = ?", googleUser.Email).First(&authUser).Error; err != nil {
        // สร้าง user ใหม่
        authUser = models.AuthUser{
            Email:    googleUser.Email,
            Password: "", // OAuth ไม่ต้องมีรหัสผ่าน
        }
        if err := tx.Create(&authUser).Error; err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create auth user"})
        }

        user = models.User{
            AuthUserID:  authUser.ID,
            FirstName:   googleUser.GivenName,
            LastName:    googleUser.FamilyName,
            RoleID:      1, // User role
            Avatar:      googleUser.Picture,
        }
        if err := tx.Create(&user).Error; err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
        }
    } else {
        // หา user ที่มีอยู่แล้ว
        if err := tx.Where("auth_user_id = ?", authUser.ID).First(&user).Error; err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "User not found"})
        }
    }

    if err := tx.Commit().Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to commit transaction"})
    }

    // สร้าง JWT token
    jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "role_id": user.RoleID,
        "exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
    })

    tokenString, err := jwtToken.SignedString(config.JWTSecret)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token creation failed"})
    }

    // Redirect กลับไป frontend พร้อม token
    frontendURL := fmt.Sprintf("http://localhost:3000/auth/callback?token=%s", tokenString)
    return c.Redirect(frontendURL)
}