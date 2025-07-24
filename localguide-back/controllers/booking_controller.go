package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

func CreateBooking(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var req struct {
		GuideID   uint   `json:"guideID"`
		StartDate string `json:"startDate"`
		EndDate   string `json:"endDate"`
		Note      string `json:"note"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Parse วันที่
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid start date format",
		})
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid end date format",
		})
	}

	// ตรวจสอบข้อมูล
	if endDate.Before(startDate) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "End date must be after start date",
		})
	}

	if startDate.Before(time.Now().Truncate(24 * time.Hour)) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot book past dates",
		})
	}

	// คำนวณจำนวนวัน
	days := int(endDate.Sub(startDate).Hours()/24) + 1

	// ตรวจสอบว่าไกด์มีอยู่จริง
	var guide models.Guide
	if err := config.DB.First(&guide, req.GuideID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Guide not found",
		})
	}

	// ตรวจสอบว่ามีการจองในช่วงวันที่เลือกหรือไม่
	var conflicts []models.Booking
	if err := config.DB.Where(`guide_id = ? AND status != 'cancelled' AND 
		((start_date <= ? AND end_date >= ?) OR 
		 (start_date <= ? AND end_date >= ?) OR
		 (start_date >= ? AND end_date <= ?))`,
		req.GuideID, startDate, startDate, endDate, endDate, startDate, endDate).
		Find(&conflicts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check availability",
		})
	}

	if len(conflicts) > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Selected dates are not available",
		})
	}

	// คำนวณราคารวม
	totalPrice := float64(days) * guide.Price

	// สร้างการจอง
	booking := models.Booking{
		UserID:     userID.(uint),
		GuideID:    req.GuideID,
		StartDate:  startDate,
		EndDate:    endDate,
		Days:       days,
		TotalPrice: totalPrice,
		Status:     "pending",
		Note:       req.Note,
	}

	if err := config.DB.Create(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create booking",
		})
	}

	// Preload ข้อมูล
	config.DB.Preload("User").Preload("Guide.User").First(&booking, booking.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Booking created successfully",
		"booking": booking,
	})
}

// GetUserBookings ดึงการจองของผู้ใช้
func GetUserBookings(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var bookings []models.Booking
	if err := config.DB.Where("user_id = ?", userID).
		Preload("Guide.User").
		Order("created_at DESC").
		Find(&bookings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve bookings",
		})
	}

	return c.JSON(fiber.Map{
		"bookings": bookings,
	})
}

// CancelBooking ยกเลิกการจอง
func CancelBooking(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid booking ID",
		})
	}

	var booking models.Booking
	if err := config.DB.Where("id = ? AND user_id = ?", bookingID, userID).
		First(&booking).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Booking not found",
		})
	}

	if booking.Status != "pending" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Can only cancel pending bookings",
		})
	}

	booking.Status = "cancelled"
	if err := config.DB.Save(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to cancel booking",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Booking cancelled successfully",
	})
}

// GetGuideUnavailableDates ดึงวันที่ไกด์ไม่ว่าง
func GetGuideUnavailableDates(c *fiber.Ctx) error {
	guideID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid guide ID",
		})
	}

	var bookings []models.Booking
	if err := config.DB.Where("guide_id = ? AND status != 'cancelled'", guideID).
		Find(&bookings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve unavailable dates",
		})
	}

	var unavailableDates []string
	for _, booking := range bookings {
		current := booking.StartDate
		for current.Before(booking.EndDate) || current.Equal(booking.EndDate) {
			unavailableDates = append(unavailableDates, current.Format("2006-01-02"))
			current = current.AddDate(0, 0, 1)
		}
	}

	return c.JSON(fiber.Map{
		"dates": unavailableDates,
	})
}

// GetGuideReviews ดึงรีวิวของไกด์
func GetGuideReviews(c *fiber.Ctx) error {
	guideID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid guide ID",
		})
	}

	var reviews []models.Review
	if err := config.DB.Where("guide_id = ?", guideID).
		Preload("User").
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve reviews",
		})
	}

	return c.JSON(fiber.Map{
		"reviews": reviews,
	})
}
