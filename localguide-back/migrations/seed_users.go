package migrations

import (
	"localguide-back/models"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedUsers(db *gorm.DB) error {
	// สร้าง AuthUser ก่อน
	authUsers := []models.AuthUser{
		{
			Email:    "user1@gmail.com",
			Password: hashPassword("12345678Za!"),
		},
		{
			Email:    "guide1@gmail.com",
			Password: hashPassword("12345678Za!"),
		},
		{
			Email:    "guide2@gmail.com",
			Password: hashPassword("12345678Za!"),
		},
		{
			Email:    "guide3@gmail.com",
			Password: hashPassword("12345678Za!"),
		},
		{
			Email:    "admin@gmail.com",
			Password: hashPassword("12345678Za!"),
		},
	}

	// สร้าง AuthUser
	for _, authUser := range authUsers {
		if err := db.FirstOrCreate(&authUser, models.AuthUser{Email: authUser.Email}).Error; err != nil {
			return err
		}
	}

	// สร้าง sample birth dates
	birthDate1 := time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC)
	birthDate2 := time.Date(1985, 8, 20, 0, 0, 0, 0, time.UTC)
	birthDate3 := time.Date(1992, 12, 10, 0, 0, 0, 0, time.UTC)

	// สร้าง User profiles
	users := []models.User{
		{
			AuthUserID:  1,
			FirstName:   "John",
			LastName:    "Doe",
			Nickname:    "Johnny",
			BirthDate:   &birthDate1,
			Phone:       "0812345678",
			RoleID:      1, // user role
			Nationality: "American",
			Sex:         "Male",
		},
		{
			AuthUserID:  2,
			FirstName:   "สมชาย",
			LastName:    "ใจดี",
			Nickname:    "ชาย",
			BirthDate:   &birthDate2,
			Phone:       "0823456789",
			RoleID:      2, // guide role
			Nationality: "Thai",
			Sex:         "Male",
		},
		{
			AuthUserID:  3,
			FirstName:   "สมหญิง",
			LastName:    "รักเที่ยว",
			Nickname:    "หญิง",
			BirthDate:   &birthDate3,
			Phone:       "0834567890",
			RoleID:      2, // guide role
			Nationality: "Thai",
			Sex:         "Female",
		},
		{
			AuthUserID:  4,
			FirstName:   "สมปอง",
			LastName:    "ท่องเที่ยว",
			Nickname:    "ปอง",
			BirthDate:   nil, // ไม่ระบุวันเกิด
			Phone:       "0845678900",
			RoleID:      2, // guide role
			Nationality: "Thai",
			Sex:         "Male",
		},
		{
			AuthUserID:  5,
			FirstName:   "Admin",
			LastName:    "System",
			Nickname:    "Admin",
			BirthDate:   nil, // ไม่ระบุวันเกิด
			Phone:       "0845678901",
			RoleID:      3, // admin role
			Nationality: "Thai",
			Sex:         "Other",
		},
	}

	// สร้าง User profiles
	for _, user := range users {
		if err := db.FirstOrCreate(&user, models.User{AuthUserID: user.AuthUserID}).Error; err != nil {
			return err
		}
	}

	return nil
}

// helper function สำหรับ hash password
func hashPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return ""
	}
	return string(hashedPassword)
}