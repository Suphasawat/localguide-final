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
		Email         string  `json:"email"`
		Password      string  `json:"password"`
		FirstName     string  `json:"firstName"`
		LastName      string  `json:"lastName"`
		Nickname      string  `json:"nickname"`
		BirthDate     string  `json:"birthDate"`
		Nationality   string  `json:"nationality"`
		Phone         string  `json:"phone"`
		Sex           string  `json:"sex"`
		RoleId        uint    `json:"roleId"`
		// Guide specific fields
		Bio           string  `json:"bio"`
		Experience    string  `json:"experience"`
		Certification string  `json:"certification"`
		Availability  bool    `json:"availability"`
		Price         float64 `json:"price"`
		District      string  `json:"district"`
		City          string  `json:"city"`
		Province      string  `json:"province"`
		Languages     []uint  `json:"languages"`
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

	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid birth date format (use YYYY-MM-DD)"})
	}

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

	var createdGuide *models.Guide
	if req.RoleId == 2 {
		guide := models.Guide{
			UserID:        user.ID,
			Bio:           req.Bio,
			Experience:    req.Experience,
			Certification: req.Certification,
			Status:        "pending",
			Price:         req.Price,
			Availability:  req.Availability,
			District:      req.District,
			City:          req.City,
			Province:      req.Province,
		}

		if err := tx.Create(&guide).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create guide"})
		}

		if len(req.Languages) > 0 {
			var languages []models.Language
			if err := tx.Find(&languages, req.Languages).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch languages"})
			}
			if len(languages) != len(req.Languages) {
				tx.Rollback()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Some languages not found"})
			}
			if err := tx.Model(&guide).Association("Language").Replace(languages); err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to assign languages"})
			}
		}
		createdGuide = &guide
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
		"id":        user.ID,
		"email":     authUser.Email,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"nickname":  user.Nickname,
		"role":      user.RoleID,
	}

	if createdGuide != nil {
		config.DB.Preload("Language").First(createdGuide, createdGuide.ID)
		userResponse["guide"] = createdGuide
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"token": tokenString,
		"user":  userResponse,
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

	if user.RoleID == 2 {
		var guide models.Guide
		if err := config.DB.Where("user_id = ?", user.ID).First(&guide).Error; err != nil || guide.Status != "approved" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Guide not approved"})
		}
	}

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

// Email validation
func isValidEmail(email string) bool {
	regex := regexp.MustCompile(`^[a-zA-Z0-9._%%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return regex.MatchString(email)
}
