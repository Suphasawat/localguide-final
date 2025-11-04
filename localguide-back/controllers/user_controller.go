package controllers

import (
	"fmt"
	"io"
	"localguide-back/config"
	"localguide-back/models"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetUserProfile - ดึงข้อมูล profile ของผู้ใช้ที่ login อยู่
func GetUserProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var user models.User

	if err := config.DB.
		Preload("AuthUser").
		Preload("Role").
		First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(fiber.Map{"user": user})
}

// UpdateUserProfile - อัปเดตข้อมูล profile ของผู้ใช้ที่ login อยู่
func UpdateUserProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var req struct {
		FirstName   string `json:"first_name"`
		LastName    string `json:"last_name"`
		Nickname    string `json:"nickname"`
		BirthDate   string `json:"birth_date"`
		Phone       string `json:"phone"`
		Nationality string `json:"nationality"`
		Sex         string `json:"sex"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Update fields
	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.Nickname = req.Nickname
	user.Phone = req.Phone
	user.Nationality = req.Nationality
	user.Sex = req.Sex

	// Parse birth date if provided
	if req.BirthDate != "" {
		if birthDate, err := time.Parse("2006-01-02", req.BirthDate); err == nil {
			user.BirthDate = &birthDate
		}
	}

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	// Reload user with relations
	if err := config.DB.
		Preload("AuthUser").
		Preload("Role").
		First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reload user data"})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"user":    user,
	})
}

func GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("id")
	var user models.User

	if err := config.DB.
		Preload("AuthUser").
		Preload("Role").
		First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}

func EditUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user"})
	}

	return c.JSON(user)
}

// UploadProfileAvatar - อัพโหลดรูปโปรไฟล์ของผู้ใช้ที่ล็อกอิน
func UploadProfileAvatar(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	fileHeader, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No avatar file uploaded (field name: avatar)"})
	}

	// ขนาดสูงสุด 5MB
	const maxSize = 5 * 1024 * 1024
	if fileHeader.Size > maxSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File too large. Max 5MB"})
	}

	// ตรวจสอบประเภทไฟล์โดยอ่าน header
	f, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to open uploaded file"})
	}
	defer f.Close()

	buf := make([]byte, 512)
	n, _ := f.Read(buf)
	contentType := http.DetectContentType(buf[:n])
	if !strings.HasPrefix(contentType, "image/") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid file type. Only images are allowed"})
	}

	// สร้างโฟลเดอร์ถ้ายังไม่มี
	uploadDir := "./uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload directory"})
	}

	// ตั้งชื่อไฟล์ให้ไม่ชนกัน
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext == "" {
		ext = ".jpg"
	}
	filename := fmt.Sprintf("avatar_%d_%d%s", userID, time.Now().Unix(), ext)
	savePath := filepath.Join(uploadDir, filename)

	// ใช้ c.SaveFile เพื่อบันทึกไฟล์
	if err := c.SaveFile(fileHeader, savePath); err != nil {
		// บางครั้ง c.SaveFile อาจล้มเหลวถ้าเราอ่านไฟล์ไปแล้ว; fallback write manually
		// รีโอเพ่นและคัดลอก
		f2, _ := fileHeader.Open()
		defer func() {
			if f2 != nil {
				f2.Close()
			}
		}()
		out, err2 := os.Create(savePath)
		if err2 != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
		}
		defer out.Close()
		if _, err3 := io.Copy(out, f2); err3 != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to write file"})
		}
	}

	// บันทึก URL/เส้นทางลงฐานข้อมูล (ให้เข้าถึงได้จาก /uploads/...)
	avatarURL := "/uploads/avatars/" + filename

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		// ถ้าไม่พบผู้ใช้ ลบไฟล์ที่เพิ่งอัพขึ้น
		os.Remove(savePath)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	user.Avatar = avatarURL
	if err := config.DB.Save(&user).Error; err != nil {
		// ลบไฟล์ถ้า DB update ล้มเหลว
		os.Remove(savePath)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user avatar"})
	}

	// Return updated user profile (selectively) และ URL
	return c.JSON(fiber.Map{
		"message":    "Avatar uploaded successfully",
		"avatar_url": avatarURL,
		"user":       user,
	})
}

// DeleteProfileAvatar - ลบรูปโปรไฟล์ของผู้ใช้ (และไฟล์บน disk)
func DeleteProfileAvatar(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}
	if user.Avatar == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No avatar to delete"})
	}
	// ลบไฟล์
	path := "." + user.Avatar // avatar stored as /uploads/avatars/...
	_ = os.Remove(path)
	user.Avatar = ""
	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to clear avatar field"})
	}
	return c.JSON(fiber.Map{"message": "Avatar deleted"})
}
