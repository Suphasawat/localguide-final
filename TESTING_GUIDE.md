# 🔔 Quick Start - Testing Notification System

## Prerequisites

- Backend server running on `http://localhost:8080`
- Frontend server running on `http://localhost:3000`
- Two user accounts:
  - User A (Tourist) - for creating trip requirements
  - User B (Guide) - for creating offers

---

## 🚀 Quick Test (5 minutes)

### Step 1: Login as User A (Tourist)

1. Open browser: `http://localhost:3000`
2. Login with User A credentials
3. Notice the **bell icon** in the navbar (should show 0)

### Step 2: Create Trip Requirement

1. Go to "Create Trip Request" page
2. Fill in the form:
   - Title: "Tour in Chiang Mai"
   - Description: "Looking for a guide"
   - Date: Tomorrow
   - Duration: 1 day
   - Budget: 1000-5000 THB
3. Submit the form
4. You'll see a **green toast** notification: "Trip request created successfully!"

### Step 3: Login as User B (Guide)

1. Open a new incognito/private window
2. Go to `http://localhost:3000`
3. Login with User B (Guide) credentials
4. Notice the bell icon (should show 0)

### Step 4: Create Offer

1. Go to "Browse Trip Requests" or "Guide Dashboard"
2. Find the trip requirement created by User A
3. Click "Create Offer"
4. Fill in the offer form:
   - Title: "Professional Tour Guide Service"
   - Description: "I can show you the best spots"
   - Price: 3000 THB
   - Itinerary: "Morning temple visit, afternoon market"
5. Submit the offer
6. You'll see a **green toast**: "Offer submitted successfully!"

### Step 5: Check Notification (User A)

1. Switch back to User A's window
2. Wait up to 30 seconds (or refresh the page)
3. **Bell icon should now show "1"** (red badge)
4. Click the bell icon
5. You should see: **"New Offer Received"**
6. Click the notification
   - Badge count should decrease to 0
   - Notification should show as read

### Step 6: Accept Offer (User A)

1. Click on the notification to view the offer
2. Click "Accept Offer"
3. You'll see a **green toast**: "Offer accepted!"

### Step 7: Check Notification (User B)

1. Switch to User B (Guide) window
2. Wait up to 30 seconds (or refresh)
3. **Bell should show "1"**
4. Click the bell
5. You should see: **"Your offer has been accepted! 🎉"**

---

## ✅ What You Should See

### User A (Tourist) receives:

- ✅ "New Offer Received" - when guide creates offer
- ✅ "Booking Confirmed" - when payment succeeds
- ✅ "Trip Completed" - when trip is marked complete

### User B (Guide) receives:

- ✅ "Your offer has been accepted!" - when user accepts
- ✅ "Payment Received" - when payment succeeds
- ✅ "First Payment Released" - when trip starts (50%)
- ✅ "Final Payment Released" - when trip completes (50%)

---

## 🎯 Full Testing Flow

For a complete test of all notifications:

1. **User A creates trip requirement**
2. **Guide B creates offer** → User A gets notification ✉️
3. **Guide C creates offer** → User A gets notification ✉️
4. **User A accepts Guide B's offer** → Guide B gets accepted ✉️, Guide C gets rejected ✉️
5. **User A makes payment** → Both get payment notifications ✉️
6. **User A confirms guide arrival** → Guide B gets 50% release notification ✉️
7. **User A confirms trip complete** → Guide B gets final 50% ✉️, User A gets completion ✉️

**Total: 8 notifications** (3 for User A, 4 for Guide B, 1 for Guide C)

---

## 📱 Testing Different Features

### Test Polling (Auto-Update)

1. Keep both browser windows open
2. Create notification in one window
3. Wait 30 seconds
4. Other window should auto-update (no refresh needed)

### Test Mark as Read

1. Click on an unread notification
2. Badge count should decrease
3. Notification should appear dimmed/grayed out

### Test All Notifications Page

1. Click "View All" in notification dropdown
2. Should see all notifications
3. Filter by "Unread" or "All"
4. Try "Mark All as Read" button

### Test Delete Notification

1. In the notifications page
2. Click trash icon on a notification
3. Notification should disappear
4. Badge count should update

---

## 🐛 Troubleshooting

### Bell icon doesn't update

- **Solution**: Wait 30 seconds for polling, or refresh the page
- **Check**: Browser console for API errors

### No notifications appearing

- **Solution**: Check backend logs for notification creation
- **Check**: API endpoint `/api/notifications` returns data
- **Verify**: JWT token is valid and user is authenticated

### Notifications not marking as read

- **Solution**: Check browser console for PUT request errors
- **Check**: Backend logs for mark-as-read API calls
- **Verify**: User ID matches notification user ID

### Badge count incorrect

- **Solution**: Refresh the page
- **Check**: `/api/notifications/unread-count` endpoint
- **Database**: Check `is_read` field in notifications table

---

## 🔍 Debugging Tips

### Check Backend Logs

```bash
cd localguide-back
go run main.go

# Look for lines like:
# "Created notification for user: 123"
# "Marked notification as read: 456"
```

### Check Browser Console

```javascript
// Open DevTools (F12)
// Console tab should show:
// "Fetching notifications..."
// "Unread count: 3"
// "Marked notification 123 as read"
```

### Check Network Tab

```
Filter by: XHR
Look for:
- GET /api/notifications (every 30s)
- GET /api/notifications/unread-count (every 30s)
- PUT /api/notifications/:id/read (when clicking)
```

### Check Database

```sql
-- Check notifications table
SELECT * FROM notifications WHERE user_id = YOUR_USER_ID;

-- Check unread count
SELECT COUNT(*) FROM notifications
WHERE user_id = YOUR_USER_ID AND is_read = false;
```

---

## 📊 Expected Response Times

| Action                         | Expected Time |
| ------------------------------ | ------------- |
| Create notification            | Instant       |
| Notification appears (polling) | 0-30 seconds  |
| Mark as read                   | < 100ms       |
| Load notifications page        | < 200ms       |
| Unread count update            | < 100ms       |

---

## 🎓 Advanced Testing

### Test Concurrent Users

1. Open 3 browser windows (User A, Guide B, Guide C)
2. User A creates trip requirement
3. Both guides create offers simultaneously
4. User A accepts one offer
5. All users should receive correct notifications

### Test Edge Cases

- [ ] Delete all notifications, check badge shows 0
- [ ] Mark all as read, check all notifications grayed out
- [ ] Create notification while page is open (should appear in 30s)
- [ ] Logout and login, notifications should persist
- [ ] Access /notifications page directly (should load correctly)

### Performance Testing

- [ ] Create 100 notifications, check page load time
- [ ] Check database query performance
- [ ] Monitor polling network requests
- [ ] Test on slow network (3G simulation)

---

## ✨ Success Criteria

The test is successful if:

- ✅ All notification types appear correctly
- ✅ Badge count is always accurate
- ✅ Notifications update within 30 seconds
- ✅ Mark as read works instantly
- ✅ No console errors
- ✅ Good user experience (smooth, no lag)

---

## 📝 Report Issues

If you find bugs, please report with:

1. **What you did** (steps to reproduce)
2. **What you expected** (expected behavior)
3. **What happened** (actual behavior)
4. **Screenshots** (if applicable)
5. **Browser console logs** (errors)
6. **Backend logs** (if available)

---

**Happy Testing! 🎉**
