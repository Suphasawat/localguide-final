package migrations

import (
	"localguide-back/models"
	"time"

	"gorm.io/gorm"
)

func SeedTripData(db *gorm.DB) error {
	// ตรวจสอบว่ามีข้อมูลแล้วหรือยัง
	var count int64
	db.Model(&models.TripRequire{}).Count(&count)
	if count > 0 {
		return nil // มีข้อมูลแล้ว ไม่ต้อง seed
	}

	// สร้าง TripRequire ตัวอย่าง
	startDate := time.Now().AddDate(0, 0, 7)  // 7 วันข้างหน้า
	endDate := time.Now().AddDate(0, 0, 10)   // 10 วันข้างหน้า

	tripRequire := models.TripRequire{
		UserID:       1, // สมมติว่า user ID 1 เป็น tourist
		ProvinceID:   1, // สมมติว่า province ID 1 มีอยู่
		Title:        "ต้องการไกด์เที่ยวเชียงใหม่ 3 วัน 2 คืน",
		Description:  "ต้องการไกด์พาเที่ยวเชียงใหม่ ดูวัด ตลาด และธรรมชาติ สำหรับครอบครัว 4 คน",
		MinPrice:     8000,
		MaxPrice:     12000,
		StartDate:    startDate,
		EndDate:      endDate,
		Days:         3,
		MinRating:    4.0,
		GroupSize:    4,
		Requirements: "ต้องการไกด์ที่พูดภาษาอังกฤษได้ และมีรถรับส่ง",
		Status:       "open",
	}

	if err := db.Create(&tripRequire).Error; err != nil {
		return err
	}

	return nil
}
