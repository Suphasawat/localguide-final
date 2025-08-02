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
		&models.AuthUser{}, 
        &models.User{}, 
        &models.Province{}, 
        &models.Guide{},
		&models.Language{}, 
        &models.Role{}, 
        &models.TouristAttraction{},
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

	// Seed data
	migrations.SeedRoles(config.DB)
	migrations.SeedLanguages(config.DB)
	migrations.SeedProvinces(config.DB)
	migrations.SeedTouristAttractions(config.DB)
	migrations.SeedUsers(config.DB)                   
	migrations.SeedGuides(config.DB)

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
    api.Post("/auth/forgot-password", controllers.ForgotPassword)
    api.Post("/auth/reset-password", controllers.ResetPassword)
    
    // Public routes
    api.Get("/provinces", controllers.GetProvinces)
    api.Get("/provinces/:id/attractions", controllers.GetProvinceAttractions)
    api.Get("/guides", controllers.GetGuides)
    api.Get("/guides/:id", controllers.GetGuideByID)
    
    // === TRIP SYSTEM ROUTES ===
    
    // 1. TripRequire routes (User โพสต์ความต้องการ)
    api.Post("/trip-requires", middleware.AuthRequired(), controllers.CreateTripRequire)
    api.Get("/trip-requires", middleware.AuthRequired(), controllers.GetTripRequires) // ดู requires ของตัวเอง
    api.Get("/trip-requires/:id", middleware.AuthRequired(), controllers.GetTripRequiresByTripID)
    api.Put("/trip-requires/:id", middleware.AuthRequired(), controllers.UpdateTripRequire)
    api.Delete("/trip-requires/:id", middleware.AuthRequired(), controllers.DeleteTripRequire)
    
    // Browse trip requires (สำหรับ Guide ดู)
    api.Get("/browse/trip-requires", middleware.AuthRequired(), controllers.BrowseTripRequires)
    
    // 2. TripOffer routes (Guide เสนอรายละเอียด)
    api.Post("/trip-offers", middleware.AuthRequired(), controllers.CreateTripOffer)
    api.Get("/trip-requires/:id/offers", middleware.AuthRequired(), controllers.GetTripOffers) // ดู offers ของ require นี้
    api.Get("/trip-offers/:id", middleware.AuthRequired(), controllers.GetTripOfferByID)
    api.Put("/trip-offers/:id", middleware.AuthRequired(), controllers.UpdateTripOffer) // สำหรับแก้ไข/เจรจา
    api.Delete("/trip-offers/:id", middleware.AuthRequired(), controllers.WithdrawTripOffer)
    
    // 3. Accept/Reject offers (User เลือก offer)
    api.Put("/trip-offers/:id/accept", middleware.AuthRequired(), controllers.AcceptTripOffer)
    api.Put("/trip-offers/:id/reject", middleware.AuthRequired(), controllers.RejectTripOffer)
    
    // 4. TripBooking routes (หลัง accept offer)
    api.Get("/trip-bookings", middleware.AuthRequired(), controllers.GetTripBookings)
    api.Get("/trip-bookings/:id", middleware.AuthRequired(), controllers.GetTripBooking)
    api.Put("/trip-bookings/:id/cancel", middleware.AuthRequired(), controllers.CancelTripBooking)
    
    // // 5. Payment routes
    // api.Post("/trip-bookings/:id/payment", middleware.AuthRequired(), controllers.CreateTripPayment)
    // api.Get("/trip-payments/:id", middleware.AuthRequired(), controllers.GetTripPayment)
    
    // // 6. Trip status management
    // api.Put("/trip-bookings/:id/confirm-start", middleware.AuthRequired(), controllers.ConfirmTripStart) // User ยืนยันไกด์มา
    // api.Put("/trip-bookings/:id/confirm-complete", middleware.AuthRequired(), controllers.ConfirmTripComplete) // User ยืนยันเสร็จ
    // api.Put("/trip-bookings/:id/no-show", middleware.AuthRequired(), controllers.ReportNoShow) // รีพอร์ต user ไม่มา
    
    // // 7. Review system
    // api.Post("/trip-bookings/:id/review", middleware.AuthRequired(), controllers.CreateTripReview)
    // api.Get("/trip-reviews/:id", middleware.AuthRequired(), controllers.GetTripReview)
    // api.Put("/trip-reviews/:id/respond", middleware.AuthRequired(), controllers.RespondToReview) // Guide ตอบ review
    
    // // 8. Report system
    // api.Post("/trip-reports", middleware.AuthRequired(), controllers.CreateTripReport)
    // api.Get("/trip-reports", middleware.AuthRequired(), controllers.GetTripReports)
    
    // // 9. Notification system
    // api.Get("/notifications", middleware.AuthRequired(), controllers.GetNotifications)
    // api.Put("/notifications/:id/read", middleware.AuthRequired(), controllers.MarkNotificationRead)

    // User profile routes
    api.Post("/guides", middleware.AuthRequired(), controllers.CreateGuide)
    api.Get("/users/:id", middleware.AuthRequired(), middleware.OwnerOrAdminRequired(), controllers.GetUserByID)
    api.Put("/users/:id", middleware.AuthRequired(), middleware.OwnerOrAdminRequired(), controllers.EditUser)
    api.Get("/me", middleware.AuthRequired(), controllers.Me)

    // Admin routes
    admin := api.Group("/admin", middleware.AuthRequired(), middleware.AdminRequired())
    admin.Get("/guides", controllers.GetAllGuides)
    admin.Get("/verifications", controllers.GetPendingVerifications)
    admin.Put("/verifications/:id/status", controllers.ApproveGuide)
    // admin.Get("/trip-reports", controllers.GetAllTripReports)
    // admin.Put("/trip-reports/:id", controllers.HandleTripReport)
    // admin.Get("/payments", controllers.GetAllPayments)
    // admin.Put("/payments/:id/release", controllers.ManualReleasePayment)
    
    
    // Google Auth routes
    api.Get("/auth/google/login", controllers.GoogleLogin)
    api.Get("/auth/google/callback", controllers.GoogleCallback)


	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Fatal(app.Listen(":" + port))
}
