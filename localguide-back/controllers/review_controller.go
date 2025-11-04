package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// CreateReview - User สร้างรีวิวให้กับไกด์หลังทริปเสร็จ
func CreateReview(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input struct {
		TripBookingID       uint    `json:"trip_booking_id"`
		Rating              float64 `json:"rating"`
		Comment             string  `json:"comment"`
		ServiceRating       float64 `json:"service_rating"`
		KnowledgeRating     float64 `json:"knowledge_rating"`
		CommunicationRating float64 `json:"communication_rating"`
		PunctualityRating   float64 `json:"punctuality_rating"`
		Images              string  `json:"images"`
		IsAnonymous         bool    `json:"is_anonymous"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate ratings (1-5)
	if input.Rating < 1 || input.Rating > 5 ||
		input.ServiceRating < 1 || input.ServiceRating > 5 ||
		input.KnowledgeRating < 1 || input.KnowledgeRating > 5 ||
		input.CommunicationRating < 1 || input.CommunicationRating > 5 ||
		input.PunctualityRating < 1 || input.PunctualityRating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Ratings must be between 1 and 5",
		})
	}

	// ตรวจสอบว่า booking มีอยู่จริงและเป็นของ user คนนี้
	var booking models.TripBooking
	if err := config.DB.Preload("TripOffer.Guide").First(&booking, input.TripBookingID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Booking not found",
		})
	}

	if booking.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You are not authorized to review this booking",
		})
	}

	// ตรวจสอบว่าทริปต้องเสร็จสิ้นแล้ว
	if booking.Status != "trip_completed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Can only review completed trips",
		})
	}

	// ตรวจสอบว่ายังไม่เคยรีวิว booking นี้
	var existingReview models.TripReview
	if err := config.DB.Where("trip_booking_id = ?", input.TripBookingID).First(&existingReview).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "You have already reviewed this trip",
		})
	}

	// สร้าง review
	review := models.TripReview{
		TripBookingID:       input.TripBookingID,
		UserID:              userID,
		GuideID:             booking.TripOffer.GuideID,
		Rating:              input.Rating,
		Comment:             input.Comment,
		ServiceRating:       input.ServiceRating,
		KnowledgeRating:     input.KnowledgeRating,
		CommunicationRating: input.CommunicationRating,
		PunctualityRating:   input.PunctualityRating,
		Images:              input.Images,
		IsAnonymous:         input.IsAnonymous,
		IsVerified:          true,
	}

	if err := config.DB.Create(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create review",
		})
	}

	// อัพเดทคะแนนเฉลี่ยของไกด์
	updateGuideRating(booking.TripOffer.GuideID)

	// โหลด review พร้อม relations
	config.DB.Preload("User").Preload("Guide.User").Preload("TripBooking").First(&review, review.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Review created successfully",
		"review":  review,
	})
}

// GetGuideReviews - ดูรีวิวทั้งหมดของไกด์
func GetGuideReviews(c *fiber.Ctx) error {
	guideID, err := strconv.Atoi(c.Params("id"))
	if err != nil || guideID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid guide ID"})
	}

	var reviews []models.TripReview
	query := config.DB.Preload("User").Preload("TripBooking").
		Where("guide_id = ?", guideID).
		Order("created_at DESC")

	if err := query.Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch reviews",
		})
	}

	// คำนวณสถิติรีวิว
	var stats struct {
		TotalReviews        int64
		AverageRating       float64
		AverageService      float64
		AverageKnowledge    float64
		AverageCommunication float64
		AveragePunctuality  float64
		FiveStars           int64
		FourStars           int64
		ThreeStars          int64
		TwoStars            int64
		OneStar             int64
	}

	config.DB.Model(&models.TripReview{}).Where("guide_id = ?", guideID).Count(&stats.TotalReviews)
	
	if stats.TotalReviews > 0 {
		config.DB.Model(&models.TripReview{}).Where("guide_id = ?", guideID).
			Select("AVG(rating) as average_rating, AVG(service_rating) as average_service, " +
				"AVG(knowledge_rating) as average_knowledge, AVG(communication_rating) as average_communication, " +
				"AVG(punctuality_rating) as average_punctuality").
			Scan(&stats)
		
		config.DB.Model(&models.TripReview{}).Where("guide_id = ? AND rating >= 4.5", guideID).Count(&stats.FiveStars)
		config.DB.Model(&models.TripReview{}).Where("guide_id = ? AND rating >= 3.5 AND rating < 4.5", guideID).Count(&stats.FourStars)
		config.DB.Model(&models.TripReview{}).Where("guide_id = ? AND rating >= 2.5 AND rating < 3.5", guideID).Count(&stats.ThreeStars)
		config.DB.Model(&models.TripReview{}).Where("guide_id = ? AND rating >= 1.5 AND rating < 2.5", guideID).Count(&stats.TwoStars)
		config.DB.Model(&models.TripReview{}).Where("guide_id = ? AND rating < 1.5", guideID).Count(&stats.OneStar)
	}

	return c.JSON(fiber.Map{
		"reviews": reviews,
		"stats":   stats,
	})
}

// GetMyReviews - User ดูรีวิวที่เขียนเอง
func GetMyReviews(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var reviews []models.TripReview
	if err := config.DB.Preload("Guide.User").Preload("TripBooking").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch reviews",
		})
	}

	return c.JSON(fiber.Map{
		"reviews": reviews,
	})
}

// UpdateReview - User แก้ไขรีวิวของตัวเอง
func UpdateReview(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	reviewID, err := strconv.Atoi(c.Params("id"))
	if err != nil || reviewID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid review ID"})
	}

	var input struct {
		Rating              float64 `json:"rating"`
		Comment             string  `json:"comment"`
		ServiceRating       float64 `json:"service_rating"`
		KnowledgeRating     float64 `json:"knowledge_rating"`
		CommunicationRating float64 `json:"communication_rating"`
		PunctualityRating   float64 `json:"punctuality_rating"`
		Images              string  `json:"images"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var review models.TripReview
	if err := config.DB.First(&review, reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Review not found",
		})
	}

	if review.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only edit your own reviews",
		})
	}

	// Validate ratings
	if input.Rating < 1 || input.Rating > 5 ||
		input.ServiceRating < 1 || input.ServiceRating > 5 ||
		input.KnowledgeRating < 1 || input.KnowledgeRating > 5 ||
		input.CommunicationRating < 1 || input.CommunicationRating > 5 ||
		input.PunctualityRating < 1 || input.PunctualityRating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Ratings must be between 1 and 5",
		})
	}

	review.Rating = input.Rating
	review.Comment = input.Comment
	review.ServiceRating = input.ServiceRating
	review.KnowledgeRating = input.KnowledgeRating
	review.CommunicationRating = input.CommunicationRating
	review.PunctualityRating = input.PunctualityRating
	review.Images = input.Images

	if err := config.DB.Save(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update review",
		})
	}

	// อัพเดทคะแนนเฉลี่ยของไกด์
	updateGuideRating(review.GuideID)

	config.DB.Preload("User").Preload("Guide.User").Preload("TripBooking").First(&review, review.ID)

	return c.JSON(fiber.Map{
		"message": "Review updated successfully",
		"review":  review,
	})
}

