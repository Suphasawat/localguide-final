package models

import (
	"time"

	"gorm.io/gorm"
)

type AuthUser struct {
	gorm.Model 
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `gorm:"not null" json:"password"`
}

type User struct {
	gorm.Model
	AuthUserID  uint   `gorm:"not null"` 
	AuthUser    AuthUser `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:AuthUserID"`
	FirstName   string `gorm:"not null;default:''"` 
	LastName    string `gorm:"not null;default:''"` 
	Nickname    string 
	BirthDate   *time.Time 
	RoleID      uint   `gorm:"not null;default:1"` 
	Role        Role   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:RoleID"`
	Nationality string `gorm:"not null;default:''"` 
	Phone       string `gorm:"not null;default:''"` 
	Sex         string `gorm:"not null;default:''"` 
	Avatar      string 
}

type Guide struct {
	gorm.Model
	UserID            uint                `gorm:"not null"`
	User              User                `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	Bio               string  
	Description       string              `gorm:"not null"` 
	Available         bool                
	Rating            float64             
	ProvinceID        uint                `gorm:"not null"` // เพิ่ม ProvinceID
	Province          Province            `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ProvinceID"`
	Language          []Language          `gorm:"many2many:guide_languages"`
	TouristAttraction []TouristAttraction `gorm:"many2many:guide_attractions"`
	Certification 	  []GuideCertification `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:GuideID"`
}

type GuideCertification struct {
	gorm.Model
	GuideID            uint   `gorm:"not null"`
	Guide              Guide  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:GuideID"`
	CertificationNumber string `gorm:"not null"`
}

type Language struct {
	gorm.Model
	Name  string `gorm:"not null"`
}

type Role struct {
	gorm.Model
	Name string `gorm:"not null"`
}

type TouristAttraction struct {
	gorm.Model
	Name        string   `gorm:"not null"`
	Description string   
	ProvinceID  uint     `gorm:"not null"`
	Province    Province `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ProvinceID"`
	District    string   
	City        string   
	Category    string   `gorm:"not null"` // ประเภท เช่น "วัด", "น้ำตก", "ชายหาด"
	Rating      float64  
	ImageURL    string   
}

type Province struct {
	gorm.Model
	Name               string              `gorm:"not null;unique"`
	Region             string              `gorm:"not null"`
}

type GuideVertification struct {
	gorm.Model
	UserID            uint      `gorm:"not null"` 
	User 			User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	GuideID           *uint     
	Guide             *Guide    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:GuideID"`
	Status            string    `gorm:"not null;default:'pending'"` // pending, approved, rejected
	VerificationDate  time.Time `gorm:"not null"`
	ReviewedBy        *uint     
	ReviewedAt        *time.Time
	AdminComments     string

	// --- Data from application form ---
	Bio               string
	Description       string
	ProvinceID        uint
	Province         Province `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ProvinceID"`
	Language         []Language `gorm:"many2many:guide_verification_languages"`
	Attraction       []TouristAttraction `gorm:"many2many:guide_verification_attractions"`
	CertificationData string
}
type PasswordReset struct {
	gorm.Model
	Email     string    `gorm:"not null"`
	Token     string    `gorm:"unique;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	Used      bool      `gorm:"default:false"`
}


// TripRequire - โพสต์ความต้องการทริปจาก user (เหมือน job posting)
type TripRequire struct {
	gorm.Model
	UserID           uint      `gorm:"not null"`
	User 		   User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	ProvinceID       uint      `gorm:"not null"`
	Province         Province  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ProvinceID"`
	Title            string    `gorm:"not null"` // ชื่อโพสต์ เช่น "หาไกด์เที่ยวเชียงใหม่ 3 วัน 2 คืน"
	Description      string    `gorm:"not null"` // รายละเอียดความต้องการ
	MinPrice         float64   `gorm:"not null"`
	MaxPrice         float64   `gorm:"not null"`
	StartDate        time.Time `gorm:"not null"`
	EndDate          time.Time `gorm:"not null"`
	Days             int       `gorm:"not null"`
	MinRating        float64   `gorm:"default:0"`
	GroupSize        int       `gorm:"not null;default:1"`
	Requirements     string    // ความต้องการพิเศษ
	Status           string    `gorm:"default:'open'"` // open, in_review, assigned, completed, cancelled
	PostedAt         time.Time `gorm:"autoCreateTime"` // วันที่โพสต์
	ExpiresAt        *time.Time // วันหมดอายุของโพสต์
	TripOffer        []TripOffer `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:TripRequireID"`
}

