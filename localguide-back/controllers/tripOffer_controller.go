package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// สร้าง TripOffer ใหม่
func CreateTripOffer(c *fiber.Ctx) error {
    var offer models.TripOffer
    if err := c.BodyParser(&offer); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
    }
    if err := config.DB.Create(&offer).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create offer"})
    }
    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"offer":   offer,
	})
}

// ดู TripOffers ทั้งหมดของ TripRequire
func GetTripOffers(c *fiber.Ctx) error {
    tripRequireID, err := strconv.Atoi(c.Params("id"))
    if err != nil  {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid require ID"})
    }
	if tripRequireID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Require ID must be greater than 0"})
	}
    var offers []models.TripOffer
    if err := config.DB.Where("trip_require_id = ?", tripRequireID).Find(&offers).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get offers"})
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"offers": offers})
}

// ดู TripOffer รายการเดียว
func GetTripOfferByID(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
    }
	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Offer ID must be greater than 0"})
	}
    var offer models.TripOffer
    if err := config.DB.First(&offer, id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Offer not found"})
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get offer"})
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"offer": offer})
}

// แก้ไข TripOffer
func UpdateTripOffer(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
    }
	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Offer ID must be greater than 0"})
	}
    var offer models.TripOffer
    if err := config.DB.First(&offer, id).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Offer not found"})
    }
    if err := c.BodyParser(&offer); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
    }
    if err := config.DB.Save(&offer).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update offer"})
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"offer": offer})
}

// ลบ TripOffer (ถอนข้อเสนอ)
func WithdrawTripOffer(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
    }

	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Offer ID must be greater than 0"})
	}
    if err := config.DB.Delete(&models.TripOffer{}, id).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete offer"})
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Offer withdrawn successfully"})
}

// Accept TripOffer (User เลือก offer 1 คน - คนที่เหลือ reject อัตโนมัติ)
func AcceptTripOffer(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil || id <= 0 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error":   "Offer ID must be a positive integer",
        })
    }

    // Start transaction
    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Get the selected offer
    var selectedOffer models.TripOffer
    if err := tx.First(&selectedOffer, id).Error; err != nil {
        tx.Rollback()
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error":   "Offer not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error":   "Failed to get offer",
        })
    }

    // Check if offer is already accepted/rejected
    if selectedOffer.Status != "pending" {
        tx.Rollback()
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error":   "Offer is no longer available",
        })
    }

    // Accept the selected offer
    selectedOffer.Status = "accepted"
    if err := tx.Save(&selectedOffer).Error; err != nil {
        tx.Rollback()
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error":   "Failed to accept offer",
        })
    }

    // Reject all other offers for the same trip require
    if err := tx.Model(&models.TripOffer{}).
        Where("trip_require_id = ? AND id != ? AND status = ?", selectedOffer.TripRequireID, id, "pending").
        Update("status", "rejected").Error; err != nil {
        tx.Rollback()
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error":   "Failed to reject other offers",
        })
    }

    // Create trip booking
    booking := models.TripBooking{
        TripOfferID:   selectedOffer.ID,
        UserID:        selectedOffer.TripRequire.UserID,
        GuideID:       selectedOffer.GuideID,
        TotalAmount:   selectedOffer.TotalPrice,
		StartDate:    selectedOffer.TripRequire.StartDate,
		EndDate:      selectedOffer.TripRequire.EndDate,
    }
    if err := tx.Create(&booking).Error; err != nil {
        tx.Rollback()
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error":   "Failed to create booking",
        })
    }

    // Commit transaction
    if err := tx.Commit().Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error":   "Failed to complete acceptance",
        })
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Offer accepted successfully",
        "booking": booking,
    })
}

func RejectTripOffer(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
    }

	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Offer ID must be greater than 0"})
	}

    var offer models.TripOffer
    if err := config.DB.First(&offer, id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Offer not found"})
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get offer"})
    }

    offer.Status = "rejected" 
    if err := config.DB.Save(&offer).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reject offer"})
    }

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "offer":   offer,
    })
}
