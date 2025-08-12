package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func GetProvinces(c *fiber.Ctx) error {
	var provinces []models.Province
	if err := config.DB.Find(&provinces).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve provinces",
			"details": err.Error(),
		})
	}

	if len(provinces) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No provinces found",
		})
	}
	return c.JSON(fiber.Map{
		"provinces": provinces,
	})
}

func GetProvinceAttractions(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid province ID",
		})
	}

	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Province ID must be greater than 0",
		})
	}

	var province models.Province
	if err := config.DB.Preload("TouristAttractions").First(&province, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Province not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve province",
			"details": err.Error(),
		})
	}

	// Get tourist attractions for this province
	var attractions []models.TouristAttraction
	if err := config.DB.Where("province_id = ?", province.ID).Find(&attractions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve attractions",
			"details": err.Error(),
		})
	}

	if len(attractions) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No attractions found for this province",
		})
	}

	return c.JSON(fiber.Map{
		"province":    province.Name,
		"attractions": attractions,
	})
}