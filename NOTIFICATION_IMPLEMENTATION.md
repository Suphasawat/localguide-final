# Notification System - Quick Reference

## Implemented Notification Triggers

### ✅ Trip Offer Flow

| Event                                   | Trigger File                                    | Recipient         | Notification Type                 |
| --------------------------------------- | ----------------------------------------------- | ----------------- | --------------------------------- |
| Guide creates offer                     | `tripOffer_controller.go` → `CreateTripOffer()` | User (Tourist)    | `trip_offer_received`             |
| User accepts offer                      | `tripOffer_controller.go` → `AcceptTripOffer()` | Guide (Accepted)  | `offer_accepted`                  |
| User accepts offer (auto-reject others) | `tripOffer_controller.go` → `AcceptTripOffer()` | Guides (Rejected) | `offer_rejected` (auto_selection) |
| User manually rejects offer             | `tripOffer_controller.go` → `RejectTripOffer()` | Guide             | `offer_rejected` (manual_reject)  |

### ✅ Payment & Booking Flow

| Event                               | Trigger File                                              | Recipient      | Notification Type   |
| ----------------------------------- | --------------------------------------------------------- | -------------- | ------------------- |
| Payment successful (Stripe webhook) | `stripe_webhook_controller.go` → `handlePaymentSuccess()` | Guide          | `payment_received`  |
| Payment successful (Stripe webhook) | `stripe_webhook_controller.go` → `handlePaymentSuccess()` | User (Tourist) | `booking_confirmed` |

### ✅ Trip Status Flow

| Event                                     | Trigger File                                         | Recipient      | Notification Type                   |
| ----------------------------------------- | ---------------------------------------------------- | -------------- | ----------------------------------- |
| User confirms guide arrival (50% release) | `tripStatus_controller.go` → `ConfirmGuideArrival()` | Guide          | `payment_released` (first_payment)  |
| User confirms trip complete (50% release) | `tripStatus_controller.go` → `ConfirmTripComplete()` | Guide          | `payment_released` (second_payment) |
| User confirms trip complete               | `tripStatus_controller.go` → `ConfirmTripComplete()` | User (Tourist) | `trip_completed`                    |

---

## File Locations

### Backend Controllers (with notifications)

- `/localguide-back/controllers/notification_controller.go` - Main notification CRUD
- `/localguide-back/controllers/tripOffer_controller.go` - Offer notifications
- `/localguide-back/controllers/stripe_webhook_controller.go` - Payment notifications
- `/localguide-back/controllers/tripStatus_controller.go` - Trip status notifications

### Backend Models

- `/localguide-back/models/models.go` - Notification model definition

### Backend Routes

- `/localguide-back/main.go` - Notification API routes registration

### Frontend Components

- `/localguide-front/src/app/contexts/NotificationContext.tsx` - Toast notifications
- `/localguide-front/src/app/contexts/NotificationSystemContext.tsx` - System notifications
- `/localguide-front/src/app/components/NotificationContainer.tsx` - Toast display
- `/localguide-front/src/app/components/NotificationBell.tsx` - Navbar bell & dropdown
- `/localguide-front/src/app/notifications/page.tsx` - All notifications page

### Frontend Integration

- `/localguide-front/src/app/layout.tsx` - Providers added
- `/localguide-front/src/app/components/Navbar.tsx` - NotificationBell added

---

## Testing Checklist

- [ ] **User Journey 1: Create Trip Requirement → Guide Offers**

  - [ ] User creates trip requirement
  - [ ] Guide creates offer
  - [ ] User receives "New Offer Received" notification ✅

- [ ] **User Journey 2: Accept Offer**

  - [ ] User accepts one offer
  - [ ] Accepted guide receives "Offer Accepted" notification ✅
  - [ ] Other guides receive "Offer Not Selected" notification ✅

- [ ] **User Journey 3: Reject Offer**

  - [ ] User manually rejects offer
  - [ ] Guide receives "Offer Rejected" notification ✅

- [ ] **User Journey 4: Payment Flow**

  - [ ] User makes payment
  - [ ] Guide receives "Payment Received" notification ✅
  - [ ] User receives "Booking Confirmed" notification ✅

- [ ] **User Journey 5: Trip Execution**

  - [ ] User confirms guide arrival
  - [ ] Guide receives "First Payment Released" notification ✅
  - [ ] User confirms trip complete
  - [ ] Guide receives "Final Payment Released" notification ✅
  - [ ] User receives "Trip Completed" notification ✅

- [ ] **Frontend Testing**

  - [ ] Toast notifications appear and auto-dismiss
  - [ ] Bell icon shows unread count
  - [ ] Dropdown shows recent notifications
  - [ ] Mark as read works
  - [ ] All notifications page loads
  - [ ] Filtering works
  - [ ] Delete works
  - [ ] Polling updates notifications (30s interval)

- [ ] **Backend API Testing**
  - [ ] GET /api/notifications returns list
  - [ ] GET /api/notifications/:id returns single notification
  - [ ] PUT /api/notifications/:id/read marks as read
  - [ ] PUT /api/notifications/read-all marks all as read
  - [ ] DELETE /api/notifications/:id deletes notification
  - [ ] DELETE /api/notifications deletes all
  - [ ] GET /api/notifications/unread-count returns count
  - [ ] All endpoints require authentication
  - [ ] Users can only access their own notifications

---

## Quick Start Testing

### 1. Start Backend

```bash
cd localguide-back
go run main.go
```

### 2. Start Frontend

```bash
cd localguide-front
pnpm dev
```

### 3. Test Flow

1. Login as User A (Tourist)
2. Create a trip requirement
3. Login as User B (Guide)
4. Create an offer for the trip
5. Switch back to User A
6. Check notifications (should see "New Offer Received")
7. Accept the offer
8. Switch to User B
9. Check notifications (should see "Offer Accepted")

### 4. Monitor

- Open browser console to see polling logs
- Check backend logs for notification creation
- Use browser DevTools Network tab to monitor API calls

---

## Known Issues & Limitations

1. **Polling vs Real-time**: Currently using polling (30s). Consider WebSocket for production.
2. **No Email Notifications**: In-app only. Email integration pending.
3. **No Notification Preferences**: Users cannot customize notification types yet.
4. **No Batch Operations**: Cannot mark multiple specific notifications as read (only all).
5. **No Search**: Cannot search notifications on all-notifications page.

---

## Next Steps

1. ✅ **Complete Backend Integration** - DONE
2. ✅ **Add Notification Triggers** - DONE
3. ⏳ **End-to-End Testing** - IN PROGRESS
4. ⏳ **Production Deployment** - PENDING
5. ⏳ **Performance Optimization** - PENDING
6. ⏳ **Real-time Updates (WebSocket)** - FUTURE
7. ⏳ **Email Notifications** - FUTURE
8. ⏳ **Push Notifications** - FUTURE

---

**Status:** ✅ Backend Complete | ✅ Frontend Complete | ⏳ Testing Required
