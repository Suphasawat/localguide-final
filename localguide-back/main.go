package main

import (
	"log"
	"os"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/middleware"
	"localguide-back/migrations"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	config.Init()
	
	config.DB.AutoMigrate(
		&models.AuthUser{}, &models.User{}, &models.Province{}, &models.Guide{},
		&models.Language{}, &models.Role{}, 
		&models.Review{}, &models.TouristAttraction{}, &models.Booking{},
		&models.Notification{}, &models.Unavailable{}, &models.Payment{},
		&models.GuidingTransaction{}, &models.GuideCertification{},
		&models.GuideVertification{}, 
		&models.PasswordReset{}, &models.TripRequest{},
		&models.TripProposal{}, &models.Negotiation{},
		&models.ChatMessage{}, &models.FinalQuotation{},
	)

	// Seed data
	migrations.SeedRoles(config.DB)
	migrations.SeedLanguages(config.DB)
	migrations.SeedProvinces(config.DB)
	migrations.SeedUsers(config.DB)                   
	migrations.SeedTouristAttractions(config.DB)
	migrations.SeedGuides(config.DB) // เรียกหลังสุดเพราะต้องมี User ก่อน

	app := fiber.New()
	
	// CORS configuration
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// API routes group
	api := app.Group("/api")
	
	// Auth routes (ไม่ต้องใช้ middleware)
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)
	api.Post("/auth/forgot-password", controllers.ForgotPassword)
	api.Post("/auth/reset-password", controllers.ResetPassword)
	
	// Guide routes (บางตัวต้องล็อกอิน)
	api.Get("/guides", controllers.GetGuides)
	api.Get("/guides/:id", controllers.GetGuideByID)
	api.Post("/guides", middleware.AuthRequired(), controllers.CreateGuide) // ต้องล็อกอิน
	
	// User routes (ต้องเป็นเจ้าของข้อมูลหรือ admin)
	api.Get("/users/:id", middleware.AuthRequired(), middleware.OwnerOrAdminRequired(), controllers.GetUserByID)
	api.Put("/users/:id", middleware.AuthRequired(), middleware.OwnerOrAdminRequired(), controllers.EditUser)
	api.Get("/me", middleware.AuthRequired(), controllers.Me)


	// Admin routes (ต้องเป็น admin เท่านั้น)
	admin := api.Group("/admin", middleware.AuthRequired(), middleware.AdminRequired())
	admin.Get("/guides", controllers.GetAllGuides)
	admin.Get("/verifications", controllers.GetPendingVerifications)
	admin.Put("/verifications/:id/status", controllers.ApproveGuide) 
	
	// Google Auth routes
	api.Get("/auth/google/login", controllers.GoogleLogin)
	api.Get("/auth/google/callback", controllers.GoogleCallback)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Fatal(app.Listen(":" + port))
}
