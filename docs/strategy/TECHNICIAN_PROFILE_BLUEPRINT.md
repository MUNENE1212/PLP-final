# Dumuwaks Technician Profile Blueprint

## Comprehensive Profile Design for Technician Marketplace

---

## Document Information
- **Version**: 1.0
- **Date**: February 2026
- **Status**: Strategic Design
- **Author**: Strategic Planning Agent

---

## Executive Summary

This document defines the complete blueprint for technician profiles in the Dumuwaks marketplace. A well-designed profile serves three critical functions: building trust with customers, showcasing technician capabilities, and enabling intelligent matching. The blueprint includes required fields, optional enhancements, payment plan options, and profile completeness scoring.

---

## Part 1: Profile Architecture Overview

### 1.1 Profile Section Structure

```
+------------------------------------------------------------------+
|                    TECHNICIAN PROFILE                              |
+------------------------------------------------------------------+
|                                                                    |
|  +--[ HEADER SECTION ]-------------------------------------------+ |
|  |  Photo | Name | Rating | Location | Verification Badges       | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +--[ ABOUT SECTION ]--------------------------------------------+ |
|  |  Bio | Experience | Specializations | Languages              | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +--[ SERVICES SECTION (WORD BANK) ]-----------------------------+ |
|  |  Category Chips | Service Tags | Custom Services             | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +--[ PAYMENT PLANS ]--------------------------------------------+ |
|  |  Accepted Payment Methods | Rate Structure | Deposit Policy   | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +--[ PORTFOLIO/GALLERY ]----------------------------------------+ |
|  |  Before/After Photos | Project Showcase | Certificates        | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +--[ REVIEWS & RATINGS ]----------------------------------------+ |
|  |  Overall Rating | Category Ratings | Written Reviews          | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +--[ AVAILABILITY ]---------------------------------------------+ |
|  |  Schedule | Service Area | Response Time                     | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +--[ VERIFICATION & CREDENTIALS ]-------------------------------+ |
|  |  ID Verification | Licenses | Insurance | Background Check   | |
|  +---------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

### 1.2 Profile Completeness Tiers

| Tier | Completeness | Benefits | Badge |
|------|--------------|----------|-------|
| **Basic** | 40-59% | Can receive bookings | None |
| **Verified** | 60-79% | Priority in search | VERIFIED badge |
| **Pro** | 80-89% | Featured placement | PRO badge |
| **Elite** | 90-100% | Premium visibility | ELITE badge |

---

## Part 2: Required Fields

### 2.1 Personal Information

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `firstName` | String | Yes | 2-50 chars | Display name |
| `lastName` | String | Yes | 2-50 chars | Display name |
| `profilePicture` | URL | Yes | Valid image URL | Minimum 200x200px |
| `phoneNumber` | String | Yes | Valid KE phone | Verified via OTP |
| `email` | String | Yes | Valid email | Verified via link |
| `dateOfBirth` | Date | Yes | Age 18+ | For verification |
| `gender` | Enum | No | M/F/Other | Optional |

### 2.2 Location Information

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `location.coordinates` | [lon, lat] | Yes | Valid geo | For proximity matching |
| `location.address` | String | Yes | Min 10 chars | Full address |
| `location.city` | String | Yes | Valid Kenyan city | e.g., "Nairobi" |
| `location.county` | String | Yes | Valid Kenyan county | e.g., "Nairobi County" |
| `serviceRadius` | Number | Yes | 1-100 km | How far they'll travel |

### 2.3 Professional Information

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `bio` | String | Yes | 50-500 chars | Professional summary |
| `yearsOfExperience` | Number | Yes | 0-50 years | Total experience |
| `primaryCategory` | Enum | Yes | Valid category | Main service category |
| `skills` | Array | Yes | Min 1 skill | From WORD BANK |
| `hourlyRate` | Number | Yes | KES 100-50,000 | Base hourly rate |

### 2.4 Availability Settings

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `availability.isAvailable` | Boolean | Yes | true/false | Currently accepting work |
| `availability.schedule` | Object | Yes | Valid schedule | Weekly availability |
| `responseTime` | Enum | No | Predefined options | Expected response time |

### 2.5 Bank/Payment Information

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `paymentMethods.mpesaNumber` | String | Yes | Valid M-Pesa | For payouts |
| `paymentMethods.bankAccount` | Object | No | Valid bank | Optional bank payouts |
| `paymentMethods.bankAccount.bank` | String | No | Valid bank name | e.g., "Equity Bank" |
| `paymentMethods.bankAccount.accountNumber` | String | No | Valid account | For bank transfers |
| `paymentMethods.bankAccount.accountName` | String | No | Matching name | Account holder name |

---

## Part 3: Optional Fields

### 3.1 Enhanced Professional Information

| Field | Type | Required | Points | Notes |
|-------|------|----------|--------|-------|
| `businessName` | String | No | +5% | If registered business |
| `businessRegistrationNumber` | String | No | +5% | For verification |
| `website` | URL | No | +3% | Business website |
| `socialMedia.facebook` | URL | No | +1% | Facebook page |
| `socialMedia.instagram` | URL | No | +1% | Instagram profile |
| `languages` | Array | No | +2% | Languages spoken |

### 3.2 Portfolio and Work Gallery

| Field | Type | Required | Points | Notes |
|-------|------|----------|--------|-------|
| `portfolio` | Array | No | +3% per item (max +15%) | Work samples |
| `portfolio[].title` | String | No | - | Project title |
| `portfolio[].description` | String | No | - | Project description |
| `portfolio[].beforeImages` | Array | No | - | Before photos |
| `portfolio[].afterImages` | Array | No | - | After photos |
| `portfolio[].category` | String | No | - | Service category |
| `portfolio[].duration` | String | No | - | Time taken |
| `portfolio[].clientTestimonial` | String | No | - | Client feedback |

### 3.3 Certifications and Credentials

| Field | Type | Required | Points | Notes |
|-------|------|----------|--------|-------|
| `certifications` | Array | No | +5% per cert | Professional certs |
| `certifications[].name` | String | No | - | Certification name |
| `certifications[].issuer` | String | No | - | Issuing body |
| `certifications[].dateObtained` | Date | No | - | Date received |
| `certifications[].expiryDate` | Date | No | - | Expiry if applicable |
| `certifications[].documentUrl` | URL | No | - | Certificate image |

### 3.4 Insurance and Licensing

| Field | Type | Required | Points | Notes |
|-------|------|----------|--------|-------|
| `insurance.hasInsurance` | Boolean | No | +5% | Has liability insurance |
| `insurance.provider` | String | No | - | Insurance company |
| `insurance.policyNumber` | String | No | - | Policy number |
| `insurance.coverageAmount` | Number | No | - | Coverage in KES |
| `insurance.expiryDate` | Date | No | - | Policy expiry |
| `licenses` | Array | No | +5% per license | Trade licenses |
| `licenses[].type` | String | No | - | License type |
| `licenses[].number` | String | No | - | License number |
| `licenses[].issuedBy` | String | No | - | Issuing authority |

### 3.5 Service Area Details

| Field | Type | Required | Points | Notes |
|-------|------|----------|--------|-------|
| `serviceAreas` | Array | No | +3% | Specific areas served |
| `serviceAreas[].county` | String | No | - | County name |
| `serviceAreas[].subCounties` | Array | No | - | Sub-counties |
| `serviceAreas[].wards` | Array | No | - | Specific wards |
| `willingToTravel` | Boolean | No | - | Travel outside radius |
| `travelFee` | Number | No | - | Per km beyond radius |

### 3.6 Availability Enhancements

| Field | Type | Required | Points | Notes |
|-------|------|----------|--------|-------|
| `availability.emergencyAvailable` | Boolean | No | +3% | 24/7 emergency |
| `availability.weekendAvailable` | Boolean | No | +2% | Works weekends |
| `availability.eveningAvailable` | Boolean | No | +2% | Works evenings |
| `availability.holidaysAvailable` | Boolean | No | +2% | Works holidays |
| `blackoutDates` | Array | No | - | Unavailable dates |

---

## Part 4: Payment Plans Structure

### 4.1 Payment Method Options

Technicians can define which payment methods they accept:

```typescript
interface PaymentPlanOptions {
  // Payment methods accepted
  acceptedMethods: {
    mpesa: {
      enabled: boolean;
      paybillNumber?: string;
      tillNumber?: string;
      acceptSTK: boolean;        // Accept STK Push
    };
    cash: {
      enabled: boolean;
      requiresDeposit: boolean;
      depositPercentage?: number; // e.g., 30%
    };
    bankTransfer: {
      enabled: boolean;
      banks: string[];           // Accepted banks
    };
    card: {
      enabled: boolean;          // Via platform
    };
    wallet: {
      enabled: boolean;          // Platform wallet
    };
  };
}
```

### 4.2 Rate Structure Options

```typescript
interface RateStructure {
  // How technician charges
  rateType: 'hourly' | 'fixed' | 'daily' | 'per_project' | 'mixed';

