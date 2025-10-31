# Support Messaging & Job Completion Workflow

This document describes the implementation of two major features:
1. **Support Messaging System** - Customers can message support anytime for queries and complaints
2. **Job Completion & Review Workflow** - Technicians request completion confirmation, with support follow-up

---

## 1. Support Messaging System

### Overview
Customers can create support tickets and have real-time conversations with support agents for any queries, complaints, or issues.

### Database Models

#### SupportTicket Model
Location: `/backend/src/models/SupportTicket.js`

Key Features:
- Ticket tracking with unique ticket numbers
- Multiple categories (account, booking, payment, technical, billing, complaint, etc.)
- Priority levels (low, medium, high, urgent)
- Status workflow (open → assigned → in_progress → resolved → closed)
- SLA (Service Level Agreement) tracking for response and resolution times
- Message threading within tickets
- Internal notes for support team
- Customer satisfaction ratings
- Escalation support
- Auto-close functionality

### API Endpoints

#### Support Ticket Endpoints

**1. Create Support Ticket**
```
POST /api/v1/support/tickets
Body: {
  subject: "Issue with payment",
  description: "Unable to complete payment for booking",
  category: "payment",
  priority: "high",
  relatedBooking: "bookingId" (optional),
  attachments: [] (optional)
}
```

**2. Get All Tickets (with filters)**
```
GET /api/v1/support/tickets?status=open&priority=high&category=payment
```

**3. Get Single Ticket**
```
GET /api/v1/support/tickets/:id
```

**4. Add Message to Ticket**
```
POST /api/v1/support/tickets/:id/messages
Body: {
  message: "Thank you for your response",
  attachments: [] (optional),
  isInternal: false
}
```

**5. Create/Get Support Conversation (NEW)**
```
POST /api/v1/support/conversation
Body: {
  ticketId: "ticketId" (optional),
  message: "I need help with..."
}
```

This endpoint:
- Creates a real-time conversation with support
- Auto-assigns to available support agent with least workload
- Links conversation to ticket if ticketId provided
- Supports messaging without creating a ticket first

#### Support Agent Endpoints (Support/Admin only)

**1. Assign Ticket**
```
PUT /api/v1/support/tickets/:id/assign
Body: { agentId: "userId" }
```

**2. Update Ticket Status**
```
PUT /api/v1/support/tickets/:id/status
Body: { status: "in_progress", notes: "Working on it" }
```

**3. Update Priority**
```
PUT /api/v1/support/tickets/:id/priority
Body: { priority: "urgent" }
```

**4. Close/Resolve Ticket**
```
PUT /api/v1/support/tickets/:id/close
Body: {
  summary: "Issue resolved by...",
  resolutionType: "solved",
  resolutionNotes: "..."
}
```

**5. Escalate Ticket**
```
PUT /api/v1/support/tickets/:id/escalate
Body: {
  escalatedTo: "seniorAgentId",
  reason: "Requires manager approval"
}
```

**6. Get Support Dashboard**
```
GET /api/v1/support/dashboard
```

---

## 2. Job Completion & Review Workflow

### Overview
When a technician completes a job, they request confirmation from the customer. If the customer doesn't respond within 48 hours, the system auto-escalates to support for follow-up.

### Workflow States

```
Technician completes work → Request Completion
                                ↓
                    Customer responds within 48hrs?
                    ↙                          ↘
            YES - Approved                   NO - Auto-escalate
              ↓                                ↓
      Status: verified              Support Follow-up Initiated
                                              ↓
                                    Support contacts customer
                                              ↓
                                    3 outcomes possible:
                                    - Customer confirms
                                    - Customer disputes
                                    - Unreachable (auto-complete after 7 days)
```

### Database Schema Changes

#### Booking Model - New Field: `completionRequest`
Location: `/backend/src/models/Booking.js` (Lines 225-285)

