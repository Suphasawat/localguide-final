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
	Certification []GuideCertification `gorm:"foreignKey:GuideID"`
	Status string `gorm:"not null;default:'pending'"` // pending, approved, rejected
	Language []Language `gorm:"many2many:guide_languages"`
	Price  float64 `gorm:"not null"` 
	Rating float64 // เก็บค่าเฉลี่ยของ ratings จาก reviews
	District string `gorm:"not null"` 
	City string `gorm:"not null"` 
	Province string `gorm:"not null"` 
	TouristAttraction []TouristAttraction `gorm:"many2many:guide_tourist_attractions"` 
}

type GuideCertification struct {
	ID uint `gorm:"primaryKey"`
	GuideID uint `gorm:"not null"`
	Guide Guide `gorm:"foreignKey:GuideID"`
	ImagePath string `gorm:"not null"` // path to the certification image
	Description string `gorm:"not null"` // description of the certification
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
	Status string `gorm:"not null"` // pending, confirmed, completed, cancelled
}

type Notification struct {
	gorm.Model
	UserID uint   `gorm:"not null"`
	User   User   `gorm:"foreignKey:UserID"`
	Message string `gorm:"not null"`
	IsRead bool `gorm:"not null"`
}

type Unavailable struct {
	gorm.Model
	GuideID uint   `gorm:"not null"`
	Guide   Guide  `gorm:"foreignKey:GuideID"`
	StartTime time.Time `gorm:"not null"`
	EndTime   time.Time `gorm:"not null"`
	Available bool `gorm:"not null"` // true = available, false = not available
}

type Payment struct {
	gorm.Model
	BookingID uint   `gorm:"not null"`
	Booking   Booking `gorm:"foreignKey:BookingID"`
	Amount    float64 `gorm:"not null"`
	PaymentMethod string `gorm:"not null"` // e.g., credit card, bank transfer
	TransactionID string `gorm:"not null;unique"` // unique transaction identifier
	TransactionDate time.Time `gorm:"not null"` // date of the transaction
	Status    string  `gorm:"not null"` // pending, completed, failed
}

type GuideVertification struct {
	gorm.Model
	GuideID uint   `gorm:"not null"`
	Guide   Guide  `gorm:"foreignKey:GuideID"`
	Certification string `gorm:"not null"` // ใบอนุญาตไกด์
	Status string `gorm:"not null;default:'pending'"` // pending, approved, rejected
	ReviewedBy uint `gorm:"not null"` // ID of the admin who reviewed the verification
	ReviewedAt time.Time `gorm:"not null"` // date when the verification was reviewed
	Comments string // comments from the admin regarding the verification
}

type GuidingTransaction struct {
	gorm.Model
	GuideID uint   `gorm:"not null"`
	Guide   Guide  `gorm:"foreignKey:GuideID"`
	TouristAttractionID uint `gorm:"not null"`
	TouristAttraction TouristAttraction `gorm:"foreignKey:TouristAttractionID"`
	BookingID uint `gorm:"not null"`
	Booking Booking `gorm:"foreignKey:BookingID"`
	StartTime time.Time `gorm:"not null"`
	EndTime time.Time `gorm:"not null"`
	TotalPrice float64 `gorm:"not null"` // total price for the guiding service
	Status string `gorm:"not null"` // pending, completed, cancelled
}

type ChatRoom struct {
	gorm.Model
	UserID   uint        `gorm:"not null"` // ID ของผู้ใช้ที่เข้าร่วมห้องแชท
	User     User        `gorm:"foreignKey:UserID"`
	GuideID  uint        `gorm:"not null"` // ID ของไกด์ที่เข้าร่วมห้องแชท
	Guide    Guide       `gorm:"foreignKey:GuideID"`
}

type Message struct {
	gorm.Model
	ChatRoomID uint        `gorm:"not null"`
	ChatRoom   ChatRoom    `gorm:"foreignKey:ChatRoomID"`

	SenderID   uint        `gorm:"not null"`      // ใครเป็นคนส่ง
	SenderType string      `gorm:"not null"`      // "user" หรือ "guide"
	Content    string      `gorm:"not null"`      // ข้อความ
	IsRead     bool        `gorm:"default:false"` // ถูกอ่านหรือยัง
	SentAt     time.Time   `gorm:"not null"`
}
