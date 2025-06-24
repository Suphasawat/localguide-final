package controllers

import (
	"localguide-back/config"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
)

func UpdateGuideStatus(c *fiber.Ctx) error {
	var req struct {
		Status string `json:"status"` // approved, rejected
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get guide ID from params
	guideID := c.Params("id")

	// Find guide
	var guide models.Guide
	if err := config.DB.First(&guide, guideID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Guide not found",
		})
	}

	// Update status
	if err := config.DB.Model(&guide).Update("status", req.Status).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update guide status",
		})
	}

	// Create notification for the guide
	notification := models.Notification{
		UserID:  guide.UserID,
		IsRead:  false,
	}

	if req.Status == "approved" {
		notification.Message = "คุณได้รับการอนุมัติเป็นมัคคุเทศก์แล้ว"
	} else if req.Status == "rejected" {
		notification.Message = "คำขอเป็นมัคคุเทศก์ของคุณถูกปฏิเสธ"
	}

	if err := config.DB.Create(&notification).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create notification",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Guide status updated successfully",
	})
}

// GetAllGuides returns all guides with their details for admin
func GetAllGuides(c *fiber.Ctx) error {
	var guides []models.Guide

	// Fetch all guides with their user details and languages
	if err := config.DB.
		Preload("User").
		Preload("Language").
		Find(&guides).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch guides",
		})
	}

	return c.JSON(guides)
}