  // Hourly rate (if applicable)
  hourlyRate: {
    standard: number;           // KES per hour
    weekend?: number;           // Weekend rate
    evening?: number;           // After-hours rate
    emergency?: number;         // Emergency rate
  };

  // Minimum charge
  minimumCharge: {
    amount: number;
    type: 'hours' | 'fixed';    // e.g., "2 hours minimum" or "KES 1000 minimum"
  };

  // Call-out fee
  callOutFee: {
    enabled: boolean;
    amount: number;
    waivedAfterHours?: number;  // Waived if job exceeds X hours
  };

  // Service-specific rates (override base rate)
  serviceRates: Array<{
    serviceId: string;
    rateType: 'hourly' | 'fixed';
    rate: number;
    estimatedDuration?: string;
  }>;

  // Material costs
  materialsPolicy: {
    includedInRate: boolean;
    markupPercentage?: number;  // If materials charged separately
    requirePreApproval: boolean;
  };
}
```

### 4.3 Payment Schedule Preferences

```typescript
interface PaymentSchedulePreferences {
  // When technician wants to be paid
  paymentTiming: 'on_completion' | 'milestones' | 'phased';

  // Milestone structure (if applicable)
  milestones?: Array<{
    name: string;               // e.g., "Start", "50% Complete", "Finish"
    percentage: number;         // Percentage of total
  }>;

