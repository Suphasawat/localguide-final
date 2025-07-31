package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// CreateTripRequest - User สร้างคำขอทริป
func CreateTripRequest(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var req struct {
		ProvinceID           uint      `json:"province_id"`
		MinPrice             float64   `json:"min_price"`
		MaxPrice             float64   `json:"max_price"`
		StartDate            string    `json:"start_date"`
		EndDate              string    `json:"end_date"`
		MinRating            float64   `json:"min_rating"`
		GroupSize            int       `json:"group_size"`
		Requirements         string    `json:"requirements"`
		TouristAttractionIDs []uint    `json:"tourist_attraction_ids"`
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

	days := int(endDate.Sub(startDate).Hours()/24) + 1

	// สร้าง trip request
	tripRequest := models.TripRequest{
		UserID:       userID,
		ProvinceID:   req.ProvinceID,
		MinPrice:     req.MinPrice,
		MaxPrice:     req.MaxPrice,
		StartDate:    startDate,
		EndDate:      endDate,
		Days:         days,
		MinRating:    req.MinRating,
		GroupSize:    req.GroupSize,
		Requirements: req.Requirements,
		Status:       "searching",
	}

	if err := config.DB.Create(&tripRequest).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create trip request",
		})
	}

	// เชื่อมโยงกับสถานที่ท่องเที่ยว
	if len(req.TouristAttractionIDs) > 0 {
		var attractions []models.TouristAttraction
		config.DB.Where("id IN ?", req.TouristAttractionIDs).Find(&attractions)
		config.DB.Model(&tripRequest).Association("TouristAttractions").Append(attractions)
	}

	// โหลดข้อมูลครบถ้วน
	config.DB.Preload("User").Preload("Province").Preload("TouristAttractions").
		First(&tripRequest, tripRequest.ID)

	return c.JSON(fiber.Map{
		"message":      "Trip request created successfully",
		"trip_request": tripRequest,
	})
}

// GetMatchingGuides - หาไกด์ที่เหมาะสมกับ trip request
func GetMatchingGuides(c *fiber.Ctx) error {
	tripRequestID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid trip request ID",
		})
	}

	// ดึง trip request
	var tripRequest models.TripRequest
	if err := config.DB.Preload("TouristAttractions").
		First(&tripRequest, tripRequestID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Trip request not found",
		})
	}

	// หาไกด์ที่ตรงเงื่อนไข
	var guides []models.Guide
	query := config.DB.Where("province_id = ? AND price BETWEEN ? AND ? AND rating >= ? AND available = ?",
		tripRequest.ProvinceID, tripRequest.MinPrice, tripRequest.MaxPrice, 
		tripRequest.MinRating, true)

	// ถ้ามีสถานที่ท่องเที่ยวที่เลือก ให้หาไกด์ที่ให้บริการสถานที่เหล่านั้น
	if len(tripRequest.TouristAttractions) > 0 {
		attractionIDs := make([]uint, len(tripRequest.TouristAttractions))
		for i, attraction := range tripRequest.TouristAttractions {
			attractionIDs[i] = attraction.ID
		}
		
		query = query.Joins("JOIN guide_tourist_attractions ON guides.id = guide_tourist_attractions.guide_id").
			Where("guide_tourist_attractions.tourist_attraction_id IN ?", attractionIDs)
	}

	if err := query.Preload("User").Preload("Language").Preload("TouristAttraction").
		Distinct().Find(&guides).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find matching guides",
		})
	}

	return c.JSON(fiber.Map{
		"guides": guides,
	})
}

// GetTripRequest - ดึงข้อมูล trip request
func GetTripRequestsByID(c *fiber.Ctx) error {
	tripRequestID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid trip request ID",
		})
	}

	var tripRequest models.TripRequest
	if err := config.DB.Preload("User").Preload("Province").
		Preload("TouristAttractions").Preload("TripProposals.Guide.User").
		First(&tripRequest, tripRequestID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Trip request not found",
		})
	}

	return c.JSON(fiber.Map{
		"trip_request": tripRequest,
	})
}