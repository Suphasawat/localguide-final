package main

import (
	"log"
	"os"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/middleware"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	config.Init()
	config.DB.AutoMigrate(
		&models.AuthUser{}, &models.User{}, &models.Guide{},
		&models.Language{}, &models.Role{}, 
		&models.Review{}, &models.TouristAttraction{}, &models.Booking{},
		&models.Notification{},&models.Payment{},&models.Unavailable{},
		&models.GuidingTransaction{},&models.GuideCertification{},
		&models.GuideVertification{}, &models.ChatRoom{},
		&models.Message{},
	)	

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
	
	// Guide routes (บางตัวต้องล็อกอิน)
	api.Get("/guides", controllers.GetGuides)
	api.Get("/guides/:id", controllers.GetGuideByID)
	api.Post("/guides", middleware.AuthRequired(), controllers.CreateGuide) // ต้องล็อกอิน
	
	// User routes (ต้องเป็นเจ้าของข้อมูลหรือ admin)
	api.Get("/users/:id", middleware.AuthRequired(), middleware.OwnerOrAdminRequired(), controllers.GetUserByID)
	api.Put("/users/:id", middleware.AuthRequired(), middleware.OwnerOrAdminRequired(), controllers.EditUser)

	// Admin routes (ต้องเป็น admin เท่านั้น)
	admin := api.Group("/admin", middleware.AuthRequired(), middleware.AdminRequired())
	admin.Get("/guides", controllers.GetAllGuides)
	admin.Get("/verifications", controllers.GetPendingVerifications)
	admin.Put("/verifications/:id/status", controllers.ApproveGuide) // แก้ path ให้ถูกต้อง
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