// TripOffer - ข้อเสนอจากไกด์ (Guide เสนอรายละเอียดและราคา) 
type TripOffer struct {
	gorm.Model
	TripRequireID    uint        `gorm:"not null"`
	TripRequire      TripRequire `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripRequireID"`
	GuideID          uint        `gorm:"not null"`
	Guide            Guide       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:GuideID"`
	
	// ข้อมูลหลักของ offer
	Title            string      `gorm:"not null"` // ชื่อแพ็กเกจที่เสนอ
	Description      string      `gorm:"type:text;not null"` // รายละเอียดการท่องเที่ยวที่เสนอ
	Itinerary        string      `gorm:"type:text"` // กำหนดการเที่ยวแต่ละวัน (ใช้ text แทน json)
	IncludedServices string      `gorm:"type:text"` // บริการที่รวม (ใช้ text แทน json)
	ExcludedServices string      `gorm:"type:text"` // บริการที่ไม่รวม (ใช้ text แทน json)
	
	// สถานะและวันที่
	Status           string      `gorm:"default:'draft'"` // draft, sent, negotiating, accepted, rejected, expired, withdrawn
	OfferNotes       string      `gorm:"type:text"` // หมายเหตุเพิ่มเติมจากไกด์
	SentAt           *time.Time  // วันที่ส่งข้อเสนอครั้งแรก
	AcceptedAt       *time.Time  // วันที่ user accept
	RejectedAt       *time.Time  // วันที่ reject (auto หรือ manual)
	RejectionReason  string      `gorm:"type:text"` // เหตุผลการ reject (auto_selection, manual_reject, expired, counter_offered)
	TripOfferNegotiation []TripOfferNegotiation `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:TripOfferID"`
	TripOfferQuotation []TripOfferQuotation `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:TripOfferID"`
}

// TripOfferQuotation - ใบเสนอราคา
type TripOfferQuotation struct {
	gorm.Model
	TripOfferID      uint        `gorm:"not null"`
	TripOffer        TripOffer   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripOfferID"`
	Version          int         `gorm:"default:1"`  // เวอร์ชันของใบเสนอราคา
	TotalPrice       float64     `gorm:"not null"`   // ราคารวมที่เสนอ
	PriceBreakdown   string      `gorm:"type:text"` // รายละเอียดราคา (ใช้ text แทน json)
	QuotationNumber  string      // เลขที่ใบเสนอราคา (optional)
	Status           string      `gorm:"default:'draft'"` // draft, sent, accepted, rejected, expired
	SentAt           *time.Time  // วันที่ส่งใบเสนอราคา
	AcceptedAt       *time.Time  // วันที่ยอมรับ
	RejectedAt       *time.Time  // วันที่ปฏิเสธ
	Notes            string      `gorm:"type:text"` // หมายเหตุ
}

// TripOfferNegotiation - การเจรจาต่อรอง 
type TripOfferNegotiation struct {
	gorm.Model
	TripOfferID      uint        `gorm:"not null"`
	TripOffer        TripOffer   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripOfferID"`
	SequenceNumber   int         `gorm:"not null"`  // ลำดับของการเจรจา (1, 2, 3, ...)
	FromUserID       uint        `gorm:"not null"`  // ID ของผู้ส่งข้อความ
	FromUser         User        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:FromUserID"`
	Message          string      `gorm:"type:text;not null"` // ข้อความเจรจา
	ProposedChanges  string      `gorm:"type:json"` // การเปลี่ยนแปลงที่เสนอ
	Status           string      `gorm:"default:'pending'"` // pending, acknowledged, accepted, rejected
	AcknowledgedAt   *time.Time  // วันที่อีกฝ่ายอ่านแล้ว
	RespondedAt      *time.Time  // วันที่ตอบกลับ
	ResponseMessage  string      `gorm:"type:text"` // ข้อความตอบกลับ
	IsCounterOffer   bool        `gorm:"default:false"` // เป็นการเสนอแก้ไขหรือไม่
	Notes            string      // หมายเหตุภายใน
}

