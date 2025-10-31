# Pricing System - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Add Routes (2 minutes)

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

### Step 2: Add to server.js (1 minute)

```javascript
// Add this line with other route imports
const pricingRoutes = require('./routes/pricing.routes');

// Add this line with other route middleware
app.use('/api/v1/pricing', pricingRoutes);
```

### Step 3: Seed Pricing Data (1 minute)

```bash
# Run the seeder
node src/seeders/pricingSeed.js
```

### Step 4: Test It! (1 minute)

```bash
# Get plumbing services catalog
curl http://localhost:5000/api/v1/pricing/catalog/plumbing
```

✅ **Done!** Your pricing system is now live!

---

## 📊 What You Get

### 36 Pre-configured Services

**Plumbing:** Pipe Repair, Drain Cleaning, Toilet Installation, Water Heater Repair, Leak Detection, General Plumbing

**Electrical:** Wiring Installation, Light Fixture Installation, Circuit Breaker Replacement, Electrical Panel Upgrade, Socket Installation, General Electrical

**Carpentry:** Door Installation, Window Installation, Custom Furniture, Cabinet Installation, Deck Building, General Carpentry

**Masonry:** Brick Wall Construction, Concrete Work, Stone Veneer Installation, Foundation Repair

**Painting:** Interior/Exterior/Ceiling Painting, Wood Staining

**HVAC:** AC Installation/Repair/Maintenance, Ventilation Installation

**Welding:** Gate Fabrication, Metal Furniture, Grills Installation, General Welding

**Other:** General Handyman, Consultation

### Smart Pricing Features

✅ **Distance-based pricing** - 4 distance tiers (0-5km, 5-15km, 15-30km, 30-50km)
✅ **Urgency multipliers** - Low, Medium, High, Emergency
✅ **Time-based pricing** - Weekends, after hours, early morning
✅ **Technician tiers** - 5 levels from Junior to Master
✅ **Platform fee** - 15% configurable
✅ **VAT** - 16% (Kenya standard)
✅ **Discounts** - First-time (10%) and loyalty discounts
✅ **Min/Max constraints** - 500 KES minimum, 100,000 KES maximum

---

## 🧪 Test Examples

### 1. Get Service Catalog

```bash
curl http://localhost:5000/api/v1/pricing/catalog/electrical
```

### 2. Get Price Estimate

```bash
curl -X POST http://localhost:5000/api/v1/pricing/estimate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceCategory": "plumbing",
    "serviceType": "Pipe Repair",
    "urgency": "medium",
    "serviceLocation": {
      "type": "Point",
      "coordinates": [36.8219, -1.2921]
    }
  }'
```

### 3. Calculate Exact Price (with technician)

```bash
curl -X POST http://localhost:5000/api/v1/pricing/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceCategory": "electrical",
    "serviceType": "Wiring Installation",
    "urgency": "high",
    "serviceLocation": {
      "type": "Point",
      "coordinates": [36.8219, -1.2921]
    },
    "technicianId": "TECHNICIAN_USER_ID",
    "scheduledDateTime": "2025-01-26T10:00:00Z"
  }'
```

### 4. Compare Technician Prices

```bash
curl -X POST http://localhost:5000/api/v1/pricing/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceCategory": "plumbing",
    "serviceType": "Drain Cleaning",
    "urgency": "medium",
    "serviceLocation": {
      "type": "Point",
      "coordinates": [36.8219, -1.2921]
    },
    "technicianIds": ["tech1_id", "tech2_id", "tech3_id"]
  }'
```

---

## 🎨 Frontend Integration

### Show Services with Prices

```javascript
// Fetch and display services
const fetchServices = async (category) => {
  const response = await fetch(`/api/v1/pricing/catalog/${category}`);
  const data = await response.json();

  data.services.forEach(service => {
    console.log(`${service.serviceType}: ${service.basePrice} ${data.currency}`);
    // Display in UI
  });
};

fetchServices('plumbing');
```

### Get Real-time Estimate

```javascript
const showEstimate = async (bookingData) => {
  const response = await fetch('/api/v1/pricing/estimate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });

  const { estimate } = await response.json();

  // Display breakdown
  console.log('Subtotal:', estimate.subtotal);
  console.log('Platform Fee:', estimate.platformFee);
  console.log('Tax:', estimate.tax);
  console.log('Discount:', estimate.discount);
  console.log('TOTAL:', estimate.totalAmount, estimate.currency);
};
```

### Display Technician Options with Prices

```javascript
const showTechnicianOptions = async (bookingParams, technicianIds) => {
  const response = await fetch('/api/v1/pricing/compare', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...bookingParams,
      technicianIds
    })
  });

  const { comparisons, cheapest } = await response.json();

  // Sort by price and display
  comparisons.forEach(comp => {
    console.log(`${comp.technician.name} (${comp.technician.tier})`);
    console.log(`Distance: ${comp.distance}km`);
    console.log(`Price: ${comp.pricing.totalAmount} KES`);
    console.log('---');
  });

  // Highlight cheapest option
  console.log('Best Deal:', cheapest.technician.name);
};
```

---

## ⚙️ Customization Examples

### Add New Service

```javascript
// Via API (as admin)
const addService = async () => {
  await fetch('/api/v1/pricing/config/CONFIG_ID/services', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      serviceCategory: 'plumbing',
      serviceType: 'Water Softener Installation',
      basePrice: 4500,
      priceUnit: 'fixed',
      estimatedDuration: 240,
      description: 'Install water softener system'
    })
  });
};
```

