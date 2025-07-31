package controllers

import (
	"encoding/json"
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// CreateFinalQuotation - ไกด์สร้างใบเสนอราคาสุดท้าย
func CreateFinalQuotation(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uint)
    proposalID, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid proposal ID",
        })
    }

    var req struct {
        Terms           []string `json:"terms"`
        ValidDays       int      `json:"valid_days"`
        PaymentDays     int      `json:"payment_days"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // ตรวจสอบ proposal
    var proposal models.TripProposal
    if err := config.DB.Preload("Guide").
        First(&proposal, proposalID).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "Proposal not found",
        })
    }

    // ตรวจสอบว่าเป็นเจ้าของ proposal
    if proposal.Guide.UserID != userID {
        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "error": "Access denied",
        })
    }

    // สร้าง quotation number
    quotationNumber := "QT" + strconv.FormatInt(time.Now().Unix(), 10)
    
    // แปลง terms เป็น JSON
    termsJSON := ""
    if req.Terms != nil {
        termsBytes, _ := json.Marshal(req.Terms)
        termsJSON = string(termsBytes)
    }

    // สร้าง final quotation
    finalQuotation := models.FinalQuotation{
        TripProposalID:  proposal.ID,
        QuotationNumber: quotationNumber,
        TotalAmount:     proposal.TotalPrice,
        PriceBreakdown:  proposal.PriceBreakdown,
        Terms:           termsJSON,
        ValidUntil:      time.Now().AddDate(0, 0, req.ValidDays),
        Status:          "pending",
        PaymentDeadline: time.Now().AddDate(0, 0, req.PaymentDays),
    }

    if err := config.DB.Create(&finalQuotation).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to create quotation",
        })
    }

    return c.JSON(fiber.Map{
        "message":         "Final quotation created successfully",
        "final_quotation": finalQuotation,
    })
}

// GetFinalQuotation - ดึงใบเสนอราคา
func GetFinalQuotation(c *fiber.Ctx) error {
    quotationID, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid quotation ID",
        })
    }

    var quotation models.FinalQuotation
    if err := config.DB.Preload("TripProposal.TripRequest.User").
        Preload("TripProposal.Guide.User").
        First(&quotation, quotationID).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "Quotation not found",
        })
    }

    return c.JSON(fiber.Map{
        "quotation": quotation,
    })
}

// AcceptQuotation - User ยอมรับใบเสนอราคา
func AcceptQuotation(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uint)
    quotationID, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid quotation ID",
        })
    }

    var quotation models.FinalQuotation
    if err := config.DB.Preload("TripProposal.TripRequest").
        First(&quotation, quotationID).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "Quotation not found",
        })
    }

    // ตรวจสอบว่าเป็นเจ้าของ trip request
    if quotation.TripProposal.TripRequest.UserID != userID {
        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "error": "Access denied",
        })
    }

    // อัปเดตสถานะ
    now := time.Now()
    quotation.Status = "accepted"
    quotation.AcceptedAt = &now
    config.DB.Save(&quotation)

    return c.JSON(fiber.Map{
        "message": "Quotation accepted successfully",
    })
}