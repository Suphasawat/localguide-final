package tests

import (
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Common test utilities and helpers

// SetupTestDB creates an in-memory SQLite database for testing
func SetupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}

	// Auto migrate all models
	db.AutoMigrate(
		&models.Province{}, 
		&models.TouristAttraction{},
		&models.AuthUser{}, 
		&models.User{}, 
		&models.Guide{},
		&models.Language{}, 
		&models.Role{},
		&models.GuideCertification{}, 
		&models.GuideVertification{},
		&models.PasswordReset{},
		&models.TripRequire{}, 
		&models.TripOffer{}, 
		&models.TripBooking{},
		&models.TripPayment{}, 
		&models.TripReview{}, 
		&models.TripReport{},
		&models.GuidePerformance{}, 
		&models.TripNotification{}, 
		&models.PaymentRelease{},
	)

	return db
}

// SetupTestApp creates a new Fiber app for testing
func SetupTestApp() *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})
	return app
}

// SeedTestProvinces creates test provinces in the database
func SeedTestProvinces(db *gorm.DB) []models.Province {
	provinces := []models.Province{
		{Name: "Bangkok", Region: "Central"},
		{Name: "Chiang Mai", Region: "Northern"},
		{Name: "Phuket", Region: "Southern"},
		{Name: "Khon Kaen", Region: "Northeastern"},
		{Name: "Hat Yai", Region: "Southern"},
	}

	for i := range provinces {
		db.Create(&provinces[i])
	}

	return provinces
}

// SeedTestAttractions creates test tourist attractions for a province
func SeedTestAttractions(db *gorm.DB, provinceID uint) []models.TouristAttraction {
	attractions := []models.TouristAttraction{
		{Name: "Attraction 1", ProvinceID: provinceID},
		{Name: "Attraction 2", ProvinceID: provinceID},
		{Name: "Attraction 3", ProvinceID: provinceID},
	}

	for i := range attractions {
		db.Create(&attractions[i])
	}

	return attractions
}

// CreateTestUser creates a test user for authentication tests
func CreateTestUser(db *gorm.DB) (*models.AuthUser, *models.User) {
	authUser := &models.AuthUser{
		Email:    "test@example.com",
		Password: "hashedpassword123",
	}
	db.Create(authUser)

	user := &models.User{
		AuthUserID:  authUser.ID,
		FirstName:   "Test",
		LastName:    "User",
		Nickname:    "Tester",
		Nationality: "Thai",
		Phone:       "0123456789",
		Sex:         "M",
		RoleID:      1, // Regular user role
	}
	db.Create(user)

	return authUser, user
}

// CleanDatabase removes all data from test database
func CleanDatabase(db *gorm.DB) {
	// Order matters due to foreign key constraints
	db.Exec("DELETE FROM trip_notifications")
	db.Exec("DELETE FROM payment_releases")
	db.Exec("DELETE FROM guide_performances")
	db.Exec("DELETE FROM trip_reports")
	db.Exec("DELETE FROM trip_reviews")
	db.Exec("DELETE FROM trip_payments")
	db.Exec("DELETE FROM trip_bookings")
	db.Exec("DELETE FROM trip_offers")
	db.Exec("DELETE FROM trip_requires")
	db.Exec("DELETE FROM password_resets")
	db.Exec("DELETE FROM guide_certifications")
	db.Exec("DELETE FROM guide_tourist_attractions")
	db.Exec("DELETE FROM guide_languages")
	db.Exec("DELETE FROM guides")
	db.Exec("DELETE FROM tourist_attractions")
	db.Exec("DELETE FROM users")
	db.Exec("DELETE FROM auth_users")
	db.Exec("DELETE FROM provinces")
	db.Exec("DELETE FROM languages")
	db.Exec("DELETE FROM roles")
}
