package main

import (
	"log"
	"os"

	"localguide-back/config"
	"localguide-back/controllers"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	config.Init()
	config.DB.AutoMigrate(
		&models.AuthUser{}, &models.User{}, &models.Guide{},
		&models.Language{}, &models.Role{}, &models.Permission{},
		&models.Review{}, &models.TouristAttraction{}, &models.Booking{},
		&models.Notification{},
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
	
	// Auth routes
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)
	// Guide routes
	api.Get("/guides", controllers.GetGuides)
	api.Get("/guides/:id", controllers.GetGuideByID)
	// User routes
	api.Get("/users/:id", controllers.GetUserByID)

	// Admin routes
	admin := api.Group("/admin")
	admin.Get("/guides", controllers.GetAllGuides)
	admin.Put("/guides/:id/status", controllers.UpdateGuideStatus)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
