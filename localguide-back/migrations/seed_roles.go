package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedRoles(db *gorm.DB) error {
	roles := []models.Role{
		{Name: "user"},  // ID = 1
		{Name: "guide"}, // ID = 2
		{Name: "admin"}, // ID = 3
	}

	for _, role := range roles {
		if err := db.FirstOrCreate(&role, models.Role{Name: role.Name}).Error; err != nil {
			return err
		}
	}

	return nil
}
