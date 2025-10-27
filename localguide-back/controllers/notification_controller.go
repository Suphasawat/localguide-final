package controllers

import (
	"encoding/json"
	"localguide-back/config"
	"localguide-back/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// CreateNotification - สร้าง notification ใหม่ (helper function สำหรับใช้ใน controllers อื่นๆ)
func CreateNotification(userID uint, notifType, title, message string, relatedID *uint, relatedType string, data map[string]interface{}) error {
	// Convert data to JSON string
	var dataJSON string
	if data != nil {
		dataBytes, err := json.Marshal(data)
		if err != nil {
			return err
		}
		dataJSON = string(dataBytes)
	}

	notification := models.Notification{
		UserID:      userID,
		Type:        notifType,
		Title:       title,
		Message:     message,
		RelatedID:   relatedID,
		RelatedType: relatedType,
		IsRead:      false,
		Data:        dataJSON,
	}

	return config.DB.Create(&notification).Error
}

// GetUserNotifications - ดึง notifications ของ user
func GetUserNotifications(c *fiber.Ctx) error {
	// ดึง user ID จาก context (ที่ได้จาก middleware)
	userID := c.Locals("userID").(uint)

	// Query parameters
	unreadOnly := c.Query("unread_only") == "true"
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	var notifications []models.Notification
	query := config.DB.Where("user_id = ?", userID)

	if unreadOnly {
		query = query.Where("is_read = ?", false)
	}

	// Count total notifications
	var total int64
	query.Model(&models.Notification{}).Count(&total)

	// Get notifications with pagination
	if err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notifications).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notifications",
		})
	}

	// Count unread notifications
	var unreadCount int64
	config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&unreadCount)

	return c.JSON(fiber.Map{
		"notifications": notifications,
		"total":         total,
		"unread_count":  unreadCount,
		"limit":         limit,
		"offset":        offset,
	})
}

// GetNotificationByID - ดึง notification ตาม ID
func GetNotificationByID(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	notificationID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid notification ID",
		})
	}

	var notification models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", notificationID, userID).
		First(&notification).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Notification not found",
		})
	}

	return c.JSON(notification)
}

// MarkNotificationAsRead - ทำเครื่องหมาย notification ว่าอ่านแล้ว
func MarkNotificationAsRead(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	notificationID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid notification ID",
		})
	}

	var notification models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", notificationID, userID).
		First(&notification).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Notification not found",
		})
	}

	// Update notification
	now := time.Now()
	notification.IsRead = true
	notification.ReadAt = &now

	if err := config.DB.Save(&notification).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to mark notification as read",
		})
	}

	return c.JSON(notification)
}

// MarkAllNotificationsAsRead - ทำเครื่องหมาย notifications ทั้งหมดว่าอ่านแล้ว
func MarkAllNotificationsAsRead(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	now := time.Now()

	if err := config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to mark all notifications as read",
		})
	}

	return c.JSON(fiber.Map{
		"message": "All notifications marked as read",
	})
}

// DeleteNotification - ลบ notification
func DeleteNotification(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	notificationID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid notification ID",
		})
	}

	var notification models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", notificationID, userID).
		First(&notification).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Notification not found",
		})
	}

	if err := config.DB.Delete(&notification).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete notification",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Notification deleted successfully",
	})
}

// DeleteAllNotifications - ลบ notifications ทั้งหมดของ user
func DeleteAllNotifications(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	if err := config.DB.Where("user_id = ?", userID).
		Delete(&models.Notification{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete all notifications",
		})
	}

	return c.JSON(fiber.Map{
		"message": "All notifications deleted successfully",
	})
}

// GetUnreadCount - ดึงจำนวน notifications ที่ยังไม่ได้อ่าน
func GetUnreadCount(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var count int64
	if err := config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count unread notifications",
		})
	}

	return c.JSON(fiber.Map{
		"unread_count": count,
	})
}
