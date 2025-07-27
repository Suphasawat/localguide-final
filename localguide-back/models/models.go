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
	UserID            uint                `gorm:"not null"`
	User              User                `gorm:"foreignKey:UserID"`	
	Bio               string  
	Description       string              `gorm:"not null"` 
	Certification     []GuideCertification `gorm:"foreignKey:GuideID"`
	Available         bool                // true = available, false = not available
	Language          []Language          `gorm:"many2many:guide_languages"`
	Price             float64             `gorm:"not null"` 
	Rating            float64             // เก็บค่าเฉลี่ยของ ratings จาก reviews
	ProvinceID        uint                `gorm:"not null"` // เพิ่ม ProvinceID
	ProvinceRef       Province            `gorm:"foreignKey:ProvinceID"` // เปลี่ยนชื่อเพื่อไม่ซ้ำกับ Province string
	TouristAttraction []TouristAttraction `gorm:"many2many:guide_tourist_attractions"` 
}

type GuideCertification struct {
	ID uint `gorm:"primaryKey"`
	GuideID uint `gorm:"not null"`
	Guide Guide `gorm:"foreignKey:GuideID"`
	CertificationNumber string `gorm:"not null"`
}

type Language struct {
	ID uint `gorm:"primaryKey"`
	Name string `gorm:"not null"`
	Guides []Guide `gorm:"many2many:guide_languages"`
}

type Role struct {
	ID uint `gorm:"primaryKey"`
	Name string `gorm:"not null"`
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
	ID          uint     `gorm:"primaryKey"`
	Name        string   `gorm:"not null"`
	Description string   
	ProvinceID  uint     `gorm:"not null"`
	Province    Province `gorm:"foreignKey:ProvinceID"`
	District    string   
	City        string   
	Category    string   `gorm:"not null"` // ประเภท เช่น "วัด", "น้ำตก", "ชายหาด"
	Rating      float64  
	ImageURL    string   
	Guides      []Guide  `gorm:"many2many:guide_tourist_attractions"`
	TripRequests []TripRequest `gorm:"many2many:trip_request_attractions"`
}

type Booking struct {
	ID          uint      `json:"ID" gorm:"primaryKey"`
	UserID      uint      `json:"UserID" gorm:"not null"`
	GuideID     uint      `json:"GuideID" gorm:"not null"`
	StartDate   time.Time `json:"StartDate" gorm:"not null"`
	EndDate     time.Time `json:"EndDate" gorm:"not null"`
	Days        int       `json:"Days" gorm:"not null"`
	TotalPrice  float64   `json:"TotalPrice" gorm:"not null"`
	Status      string    `json:"Status" gorm:"default:'pending'"`
	Note        string    `json:"Note"`
	CreatedAt   time.Time `json:"CreatedAt"`
	UpdatedAt   time.Time `json:"UpdatedAt"`
	
	// Associations
	User  User  `json:"User" gorm:"foreignKey:UserID"`
	Guide Guide `json:"Guide" gorm:"foreignKey:GuideID"`
}

type Notification struct {
	gorm.Model
	UserID  uint   `gorm:"not null"`
	User    User   `gorm:"foreignKey:UserID"`
	Type    string `gorm:"not null;default:'info'"` // เพิ่ม Type field
	Title   string `gorm:"not null"`               // เพิ่ม Title field
	Message string `gorm:"not null"`
	Data    string `gorm:"type:json"`              // เพิ่ม Data field สำหรับข้อมูลเสริม
	IsRead  bool   `gorm:"default:false"`
}

