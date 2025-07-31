package controllers

import (
	"encoding/json"
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type DayItinerary struct {
	Day         int      `json:"day"`
	Title       string   `json:"title"`
	Activities  []string `json:"activities"`
	Attractions []string `json:"attractions"`
	StartTime   string   `json:"start_time"`
	EndTime     string   `json:"end_time"`
	Notes       string   `json:"notes"`
}

type PriceBreakdown struct {
	GuideService    float64 `json:"guide_service"`
	Transportation  float64 `json:"transportation"`
	Meals           float64 `json:"meals"`
	Accommodation   float64 `json:"accommodation"`
	Entrance        float64 `json:"entrance"`
	Other           float64 `json:"other"`
	OtherDetails    string  `json:"other_details"`
}

// CreateTripProposal - ไกด์สร้างข้อเสนอทริป
func CreateTripProposal(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	// หา guide จาก userID
	var guide models.Guide
	if err := config.DB.Where("user_id = ?", userID).First(&guide).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Guide not found",
		})
	}

	var req struct {
		TripRequestID    uint           `json:"trip_request_id"`
		Title            string         `json:"title"`
		Description      string         `json:"description"`
		Itinerary        []DayItinerary `json:"itinerary"`
		IncludedServices []string       `json:"included_services"`
		ExcludedServices []string       `json:"excluded_services"`
		TotalPrice       float64        `json:"total_price"`
		PriceBreakdown   PriceBreakdown `json:"price_breakdown"`
		ValidDays        int            `json:"valid_days"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// ตรวจสอบว่า trip request มีอยู่จริง
	var tripRequest models.TripRequest
	if err := config.DB.First(&tripRequest, req.TripRequestID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Trip request not found",
		})
	}

	// แปลง JSON
	itineraryJSON, _ := json.Marshal(req.Itinerary)
	includedJSON, _ := json.Marshal(req.IncludedServices)
	excludedJSON, _ := json.Marshal(req.ExcludedServices)
	priceBreakdownJSON, _ := json.Marshal(req.PriceBreakdown)

	// สร้าง trip proposal
	tripProposal := models.TripProposal{
		TripRequestID:    req.TripRequestID,
		GuideID:          guide.ID,
		Title:            req.Title,
		Description:      req.Description,
		Itinerary:        string(itineraryJSON),
		IncludedServices: string(includedJSON),
		ExcludedServices: string(excludedJSON),
		TotalPrice:       req.TotalPrice,
		PriceBreakdown:   string(priceBreakdownJSON),
		ValidUntil:       time.Now().AddDate(0, 0, req.ValidDays),
		Status:           "pending",
	}

	if err := config.DB.Create(&tripProposal).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create trip proposal",
		})
	}

	// อัปเดตสถานะ trip request
	tripRequest.Status = "matched"
	config.DB.Save(&tripRequest)

	return c.JSON(fiber.Map{
		"message":       "Trip proposal created successfully",
		"trip_proposal": tripProposal,
	})
}

// GetTripProposals - ดึงข้อเสนอทริปทั้งหมดของ trip request
func GetTripProposals(c *fiber.Ctx) error {
	tripRequestID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid trip request ID",
		})
	}

	var proposals []models.TripProposal
	if err := config.DB.Where("trip_request_id = ?", tripRequestID).
		Preload("Guide.User").
		Order("created_at DESC").
		Find(&proposals).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve proposals",
		})
	}

	return c.JSON(fiber.Map{
		"proposals": proposals,
	})
}

// AcceptTripProposal - user ยอมรับข้อเสนอ
func AcceptTripProposal(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	proposalID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid proposal ID",
		})
	}

	var proposal models.TripProposal
	if err := config.DB.Preload("TripRequest").
		First(&proposal, proposalID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Proposal not found",
		})
	}

	// ตรวจสอบว่าเป็นเจ้าของ trip request
	if proposal.TripRequest.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Access denied",
		})
	}

	// อัปเดตสถานะ
	proposal.Status = "accepted"
	config.DB.Save(&proposal)

	proposal.TripRequest.Status = "confirmed"
	config.DB.Save(&proposal.TripRequest)

	return c.JSON(fiber.Map{
		"message": "Proposal accepted successfully",
	})
}