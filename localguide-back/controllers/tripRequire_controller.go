package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func CreateTripRequire(c *fiber.Ctx) error {
	var req struct {
		ProvinceID   uint    `json:"province_id" validate:"required"`
		Title        string  `json:"title" validate:"required"`
		Description  string  `json:"description" validate:"required"`
		MinPrice     float64 `json:"min_price" validate:"required,min=0"`
		MaxPrice     float64 `json:"max_price" validate:"required,min=0"`
		StartDate    string  `json:"start_date" validate:"required"`
		EndDate      string  `json:"end_date" validate:"required"`
		Days         int     `json:"days" validate:"required,min=1"`
		MinRating    float64 `json:"min_rating"`
		GroupSize    int     `json:"group_size" validate:"required,min=1"`
		Requirements string  `json:"requirements"`
		ExpiresAt    string  `json:"expires_at"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
			"details": err.Error(),
		})
	}

	// ตรวจสอบว่า MaxPrice >= MinPrice
	if req.MaxPrice < req.MinPrice {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Max price must be greater than or equal to min price",
		})
	}

	// ดึง UserID จาก JWT token
	userID := c.Locals("user_id").(uint)

	// ตรวจสอบว่า Province มีอยู่จริง
	var province models.Province
	if err := config.DB.First(&province, req.ProvinceID).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Province not found",
		})
	}

	// Parse dates
	startDate, err := time.Parse("02/01/2006", req.StartDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid start_date format (use DD/MM/YYYY)",
		})
	}

	endDate, err := time.Parse("02/01/2006", req.EndDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid end_date format (use DD/MM/YYYY)",
		})
	}

	// ตรวจสอบว่า EndDate >= StartDate
	if endDate.Before(startDate) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "End date must be after start date",
		})
	}

	var expiresAt *time.Time
	if req.ExpiresAt != "" {
		expiry, err := time.Parse("02/01/2006", req.ExpiresAt)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid expires_at format (use DD/MM/YYYY)",
			})
		}
		expiresAt = &expiry
	}

	tripRequire := models.TripRequire{
		UserID:       userID,
		ProvinceID:   req.ProvinceID,
		Title:        req.Title,
		Description:  req.Description,
		MinPrice:     req.MinPrice,
		MaxPrice:     req.MaxPrice,
		StartDate:    startDate,
		EndDate:      endDate,
		Days:         req.Days,
		MinRating:    req.MinRating,
		GroupSize:    req.GroupSize,
		Requirements: req.Requirements,
		Status:       "open",
		ExpiresAt:    expiresAt,
	}

	if err := config.DB.Create(&tripRequire).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create trip requirement",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":     "Trip requirement created successfully",
		"tripRequire": tripRequire,
	})
}

// GetTripRequires - ดู trip requires ของ user ตัวเอง
func GetTripRequires(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var tripRequires []models.TripRequire
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&tripRequires).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve trip requirements",
			"details": err.Error(),
		})
	}

	// เพิ่มข้อมูลจำนวน offers ให้แต่ละ trip require
	type TripRequireResponse struct {
		models.TripRequire
		TotalOffers int `json:"total_offers"`
		ProvinceName string `json:"province_name"`
	}

	var response []TripRequireResponse
	for _, tr := range tripRequires {
		// นับจำนวน offers
		var offerCount int64
		config.DB.Model(&models.TripOffer{}).Where("trip_require_id = ?", tr.ID).Count(&offerCount)

		// ดึงชื่อ province
		var province models.Province
		provinceName := ""
		if err := config.DB.First(&province, tr.ProvinceID).Error; err == nil {
			provinceName = province.Name
		}

		response = append(response, TripRequireResponse{
			TripRequire: tr,
			TotalOffers: int(offerCount),
			ProvinceName: provinceName,
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tripRequires": response,
	})
}

// BrowseTripRequires - สำหรับ Guide ดู trip requires ที่สามารถ offer ได้
func BrowseTripRequires(c *fiber.Ctx) error {
	// ตรวจสอบว่าเป็น Guide
	userID := c.Locals("user_id").(uint)
	var guide models.Guide
	if err := config.DB.Where("user_id = ?", userID).First(&guide).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only guides can browse trip requirements",
		})
	}

	// Query parameters
	provinceID := c.Query("province_id")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	status := c.Query("status", "open")

	// ให้แสดงทั้ง open และ in_review
	var statuses []string
	if status == "open" {
		statuses = []string{"open", "in_review"}
	} else {
		statuses = []string{status}
	}
	query := config.DB.Where("status IN ?", statuses)

	// Filter by province if specified
	if provinceID != "" {
		query = query.Where("province_id = ?", provinceID)
	}

	// Filter by price range if specified
	if minPrice != "" {
		query = query.Where("max_price >= ?", minPrice)
	}
	if maxPrice != "" {
		query = query.Where("min_price <= ?", maxPrice)
	}

	// Only show trip requires in the guide's province by default (unless a province_id filter is provided)
	if provinceID == "" {
		query = query.Where("province_id = ?", guide.ProvinceID)
	}

	// Enforce min rating requirement: only show trip requires where required minimum rating is <= guide's rating
	// TripRequire.MinRating defaults to 0 so this will include all when not set
	query = query.Where("min_rating <= ?", guide.Rating)

	var tripRequires []models.TripRequire
	if err := query.Order("created_at DESC").Find(&tripRequires).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve trip requirements",
			"details": err.Error(),
		})
	}

	// เพิ่มข้อมูลเสริม
	type BrowseResponse struct {
		models.TripRequire
		TotalOffers  int    `json:"total_offers"`
		HasOffered   bool   `json:"has_offered"`
		ProvinceName string `json:"province_name"`
		UserName     string `json:"user_name"`
	}

	var response []BrowseResponse
	for _, tr := range tripRequires {
		// นับจำนวน offers
		var offerCount int64
		config.DB.Model(&models.TripOffer{}).Where("trip_require_id = ?", tr.ID).Count(&offerCount)

		// ตรวจสอบว่า guide คนนี้ offer แล้วหรือยัง
		var existingOffer models.TripOffer
		hasOffered := config.DB.Where("trip_require_id = ? AND guide_id = ?", tr.ID, guide.ID).First(&existingOffer).Error == nil

		// ดึงชื่อ province
		var province models.Province
		provinceName := ""
		if err := config.DB.First(&province, tr.ProvinceID).Error; err == nil {
			provinceName = province.Name
		}

		// ดึงชื่อ user
		var user models.User
		userName := ""
		if err := config.DB.First(&user, tr.UserID).Error; err == nil {
			userName = user.FirstName + " " + user.LastName
		}

		response = append(response, BrowseResponse{
			TripRequire:  tr,
			TotalOffers:  int(offerCount),
			HasOffered:   hasOffered,
			ProvinceName: provinceName,
			UserName:     userName,
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tripRequires": response,
	})
}

func GetTripRequiresByTripID(c *fiber.Ctx) error {
	tripID, err := strconv.Atoi(c.Params("id"))
	if err != nil || tripID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid trip ID",
			"details": err.Error(),
		})
	}

	var tripRequire models.TripRequire
	if err := config.DB.Where("trip_id = ?", tripID).First(&tripRequire).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trip requirement not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve trip requirement",
			"details": err.Error(),
		})
	}

	if tripRequire.ID == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No trip requirements found for this trip ID",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tripRequire": tripRequire,
	})
}

func GetTripRequireByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid trip require ID",
			"details": err.Error(),
		})
	}

	var tripRequire models.TripRequire
	if err := config.DB.Preload("Province").Preload("User").First(&tripRequire, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trip requirement not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve trip requirement",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": tripRequire,
	})
}

func UpdateTripRequire(c *fiber.Ctx) error {

	tripID ,err := strconv.Atoi(c.Params("id"))
	if err != nil || tripID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid trip ID",
			"details": err.Error(),
		})
	}

	var tripRequire models.TripRequire
	if err := c.BodyParser(&tripRequire); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
			"details": err.Error(),
		})
	}

	if err := config.DB.Model(&models.TripRequire{}).Where("id = ?", tripID).Updates(tripRequire).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update trip requirement",
			"details": err.Error(),
		})
	}

	// ดึงข้อมูลล่าสุดกลับมาแสดง
    var updated models.TripRequire
    config.DB.First(&updated, tripID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tripRequire": updated,
	})
}

func DeleteTripRequire(c *fiber.Ctx) error {
	tripID, err := strconv.Atoi(c.Params("id"))
	if err != nil || tripID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid trip ID",
			"details": err.Error(),
		})
	}

	// ตรวจสอบว่าเป็นเจ้าของ trip require หรือไม่
	userID := c.Locals("user_id").(uint)
	var tripRequire models.TripRequire
	if err := config.DB.Where("id = ? AND user_id = ?", tripID, userID).First(&tripRequire).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trip requirement not found or you don't have permission",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find trip requirement",
			"details": err.Error(),
		})
	}

	// ตรวจสอบสถานะก่อนลบ - ไม่สามารถลบได้ถ้ามี offer ที่ accepted แล้ว
	if tripRequire.Status == "assigned" || tripRequire.Status == "completed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot delete trip requirement with status: " + tripRequire.Status,
		})
	}

	// ลบ trip require (soft delete)
	if err := config.DB.Delete(&tripRequire).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete trip requirement",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Trip requirement deleted successfully",
		"tripID": tripID,
	})
}