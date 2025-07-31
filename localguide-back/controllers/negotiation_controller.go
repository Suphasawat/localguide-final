package controllers

import (
	"encoding/json"
	"localguide-back/config"
	"localguide-back/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func CreateNegotiation(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	proposalID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid proposal ID",
		})
	}

	var req struct {
		MessageType string `json:"message_type"`
		Message     string `json:"message"`
		ProposalChanges map[string]interface{} `json:"proposal_changes"`
		NewPrice *float64 `json:"new_price"`
		NewItinerary string `json:"new_itinerary"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var proposal models.TripProposal
	if err := config.DB.Preload("TripRequest").Preload("Guide").First(&proposal, proposalID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Proposal not found",
		})
	}

	var senderType string
    if proposal.TripRequest.UserID == userID {
        senderType = "user"
    } else if proposal.Guide.UserID == userID {
        senderType = "guide"
    } else {
        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "error": "Access denied",
        })
    }

	changesJSON := ""
	if req.ProposalChanges != nil {
		changesBytes,_ := json.Marshal(req.ProposalChanges)
		changesJSON = string(changesBytes)
	}

	newItineraryJSON := ""
	if req.NewItinerary != ""{
		itineraryBytes, _ := json.Marshal(req.NewItinerary)
		newItineraryJSON = string(itineraryBytes)
	}

	negotiation := models.Negotiation{
        TripProposalID:  uint(proposalID),
        SenderID:        userID,
        SenderType:      senderType,
        MessageType:     req.MessageType,
        Message:         req.Message,
        ProposedChanges: changesJSON,
        NewPrice:        req.NewPrice,
        NewItinerary:    newItineraryJSON,
        IsRead:          false,
    }

	if err := config.DB.Create(&negotiation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create negotiation",
		})
	}

	proposal.Status = "negotiating"
	config.DB.Save(&proposal)

	return c.JSON(fiber.Map{
		"message": "Negotiation created successfully",
		"negotiation": negotiation,
	})
}

// GetNegotiations - ดึงประวัติการเจรจา
func GetNegotiations(c *fiber.Ctx) error {
    proposalID, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid proposal ID",
        })
    }

    var negotiations []models.Negotiation
    if err := config.DB.Where("trip_proposal_id = ?", proposalID).
        Order("created_at ASC").
        Find(&negotiations).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve negotiations",
        })
    }

    return c.JSON(fiber.Map{
        "negotiations": negotiations,
    })
}