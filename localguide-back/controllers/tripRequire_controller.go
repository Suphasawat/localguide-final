package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func CreateTripRequire(c *fiber.Ctx) error {
	var tripRequire models.TripRequire
	if err := c.BodyParser(&tripRequire); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
			"details": err.Error(),
		})
	}

	 if tripRequire.ID == 0 || tripRequire.Requirements == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error":   "Missing required fields",
        })
    }

	if err := config.DB.Create(&tripRequire).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create trip requirement",
			"details": err.Error(),
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"tripRequire": tripRequire,
	})
}

func GetTripRequires(c *fiber.Ctx) error {
	var tripRequire []models.TripRequire
	if err := config.DB.Find(&tripRequire).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve trip requirements",
			"details": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tripRequires": tripRequire,
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

	if err := config.DB.Delete(&models.TripRequire{}, tripID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"details": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tripID": tripID,
	})
}

func BrowseTripRequires(c *fiber.Ctx) error {
	var tripRequires []models.TripRequire
	if err := config.DB.Find(&tripRequires).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve trip requirements",
			"details": err.Error(),
		})
	}

	if len(tripRequires) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No trip requirements found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"tripRequires": tripRequires,
	})
}