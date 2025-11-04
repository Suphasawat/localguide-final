package middleware

import (
	"fmt"
	"localguide-back/config"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// JWT Claims structure
type Claims struct {
	UserID uint `json:"user_id"`
	RoleID uint `json:"role_id"`
	jwt.RegisteredClaims
}

// AuthRequired middleware - ตรวจสอบว่ามี token หรือไม่
func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// ดึง token จาก Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header required",
			})
		}

		// ตรวจสอบ format: "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token format",
			})
		}

		// Parse และ validate JWT token
		token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
			return config.JWTSecret, nil 
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		// ดึงข้อมูล claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token claims",
			})
		}

		// ดึง user_id และ role_id จาก claims
		userIDFloat, userIDExists := claims["user_id"].(float64)
		roleIDFloat, roleIDExists := claims["role_id"].(float64)
		
		if !userIDExists || !roleIDExists {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing user or role information in token",
			})
		}

		// เก็บข้อมูล user ใน context
		c.Locals("user_id", uint(userIDFloat))
		c.Locals("role_id", uint(roleIDFloat))

		return c.Next()
	}
}

// AdminRequired middleware - ตรวจสอบว่าเป็น admin (roleID = 3)
func AdminRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleID := c.Locals("role_id")
		if roleID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User role not found",
			})
		}

		role, ok := roleID.(uint)
		if !ok || role != 3 { // 3 = Admin role
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Admin access required",
			})
		}

		return c.Next()
	}
}

// GuideRequired middleware - ตรวจสอบว่าเป็น guide (roleID = 2)
func GuideRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleID := c.Locals("role_id")
		if roleID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User role not found",
			})
		}

		role, ok := roleID.(uint)
		if !ok || role != 2 { // 2 = Guide role
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Guide access required",
			})
		}

		return c.Next()
	}
}

// UserRequired middleware - ตรวจสอบว่าเป็น user หรือ guide หรือ admin (roleID = 1, 2, 3)
func UserRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleID := c.Locals("role_id")
		if roleID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User role not found",
			})
		}

		role, ok := roleID.(uint)
		if !ok || (role != 1 && role != 2 && role != 3) { // 1 = User, 2 = Guide, 3 = Admin
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "User access required",
			})
		}

		return c.Next()
	}
}

// OwnerOrAdminRequired middleware - ตรวจสอบว่าเป็นเจ้าของข้อมูลหรือ admin
func OwnerOrAdminRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id")
		roleID := c.Locals("role_id")
		
		if userID == nil || roleID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User information not found",
			})
		}

		currentUserID, ok1 := userID.(uint)
		currentRoleID, ok2 := roleID.(uint)
		
		if !ok1 || !ok2 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid user information",
			})
		}

		// ถ้าเป็น admin ให้ผ่านได้เลย
		if currentRoleID == 3 {
			return c.Next()
		}

		// ตรวจสอบว่าเป็นเจ้าของข้อมูลหรือไม่
		paramUserID := c.Params("id")
		if paramUserID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "User ID parameter required",
			})
		}

		// เปรียบเทียบ ID โดยตรง (convert uint to string)
		if fmt.Sprintf("%d", currentUserID) != paramUserID {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied: You can only access your own data",
			})
		}

		return c.Next()
	}
}
