package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
) 

func Register(c *fiber.Ctx) error {
	var req struct {
		Email       string    `json:"email"`
		Password    string    `json:"password"`
		FirstName   string    `json:"firstName"`
		LastName    string    `json:"lastName"`
		Nickname    string    `json:"nickname"`
		BirthDate   string    `json:"birthDate"`
		Nationality string    `json:"nationality"`
		Phone       string    `json:"phone"`
		Sex         string    `json:"sex"`
		RoleId      uint      `json:"roleId"`
		// Guide fields
		Bio         string    `json:"bio"`
		Experience  string    `json:"experience"`
		Price       float64   `json:"price"`
		District    string    `json:"district"`
		City        string    `json:"city"`
		Province    string    `json:"province"`
		Languages   []uint    `json:"languages"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Check if email exists
	var existing models.AuthUser
	if err := config.DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email already exists"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Password hash failed"})
	}
	// Start transaction
	tx := config.DB.Begin()

	// Create auth user
	authUser := models.AuthUser{
		Email:    req.Email,
		Password: string(hashedPassword),
	}
	if err := tx.Create(&authUser).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create auth user"})
	}

	// Parse birth date
	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid birth date format"})
	}

	// Create user
	user := models.User{
		AuthUserID:  authUser.ID,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Nickname:    req.Nickname,
		BirthDate:   birthDate,
		RoleID:      req.RoleId,
		Nationality: req.Nationality,
		Phone:       req.Phone,
		Sex:         req.Sex,
	}
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	// If registering as guide (roleId = 2)
	if req.RoleId == 2 {
		guide := models.Guide{
			UserID:     user.ID,
			Bio:        req.Bio,
			Experience: req.Experience,
			Status:     "pending",
			Price:      req.Price,
			District:   req.District,
			City:       req.City,
			Province:   req.Province,
		}
		if err := tx.Create(&guide).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create guide"})
		}

		// Add languages if provided
		if len(req.Languages) > 0 {
			var languages []models.Language
			if err := tx.Find(&languages, req.Languages).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add languages"})
			}
			if err := tx.Model(&guide).Association("Language").Replace(languages); err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add languages"})
			}
		}

	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Transaction failed"})
	}

	// Generate token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})
	tokenString, err := token.SignedString(config.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token creation failed"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"token": tokenString,
		"user": fiber.Map{
			"id":    user.ID,
			"email": authUser.Email,
		},
	})
}

func Login(c *fiber.Ctx) error {
	var req models.AuthUser
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var user models.AuthUser
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil ||
		bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})
	tokenString, err := token.SignedString(config.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token generation failed"})
	}

	return c.JSON(fiber.Map{
		"token": tokenString,
		"user": fiber.Map{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}
