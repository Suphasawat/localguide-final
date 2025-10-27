package controllers

import (
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CreateTripOffer - Guide สร้าง offer สำหรับ TripRequire
func CreateTripOffer(c *fiber.Ctx) error {
	var req struct {
		TripRequireID    uint    `json:"trip_require_id" validate:"required"`
		Title            string  `json:"title" validate:"required"`
		Description      string  `json:"description" validate:"required"`
		Itinerary        string  `json:"itinerary"`
		IncludedServices string  `json:"included_services"`
		ExcludedServices string  `json:"excluded_services"`
		TotalPrice       float64 `json:"total_price" validate:"required,min=0"`
		PriceBreakdown   string  `json:"price_breakdown"`
		Terms            string  `json:"terms"`
		PaymentTerms     string  `json:"payment_terms"`
		OfferNotes       string  `json:"offer_notes"`
		ValidDays        int     `json:"valid_days" validate:"min=1,max=30"` // วันที่ offer หมดอายุ
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
			"details": err.Error(),
		})
	}

	// ตรวจสอบว่าเป็น Guide
	userID := c.Locals("userID").(uint)
	var guide models.Guide
	if err := config.DB.Where("user_id = ?", userID).First(&guide).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only guides can create offers",
		})
	}

	// ตรวจสอบว่า TripRequire มีอยู่และยังเปิดรับ offer อยู่
	var tripRequire models.TripRequire
	if err := config.DB.First(&tripRequire, req.TripRequireID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Trip requirement not found",
		})
	}

	if tripRequire.Status == "assigned" || tripRequire.Status == "completed" || tripRequire.Status == "cancelled" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Trip requirement is no longer accepting offers",
		})
	}

	// ตรวจสอบว่า Guide เคย offer ไปแล้วหรือยัง
	var existingOffer models.TripOffer
	if err := config.DB.Where("trip_require_id = ? AND guide_id = ?", req.TripRequireID, guide.ID).First(&existingOffer).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "You have already made an offer for this trip requirement",
		})
	}

	// ตรวจสอบว่าราคาอยู่ในช่วงที่ user ต้องการ
	if req.TotalPrice < tripRequire.MinPrice || req.TotalPrice > tripRequire.MaxPrice {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Price is outside the requested range",
			"requested_range": map[string]float64{
				"min": tripRequire.MinPrice,
				"max": tripRequire.MaxPrice,
			},
		})
	}

	// สร้าง TripOffer
	now := time.Now()
	offer := models.TripOffer{
		TripRequireID:    req.TripRequireID,
		GuideID:          guide.ID,
		Title:            req.Title,
		Description:      req.Description,
		Itinerary:        req.Itinerary,
		IncludedServices: req.IncludedServices,
		ExcludedServices: req.ExcludedServices,
		Status:           "sent",
		OfferNotes:       req.OfferNotes,
		SentAt:           &now,
	}

	if err := config.DB.Create(&offer).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create offer",
			"details": err.Error(),
		})
	}

	// สร้าง TripOfferQuotation
	validUntil := now.AddDate(0, 0, req.ValidDays)
	quotation := models.TripOfferQuotation{
		TripOfferID:     offer.ID,
		Version:         1,
		TotalPrice:      req.TotalPrice,
		PriceBreakdown:  req.PriceBreakdown,
		Terms:           req.Terms,
		PaymentTerms:    req.PaymentTerms,
		QuotationNumber: "QT" + strconv.Itoa(int(offer.ID)) + "-" + strconv.Itoa(int(now.Unix())),
		ValidUntil:      validUntil,
		Status:          "sent",
		SentAt:          &now,
	}

	if err := config.DB.Create(&quotation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create quotation",
			"details": err.Error(),
		})
	}

	// อัปเดตสถานะ TripRequire เป็น in_review
	config.DB.Model(&tripRequire).Update("status", "in_review")

	// สร้างการแจ้งเตือนให้กับ user (tourist)
	offerID := offer.ID
	CreateNotification(
		tripRequire.UserID,
		"trip_offer_received",
		"New Offer Received",
		"You have received a new offer for your trip requirement: " + tripRequire.Title,
		&offerID,
		"trip_offer",
		map[string]interface{}{
			"trip_require_id": tripRequire.ID,
			"guide_id":        guide.ID,
			"offer_id":        offer.ID,
		},
	)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":   "Offer created successfully",
		"offer":     offer,
		"quotation": quotation,
	})
}

