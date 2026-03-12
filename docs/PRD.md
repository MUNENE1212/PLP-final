# Dumu Waks — Product Requirements Document

> Kenya's on-demand technician marketplace. Connecting verified repair professionals with customers through AI-powered matching, M-Pesa escrow payments, and real-time service tracking.

**Live:** https://dumuwaks.ementech.co.ke | **API:** https://api.ementech.co.ke

---

## 1. Problem

Finding a reliable technician in Kenya is word-of-mouth, slow, and risky. Customers have no way to verify skills, compare prices, or guarantee quality. Technicians have no structured way to find work or build reputation.

## 2. Solution

A two-sided marketplace that:
- Matches customers to verified technicians using AI scoring (skills, proximity, rating, availability)
- Protects payments through M-Pesa escrow (20% booking fee held, released after completion)
- Provides real-time tracking, messaging, and dispute resolution

## 3. Users & Roles

| Role | Description |
|------|-------------|
| **Customer** | Books services, pays via M-Pesa, rates technicians |
| **Technician** | Receives bookings, negotiates pricing, completes work, earns payouts |
| **Corporate** | Bulk bookings with project codes and billing |
| **Support** | Handles tickets, escalations, follow-ups, creates bookings on behalf of customers |
| **Admin** | Full platform control — users, pricing, escrow, analytics, service approval |

## 4. Core Features

### 4.1 Service Catalog

Hierarchical: **Category → Service → TechnicianService**

- System-defined categories (plumbing, electrical, carpentry, appliances, etc.)
- Each category has services (e.g., Plumbing → Pipe Repair, Drain Cleaning)
- Technicians link to services with custom pricing, portfolio images, qualifications
- Custom services: technicians can submit → admin approval workflow

### 4.2 Booking Lifecycle

**FSM:** `pending → matching → assigned → accepted → en_route → arrived → in_progress → paused → completed → verified → payment_pending → paid`

Side states: `disputed`, `refunded`, `cancelled`

| Phase | What happens |
|-------|-------------|
| **Create** | Customer selects service, location (geospatial), time slot, urgency, description, images |
| **Match** | AI scores nearby technicians (skill, distance, rating, availability, price, response time) |
| **Assign** | Technician receives offer → accept, reject, or counter-offer (up to 3 rounds) |
| **Execute** | Status updates: en_route → arrived → in_progress. Real-time location tracking |
| **Complete** | Technician uploads completion media → customer confirms or disputes |
| **Pay** | Escrow releases booking fee to technician. Full payment via M-Pesa |

**Counter-offers:** Technicians can propose alternative pricing with justification. Customers accept, reject, or let it expire. Negotiation history tracked per booking.

**Completion follow-up:** If customer doesn't confirm within SLA, support initiates follow-up (contact attempts tracked, support can force-complete with outcome notes).

### 4.3 Pricing Engine

Multi-factor calculation:

| Factor | Detail |
|--------|--------|
| Base price | Per service type from PricingConfig |
| Distance | Tiered by km bands |
| Urgency | Auto-calculated from scheduled date (low/medium/high/emergency multipliers) |
| Time-of-day | Peak hours (7-9 AM, 5-7 PM), weekends, holidays |
| Technician tier | Based on experience, rating, completed jobs |
| Customer discount | First-time, loyalty thresholds |
| Surge | Demand-based (5 levels, 1.2x–1.5x) with Redis-cached demand counters |
| Platform fee | 7.5% (min KES 50, max KES 5,000) |
| Tax | 16% VAT on platform fee |

**Booking fee:** Tiered percentage of total (configured in PricingConfig), refundable, held in escrow.

### 4.4 Payments (M-Pesa)

| Flow | Mechanism |
|------|-----------|
| **Customer pays** | STK Push (Lipa Na M-Pesa Online) → funds escrow |
| **C2B validation** | Validates booking reference, payable status, amount match before accepting |
| **Technician payout** | B2C disbursement after escrow release |
| **Refunds** | Reverse transaction on cancellation/dispute |

**Escrow lifecycle:** `pending → funded → released` (or `refunded` / `disputed`)
- Auto-release: 3 days after completion if no dispute
- Dispute hold: extends 7 days for admin resolution
- Milestone support: partial releases for large projects

**Webhook security:** IP whitelist (Safaricom IPs), callback secret verification, structure validation. Production-mandatory.

### 4.5 Matching Algorithm

Scores technicians 0–100 across weighted factors:

- Skill match, location proximity, availability, rating
- Experience level, pricing competitiveness, response time
- Completion rate, customer preference history

**Customer preferences** (MatchingPreference): learned from booking history — favored/blocked technicians, preferred categories, spending patterns, time-of-day patterns. Configurable weights.

### 4.6 Messaging

Real-time via Socket.IO:
- Direct, group, booking-linked, and support conversation types
- Text, image, video, audio, document, location message types
- End-to-end encryption (AES-256-CBC)
- Read receipts, typing indicators, reactions, threading (reply-to)
- Per-user message deletion, edit history

### 4.7 Social Feed

- Post types: text, image, video, portfolio, tip, question, achievement
- Engagement: likes, comments (nested replies), shares, bookmarks
- Portfolio posts: project details, before/after, materials, cost, client testimonial
- Follow system with follower/following counts
- AI moderation scoring (inappropriate, spam, hate, violence)
- Hashtags, mentions, location tagging

### 4.8 Notifications

