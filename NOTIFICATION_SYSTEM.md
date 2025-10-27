# Local Guide Notification System Documentation

## Overview

A complete notification system for the Local Guide application, providing real-time updates to both tourists (users) and guides about important trip events.

## Architecture

### Frontend (Next.js/React)

- **Toast Notifications**: Temporary, non-persistent notifications for immediate feedback
- **System Notifications**: Persistent notifications with bell icon and dropdown display
- **All Notifications Page**: Full list view of all user notifications

### Backend (Go/Fiber/GORM)

- **RESTful API**: Complete CRUD operations for notifications
- **Database Model**: Persistent storage with GORM
- **Event Triggers**: Automatic notification creation on key trip events

---

## Frontend Components

### 1. NotificationContext (`contexts/NotificationContext.tsx`)

Provides toast notifications for temporary, immediate feedback.

**Usage:**

```typescript
const { showNotification } = useNotification();
showNotification("Success!", "success");
```

**Types:** `success`, `error`, `info`, `warning`

### 2. NotificationSystemContext (`contexts/NotificationSystemContext.tsx`)

Manages persistent notifications with polling and state management.

**Features:**

- Polls backend every 30 seconds for new notifications
- Tracks unread count
- Provides notification CRUD operations

**Usage:**

```typescript
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = useNotificationSystem();
```

### 3. NotificationBell (`components/NotificationBell.tsx`)

Dropdown component in the navbar showing recent notifications.

**Features:**

- Badge with unread count
- Displays 5 most recent notifications
- Mark as read on click
- Link to full notifications page

### 4. All Notifications Page (`notifications/page.tsx`)

Full-page view of all notifications with filtering and actions.

**Features:**

- Filter by unread/all
- Mark individual or all as read
- Delete notifications
- Pagination support

---

## Backend API

### Base URL

`/api/notifications`

### Endpoints

#### 1. Get All Notifications

```
GET /api/notifications
Query Parameters:
  - type: string (optional) - Filter by notification type
  - is_read: boolean (optional) - Filter by read status
  - page: int (default: 1) - Page number
  - page_size: int (default: 20) - Items per page
```

**Response:**

```json
{
  "notifications": [...],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

#### 2. Get Single Notification

```
GET /api/notifications/:id
```

#### 3. Mark as Read

```
PUT /api/notifications/:id/read
```

#### 4. Mark All as Read

```
PUT /api/notifications/read-all
```

#### 5. Delete Notification

```
DELETE /api/notifications/:id
```

#### 6. Delete All Notifications

```
DELETE /api/notifications
```

#### 7. Get Unread Count

```
GET /api/notifications/unread-count
```

**Response:**

```json
{
  "count": 5
}
```

---

## Database Model

### Notification Table

```go
type Notification struct {
    ID          uint                   `gorm:"primaryKey"`
    UserID      uint                   `gorm:"not null;index"`
    Type        string                 `gorm:"not null;index"`
    Title       string                 `gorm:"not null"`
    Message     string                 `gorm:"type:text"`
    RelatedID   *uint                  `gorm:"index"`
    RelatedType string                 `gorm:"index"`
    IsRead      bool                   `gorm:"default:false;index"`
    ReadAt      *time.Time
    ActionURL   string
    Data        datatypes.JSON
    CreatedAt   time.Time
    UpdatedAt   time.Time
}
```

---

## Notification Types & Triggers

### 1. Trip Offer Events

#### `trip_offer_received`

**When:** Guide creates a new offer for a trip requirement
**Recipient:** User (Tourist)
**Message:** "You have received a new offer for your trip requirement: {title}"
**Data:**

```json
{
  "trip_require_id": 123,
  "guide_id": 45,
  "offer_id": 67
}
```

#### `offer_accepted`

**When:** User accepts a guide's offer
**Recipient:** Guide
**Message:** "Your offer has been accepted! 🎉"
**Data:**

```json
{
  "booking_id": 89,
  "offer_id": 67,
  "trip_title": "Tour in Chiang Mai",
  "total_amount": 5000
}
```

#### `offer_rejected`

**When:** User manually rejects or another offer is selected
**Recipient:** Guide
**Message:** "Your offer for \"{title}\" has been declined." or "Unfortunately, another guide was selected..."
**Data:**

```json
{
  "trip_require_id": 123,
  "offer_id": 67,
  "reason": "manual_reject" | "auto_selection"
}
```

### 2. Payment Events

#### `payment_received`

**When:** Payment successfully processed via Stripe
**Recipient:** Guide
**Message:** "Payment confirmed for booking. Get ready for the trip!"
**Data:**

```json
{
  "booking_id": 89,
  "amount": 5000
}
```

#### `booking_confirmed`

**When:** Payment successfully processed
**Recipient:** User (Tourist)
**Message:** "Your payment has been received. Your trip is confirmed!"
**Data:**

```json
{
  "booking_id": 89,
  "amount": 5000
}
```

### 3. Trip Status Events

#### `payment_released`

**When:** First payment (50%) released after guide arrival confirmation
**Recipient:** Guide
**Message:** "50% of payment has been released to you. Trip has started!"
**Data:**

```json
{
  "booking_id": 89,
  "amount": 2500,
  "release_type": "first_payment"
}
```

**When:** Final payment (50%) released after trip completion
**Recipient:** Guide
**Message:** "Remaining 50% of payment has been released to you. Trip completed!"
**Data:**

```json
{
  "booking_id": 89,
  "amount": 2500,
  "release_type": "second_payment"
}
```

#### `trip_completed`

**When:** User confirms trip completion
**Recipient:** User (Tourist)
**Message:** "Your trip has been completed. Thank you for using our service!"
**Data:**

```json
{
  "booking_id": 89
}
```

---

## Implementation Guide

### Creating Notifications in Controllers

Use the `CreateNotification` helper function:

```go
import "localguide-back/controllers"

