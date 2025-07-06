package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"time"

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
	var req models.GuideVertification

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// ตรวจสอบข้อมูลที่จำเป็น
	if req.UserID == 0 || req.Bio == "" || req.Description == "" || 
	   req.Price <= 0 || req.District == "" || req.City == "" || 
	   req.Province == "" || req.Language == "" || req.CertificationData == ""{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing required fields",
		})
	}

	// ตรวจสอบว่ามีคำขอที่รออยู่แล้วหรือไม่
	var existingVerification models.GuideVertification
	if err := config.DB.Where("user_id = ? AND status = ?", req.UserID, "pending").
		First(&existingVerification).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "You already have a pending guide application",
		})
	}

	// ตรวจสอบว่าเป็นไกด์อยู่แล้วหรือไม่
	var existingGuide models.Guide
	if err := config.DB.Where("user_id = ?", req.UserID).First(&existingGuide).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "You are already a guide",
		})
	}

	// เริ่ม transaction
	tx := config.DB.Begin()
	defer tx.Rollback()

	// กำหนดค่าเริ่มต้น
	req.Status = "pending"
	req.VerificationDate = time.Now()
	req.GuideID = nil // ยังไม่มี GuideID จนกว่าจะได้รับการอนุมัติ

	// บันทึกข้อมูลคำขอสมัครเป็นไกด์
	if err := tx.Create(&req).Error; err != nil {
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
		"verification": req,
	})
}
