require('dotenv').config();
const PricingConfig = require('../models/PricingConfig');
const { connectDB } = require('../config/db');

/**
 * Pricing Configuration Seeder
 * Seeds the database with flexible category-based pricing
 * Service types can be added dynamically - this seeds only common base services
 */

const pricingConfigData = {
  name: 'Default Pricing Configuration',
  currency: 'KES',

  // Base service prices - Each category has a general service that can be used as fallback
  servicePrices: [
    // PLUMBING - General services
    { serviceCategory: 'plumbing', serviceType: 'general', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2, description: 'General plumbing service', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'pipe_installation', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 3, description: 'Pipe installation', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'leak_repair', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 2, description: 'Leak repair', isActive: true },

    // ELECTRICAL - General services
    { serviceCategory: 'electrical', serviceType: 'general', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2, description: 'General electrical service', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'wiring', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 4, description: 'Electrical wiring', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'socket_installation', basePrice: 800, priceUnit: 'per_unit', estimatedDuration: 0.5, description: 'Socket installation', isActive: true },

    // CARPENTRY - General services
    { serviceCategory: 'carpentry', serviceType: 'general', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2.5, description: 'General carpentry service', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'furniture_assembly', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 3, description: 'Furniture assembly', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'door_installation', basePrice: 3000, priceUnit: 'per_unit', estimatedDuration: 4, description: 'Door installation', isActive: true },

    // MASONRY - General services
    { serviceCategory: 'masonry', serviceType: 'general', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 4, description: 'General masonry service', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'bricklaying', basePrice: 800, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Bricklaying', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'plastering', basePrice: 600, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Plastering', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'tiling', basePrice: 1000, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Tiling', isActive: true },

    // PAINTING - General services
    { serviceCategory: 'painting', serviceType: 'general', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 4, description: 'General painting service', isActive: true },
    { serviceCategory: 'painting', serviceType: 'interior_painting', basePrice: 500, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Interior painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'exterior_painting', basePrice: 600, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Exterior painting', isActive: true },

    // HVAC - General services
    { serviceCategory: 'hvac', serviceType: 'general', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 2.5, description: 'General HVAC service', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'ac_installation', basePrice: 6000, priceUnit: 'per_unit', estimatedDuration: 4, description: 'AC installation', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'ac_repair', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2, description: 'AC repair', isActive: true },

    // WELDING - General services
    { serviceCategory: 'welding', serviceType: 'general', basePrice: 3500, priceUnit: 'fixed', estimatedDuration: 3, description: 'General welding service', isActive: true },
    { serviceCategory: 'welding', serviceType: 'gate_fabrication', basePrice: 8000, priceUnit: 'fixed', estimatedDuration: 8, description: 'Gate fabrication', isActive: true },
    { serviceCategory: 'welding', serviceType: 'metal_repair', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2, description: 'Metal repair', isActive: true },

    // OTHER - Flexible services
    { serviceCategory: 'other', serviceType: 'general', basePrice: 1500, priceUnit: 'per_hour', estimatedDuration: 1, description: 'General service', isActive: true },
    { serviceCategory: 'other', serviceType: 'handyman', basePrice: 1500, priceUnit: 'per_hour', estimatedDuration: 1, description: 'Handyman service', isActive: true },
    { serviceCategory: 'other', serviceType: 'consultation', basePrice: 1000, priceUnit: 'per_hour', estimatedDuration: 1, description: 'Technical consultation', isActive: true }
  ],

  // Distance pricing with tiers
  distancePricing: {
    enabled: true,
    tiers: [
      { minDistance: 0, maxDistance: 5, pricePerKm: 0, flatFee: 0 },
      { minDistance: 5, maxDistance: 20, pricePerKm: 50, flatFee: 0 },
      { minDistance: 20, maxDistance: 50, pricePerKm: 80, flatFee: 0 }
    ],
    maxServiceDistance: 50
  },

  // Urgency multipliers
  urgencyMultipliers: [
    { urgencyLevel: 'low', multiplier: 1.0, description: 'Flexible scheduling' },
    { urgencyLevel: 'medium', multiplier: 1.2, description: 'Within 2-3 days' },
    { urgencyLevel: 'high', multiplier: 1.5, description: 'Within 24 hours' },
    { urgencyLevel: 'emergency', multiplier: 2.0, description: 'Immediate response' }
  ],

  // Time-based pricing schedules
  timePricing: {
    enabled: true,
    schedules: [
      { name: 'Regular Hours', daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00', multiplier: 1.0, isActive: true },
      { name: 'Evening', daysOfWeek: [1, 2, 3, 4, 5], startTime: '17:00', endTime: '21:00', multiplier: 1.3, isActive: true },
      { name: 'Night', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], startTime: '21:00', endTime: '08:00', multiplier: 1.8, isActive: true },
      { name: 'Weekend', daysOfWeek: [0, 6], startTime: '08:00', endTime: '21:00', multiplier: 1.4, isActive: true }
    ]
  },

  // Technician tier pricing
  technicianTiers: {
    enabled: true,
    tiers: [
      { tierName: 'Junior', minExperience: 0, minRating: 0, minCompletedJobs: 0, priceMultiplier: 1.0, description: 'Entry level' },
      { tierName: 'Professional', minExperience: 2, minRating: 4.0, minCompletedJobs: 10, priceMultiplier: 1.2, description: 'Experienced' },
      { tierName: 'Expert', minExperience: 5, minRating: 4.5, minCompletedJobs: 50, priceMultiplier: 1.5, description: 'Highly skilled' },
      { tierName: 'Master', minExperience: 10, minRating: 4.8, minCompletedJobs: 100, priceMultiplier: 1.8, description: 'Top tier' }
    ]
  },

  // Platform fee
  platformFee: {
    type: 'percentage',
    value: 10
  },

  // Tax configuration
  tax: {
    enabled: true,
    rate: 16,
    name: 'VAT'
  },

  // Discount configuration
  discounts: {
    firstTimeCustomer: {
      enabled: true,
      type: 'percentage',
      value: 10
    },
    loyaltyDiscount: {
      enabled: true,
      thresholds: [
        { minBookings: 5, discount: 5 },
        { minBookings: 10, discount: 10 },
        { minBookings: 20, discount: 15 }
      ]
    }
  },

  // Price limits
  minBookingPrice: 500,
  maxBookingPrice: 100000,

  isActive: true,
  effectiveFrom: new Date(),
  version: 1
};

const seedPricing = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting pricing configuration seeding...\n');

    
    // Check if pricing config already exists
    const existingConfig = await PricingConfig.findOne({ isActive: true });

    if (existingConfig) {
      console.log('⚠️  Active pricing configuration already exists');
      console.log('   Deactivating old configuration...');
      existingConfig.isActive = false;
      await existingConfig.save();
    }

    // Create new pricing configuration
    console.log('💰 Creating new pricing configuration...');
    const pricingConfig = await PricingConfig.create(pricingConfigData);

    console.log('\n✅ Pricing configuration created successfully!');
    console.log('\n📊 Pricing Summary:');
    console.log('==========================================');
    console.log(`Name: ${pricingConfig.name}`);
    console.log(`Currency: ${pricingConfig.currency}`);
    console.log(`Version: ${pricingConfig.version}`);
    console.log(`Service Prices: ${pricingConfig.servicePrices.length} services configured`);
    console.log(`Urgency Levels: ${pricingConfig.urgencyMultipliers.length} levels`);
    console.log(`Time Schedules: ${pricingConfig.timePricing.schedules.length} schedules`);
    console.log(`Technician Tiers: ${pricingConfig.technicianTiers.tiers.length} tiers`);
    console.log(`Platform Fee: ${pricingConfig.platformFee.value}%`);
    console.log(`Tax Rate: ${pricingConfig.tax.rate}% (${pricingConfig.tax.name})`);
    console.log(`Min Booking: ${pricingConfig.minBookingPrice} ${pricingConfig.currency}`);
    console.log(`Max Booking: ${pricingConfig.maxBookingPrice} ${pricingConfig.currency}`);

    console.log('\n📋 Service Categories & Prices:');
    const categories = {};
    pricingConfig.servicePrices.forEach(service => {
      if (!categories[service.serviceCategory]) {
        categories[service.serviceCategory] = [];
      }
      categories[service.serviceCategory].push({
        type: service.serviceType,
        price: service.basePrice,
        unit: service.priceUnit,
        duration: service.estimatedDuration
      });
    });

    Object.keys(categories).forEach(category => {
      console.log(`\n  ${category.toUpperCase()}:`);
      categories[category].forEach(service => {
        console.log(`    - ${service.type}: ${service.price} ${pricingConfig.currency}/${service.unit} (~${service.duration}hrs)`);
      });
    });

    console.log('\n==========================================\n');
    console.log('🎉 Pricing seeding completed successfully!');
    console.log('   New service types can be added dynamically via API\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pricing configuration:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seeder
seedPricing();
