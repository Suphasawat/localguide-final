package controllers

import (
	"localguide-back/config"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
)

func GetGuides(c *fiber.Ctx) error {
	var guides []models.Guide
	
	result := config.DB.Find(&guides)

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

	result := config.DB.Find(&guide, id)

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
	var req models.Guide
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// ตรวจสอบว่ามี guide สำหรับ user นี้อยู่แล้วหรือยัง
	var existingGuide models.Guide
	if err := config.DB.Where("user_id = ?", req.UserID).First(&existingGuide).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User has already created a guide"})
	}

	if req.UserID == 0 || req.Bio == "" || req.Experience == "" || req.Price <= 0 || len(req.Language) == 0 || req.District == "" || req.City == "" || req.Province == "" || req.Certification == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing required fields"})
	}

	// เปลี่ยน role user เป็น 2 (guide)
	if err := config.DB.Model(&models.User{}).Where("id = ?", req.UserID).Update("role_id", 2).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user role"})
	}

	// Create guide
	tx := config.DB.Begin()
	defer tx.Rollback()
	if err := tx.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create guide"})
	}
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to commit guide creation"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Guide created and user role updated to guide",
		"guide": req,
	})

}
