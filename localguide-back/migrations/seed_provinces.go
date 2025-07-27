package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedProvinces(db *gorm.DB) error {
    provinces := []models.Province{
        {ID: 1, Name: "กรุงเทพมหานคร", Region: "ภาคกลาง"},
        {ID: 2, Name: "เชียงใหม่", Region: "ภาคเหนือ"},
        {ID: 3, Name: "ภูเก็ต", Region: "ภาคใต้"},
        {ID: 4, Name: "เชียงราย", Region: "ภาคเหนือ"},
        {ID: 5, Name: "ชลบุรี", Region: "ภาคกลาง"}, // พัทยาอยู่ในชลบุรี
        {ID: 6, Name: "กระบี่", Region: "ภาคใต้"},
        {ID: 7, Name: "สุโขทัย", Region: "ภาคเหนือ"},
        {ID: 8, Name: "พระนครศรีอยุธยา", Region: "ภาคกลาง"},
        {ID: 9, Name: "สุราษฎร์ธานี", Region: "ภาคใต้"}, // เกาะสมุยอยู่ในสุราษฎร์ธานี
        {ID: 10, Name: "ประจวบคีรีขันธ์", Region: "ภาคใต้"}, // หัวหินอยู่ในประจวบฯ
    }

    for _, province := range provinces {
        if err := db.FirstOrCreate(&province, models.Province{Name: province.Name}).Error; err != nil {
            return err
        }
    }

    return nil
}