// ดู TripOffers ทั้งหมดของ TripRequire
func GetTripOffers(c *fiber.Ctx) error {
    tripRequireID, err := strconv.Atoi(c.Params("id"))
    if err != nil  {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid require ID"})
    }
	if tripRequireID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Require ID must be greater than 0"})
	}
    
    var offers []models.TripOffer
    if err := config.DB.
        Preload("Guide.User").
        Preload("TripOfferQuotation").
        Where("trip_require_id = ?", tripRequireID).
        Order("created_at DESC").
        Find(&offers).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get offers"})
    }
    
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"offers": offers})
}

// ดู TripOffer รายการเดียว
func GetTripOfferByID(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
    }
	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Offer ID must be greater than 0"})
	}
    var offer models.TripOffer
    if err := config.DB.
        Preload("TripRequire.User").
        Preload("TripRequire.Province").
        Preload("Guide.User").
        Preload("TripOfferQuotation").
        First(&offer, id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Offer not found"})
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get offer"})
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": offer})
}

// แก้ไข TripOffer
func UpdateTripOffer(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
    }
	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Offer ID must be greater than 0"})
	}
    var offer models.TripOffer
    if err := config.DB.First(&offer, id).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Offer not found"})
    }
    if err := c.BodyParser(&offer); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
    }
    if err := config.DB.Save(&offer).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update offer"})
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"offer": offer})
}

// ลบ TripOffer (ถอนข้อเสนอ)
func WithdrawTripOffer(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
    }

	if id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Offer ID must be greater than 0"})
	}
    if err := config.DB.Delete(&models.TripOffer{}, id).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete offer"})
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Offer withdrawn successfully"})
}

// Accept TripOffer (User เลือก offer 1 คน - คนที่เหลือ reject อัตโนมัติ)
func AcceptTripOffer(c *fiber.Ctx) error {
	offerID, err := strconv.Atoi(c.Params("id"))
	if err != nil || offerID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid offer ID",
		})
	}

	userID := c.Locals("userID").(uint)

	// เริ่ม transaction
	tx := config.DB.Begin()
	defer tx.Rollback()

	// ดึงข้อมูล offer และ trip require
	var offer models.TripOffer
	if err := tx.First(&offer, offerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Offer not found",
		})
	}

	// ดึงข้อมูล trip require
	var tripRequire models.TripRequire
	if err := tx.First(&tripRequire, offer.TripRequireID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get trip requirement",
		})
	}

	// ตรวจสอบว่าเป็นเจ้าของ trip require
	if tripRequire.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only accept offers for your own trip requirements",
		})
	}

	// ตรวจสอบสถานะ offer
	if offer.Status != "sent" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Offer is no longer available for acceptance",
		})
	}

	// ตรวจสอบสถานะ trip require
	if tripRequire.Status != "open" && tripRequire.Status != "in_review" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Trip requirement is no longer accepting offers",
		})
	}

	// ดึงข้อมูล quotation ล่าสุด
	var quotation models.TripOfferQuotation
	if err := tx.Where("trip_offer_id = ?", offer.ID).Order("version DESC").First(&quotation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get offer quotation",
		})
	}

	// ตรวจสอบว่า quotation หมดอายุหรือยัง
	if time.Now().After(quotation.ValidUntil) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Offer quotation has expired",
		})
	}

	// อัปเดตสถานะ offer ที่ถูกเลือก
	now := time.Now()
	if err := tx.Model(&offer).Updates(map[string]interface{}{
		"status":      "accepted",
		"accepted_at": &now,
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to accept offer",
		})
	}

	// อัปเดตสถานะ quotation
	if err := tx.Model(&quotation).Updates(map[string]interface{}{
		"status":      "accepted",
		"accepted_at": &now,
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to accept quotation",
		})
	}

	// ปฏิเสธ offers อื่นๆ ที่เหลือ (auto reject)
	var rejectedOffers []models.TripOffer
	if err := tx.Where("trip_require_id = ? AND id != ? AND status IN (?)", offer.TripRequireID, offer.ID, []string{"sent", "negotiating"}).
		Find(&rejectedOffers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get other offers",
		})
	}

	if err := tx.Model(&models.TripOffer{}).
		Where("trip_require_id = ? AND id != ? AND status IN (?)", offer.TripRequireID, offer.ID, []string{"sent", "negotiating"}).
		Updates(map[string]interface{}{
			"status":           "rejected",
			"rejected_at":      &now,
			"rejection_reason": "auto_selection",
		}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reject other offers",
		})
	}

	// อัปเดตสถานะ TripRequire เป็น assigned
	if err := tx.Model(&tripRequire).Update("status", "assigned").Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update trip requirement status",
		})
	}

	// สร้าง TripBooking
	booking := models.TripBooking{
		TripOfferID:     offer.ID,
		UserID:          userID,
		GuideID:         offer.GuideID,
		StartDate:       tripRequire.StartDate,
		TotalAmount:     quotation.TotalPrice,
		Status:          "pending_payment",
		PaymentStatus:   "pending",
		SpecialRequests: tripRequire.Requirements,
	}

	if err := tx.Create(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create booking",
		})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to complete offer acceptance",
		})
	}

	// แจ้งเตือน guides ที่ offer ถูก auto-reject
	for _, rejectedOffer := range rejectedOffers {
		rejectedOfferID := rejectedOffer.ID
		CreateNotification(
			rejectedOffer.GuideID,
			"offer_rejected",
			"Offer Not Selected",
			"Unfortunately, another guide was selected for \"" + tripRequire.Title + "\".",
			&rejectedOfferID,
			"trip_offer",
			map[string]interface{}{
				"trip_require_id": tripRequire.ID,
				"offer_id":        rejectedOffer.ID,
				"reason":          "auto_selection",
			},
		)
	}

	// สร้าง notification สำหรับ guide (นอก transaction)
	var guide models.Guide
	if err := config.DB.Preload("User").First(&guide, offer.GuideID).Error; err == nil {
		// Notification สำหรับ guide
		notificationData := map[string]interface{}{
			"booking_id":   booking.ID,
			"offer_id":     offer.ID,
			"trip_title":   tripRequire.Title,
			"total_amount": quotation.TotalPrice,
		}
		
		_ = CreateNotification(
			guide.UserID,
			"offer_accepted",
			"Your offer has been accepted! 🎉",
			"User has accepted your offer for "+tripRequire.Title+". Please wait for payment confirmation.",
			&booking.ID,
			"trip_booking",
			notificationData,
		)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":   "Offer accepted successfully",
		"offer":     offer,
		"quotation": quotation,
		"booking":   booking,
	})
}