// TripBooking - การจองหลังจาก user accept offer
type TripBooking struct {
	gorm.Model
	TripOfferID      uint        `gorm:"not null"`
	TripOffer        TripOffer   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripOfferID"`
	UserID           uint        `gorm:"not null"`
	User             User        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	GuideID          uint        `gorm:"not null"`
	Guide            Guide       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:GuideID"`
	StartDate        time.Time   `gorm:"not null"`
	TotalAmount      float64     `gorm:"not null"`
	Status           string      `gorm:"default:'pending_payment'"` // pending_payment, paid, trip_started, trip_completed, cancelled, no_show
	PaymentStatus    string      `gorm:"default:'pending'"` // pending, paid, first_released, fully_released, partially_refunded
	TripStartedAt    *time.Time  // วันที่เริ่มทริป (จ่ายให้ไกด์ 50% แรก)
	TripCompletedAt  *time.Time  // วันที่จบทริป (จ่ายให้ไกด์อีก 50%)
	CancelledAt      *time.Time  // วันที่ยกเลิก
	NoShowAt         *time.Time  // วันที่ระบุว่า user ไม่มา (จ่ายให้ไกด์ 50%, คืน user 50%)
	CancellationReason string    // เหตุผลการยกเลิก
	SpecialRequests  string      // ความต้องการพิเศษ
	Notes            string      // หมายเหตุ
}

// TripPayment - การชำระเงินแบบใหม่ (User จ่าย 100% แล้วแบ่งจ่ายให้ไกด์ตามขั้นตอน)
type TripPayment struct {
	gorm.Model
	TripBookingID    uint         `gorm:"not null"`
	TripBooking      TripBooking  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripBookingID"`
	PaymentNumber    string       `gorm:"unique;not null"`
	TotalAmount      float64      `gorm:"not null"` // จำนวนเงินที่ user จ่ายทั้งหมด (100%)
	FirstPayment     float64      `gorm:"not null"` // จำนวนเงินที่จ่ายให้ไกด์ครั้งแรก (50% เมื่อเริ่มทริป)
	SecondPayment    float64      `gorm:"not null"` // จำนวนเงินที่จ่ายให้ไกด์ครั้งที่สอง (50% เมื่อจบทริป)
	PaymentMethod    string       `gorm:"not null"` // stripe_card, stripe_bank_transfer, etc.
	TransactionID    string       `gorm:"unique;not null"`
	// Stripe fields
	StripePaymentIntentID string  `gorm:"unique"` // Stripe PaymentIntent ID
	StripeClientSecret    string  // Stripe client secret สำหรับ frontend
	StripeStatus         string   // Stripe payment status
	// Original fields
	Status           string       `gorm:"default:'pending'"` // pending, paid, first_released, fully_released, partially_refunded, refunded
	PaidAt           *time.Time   // วันที่ user ชำระเงิน 100%
	FirstReleasedAt  *time.Time   // วันที่จ่ายให้ไกด์ครั้งแรก (50%)
	SecondReleasedAt *time.Time   // วันที่จ่ายให้ไกด์ครั้งที่สอง (50%)
	RefundedAt       *time.Time   // วันที่ refund (กรณี user ไม่ไป)
	RefundAmount     float64      `gorm:"default:0"` // จำนวนเงินที่ refund ให้ user
	RefundReason     string       // เหตุผล refund
	Notes            string       // หมายเหตุเพิ่มเติม
}

// TripReview - รีวิวหลังเสร็จการเที่ยว
type TripReview struct {
	gorm.Model
	TripBookingID    uint         `gorm:"not null"`
	TripBooking      TripBooking  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripBookingID"`
	UserID           uint         `gorm:"not null"`
	User             User         `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID"`
	GuideID          uint         `gorm:"not null"`
	Guide            Guide        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:GuideID"`
	Rating           float64      `gorm:"not null"` // 1-5 stars
	Comment          string       `gorm:"type:text"`
	ServiceRating    float64      `gorm:"not null"` // คะแนนการบริการ
	KnowledgeRating  float64      `gorm:"not null"` // คะแนนความรู้
	CommunicationRating float64   `gorm:"not null"` // คะแนนการสื่อสาร
	PunctualityRating float64     `gorm:"not null"` // คะแนนความตรงต่อเวลา
	Images           string       `gorm:"type:text"` // รูปภาพประกอบรีวิว
	IsAnonymous      bool         `gorm:"default:false"` // รีวิวแบบไม่ระบุตัวตน
	IsVerified       bool         `gorm:"default:true"`  // รีวิวที่ verified จากการจองจริง
	HelpfulCount     int          `gorm:"default:0"`     // จำนวนคนที่กด helpful
	ResponseFromGuide string      `gorm:"type:text"`     // การตอบกลับจากไกด์
	RespondedAt      *time.Time   // วันที่ไกด์ตอบกลับ
}