// DeleteReview - User ลบรีวิวของตัวเอง
func DeleteReview(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	reviewID, err := strconv.Atoi(c.Params("id"))
	if err != nil || reviewID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid review ID"})
	}

	var review models.TripReview
	if err := config.DB.First(&review, reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Review not found",
		})
	}

	if review.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only delete your own reviews",
		})
	}

	guideID := review.GuideID

	if err := config.DB.Delete(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete review",
		})
	}

	// อัพเดทคะแนนเฉลี่ยของไกด์
	updateGuideRating(guideID)

	return c.JSON(fiber.Map{
		"message": "Review deleted successfully",
	})
}

// GuideRespondToReview - ไกด์ตอบกลับรีวิว
func GuideRespondToReview(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	reviewID, err := strconv.Atoi(c.Params("id"))
	if err != nil || reviewID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid review ID"})
	}

	var input struct {
		Response string `json:"response"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// ตรวจสอบว่า user เป็น guide
	var guide models.Guide
	if err := config.DB.Where("user_id = ?", userID).First(&guide).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only guides can respond to reviews",
		})
	}

	var review models.TripReview
	if err := config.DB.First(&review, reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Review not found",
		})
	}

	// ตรวจสอบว่ารีวิวนี้เป็นของไกด์คนนี้
	if review.GuideID != guide.ID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only respond to your own reviews",
		})
	}

	now := time.Now()
	review.ResponseFromGuide = input.Response
	review.RespondedAt = &now

	if err := config.DB.Save(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save response",
		})
	}

	config.DB.Preload("User").Preload("Guide.User").Preload("TripBooking").First(&review, review.ID)

	return c.JSON(fiber.Map{
		"message": "Response saved successfully",
		"review":  review,
	})
}

// MarkReviewHelpful - ผู้ใช้กด helpful บนรีวิว
func MarkReviewHelpful(c *fiber.Ctx) error {
	reviewID, err := strconv.Atoi(c.Params("id"))
	if err != nil || reviewID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid review ID"})
	}

	var review models.TripReview
	if err := config.DB.First(&review, reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Review not found",
		})
	}

	review.HelpfulCount++
	if err := config.DB.Save(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update review",
		})
	}

	return c.JSON(fiber.Map{
		"message":       "Marked as helpful",
		"helpful_count": review.HelpfulCount,
	})
}

// Helper function to update guide's average rating
func updateGuideRating(guideID uint) error {
	var avgRating float64
	if err := config.DB.Model(&models.TripReview{}).
		Where("guide_id = ?", guideID).
		Select("COALESCE(AVG(rating), 0)").
		Scan(&avgRating).Error; err != nil {
		return err
	}

	return config.DB.Model(&models.Guide{}).
		Where("id = ?", guideID).
		Update("rating", avgRating).Error
}

// GetReviewableBookings - ดู bookings ที่ยังไม่ได้รีวิว
func GetReviewableBookings(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var bookings []models.TripBooking
	
	// หา bookings ที่ completed แต่ยังไม่มีรีวิว
	if err := config.DB.Preload("TripOffer.Guide.User").
		Preload("TripRequire").
		Joins("LEFT JOIN trip_reviews ON trip_reviews.trip_booking_id = trip_bookings.id").
		Where("trip_bookings.user_id = ? AND trip_bookings.status = ? AND trip_reviews.id IS NULL", userID, "completed").
		Find(&bookings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch bookings",
		})
	}

	return c.JSON(fiber.Map{
		"bookings": bookings,
	})
}