  // Deposit requirements
  deposit: {
    required: boolean;
    percentage: number;         // e.g., 30%
    minimumAmount?: number;     // Minimum deposit in KES
    refundable: boolean;
    nonRefundableReason?: string;
  };

  // Platform escrow
  escrowPreference: {
    acceptEscrow: boolean;      // Accept payment via platform escrow
    autoReleaseDays: number;    // Days after completion to auto-release
  };

  // Payout preferences
  payoutSchedule: 'daily' | 'weekly' | 'monthly' | 'threshold';
  payoutThreshold?: number;     // Minimum amount before payout
  payoutMethod: 'mpesa' | 'bank' | 'both';
}
```

### 4.4 Payment Plan Templates

#### Template A: Standard (Recommended for most)

```
+--------------------------------------------------+
|  PAYMENT PLAN: STANDARD                           |
+--------------------------------------------------+
|  Rate Structure:                                  |
|    - Hourly rate: KES 2,000/hour                  |
|    - Minimum: 1 hour                              |
|    - Call-out fee: KES 500 (waived if 2+ hours)   |
|                                                  |
|  Payment Methods:                                 |
|    - M-Pesa (STK Push): YES                       |
|    - Cash: YES (30% deposit required)            |
|    - Bank Transfer: NO                            |
|    - Platform Wallet: YES                         |
|                                                  |
|  Deposit:                                         |
|    - Required: 20% (via platform escrow)         |
|    - Refundable: YES                              |
|                                                  |
|  Payout:                                          |
|    - Method: M-Pesa                               |
|    - Schedule: Weekly (every Monday)             |
+--------------------------------------------------+
```

#### Template B: Premium (For established technicians)

```
+--------------------------------------------------+
|  PAYMENT PLAN: PREMIUM                            |
+--------------------------------------------------+
|  Rate Structure:                                  |
|    - Hourly rate: KES 3,500/hour                  |
|    - Weekend rate: KES 4,500/hour                 |
|    - Emergency rate: KES 5,500/hour               |
|    - Minimum: 2 hours                             |
|    - Call-out fee: KES 1,000                      |
|                                                  |
|  Payment Methods:                                 |
|    - M-Pesa: YES                                  |
|    - Bank Transfer: YES (Equity, KCB, Standard)  |
|    - Platform Wallet: YES                         |
|                                                  |
|  Deposit:                                         |
|    - Required: 50%                                |
|    - Refundable: NO (deducted from final)        |
|                                                  |
|  Milestone Payments:                              |
|    - Start: 30%                                   |
|    - Midway: 40%                                  |
|    - Completion: 30%                              |
|                                                  |
|  Payout:                                          |
|    - Method: Bank Transfer                        |
|    - Schedule: Monthly (1st of month)            |
+--------------------------------------------------+
```

#### Template C: Flexible (For new technicians)

```
+--------------------------------------------------+
|  PAYMENT PLAN: FLEXIBLE                           |
+--------------------------------------------------+
|  Rate Structure:                                  |
|    - Hourly rate: KES 1,500/hour                  |
|    - Fixed rates available per service           |
|    - Minimum: 1 hour                              |
|    - No call-out fee                              |
|                                                  |
|  Payment Methods:                                 |
|    - M-Pesa: YES                                  |
|    - Cash: YES (no deposit required)             |
|    - Platform Wallet: YES                         |
|                                                  |
|  Deposit:                                         |
|    - Required: Platform default (20%)            |
|    - Refundable: YES                              |
|                                                  |
|  Payout:                                          |
|    - Method: M-Pesa                               |
|    - Schedule: On completion                      |
+--------------------------------------------------+
```

### 4.5 Custom Payment Plan Builder

For technicians who want complete control:

```typescript
// UI Flow for custom payment plan