// TripReport - รีพอร์ตปัญหาต่างๆ
type TripReport struct {
	gorm.Model
	TripBookingID    uint         `gorm:"not null"`
	TripBooking      TripBooking  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripBookingID"`
	ReporterID       uint         `gorm:"not null"` // ผู้รายงาน (user หรือ guide)
	Reporter         User         `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ReporterID"`
	ReportedUserID   uint         `gorm:"not null"` // ผู้ถูกรายงาน
	ReportedUser     User         `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ReportedUserID"`
	ReportType       string       `gorm:"not null"` // guide_no_show, user_no_show, inappropriate_behavior, safety_issue, payment_issue, other
	Title            string       `gorm:"not null"`
	Description      string       `gorm:"type:text;not null"`
	Evidence         string       `gorm:"type:text"` // หลักฐาน (รูปภาพ, ไฟล์, URL)
	Severity         string       `gorm:"default:'medium'"` // low, medium, high, critical
	Status           string       `gorm:"default:'pending'"` // pending, investigating, resolved, dismissed
	AdminNotes       string       `gorm:"type:text"` // หมายเหตุจาก admin
	ReviewedBy       *uint        // Admin ที่รับเรื่อง
	ReviewedAt       *time.Time   // วันที่ admin review
	ResolvedAt       *time.Time   // วันที่แก้ไขเสร็จ
	Actions          string       `gorm:"type:text"` // การดำเนินการที่ทำ
}

// GuidePerformance - สถิติการทำงานของไกด์
type GuidePerformance struct {
	gorm.Model
	GuideID              uint    `gorm:"not null;unique"`
	Guide                Guide   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:GuideID"`
	TotalTrips           int     `gorm:"default:0"`
	CompletedTrips       int     `gorm:"default:0"`
	CancelledTrips       int     `gorm:"default:0"`
	NoShowTrips          int     `gorm:"default:0"`
	AverageRating        float64 `gorm:"default:0"`
	AverageServiceRating float64 `gorm:"default:0"`
	AverageKnowledgeRating float64 `gorm:"default:0"`
	AverageCommunicationRating float64 `gorm:"default:0"`
	AveragePunctualityRating float64 `gorm:"default:0"`
	TotalEarnings        float64 `gorm:"default:0"`
	ReportsCount         int     `gorm:"default:0"`
	ResolvedReportsCount int     `gorm:"default:0"`
	CompletionRate       float64 `gorm:"default:0"` // % ของทริปที่เสร็จสมบูรณ์
	ResponseRate         float64 `gorm:"default:0"` // % ของ offer ที่ตอบรับ
	LastActiveAt         *time.Time 
	AccountStatus        string  `gorm:"default:'active'"` // active, warning, suspended, banned
	WarningCount         int     `gorm:"default:0"`
	SuspensionCount      int     `gorm:"default:0"`
}

// PaymentRelease - ตาราง track การจ่ายเงินให้ไกด์แต่ละครั้ง
type PaymentRelease struct {
	gorm.Model
	TripPaymentID    uint         `gorm:"not null"`
	TripPayment      TripPayment  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TripPaymentID"`
	ReleaseType      string       `gorm:"not null"` // first_payment, second_payment, refund
	Amount           float64      `gorm:"not null"` // จำนวนเงินที่จ่าย/คืน
	RecipientType    string       `gorm:"not null"` // guide, user
	RecipientID      uint         `gorm:"not null"` // ID ของผู้รับเงิน
	Recipient        User         `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:RecipientID"`
	Reason           string       `gorm:"not null"` // trip_started, trip_completed, user_no_show
	ScheduledAt      time.Time    `gorm:"not null"` // วันที่กำหนดจ่าย
	ProcessedAt      *time.Time   // วันที่จ่ายจริง
	Status           string       `gorm:"default:'pending'"` // pending, processed, failed
	TransactionRef   string       // อ้างอิงธุรกรรมการโอนเงิน
	Notes            string       // หมายเหตุ
}