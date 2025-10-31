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
  // IMPORTANT: 'general' service type MUST exist for each category as fallback
  servicePrices: [
    // ========================================
    // PLUMBING SERVICES
    // ========================================
    { serviceCategory: 'plumbing', serviceType: 'general', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2, description: 'General plumbing service (fallback)', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'pipe_installation', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 3, description: 'Pipe installation and fitting', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'pipe_repair', basePrice: 1800, priceUnit: 'fixed', estimatedDuration: 2, description: 'Pipe repair or patching', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'leak_repair', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 2, description: 'Leak detection and repair', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'drain_cleaning', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2.5, description: 'Drain unblocking and cleaning', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'toilet_repair', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 1.5, description: 'Toilet repair or replacement', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'toilet_installation', basePrice: 3500, priceUnit: 'fixed', estimatedDuration: 3, description: 'New toilet installation', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'sink_installation', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2, description: 'Kitchen/bathroom sink installation', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'faucet_repair', basePrice: 1000, priceUnit: 'fixed', estimatedDuration: 1, description: 'Tap/faucet repair or replacement', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'water_heater_installation', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 4, description: 'Water heater installation', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'water_heater_repair', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2, description: 'Water heater repair and maintenance', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'sewer_line_repair', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 4, description: 'Sewer line repair or replacement', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'water_pump_installation', basePrice: 6000, priceUnit: 'fixed', estimatedDuration: 5, description: 'Water pump installation', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'water_pump_repair', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 3, description: 'Water pump repair and servicing', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'bathroom_renovation', basePrice: 800, priceUnit: 'per_sqm', estimatedDuration: 16, description: 'Full bathroom plumbing renovation', isActive: true },
    { serviceCategory: 'plumbing', serviceType: 'kitchen_plumbing', basePrice: 700, priceUnit: 'per_sqm', estimatedDuration: 12, description: 'Kitchen plumbing installation', isActive: true },

    // ========================================
    // ELECTRICAL SERVICES
    // ========================================
    { serviceCategory: 'electrical', serviceType: 'general', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2, description: 'General electrical service (fallback)', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'wiring_installation', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 4, description: 'Complete electrical wiring', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'rewiring', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 6, description: 'House rewiring service', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'socket_installation', basePrice: 800, priceUnit: 'per_unit', estimatedDuration: 0.5, description: 'Power socket installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'switch_installation', basePrice: 600, priceUnit: 'per_unit', estimatedDuration: 0.3, description: 'Light switch installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'light_fixture_installation', basePrice: 1200, priceUnit: 'per_unit', estimatedDuration: 1, description: 'Light fixture and chandelier installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'ceiling_fan_installation', basePrice: 1500, priceUnit: 'per_unit', estimatedDuration: 1.5, description: 'Ceiling fan installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'circuit_breaker_repair', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2, description: 'Circuit breaker repair/replacement', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'electrical_panel_upgrade', basePrice: 8000, priceUnit: 'fixed', estimatedDuration: 6, description: 'Main electrical panel upgrade', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'fault_finding', basePrice: 1500, priceUnit: 'per_hour', estimatedDuration: 2, description: 'Electrical fault detection and diagnosis', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'security_lights', basePrice: 2000, priceUnit: 'per_unit', estimatedDuration: 2, description: 'Outdoor security lighting installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'doorbell_installation', basePrice: 1000, priceUnit: 'fixed', estimatedDuration: 1, description: 'Doorbell and intercom installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'cctv_installation', basePrice: 3000, priceUnit: 'per_unit', estimatedDuration: 3, description: 'CCTV camera installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'generator_installation', basePrice: 10000, priceUnit: 'fixed', estimatedDuration: 8, description: 'Generator installation and setup', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'solar_installation', basePrice: 15000, priceUnit: 'fixed', estimatedDuration: 12, description: 'Solar panel system installation', isActive: true },
    { serviceCategory: 'electrical', serviceType: 'appliance_installation', basePrice: 1500, priceUnit: 'per_unit', estimatedDuration: 1.5, description: 'Electrical appliance installation', isActive: true },

    // ========================================
    // CARPENTRY SERVICES
    // ========================================
    { serviceCategory: 'carpentry', serviceType: 'general', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2.5, description: 'General carpentry service (fallback)', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'furniture_assembly', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 3, description: 'Furniture assembly and installation', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'custom_furniture', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 16, description: 'Custom furniture making', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'door_installation', basePrice: 3000, priceUnit: 'per_unit', estimatedDuration: 4, description: 'Door installation and hanging', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'door_repair', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 2, description: 'Door repair and adjustment', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'window_installation', basePrice: 2500, priceUnit: 'per_unit', estimatedDuration: 3, description: 'Window frame installation', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'cabinet_installation', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 6, description: 'Kitchen/bathroom cabinet installation', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'shelving', basePrice: 1500, priceUnit: 'per_unit', estimatedDuration: 2, description: 'Wall shelving installation', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'wardrobe_installation', basePrice: 6000, priceUnit: 'fixed', estimatedDuration: 8, description: 'Built-in wardrobe installation', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'flooring_installation', basePrice: 800, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Wooden flooring installation', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'decking', basePrice: 1000, priceUnit: 'per_sqm', estimatedDuration: 10, description: 'Outdoor decking construction', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'staircase_repair', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 6, description: 'Staircase repair and maintenance', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'ceiling_installation', basePrice: 600, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Wooden ceiling installation', isActive: true },
    { serviceCategory: 'carpentry', serviceType: 'partition_walls', basePrice: 700, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Wooden partition wall construction', isActive: true },

    // ========================================
    // MASONRY SERVICES
    // ========================================
    { serviceCategory: 'masonry', serviceType: 'general', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 4, description: 'General masonry service (fallback)', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'bricklaying', basePrice: 800, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Brick wall construction', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'block_laying', basePrice: 700, priceUnit: 'per_sqm', estimatedDuration: 7, description: 'Concrete block wall construction', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'plastering', basePrice: 600, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Wall plastering service', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'tiling', basePrice: 1000, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Floor and wall tiling', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'concrete_works', basePrice: 900, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Concrete slab and foundation work', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'stone_work', basePrice: 1200, priceUnit: 'per_sqm', estimatedDuration: 10, description: 'Natural stone installation', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'paving', basePrice: 800, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Paving and walkway construction', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'fence_construction', basePrice: 1500, priceUnit: 'per_unit', estimatedDuration: 8, description: 'Masonry fence construction (per meter)', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'chimney_repair', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 8, description: 'Chimney repair and maintenance', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'waterproofing', basePrice: 700, priceUnit: 'per_sqm', estimatedDuration: 4, description: 'Wall and floor waterproofing', isActive: true },
    { serviceCategory: 'masonry', serviceType: 'crack_repair', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 3, description: 'Wall crack repair and sealing', isActive: true },

    // ========================================
    // PAINTING SERVICES
    // ========================================
    { serviceCategory: 'painting', serviceType: 'general', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 4, description: 'General painting service (fallback)', isActive: true },
    { serviceCategory: 'painting', serviceType: 'interior_painting', basePrice: 500, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Interior wall painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'exterior_painting', basePrice: 600, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Exterior wall painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'ceiling_painting', basePrice: 450, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Ceiling painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'door_window_painting', basePrice: 800, priceUnit: 'per_unit', estimatedDuration: 2, description: 'Door and window frame painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'fence_painting', basePrice: 400, priceUnit: 'per_sqm', estimatedDuration: 4, description: 'Fence and gate painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'roof_painting', basePrice: 550, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Roof painting and coating', isActive: true },
    { serviceCategory: 'painting', serviceType: 'textured_painting', basePrice: 700, priceUnit: 'per_sqm', estimatedDuration: 10, description: 'Textured or decorative painting', isActive: true },
    { serviceCategory: 'painting', serviceType: 'wallpaper_installation', basePrice: 800, priceUnit: 'per_sqm', estimatedDuration: 6, description: 'Wallpaper installation', isActive: true },
    { serviceCategory: 'painting', serviceType: 'paint_removal', basePrice: 400, priceUnit: 'per_sqm', estimatedDuration: 4, description: 'Old paint removal and preparation', isActive: true },
    { serviceCategory: 'painting', serviceType: 'spray_painting', basePrice: 600, priceUnit: 'per_sqm', estimatedDuration: 5, description: 'Professional spray painting', isActive: true },

    // ========================================
    // HVAC SERVICES
    // ========================================
    { serviceCategory: 'hvac', serviceType: 'general', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 2.5, description: 'General HVAC service (fallback)', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'ac_installation', basePrice: 6000, priceUnit: 'per_unit', estimatedDuration: 4, description: 'Air conditioner installation', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'ac_repair', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2, description: 'Air conditioner repair', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'ac_servicing', basePrice: 1500, priceUnit: 'per_unit', estimatedDuration: 1.5, description: 'AC cleaning and maintenance', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'ac_gas_refill', basePrice: 3500, priceUnit: 'per_unit', estimatedDuration: 1.5, description: 'AC refrigerant gas refill', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'ventilation_installation', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 4, description: 'Ventilation system installation', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'exhaust_fan_installation', basePrice: 1500, priceUnit: 'per_unit', estimatedDuration: 2, description: 'Exhaust fan installation', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'duct_cleaning', basePrice: 3000, priceUnit: 'fixed', estimatedDuration: 3, description: 'HVAC duct cleaning service', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'central_ac_installation', basePrice: 25000, priceUnit: 'fixed', estimatedDuration: 16, description: 'Central air conditioning installation', isActive: true },
    { serviceCategory: 'hvac', serviceType: 'thermostat_installation', basePrice: 1000, priceUnit: 'per_unit', estimatedDuration: 1, description: 'Thermostat installation and setup', isActive: true },

    // ========================================
    // WELDING SERVICES
    // ========================================
    { serviceCategory: 'welding', serviceType: 'general', basePrice: 3500, priceUnit: 'fixed', estimatedDuration: 3, description: 'General welding service (fallback)', isActive: true },
    { serviceCategory: 'welding', serviceType: 'gate_fabrication', basePrice: 8000, priceUnit: 'fixed', estimatedDuration: 8, description: 'Custom gate fabrication', isActive: true },
    { serviceCategory: 'welding', serviceType: 'gate_repair', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 3, description: 'Gate repair and welding', isActive: true },
    { serviceCategory: 'welding', serviceType: 'metal_repair', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2, description: 'General metal repair welding', isActive: true },
    { serviceCategory: 'welding', serviceType: 'window_grills', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 6, description: 'Window grill fabrication and installation', isActive: true },
    { serviceCategory: 'welding', serviceType: 'burglar_bars', basePrice: 4000, priceUnit: 'fixed', estimatedDuration: 5, description: 'Burglar bar installation', isActive: true },
    { serviceCategory: 'welding', serviceType: 'metal_staircase', basePrice: 15000, priceUnit: 'fixed', estimatedDuration: 16, description: 'Metal staircase fabrication', isActive: true },
    { serviceCategory: 'welding', serviceType: 'balcony_railing', basePrice: 6000, priceUnit: 'fixed', estimatedDuration: 6, description: 'Balcony railing fabrication', isActive: true },
    { serviceCategory: 'welding', serviceType: 'metal_shed', basePrice: 12000, priceUnit: 'fixed', estimatedDuration: 12, description: 'Metal storage shed fabrication', isActive: true },
    { serviceCategory: 'welding', serviceType: 'metal_roofing', basePrice: 1200, priceUnit: 'per_sqm', estimatedDuration: 8, description: 'Metal roof installation', isActive: true },
    { serviceCategory: 'welding', serviceType: 'water_tank_stand', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 6, description: 'Water tank metal stand fabrication', isActive: true },

    // ========================================
    // OTHER SERVICES (Handyman, Consultation, etc.)
    // ========================================
    { serviceCategory: 'other', serviceType: 'general', basePrice: 1500, priceUnit: 'per_hour', estimatedDuration: 1, description: 'General service (fallback)', isActive: true },
    { serviceCategory: 'other', serviceType: 'handyman', basePrice: 1500, priceUnit: 'per_hour', estimatedDuration: 1, description: 'General handyman service', isActive: true },
    { serviceCategory: 'other', serviceType: 'consultation', basePrice: 1000, priceUnit: 'per_hour', estimatedDuration: 1, description: 'Technical consultation and assessment', isActive: true },
    { serviceCategory: 'other', serviceType: 'inspection', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 2, description: 'Property inspection service', isActive: true },
    { serviceCategory: 'other', serviceType: 'maintenance_contract', basePrice: 5000, priceUnit: 'fixed', estimatedDuration: 4, description: 'Monthly maintenance service', isActive: true },
    { serviceCategory: 'other', serviceType: 'emergency_service', basePrice: 3000, priceUnit: 'per_hour', estimatedDuration: 1, description: 'Emergency call-out service', isActive: true },
    { serviceCategory: 'other', serviceType: 'locksmith', basePrice: 2000, priceUnit: 'fixed', estimatedDuration: 1.5, description: 'Lock installation and repair', isActive: true },
    { serviceCategory: 'other', serviceType: 'cleaning', basePrice: 1000, priceUnit: 'per_hour', estimatedDuration: 2, description: 'Post-construction cleaning', isActive: true },
    { serviceCategory: 'other', serviceType: 'landscaping', basePrice: 2000, priceUnit: 'per_hour', estimatedDuration: 4, description: 'Garden and landscaping service', isActive: true }
  ],

  // Distance pricing with tiers
  distancePricing: {
    enabled: true,
    tiers: [
      { minDistance: 0, maxDistance: 5, pricePerKm: 0, flatFee: 0 },       // Free within 5km
      { minDistance: 5, maxDistance: 15, pricePerKm: 10, flatFee: 50 },    // 50 KES flat + 10/km
      { minDistance: 15, maxDistance: 30, pricePerKm: 15, flatFee: 150 },  // 150 KES flat + 15/km
      { minDistance: 30, maxDistance: 50, pricePerKm: 20, flatFee: 300 }   // 300 KES flat + 20/km
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
    console.log(`Service Prices: ${pricingConfig.servicePrices.length} services configured (EXPANDED CATALOG)`);
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
    console.log('   ✨ COMPREHENSIVE SERVICE CATALOG LOADED');
    console.log('   📦 Total Services: ' + pricingConfig.servicePrices.length);
    console.log('   🔄 Fallback mechanism enabled: Each category has a "general" service type');
    console.log('   ➕ New service types can be added dynamically via API');
    console.log('   💡 Any unlisted service will use category "general" pricing as fallback\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pricing configuration:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seeder
seedPricing();