```javascript
completionRequest: {
  requestedBy: ObjectId,        // Technician who requested
  requestedAt: Date,
  status: String,               // pending, approved, rejected, escalated, auto_approved
  customerResponse: {
    respondedAt: Date,
    approved: Boolean,
    feedback: String,
    issues: String
  },
  supportFollowUp: {
    initiated: Boolean,
    initiatedAt: Date,
    supportAgent: ObjectId,
    contactAttempts: [{
      method: String,           // call, sms, email, in_app
      attemptedAt: Date,
      reached: Boolean,
      notes: String
    }],
    outcome: String,            // customer_confirmed, customer_disputed, unreachable, auto_completed
    completedBy: ObjectId,
    completedAt: Date,
    notes: String
  },
  escalationDeadline: Date,     // Auto-escalate after this
  autoEscalated: Boolean
}
```

### API Endpoints

#### Technician Endpoints

**1. Request Completion**
```
POST /api/v1/bookings/:id/request-completion
```

Requirements:
- Must be the assigned technician
- Booking status must be 'in_progress'

Actions:
- Creates completion request
- Sets status to 'completed'
- Sets 48-hour escalation deadline
- Sends notification to customer

#### Customer Endpoints

**2. Respond to Completion Request**
```
POST /api/v1/bookings/:id/respond-completion
Body: {
  approved: true,           // or false
  feedback: "Great work!",
  issues: "..."            // if not approved
}
```

If Approved:
- Status changes to 'verified'
- Customer can now leave a review

If Rejected:
- Status returns to 'in_progress'
- Auto-creates support ticket with high priority
- Technician must resolve issues

#### Support Endpoints (Support/Admin only)

**3. Get Pending Completions**
```
GET /api/v1/bookings/pending-completion
```

Returns bookings that have passed escalation deadline and need follow-up.

**4. Initiate Follow-up**
```
POST /api/v1/bookings/:id/initiate-followup
```

Actions:
- Marks as escalated
- Assigns to support agent
- Initializes contact attempt tracking

**5. Log Contact Attempt**
```
POST /api/v1/bookings/:id/log-contact
Body: {
  method: "call",
  reached: true,
  notes: "Customer confirmed completion"
}
```

**6. Complete by Support**
```
POST /api/v1/bookings/:id/complete-by-support
Body: {
  outcome: "customer_confirmed",  // or customer_disputed, unreachable, auto_completed
  notes: "Spoke with customer, confirmed work completed satisfactorily"
}
```

Outcomes:
- `customer_confirmed`: Status → 'verified'
- `customer_disputed`: Status → 'disputed'
- `unreachable`: Status → 'verified' (after multiple attempts)
- `auto_completed`: Status → 'verified' (system decision)

---

## 3. Automated Jobs

Location: `/backend/src/jobs/completionEscalation.job.js`

### Job 1: Auto-Escalate Completion Requests
**Schedule:** Run every hour

**Function:** `autoEscalateCompletionRequests()`

Actions:
- Finds bookings with pending completion past deadline
- Creates support ticket for each
- Marks as auto-escalated
- Initializes support follow-up

### Job 2: Send Completion Reminders
**Schedule:** Run every 12 hours

**Function:** `sendCompletionReminders()`

Actions:
- Finds bookings escalating in next 24 hours
- Sends reminder notifications to customers
- Prevents escalation if customer responds

### Job 3: Auto-Complete Unreachable
**Schedule:** Run daily

**Function:** `autoCompleteUnreachable()`

Actions:
- Finds bookings with 3+ failed contact attempts over 7+ days
- Auto-completes as 'unreachable'
- Status → 'verified'
- Sends final notification

---

## 4. Integration with Existing Systems

### With Review System
- Customer can only review after completion is verified
- If customer rejects completion, review is blocked until resolution
- Review request is sent after completion is verified

### With Conversation System
- Support tickets can have linked conversations
- Real-time messaging between customer and support
- Booking conversations remain separate

### With Notification System
- Notifications sent at each stage:
  - Completion request created
  - Customer response (approve/reject)
  - Auto-escalation to support
  - Support follow-up outcomes
  - Auto-completion

---