// Step 1: Choose rate type
const rateTypeOptions = [
  { value: 'hourly', label: 'Hourly Rate', description: 'Charge per hour worked' },
  { value: 'fixed', label: 'Fixed Price', description: 'Set price per service' },
  { value: 'daily', label: 'Daily Rate', description: 'Charge per day worked' },
  { value: 'per_project', label: 'Per Project', description: 'Quote per project' },
  { value: 'mixed', label: 'Mixed', description: 'Different rates for different services' }
];

// Step 2: Set base rates
const rateForm = {
  standardRate: { type: 'number', label: 'Standard Rate (KES)', required: true },
  weekendRate: { type: 'number', label: 'Weekend Rate (KES)', required: false },
  eveningRate: { type: 'number', label: 'Evening Rate (KES)', required: false },
  emergencyRate: { type: 'number', label: 'Emergency Rate (KES)', required: false },
  minimumHours: { type: 'number', label: 'Minimum Hours', default: 1 },
  callOutFee: { type: 'number', label: 'Call-out Fee (KES)', default: 0 }
};

// Step 3: Payment methods
const paymentMethodsForm = {
  mpesa: { enabled: false, acceptSTK: true, paybillNumber: '', tillNumber: '' },
  cash: { enabled: false, requiresDeposit: false, depositPercentage: 0 },
  bankTransfer: { enabled: false, banks: [] },
  platformWallet: { enabled: true }
};

// Step 4: Deposit and milestones
const depositForm = {
  requireDeposit: false,
  depositPercentage: 20,
  refundable: true,
  useMilestones: false,
  milestones: []
};

