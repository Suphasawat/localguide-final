package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedLanguages(db *gorm.DB) {
	languages := []models.Language{
		{Name: "Thai"},
		{Name: "English"},
		{Name: "Chinese"},
		{Name: "Japanese"},
		{Name: "Korean"},
		{Name: "French"},
		{Name: "German"},
		{Name: "Spanish"},
		{Name: "Italian"},
		{Name: "Russian"},
	}

	for _, language := range languages {
		db.FirstOrCreate(&language, models.Language{Name: language.Name})
	}
}