## 5. Setup Instructions

### 1. Database Migration
No migration needed - schema changes are additive. Existing bookings will work normally.

### 2. Add Cron Jobs
You need to schedule the jobs in your cron scheduler. Example using node-cron:

```javascript
// In your server.js or separate scheduler file
const cron = require('node-cron');
const {
  autoEscalateCompletionRequests,
  sendCompletionReminders,
  autoCompleteUnreachable
} = require('./jobs/completionEscalation.job');

// Run every hour
cron.schedule('0 * * * *', autoEscalateCompletionRequests);

// Run every 12 hours
cron.schedule('0 */12 * * *', sendCompletionReminders);

// Run daily at 2 AM
cron.schedule('0 2 * * *', autoCompleteUnreachable);
```

### 3. Update Routes
Add new routes to your booking and support routers:

```javascript
// Booking routes
router.post('/:id/request-completion', auth, requestCompletion);
router.post('/:id/respond-completion', auth, respondToCompletion);
router.post('/:id/initiate-followup', auth, requireRole(['support', 'admin']), initiateFollowUp);
router.post('/:id/log-contact', auth, requireRole(['support', 'admin']), logContactAttempt);
router.post('/:id/complete-by-support', auth, requireRole(['support', 'admin']), completeBySupport);
router.get('/pending-completion', auth, requireRole(['support', 'admin']), getPendingCompletions);

// Support routes
router.post('/conversation', auth, createSupportConversation);
```

### 4. Environment Variables
Add these to your `.env`:

```
# Support Configuration
SUPPORT_EMAIL=support@yourapp.com
COMPLETION_ESCALATION_HOURS=48
AUTO_COMPLETE_DAYS=7
MIN_CONTACT_ATTEMPTS=3
```

---

## 6. Testing Checklist

### Support Messaging
- [ ] Customer can create support ticket
- [ ] Customer can message within ticket
- [ ] Customer can create support conversation without ticket
- [ ] Support agent is auto-assigned based on workload
- [ ] Support agent can respond to tickets
- [ ] Support agent can see dashboard with assigned tickets
- [ ] Ticket status workflow works correctly
- [ ] SLA tracking works
- [ ] Customer satisfaction rating works

### Job Completion Workflow
- [ ] Technician can request completion
- [ ] Customer receives notification
- [ ] Customer can approve completion
- [ ] Customer can reject with issues
- [ ] Rejection creates support ticket
- [ ] Auto-escalation works after 48 hours
- [ ] Support can initiate follow-up
- [ ] Support can log contact attempts
- [ ] Support can complete job manually
- [ ] Auto-complete works after 7 days

### Integration
- [ ] Review system blocks reviews until verification
- [ ] Notifications sent at all stages
- [ ] Socket.io updates for real-time messaging
- [ ] Email/SMS notifications configured

---

## 7. Future Enhancements

1. **AI-Powered Support**
   - Auto-categorize tickets
   - Suggest responses to agents
   - Predict resolution time

2. **Multi-Channel Support**
   - WhatsApp integration
   - Facebook Messenger
   - Instagram DM

3. **Advanced Analytics**
   - Agent performance metrics
   - Customer satisfaction trends
   - Common issue detection

4. **Video/Voice Calls**
   - In-app video calls with support
   - Screen sharing for technical issues

5. **Knowledge Base**
   - Self-service articles
   - FAQ automation
   - Chatbot for common questions

---

## 8. Support Agent Dashboard Overview

### Key Metrics Displayed
- Active tickets count
- Average response time
- Average resolution time
- Customer satisfaction rating
- SLA compliance rate

### Quick Actions
- View unassigned tickets
- View urgent tickets
- Update availability status
- Bulk ticket actions

### Filters
- By status, priority, category
- By date range
- By customer or booking
- Text search

---

## Need Help?

For questions or issues with these features:
1. Create a support ticket (dogfooding!)
2. Check the code documentation
3. Review test cases
4. Contact the development team

---

**Last Updated:** January 2025
**Version:** 1.0
