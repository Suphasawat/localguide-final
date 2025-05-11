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
	FirstName string `gorm:"not null"`
	LastName  string `gorm:"not null"`
	Nickname  string `gorm:"not null"`
	BirthDate time.Time `gorm:"not null"`
	RoleID   uint   `gorm:"not null"`
	Role     Role   `gorm:"foreignKey:RoleID"`
	Nationality string `gorm:"not null"`
	Phone     string `gorm:"not null"`
	Sex 	 string `gorm:"not null"`
	Avatar     string `gorm:"not null"`
}

type Guide struct {
	gorm.Model
	UserID   uint   `gorm:"not null"`
	User     User   `gorm:"foreignKey:UserID"`
	Bio 	string 
	Experience string `gorm:"not null"`
	Language []Language `gorm:"many2many:guide_languages"`
	Status string `gorm:"not null"`
	Price  float64 `gorm:"not null"`
	Rating float64 `gorm:"not null"`
	AvarageReview float64 `gorm:"not null"`
	Availability string `gorm:"not null"`
	District string `gorm:"not null"`
	City string `gorm:"not null"`
	Province string `gorm:"not null"`
	TouristAttraction []TouristAttraction `gorm:"many2many:guide_tourist_attractions"`
}

type Language struct {
	gorm.Model
	Name string `gorm:"not null"`
	Guides []Guide `gorm:"many2many:guide_languages"`
}

type Role struct {
	gorm.Model
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
	Comment  string `gorm:"not null"`
}

type TouristAttraction struct {
	gorm.Model
	Name	 string `gorm:"not null"`
	Guides []Guide `gorm:"many2many:guide_tourist_attractions"`
}

type Permission struct {
	gorm.Model
	Name     string `gorm:"not null"`
	Roles []Role `gorm:"many2many:role_permissions"`
}

type Booking struct {
	gorm.Model
	UserID   uint   `gorm:"not null"`
	User     User   `gorm:"foreignKey:UserID"`
	GuideID  uint   `gorm:"not null"`
	Guide    Guide  `gorm:"foreignKey:GuideID"`
	Description string `gorm:"not null"`
	Status string `gorm:"not null"`
}

type Notification struct {
	gorm.Model
	UserID uint   `gorm:"not null"`
	User   User   `gorm:"foreignKey:UserID"`
	Message string `gorm:"not null"`
	IsRead bool `gorm:"not null"`
}

