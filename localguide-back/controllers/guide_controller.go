package controllers

import (
	"fmt"
	"localguide-back/config"
	"localguide-back/models"
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
        Description         string   `json:"description"`
        ProvinceID          uint     `json:"provinceId"`
        Price               float64  `json:"price"`
        LanguageIDs         []uint   `json:"languageIds"`
        AttractionIDs       []uint   `json:"attractionIds"`
        CertificationNumber string   `json:"certificationNumber"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if req.Bio == "" || req.Description == "" || req.Price <= 0 || 
       req.ProvinceID == 0 || len(req.LanguageIDs) == 0 || req.CertificationNumber == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Missing required fields (bio, description, price, provinceId, languageIds, certificationNumber)",
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
        Description:         req.Description,
        Price:               req.Price,
        ProvinceID:          req.ProvinceID,
        CertificationData:   req.CertificationNumber,
        Status:              "pending",
        VerificationDate:    time.Now(),
        GuideID:             nil,
    }

    // บันทึกข้อมูลคำขอสมัครเป็นไกด์
    if err := tx.Create(&verification).Error; err != nil {
        fmt.Printf("Error creating verification: %v\n", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to create guide application",
        })
    }

    // หา languages ตาม ID และเชื่อมโยงกับ verification
    for _, languageID := range req.LanguageIDs {
        var language models.Language
        if err := tx.Where("id = ?", languageID).First(&language).Error; err == nil {
            // เชื่อมโยง verification กับ language
            if err := tx.Model(&verification).Association("Language").Append(&language); err != nil {
                fmt.Printf("Error associating language: %v\n", err)
            }
        } else {
            fmt.Printf("Language with ID %d not found\n", languageID)
        }
    }

    // หา attractions ตาม ID และเชื่อมโยงกับ verification
    for _, attractionID := range req.AttractionIDs {
        var attraction models.TouristAttraction
        if err := tx.Where("id = ?", attractionID).First(&attraction).Error; err == nil {
            // เชื่อมโยงกับ verification กับ attraction
            if err := tx.Model(&verification).Association("Attraction").Append(&attraction); err != nil {
                fmt.Printf("Error associating attraction: %v\n", err)
            }
        } else {
            fmt.Printf("Attraction with ID %d not found\n", attractionID)
        }
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
