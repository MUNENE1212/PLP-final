# Migration Plan - Dumuwaks Service & Payment System

## Overview

This document outlines the step-by-step migration strategy from the current system to the new flexible service discovery (WORD BANK), technician-defined pricing, and escrow-based payment system. The migration prioritizes backward compatibility and zero downtime.

---

## Table of Contents

1. [Migration Principles](#migration-principles)
2. [Current State Analysis](#current-state-analysis)
3. [Target State](#target-state)
4. [Migration Phases](#migration-phases)
5. [Rollback Strategy](#rollback-strategy)
6. [Testing Strategy](#testing-strategy)
7. [Communication Plan](#communication-plan)

---

## Migration Principles

1. **Zero Downtime**: All migrations happen without service interruption
2. **Backward Compatibility**: Existing bookings continue to work
3. **Feature Flags**: New features roll out gradually
4. **Data Integrity**: No data loss during migration
5. **Reversible**: Each step can be rolled back independently

---

## Current State Analysis

### Data Models (Existing)

| Model | Description | Migration Need |
|-------|-------------|----------------|
| User | Customer/Technician profiles | Add payout preferences, service categories |
| Booking | Service bookings | Add serviceDetails, paymentPlan, escrow refs |
| Transaction | Payment records | Add escrow, milestone support |
| PricingConfig | Platform pricing | Keep for platform defaults |

### Service Categories (Existing)

```javascript
// Current: Fixed enum in Booking schema
serviceCategory: {
  type: String,
  enum: ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other']
}
```

**Problem**: Fixed list, no flexibility for new services

### Pricing (Existing)

```javascript
// Current: Platform-defined pricing
pricing: {
  basePrice: Number,
  serviceCharge: Number,
  platformFee: Number,
  totalAmount: Number
}
```

**Problem**: No technician-specific pricing, no hourly/milestone options

### Payment Flow (Existing)

```javascript
// Current: Direct payment, simple booking fee
payment: {
  status: String,
  method: String,
  transactionId: ObjectId
}
```

**Problem**: No escrow, no milestone payments

---

## Target State

### New Models

| Model | Purpose |
|-------|---------|
| ServiceCategory | 16 categories with visual assets |
| Service | 100+ sub-services (WORD BANK) |
| TechnicianService | Technician offerings with custom pricing |
| PaymentPlan | Flexible pricing with milestones |
| Escrow | Secure fund holding |
| Payout | Technician payment tracking |

### Enhanced Models

| Model | New Fields |
|-------|------------|
| User | payoutPreferences, serviceCategories |
| Booking | serviceDetails, paymentPlan, escrow, pricingModel |

---

## Migration Phases

### Phase 0: Preparation (Week 1)

**Objective**: Set up infrastructure and data preparation

#### Tasks

- [ ] **P0.1**: Create new MongoDB collections (empty)
  ```bash
  # Collections to create
  servicecategories
  services
  technicianservices
  paymentplans
  escrows
  payouts
  payoutbatches
  ```

- [ ] **P0.2**: Add feature flags
  ```javascript
  // config/featureFlags.js
  module.exports = {
    WORD_BANK_ENABLED: false,
    TECHNICIAN_PRICING_ENABLED: false,
    ESCROW_ENABLED: false,
    MILESTONE_PAYMENTS_ENABLED: false,
  };
  ```

- [ ] **P0.3**: Create indexes on new collections
  ```javascript
  // Refer to DATABASE_SCHEMAS.md for index definitions
  ```

- [ ] **P0.4**: Set up monitoring and alerts
  - Database performance metrics
  - API response times
  - Error rates

- [ ] **P0.5**: Create backup of existing data
  ```bash
  mongodump --uri="$MONGODB_URI" --out=/backup/pre-migration-$(date +%Y%m%d)
  ```

**Deliverables**:
- Empty collections ready
- Feature flags configured
- Monitoring dashboards
- Data backup completed

---

### Phase 1: Service Categories & WORD BANK (Week 2-3)

**Objective**: Migrate service categories to new schema

#### Step 1.1: Seed Service Categories

```javascript
// scripts/migration/seedServiceCategories.js

const categories = [
  {
    slug: 'plumbing',
    name: 'PLUMBING',
    icon: 'faucet',
    imageUrl: 'https://cdn.dumuwaks.com/categories/plumbing.jpg',
    group: 'home_maintenance',
    displayOrder: 1,
    isPopular: true
  },
  // ... all 16 categories
];

async function seedCategories() {
  for (const cat of categories) {
    await ServiceCategory.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, new: true }
    );
  }
}
```

#### Step 1.2: Seed Services (WORD BANK)

```javascript
// scripts/migration/seedServices.js

const services = {
  plumbing: [
    { slug: 'pipe-repair', name: 'PIPE REPAIR', shortName: 'PIPE', displayOrder: 1 },
    { slug: 'tap-installation', name: 'TAP INSTALLATION', shortName: 'TAP', displayOrder: 2 },
    // ... 11 plumbing services
  ],
  electrical: [
    { slug: 'wiring', name: 'WIRING', shortName: 'WIRE', displayOrder: 1 },
    // ... 10 electrical services
  ],
  // ... all services from all categories
};

async function seedServices() {
  for (const [categorySlug, serviceList] of Object.entries(services)) {
    const category = await ServiceCategory.findOne({ slug: categorySlug });
    
    for (const svc of serviceList) {
      await Service.findOneAndUpdate(
        { category: category._id, slug: svc.slug },
        { ...svc, category: category._id },
        { upsert: true, new: true }
      );
    }
  }
}
```

#### Step 1.3: Link Existing Bookings

```javascript
// scripts/migration/linkExistingBookings.js

async function linkExistingBookings() {
  const bookings = await Booking.find({ 
    serviceCategory: { $exists: true },
    'serviceDetails.category': { $exists: false }
  });

  for (const booking of bookings) {
    const category = await ServiceCategory.findOne({ 
      slug: booking.serviceCategory 
    });
    
    if (category) {
      booking.serviceDetails = {
        category: category._id,
        isCustomService: false
      };
      await booking.save();
    }
  }
}
```

#### Step 1.4: Enable Feature Flag

```javascript
// Enable WORD_BANK
featureFlags.WORD_BANK_ENABLED = true;
```

**Deliverables**:
- 16 categories seeded
- 100+ services seeded
- Existing bookings linked
- WORD_BANK accessible in UI (behind flag)

---

### Phase 2: Technician Services (Week 4-5)

**Objective**: Allow technicians to define their service offerings

#### Step 2.1: Migrate Existing Technician Skills

```javascript
// scripts/migration/migrateTechnicianSkills.js

async function migrateTechnicianSkills() {
  const technicians = await User.find({ 
    role: 'technician',
    'skills.0': { $exists: true }
  });

  for (const tech of technicians) {
    for (const skill of tech.skills) {
      // Find category matching skill category
      const category = await ServiceCategory.findOne({ 
        slug: skill.category 
      });
      
      if (!category) continue;

      // Find services in this category
      const services = await Service.find({ category: category._id });
      
      for (const service of services) {
        // Check if technician already has this service
        const exists = await TechnicianService.findOne({
          technician: tech._id,
          service: service._id
        });

        if (!exists) {
          // Create technician service with default pricing
          await TechnicianService.create({
            technician: tech._id,
            service: service._id,
            category: category._id,
            pricing: {
              model: 'hourly',
              rate: tech.hourlyRate || 500,
              unitLabel: 'per hour',
              minimumCharge: tech.hourlyRate || 500,
              estimatedDuration: {
                min: 60,
                max: 180,
                typical: 90
              }
            },
            serviceArea: {
              maxDistance: tech.serviceRadius || 10
            },
            status: 'active'
          });
        }
      }
    }
    
    // Update user with service categories
    const techCategories = await TechnicianService.distinct('category', {
      technician: tech._id
    });
    tech.serviceCategories = techCategories;
    await tech.save();
  }
}
```

#### Step 2.2: Add User Schema Extensions

```javascript
// Add to User schema via migration script
// These fields should be added through a schema update

// payoutPreferences - default values
User.updateMany(
  { role: 'technician', payoutPreferences: { $exists: false } },
  {
    $set: {
      'payoutPreferences': {
        defaultMethod: 'mpesa',
        schedule: 'same_day',
        minimumAmount: 10000,
        mpesaNumber: '$phoneNumber'
      }
    }
  }
);
```

#### Step 2.3: Enable Feature Flag

```javascript
featureFlags.TECHNICIAN_PRICING_ENABLED = true;
```

**Deliverables**:
- All technicians have TechnicianService documents
- Technicians can manage their services
- Custom pricing visible in UI

---

### Phase 3: Payment Plans (Week 6-7)

**Objective**: Support flexible pricing models

#### Step 3.1: Create PaymentPlans for Existing Bookings

```javascript
// scripts/migration/createPaymentPlans.js

async function createPaymentPlansForExistingBookings() {
  // Only for bookings not yet completed
  const bookings = await Booking.find({
    status: { $nin: ['completed', 'verified', 'paid', 'cancelled', 'refunded'] },
    paymentPlan: { $exists: false }
  });

  for (const booking of bookings) {
    const paymentPlan = await PaymentPlan.create({
      booking: booking._id,
      model: {
        type: 'fixed',
        baseRate: booking.pricing.totalAmount,
        estimatedHours: 1
      },
      breakdown: {
        baseAmount: booking.pricing.basePrice || booking.pricing.totalAmount,
        subtotal: booking.pricing.totalAmount,
        platformFee: booking.pricing.platformFee || 0,
        platformFeePercentage: 12.5,
        totalAmount: booking.pricing.totalAmount
      },
      deposit: {
        required: true,
        type: 'percentage',
        amount: 20
      },
      depositAmount: booking.bookingFee?.amount || 0,
      depositStatus: mapBookingFeeStatus(booking.bookingFee?.status),
      status: mapBookingStatusToPaymentPlan(booking.status),
      technicianEarnings: {
        grossAmount: booking.pricing.totalAmount,
        platformFee: booking.pricing.platformFee || 0,
        netAmount: booking.pricing.totalAmount - (booking.pricing.platformFee || 0)
      }
    });

    // Link booking to payment plan
    booking.paymentPlan = paymentPlan._id;
    await booking.save();
  }
}

function mapBookingFeeStatus(status) {
  const map = {
    'pending': 'pending',
    'paid': 'paid',
    'held': 'held',
    'released': 'applied',
    'refunded': 'refunded'
  };
  return map[status] || 'pending';
}
```

#### Step 3.2: Update Booking Schema

```javascript
// Add new fields to existing bookings
// This is done through schema extension, not data migration

// New bookings will use enhanced pricing model
// Existing bookings continue to use legacy pricing
```

**Deliverables**:
- PaymentPlan created for active bookings
- New bookings use enhanced pricing
- Legacy bookings continue to work

---

### Phase 4: Escrow System (Week 8-9)

**Objective**: Implement escrow for payment security

#### Step 4.1: Create Escrow Accounts

```javascript
// scripts/migration/createEscrowAccounts.js

async function createEscrowForActiveBookings() {
  const bookings = await Booking.find({
    status: { $in: ['accepted', 'en_route', 'arrived', 'in_progress', 'completed'] },
    'bookingFee.status': 'paid',
    escrow: { $exists: false }
  }).populate('paymentPlan');

  for (const booking of bookings) {
    if (!booking.paymentPlan) continue;

    const escrow = await Escrow.create({
      booking: booking._id,
      paymentPlan: booking.paymentPlan._id,
      customer: booking.customer,
      technician: booking.technician,
      amounts: {
        held: booking.bookingFee?.amount || 0,
        released: 0,
        refunded: 0,
        pending: 0
      },
      status: 'funded',
      releaseConditions: {
        type: 'customer_confirmation',
        autoReleaseAfter: 48,
        requirePhotoEvidence: true
      },
      fundedAt: booking.bookingFee?.paidAt || new Date(),
      holdStartedAt: booking.bookingFee?.paidAt || new Date()
    });

    // Add initial event
    escrow.events.push({
      type: 'funded',
      amount: booking.bookingFee?.amount || 0,
      triggeredAt: booking.bookingFee?.paidAt || new Date(),
      notes: 'Migrated from existing booking fee'
    });
    await escrow.save();

    // Link booking to escrow
    booking.escrow = escrow._id;
    await booking.save();
  }
}
```

#### Step 4.2: Enable Feature Flag

```javascript
featureFlags.ESCROW_ENABLED = true;
```

#### Step 4.3: Update Payment Flow

1. New bookings create escrow on booking fee payment
2. Escrow holds funds until customer confirmation
3. Auto-release after 48 hours of completion
4. Admin can manually release/refund

**Deliverables**:
- Escrow accounts for active bookings
- New payment flow with escrow
- Manual release capability

---

### Phase 5: Payout System (Week 10)

**Objective**: Implement technician payout tracking

#### Step 5.1: Create Payouts for Completed Bookings

```javascript
// scripts/migration/createPayoutsForCompleted.js

async function createPayoutsForCompletedBookings() {
  // Find completed bookings with released escrow but no payout
  const escrows = await Escrow.find({
    status: 'released',
    'amounts.released': { $gt: 0 }
  }).populate({
    path: 'booking',
    match: { status: { $in: ['verified', 'paid'] } }
  });

  // Group by technician and date
  const payoutGroups = {};

  for (const escrow of escrows) {
    if (!escrow.booking) continue;

    const techId = escrow.technician.toString();
    const dateKey = moment(escrow.releasedAt).format('YYYY-MM-DD');
    const key = `${techId}-${dateKey}`;

    if (!payoutGroups[key]) {
      payoutGroups[key] = {
        technician: escrow.technician,
        date: dateKey,
        items: [],
        totalNet: 0
      };
    }

    // Get technician earnings from payment plan
    const paymentPlan = await PaymentPlan.findOne({ booking: escrow.booking._id });
    
    payoutGroups[key].items.push({
      booking: escrow.booking._id,
      escrow: escrow._id,
      amount: paymentPlan?.technicianEarnings?.grossAmount || escrow.amounts.released,
      platformFee: paymentPlan?.technicianEarnings?.platformFee || 0,
      netAmount: paymentPlan?.technicianEarnings?.netAmount || escrow.amounts.released
    });

    payoutGroups[key].totalNet += paymentPlan?.technicianEarnings?.netAmount || escrow.amounts.released;
  }

  // Create payouts
  for (const [key, group] of Object.entries(payoutGroups)) {
    const technician = await User.findById(group.technician);
    
    await Payout.create({
      technician: group.technician,
      payoutType: 'daily',
      amounts: {
        grossAmount: group.items.reduce((sum, i) => sum + i.amount, 0),
        platformFees: group.items.reduce((sum, i) => sum + i.platformFee, 0),
        netAmount: group.totalNet
      },
      items: group.items,
      itemCount: group.items.length,
      paymentMethod: {
        type: technician.payoutPreferences?.defaultMethod || 'mpesa',
        mpesaNumber: technician.payoutPreferences?.mpesaNumber || technician.phoneNumber
      },
      status: 'completed',
      completedAt: new Date(group.date),
      period: {
        startDate: new Date(group.date + 'T00:00:00.000Z'),
        endDate: new Date(group.date + 'T23:59:59.999Z')
      }
    });
  }
}
```

**Deliverables**:
- Payout history populated
- New payouts tracked automatically
- Technician dashboard shows earnings

---

### Phase 6: Frontend Migration (Week 11-12)

**Objective**: Deploy new UI components

#### Step 6.1: Add Redux Slices

1. Add new slices to store configuration
2. Keep existing slices for backward compatibility
3. Use feature flags to conditionally render

#### Step 6.2: Deploy Service Discovery UI

```typescript
// Conditional rendering based on feature flag
function HomePage() {
  const wordBankEnabled = useFeatureFlag('WORD_BANK_ENABLED');

  return (
    <>
      {wordBankEnabled ? (
        <ServiceDiscoveryGrid />
      ) : (
        <LegacyServiceSelection />
      )}
    </>
  );
}
```

#### Step 6.3: Deploy Booking Flow

1. Keep existing booking flow for in-progress bookings
2. New bookings use enhanced flow
3. A/B test with percentage rollout

#### Step 6.4: Deploy Payment UI

1. Escrow status display
2. Payout dashboard for technicians
3. Payment method selection

---

## Rollback Strategy

### Feature Flag Rollback

```javascript
// Immediate rollback
featureFlags.WORD_BANK_ENABLED = false;
featureFlags.TECHNICIAN_PRICING_ENABLED = false;
featureFlags.ESCROW_ENABLED = false;
```

### Data Rollback

```javascript
// Rollback escrow migration
async function rollbackEscrowMigration() {
  await Booking.updateMany({}, { $unset: { escrow: 1 } });
  await Escrow.deleteMany({});
}

// Rollback payment plan migration
async function rollbackPaymentPlanMigration() {
  await Booking.updateMany({}, { $unset: { paymentPlan: 1 } });
  await PaymentPlan.deleteMany({});
}
```

### Rollback Triggers

| Condition | Action |
|-----------|--------|
| Error rate > 5% | Disable feature flag |
| Response time > 2s | Scale resources, then rollback |
| Payment failures > 1% | Immediate rollback |
| User complaints > 10/hour | Review and rollback |

---

## Testing Strategy

### Unit Tests

- [ ] Service category CRUD operations
- [ ] Service search functionality
- [ ] Pricing calculations
- [ ] Escrow state transitions
- [ ] Payout calculations

### Integration Tests

- [ ] End-to-end booking flow
- [ ] Payment with escrow
- [ ] Payout processing
- [ ] Milestone payments

### Migration Tests

- [ ] Data integrity after migration
- [ ] Backward compatibility
- [ ] Rollback procedures

### Load Tests

- [ ] Service search performance
- [ ] Concurrent booking creation
- [ ] Payment processing capacity

---

## Communication Plan

### Internal Stakeholders

| Phase | Audience | Message |
|-------|----------|---------|
| Phase 0 | Engineering | Migration infrastructure ready |
| Phase 1 | Product | WORD BANK available for testing |
| Phase 2 | Operations | Technician onboarding updated |
| Phase 3 | Finance | New pricing models active |
| Phase 4 | Support | Escrow flow documentation |
| Phase 5 | Finance | Payout system updated |

### External Stakeholders (Users)

| Phase | Message | Channel |
|-------|---------|---------|
| Phase 2 | "New: Set your own prices!" | Email to technicians |
| Phase 4 | "More secure payments with escrow" | In-app notification |
| Phase 5 | "Track your earnings easily" | Push notification |

---

## Migration Checklist

### Pre-Migration

- [ ] Backup production database
- [ ] Verify backup integrity
- [ ] Stage migration scripts
- [ ] Review rollback procedures
- [ ] Alert team on call

### During Migration

- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Monitor error rates
- [ ] Check migration logs
- [ ] Verify data integrity

### Post-Migration

- [ ] Run integrity checks
- [ ] Verify feature functionality
- [ ] Update documentation
- [ ] Close migration ticket
- [ ] Schedule retrospective

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-17 | System Architect | Initial migration plan |