func RejectTripOffer(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid offer ID"})
	}

	// Optional body with reason
	var body struct {
		Reason string `json:"reason"`
	}
	_ = c.BodyParser(&body)

	userID := c.Locals("userID").(uint)

	// Start transaction for consistency
	tx := config.DB.Begin()
	defer tx.Rollback()

	var offer models.TripOffer
	if err := tx.Preload("TripRequire").First(&offer, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Offer not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get offer"})
	}

	// Load the related TripRequire to validate ownership
	var tripRequire models.TripRequire
	if err := tx.First(&tripRequire, offer.TripRequireID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get trip requirement"})
	}

	// Only the owner of the TripRequire can reject a guide's offer
	if tripRequire.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You can only reject offers for your own trip requirements"})
	}

	// Only reject if in a rejectable state
	if offer.Status != "sent" && offer.Status != "negotiating" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only pending offers can be rejected"})
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status":           "rejected",
		"rejected_at":      &now,
		"rejection_reason": func() string { if body.Reason != "" { return body.Reason }; return "manual_reject" }(),
	}

	if err := tx.Model(&offer).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reject offer"})
	}

	// Update latest quotation status (if exists)
	var quotation models.TripOfferQuotation
	if err := tx.Where("trip_offer_id = ?", offer.ID).Order("version DESC").First(&quotation).Error; err == nil {
		_ = tx.Model(&quotation).Updates(map[string]interface{}{
			"status":      "rejected",
			"rejected_at": &now,
		}).Error
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to complete rejection"})
	}

	// สร้างการแจ้งเตือนให้กับ guide ว่า offer ถูกปฏิเสธ
	offerID := offer.ID
	CreateNotification(
		offer.GuideID,
		"offer_rejected",
		"Offer Rejected",
		"Your offer for \"" + tripRequire.Title + "\" has been declined.",
		&offerID,
		"trip_offer",
		map[string]interface{}{
			"trip_require_id": tripRequire.ID,
			"offer_id":        offer.ID,
			"reason":          updates["rejection_reason"],
		},
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Offer rejected successfully",
		"offer":   offer,
	})
}

// GetGuideOffers - ดึงข้อเสนอทั้งหมดของ Guide ที่ login อยู่
func GetGuideOffers(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	
	// ตรวจสอบว่าเป็น Guide
	var guide models.Guide
	if err := config.DB.Where("user_id = ?", userID).First(&guide).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only guides can view their offers",
		})
	}
	
	// ดึงข้อเสนอทั้งหมดของ guide
	var offers []models.TripOffer
	if err := config.DB.
		Preload("TripRequire.User").
		Preload("TripRequire.Province").
		Preload("TripOfferQuotation").
		Preload("Guide.User").
		Where("guide_id = ?", guide.ID).
		Order("created_at DESC").
		Find(&offers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get offers",
		})
	}
	
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"offers": offers,
	})
}