Multi-channel: in-app, push (FCM), email (SMTP), SMS (Africa's Talking)

23 notification types across categories: booking, payment, social, message, system, achievement.

Priority levels (low/normal/high/urgent), grouping, expiry, delivery tracking per channel.

### 4.9 Support System

- Ticket lifecycle: `open → assigned → in_progress → waiting_customer → resolved → closed`
- SLA tracking (first response time, resolution time)
- Escalation levels with routing
- Customer satisfaction rating (1–5) after resolution
- Internal notes, message threads, attachments
- Support agents can: create customer accounts, create bookings on behalf, search technicians

### 4.10 Diagnostics (DumuBot)

- Interactive problem diagnosis flows per service category
- Question trees with branching logic
- DIY solutions with steps, tools, materials, safety warnings
- Technician preparation data (likely causes, tools needed, complexity)
- AI chatbot (Cohere) for free-form questions

### 4.11 Technician Profile

- Profile completeness score (0–100) with weighted sections:
  - Basic info (20%), Services (25%), Portfolio (20%), Verification (15%), Availability (10%), Reviews (10%)
- 70%+ score → visibility boost in search
- Work gallery: before/after pairs, max 10 images, reorderable
- Portfolio items: verified from completed bookings or manual upload
- KYC: ID document upload, admin verification
- Subscription tiers (Pro/Premium) with feature gates

### 4.12 Reviews & Ratings

- Multi-dimensional: overall, quality, professionalism, communication, punctuality, value
- Technician response capability
- Helpfulness voting
- AI sentiment analysis (score, keywords, topics)
- Moderation: flagging, admin review, removal with reason
- Featured reviews, verified purchase badge

### 4.13 Admin Dashboard

- Real-time metrics: active bookings, revenue (today vs yesterday), online technicians/customers
- Trend analytics (24h/7d/30d/90d)
- User management: view, filter, status changes, soft delete/restore
- Service approval workflow
- Escrow monitoring and dispute resolution
- Fee configuration: platform fee, VAT, booking fee tiers, cancellation tiers
- Pricing config: base prices, distance tiers, urgency multipliers, surge settings

## 5. Technical Architecture

```
frontend/          React 18 + TypeScript + Vite + Redux Toolkit + Tailwind
backend/           Express.js (CommonJS) + MongoDB Atlas + Redis
seo/               Next.js 14 (SSR for bots, SPA for users)
```

**Backend layers:** Route → Middleware → Controller → Service → Model

**Key infrastructure:**
- MongoDB Atlas (23 models, geospatial indexes)
- Redis (caching, demand tracking, sessions)
- Cloudinary (media storage, transformations)
- Socket.IO (real-time messaging, availability broadcasts)
- PM2 cluster mode (2 instances) behind Nginx

**Security:**
- JWT auth with refresh tokens, 2FA (TOTP)
- Role-based access control (5 roles)
- Rate limiting per endpoint type
- AES-256-CBC message encryption (production key required)
- M-Pesa webhook verification (IP whitelist + secret)
- Input sanitization (mongo-sanitize, helmet, CORS)

## 6. API Surface

~188 endpoints across 31 route files. Key domains:

| Domain | Endpoints | Notes |
|--------|-----------|-------|
| Auth | 10 | Register, login, 2FA, password reset, email verify |
| Users | 14 | CRUD, follow, availability, FCM tokens |
| Bookings | 30 | Full lifecycle, counter-offers, completion, disputes |
| Services | 14 | Catalog, search, custom submission, approval |
| Matching | 10 | Find, accept/reject, preferences, blocking |
| Payments | 7 | STK push, status, history |
| M-Pesa Webhooks | 7 | STK callback, B2C, validation, confirmation |
| Payouts | 5 | Pending, process, batch |
| Escrow | 13 | CRUD, fund, release, refund, dispute |
| Messages | 6 | Send, read, delete, reactions |
| Conversations | 6 | CRUD, participants |
| Posts | 13 | CRUD, likes, comments, shares, bookmarks |
| Reviews | 7 | CRUD, helpful, response |
| Portfolio | 11 | CRUD, images, verification |
| Work Gallery | 7 | Upload, reorder, before/after |
| Notifications | 9 | CRUD, preferences, mark read |
| Support | 19 | Tickets, assignment, escalation, rating |
| Admin | 17 | Users, pricing, fees, settings |
| Analytics | 6 | Real-time, trends, activity |
| Pricing | 12 | Calculate, estimate, compare, config |
| Diagnostics | 4 | Problem search, guided flow |
| DumuBot | 4 | Chat, actions, history |
| Public | 3 | Stats, reviews, technicians (for SEO) |

## 7. Data Models

23 MongoDB models organized by domain:

**Core:** User, Booking, Service, ServiceCategory, TechnicianService

**Financial:** Transaction, Escrow, PaymentPlan, PricingConfig

**Communication:** Conversation, Message, Notification

**Content:** Post, Review, Portfolio

**Matching:** Matching, MatchingInteraction, MatchingPreference

**Operations:** SupportTicket, FAQ, DiagnosticFlow, ServiceApproval, ProfileCompleteness

## 8. Deployment

- **CI/CD:** Push to `master` → GitHub Actions → blue-green deploy to VPS
- **VPS:** Ubuntu 24.04, PM2 cluster, Nginx reverse proxy, Let's Encrypt SSL
- **SEO:** Nginx user-agent detection routes bots to Next.js SSR, humans to React SPA
- Auto-rollback on health check failure

## 9. Business Model

| Revenue | Detail |
|---------|--------|
| Platform fee | 7.5% per transaction (deducted from technician earnings) |
| Tax | 16% VAT on platform fee |
| Cancellation fees | Tiered: 0% (>24h), 25% (12-24h), 50% (2-12h), 75% (<2h) |

| Protection | Detail |
|------------|--------|
| Booking deposit | ~20% held in escrow until completion |
| Auto-release | 3 days after completion |
| Dispute hold | 7 additional days |
| Auto-refund | 14 days if job never starts |
