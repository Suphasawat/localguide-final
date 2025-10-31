package migrations

import (
	"time"

	"localguide-back/models"

	"gorm.io/gorm"
)

// SeedReviews creates exactly 3 reviews per guide.
// Guides will receive three reviews with identical ratings so that
// the resulting average rating is exactly 3.0, 4.0 or 5.0 depending
// on the guide index (cycle through 3,4,5).
func SeedReviews(db *gorm.DB) error {
	var guides []models.Guide
	if err := db.Find(&guides).Error; err != nil {
		return err
	}

	// use a sample user to be the reviewer (user with AuthUserID 1 should exist from SeedUsers)
	var reviewer models.User
	if err := db.Where("auth_user_id = ?", 1).First(&reviewer).Error; err != nil {
		// fallback: try first user in users table
		if err := db.First(&reviewer).Error; err != nil {
			return err
		}
	}

	// ensure there is at least one province for trip requires
	var province models.Province
	if err := db.First(&province).Error; err != nil {
		return err
	}

	for i, guide := range guides {
		// skip if guide already has 3 or more reviews
		var existing int64
		db.Model(&models.TripReview{}).Where("guide_id = ?", guide.ID).Count(&existing)
		if existing >= 3 {
			continue
		}

		// determine target average: cycle 3,4,5
		target := 3
		switch i % 3 {
		case 0:
			target = 3
		case 1:
			target = 4
		case 2:
			target = 5
		}

		// Create three separate TripRequire -> TripOffer -> TripBooking chains so reviews can reference valid bookings
		for j := 0; j < 3; j++ {
			// TripRequire
			req := models.TripRequire{
				UserID:     reviewer.ID,
				ProvinceID: province.ID,
				Title:      "Seed trip require",
				Description: "Auto-generated seed require for reviews",
				MinPrice:   500,
				MaxPrice:   1500,
				StartDate:  time.Now(),
				EndDate:    time.Now().AddDate(0, 0, 1),
				Days:       1,
			}
			if err := db.Create(&req).Error; err != nil {
				return err
			}

			// TripOffer
			offer := models.TripOffer{
				TripRequireID: req.ID,
				GuideID:       guide.ID,
				Title:         "Seed offer",
				Description:   "Auto-generated seed offer",
				Itinerary:     "[]",
				IncludedServices: "[]",
				Status:        "accepted",
			}
			if err := db.Create(&offer).Error; err != nil {
				return err
			}

			// TripBooking
			booking := models.TripBooking{
				TripOfferID: offer.ID,
				UserID:      reviewer.ID,
				GuideID:     guide.ID,
				StartDate:   time.Now(),
				TotalAmount: 1000,
				Status:      "trip_completed",
			}
			if err := db.Create(&booking).Error; err != nil {
				return err
			}

			// TripReview
			review := models.TripReview{
				TripBookingID: booking.ID,
				UserID:        reviewer.ID,
				GuideID:       guide.ID,
				Rating:        float64(target),
				Comment:       "Auto-generated seed review",
				ServiceRating: float64(target),
				KnowledgeRating: float64(target),
				CommunicationRating: float64(target),
				PunctualityRating: float64(target),
				IsVerified:    true,
			}

			if err := db.Create(&review).Error; err != nil {
				return err
			}
		}

		// update guide rating to exact target
		targetF := float64(target)
		if err := db.Model(&models.Guide{}).Where("id = ?", guide.ID).Update("rating", targetF).Error; err != nil {
			return err
		}
	}

	return nil
}
