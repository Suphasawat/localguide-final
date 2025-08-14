package controllers

import (
	"localguide-back/config"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
)

// GetLanguages returns all available languages
func GetLanguages(c *fiber.Ctx) error {
	var languages []models.Language

	if err := config.DB.Find(&languages).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve languages",
		})
	}

	return c.JSON(fiber.Map{
		"languages": languages,
	})
}

// GetTouristAttractions returns all tourist attractions or filtered by province
func GetTouristAttractions(c *fiber.Ctx) error {
	var attractions []models.TouristAttraction
	provinceID := c.Query("province_id")

	query := config.DB.Preload("Province")

	if provinceID != "" {
		query = query.Where("province_id = ?", provinceID)
	}

	if err := query.Find(&attractions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve tourist attractions",
		})
	}

	return c.JSON(fiber.Map{
		"attractions": attractions,
	})
}
