package models

import (
	"time"

	"gorm.io/gorm"
)

type AuthUser struct {
	gorm.Model 
	Email    string `gorm:"unique;not null" json:"email"`
	Password string `gorm:"not null" json:"password"`
}

type User struct {
	gorm.Model
	AuthUserID uint   `gorm:"not null"` 
	AuthUser  AuthUser `gorm:"foreignKey:AuthUserID"`
	FirstName string `gorm:"not null;default:''"` // ให้ค่าเริ่มต้นเป็น empty string
	LastName  string `gorm:"not null;default:''"` 
	Nickname  string 
	BirthDate *time.Time 
	RoleID   uint   `gorm:"not null;default:1"` // default เป็น role user
	Role     Role   `gorm:"foreignKey:RoleID"`
	Nationality string `gorm:"not null;default:''"` 
	Phone     string `gorm:"not null;default:''"` 
	Sex 	 string `gorm:"not null;default:''"` // หรือจะใช้ default:'unspecified'
	Avatar     string 
}

type Guide struct {
	gorm.Model
	UserID   uint   `gorm:"not null"`
	User     User   `gorm:"foreignKey:UserID"`	
	Bio      string  
	Experience string `gorm:"not null"` 
	Certification string `gorm:"not null"` // ใบอนุญาตไกด์
	Status string `gorm:"not null;default:'pending'"` // pending, approved, rejected
	Language []Language `gorm:"many2many:guide_languages"`
	Price  float64 `gorm:"not null"` 
	Rating float64 // เก็บค่าเฉลี่ยของ ratings จาก reviews
	Availability bool `gorm:"not null"` 
	District string `gorm:"not null"` 
	City string `gorm:"not null"` 
	Province string `gorm:"not null"` 
	TouristAttraction []TouristAttraction `gorm:"many2many:guide_tourist_attractions"` 
}

type Language struct {
	ID uint `gorm:"primaryKey"`
	Name string `gorm:"not null"`
	Guides []Guide `gorm:"many2many:guide_languages"`
}

type Role struct {
	ID uint `gorm:"primaryKey"`
	Name string `gorm:"not null"`
	Permissions []Permission `gorm:"many2many:role_permissions"`
}

type Review struct {
	gorm.Model
	GuideID  uint   `gorm:"not null"` 
	Guide    Guide  `gorm:"foreignKey:GuideID"`
	UserID   uint   `gorm:"not null"` 
	User     User   `gorm:"foreignKey:UserID"`
	Rating   float64 `gorm:"not null"` 
	Comment  string 
}

type TouristAttraction struct {
	ID uint `gorm:"primaryKey"`
	Name	 string `gorm:"not null"`
	Guides []Guide `gorm:"many2many:guide_tourist_attractions"`
}

type Permission struct {
	ID uint `gorm:"primaryKey"`
	Name     string `gorm:"not null"`
	Roles []Role `gorm:"many2many:role_permissions"`
}

type Booking struct {
	gorm.Model
	UserID   uint   `gorm:"not null"` 
	User     User   `gorm:"foreignKey:UserID"`
	GuideID  uint   `gorm:"not null"` 
	Guide    Guide  `gorm:"foreignKey:GuideID"`
	Description string 
	Status string `gorm:"not null"` 
}

type Notification struct {
	gorm.Model
	UserID uint   `gorm:"not null"`
	User   User   `gorm:"foreignKey:UserID"`
	Message string `gorm:"not null"`
	IsRead bool `gorm:"not null"`
}