// Example
offerID := offer.ID
err := CreateNotification(
    userID,                    // Recipient user ID
    "trip_offer_received",     // Notification type
    "New Offer Received",      // Title
    "You have a new offer!",   // Message
    &offerID,                  // Related entity ID (optional)
    "trip_offer",              // Related entity type (optional)
    map[string]interface{}{    // Additional data (optional)
        "trip_require_id": 123,
        "guide_id": 45,
    },
)
```

### Frontend Integration

#### 1. Add to Layout

Already integrated in `app/layout.tsx`:

```tsx
<NotificationProvider>
  <NotificationSystemProvider>
    <NotificationContainer />
    {children}
  </NotificationSystemProvider>
</NotificationProvider>
```

#### 2. Use in Components

```tsx
// Toast notifications
const { showNotification } = useNotification();
showNotification("Offer submitted!", "success");

// System notifications
const { notifications, unreadCount } = useNotificationSystem();
```

---

## Testing

### Manual Testing Flow

1. **User creates trip requirement**
2. **Guide creates offer** → User receives `trip_offer_received` notification
3. **User accepts offer** → Guide receives `offer_accepted` notification, other guides receive `offer_rejected`
4. **User pays** → Both receive `payment_received` and `booking_confirmed`
5. **User confirms guide arrival** → Guide receives `payment_released` (first)
6. **User confirms trip complete** → Guide receives `payment_released` (second), User receives `trip_completed`

### Backend Testing

```bash
# Run backend tests
cd localguide-back
go test ./tests/... -v
```

### Frontend Testing

```bash
# Start development server
cd localguide-front
pnpm dev

# Check notifications in browser
# Open browser console to see polling logs
```

---

## Future Enhancements

### Planned Features

- [ ] WebSocket/SSE for real-time updates (replace polling)
- [ ] Email notifications for important events
- [ ] Push notifications (PWA)
- [ ] Notification preferences/settings
- [ ] Group notifications by trip
- [ ] Mark multiple as read
- [ ] Notification sounds
- [ ] In-app notification center with search

### Additional Notification Types

- [ ] Review received
- [ ] Review responded
- [ ] Trip reminder (24 hours before)
- [ ] Message from guide/user
- [ ] Guide profile verified
- [ ] Dispute created/resolved
- [ ] Weather alerts for upcoming trips

---

## Troubleshooting

### Notifications Not Appearing

1. Check browser console for API errors
2. Verify JWT token is valid
3. Check backend logs for notification creation
4. Verify database has Notification table migrated

### Polling Not Working

1. Check NotificationSystemContext is in component tree
2. Verify `/api/notifications` endpoint is accessible
3. Check for CORS issues
4. Ensure user is authenticated

### Unread Count Incorrect

1. Clear browser cache
2. Check `is_read` field in database
3. Verify mark-as-read API calls are successful

---

## API Authentication

All notification endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The user ID is extracted from the JWT token, ensuring users can only access their own notifications.

---

## Performance Considerations

### Backend

- Database indexes on `user_id`, `is_read`, `type`, `created_at`
- Pagination to limit response size
- Efficient queries with proper Preload usage

### Frontend

- Polling interval: 30 seconds (configurable)
- Cached notification state in context
- Optimistic updates for mark-as-read
- Lazy loading of notification list

---

## Security

### Backend

- All endpoints protected by JWT authentication
- Users can only access their own notifications
- SQL injection prevention via GORM
- Input validation and sanitization

### Frontend

- XSS prevention via React's automatic escaping
- CSRF protection via token-based auth
- Secure cookie storage for tokens

---

## Maintenance

### Database Cleanup

Consider implementing a cleanup job for old notifications:

```sql
DELETE FROM notifications
WHERE is_read = true
AND read_at < NOW() - INTERVAL '90 days';
```

### Monitoring

- Track notification delivery rates
- Monitor polling performance
- Log notification creation failures
- Track user engagement with notifications

---

## Support

For issues or questions:

1. Check this documentation
2. Review code comments in notification controllers
3. Check browser/server logs
4. Contact development team

---

**Last Updated:** 2024
**Version:** 1.0.0
