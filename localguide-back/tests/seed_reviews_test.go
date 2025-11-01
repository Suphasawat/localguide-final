package tests

import (
	"testing"

	"localguide-back/config"
	"localguide-back/migrations"
	"localguide-back/models"

	"github.com/stretchr/testify/assert"
)

func TestSeedReviewsCreatesThreePerGuideWithExactAverages(t *testing.T) {
	db := setupTestDB()
	config.DB = db

	// Migrate and seed minimal required data
	db.AutoMigrate(&models.AuthUser{}, &models.User{}, &models.Province{}, &models.Guide{}, &models.TripRequire{}, &models.TripOffer{}, &models.TripBooking{}, &models.TripReview{})

	// Seed one user for reviewer (auth_user_id=1)
	a := models.AuthUser{Email: "user1@gmail.com", Password: "x"}
	db.Create(&a)
	u := models.User{AuthUserID: a.ID, FirstName: "John", LastName: "Doe", RoleID: 1}
	db.Create(&u)

	// Provinces
	p := models.Province{Name: "Bangkok", Region: "Central"}
	db.Create(&p)

	// Create three guides
	for i := 0; i < 3; i++ {
		au := models.AuthUser{Email: "g" + string(rune('a'+i)) + "@mail.com", Password: "x"}
		db.Create(&au)
		usr := models.User{AuthUserID: au.ID, FirstName: "G", LastName: "X", RoleID: 2}
		db.Create(&usr)
		g := models.Guide{UserID: usr.ID, ProvinceID: p.ID, Description: "d", Available: true}
		db.Create(&g)
	}

	// Run seeder
	err := migrations.SeedReviews(db)
	assert.NoError(t, err)

	// Verify per-guide counts and averages 3,4,5
	var guides []models.Guide
	db.Find(&guides)
	assert.Equal(t, 3, len(guides))

	for i, g := range guides {
		var count int64
		db.Model(&models.TripReview{}).Where("guide_id = ?", g.ID).Count(&count)
		assert.Equal(t, int64(3), count)

		// Expected cycle 3,4,5
		expected := 3 + (i % 3)
		assert.InDelta(t, float64(expected), g.Rating, 0.001)
	}
}