// Step 5: Payout preferences
const payoutForm = {
  preferredMethod: 'mpesa',
  schedule: 'weekly',
  threshold: 500
};
```

---

## Part 5: Verification and Badges

### 5.1 Verification Types

| Badge | Requirements | Display Priority |
|-------|--------------|------------------|
| **ID VERIFIED** | National ID verified | High |
| **PHONE VERIFIED** | Phone number confirmed via OTP | High |
| **EMAIL VERIFIED** | Email address confirmed | High |
| **LICENSED** | Trade license uploaded and verified | Medium |
| **INSURED** | Liability insurance confirmed | Medium |
| **BACKGROUND CHECK** | Criminal background check cleared | High |
| **TOP RATED** | 4.8+ rating with 50+ reviews | High |
| **QUICK RESPONDER** | Average response time < 15 min | Medium |
| **RELIABLE** | 95%+ completion rate | Medium |
| **EXPERIENCED** | 5+ years experience | Low |
| **SUPER PRO** | 100+ completed jobs | High |

### 5.2 Badge Display Logic

```
Profile Header Display (Top 3 badges by priority):

+--------------------------------------------------+
|  [Photo]  JOHN KAMAU                             |
|           PLUMBING EXPERT                        |
|           [ID VERIFIED] [TOP RATED] [LICENSED]   |
|           Nairobi, Kenya | 4.9 (127 reviews)    |
+--------------------------------------------------+
```

### 5.3 Verification Document Requirements

| Document Type | Requirements | Verification Process |
|---------------|--------------|---------------------|
| **National ID** | Clear photo of front and back | Automated OCR + manual review |
| **Passport** | Bio page photo | Manual review |
| **Trade License** | Valid license from county | Manual verification |
| **Insurance Certificate** | Current policy document | Manual verification |
| **Training Certificates** | Relevant certifications | Manual review |
| **Business Registration** | CR12 or equivalent | Manual verification |

---

## Part 6: Profile Completeness Calculation

### 6.1 Scoring Algorithm

```typescript
interface CompletenessScore {
  overall: number;           // 0-100%
  sections: {
    personal: number;        // 0-100%
    location: number;        // 0-100%
    services: number;        // 0-100%
    paymentPlans: number;    // 0-100%
    portfolio: number;       // 0-100%
    verification: number;    // 0-100%
  };
  missingRequired: string[];
  recommendations: string[];
}

