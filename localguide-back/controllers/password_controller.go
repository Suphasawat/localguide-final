package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"localguide-back/config"
	"localguide-back/models"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

func ForgotPassword(c *fiber.Ctx) error {
    var req struct {
        Email string `json:"email"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
    }

    // ตรวจสอบว่า email มีอยู่ในระบบหรือไม่
    var authUser models.AuthUser
    if err := config.DB.Where("email = ?", req.Email).First(&authUser).Error; err != nil {
        // ไม่แจ้ง error เพื่อความปลอดภัย
        return c.JSON(fiber.Map{"message": "If email exists, reset link has been sent"})
    }

    // สร้าง token
    bytes := make([]byte, 32)
    rand.Read(bytes)
    token := hex.EncodeToString(bytes)

    // เก็บ token ใน database
    passwordReset := models.PasswordReset{
        Email:     req.Email,
        Token:     token,
        ExpiresAt: time.Now().Add(time.Hour * 1), // หมดอายุใน 1 ชั่วโมง
        Used:      false,
    }

    if err := config.DB.Create(&passwordReset).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create reset token"})
    }

    // ส่งอีเมล
    if err := sendResetEmail(req.Email, token); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to send email"})
    }

    return c.JSON(fiber.Map{"message": "If email exists, reset link has been sent"})
}

func ResetPassword(c *fiber.Ctx) error {
    var req struct {
        Token    string `json:"token"`
        Password string `json:"password"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
    }

    // ตรวจสอบ token
    var passwordReset models.PasswordReset
    if err := config.DB.Where("token = ? AND used = false AND expires_at > ?", 
        req.Token, time.Now()).First(&passwordReset).Error; err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid or expired token"})
    }

    // Hash รหัสผ่านใหม่
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Password hash failed"})
    }

    tx := config.DB.Begin()
    defer tx.Rollback()

    // อัปเดตรหัสผ่าน
    if err := tx.Model(&models.AuthUser{}).Where("email = ?", passwordReset.Email).
        Update("password", string(hashedPassword)).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update password"})
    }

    // ทำเครื่องหมายว่า token ถูกใช้แล้ว
    if err := tx.Model(&passwordReset).Update("used", true).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to mark token as used"})
    }

    if err := tx.Commit().Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to commit transaction"})
    }

    return c.JSON(fiber.Map{"message": "Password reset successfully"})
}

func sendResetEmail(email, token string) error {
    m := gomail.NewMessage()
    m.SetHeader("From", os.Getenv("SMTP_FROM"))
    m.SetHeader("To", email)
    m.SetHeader("Subject", "รีเซ็ตรหัสผ่าน - LocalGuide")
    
    resetURL := fmt.Sprintf("http://localhost:3000/auth/reset-password?token=%s", token)
    body := fmt.Sprintf(`
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>คุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์ด้านล่าง:</p>
        <a href="%s">รีเซ็ตรหัสผ่าน</a>
        <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
    `, resetURL)
    
    m.SetBody("text/html", body)

    d := gomail.NewDialer(
        os.Getenv("SMTP_HOST"),
        465, // SMTP port
        os.Getenv("SMTP_USER"),
        os.Getenv("SMTP_PASS"),
    )

    return d.DialAndSend(m)
}