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

	// Get guide ID from params
	guideID := c.Params("id")
	
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}


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


	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Guide status updated successfully",
	})
}

// GetAllGuides returns all guides with their details for admin
func GetAllGuides(c *fiber.Ctx) error {
	var guides []models.Guide

	if err := config.DB.Find(&guides).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve guides",
		})
	}
	return c.JSON(fiber.Map{
		"guides": guides,
	})
}
