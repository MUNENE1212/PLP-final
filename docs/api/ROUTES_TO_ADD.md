# Routes Configuration for New Features

## 1. Booking Routes - Add to `/backend/src/routes/booking.routes.js`

Add these new routes to your booking router:

```javascript
const {
  // ... existing imports
  requestCompletion,
  respondToCompletion,
  initiateFollowUp,
  logContactAttempt,
  completeBySupport,
  getPendingCompletions
} = require('../controllers/booking.controller');

// ... existing routes

// Job Completion Workflow Routes

// Technician requests completion (Technician only)
router.post('/:id/request-completion', auth, requestCompletion);

// Customer responds to completion request (Customer only)
router.post('/:id/respond-completion', auth, respondToCompletion);

// Support agent initiates follow-up (Support/Admin only)
router.post(
  '/:id/initiate-followup',
  auth,
  requireRole(['support', 'admin']),
  initiateFollowUp
);

// Support agent logs contact attempt (Support/Admin only)
router.post(
  '/:id/log-contact',
  auth,
  requireRole(['support', 'admin']),
  logContactAttempt
);

// Support agent completes job manually (Support/Admin only)
router.post(
  '/:id/complete-by-support',
  auth,
  requireRole(['support', 'admin']),
  completeBySupport
);

// Get bookings pending completion response (Support/Admin only)
router.get(
  '/pending-completion',
  auth,
  requireRole(['support', 'admin']),
  getPendingCompletions
);
```

---

## 2. Support Routes - Add to `/backend/src/routes/support.routes.js`

Add this new route to your support router:

```javascript
const {
  // ... existing imports
  createSupportConversation
} = require('../controllers/support.controller');

// ... existing routes

// Create or get support conversation (Anyone authenticated)
router.post('/conversation', auth, createSupportConversation);
```

**Note:** All other support endpoints already exist in the support controller.

---

## 3. Server Configuration - Add to `/backend/src/server.js`

Add cron job scheduling:

```javascript
// Add this import at the top
const cron = require('node-cron');
const {
  autoEscalateCompletionRequests,
  sendCompletionReminders,
  autoCompleteUnreachable
} = require('./jobs/completionEscalation.job');

// Add this after database connection (after MongoDB connects successfully)

// Schedule completion escalation jobs
if (process.env.NODE_ENV !== 'test') {
  console.log('🕐 Scheduling completion escalation jobs...');

  // Run every hour - Auto-escalate pending completions
  cron.schedule('0 * * * *', async () => {
    console.log('Running auto-escalation job...');
    const result = await autoEscalateCompletionRequests();
    console.log('Auto-escalation result:', result);
  });

  // Run every 12 hours - Send reminders
  cron.schedule('0 */12 * * *', async () => {
    console.log('Running completion reminder job...');
    const result = await sendCompletionReminders();
    console.log('Reminder result:', result);
  });

  // Run daily at 2 AM - Auto-complete unreachable customers
  cron.schedule('0 2 * * *', async () => {
    console.log('Running auto-complete job...');
    const result = await autoCompleteUnreachable();
    console.log('Auto-complete result:', result);
  });

  console.log('✅ Completion escalation jobs scheduled');
}
```

---

## 4. Install Required Package

If you don't have `node-cron` installed:

```bash
npm install node-cron
```

---

## 5. Middleware Required

Make sure you have these middleware functions:

### `auth` Middleware
Already exists - authenticates users

### `requireRole` Middleware
If not exists, create in `/backend/src/middleware/auth.middleware.js`:

