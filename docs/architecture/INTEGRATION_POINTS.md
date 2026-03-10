# Integration Points - Dumuwaks Service & Payment System

## Overview

This document maps out where the new service discovery (WORD BANK), payment plans, and escrow system integrate with the existing Dumuwaks codebase. Each integration point includes the file location, changes required, and implementation notes.

---

## Table of Contents

1. [Backend Integration Points](#backend-integration-points)
2. [Frontend Integration Points](#frontend-integration-points)
3. [Database Integration Points](#database-integration-points)
4. [External Service Integration Points](#external-service-integration-points)
5. [WebSocket Events](#websocket-events)

---

## Backend Integration Points

### 1. Models

#### 1.1 User Model Extension

**File**: `/backend/src/models/User.js`

**Current State**: Contains technician skills and hourly rate

**Integration Required**:
```javascript
// Add after line 298 (after kyc section)

// NEW: Payout preferences for technicians
payoutPreferences: {
  defaultMethod: {
    type: String,
    enum: ['mpesa', 'bank_transfer', 'wallet'],
    default: 'mpesa'
  },
  schedule: {
    type: String,
    enum: ['instant', 'same_day', 'next_day', 'weekly'],
    default: 'same_day'
  },
  minimumAmount: {
    type: Number,
    default: 10000 // KES 100
  },
  mpesaNumber: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    swiftCode: String,
    verified: Boolean
  }
},

// NEW: Service categories technician offers
serviceCategories: [{
  type: Schema.Types.ObjectId,
  ref: 'ServiceCategory'
}]
```

**Notes**:
- These fields are optional and only relevant for technicians
- `payoutPreferences.mpesaNumber` should default to `phoneNumber` if not set

---

#### 1.2 Booking Model Extension

**File**: `/backend/src/models/Booking.js`

**Current State**: Uses fixed serviceCategory enum

**Integration Required**:
```javascript
// Add after line 94 (after serviceType field)

// NEW: Enhanced service selection (WORD BANK integration)
serviceDetails: {
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service'
  },
  technicianService: {
    type: Schema.Types.ObjectId,
    ref: 'TechnicianService'
  },
  customServiceName: String,
  customServiceDescription: String,
  isCustomService: {
    type: Boolean,
    default: false
  }
},

// NEW: Enhanced pricing model
pricingModel: {
  type: {
    type: String,
    enum: ['hourly', 'fixed', 'per_unit', 'milestone', 'quote'],
    default: 'fixed'
  },
  rate: Number,
  estimatedHours: Number,
  actualHours: Number,
  unitCount: Number,
  unitLabel: String
},

// NEW: Payment plan reference
paymentPlan: {
  type: Schema.Types.ObjectId,
  ref: 'PaymentPlan'
},

// NEW: Escrow reference
escrow: {
  type: Schema.Types.ObjectId,
  ref: 'Escrow'
},

// NEW: Milestone tracking
milestoneTracking: {
  currentMilestone: { type: Number, default: 0 },
  totalMilestones: { type: Number, default: 0 },
  milestones: [{
    order: Number,
    name: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'approved'],
      default: 'pending'
    },
    completedAt: Date,
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
}
```

**Backward Compatibility**:
- Keep existing `serviceCategory` and `serviceType` fields
- `serviceDetails` is optional for legacy bookings
- New code checks for `serviceDetails` first, falls back to legacy fields

---

#### 1.3 New Model Files

Create these new files in `/backend/src/models/`:

| File | Purpose |
|------|---------|
| `ServiceCategory.js` | WORD BANK categories |
| `Service.js` | WORD BANK services |
| `TechnicianService.js` | Technician offerings with pricing |
| `PaymentPlan.js` | Flexible pricing with milestones |
| `Escrow.js` | Fund holding until completion |
| `Payout.js` | Technician payout tracking |

**Model Registration**: Add to any model index file or import directly in controllers.

---

### 2. Routes

#### 2.1 New Route Files

Create in `/backend/src/routes/`:

| File | Base Path | Purpose |
|------|-----------|---------|
| `service.routes.js` | `/api/v1/services` | Service discovery (WORD BANK) |
| `technicianService.routes.js` | `/api/v1/technicians/:id/services` | Technician service management |
| `paymentPlan.routes.js` | `/api/v1/bookings/:id/payment-plan` | Payment plan management |
| `escrow.routes.js` | `/api/v1/bookings/:id/escrow` | Escrow operations |
| `payout.routes.js` | `/api/v1/payouts` | Payout management |

#### 2.2 Server Registration

**File**: `/backend/src/server.js`

**Integration Required**:
```javascript
// Add after existing route imports

// NEW: Service system routes
const serviceRoutes = require('./routes/service.routes');
const technicianServiceRoutes = require('./routes/technicianService.routes');
const paymentPlanRoutes = require('./routes/paymentPlan.routes');
const escrowRoutes = require('./routes/escrow.routes');
const payoutRoutes = require('./routes/payout.routes');

// Register routes
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/technicians', technicianServiceRoutes);
app.use('/api/v1/bookings', paymentPlanRoutes);
app.use('/api/v1/bookings', escrowRoutes);
app.use('/api/v1/payouts', payoutRoutes);
```

---

### 3. Controllers

#### 3.1 Booking Controller Extension

**File**: `/backend/src/controllers/booking.base.controller.js`

**Integration Required**:

Update `createBooking` method to:
1. Accept `serviceDetails` in request body
2. Validate service references
3. Create PaymentPlan automatically
4. Handle technicianService pricing

```javascript
// In createBooking method, add:

// NEW: Handle service details
if (req.body.serviceDetails) {
  const { category, service, technicianService, isCustomService } = req.body.serviceDetails;
  
  // Validate references
  if (service) {
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service reference'
      });
    }
  }
  
  // Get pricing from technician service if provided
  if (technicianService) {
    const techService = await TechnicianService.findById(technicianService);
    if (techService) {
      booking.pricingModel = {
        type: techService.pricing.model,
        rate: techService.pricing.rate,
        estimatedHours: req.body.estimatedDuration / 60,
        unitLabel: techService.pricing.unitLabel
      };
    }
  }
}

// After booking is saved, create payment plan
const paymentPlan = await PaymentPlan.create({
  booking: booking._id,
  // ... pricing details
});
booking.paymentPlan = paymentPlan._id;
await booking.save();
```

---

### 4. Services

#### 4.1 Pricing Service Extension

**File**: `/backend/src/services/pricing.service.js`

**Integration Required**:

Add support for technician-defined pricing:

```javascript
// Add new function

/**
 * Calculate pricing based on technician service settings
 */
async function calculateTechnicianPricing(technicianServiceId, options = {}) {
  const { estimatedHours = 1, unitCount = 1, urgency = 'medium' } = options;
  
  const techService = await TechnicianService.findById(technicianServiceId)
    .populate('service')
    .populate('category');
  
  if (!techService) {
    throw new Error('Technician service not found');
  }
  
  const { pricing } = techService;
  let baseAmount = 0;
  
  switch (pricing.model) {
    case 'hourly':
      baseAmount = pricing.rate * estimatedHours;
      if (pricing.minimumCharge && baseAmount < pricing.minimumCharge) {
        baseAmount = pricing.minimumCharge;
      }
      break;
    case 'fixed':
      baseAmount = pricing.rate;
      break;
    case 'per_unit':
      baseAmount = pricing.rate * unitCount;
      break;
    case 'quote_required':
      baseAmount = 0; // Requires custom quote
      break;
  }
  
  // Get urgency multiplier from platform config
  const platformConfig = await PricingConfig.getActivePricing();
  const urgencyMultiplier = platformConfig.getUrgencyMultiplier(urgency);
  
  const urgencyPremium = baseAmount * (urgencyMultiplier - 1);
  const subtotal = baseAmount + urgencyPremium;
  const platformFee = subtotal * (platformConfig.platformFee.value / 100);
  
  return {
    model: pricing.model,
    baseAmount,
    urgencyPremium,
    subtotal,
    platformFee,
    platformFeePercentage: platformConfig.platformFee.value,
    totalAmount: subtotal + platformFee,
    technicianEarnings: subtotal - platformFee,
    estimatedDuration: pricing.estimatedDuration
  };
}

module.exports = {
  // Existing exports
  ...module.exports,
  calculateTechnicianPricing
};
```

---

### 5. Middleware

#### 5.1 Feature Flag Middleware

**File**: Create `/backend/src/middleware/featureFlags.js`

```javascript
const featureFlags = require('../config/featureFlags');

function requireFeature(flagName) {
  return (req, res, next) => {
    if (!featureFlags[flagName]) {
      return res.status(403).json({
        success: false,
        message: 'This feature is not available'
      });
    }
    next();
  };
}

module.exports = {
  requireFeature
};
```

**Usage**:
```javascript
const { requireFeature } = require('../middleware/featureFlags');

router.get('/services/categories',
  requireFeature('WORD_BANK_ENABLED'),
  controller.getCategories
);
```

---

## Frontend Integration Points

### 1. Redux Store

#### 1.1 Store Configuration

**File**: `/frontend/src/store/index.ts`

**Integration Required**:
```typescript
import serviceDiscoveryReducer from './slices/serviceDiscoverySlice';
import technicianServicesReducer from './slices/technicianServicesSlice';
import bookingFlowReducer from './slices/bookingFlowSlice';
import paymentReducer from './slices/paymentSlice';
import escrowReducer from './slices/escrowSlice';
import payoutReducer from './slices/payoutSlice';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    serviceDiscovery: serviceDiscoveryReducer,
    technicianServices: technicianServicesReducer,
    bookingFlow: bookingFlowReducer,
    payment: paymentReducer,
    escrow: escrowReducer,
    payouts: payoutReducer,
  },
});
```

---

### 2. Pages

#### 2.1 Home Page Extension

**File**: `/frontend/src/pages/Home.tsx`

**Integration Required**:

Add WORD BANK category grid:

```typescript
import { ServiceDiscoveryGrid } from '@/components/services/ServiceDiscoveryGrid';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function Home() {
  const wordBankEnabled = useFeatureFlag('WORD_BANK_ENABLED');
  
  return (
    <div className="home-page">
      {/* Existing content */}
      
      {wordBankEnabled ? (
        <ServiceDiscoveryGrid />
      ) : (
        <LegacyCategoryList />
      )}
    </div>
  );
}
```

---

#### 2.2 Create Booking Page

**File**: `/frontend/src/pages/CreateBooking.tsx`

**Integration Required**:

Update to use multi-step booking flow:

```typescript
import { BookingFlowWizard } from '@/components/bookings/BookingFlowWizard';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function CreateBooking() {
  const newFlowEnabled = useFeatureFlag('NEW_BOOKING_FLOW_ENABLED');
  
  if (newFlowEnabled) {
    return <BookingFlowWizard />;
  }
  
  // Legacy booking form
  return <LegacyBookingForm />;
}
```

---

#### 2.3 Technician Profile Page

**File**: `/frontend/src/pages/TechnicianProfile.tsx`

**Integration Required**:

Add service listing with pricing:

```typescript
import { TechnicianServiceList } from '@/components/technicians/TechnicianServiceList';

function TechnicianProfile() {
  // ... existing code
  
  return (
    <div className="technician-profile">
      {/* Existing sections */}
      
      <section className="services-offered">
        <h2>Services Offered</h2>
        <TechnicianServiceList technicianId={technicianId} />
      </section>
    </div>
  );
}
```

---

### 3. Components

#### 3.1 New Component Files

Create in `/frontend/src/components/`:

| Path | Purpose |
|------|---------|
| `services/ServiceDiscoveryGrid.tsx` | WORD BANK category grid |
| `services/ServiceWordBank.tsx` | Service selection grid |
| `services/ServiceSearchBar.tsx` | Search component |
| `bookings/BookingFlowWizard.tsx` | Multi-step booking |
| `bookings/BookingFlowSteps/` | Individual step components |
| `payments/EscrowStatus.tsx` | Escrow status display |
| `payments/PayoutDashboard.tsx` | Technician payout dashboard |
| `technicians/TechnicianServiceList.tsx` | Service management |
| `technicians/TechnicianServiceForm.tsx` | Add/edit service form |

---

### 4. Services (API)

#### 4.1 New Service Files

Create in `/frontend/src/services/`:

| File | Purpose |
|------|---------|
| `service.service.ts` | Service discovery API calls |
| `technicianService.service.ts` | Technician service management |
| `paymentPlan.service.ts` | Payment plan operations |
| `escrow.service.ts` | Escrow operations |
| `payout.service.ts` | Payout management |

**Example**: `/frontend/src/services/service.service.ts`

```typescript
import axios from '@/lib/axios';

export const getCategories = async (params = {}) => {
  const response = await axios.get('/services/categories', { params });
  return response.data.data;
};

export const getCategoryServices = async (slug: string) => {
  const response = await axios.get(`/services/categories/${slug}`);
  return response.data.data;
};

export const searchServices = async (query: string) => {
  const response = await axios.get('/services/search', { params: { q: query } });
  return response.data.data;
};

export const getPopularServices = async () => {
  const response = await axios.get('/services/popular');
  return response.data.data.services;
};
```

---

### 5. Types

#### 5.1 New Type Files

Create in `/frontend/src/types/`:

| File | Purpose |
|------|---------|
| `service.ts` | Service and category types |
| `payment.ts` | Payment, escrow, payout types |
| `technicianService.ts` | Technician service types |

---

## Database Integration Points

### 1. Index Creation

**Location**: MongoDB shell or migration script

```javascript
// Run these after creating new collections

// ServiceCategory indexes
db.servicecategories.createIndex({ slug: 1 }, { unique: true });
db.servicecategories.createIndex({ group: 1, displayOrder: 1 });
db.servicecategories.createIndex({ isActive: 1, isPopular: -1 });

// Service indexes
db.services.createIndex({ category: 1, slug: 1 }, { unique: true });
db.services.createIndex({ category: 1, displayOrder: 1 });
db.services.createIndex(
  { name: 'text', description: 'text', searchTerms: 'text' },
  { weights: { name: 10, description: 5, searchTerms: 1 } }
);

// TechnicianService indexes
db.technicianservices.createIndex(
  { technician: 1, service: 1 },
  { unique: true, partialFilterExpression: { service: { $exists: true } } }
);
db.technicianservices.createIndex({ technician: 1, status: 1 });
db.technicianservices.createIndex({ category: 1, status: 1, isActive: 1 });

// PaymentPlan indexes
db.paymentplans.createIndex({ booking: 1 }, { unique: true });
db.paymentplans.createIndex({ status: 1 });

// Escrow indexes
db.escrows.createIndex({ booking: 1 }, { unique: true });
db.escrows.createIndex({ technician: 1, status: 1 });
db.escrows.createIndex({ status: 1, 'releaseSchedule.scheduledAt': 1 });

// Payout indexes
db.payouts.createIndex({ technician: 1, status: 1 });
db.payouts.createIndex({ payoutNumber: 1 }, { unique: true });
```

---

## External Service Integration Points

### 1. M-Pesa Integration

**File**: `/backend/src/services/mpesa.service.js`

**Current State**: STK Push for payments

**Integration Required**:

Add escrow funding support:

```javascript
// After successful M-Pesa callback for booking fee

async function handleBookingFeeSuccess(transaction) {
  const booking = await Booking.findById(transaction.booking);
  
  // NEW: Fund escrow instead of just marking booking fee
  if (featureFlags.ESCROW_ENABLED && booking.escrow) {
    const escrow = await Escrow.findById(booking.escrow);
    await escrow.fund(transaction.amount.net, transaction._id, transaction.payer);
  }
  
  // Existing: Update booking fee status
  booking.bookingFee.status = 'paid';
  booking.bookingFee.paidAt = new Date();
  booking.bookingFee.transactionId = transaction._id;
  await booking.save();
}
```

---

### 2. Flutterwave Integration

**File**: `/backend/src/services/flutterwave.service.js` (if exists)

**Integration Required**:

Similar escrow funding for card payments.

---

## WebSocket Events

### New Events to Add

**File**: `/backend/src/server.js` or socket handler file

```javascript
// Service discovery events
socket.on('service:search', async (query) => {
  const results = await Service.searchServices(query);
  socket.emit('service:search:results', results);
});

// Escrow events
socket.on('escrow:status', async (bookingId) => {
  const escrow = await Escrow.findOne({ booking: bookingId });
  socket.emit('escrow:status:update', escrow);
});

// Payout events
socket.on('payout:status', async (payoutId) => {
  const payout = await Payout.findById(payoutId);
  socket.emit('payout:status:update', payout);
});

// Broadcast events
function broadcastEscrowUpdate(escrow) {
  io.to(`booking:${escrow.booking}`).emit('escrow:updated', escrow);
  io.to(`user:${escrow.technician}`).emit('escrow:updated', escrow);
  io.to(`user:${escrow.customer}`).emit('escrow:updated', escrow);
}

function broadcastPayoutUpdate(payout) {
  io.to(`user:${payout.technician}`).emit('payout:updated', payout);
}
```

---

## Feature Flag Configuration

**File**: Create `/backend/src/config/featureFlags.js`

```javascript
module.exports = {
  // Phase 1
  WORD_BANK_ENABLED: process.env.FF_WORD_BANK === 'true' || false,
  
  // Phase 2
  TECHNICIAN_PRICING_ENABLED: process.env.FF_TECHNICIAN_PRICING === 'true' || false,
  
  // Phase 3
  PAYMENT_PLANS_ENABLED: process.env.FF_PAYMENT_PLANS === 'true' || false,
  
  // Phase 4
  ESCROW_ENABLED: process.env.FF_ESCROW === 'true' || false,
  MILESTONE_PAYMENTS_ENABLED: process.env.FF_MILESTONES === 'true' || false,
  
  // Phase 5
  NEW_BOOKING_FLOW_ENABLED: process.env.FF_NEW_BOOKING_FLOW === 'true' || false,
  INSTANT_PAYOUT_ENABLED: process.env.FF_INSTANT_PAYOUT === 'true' || false,
};
```

---

## Environment Variables

Add to `.env`:

```bash
# Feature Flags
FF_WORD_BANK=false
FF_TECHNICIAN_PRICING=false
FF_PAYMENT_PLANS=false
FF_ESCROW=false
FF_MILESTONES=false
FF_NEW_BOOKING_FLOW=false
FF_INSTANT_PAYOUT=false

# Escrow Settings
ESCROW_AUTO_RELEASE_HOURS=48
ESCROW_MIN_HOLD_HOURS=24

# Payout Settings
PAYOUT_MINIMUM_AMOUNT=10000
INSTANT_PAYOUT_FEE=150
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-17 | System Architect | Initial integration points |
