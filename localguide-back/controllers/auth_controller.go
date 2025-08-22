package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"regexp"
	"time"
	"unicode/utf8"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if !isValidEmail(req.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid email format"})
	}
	
	if utf8.RuneCountInString(req.Password) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Password must be at least 8 characters"})
	}

	var existing models.AuthUser
	if err := config.DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email already exists"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Password hash failed"})
	}

	tx := config.DB.Begin()
	authUser := models.AuthUser{
		Email:    req.Email,
		Password: string(hashedPassword),
	}
	if err := tx.Create(&authUser).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create auth user"})
	}

	// สมัคร user อย่างเดียว (role = 1, ข้อมูลอื่นเป็นค่าว่างหรือ default)
	user := models.User{
		AuthUserID:  authUser.ID,
		FirstName:   "",
		LastName:    "",
		Nickname:    "",
		BirthDate:   nil,
		RoleID:      1,
		Nationality: "",
		Phone:       "",
		Sex:         "",
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Transaction failed"})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(config.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token creation failed"})
	}

	userResponse := fiber.Map{
		"id":    user.ID,
		"email": authUser.Email,
		"role":  user.RoleID,
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"token": tokenString,
		"user":  fiber.Map{
			"id":    userResponse["id"],
			"email": userResponse["email"],
			"role":  userResponse["role"],
		},
	})
}

func Login(c *fiber.Ctx) error {
	var req models.AuthUser
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var auth models.AuthUser
	if err := config.DB.Where("email = ?", req.Email).First(&auth).Error; err != nil ||
		bcrypt.CompareHashAndPassword([]byte(auth.Password), []byte(req.Password)) != nil {
		time.Sleep(500 * time.Millisecond)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	var user models.User
	if err := config.DB.Where("auth_user_id = ?", auth.ID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "User not found"})
	}

	// ไม่ต้องเช็ค guide อีกต่อไป
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(config.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token generation failed"})
	}

	return c.JSON(fiber.Map{
		"token": tokenString,
		"user": fiber.Map{
			"id":    user.ID,
			"email": auth.Email,
			"role":  user.RoleID,
		},
	})
}

func Me(c *fiber.Ctx) error {
    userID := c.Locals("userID") 
    if userID == nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
    }
    
    var user models.User
    if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
    }
    
    var authUser models.AuthUser
    if err := config.DB.Where("id = ?", user.AuthUserID).First(&authUser).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "AuthUser not found"})
    }
    
    return c.JSON(fiber.Map{
        "id":    user.ID,
        "email": authUser.Email,
        "role":  user.RoleID,
		"FirstName": user.FirstName,
		"LastName": user.LastName,
    })
}


// Email validation
func isValidEmail(email string) bool {
	regex := regexp.MustCompile(`^[a-zA-Z0-9._%%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return regex.MatchString(email)
}
