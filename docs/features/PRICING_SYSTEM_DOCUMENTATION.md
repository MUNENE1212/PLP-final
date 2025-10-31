# Dynamic Pricing System Documentation

## Overview

The pricing system is a comprehensive, flexible solution that calculates service costs based on multiple factors. It's designed to scale and adapt as your business grows.

---

## Table of Contents

1. [Pricing Factors](#pricing-factors)
2. [System Architecture](#system-architecture)
3. [API Endpoints](#api-endpoints)
4. [Pricing Calculation Flow](#pricing-calculation-flow)
5. [Configuration Management](#configuration-management)
6. [Service Catalog](#service-catalog)
7. [Setup Instructions](#setup-instructions)
8. [Examples](#examples)
9. [Scaling & Customization](#scaling--customization)

---

## Pricing Factors

The system considers multiple factors when calculating prices:

### 1. Base Service Price
- **Category-specific pricing** (plumbing, electrical, carpentry, etc.)
- **Service-type pricing** (e.g., "Pipe Repair", "AC Installation")
- **Pricing units**: fixed, per_hour, per_sqm, per_unit
- **Estimated duration** for scheduling

### 2. Distance-Based Pricing
- **Distance tiers** with different rates
- **Flat fees** plus per-kilometer charges
- **Maximum service distance** limit
- Uses Haversine formula for accurate calculations

### 3. Urgency Multipliers
- **Low** (1.0x) - Standard, flexible timing
- **Medium** (1.2x) - Moderate priority, 2-3 days
- **High** (1.5x) - Same day or next day
- **Emergency** (2.0x) - Immediate response

### 4. Time-Based Pricing
- **Weekends** - Higher rates
- **After hours** - Evening/late night premium
- **Early morning** - Premium for early starts
- **Public holidays** - Configurable special rates

### 5. Technician Tier Pricing
Based on experience, rating, and completed jobs:
- **Junior** (0.8x) - Less than 2 years
- **Standard** (1.0x) - 2+ years, 3.5+ rating
- **Senior** (1.3x) - 5+ years, 4.0+ rating
- **Expert** (1.6x) - 8+ years, 4.5+ rating
- **Master** (2.0x) - 10+ years, 4.8+ rating

### 6. Platform Fee
- **Percentage-based** (default 15%)
- **Fixed amount** (alternative option)

### 7. Tax
- **VAT** or applicable tax rate (default 16%)
- Configurable per region

### 8. Discounts
- **First-time customer** - 10% off
- **Loyalty discounts** - Tiered based on booking history
  - 5 bookings: 5% off
  - 10 bookings: 8% off
  - 25 bookings: 12% off
  - 50+ bookings: 15% off

### 9. Surge Pricing (Optional)
- Activates during high demand
- When technician availability drops below threshold
- Configurable maximum multiplier

---

## System Architecture

### File Structure

```
backend/src/
├── models/
│   └── PricingConfig.js           # Pricing configuration model
├── services/
│   └── pricing.service.js         # Pricing calculation logic
├── controllers/
│   └── pricing.controller.js      # API endpoints
└── seeders/
    └── pricingSeed.js            # Initial pricing data
```

### Data Flow

```
Customer Request
      ↓
API Endpoint (pricing.controller.js)
      ↓
Pricing Service (pricing.service.js)
      ↓
[Get Active Config] → [Calculate Base Price]
      ↓                        ↓
[Calculate Distance] → [Apply Multipliers]
      ↓                        ↓
[Apply Discounts] → [Calculate Fees & Tax]
      ↓
Return Detailed Breakdown
```

---

## API Endpoints

### Public/Customer Endpoints

#### 1. Get Service Catalog
```http
GET /api/v1/pricing/catalog/:category

Example: GET /api/v1/pricing/catalog/plumbing
```

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "serviceCategory": "plumbing",
      "serviceType": "Pipe Repair",
      "basePrice": 1500,
      "priceUnit": "fixed",
      "estimatedDuration": 120,
      "description": "Basic pipe repair or replacement",
      "priceRange": {
        "min": 1500,
        "max": 3750
      }
    }
  ],
  "category": "plumbing",
  "currency": "KES"
}
```

#### 2. Get Price Estimate
```http
POST /api/v1/pricing/estimate
Authorization: Bearer {token}

Body:
{
  "serviceCategory": "plumbing",
  "serviceType": "Pipe Repair",
  "urgency": "medium",
  "serviceLocation": {
    "type": "Point",
    "coordinates": [36.8219, -1.2921]
  },
  "scheduledDateTime": "2025-01-25T10:00:00Z",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "estimate": {
    "basePrice": 1500,
    "distanceFee": 250,
    "urgencyMultiplier": 1.2,
    "timeMultiplier": 1,
    "technicianMultiplier": 1,
    "subtotal": 2100,
    "platformFee": 315,
    "tax": 386.4,
    "discount": 210,
    "totalAmount": 2591.4,
    "currency": "KES",
    "details": { /* full breakdown */ }
  },
  "note": "This is an estimate. Final price may vary based on assigned technician.",
  "configVersion": 1
}
```

#### 3. Calculate Exact Price
```http
POST /api/v1/pricing/calculate
Authorization: Bearer {token}

Body:
{
  "serviceCategory": "electrical",
  "serviceType": "Wiring Installation",
  "urgency": "high",
  "serviceLocation": {
    "type": "Point",
    "coordinates": [36.8219, -1.2921]
  },
  "technicianId": "technicianUserId",
  "scheduledDateTime": "2025-01-26T14:00:00Z",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "pricing": {
    "basePrice": 2000,
    "distanceFee": 180,
    "urgencyMultiplier": 1.5,
    "timeMultiplier": 1,
    "technicianMultiplier": 1.3,
    "subtotal": 4257,
    "platformFee": 638.55,
    "tax": 783.29,
    "discount": 0,
    "totalAmount": 5678.84,
    "currency": "KES",
    "details": {
      "servicePrice": { /* ... */ },
      "distance": {
        "kilometers": 6.5,
        "tier": {
          "range": "5-15km",
          "pricePerKm": 30,
          "flatFee": 100
        },
        "fee": 180
      },
      "urgency": {
        "level": "high",
        "multiplier": 1.5
      },
      "technician": {
        "name": "John Doe",
        "tier": "Senior",
        "multiplier": 1.3,
        "experience": 6,
        "rating": 4.5
      }
    }
  },
  "configVersion": 1
}
```

#### 4. Compare Technician Prices
```http
POST /api/v1/pricing/compare
Authorization: Bearer {token}

Body:
{
  "serviceCategory": "plumbing",
  "serviceType": "Drain Cleaning",
  "urgency": "medium",
  "serviceLocation": {
    "type": "Point",
    "coordinates": [36.8219, -1.2921]
  },
  "technicianIds": ["tech1", "tech2", "tech3"],
  "scheduledDateTime": "2025-01-25T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "comparisons": [
    {
      "technician": {
        "id": "tech1",
        "name": "Alice Smith",
        "rating": 4.2,
        "completedJobs": 45,
        "experience": 4
      },
      "pricing": {
        "totalAmount": 1890,
        /* full breakdown */
      },
      "distance": 3.2
    }
  ],
  "cheapest": { /* ... */ },
  "mostExpensive": { /* ... */ }
}
```

### Admin Endpoints

#### 5. Get Pricing Configuration
```http
GET /api/v1/pricing/config
Authorization: Bearer {adminToken}
```

#### 6. Create/Update Configuration
```http
POST /api/v1/pricing/config
Authorization: Bearer {adminToken}

Body: {
  /* Full pricing config object */
}
```

#### 7. Add Service Price
```http
POST /api/v1/pricing/config/:configId/services
Authorization: Bearer {adminToken}

Body:
{
  "serviceCategory": "plumbing",
  "serviceType": "Water Softener Installation",
  "basePrice": 4500,
  "priceUnit": "fixed",
  "estimatedDuration": 240,
  "description": "Install water softener system"
}
```

#### 8. Update Service Price
```http
PUT /api/v1/pricing/config/:configId/services/:category/:serviceType
Authorization: Bearer {adminToken}

Body:
{
  "basePrice": 5000,
  "description": "Updated description"
}
```

#### 9. Get Configuration History
```http
GET /api/v1/pricing/config/history?page=1&limit=10
Authorization: Bearer {adminToken}
```

---

## Pricing Calculation Flow

### Detailed Formula

```
Step 1: Base Calculation
  base = servicePrice × quantity

Step 2: Distance Fee
  distanceFee = flatFee + (distance × pricePerKm)

Step 3: Apply Multipliers
  subtotal = (base + distanceFee) × urgencyMultiplier × timeMultiplier × technicianMultiplier

Step 4: Platform Fee
  if (percentageBased):
    platformFee = subtotal × (percentage / 100)
  else:
    platformFee = fixedAmount

Step 5: Calculate Tax
  taxableAmount = subtotal + platformFee
  tax = taxableAmount × (taxRate / 100)

Step 6: Apply Discounts
  discount = calculateDiscounts(customer, subtotal)

Step 7: Final Total
  total = subtotal + platformFee + tax - discount

Step 8: Apply Constraints
  if (total < minBookingPrice):
    total = minBookingPrice
  if (total > maxBookingPrice):
    total = maxBookingPrice
```

### Example Calculation

**Scenario:**
- Service: Plumbing - Pipe Repair (1500 KES)
- Distance: 8 km
- Urgency: Medium (1.2x)
- Time: Weekend (1.3x)
- Technician: Senior (1.3x)
- Customer: 12th booking

**Calculation:**
```
Base Price:          1500 KES
Distance Fee:        100 + (8 × 30) = 340 KES
Subtotal Before:     1840 KES

Multipliers Applied: 1840 × 1.2 × 1.3 × 1.3 = 3723.36 KES

Platform Fee (15%):  558.50 KES
Tax (16%):          685.10 KES
Discount (8%):      297.87 KES

TOTAL:              4669.09 KES
```

---

## Configuration Management

### Version Control

The system supports configuration versioning:

1. **Active Configuration** - Currently used for all calculations
2. **Version History** - Previous configurations are archived
3. **Effective Dates** - Control when configurations activate

### Creating New Version

When updating prices:

```javascript
// Automatically creates new version
const newConfig = await activeConfig.cloneForNewVersion();
newConfig.servicePrices[0].basePrice = 1800; // Update price
await newConfig.save();

// Old config is automatically deactivated
```

### Configuration Schema

```javascript
{
  name: String,
  version: Number,
  isActive: Boolean,
  servicePrices: Array,
  distancePricing: Object,
  urgencyMultipliers: Array,
  timePricing: Object,
  technicianTiers: Object,
  platformFee: Object,
  tax: Object,
  discounts: Object,
  surgePricing: Object,
  minBookingPrice: Number,
  maxBookingPrice: Number,
  currency: String,
  effectiveFrom: Date,
  effectiveTo: Date,
  createdBy: ObjectId,
  lastModifiedBy: ObjectId
}
```

---

## Service Catalog

### Current Services (36 services across 7 categories)

**Plumbing** (6 services)
- Pipe Repair, Drain Cleaning, Toilet Installation, Water Heater Repair, Leak Detection, General Plumbing

**Electrical** (6 services)
- Wiring Installation, Light Fixture Installation, Circuit Breaker Replacement, Electrical Panel Upgrade, Socket Installation, General Electrical

**Carpentry** (6 services)
- Door Installation, Window Installation, Custom Furniture, Cabinet Installation, Deck Building, General Carpentry

**Masonry** (4 services)
- Brick Wall Construction, Concrete Work, Stone Veneer Installation, Foundation Repair

**Painting** (4 services)
- Interior Painting, Exterior Painting, Ceiling Painting, Wood Staining

**HVAC** (4 services)
- AC Installation, AC Repair, AC Maintenance, Ventilation Installation

**Welding** (4 services)
- Gate Fabrication, Metal Furniture, Grills Installation, General Welding

**Other** (2 services)
- General Handyman, Consultation

### Adding New Services

Admins can add services via API or directly in the database:

```javascript
const config = await PricingConfig.getActivePricing();
config.servicePrices.push({
  serviceCategory: 'plumbing',
  serviceType: 'Septic Tank Installation',
  basePrice: 15000,
  priceUnit: 'fixed',
  estimatedDuration: 600,
  description: 'Install complete septic system',
  isActive: true
});
await config.save();
```

---

## Setup Instructions

### 1. Install Dependencies

No additional packages required beyond existing Mongoose setup.

### 2. Run Pricing Seed

```bash
# Seed initial pricing data
node src/seeders/pricingSeed.js

# Force reseed (overwrites existing)
node src/seeders/pricingSeed.js --force
```

### 3. Add to package.json Scripts

```json
{
  "scripts": {
    "seed:pricing": "node src/seeders/pricingSeed.js",
    "seed:pricing:force": "node src/seeders/pricingSeed.js --force"
  }
}
```

### 4. Add Routes

Create `/backend/src/routes/pricing.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const {
  calculatePrice,
  getEstimate,
  comparePrices,
  getServiceCatalog,
  getPricingConfig,
  createPricingConfig,
  updatePricingConfig,
  addServicePrice,
  updateServicePrice,
  getConfigHistory
} = require('../controllers/pricing.controller');
const { auth, requireRole } = require('../middleware/auth.middleware');

// Public routes
router.get('/catalog/:category', getServiceCatalog);

// Authenticated routes
router.post('/estimate', auth, getEstimate);
router.post('/calculate', auth, calculatePrice);
router.post('/compare', auth, comparePrices);

// Admin routes
router.get('/config', auth, requireRole(['admin']), getPricingConfig);
router.post('/config', auth, requireRole(['admin']), createPricingConfig);
router.put('/config/:id', auth, requireRole(['admin']), updatePricingConfig);
router.post('/config/:id/services', auth, requireRole(['admin']), addServicePrice);
router.put('/config/:id/services/:serviceCategory/:serviceType', auth, requireRole(['admin']), updateServicePrice);
router.get('/config/history', auth, requireRole(['admin']), getConfigHistory);

module.exports = router;
```

Add to server.js:
```javascript
const pricingRoutes = require('./routes/pricing.routes');
app.use('/api/v1/pricing', pricingRoutes);
```

---

## Examples

### Frontend Integration Examples

#### 1. Show Service Prices on Category Page

```javascript
// Fetch services for plumbing category
fetch('/api/v1/pricing/catalog/plumbing')
  .then(res => res.json())
  .then(data => {
    displayServices(data.services);
  });
```

#### 2. Get Estimate Before Booking

```javascript
const getEstimate = async () => {
  const response = await fetch('/api/v1/pricing/estimate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      serviceCategory: 'electrical',
      serviceType: 'Wiring Installation',
      urgency: 'medium',
      serviceLocation: {
        type: 'Point',
        coordinates: [36.8219, -1.2921]
      }
    })
  });

  const data = await response.json();
  showEstimate(data.estimate);
};
```

#### 3. Show Technician Comparison

```javascript
// After matching technicians
const technicianIds = matchedTechnicians.map(t => t.id);

const response = await fetch('/api/v1/pricing/compare', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    serviceCategory,
    serviceType,
    urgency,
    serviceLocation,
    technicianIds,
    scheduledDateTime
  })
});

