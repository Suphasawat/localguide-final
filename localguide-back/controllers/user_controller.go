package controllers

import (
	"localguide-back/config"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
)	

func GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("id")
	var user models.User

	if err := config.DB.Preload("AuthUser").First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}

