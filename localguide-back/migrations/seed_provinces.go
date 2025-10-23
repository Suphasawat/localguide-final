package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedProvinces(db *gorm.DB) error {
    provinces := []models.Province{
        {Name: "เชียงราย", Region: "ภาคเหนือ"},
        {Name: "น่าน", Region: "ภาคเหนือ"},
        {Name: "พะเยา", Region: "ภาคเหนือ"},
        {Name: "ลำปาง", Region: "ภาคเหนือ"},
        {Name: "ลำพูน", Region: "ภาคเหนือ"},
        {Name: "แพร่", Region: "ภาคเหนือ"},
        {Name: "แม่ฮ่องสอน", Region: "ภาคเหนือ"},
        {Name: "อุตรดิตถ์", Region: "ภาคเหนือ"},
        {Name: "ตาก", Region: "ภาคเหนือ"},
        {Name: "สุโขทัย", Region: "ภาคเหนือ"},
        {Name: "พิษณุโลก", Region: "ภาคเหนือ"},
        {Name: "พิจิตร", Region: "ภาคเหนือ"},
        {Name: "กำแพงเพชร", Region: "ภาคเหนือ"},
        {Name: "นครสวรรค์", Region: "ภาคเหนือ"},
        {Name: "อุทัยธานี", Region: "ภาคเหนือ"},
        {Name: "เพชรบูรณ์", Region: "ภาคเหนือ"},
    }
    
    for _, province := range provinces {
        if err := db.FirstOrCreate(&province, models.Province{Name: province.Name}).Error; err != nil {
            return err
        }
    }

    return nil
}