package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedProvinces(db *gorm.DB) error {
    provinces := []models.Province{
        {Name: "กรุงเทพมหานคร", Region: "ภาคกลาง"},
        {Name: "เชียงใหม่", Region: "ภาคเหนือ"},
        {Name: "ภูเก็ต", Region: "ภาคใต้"},
        {Name: "เชียงราย", Region: "ภาคเหนือ"},
        {Name: "ชลบุรี", Region: "ภาคกลาง"}, 
        {Name: "กระบี่", Region: "ภาคใต้"},
        {Name: "สุโขทัย", Region: "ภาคเหนือ"},
        {Name: "พระนครศรีอยุธยา", Region: "ภาคกลาง"},
        {Name: "สุราษฎร์ธานี", Region: "ภาคใต้"}, 
        {Name: "ประจวบคีรีขันธ์", Region: "ภาคใต้"}, 
    }

    for _, province := range provinces {
        if err := db.FirstOrCreate(&province, models.Province{Name: province.Name}).Error; err != nil {
            return err
        }
    }

    return nil
}