function calculateCompleteness(profile: TechnicianProfile): CompletenessScore {
  const sections = {
    personal: calculatePersonalCompleteness(profile),
    location: calculateLocationCompleteness(profile),
    services: calculateServicesCompleteness(profile),
    paymentPlans: calculatePaymentCompleteness(profile),
    portfolio: calculatePortfolioCompleteness(profile),
    verification: calculateVerificationCompleteness(profile)
  };

  // Weighted average
  const weights = {
    personal: 0.20,
    location: 0.10,
    services: 0.25,
    paymentPlans: 0.15,
    portfolio: 0.15,
    verification: 0.15
  };

  const overall = Object.keys(sections).reduce((sum, key) => {
    return sum + (sections[key] * weights[key]);
  }, 0);

  return {
    overall: Math.round(overall),
    sections,
    missingRequired: getMissingRequired(profile),
    recommendations: getRecommendations(profile, sections)
  };
}
```

### 6.2 Section Scoring Details

#### Personal Information (20% weight)

| Field | Points | Max Section % |
|-------|--------|---------------|
| Profile picture | 25% | |
| First name | 10% | |
| Last name | 10% | |
| Phone (verified) | 20% | |
| Email (verified) | 15% | |
| Bio (50+ chars) | 20% | |
| **Total** | | **100%** |

#### Services (25% weight)

| Field | Points | Max Section % |
|-------|--------|---------------|
| Primary category | 25% | |
| At least 3 skills | 30% | |
| At least 5 skills | +15% bonus | |
| Hourly rate set | 20% | |
| Service descriptions | 15% | |
| Custom services added | +10% bonus | |
| **Total** | | **100%** |

#### Payment Plans (15% weight)

| Field | Points | Max Section % |
|-------|--------|---------------|
| At least 1 payment method | 30% | |
| M-Pesa configured | 25% | |
| Rate structure defined | 25% | |
| Payout preferences set | 20% | |
| **Total** | | **100%** |

#### Portfolio (15% weight)

| Field | Points | Max Section % |
|-------|--------|---------------|
| At least 1 portfolio item | 40% | |
| At least 3 portfolio items | +20% | |
| At least 5 portfolio items | +15% | |
| Before/After photos | +10% | |
| Client testimonials | +10% | |
| Video content | +5% | |
| **Total** | | **100%** |

#### Verification (15% weight)

| Field | Points | Max Section % |
|-------|--------|---------------|
| ID verified | 40% | |
| Phone verified | 15% | |
| Email verified | 15% | |
| License uploaded | +15% | |
| Insurance uploaded | +10% | |
| Background check | +5% | |
| **Total** | | **100%** |

---

## Part 7: Profile Display Design

### 7.1 Public Profile View (Customer Perspective)

```
+------------------------------------------------------------------+
|                    TECHNICIAN PROFILE                              |
+------------------------------------------------------------------+
|                                                                    |
|  +--[ HEADER ]---------------------------------------------------+ |
|  |                                                                | |
|  |  [Profile Photo]    JOHN KAMAU                                 | |
|  |                     Plumbing Expert                            | |
|  |                     [ID VERIFIED] [TOP RATED] [LICENSED]        | |
|  |                                                                | |
|  |  Rating: 4.9 (127 reviews)   |   Response: < 1 hour           | |
|  |  Location: Westlands, Nairobi |   Jobs: 234 completed          | |
|  |  Member since: Jan 2024       |   Last active: 2 hours ago    | |
|  |                                                                | |
|  |  [BOOK NOW]  [MESSAGE]  [SAVE]                                | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ ABOUT ]----------------------------------------------------+ |
|  |  Professional plumber with 8+ years of experience.             | |
|  |  Specializing in residential and commercial plumbing...        | |
|  |                                                                | |
|  |  Languages: English, Swahili, Kikuyu                          | |
|  |  Experience: 8 years                                          | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ SERVICES ]-------------------------------------------------+ |
|  |                                                                | |
|  |  -- Plumbing Services --                                       | |
|  |  [PIPE REPAIR] [TAP INSTALL] [DRAIN CLEAN] [TOILET FIX]       | |
|  |  [WATER HEATER] [BOREHOLE PUMP] [+ 4 more]                    | |
|  |                                                                | |
|  |  -- Rates --                                                   | |
|  |  From KES 1,500/hour | Minimum: 1 hour                        | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ PAYMENT OPTIONS ]------------------------------------------+ |
|  |  Accepts: [M-Pesa] [Cash] [Platform Wallet]                    | |
|  |  Deposit: 20% required (refundable)                            | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ SERVICE AREA ]---------------------------------------------+ |
|  |  Based in: Westlands, Nairobi                                  | |
|  |  Covers: Nairobi County, Kiambu (partial)                      | |
|  |  Service radius: 15 km                                         | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ PORTFOLIO ]------------------------------------------------+ |
|  |  [Before] [After]  [Before] [After]  [Before] [After]          | |
|  |                                                                | |
|  |  Kitchen Sink Installation - "Excellent work!" - Mary W.       | |
|  |  Borehole Pump Repair - "Very professional" - Peter M.         | |
|  |  [View All 12 Projects]                                        | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ AVAILABILITY ]---------------------------------------------+ |
|  |  Status: [GREEN DOT] Available Now                             | |
|  |                                                                | |
|  |  Mon-Fri: 8:00 AM - 6:00 PM                                    | |
|  |  Saturday: 9:00 AM - 4:00 PM                                   | |
|  |  Sunday: Closed                                                | |
|  |  Emergency: Available (after hours rate applies)               | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ REVIEWS ]--------------------------------------------------+ |
|  |                                                                | |
|  |  Overall: 4.9/5 (127 reviews)                                  | |
|  |                                                                | |
|  |  Quality:    4.9/5  [==========--]                             | |
|  |  Punctuality: 4.8/5  [=========--]                             | |
|  |  Communication: 4.9/5  [==========-]                           | |
|  |  Value:      4.7/5  [=========--]                              | |
|  |                                                                | |
|  |  -- Recent Reviews --                                          | |
|  |                                                                | |
|  |  "John fixed our leaking pipe in under an hour. Very         | |
|  |   professional and cleaned up after."                          | |
|  |                                    - Sarah M., 2 days ago      | |
|  |                                                                | |
|  |  [View All 127 Reviews]                                        | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  +--[ CREDENTIALS ]----------------------------------------------+ |
|  |  Certifications:                                               | |
|  |  - Certified Plumber (NITA)                                    | |
|  |  - Water Systems Specialist                                    | |
|  |                                                                | |
|  |  Licenses:                                                     | |
|  |  - Nairobi County Trade License                                | |
|  |                                                                | |
|  |  Insurance:                                                    | |
|  |  - Public Liability Insurance (KES 1M coverage)               | |
|  +----------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

