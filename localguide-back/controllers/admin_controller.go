package controllers

import (
	"encoding/json"
	"localguide-back/config"
	"localguide-back/models"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func ApproveGuide(c *fiber.Ctx) error {
	var req struct {
		Status string `json:"status"` // approved, rejected
	}

	// รับค่า verification ID จาก URL
	verificationID := c.Params("id")
	
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// หา GuideVertification ตาม ID ที่ได้รับมา
	var verification models.GuideVertification
	if err := config.DB.First(&verification, verificationID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Guide verification not found",
		})
	}

	// เริ่ม transaction
	tx := config.DB.Begin()
	defer tx.Rollback()

	// เปลี่ยนแปลงสถานะของ GuideVertification 
	if err := tx.Model(&verification).Update("status", req.Status).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update guide status",
		})
	}

	// ถ้า approved ให้สร้าง Guide ใหม่
	if req.Status == "approved" {
		// สร้าง Guide ใหม่จากข้อมูลใน GuideVertification
		newGuide := models.Guide{
			UserID:      verification.UserID,
			Bio:         verification.Bio,
			Description: verification.Description,
			Price:       verification.Price,
			District:    verification.District,
			City:        verification.City,
			Province:    verification.Province,
			Available:   true, // ตั้งค่าเป็น available
			Rating:      0,    // เริ่มต้นที่ 0
		}

		// เช็คว่า Guide นี้มีอยู่แล้วหรือไม่
		var existingGuide models.Guide
		if err := tx.Where("user_id = ?", verification.UserID).First(&existingGuide).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Guide already exists",
			})
		}

		// สร้าง Guide ใหม่
		if err := tx.Create(&newGuide).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create guide",
			})
		}

		// --- เพิ่มส่วนนี้เพื่อสร้าง GuideCertification ---
		var certs []struct {
			ImagePath   string `json:"ImagePath"`
			Description string `json:"Description"`
		}
		if err := json.Unmarshal([]byte(verification.CertificationData), &certs); err == nil {
			for _, cert := range certs {
				guideCert := models.GuideCertification{
					GuideID:     newGuide.ID,
					ImagePath:   cert.ImagePath,
					Description: cert.Description,
				}
				if err := tx.Create(&guideCert).Error; err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Failed to create guide certification",
					})
				}
			}
		}
		

		// อัปเดต GuideID ใน GuideVertification
		if err := tx.Model(&verification).Update("guide_id", newGuide.ID).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update guide ID in verification",
			})
		}

		// อัปเดต role ของ user เป็น guide (role_id = 2)
		if err := tx.Model(&models.User{}).Where("id = ?", verification.UserID).Update("role_id", 2).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update user role",
			})
		}

		// --- เชื่อมโยง guide กับภาษาใน many2many ---
		if verification.Language != "" {
			languageNames := strings.Split(verification.Language, ",")
			for _, name := range languageNames {
				langName := strings.TrimSpace(name)
				if langName == "" {
					continue
				}
				var lang models.Language
				if err := tx.Where("name = ?", langName).First(&lang).Error; err == nil {
					// เชื่อมโยง guide กับ language (many2many)
					if err := tx.Model(&newGuide).Association("Language").Append(&lang); err != nil {
						return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
							"error": "Failed to associate guide with language",
						})
					}
				}
			}
		}
		// --- จบส่วนเชื่อมโยงภาษา ---

	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to commit transaction",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Guide status updated successfully",
		"status":  req.Status,
	})
}

// GetAllGuides returns all guides with their details for admin
func GetAllGuides(c *fiber.Ctx) error {
	var guides []models.Guide

	if err := config.DB.
		Preload("User").
		Preload("Languages").
		Preload("TouristAttractions").
		Preload("Certification").
		Find(&guides).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve guides",
		})
	}
	return c.JSON(fiber.Map{
		"guides": guides,
	})
}

// GetPendingVerifications returns all pending guide verification requests
func GetPendingVerifications(c *fiber.Ctx) error {
	var verifications []models.GuideVertification

	if err := config.DB.
		Where("status = ?", "pending").
		Preload("User").
		Preload("Guide").
		Find(&verifications).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve verification requests",
		})
	}

	return c.JSON(fiber.Map{
		"verifications": verifications,
	})
}