### Update Service Price

```javascript
// Via API (as admin)
const updatePrice = async () => {
  await fetch('/api/v1/pricing/config/CONFIG_ID/services/plumbing/Pipe%20Repair', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      basePrice: 1800, // Increased from 1500
      description: 'Updated pricing for 2025'
    })
  });
};
```

### Adjust Distance Tiers

Edit pricing config:

```javascript
distancePricing: {
  enabled: true,
  maxServiceDistance: 60, // Increased from 50
  tiers: [
    { minDistance: 0, maxDistance: 10, pricePerKm: 0, flatFee: 0 }, // Free within 10km
    { minDistance: 10, maxDistance: 25, pricePerKm: 25, flatFee: 150 },
    { minDistance: 25, maxDistance: 40, pricePerKm: 35, flatFee: 400 },
    { minDistance: 40, maxDistance: 60, pricePerKm: 45, flatFee: 600 }
  ]
}
```

---

## 📱 Mobile App Integration

### React Native Example

```javascript
import axios from 'axios';

const PricingService = {
  async getEstimate(bookingData) {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/pricing/estimate',
        bookingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data.estimate;
    } catch (error) {
      console.error('Estimate error:', error);
      throw error;
    }
  },

  async getServiceCatalog(category) {
    const response = await axios.get(
      `http://localhost:5000/api/v1/pricing/catalog/${category}`
    );
    return response.data.services;
  }
};

// Usage
const estimate = await PricingService.getEstimate({
  serviceCategory: 'electrical',
  serviceType: 'Wiring Installation',
  urgency: 'medium',
  serviceLocation: {
    type: 'Point',
    coordinates: [36.8219, -1.2921]
  }
});

console.log('Estimated cost:', estimate.totalAmount, estimate.currency);
```

---

## 🔧 Admin Panel Integration

### Display Current Pricing Config

```javascript
const showPricingConfig = async () => {
  const response = await fetch('/api/v1/pricing/config', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const { config } = await response.json();

  // Display in admin panel
  console.log('Active Config Version:', config.version);
  console.log('Total Services:', config.servicePrices.length);
  console.log('Platform Fee:', config.platformFee.value + '%');
  console.log('Tax Rate:', config.tax.rate + '%');
};
```

### Show Pricing History

```javascript
const showHistory = async () => {
  const response = await fetch('/api/v1/pricing/config/history?page=1&limit=10', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const { configs } = await response.json();

  configs.forEach(config => {
    console.log(`Version ${config.version} - ${config.effectiveFrom}`);
    console.log(`Created by: ${config.createdBy.firstName}`);
    console.log(`Active: ${config.isActive}`);
    console.log('---');
  });
};
```

---

## 📈 Analytics & Reporting

### Track Pricing Impact

Add these queries to your analytics:

```javascript
// Average booking price
const avgPrice = await Booking.aggregate([
  { $group: { _id: null, avgPrice: { $avg: '$pricing.totalAmount' } } }
]);

// Price breakdown by service category
const priceByCategory = await Booking.aggregate([
  { $group: {
      _id: '$serviceCategory',
      avgPrice: { $avg: '$pricing.totalAmount' },
      count: { $sum: 1 }
    }
  }
]);

// Discount usage
const discountStats = await Booking.aggregate([
  { $match: { 'pricing.discount': { $gt: 0 } } },
  { $group: {
      _id: null,
      totalDiscount: { $sum: '$pricing.discount' },
      count: { $sum: 1 }
    }
  }
]);
```

---

## 🐛 Troubleshooting

### Issue: "No active pricing configuration found"

```bash
# Solution: Run the seeder
node src/seeders/pricingSeed.js
```

### Issue: Distance not calculating

```javascript
// Ensure User model has location field with GeoJSON format
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}
```

### Issue: Prices seem off

Check multipliers are applied correctly:
```javascript
// Debug pricing calculation
const result = await calculatePrice(params);
console.log('Base:', result.breakdown.basePrice);
console.log('Multipliers:', {
  urgency: result.breakdown.urgencyMultiplier,
  time: result.breakdown.timeMultiplier,
  technician: result.breakdown.technicianMultiplier
});
console.log('Details:', result.breakdown.details);
```

---

## 📚 Additional Resources

- **Full Documentation:** `PRICING_SYSTEM_DOCUMENTATION.md`
- **API Reference:** All endpoints documented in full docs
- **Code:** Check `src/services/pricing.service.js` for calculation logic

---

## 🎯 Next Steps

1. ✅ **Set up routes** - Done in 2 minutes
2. ✅ **Seed data** - Done in 1 minute
3. ✅ **Test APIs** - Verify it works
4. 🎨 **Build frontend** - Integrate into your UI
5. 📊 **Monitor** - Track pricing performance
6. 🔧 **Customize** - Adjust for your market

---

## 💡 Pro Tips

1. **Cache the active config** - Reduces database queries
2. **Log all calculations** - Helps debug pricing issues
3. **A/B test pricing** - Try different prices to optimize
4. **Update quarterly** - Review and adjust pricing regularly
5. **Listen to feedback** - Customers and technicians will guide you

---

**Need Help?** Check the full documentation or contact the dev team!

**Ready to scale?** The system is designed to grow with you!
