package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedGuides(db *gorm.DB) error {
    // ต้องมี User ก่อน ถึงจะสร้าง Guide ได้
    // ตัวอย่าง Guide data (จะต้องมี UserID ที่มีอยู่จริง)
    guides := []models.Guide{
        {
            UserID: 1, // ต้องมี User ID 1 อยู่ก่อน
            Bio: "มัคคุเทศก์มืออาชีพ",
            Description: "ไกด์ท้องถิ่นที่มีประสบการณ์มากกว่า 5 ปี",
            Available: true,
            Price: 2500.0,
            Rating: 4.8,
        
            ProvinceID: 1,
        },
        {
            UserID: 2,
            Bio: "ไกด์ท้องถิ่นเชียงใหม่",
            Description: "รู้จักเชียงใหม่ดีมาก ทั้งวัฒนธรรมและประเพณี",
            Available: true,
            Price: 2000.0,
            Rating: 4.5,
            ProvinceID: 2,
        },
        {
            UserID: 3,
            Bio: "ไกด์ทะเลภูเก็ต",
            Description: "เชี่ยวชาญเรื่องกิจกรรมทางน้ำและเกาะต่างๆ",
            Available: true,
            Price: 3000.0,
            Rating: 4.7,
            ProvinceID: 3,
        },
    }

    for _, guide := range guides {
        // ตรวจสอบว่า UserID มีอยู่จริง
        var user models.User
        if err := db.First(&user, guide.UserID).Error; err != nil {
            // ถ้าไม่มี User ให้ข้าม
            continue
        }

        if err := db.FirstOrCreate(&guide, models.Guide{UserID: guide.UserID}).Error; err != nil {
            return err
        }
    }

    return nil
}