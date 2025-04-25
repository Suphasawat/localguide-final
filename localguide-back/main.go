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
	app.Use(cors.New())

	app.Post("/register", controllers.Register)
	app.Post("/login", controllers.Login)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
