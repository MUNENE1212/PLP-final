# Technical Debt Documentation

This document tracks all TODO comments and incomplete features in the Dumu Waks codebase.

**Last Updated:** 2026-02-15

---

## Summary

| Category | Count | Priority |
|----------|-------|----------|
| Notifications | 20 | High |
| Payments/Escrow | 8 | High |
| Email/SMS | 4 | Medium |
| Socket.io Events | 6 | Medium |
| AI Matching | 3 | Medium |
| File Uploads | 1 | Low |
| Frontend Integrations | 3 | Medium |

---

## High Priority Items

### 1. Payment Processing (booking.controller.js)

These are critical for the escrow and refund system.

| Location | TODO | Description |
|----------|------|-------------|
| Line 469 | Trigger payment release from escrow | Implement escrow release when job is completed |
| Line 785 | Process refund | Implement refund logic for cancelled bookings |
| Line 788 | Release payment | Full payment release for completed jobs |
| Line 791 | Process partial refund | Handle partial refunds for disputes |

### 2. Notification System

Multiple controllers need notification integration.

| Location | TODO | Description |
|----------|------|-------------|
| auth.controller.js:73 | Send verification email | Email verification on registration |
| auth.controller.js:380 | Send reset email | Password reset email |
| booking.controller.js:167 | Send notification to technician | Notify on assignment |
| booking.controller.js:497 | Send notifications | Status change notifications |
| booking.controller.js:565 | Send notification to technician | New booking alert |
| booking.controller.js:741 | Notify admin and other party | Dispute escalation |
| booking.controller.js:796 | Notify both parties | Resolution notification |
| booking.controller.js:906-907 | Send notification/email to customer | Job completion |
| booking.controller.js:992-993 | Send notification to technician/reject support | Quote response |
| booking.controller.js:1298-1299 | Send notification/Create conversation | On assignment |
| support.controller.js:81-82 | Notify support team/Auto-assign | New ticket |
| support.controller.js:319-320 | Send notification/Socket.io update | Ticket update |
| support.controller.js:381 | Notify assigned agent | Ticket assignment |
| support.controller.js:501 | Send satisfaction survey | Ticket closure |
| support.controller.js:584 | Notify escalated person | Ticket escalation |

---

## Medium Priority Items

### 3. Real-time Features (Socket.io)

| Location | TODO | Description |
|----------|------|-------------|
| message.controller.js:59-60 | Emit socket.io event/Send push notification | Real-time message delivery |
| message.controller.js:265-266 | Emit socket.io event/Send push notification | Message deletion |
| post.controller.js:311-312 | Emit socket.io event/Remove from feeds | Post like/unlike |

### 4. AI Matching System

| Location | TODO | Description |
|----------|------|-------------|
| booking.controller.js:168 | Trigger AI matching | When no technician assigned |
| booking.controller.js:1310 | Trigger AI matching algorithm | For booking assignment |
| booking.payment.controller.js:92 | Trigger AI matching algorithm | After payment confirmation |

### 5. Payment Gateway Integration

| Location | TODO | Description |
|----------|------|-------------|
| transaction.controller.js:64 | Initialize payment with gateway | Generic payment initiation |
| transaction.controller.js:230 | Process payout to technician | B2C payout implementation |
| transaction.controller.js:293 | Process actual refund | Refund through payment gateway |
| transaction.controller.js:319 | Verify webhook signature | Gateway webhook validation |

### 6. Frontend Payment Integration

| Location | TODO | Description |
|----------|------|-------------|
| BookingFeePaymentModal.tsx:135 | Integrate with Stripe or Flutterwave | Card payment integration |
| BookingFeePaymentModal.tsx:141 | Integrate with wallet system | Wallet balance usage |
| Subscription.tsx:118 | Implement payment integration | Subscription payment |

---

## Low Priority Items

### 7. File Uploads

| Location | TODO | Description |
|----------|------|-------------|
| user.routes.js:42 | Add multer middleware for file upload | Avatar upload endpoint |

### 8. Escalation Jobs

| Location | TODO | Description |
|----------|------|-------------|
| completionEscalation.job.js:52-53 | Send notification to support/remind customer | Booking escalation |
| completionEscalation.job.js:97-98 | Send notification/email reminder | Auto-reminder |
| completionEscalation.job.js:156 | Send final notification | Final escalation |

---

## Implementation Recommendations

### Phase 1: Notifications (Week 1-2)

1. Create a unified notification service that handles:
   - Email (SendGrid/Amazon SES)
   - SMS (Twilio/Africa's Talking)
   - Push notifications (Firebase)
   - In-app notifications

2. Implement notification templates for each event type

3. Add notification preferences checking before sending

### Phase 2: Payment Processing (Week 2-3)

1. Implement escrow holding logic:
   - Hold funds on successful M-Pesa payment
   - Track escrow status in transaction model

2. Implement refund processing:
   - Full refund for cancellation within grace period
   - Partial refund based on work completed
   - Integration with M-Pesa B2C for refunds

### Phase 3: Real-time Features (Week 3-4)

1. Complete Socket.io integration:
   - Message delivery
   - Typing indicators
   - Read receipts
   - Booking status updates

### Phase 4: AI Matching (Week 4-5)

1. Enhance matching algorithm:
   - Location-based matching
   - Skill matching
   - Availability checking
   - Rating-based prioritization

---

## Notes

- All TODO items are annotated in source code with `// TODO:` comments
- New features should avoid adding TODO comments - implement fully or create a ticket
- This document should be updated when TODOs are resolved or new ones are added

---

## Completed Items

| Item | Completed Date | Notes |
|------|----------------|-------|
| M-Pesa callback handling | 2026-02-15 | Fully implemented with verification middleware |
| Work Gallery backend | 2026-02-15 | Complete CRUD operations with Cloudinary |
| Work Gallery frontend | 2026-02-15 | Components, service, slice, and types complete |