const { comparisons } = await response.json();
displayTechnicianOptions(comparisons);
```

---

## Scaling & Customization

### Easy Customizations

#### 1. Add New Service Category

```javascript
// In PricingConfig model, update enum
serviceCategory: {
  type: String,
  enum: ['plumbing', 'electrical', ..., 'solar_installation'],
  required: true
}
```

#### 2. Regional Pricing

Add location-based multipliers:

```javascript
regionalMultipliers: [{
  region: String, // 'nairobi', 'mombasa', etc.
  multiplier: Number
}]
```

#### 3. Seasonal Pricing

Add seasonal adjustments:

```javascript
seasonalPricing: [{
  season: String,
  startMonth: Number,
  endMonth: Number,
  multiplier: Number
}]
```

#### 4. Material Cost Addition

Track and add material costs:

```javascript
materials: [{
  name: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number
}]
```

#### 5. Dynamic Surge Pricing

Implement real-time surge pricing based on:
- Current technician availability
- Number of pending bookings
- Time of day
- Weather conditions

### Advanced Features to Add

1. **ML-Based Pricing**
   - Predict optimal prices based on historical data
   - Dynamic adjustment based on acceptance rates

2. **Competitive Pricing**
   - Market analysis integration
   - Price recommendations

3. **Customer Segmentation**
   - Corporate vs individual pricing
   - Subscription plans
   - Bulk booking discounts

4. **A/B Testing**
   - Test different pricing strategies
   - Measure conversion rates

5. **Promotions & Coupons**
   - Coupon code system
   - Time-limited promotions
   - Referral discounts

---

## Best Practices

### For Admins

1. **Test Before Deploying** - Always test new pricing configs in staging
2. **Version Control** - Never directly edit active configs, create new versions
3. **Monitor Metrics** - Track booking conversion rates after price changes
4. **Communicate Changes** - Notify technicians of pricing changes
5. **Regular Reviews** - Review and adjust pricing quarterly

### For Developers

1. **Cache Configs** - Cache active pricing config (10-15 min TTL)
2. **Error Handling** - Always handle pricing calculation errors gracefully
3. **Logging** - Log all pricing calculations for audit
4. **Testing** - Write comprehensive unit tests for calculations
5. **Documentation** - Keep this doc updated with changes

---

## Troubleshooting

### Common Issues

**Issue:** "No active pricing configuration found"
- **Solution:** Run the pricing seed script

**Issue:** Prices seem incorrect
- **Solution:** Check all multipliers are applied correctly
- Verify distance calculation is working
- Check for overlapping time-based multipliers

**Issue:** Service not found
- **Solution:** Ensure service is in active config's servicePrices array
- Check isActive flag is true

---

## Support

For questions or issues:
1. Check this documentation
2. Review code comments
3. Contact development team

---

**Last Updated:** January 2025
**Version:** 1.0
