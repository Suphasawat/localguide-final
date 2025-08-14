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
	
	if err := config.DB.AutoMigrate(
		&models.AuthUser{}, 
        &models.Role{}, 
        &models.User{}, 
        &models.Province{}, 
        &models.Guide{},
		&models.Language{}, 
        &models.TouristAttraction{},
		&models.GuideCertification{}, 
        &models.GuideVertification{}, 
		&models.PasswordReset{}, 
		&models.TripRequire{}, 
        &models.TripOffer{}, 
        &models.TripOfferQuotation{}, 
        &models.TripOfferNegotiation{},
        &models.TripBooking{}, 
		&models.TripPayment{}, 
        &models.TripReview{}, 
        &models.TripReport{}, 
		&models.GuidePerformance{}, 
        &models.TripNotification{}, 
        &models.PaymentRelease{},
	); err != nil {
		log.Printf("Migration error: %v", err)
	} else {
		log.Println("All tables migrated successfully")
	}

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
    api.Get("/languages", controllers.GetLanguages)
    api.Get("/attractions", controllers.GetTouristAttractions)
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
    
    // 3. Accept offer (User เลือก offer 1 คน - คนที่เหลือ reject อัตโนมัติ)
    api.Put("/trip-offers/:id/accept", middleware.AuthRequired(), controllers.AcceptTripOffer)
    
    // 4. Payment (User จ่ายเงิน 100%)
    api.Post("/trip-bookings/:id/payment", middleware.AuthRequired(), controllers.CreateTripPayment)
    api.Post("/trip-bookings/:id/payment/confirm", middleware.AuthRequired(), controllers.ConfirmTripPayment)
    api.Get("/trip-bookings/:id/payment", middleware.AuthRequired(), controllers.GetTripPayment)
    
    // Stripe webhook (ไม่ต้องใช้ auth เพราะมาจาก Stripe server)
    api.Post("/stripe/webhook", controllers.StripeWebhook)
    
    // 5. Trip booking management
    api.Get("/trip-bookings", middleware.AuthRequired(), controllers.GetTripBookings) // ดู bookings ของตัวเอง
    api.Get("/trip-bookings/:id", middleware.AuthRequired(), controllers.GetTripBookingByID)
    
    // 6. Trip status management
    api.Put("/trip-bookings/:id/confirm-guide-arrival", middleware.AuthRequired(), controllers.ConfirmGuideArrival) // User ยืนยันไกด์มา -> ไกด์ได้เงิน 50%
    api.Put("/trip-bookings/:id/confirm-trip-complete", middleware.AuthRequired(), controllers.ConfirmTripComplete) // User ยืนยันทริปเสร็จ -> ไกด์ได้เงินเต็ม
    api.Put("/trip-bookings/:id/report-user-no-show", middleware.AuthRequired(), controllers.ReportUserNoShow) // Guide รีพอร์ต user ไม่มา -> ไกด์ได้ 50% + คืนเงินส่วนที่เหลือให้ user

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
    admin.Get("/trip-reports", controllers.GetAllTripReports)
    admin.Put("/trip-reports/:id", controllers.HandleTripReport)
    admin.Get("/payments", controllers.GetAllPayments)
    admin.Put("/payments/:id/release", controllers.ManualReleasePayment)
    
    
    // Google Auth routes
    api.Get("/auth/google/login", controllers.GoogleLogin)
    api.Get("/auth/google/callback", controllers.GoogleCallback)


	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Fatal(app.Listen(":" + port))
}
