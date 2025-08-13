package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetGuides(c *fiber.Ctx) error {
	var guides []models.Guide

	result := config.DB.
		Preload("User").
		Preload("Language").
		Preload("TouristAttraction").
		Preload("Certification").
		Find(&guides)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve guides",
		})
	}

	return c.JSON(fiber.Map{
		"guides": guides,
	})
}

// GetGuideByID returns a specific guide by ID
func GetGuideByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var guide models.Guide

	result := config.DB.
		Preload("User").
		Preload("Language").
		Preload("TouristAttraction").
		First(&guide, id)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Guide not found",
		})
	}

	return c.JSON(fiber.Map{
		"guide": guide,
	})
	
}

func CreateGuide(c *fiber.Ctx) error {
    // ดึง UserID จาก JWT token แทนจากข้อมูลที่ส่งมา
    userID := c.Locals("userID")
    if userID == nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized",
        })
    }

    var req struct {
        Bio                 string   `json:"bio"`
        Experience          string   `json:"experience"`
        District            string   `json:"district"`
        City                string   `json:"city"`
        Province            string   `json:"province"`
        Price               float64  `json:"price"`
        Languages           []string `json:"languages"`
        TouristAttractions  []string `json:"touristAttractions"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if req.Bio == "" || req.Experience == "" || req.Price <= 0 || 
       req.City == "" || req.Province == "" || len(req.Languages) == 0 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Missing required fields",
        })
    }

    // ตรวจสอบว่ามีคำขอที่รออยู่แล้วหรือไม่
    var existingVerification models.GuideVertification
    if err := config.DB.Where("user_id = ? AND status = ?", userID, "pending").
        First(&existingVerification).Error; err == nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "You already have a pending guide application",
        })
    }

    // ตรวจสอบว่าเป็นไกด์อยู่แล้วหรือไม่
    var existingGuide models.Guide
    if err := config.DB.Where("user_id = ?", userID).First(&existingGuide).Error; err == nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "You are already a guide",
        })
    }

    // เริ่ม transaction
    tx := config.DB.Begin()
    defer tx.Rollback()

    // สร้าง GuideVerification record
    verification := models.GuideVertification{
        UserID:              userID.(uint),
        Bio:                 req.Bio,
        Description:         req.Experience, // ใช้ experience เป็น description
        Price:               req.Price,
        District:            req.District,
        City:                req.City,
        Province:            req.Province,
        Language:            strings.Join(req.Languages, ","), // แปลง array เป็น string
        CertificationData:   "", // ตั้งค่าเริ่มต้นเป็นค่าว่าง
        Status:              "pending",
        VerificationDate:    time.Now(),
        GuideID:             nil,
    }

    // บันทึกข้อมูลคำขอสมัครเป็นไกด์
    if err := tx.Create(&verification).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to create guide application",
        })
    }

    if err := tx.Commit().Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to commit transaction",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "message": "Guide application submitted successfully. Please wait for admin approval.",
        "verification": verification,
    })
}
