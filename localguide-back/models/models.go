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
	Sex 	 string `gorm:"not null;default:''"` 
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
	TripRequires []TripRequire `gorm:"many2many:trip_require_attractions"`
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
	TripRequires      []TripRequire       `gorm:"foreignKey:ProvinceID"`
}

// TripRequire - โพสต์ความต้องการทริปจาก user (เหมือน job posting)
type TripRequire struct {
	gorm.Model
	UserID           uint      `gorm:"not null"`
	User             User      `gorm:"foreignKey:UserID"`
	ProvinceID       uint      `gorm:"not null"`
	Province         Province  `gorm:"foreignKey:ProvinceID"`
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
	TouristAttractions []TouristAttraction `gorm:"many2many:trip_require_attractions"`
	TripOffers       []TripOffer `gorm:"foreignKey:TripRequireID"`
	SelectedOfferID  *uint       // ข้อเสนอที่ user เลือก
	SelectedOffer    *TripOffer  `gorm:"foreignKey:SelectedOfferID"`
}

// TripOffer - ข้อเสนอจากไกด์ (Guide เสนอรายละเอียดและราคา) รองรับการเจรจาและเสนอราคาในตัว
type TripOffer struct {
	gorm.Model
	TripRequireID    uint        `gorm:"not null"`
	TripRequire      TripRequire `gorm:"foreignKey:TripRequireID"`
	GuideID          uint        `gorm:"not null"`
	Guide            Guide       `gorm:"foreignKey:GuideID"`
	
	// ข้อมูลหลักของ offer
	Title            string      `gorm:"not null"` // ชื่อแพ็กเกจที่เสนอ
	Description      string      `gorm:"not null"` // รายละเอียดการท่องเที่ยวที่เสนอ
	Itinerary        string      `gorm:"type:json"` // กำหนดการเที่ยวแต่ละวัน (JSON format)
	IncludedServices string      `gorm:"type:json"` // บริการที่รวม (JSON array)
	ExcludedServices string      `gorm:"type:json"` // บริการที่ไม่รวม (JSON array)
	
	// ข้อมูลราคาและเงื่อนไข (Quotation ในตัว)
	TotalPrice       float64     `gorm:"not null"`   // ราคารวมที่เสนอ
	PriceBreakdown   string      `gorm:"type:json"` // รายละเอียดราคา (JSON format)
	Terms            string      `gorm:"type:json"` // เงื่อนไขการให้บริการ (JSON array)
	PaymentTerms     string      `gorm:"type:json"` // เงื่อนไขการชำระเงิน (JSON format)
	QuotationNumber  string      // เลขที่ใบเสนอราคา (optional)
	
	// การเจรจาและ versioning (Negotiation ในตัว)
	Version          int         `gorm:"default:1"`  // เวอร์ชันของ offer สำหรับการเจรจา
	IsCounterOffer   bool        `gorm:"default:false"` // เป็น counter offer จาก user หรือไม่
	ParentOfferID    *uint       // อ้างอิงถึง offer เดิมที่ counter
	ParentOffer      *TripOffer  `gorm:"foreignKey:ParentOfferID"`
	NegotiationNotes string      `gorm:"type:json"` // บันทึกการเจรจา (JSON array of messages)
	LastModifiedBy   string      `gorm:"default:'guide'"` // guide หรือ user
	ModificationReason string    // เหตุผลการแก้ไข
	
	// สถานะและวันที่
	OfferValidUntil  time.Time   `gorm:"not null"`   // วันหมดอายุของข้อเสนอ
	Status           string      `gorm:"default:'pending'"` // pending, negotiating, accepted, rejected, expired, withdrawn
	OfferNotes       string      // หมายเหตุเพิ่มเติมจากไกด์
	AcceptedAt       *time.Time  // วันที่ user accept
	RejectedAt       *time.Time  // วันที่ reject (auto หรือ manual)
	RejectionReason  string      // เหตุผลการ reject (auto_selection, manual_reject, expired, counter_offered)
	PaymentDeadline  *time.Time  // กำหนดชำระเงิน
	
	// ความสัมพันธ์
	TripBooking      *TripBooking `gorm:"foreignKey:TripOfferID"` // การจองที่เกิดขึ้นจาก offer นี้
}

