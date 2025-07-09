package controllers

import (
	"localguide-back/config"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
)	

func GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("id")
	var user models.User

	if err := config.DB.
		Preload("AuthUser").
		Preload("Role").
		Preload("Guide").
		First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}

func EditUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user"})
	}

	return c.JSON(user)
}