### 7.2 Compact Card View (For Search Results)

```
+--------------------------------------------------+
|  [Photo]  JOHN KAMAU                             |
|           Plumbing Expert                        |
|           [ID VERIFIED] [TOP RATED]              |
|                                                  |
|  Rating: 4.9 (127)  |  2.3 km away               |
|  Response: < 1 hour |  KES 1,500/hr              |
|                                                  |
|  Services: PIPE REPAIR, TAP INSTALL, +4 more     |
|                                                  |
|  Status: [GREEN] Available                       |
|                                                  |
|  [VIEW PROFILE]  [BOOK NOW]                      |
+--------------------------------------------------+
```

---

## Part 8: Implementation Checklist

### Required Fields (MVP)

- [ ] Personal information form
- [ ] Location picker with map
- [ ] Service selection (WORD BANK integration)
- [ ] Rate configuration
- [ ] Payment method setup
- [ ] Availability calendar
- [ ] Profile photo upload

### Optional Fields (Enhancement)

- [ ] Portfolio/work gallery
- [ ] Certificate uploads
- [ ] License uploads
- [ ] Insurance documentation
- [ ] Business registration
- [ ] Social media links
- [ ] Custom service creation

### Payment Plan Features

- [ ] Payment method toggles
- [ ] Rate structure builder
- [ ] Milestone configuration
- [ ] Deposit settings
- [ ] Payout preferences

### Verification System

- [ ] ID document upload
- [ ] Automated OCR processing
- [ ] Manual review queue
- [ ] Badge assignment logic
- [ ] Verification status display

### Profile Completeness

- [ ] Completeness calculation
- [ ] Progress indicator
- [ ] Missing field prompts
- [ ] Tier assignment
- [ ] Benefits display

---

## Conclusion

The technician profile blueprint provides a comprehensive framework for:

1. **Building Trust**: Through verification badges, reviews, and transparent credentials
2. **Showcasing Expertise**: Via portfolio, services, and detailed professional information
3. **Enabling Matching**: Through location, availability, and service data
4. **Flexible Payment**: Through customizable payment plans and payout preferences

By implementing this blueprint, technicians can create profiles that:
- Attract customers through professional presentation
- Set clear expectations around services and pricing
- Build credibility through verification and reviews
- Maintain control over their payment preferences

**Next Steps**:
1. Build profile creation/edit UI
2. Implement verification document handling
3. Create payment plan builder
4. Develop profile completeness engine
5. Design public profile view

---

*End of Technician Profile Blueprint*
