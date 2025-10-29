package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"time"

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
			ProvinceID:  verification.ProvinceID, // ใช้ ProvinceID จาก verification
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

		// สร้าง GuideCertification ถ้ามีหมายเลขใบอนุญาต
		if verification.CertificationData != "" {
			guideCert := models.GuideCertification{
				GuideID:             newGuide.ID,
				CertificationNumber: verification.CertificationData,
			}
			if err := tx.Create(&guideCert).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to create guide certification",
				})
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
		// โหลด languages ที่เชื่อมโยงกับ verification
		if err := tx.Preload("Language").First(&verification, verification.ID).Error; err == nil {
			for _, lang := range verification.Language {
				// เชื่อมโยง guide กับ language (many2many)
				if err := tx.Model(&newGuide).Association("Language").Append(&lang); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Failed to associate guide with language",
					})
				}
			}
		}

		// --- เชื่อมโยง guide กับ tourist attractions ใน many2many ---
		// โหลด attractions ที่เชื่อมโยงกับ verification
		if err := tx.Preload("Attraction").First(&verification, verification.ID).Error; err == nil {
			for _, attraction := range verification.Attraction {
				// เชื่อมโยง guide กับ tourist attraction (many2many)
				if err := tx.Model(&newGuide).Association("TouristAttraction").Append(&attraction); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Failed to associate guide with tourist attraction",
					})
				}
			}
		}
		

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
		Preload("Language").
		Preload("TouristAttraction").
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
		Preload("Province").
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

// GetAllTripReports returns all trip reports for admin
func GetAllTripReports(c *fiber.Ctx) error {
	var reports []models.TripReport

	if err := config.DB.
		Preload("TripBooking").
		Preload("Reporter").
		Preload("ReportedUser").
		Find(&reports).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve trip reports",
		})
	}

	return c.JSON(fiber.Map{
		"reports": reports,
	})
}

// HandleTripReport allows admin to handle trip reports
func HandleTripReport(c *fiber.Ctx) error {
	reportID := c.Params("id")
	
	var req struct {
		Status      string `json:"status"`      // investigating, resolved, dismissed
		AdminNotes  string `json:"admin_notes"`
		Actions     string `json:"actions"`     // JSON string of actions taken
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var report models.TripReport
	if err := config.DB.First(&report, reportID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Trip report not found",
		})
	}

	// Update report status and admin notes
	updates := map[string]interface{}{
		"status":      req.Status,
		"admin_notes": req.AdminNotes,
		"actions":     req.Actions,
	}

	if req.Status == "resolved" {
		now := time.Now()
		updates["resolved_at"] = &now
	}

	if err := config.DB.Model(&report).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update trip report",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Trip report updated successfully",
		"report":  report,
	})
}

// GetAllPayments returns all payments for admin
func GetAllPayments(c *fiber.Ctx) error {
	var payments []models.TripPayment

	if err := config.DB.
		Preload("TripBooking").
		Preload("TripBooking.User").
		Preload("TripBooking.Guide").
		Find(&payments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve payments",
		})
	}

	return c.JSON(fiber.Map{
		"payments": payments,
	})
}

// ManualReleasePayment allows admin to manually release payments
func ManualReleasePayment(c *fiber.Ctx) error {
	paymentID := c.Params("id")
	
	var req struct {
		ReleaseType   string  `json:"release_type"` // first_payment, second_payment, refund
		Amount        float64 `json:"amount"`
		RecipientType string  `json:"recipient_type"` // guide, user
		RecipientID   uint    `json:"recipient_id"`
		Reason        string  `json:"reason"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var payment models.TripPayment
	if err := config.DB.First(&payment, paymentID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Payment not found",
		})
	}

	// Create payment release record
	now := time.Now()
	release := models.PaymentRelease{
		TripPaymentID: payment.ID,
		ReleaseType:   req.ReleaseType,
		Amount:        req.Amount,
		RecipientType: req.RecipientType,
		RecipientID:   req.RecipientID,
		Reason:        req.Reason,
		ScheduledAt:   now,
		ProcessedAt:   &now,
		Status:        "processed",
		Notes:         "Manual release by admin",
	}

	if err := config.DB.Create(&release).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create payment release",
		})
	}

	// Update payment status based on release type
	var newStatus string
	switch req.ReleaseType {
	case "first_payment":
		newStatus = "first_released"
		payment.FirstReleasedAt = &now
	case "second_payment":
		newStatus = "fully_released"
		payment.SecondReleasedAt = &now
	case "refund":
		newStatus = "refunded"
		payment.RefundedAt = &now
		payment.RefundAmount = req.Amount
	}

	payment.Status = newStatus
	if err := config.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update payment status",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Payment released successfully",
		"release": release,
		"payment": payment,
	})
}
