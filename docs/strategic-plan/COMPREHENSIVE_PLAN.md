# FundiPro Comprehensive Implementation Plan

## Full Detailed Plan for Platform Transformation

**Version:** 1.0
**Date:** February 17, 2026
**Status:** Strategic Planning Document

---

## Table of Contents

1. [Brand Strategy](#1-brand-strategy)
2. [Service Model: WORD BANK](#2-service-model-word-bank)
3. [Technician Profile & Showcase](#3-technician-profile--showcase)
4. [Payment Plan Capture System](#4-payment-plan-capture-system)
5. [Customizable Service WORD BANK](#5-customizable-service-word-bank)
6. [Technical Architecture](#6-technical-architecture)
7. [Implementation Phases](#7-implementation-phases)
8. [Quality Gates](#8-quality-gates)

---

## 1. Brand Strategy

### 1.1 Recommended Brand: FundiPro

**Rationale:**

The current brand "Dumu Waks" presents significant challenges:
- Unclear etymology and meaning
- Difficult pronunciation for non-locals
- No direct connection to technician services
- Low memorability (scored 4.5/10 in brand analysis)

**FundiPro Advantages:**

| Factor | Benefit |
|--------|---------|
| **"Fundi"** | Universal Swahili term for skilled artisan - instantly understood in Kenya |
| **"Pro"** | Elevates perception from informal to professional |
| **Combined** | "Professional Fundi" - clear value proposition |
| **Scalability** | Works across East Africa (Uganda, Tanzania) |

### 1.2 Brand Positioning

**Positioning Statement:**

> For homeowners, businesses, and property managers in Kenya who need reliable, skilled technician services, FundiPro is the trusted technician marketplace that connects you with verified, professional fundis through intelligent matching. Unlike traditional word-of-mouth referrals or unverified online listings, FundiPro delivers peace of mind through verified professionals, transparent pricing, and guaranteed service quality.

**Brand Promise:**

"We connect you with skilled fundis you can trust, delivering quality work with transparent pricing and complete peace of mind."

### 1.3 Brand Pillars

| Pillar | Description | Proof Points |
|--------|-------------|--------------|
| **Trust** | Every technician verified | ID verification, background checks, reviews |
| **Quality** | Professional-grade service | Rating system, satisfaction guarantee |
| **Convenience** | Find, book, pay in minutes | Mobile app, instant booking, M-Pesa |
| **Transparency** | Know exactly what you pay | Upfront pricing, no hidden fees |
| **Community** | Empowering Kenyan technicians | Fair pay, skill development |

### 1.4 Visual Identity (Retain Current System)

The existing "Rich Dark Design System" is excellent:

| Element | Value | Rationale |
|---------|-------|-----------|
| Primary Color | Circuit Blue #0090C5 | Professional, trustworthy |
| Secondary | Wrench Purple #7D4E9F | Creative, distinctive |
| Accent (NEW) | Warm Gold #D4A017 | Trust/warmth element |

**New Logo Brief:**
- Combination of "F" and tool imagery
- Standalone icon for app icons
- Works on light and dark backgrounds

---

## 2. Service Model: WORD BANK

### 2.1 Concept Overview

The WORD BANK is a visual service selector that presents all available services as selectable "word chips" or "tags" in an organized, browsable format.

**Key Principles:**
1. **Visual First** - Icons/images before text
2. **Tappable** - Touch-friendly chips (48px+ touch targets)
3. **Instant Feedback** - Immediate results on selection
4. **Flexible** - Mix of preset and custom services
5. **Multilingual** - Works in English and Swahili

### 2.2 Category Architecture (12 Categories, 99+ Services)

| Category | Services Count | Priority |
|----------|----------------|----------|
| PLUMBING | 16 | High |
| ELECTRICAL | 16 | High |
| CARPENTRY | 16 | Medium |
| MASONRY | 16 | Medium |
| PAINTING | 16 | Medium |
| HVAC | 16 | Medium |
| WELDING | 16 | Medium |
| AUTO REPAIR | 16 | Low (Phase 2) |
| APPLIANCE | 16 | Medium |
| CLEANING | 16 | High |
| LANDSCAPING | 16 | Low (Phase 2) |
| SECURITY | 16 | Medium |

### 2.3 Service Chip Design

```
+------------------------------------------+
|  [ICON]     PIPE REPAIR                  |
|             FROM KES 500                 |
+------------------------------------------+

States:
- Default: Gray border, white background
- Selected: Primary color background, white text
- Hover: Primary border, subtle background tint
- Disabled: Light gray, reduced opacity
```

### 2.4 Implementation Requirements

**Backend:**
- ServiceCategory model (16 categories)
- Service model (99+ services with metadata)
- TechnicianService model (technician offerings)
- Search and filter APIs
- Custom service approval workflow

**Frontend:**
- ServiceCategoryGrid component
- ServiceWordBank component
- ServiceChip component
- Category filtering
- Search functionality
- Multi-select capability

---

## 3. Technician Profile & Showcase

### 3.1 Profile Architecture

```
+------------------------------------------------------------------+
|                    TECHNICIAN PROFILE                              |
+------------------------------------------------------------------+
|  [ HEADER ]      Photo | Name | Rating | Location | Badges        |
|  [ ABOUT ]       Bio | Experience | Specializations | Languages    |
|  [ SERVICES ]    Category Chips | Service Tags | Custom Services   |
|  [ PAYMENT ]     Accepted Methods | Rate Structure | Deposit Policy |
|  [ PORTFOLIO ]   Before/After Photos | Project Showcase            |
|  [ REVIEWS ]     Overall Rating | Category Ratings | Written Reviews|
|  [ AVAILABILITY ] Schedule | Service Area | Response Time           |
|  [ CREDENTIALS ] ID Verification | Licenses | Insurance             |
+------------------------------------------------------------------+
```

### 3.2 Profile Completeness Tiers

| Tier | Completeness | Benefits | Badge |
|------|--------------|----------|-------|
| Basic | 40-59% | Can receive bookings | None |
| Verified | 60-79% | Priority in search | VERIFIED |
| Pro | 80-89% | Featured placement | PRO |
| Elite | 90-100% | Premium visibility | ELITE |

### 3.3 Work Gallery Enhancement

**Current State:** 5 images maximum

**Proposed State:**

| Tier | Image Limit | Features |
|------|-------------|----------|
| Free | 15 images | Before/After pairing, captions |
| Pro | 30 images | Video support, project descriptions |

**Gallery Features:**
- Bulk upload capability
- Before/After slider comparison
- Lightbox viewing
- Service tagging per image
- Client testimonials linked to images

### 3.4 Marketing Tools for Technicians

| Tool | Description | Phase |
|------|-------------|-------|
| Profile Badge | Embeddable badge for external sites | Phase 2 |
| Share Link | Unique URL for social sharing | Phase 1 |
| QR Code | Printable QR for business cards | Phase 3 |
| Promotion Credits | Boost profile visibility | Phase 4 |
| Portfolio PDF | Auto-generated portfolio document | Phase 3 |

---

## 4. Payment Plan Capture System

### 4.1 Questionnaire Design for Technicians

**Progressive Profiling Approach:**

Do not ask everything at once. Use staged collection:

**Stage 1: Onboarding (Required)**
- Default hourly rate
- M-Pesa number for payouts
- Service categories offered

**Stage 2: Profile Enhancement (Encouraged)**
- Service-specific rates
- Weekend/evening premium rates
- Deposit requirements

**Stage 3: Advanced (Optional)**
- Milestone payment preferences
- Bank account details
- Service area specifications

### 4.2 Smart Defaults Based on Service Type

| Service Category | Default Rate | Deposit | Payout |
|------------------|--------------|---------|--------|
| Plumbing | KES 2,000/hr | 20% | Same-day |
| Electrical | KES 2,500/hr | 20% | Same-day |
| Carpentry | KES 1,500/hr | 30% | Weekly |
| Masonry | KES 1,500/hr | 30% | Weekly |
| Painting | KES 1,500/hr | 30% | On completion |
| HVAC | KES 3,000/hr | 20% | Same-day |

### 4.3 Payment Plan Templates

**Template A: Standard (Most technicians)**
- Hourly rate: KES 2,000/hour
- Minimum: 1 hour
- Call-out fee: KES 500 (waived if 2+ hours)
- M-Pesa (STK Push): YES
- Deposit: 20% (refundable)
- Payout: Weekly (every Monday)

**Template B: Premium (Established technicians)**
- Hourly rate: KES 3,500/hour
- Weekend rate: KES 4,500/hour
- Emergency rate: KES 5,500/hour
- Minimum: 2 hours
- Deposit: 50% (non-refundable)
- Milestone payments available
- Payout: Monthly

**Template C: Flexible (New technicians)**
- Hourly rate: KES 1,500/hour
- Fixed rates available per service
- No call-out fee
- Deposit: 20% (platform default)
- Payout: On completion

### 4.4 Validation and Verification

| Field | Validation | Verification |
|-------|------------|--------------|
| M-Pesa Number | Kenya format (07XX) | OTP verification |
| Bank Account | Account number format | Small deposit verification |
| Hourly Rate | KES 100-50,000 range | None |
| Service Area | Valid Kenya locations | None |

---

## 5. Customizable Service WORD BANK

### 5.1 How Technicians Add Custom Services

**Flow:**

```
1. Navigate to Profile > Services
2. Click "Add Custom Service"
3. Fill form:
   - Service Name (required, max 100 chars)
   - Category (required, dropdown)
   - Description (optional, max 500 chars)
   - Pricing Model (required: hourly/fixed/per-unit)
   - Rate (required, KES 100-50,000)
   - Estimated Duration (optional)
   - Example Photos (optional, up to 3)
4. Submit for review
5. Auto-approve or manual review
6. Service appears in WORD BANK with "CUSTOM" badge
```

### 5.2 Approval Workflow

```
Technician Submits Custom Service
        |
        v
System Auto-Check:
- Similar to existing service? -> Suggest existing
- Contains prohibited words? -> Flag for review
- Clear description? -> Pass
        |
        +-- Auto-Approve if:
        |    - Unique and clear
        |    - Category-appropriate
        |    - No policy violations
        |
        +-- Flag for Review if:
             - Potentially inappropriate
             - Unclear description
             - Requires clarification
```

### 5.3 Quality Control Mechanisms

| Mechanism | Description |
|-----------|-------------|
| Duplicate Detection | AI-powered similarity check against existing services |
| Keyword Filter | Block inappropriate terms |
| Category Validation | Must match selected category |
| Minimum Description | Require meaningful description |
| Photo Guidelines | Before/after examples encouraged |
| User Reporting | Customers can report inaccurate services |
| Admin Review Queue | Dashboard for pending reviews |

### 5.4 Service Taxonomy Management

**Admin Capabilities:**
- Merge similar custom services into standard services
- Archive unused custom services
- Promote popular custom services to WORD BANK
- Category reassignment
- Bulk operations for service management

---

## 6. Technical Architecture

### 6.1 Database Schema Summary

| Model | Purpose | Key Fields |
|-------|---------|------------|
| ServiceCategory | 16 master categories | slug, name, icon, group |
| Service | 99+ WORD BANK services | category, name, defaultPricing |
| TechnicianService | Technician offerings | technician, service, customPricing |
| PaymentPlan | Flexible pricing | booking, model, breakdown, milestones |
| Escrow | Fund holding | booking, amounts, status, events |
| Payout | Technician payments | technician, items, status |

### 6.2 API Endpoints

```
Service Discovery:
GET  /api/v1/services/categories
GET  /api/v1/services?category=:id
GET  /api/v1/services/search?q=:query

Technician Services:
GET  /api/v1/technicians/:id/services
POST /api/v1/technicians/:id/services
PUT  /api/v1/technicians/:id/services/:serviceId
POST /api/v1/technicians/:id/services/custom

Payment Plans:
POST /api/v1/bookings/:id/payment-plan
GET  /api/v1/payment-plans/:id
PUT  /api/v1/payment-plans/:id/negotiate

Escrow:
POST /api/v1/escrow/fund
POST /api/v1/escrow/:id/release
POST /api/v1/escrow/:id/refund
POST /api/v1/escrow/:id/dispute

Payouts:
GET  /api/v1/payouts
GET  /api/v1/payouts/:id
POST /api/v1/payouts/request
```

### 6.3 State Management

**Redux Slices:**
- servicesSlice (WORD BANK data)
- technicianServicesSlice (technician offerings)
- paymentPlanSlice (pricing management)
- escrowSlice (fund holding)
- payoutSlice (earnings tracking)

### 6.4 Payment Integration

**Primary:** M-Pesa Daraja API
- STK Push for customer payments
- B2C for technician payouts
- C2B for Paybill payments

**Secondary:** Flutterwave
- Card payments (local and international)
- Bank transfers
- Airtel Money

---

## 7. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

**Week 1:**
- [ ] Create ServiceCategory and Service models
- [ ] Seed 12 categories and 99+ services
- [ ] Implement category API endpoints
- [ ] Create ServiceCategoryGrid component

**Week 2:**
- [ ] Implement ServiceWordBank component
- [ ] Create ServiceChip component with selection states
- [ ] Add category filtering
- [ ] Implement service search

**Week 3:**
- [ ] Create TechnicianService model
- [ ] Implement technician service selection UI
- [ ] Add service-to-profile linking
- [ ] Create profile completeness calculation

**Week 4:**
- [ ] Testing and bug fixes
- [ ] Performance optimization
- [ ] Documentation

### Phase 2: Core Features (Weeks 5-8)

**Week 5-6: Custom Services**
- [ ] Custom service creation form
- [ ] Admin approval workflow
- [ ] Custom service display in WORD BANK
- [ ] Service management dashboard

**Week 7-8: Payment Plans**
- [ ] PaymentPlan model and APIs
- [ ] Payment plan builder UI
- [ ] Progressive profiling questionnaire
- [ ] Smart defaults implementation

### Phase 3: Payments (Weeks 9-12)

**Week 9-10: M-Pesa Integration**
- [ ] Daraja API integration
- [ ] STK Push implementation
- [ ] Payment callback handling
- [ ] Transaction status tracking

**Week 11-12: Escrow System**
- [ ] Escrow model implementation
- [ ] Fund holding and release logic
- [ ] Milestone payment support
- [ ] Payout scheduling

### Phase 4: Trust & Growth (Weeks 13-16)

- [ ] Verification badge system
- [ ] Review enhancements
- [ ] Gallery expansion (15 images)
- [ ] Marketing tools for technicians
- [ ] Brand launch preparation

---

## 8. Quality Gates

### Phase Completion Criteria

| Phase | Gate Criteria |
|-------|---------------|
| Phase 1 | WORD BANK displays all services, search works, category filtering functional |
| Phase 2 | Technicians can add custom services, payment plans save correctly |
| Phase 3 | M-Pesa payments complete successfully, escrow holds and releases funds |
| Phase 4 | Verification system live, 100+ technicians with complete profiles |

### Testing Requirements

| Test Type | Coverage Target |
|-----------|-----------------|
| Unit Tests | 80%+ code coverage |
| Integration Tests | All API endpoints |
| E2E Tests | Critical user journeys |
| Performance Tests | <2s page load, <500ms API |

### Launch Readiness Checklist

- [ ] All P0 features complete
- [ ] Security audit passed
- [ ] M-Pesa integration tested in production sandbox
- [ ] 500+ technicians verified
- [ ] Customer support system ready
- [ ] Brand assets finalized
- [ ] Legal review complete
- [ ] Marketing materials ready

---

## Appendix A: File Structure

```
frontend/src/
  components/
    services/
      ServiceCategoryGrid.tsx
      ServiceWordBank.tsx
      ServiceChip.tsx
      CustomServiceForm.tsx
    technician/
      ServiceManager.tsx
      PaymentPlanBuilder.tsx
      WorkGalleryEnhanced.tsx
    payment/
      MpesaPayment.tsx
      EscrowStatus.tsx
      PayoutDashboard.tsx
  pages/
    ServiceDiscovery.tsx
    TechnicianOnboarding.tsx
    PayoutSettings.tsx
  store/
    slices/
      servicesSlice.ts
      technicianServicesSlice.ts
      paymentPlanSlice.ts
      escrowSlice.ts
      payoutSlice.ts
  types/
    service.ts
    payment.ts
    escrow.ts

backend/src/
  models/
    ServiceCategory.js
    Service.js
    TechnicianService.js
    PaymentPlan.js
    Escrow.js
    Payout.js
  routes/
    service.routes.js
    payment.routes.js
    escrow.routes.js
    payout.routes.js
  controllers/
    service.controller.js
    payment.controller.js
    escrow.controller.js
    payout.controller.js
  services/
    mpesa.service.js
    escrow.service.js
    payout.service.js
```

---

*End of Comprehensive Plan Document*
