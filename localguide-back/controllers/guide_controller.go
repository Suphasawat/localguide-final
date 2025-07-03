package controllers

import (
	"localguide-back/config"
	"localguide-back/models"

	"github.com/gofiber/fiber/v2"
)

// GetGuides returns all guides with their related information
func GetGuides(c *fiber.Ctx) error {
	var guides []models.Guide
	
	// Query guides with related data
	result := config.DB.
		Preload("User").
		Preload("Language").
		Preload("TouristAttraction").
		Find(&guides)
	
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch guides",
		})
	}

	// Format the response
	var response []fiber.Map
	for _, guide := range guides {
		// Calculate average rating and review count
		var reviews []models.Review
		config.DB.Where("guide_id = ?", guide.ID).Find(&reviews)
		
		var totalRating float64
		for _, review := range reviews {
			totalRating += review.Rating
		}
		averageRating := float64(0)
		if len(reviews) > 0 {
			averageRating = totalRating / float64(len(reviews))
		}

		// Format languages
		languages := make([]fiber.Map, len(guide.Language))
		for i, lang := range guide.Language {
			languages[i] = fiber.Map{
				"id": lang.ID,
				"name": lang.Name,
			}
		}

		// Format tourist attractions
		attractions := make([]fiber.Map, len(guide.TouristAttraction))
		for i, attr := range guide.TouristAttraction {
			attractions[i] = fiber.Map{
				"id": attr.ID,
				"name": attr.Name,
			}
		}

		response = append(response, fiber.Map{
			"id": guide.ID,
			"user": fiber.Map{
				"id": guide.User.ID,
				"firstName": guide.User.FirstName,
				"lastName": guide.User.LastName,
				"nickname": guide.User.Nickname,
				"avatar": guide.User.Avatar,
			},
			"bio": guide.Bio,
			"experience": guide.Experience,
			"languages": languages,
			"price": guide.Price,
			"rating": guide.Rating,
			"averageReview": averageRating,
			"reviewCount": len(reviews),
			"district": guide.District,
			"city": guide.City,
			"province": guide.Province,
			"touristAttractions": attractions,
			"status": guide.Status,
		})
	}

	return c.JSON(response)
}

// GetGuideByID returns a specific guide by ID
func GetGuideByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var guide models.Guide

	result := config.DB.
		Preload("User").
		Preload("Language").
		Preload("TouristAttraction").
		First(&guide, id)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Guide not found",
		})
	}

	// Get reviews
	var reviews []models.Review
	config.DB.Where("guide_id = ?", guide.ID).Find(&reviews)
	
	var totalRating float64
	for _, review := range reviews {
		totalRating += review.Rating
	}
	averageRating := float64(0)
	if len(reviews) > 0 {
		averageRating = totalRating / float64(len(reviews))
	}

	// Format languages
	languages := make([]fiber.Map, len(guide.Language))
	for i, lang := range guide.Language {
		languages[i] = fiber.Map{
			"id": lang.ID,
			"name": lang.Name,
		}
	}

	// Format tourist attractions
	attractions := make([]fiber.Map, len(guide.TouristAttraction))
	for i, attr := range guide.TouristAttraction {
		attractions[i] = fiber.Map{
			"id": attr.ID,
			"name": attr.Name,
		}
	}

	return c.JSON(fiber.Map{
		"id": guide.ID,
		"user": fiber.Map{
			"id": guide.User.ID,
			"firstName": guide.User.FirstName,
			"lastName": guide.User.LastName,
			"nickname": guide.User.Nickname,
			"avatar": guide.User.Avatar,
		},
		"bio": guide.Bio,
		"experience": guide.Experience,
		"languages": languages,
		"price": guide.Price,
		"rating": guide.Rating,
		"averageReview": averageRating,
		"reviewCount": len(reviews),
		"district": guide.District,
		"city": guide.City,
		"province": guide.Province,
		"touristAttractions": attractions,
		"status": guide.Status,
	})
}

func CreateGuide(c *fiber.Ctx) error {
	var req models.Guide
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := config.DB.Where("user_id = ?", req.UserID).First(&models.Guide{}).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Guide already exists for this user"})
	}

	// Validate required fields
	if req.UserID == 0 || req.Bio == "" || req.Experience == "" || req.Price <= 0 || len(req.Language) == 0  || req.District == "" || req.City == "" || req.Province == "" || req.Certification == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing required fields"})
	}

	// Create guide
	if err := config.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create guide"})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}