```javascript
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

---

## 6. Complete Route Structure

### Booking Routes Summary
```
POST   /api/v1/bookings/:id/request-completion       (Technician)
POST   /api/v1/bookings/:id/respond-completion       (Customer)
POST   /api/v1/bookings/:id/initiate-followup        (Support/Admin)
POST   /api/v1/bookings/:id/log-contact              (Support/Admin)
POST   /api/v1/bookings/:id/complete-by-support      (Support/Admin)
GET    /api/v1/bookings/pending-completion           (Support/Admin)
```

### Support Routes Summary
```
POST   /api/v1/support/conversation                  (Authenticated)
POST   /api/v1/support/tickets                       (Authenticated)
GET    /api/v1/support/tickets                       (Authenticated)
GET    /api/v1/support/tickets/:id                   (Authenticated)
POST   /api/v1/support/tickets/:id/messages          (Authenticated)
PUT    /api/v1/support/tickets/:id/assign            (Support/Admin)
PUT    /api/v1/support/tickets/:id/status            (Support/Admin)
PUT    /api/v1/support/tickets/:id/priority          (Support/Admin)
PUT    /api/v1/support/tickets/:id/close             (Support/Admin)
PUT    /api/v1/support/tickets/:id/reopen            (Authenticated)
PUT    /api/v1/support/tickets/:id/escalate          (Support/Admin)
POST   /api/v1/support/tickets/:id/rate              (Customer)
GET    /api/v1/support/stats                         (Support/Admin)
GET    /api/v1/support/dashboard                     (Support/Admin)
PUT    /api/v1/support/availability                  (Support)
```

---

## 7. Testing the Routes

### Test Completion Workflow

1. **As Technician:**
```bash
# Request completion
curl -X POST http://localhost:5000/api/v1/bookings/{bookingId}/request-completion \
  -H "Authorization: Bearer {technicianToken}"
```

2. **As Customer:**
```bash
# Approve completion
curl -X POST http://localhost:5000/api/v1/bookings/{bookingId}/respond-completion \
  -H "Authorization: Bearer {customerToken}" \
  -H "Content-Type: application/json" \
  -d '{"approved": true, "feedback": "Great work!"}'

# Or reject
curl -X POST http://localhost:5000/api/v1/bookings/{bookingId}/respond-completion \
  -H "Authorization: Bearer {customerToken}" \
  -H "Content-Type: application/json" \
  -d '{"approved": false, "issues": "Work incomplete"}'
```

3. **As Support (after 48 hours with no response):**
```bash
# Get pending completions
curl -X GET http://localhost:5000/api/v1/bookings/pending-completion \
  -H "Authorization: Bearer {supportToken}"

# Initiate follow-up
curl -X POST http://localhost:5000/api/v1/bookings/{bookingId}/initiate-followup \
  -H "Authorization: Bearer {supportToken}"

# Log contact attempt
curl -X POST http://localhost:5000/api/v1/bookings/{bookingId}/log-contact \
  -H "Authorization: Bearer {supportToken}" \
  -H "Content-Type: application/json" \
  -d '{"method": "call", "reached": true, "notes": "Customer confirmed"}'

# Complete manually
curl -X POST http://localhost:5000/api/v1/bookings/{bookingId}/complete-by-support \
  -H "Authorization: Bearer {supportToken}" \
  -H "Content-Type: application/json" \
  -d '{"outcome": "customer_confirmed", "notes": "Verified via phone call"}'
```

### Test Support Messaging

1. **Create Support Conversation:**
```bash
curl -X POST http://localhost:5000/api/v1/support/conversation \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"message": "I need help with my booking"}'

# With ticket
curl -X POST http://localhost:5000/api/v1/support/conversation \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "{ticketId}", "message": "Following up on my ticket"}'
```

2. **Create Support Ticket:**
```bash
curl -X POST http://localhost:5000/api/v1/support/tickets \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Payment Issue",
    "description": "Cannot complete payment",
    "category": "payment",
    "priority": "high"
  }'
```

---

## 8. Frontend Integration Points

### Customer Views Needed

1. **Completion Request Notification**
   - Show modal/notification when technician requests completion
   - "Review & Approve" or "Report Issues" buttons

2. **Completion Response Form**
   - Approve/Reject toggle
   - Feedback textarea
   - Issues textarea (if rejecting)

3. **Support Chat Button**
   - Floating button on all pages
   - "Contact Support" in navigation
   - Quick access from bookings page

### Technician Views Needed

1. **Request Completion Button**
   - On active booking detail page
   - Disabled if already requested
   - Shows status of request

2. **Completion Status**
   - Pending customer response
   - Approved/Rejected indicator
   - Support follow-up status

### Support Agent Dashboard Needed

1. **Pending Completions Tab**
   - List of bookings needing follow-up
   - Days since escalation
   - Contact attempt history

2. **Follow-up Actions**
   - Initiate follow-up button
   - Log contact attempt form
   - Complete job button with outcome selection

3. **Support Ticket Queue**
   - All existing support ticket views
   - Dashboard with metrics
   - Ticket assignment interface

---

## Need Help?

If you encounter issues:
1. Check console for error messages
2. Verify all imports are correct
3. Ensure middleware is properly configured
4. Review the full documentation in `SUPPORT_AND_COMPLETION_FEATURES.md`
