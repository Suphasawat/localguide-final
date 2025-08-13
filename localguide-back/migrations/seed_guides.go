package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedGuides(db *gorm.DB) error {
    // ต้องมี User ก่อน ถึงจะสร้าง Guide ได้
    guides := []models.Guide{
        {
            UserID:      2,
            Bio:         "มัคคุเทศก์มืออาชีพ",
            Description: "ไกด์ท้องถิ่นที่มีประสบการณ์มากกว่า 5 ปี สามารถพูดได้หลายภาษา",
            Available:   true,
            Price:       2500.0,
            Rating:      4.8,
            ProvinceID:  1, // กรุงเทพมหานคร
        },
        {
            UserID:      3,
            Bio:         "ไกด์ท้องถิ่นเชียงใหม่",
            Description: "รู้จักเชียงใหม่ดีมาก ทั้งวัฒนธรรมและประเพณี",
            Available:   true,
            Price:       2000.0,
            Rating:      4.5,
            ProvinceID:  2, // เชียงใหม่
        },
        {
            UserID:      4,
            Bio:         "ไกด์ทะเลภูเก็ต",
            Description: "เชี่ยวชาญเรื่องกิจกรรมทางน้ำและเกาะต่างๆ",
            Available:   true,
            Price:       3000.0,
            Rating:      4.7,
            ProvinceID:  3, // ภูเก็ต
        },
    }

    // ข้อมูลภาษาที่แต่ละไกด์พูดได้
    guideLanguages := map[uint][]uint{
        2: {1, 2, 3}, // Guide ID 2 พูดได้: Thai, English, Chinese
        3: {1, 2, 4}, // Guide ID 3 พูดได้: Thai, English, Japanese
        4: {1, 2, 5}, // Guide ID 4 พูดได้: Thai, English, Korean
    }

    // ข้อมูลสถานที่ท่องเที่ยวที่แต่ละไกด์ให้บริการ
    guideTouristAttractions := map[uint][]uint{
        2: {1, 2, 3}, // Guide ID 2: วัดพระแก้ว, วัดอรุณ, ตลาดจตุจักร
        3: {4, 5},    // Guide ID 3: วัดดอยสุเทพ, ตลาดกาดหลวง
        4: {6, 7},    // Guide ID 4: หาดป่าตอง, เกาะพีพี
    }

    for _, guide := range guides {
        // ตรวจสอบว่า UserID มีอยู่จริง
        var user models.User
        if err := db.First(&user, guide.UserID).Error; err != nil {
            // ถ้าไม่มี User ให้ข้าม
            continue
        }

        // ตรวจสอบว่า ProvinceID มีอยู่จริง
        var province models.Province
        if err := db.First(&province, guide.ProvinceID).Error; err != nil {
            // ถ้าไม่มี Province ให้ข้าม
            continue
        }

        // สร้าง Guide
        var createdGuide models.Guide
        if err := db.FirstOrCreate(&createdGuide, models.Guide{UserID: guide.UserID}, guide).Error; err != nil {
            return err
        }

        // เพิ่มภาษาให้กับ Guide
        if languageIDs, exists := guideLanguages[guide.UserID]; exists {
            var languages []models.Language
            if err := db.Where("id IN ?", languageIDs).Find(&languages).Error; err == nil {
                // ลบความสัมพันธ์เก่าออกก่อน
                db.Model(&createdGuide).Association("Language").Clear()
                // เพิ่มความสัมพันธ์ใหม่
                db.Model(&createdGuide).Association("Language").Append(languages)
            }
        }

        // เพิ่มสถานที่ท่องเที่ยวให้กับ Guide
        if attractionIDs, exists := guideTouristAttractions[guide.UserID]; exists {
            var attractions []models.TouristAttraction
            if err := db.Where("id IN ?", attractionIDs).Find(&attractions).Error; err == nil {
                // ลบความสัมพันธ์เก่าออกก่อน
                db.Model(&createdGuide).Association("TouristAttraction").Clear()
                // เพิ่มความสัมพันธ์ใหม่
                db.Model(&createdGuide).Association("TouristAttraction").Append(attractions)
            }
        }
    }

    return nil
}