type Unavailable struct {
	gorm.Model
	GuideID   uint      `gorm:"not null"`
	Guide     Guide     `gorm:"foreignKey:GuideID"`
	Date      time.Time `gorm:"not null"` // วันที่ไม่ว่าง
	Reason    string    // เหตุผลที่ไม่ว่าง
	StartTime time.Time `gorm:"not null"`
	EndTime   time.Time `gorm:"not null"`
	Available bool      `gorm:"not null"` // true = available, false = not available
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
	UserID            uint      `gorm:"not null"` // ID of the user applying
	User              User      `gorm:"foreignKey:UserID"`
	GuideID           *uint     // Pointer to allow null, will be set on approval
	Guide             Guide     `gorm:"foreignKey:GuideID"`
	Status            string    `gorm:"not null;default:'pending'"` // pending, approved, rejected
	VerificationDate  time.Time `gorm:"not null"`
	ReviewedBy        *uint     // Admin UserID
	ReviewedAt        *time.Time
	AdminComments     string

	// --- Data from application form ---
	Bio               string
	Description       string
	Price             float64
	District          string
	City              string
	Province          string
	Language       string 
	Attraction     string 
	CertificationData string
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


type PasswordReset struct {
	gorm.Model
	Email     string    `gorm:"not null"`
	Token     string    `gorm:"unique;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	Used      bool      `gorm:"default:false"`
}

type Province struct {
	ID                 uint                `gorm:"primaryKey"`
	Name               string              `gorm:"not null;unique"`
	Region             string              `gorm:"not null"`
	TouristAttractions []TouristAttraction `gorm:"foreignKey:ProvinceID"`
	Guides            []Guide             `gorm:"foreignKey:ProvinceID"`
	TripRequests      []TripRequest       `gorm:"foreignKey:ProvinceID"`
}

// TripRequest - คำขอทริปจาก user
type TripRequest struct {
	gorm.Model
	UserID           uint      `gorm:"not null"`
	User             User      `gorm:"foreignKey:UserID"`
	ProvinceID       uint      `gorm:"not null"`
	Province         Province  `gorm:"foreignKey:ProvinceID"`
	MinPrice         float64   `gorm:"not null"`
	MaxPrice         float64   `gorm:"not null"`
	StartDate        time.Time `gorm:"not null"`
	EndDate          time.Time `gorm:"not null"`
	Days             int       `gorm:"not null"`
	MinRating        float64   `gorm:"default:0"`
	GroupSize        int       `gorm:"not null;default:1"`
	Requirements     string    // ความต้องการพิเศษ
	Status           string    `gorm:"default:'searching'"` // searching, matched, negotiating, confirmed, cancelled
	TouristAttractions []TouristAttraction `gorm:"many2many:trip_request_attractions"`
	TripProposals    []TripProposal `gorm:"foreignKey:TripRequestID"`
	ChatMessages     []ChatMessage `gorm:"foreignKey:TripRequestID"`
}

// TripProposal - ข้อเสนอจากไกด์
type TripProposal struct {
	gorm.Model
	TripRequestID    uint        `gorm:"not null"`
	TripRequest      TripRequest `gorm:"foreignKey:TripRequestID"`
	GuideID          uint        `gorm:"not null"`
	Guide            Guide       `gorm:"foreignKey:GuideID"`
	Title            string      `gorm:"not null"` // ชื่อแพ็กเกจ
	Description      string      `gorm:"not null"` // รายละเอียดการท่องเที่ยว
	Itinerary        string      `gorm:"type:json"` // กำหนดการเที่ยวแต่ละวัน (JSON format)
	IncludedServices string      `gorm:"type:json"` // บริการที่รวม (JSON array)
	ExcludedServices string      `gorm:"type:json"` // บริการที่ไม่รวม (JSON array)
	TotalPrice       float64     `gorm:"not null"`
	PriceBreakdown   string      `gorm:"type:json"` // รายละเอียดราคา (JSON format)
	ValidUntil       time.Time   `gorm:"not null"`
	Status           string      `gorm:"default:'pending'"` // pending, accepted, rejected, negotiating, expired
	Negotiations     []Negotiation `gorm:"foreignKey:TripProposalID"`
	FinalQuotation   *FinalQuotation `gorm:"foreignKey:TripProposalID"`
}

// Negotiation - การเจรจาต่อรอง
type Negotiation struct {
	gorm.Model
	TripProposalID   uint         `gorm:"not null"`
	TripProposal     TripProposal `gorm:"foreignKey:TripProposalID"`
	SenderID         uint         `gorm:"not null"`
	SenderType       string       `gorm:"not null"` // "user" หรือ "guide"
	MessageType      string       `gorm:"not null"` // "message", "price_change", "itinerary_change", "counter_offer"
	Message          string       
	ProposedChanges  string       `gorm:"type:json"` // การเปลี่ยนแปลงที่เสนอ (JSON format)
	NewPrice         *float64     // ราคาใหม่ที่เสนอ
	NewItinerary     string       `gorm:"type:json"` // กำหนดการใหม่ที่เสนอ (JSON format)
	IsRead           bool         `gorm:"default:false"`
}

// ChatMessage - ระบบแชทสำหรับ trip request
type ChatMessage struct {
	gorm.Model
	TripRequestID    uint        `gorm:"not null"`
	TripRequest      TripRequest `gorm:"foreignKey:TripRequestID"`
	SenderID         uint        `gorm:"not null"`
	SenderType       string      `gorm:"not null"` // "user" หรือ "guide"
	Message          string      `gorm:"not null"`
	MessageType      string      `gorm:"default:'text'"` // text, image, file, proposal
	AttachmentURL    string      
	IsRead           bool        `gorm:"default:false"`
}

// FinalQuotation - ใบเสนอราคาสุดท้าย
type FinalQuotation struct {
	gorm.Model
	TripProposalID   uint         `gorm:"not null"`
	TripProposal     TripProposal `gorm:"foreignKey:TripProposalID"`
	QuotationNumber  string       `gorm:"unique;not null"`
	TotalAmount      float64      `gorm:"not null"`
	PriceBreakdown   string       `gorm:"type:json"` // รายละเอียดราคา (JSON format)
	Terms            string       `gorm:"type:json"` // เงื่อนไข (JSON array)
	ValidUntil       time.Time    `gorm:"not null"`
	Status           string       `gorm:"default:'pending'"` // pending, accepted, rejected, expired
	PaymentDeadline  time.Time    `gorm:"not null"`
	AcceptedAt       *time.Time   // วันที่ user ตอบรับ
}