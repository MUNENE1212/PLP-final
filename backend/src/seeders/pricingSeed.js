const mongoose = require('mongoose');
const PricingConfig = require('../models/PricingConfig');
require('dotenv').config();

const defaultPricingConfig = {
  name: 'Default Pricing Configuration',
  version: 1,
  isActive: true,

  // Service Prices - Base prices for common services
  servicePrices: [
    // PLUMBING
    { serviceCategory: 'plumbing', serviceType: 'Pipe Repair', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 120, description: 'Basic pipe repair or replacement', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'Drain Cleaning', basePrice: 1200, priceUnit: 'fixed', estimatedDuration: 90, description: 'Unclogging drains and pipes', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'Toilet Installation', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 180, description: 'Complete toilet installation', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'Water Heater Repair', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 240, description: 'Water heater diagnostics and repair', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'Leak Detection', basePrice: 1000, priceUnit: 'fixed', estimatedDuration: 60, description: 'Identify and locate leaks', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'General Plumbing', basePrice: 800, priceUnit: 'per_hour', estimatedDuration: 60, description: 'General plumbing services', isActive: true },

    // ELECTRICAL
    { serviceCategory: 'electrical', serviceType: 'Wiring Installation', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 180, description: 'Basic electrical wiring', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'Light Fixture Installation', basePrice: 800, priceUnit: 'fixed', estimatedDuration: 60, description: 'Install light fixtures', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'Circuit Breaker Replacement', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 120, description: 'Replace circuit breaker', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'Electrical Panel Upgrade', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 300, description: 'Upgrade electrical panel', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'Socket Installation', basePrice: 500, priceUnit: 'per_unit', estimatedDuration: 30, description: 'Install electrical socket/outlet', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'General Electrical', basePrice: 1000, priceUnit: 'per_hour', estimatedDuration: 60, description: 'General electrical services', isActive: true },

    // CARPENTRY
    { serviceCategory: 'carpentry', serviceType: 'Door Installation', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 180, description: 'Install interior/exterior door', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'Window Installation', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 150, description: 'Install windows', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'Custom Furniture', basePrice: 1200, priceUnit: 'per_sqm', estimatedDuration: 480, description: 'Custom furniture building', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'Cabinet Installation', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 240, description: 'Install kitchen/bathroom cabinets', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'Deck Building', basePrice: 2000, priceUnit: 'per_sqm', estimatedDuration: 600, description: 'Build outdoor deck', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'General Carpentry', basePrice: 800, priceUnit: 'per_hour', estimatedDuration: 60, description: 'General carpentry work', isActive: true },

    // MASONRY
    { serviceCategory: 'masonry', serviceType: 'Brick Wall Construction', basePrice: 1500, priceUnit: 'per_sqm', estimatedDuration: 480, description: 'Build brick walls', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'Concrete Work', basePrice: 1200, priceUnit: 'per_sqm', estimatedDuration: 360, description: 'Concrete pouring and finishing', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'Stone Veneer Installation', basePrice: 2000, priceUnit: 'per_sqm', estimatedDuration: 300, description: 'Install decorative stone veneer', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'Foundation Repair', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 480, description: 'Repair building foundation', isActive: true },

    // PAINTING
    { serviceCategory: 'painting', serviceType: 'Interior Painting', basePrice: 400, priceUnit: 'per_sqm', estimatedDuration: 240, description: 'Interior wall painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'Exterior Painting', basePrice: 500, priceUnit: 'per_sqm', estimatedDuration: 300, description: 'Exterior wall painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'Ceiling Painting', basePrice: 450, priceUnit: 'per_sqm', estimatedDuration: 180, description: 'Ceiling painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'Wood Staining', basePrice: 600, priceUnit: 'per_sqm', estimatedDuration: 200, description: 'Wood staining and finishing', isActive: true },

    // HVAC
    { serviceCategory: 'hvac', serviceType: 'AC Installation', basePrice: 8000, priceUnit: 'fixed', estimatedDuration: 300, description: 'Air conditioner installation', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'AC Repair', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 120, description: 'Air conditioner repair', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'AC Maintenance', basePrice: 1000, priceUnit: 'fixed', estimatedDuration: 90, description: 'Air conditioner servicing', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'Ventilation Installation', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 240, description: 'Install ventilation system', isActive: true },

    // WELDING
    { serviceCategory: 'welding', serviceType: 'Gate Fabrication', basePrice: 8000, priceUnit: 'fixed', estimatedDuration: 480, description: 'Custom gate welding', isActive: true },
    { serviceCategory: 'welding', serviceType: 'Metal Furniture', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 360, description: 'Metal furniture fabrication', isActive: true },
    { serviceCategory: 'welding', serviceType: 'Grills Installation', basePrice: 3000, priceUnit: 'per_unit', estimatedDuration: 240, description: 'Window grills fabrication', isActive: true },
    { serviceCategory: 'welding', serviceType: 'General Welding', basePrice: 1200, priceUnit: 'per_hour', estimatedDuration: 60, description: 'General welding services', isActive: true },

    // OTHER
    { serviceCategory: 'other', serviceType: 'General Handyman', basePrice: 700, priceUnit: 'per_hour', estimatedDuration: 60, description: 'General handyman services', isActive: true },
    { serviceCategory: 'other', serviceType: 'Consultation', basePrice: 500, priceUnit: 'fixed', estimatedDuration: 60, description: 'Professional consultation', isActive: true }
  ],

  // Distance Pricing Tiers
  distancePricing: {
    enabled: true,
    maxServiceDistance: 50,
    tiers: [
      { minDistance: 0, maxDistance: 5, pricePerKm: 0, flatFee: 0 }, // Free within 5km
      { minDistance: 5, maxDistance: 15, pricePerKm: 30, flatFee: 100 },
      { minDistance: 15, maxDistance: 30, pricePerKm: 40, flatFee: 300 },
      { minDistance: 30, maxDistance: 50, pricePerKm: 50, flatFee: 500 }
    ]
  },

  // Urgency Multipliers
  urgencyMultipliers: [
    { urgencyLevel: 'low', multiplier: 1.0, description: 'Standard service, flexible timing' },
    { urgencyLevel: 'medium', multiplier: 1.2, description: 'Moderate priority, within 2-3 days' },
    { urgencyLevel: 'high', multiplier: 1.5, description: 'High priority, same day or next day' },
    { urgencyLevel: 'emergency', multiplier: 2.0, description: 'Emergency service, immediate response' }
  ],

  // Time-based Pricing
  timePricing: {
    enabled: true,
    schedules: [
      {
        name: 'Weekend',
        daysOfWeek: [0, 6], // Sunday and Saturday
        multiplier: 1.3,
        isActive: true
      },
      {
        name: 'After Hours (Weekdays)',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        startTime: '18:00',
        endTime: '23:59',
        multiplier: 1.4,
        isActive: true
      },
      {
        name: 'Early Morning (Weekdays)',
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '00:00',
        endTime: '06:00',
        multiplier: 1.5,
        isActive: true
      },
      {
        name: 'Public Holiday',
        daysOfWeek: [], // Set manually for specific dates
        multiplier: 1.5,
        isActive: false // Activated manually for holidays
      }
    ]
  },

  // Technician Tier Pricing
  technicianTiers: {
    enabled: true,
    tiers: [
      {
        tierName: 'Junior',
        minExperience: 0,
        minRating: 0,
        minCompletedJobs: 0,
        priceMultiplier: 0.8,
        description: 'New technicians, less than 2 years experience'
      },
      {
        tierName: 'Standard',
        minExperience: 2,
        minRating: 3.5,
        minCompletedJobs: 10,
        priceMultiplier: 1.0,
        description: 'Experienced technicians'
      },
      {
        tierName: 'Senior',
        minExperience: 5,
        minRating: 4.0,
        minCompletedJobs: 50,
        priceMultiplier: 1.3,
        description: 'Highly experienced technicians'
      },
      {
        tierName: 'Expert',
        minExperience: 8,
        minRating: 4.5,
        minCompletedJobs: 100,
        priceMultiplier: 1.6,
        description: 'Expert technicians with specialized skills'
      },
      {
        tierName: 'Master',
        minExperience: 10,
        minRating: 4.8,
        minCompletedJobs: 200,
        priceMultiplier: 2.0,
        description: 'Master craftsmen with exceptional skills'
      }
    ]
  },

  // Platform Fee
  platformFee: {
    type: 'percentage',
    value: 15 // 15%
  },

  // Tax
  tax: {
    enabled: true,
    rate: 16, // 16% VAT
    name: 'VAT'
  },

  // Discounts
  discounts: {
    firstTimeCustomer: {
      enabled: true,
      type: 'percentage',
      value: 10 // 10% off
    },
    loyaltyDiscount: {
      enabled: true,
      thresholds: [
        { minBookings: 5, discount: 5 },
        { minBookings: 10, discount: 8 },
        { minBookings: 25, discount: 12 },
        { minBookings: 50, discount: 15 }
      ]
    }
  },

  // Surge Pricing
  surgePricing: {
    enabled: false, // Can be enabled during high demand
    threshold: 20, // When 80% of technicians are busy
    maxMultiplier: 2.0
  },

  // Min/Max Prices
  minBookingPrice: 500, // KES
  maxBookingPrice: 100000, // KES

  currency: 'KES',

  effectiveFrom: new Date(),
  notes: 'Initial pricing configuration for Kenyan market'
};

async function seedPricing() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected for seeding...');

    // Check if pricing config already exists
    const existingConfig = await PricingConfig.findOne();

    if (existingConfig) {
      console.log('Pricing configuration already exists. Skipping seed.');
      console.log('Use "npm run seed:pricing:force" to overwrite.');
      process.exit(0);
    }

    // Create pricing configuration
    const config = await PricingConfig.create(defaultPricingConfig);

    console.log('✅ Pricing configuration seeded successfully!');
    console.log(`Version: ${config.version}`);
    console.log(`Services: ${config.servicePrices.length}`);
    console.log(`Distance tiers: ${config.distancePricing.tiers.length}`);
    console.log(`Technician tiers: ${config.technicianTiers.tiers.length}`);

    process.exit(0);

  } catch (error) {
    console.error('Error seeding pricing:', error);
    process.exit(1);
  }
}

async function seedPricingForce() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected for force seeding...');

    // Delete existing configs
    await PricingConfig.deleteMany({});
    console.log('Deleted existing pricing configurations');

    // Create new config
    const config = await PricingConfig.create(defaultPricingConfig);

    console.log('✅ Pricing configuration force seeded successfully!');
    console.log(`Version: ${config.version}`);

    process.exit(0);

  } catch (error) {
    console.error('Error force seeding pricing:', error);
    process.exit(1);
  }
}

// Run the appropriate seed function
if (process.argv.includes('--force')) {
  seedPricingForce();
} else {
  seedPricing();
}