// TripBooking - การจองหลังจาก user accept offer
type TripBooking struct {
	gorm.Model
	TripOfferID      uint        `gorm:"not null"`
	TripOffer        TripOffer   `gorm:"foreignKey:TripOfferID"`
	UserID           uint        `gorm:"not null"`
	User             User        `gorm:"foreignKey:UserID"`
	GuideID          uint        `gorm:"not null"`
	Guide            Guide       `gorm:"foreignKey:GuideID"`
	BookingNumber    string      `gorm:"unique;not null"`
	StartDate        time.Time   `gorm:"not null"`
	EndDate          time.Time   `gorm:"not null"`
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
	TripBooking      TripBooking  `gorm:"foreignKey:TripBookingID"`
	PaymentNumber    string       `gorm:"unique;not null"`
	TotalAmount      float64      `gorm:"not null"` // จำนวนเงินที่ user จ่ายทั้งหมด (100%)
	FirstPayment     float64      `gorm:"not null"` // จำนวนเงินที่จ่ายให้ไกด์ครั้งแรก (50% เมื่อเริ่มทริป)
	SecondPayment    float64      `gorm:"not null"` // จำนวนเงินที่จ่ายให้ไกด์ครั้งที่สอง (50% เมื่อจบทริป)
	PaymentMethod    string       `gorm:"not null"` // credit_card, bank_transfer, etc.
	TransactionID    string       `gorm:"unique;not null"`
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
	TripBooking      TripBooking  `gorm:"foreignKey:TripBookingID"`
	UserID           uint         `gorm:"not null"`
	User             User         `gorm:"foreignKey:UserID"`
	GuideID          uint         `gorm:"not null"`
	Guide            Guide        `gorm:"foreignKey:GuideID"`
	Rating           float64      `gorm:"not null"` // 1-5 stars
	Comment          string       `gorm:"type:text"`
	ServiceRating    float64      `gorm:"not null"` // คะแนนการบริการ
	KnowledgeRating  float64      `gorm:"not null"` // คะแนนความรู้
	CommunicationRating float64   `gorm:"not null"` // คะแนนการสื่อสาร
	PunctualityRating float64     `gorm:"not null"` // คะแนนความตรงต่อเวลา
	Images           string       `gorm:"type:json"` // รูปภาพประกอบรีวิว (JSON array)
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
	TripBooking      TripBooking  `gorm:"foreignKey:TripBookingID"`
	ReporterID       uint         `gorm:"not null"` // ผู้รายงาน (user หรือ guide)
	Reporter         User         `gorm:"foreignKey:ReporterID"`
	ReportedUserID   uint         `gorm:"not null"` // ผู้ถูกรายงาน
	ReportedUser     User         `gorm:"foreignKey:ReportedUserID"`
	ReportType       string       `gorm:"not null"` // guide_no_show, user_no_show, inappropriate_behavior, safety_issue, payment_issue, other
	Title            string       `gorm:"not null"`
	Description      string       `gorm:"type:text;not null"`
	Evidence         string       `gorm:"type:json"` // หลักฐาน (รูปภาพ, ไฟล์) JSON array
	Severity         string       `gorm:"default:'medium'"` // low, medium, high, critical
	Status           string       `gorm:"default:'pending'"` // pending, investigating, resolved, dismissed
	AdminNotes       string       `gorm:"type:text"` // หมายเหตุจาก admin
	ReviewedBy       *uint        // Admin ที่รับเรื่อง
	ReviewedAt       *time.Time   // วันที่ admin review
	ResolvedAt       *time.Time   // วันที่แก้ไขเสร็จ
	Actions          string       `gorm:"type:json"` // การดำเนินการที่ทำ (JSON array)
}

// GuidePerformance - สถิติการทำงานของไกด์
type GuidePerformance struct {
	gorm.Model
	GuideID              uint    `gorm:"not null;unique"`
	Guide                Guide   `gorm:"foreignKey:GuideID"`
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
	TripPayment      TripPayment  `gorm:"foreignKey:TripPaymentID"`
	ReleaseType      string       `gorm:"not null"` // first_payment, second_payment, refund
	Amount           float64      `gorm:"not null"` // จำนวนเงินที่จ่าย/คืน
	RecipientType    string       `gorm:"not null"` // guide, user
	RecipientID      uint         `gorm:"not null"` // ID ของผู้รับเงิน
	Reason           string       `gorm:"not null"` // trip_started, trip_completed, user_no_show
	ScheduledAt      time.Time    `gorm:"not null"` // วันที่กำหนดจ่าย
	ProcessedAt      *time.Time   // วันที่จ่ายจริง
	Status           string       `gorm:"default:'pending'"` // pending, processed, failed
	TransactionRef   string       // อ้างอิงธุรกรรมการโอนเงิน
	Notes            string       // หมายเหตุ
}

// TripNotification - อัปเดต notification ให้รองรับระบบใหม่
type TripNotification struct {
	gorm.Model
	UserID         uint        `gorm:"not null"`
	User           User        `gorm:"foreignKey:UserID"`
	TripBookingID  *uint       // อ้างอิงถึง trip booking (optional)
	TripBooking    *TripBooking `gorm:"foreignKey:TripBookingID"`
	Type           string      `gorm:"not null"` // offer_received, offer_accepted, payment_confirmed, trip_started, trip_completed, first_payment_released, second_payment_released, user_no_show, refund_processed
	Title          string      `gorm:"not null"`
	Message        string      `gorm:"not null"`
	Data           string      `gorm:"type:json"` // ข้อมูลเพิ่มเติม
	IsRead         bool        `gorm:"default:false"`
	ActionRequired bool        `gorm:"default:false"` // ต้องการ action จาก user หรือไม่
	ActionType     string      // make_payment, confirm_trip_start, confirm_trip_complete, report_no_show
	ExpiresAt      *time.Time  // วันหมดอายุของ notification
}