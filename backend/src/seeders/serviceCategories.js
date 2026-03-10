const mongoose = require('mongoose');
const ServiceCategory = require('../models/ServiceCategory');
const Service = require('../models/Service');

/**
 * 16 Main Service Categories for the WORD BANK
 * Each category includes icon, description, and common services
 */
const serviceCategories = [
  {
    name: 'PLUMBING',
    icon: '1f6b0', // Water faucet emoji
    description: 'Professional plumbing services including pipe installation, repairs, drainage systems, water heater installation, and bathroom fixtures. Expert solutions for residential and commercial properties.',
    color: '#3498db',
    sortOrder: 1,
    meta: {
      keywords: ['plumber', 'pipes', 'drainage', 'water', 'leaks', 'toilet', 'faucet', 'shower', 'bathroom', 'kitchen'],
      searchBoost: 1.2
    }
  },
  {
    name: 'ELECTRICAL',
    icon: '26a1', // High voltage emoji
    description: 'Licensed electrical services for wiring, installations, repairs, and safety inspections. Includes lighting, outlets, circuit breakers, and electrical panel work.',
    color: '#f1c40f',
    sortOrder: 2,
    meta: {
      keywords: ['electrician', 'wiring', 'electrical', 'lights', 'outlets', 'circuits', 'panel', 'power', 'electricity'],
      searchBoost: 1.3
    }
  },
  {
    name: 'CARPENTRY',
    icon: '1f6e0', // Hammer and wrench emoji
    description: 'Skilled carpentry services for furniture making, repairs, installations, and custom woodwork. Includes cabinets, doors, windows, and structural woodwork.',
    color: '#8b4513',
    sortOrder: 3,
    meta: {
      keywords: ['carpenter', 'wood', 'furniture', 'cabinet', 'door', 'window', 'woodwork', 'repair'],
      searchBoost: 1.1
    }
  },
  {
    name: 'PAINTING',
    icon: '1f3a8', // Artist palette emoji
    description: 'Professional painting services for interior and exterior surfaces. Includes wall painting, decorative finishes, wallpaper installation, and surface preparation.',
    color: '#9b59b6',
    sortOrder: 4,
    meta: {
      keywords: ['painter', 'paint', 'walls', 'interior', 'exterior', 'decorative', 'wallpaper', 'finish'],
      searchBoost: 1.0
    }
  },
  {
    name: 'HVAC',
    icon: '2744', // Snowflake emoji
    description: 'Heating, Ventilation, and Air Conditioning services. Includes AC installation, repair, maintenance, refrigeration, and climate control systems.',
    color: '#00bcd4',
    sortOrder: 5,
    meta: {
      keywords: ['air conditioning', 'ac', 'hvac', 'heating', 'cooling', 'ventilation', 'refrigeration', 'climate control'],
      searchBoost: 1.2
    }
  },
  {
    name: 'CLEANING',
    icon: '1f9f9', // Broom emoji
    description: 'Comprehensive cleaning services for homes, offices, and commercial spaces. Includes deep cleaning, carpet cleaning, post-construction cleanup, and specialized cleaning.',
    color: '#2ecc71',
    sortOrder: 6,
    meta: {
      keywords: ['cleaner', 'cleaning', 'deep clean', 'carpet', 'office', 'home', 'sanitization', 'janitorial'],
      searchBoost: 1.1
    }
  },
  {
    name: 'MASONRY',
    icon: '1f9f1', // Brick emoji
    description: 'Expert masonry services including brickwork, stonework, concrete work, block construction, and structural repairs. Professional masons for all building needs.',
    color: '#795548',
    sortOrder: 7,
    meta: {
      keywords: ['mason', 'brick', 'stone', 'concrete', 'block', 'wall', 'foundation', 'construction'],
      searchBoost: 1.0
    }
  },
  {
    name: 'WELDING',
    icon: '267f', // Gear emoji
    description: 'Professional welding and metalwork services. Includes metal fabrication, repairs, gate construction, grills, and structural steel work.',
    color: '#607d8b',
    sortOrder: 8,
    meta: {
      keywords: ['welder', 'welding', 'metal', 'fabrication', 'steel', 'iron', 'gate', 'grill', 'metalwork'],
      searchBoost: 1.0
    }
  },
  {
    name: 'APPLIANCE REPAIR',
    icon: '1f4bb', // Laptop emoji (representing appliances)
    description: 'Repair and maintenance services for household appliances. Includes refrigerators, washing machines, dryers, ovens, microwaves, and small appliances.',
    color: '#ff9800',
    sortOrder: 9,
    meta: {
      keywords: ['appliance', 'repair', 'refrigerator', 'fridge', 'washing machine', 'oven', 'microwave', 'dryer'],
      searchBoost: 1.2
    }
  },
  {
    name: 'LANDSCAPING',
    icon: '1f333', // Deciduous tree emoji
    description: 'Landscaping and gardening services for outdoor spaces. Includes lawn care, garden design, tree services, irrigation systems, and hardscaping.',
    color: '#4caf50',
    sortOrder: 10,
    meta: {
      keywords: ['landscaping', 'garden', 'lawn', 'trees', 'irrigation', 'outdoor', 'yard', 'horticulture'],
      searchBoost: 1.0
    }
  },
  {
    name: 'PEST CONTROL',
    icon: '1fab3', // Cockroach emoji
    description: 'Professional pest control and extermination services. Includes termite treatment, rodent control, insect extermination, and preventive treatments.',
    color: '#4caf50',
    sortOrder: 11,
    meta: {
      keywords: ['pest control', 'exterminator', 'termites', 'rodents', 'insects', 'fumigation', 'bugs'],
      searchBoost: 1.1
    }
  },
  {
    name: 'SOLAR INSTALLATION',
    icon: '2600', // Sun emoji
    description: 'Solar panel installation and maintenance services. Includes system design, installation, inverter setup, battery storage, and ongoing maintenance.',
    color: '#ff9800',
    sortOrder: 12,
    meta: {
      keywords: ['solar', 'solar panels', 'renewable energy', 'inverter', 'battery', 'green energy', 'photovoltaic'],
      searchBoost: 1.3
    }
  },
  {
    name: 'SECURITY SYSTEMS',
    icon: '1f512', // Lock emoji
    description: 'Security system installation and monitoring services. Includes CCTV, alarm systems, access control, intercoms, and smart home security.',
    color: '#2196f3',
    sortOrder: 13,
    meta: {
      keywords: ['security', 'cctv', 'camera', 'alarm', 'access control', 'intercom', 'surveillance', 'smart home'],
      searchBoost: 1.2
    }
  },
  {
    name: 'ROOFING',
    icon: '1f3e0', // House emoji
    description: 'Professional roofing services including installation, repairs, maintenance, and inspections. Covers all roofing types from tiles to metal sheets.',
    color: '#795548',
    sortOrder: 14,
    meta: {
      keywords: ['roofing', 'roof', 'tiles', 'leaks', 'gutter', 'ceiling', 'waterproofing', 'insulation'],
      searchBoost: 1.1
    }
  },
  {
    name: 'FLOORING',
    icon: '1f6d2', // Shopping cart emoji (representing materials)
    description: 'Flooring installation and repair services. Includes tiles, hardwood, laminate, vinyl, carpet, and epoxy flooring solutions.',
    color: '#9e9e9e',
    sortOrder: 15,
    meta: {
      keywords: ['flooring', 'tiles', 'hardwood', 'laminate', 'vinyl', 'carpet', 'epoxy', 'floor installation'],
      searchBoost: 1.0
    }
  },
  {
    name: 'GENERAL HANDYMAN',
    icon: '1f527', // Wrench emoji
    description: 'General handyman services for various home repairs and improvements. A jack-of-all-trades solution for minor repairs, installations, and maintenance tasks.',
    color: '#607d8b',
    sortOrder: 16,
    meta: {
      keywords: ['handyman', 'repairs', 'maintenance', 'general', 'fixtures', 'assembly', 'minor repairs', 'odd jobs'],
      searchBoost: 1.0
    }
  }
];

/**
 * Seed service categories
 * @param {boolean} includeServices - Whether to seed sample services
 * @returns {Promise<void>}
 */
const seedCategories = async (includeServices = false) => {
  try {
    console.log('Starting to seed service categories...');

    // Clear existing categories (optional - comment out if you want to keep existing)
    // await ServiceCategory.deleteMany({});

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of serviceCategories) {
      // Check if category already exists
      const existingCategory = await ServiceCategory.findOne({ name: categoryData.name });

      if (existingCategory) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create new category
      const category = await ServiceCategory.create(categoryData);
      console.log(`Created category: ${category.name}`);
      createdCount++;
    }

    console.log(`\nSeeding complete!`);
    console.log(`- Categories created: ${createdCount}`);
    console.log(`- Categories skipped: ${skippedCount}`);

    if (includeServices) {
      await seedSampleServices();
    }

    return { createdCount, skippedCount };
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

/**
 * Sample services for each category
 */
const sampleServices = {
  PLUMBING: [
    { name: 'PIPE REPAIR', description: 'Repair of leaking or damaged pipes', basePrice: { min: 1500, max: 8000 }, estimatedDuration: { min: 30, max: 180 } },
    { name: 'TOILET REPAIR', description: 'Fixing toilet leaks, clogs, and mechanism failures', basePrice: { min: 1000, max: 5000 }, estimatedDuration: { min: 30, max: 120 } },
    { name: 'FAUCET INSTALLATION', description: 'Installation of kitchen and bathroom faucets', basePrice: { min: 2000, max: 6000 }, estimatedDuration: { min: 45, max: 90 } },
    { name: 'DRAIN CLEANING', description: 'Unclogging and cleaning of drains', basePrice: { min: 1500, max: 4000 }, estimatedDuration: { min: 30, max: 120 } },
    { name: 'WATER HEATER INSTALLATION', description: 'Installation of electric and solar water heaters', basePrice: { min: 5000, max: 25000 }, estimatedDuration: { min: 120, max: 360 } }
  ],
  ELECTRICAL: [
    { name: 'WIRING INSTALLATION', description: 'New electrical wiring for buildings', basePrice: { min: 10000, max: 100000 }, estimatedDuration: { min: 240, max: 1440 } },
    { name: 'OUTLET INSTALLATION', description: 'Installation of power outlets and switches', basePrice: { min: 1000, max: 3000 }, estimatedDuration: { min: 30, max: 60 } },
    { name: 'LIGHT FIXTURE INSTALLATION', description: 'Installing ceiling lights, chandeliers, and fixtures', basePrice: { min: 1500, max: 8000 }, estimatedDuration: { min: 30, max: 120 } },
    { name: 'CIRCUIT BREAKER REPAIR', description: 'Repair and replacement of circuit breakers', basePrice: { min: 2000, max: 6000 }, estimatedDuration: { min: 30, max: 90 } },
    { name: 'ELECTRICAL INSPECTION', description: 'Safety inspection of electrical systems', basePrice: { min: 3000, max: 8000 }, estimatedDuration: { min: 60, max: 180 } }
  ],
  CARPENTRY: [
    { name: 'DOOR INSTALLATION', description: 'Installation of interior and exterior doors', basePrice: { min: 3000, max: 15000 }, estimatedDuration: { min: 60, max: 240 } },
    { name: 'CABINET MAKING', description: 'Custom kitchen and bathroom cabinets', basePrice: { min: 20000, max: 150000 }, estimatedDuration: { min: 480, max: 2880 } },
    { name: 'FURNITURE REPAIR', description: 'Repair of damaged furniture pieces', basePrice: { min: 1500, max: 10000 }, estimatedDuration: { min: 60, max: 360 } },
    { name: 'DECK CONSTRUCTION', description: 'Building wooden decks and patios', basePrice: { min: 30000, max: 200000 }, estimatedDuration: { min: 960, max: 2880 } },
    { name: 'WINDOW FRAME REPAIR', description: 'Repair and replacement of window frames', basePrice: { min: 2000, max: 8000 }, estimatedDuration: { min: 60, max: 180 } }
  ],
  PAINTING: [
    { name: 'INTERIOR WALL PAINTING', description: 'Painting of interior walls and ceilings', basePrice: { min: 3000, max: 15000 }, estimatedDuration: { min: 240, max: 960 } },
    { name: 'EXTERIOR PAINTING', description: 'Painting of exterior walls and surfaces', basePrice: { min: 5000, max: 30000 }, estimatedDuration: { min: 480, max: 1920 } },
    { name: 'FURNITURE PAINTING', description: 'Repainting and refinishing furniture', basePrice: { min: 1500, max: 8000 }, estimatedDuration: { min: 120, max: 480 } },
    { name: 'WALLPAPER INSTALLATION', description: 'Installation of wallpaper and wall coverings', basePrice: { min: 4000, max: 20000 }, estimatedDuration: { min: 180, max: 720 } },
    { name: 'DECORATIVE FINISHES', description: 'Special finishes like texture, stucco, etc.', basePrice: { min: 5000, max: 25000 }, estimatedDuration: { min: 240, max: 960 } }
  ],
  HVAC: [
    { name: 'AC INSTALLATION', description: 'Installation of split and window air conditioners', basePrice: { min: 8000, max: 50000 }, estimatedDuration: { min: 120, max: 360 } },
    { name: 'AC REPAIR', description: 'Repair of malfunctioning air conditioners', basePrice: { min: 2000, max: 15000 }, estimatedDuration: { min: 60, max: 240 } },
    { name: 'AC SERVICING', description: 'Regular maintenance and cleaning of AC units', basePrice: { min: 1500, max: 5000 }, estimatedDuration: { min: 60, max: 120 } },
    { name: 'REFRIGERATION REPAIR', description: 'Repair of commercial and domestic refrigerators', basePrice: { min: 2000, max: 12000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'VENTILATION INSTALLATION', description: 'Installation of ventilation systems', basePrice: { min: 10000, max: 80000 }, estimatedDuration: { min: 240, max: 960 } }
  ],
  CLEANING: [
    { name: 'DEEP HOUSE CLEANING', description: 'Thorough cleaning of entire house', basePrice: { min: 3000, max: 15000 }, estimatedDuration: { min: 240, max: 480 } },
    { name: 'CARPET CLEANING', description: 'Professional carpet shampooing and cleaning', basePrice: { min: 1500, max: 8000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'OFFICE CLEANING', description: 'Regular cleaning services for offices', basePrice: { min: 2000, max: 10000 }, estimatedDuration: { min: 120, max: 300 } },
    { name: 'POST-CONSTRUCTION CLEANING', description: 'Cleanup after construction work', basePrice: { min: 5000, max: 30000 }, estimatedDuration: { min: 480, max: 1440 } },
    { name: 'UPHOLSTERY CLEANING', description: 'Cleaning of sofas, chairs, and mattresses', basePrice: { min: 1500, max: 6000 }, estimatedDuration: { min: 60, max: 180 } }
  ],
  MASONRY: [
    { name: 'BRICK WALL CONSTRUCTION', description: 'Building brick walls and structures', basePrice: { min: 5000, max: 50000 }, estimatedDuration: { min: 480, max: 2880 } },
    { name: 'STONE WORK', description: 'Decorative and structural stone work', basePrice: { min: 8000, max: 80000 }, estimatedDuration: { min: 480, max: 1920 } },
    { name: 'CONCRETE WORK', description: 'Pouring and finishing concrete', basePrice: { min: 10000, max: 100000 }, estimatedDuration: { min: 240, max: 1440 } },
    { name: 'WALL REPAIR', description: 'Repair of damaged walls and structures', basePrice: { min: 2000, max: 20000 }, estimatedDuration: { min: 120, max: 480 } },
    { name: 'FOUNDATION WORK', description: 'Building and repairing foundations', basePrice: { min: 20000, max: 200000 }, estimatedDuration: { min: 960, max: 4320 } }
  ],
  WELDING: [
    { name: 'GATE FABRICATION', description: 'Custom metal gate design and fabrication', basePrice: { min: 15000, max: 100000 }, estimatedDuration: { min: 480, max: 1920 } },
    { name: 'WINDOW GRILLS', description: 'Security grills for windows', basePrice: { min: 5000, max: 30000 }, estimatedDuration: { min: 240, max: 720 } },
    { name: 'METAL REPAIR', description: 'Repair of metal structures and furniture', basePrice: { min: 1500, max: 15000 }, estimatedDuration: { min: 60, max: 300 } },
    { name: 'STEEL STRUCTURE', description: 'Steel fabrication for structures', basePrice: { min: 20000, max: 200000 }, estimatedDuration: { min: 480, max: 2880 } },
    { name: 'RAILING INSTALLATION', description: 'Metal railings for stairs and balconies', basePrice: { min: 8000, max: 50000 }, estimatedDuration: { min: 240, max: 960 } }
  ],
  'APPLIANCE REPAIR': [
    { name: 'REFRIGERATOR REPAIR', description: 'Repair of fridge cooling issues and leaks', basePrice: { min: 2000, max: 12000 }, estimatedDuration: { min: 60, max: 240 } },
    { name: 'WASHING MACHINE REPAIR', description: 'Fixing washing machine issues', basePrice: { min: 2000, max: 10000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'OVEN REPAIR', description: 'Repair of electric and gas ovens', basePrice: { min: 2000, max: 8000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'MICROWAVE REPAIR', description: 'Fixing microwave heating issues', basePrice: { min: 1500, max: 5000 }, estimatedDuration: { min: 30, max: 90 } },
    { name: 'DISHWASHER REPAIR', description: 'Repair of dishwasher problems', basePrice: { min: 2500, max: 10000 }, estimatedDuration: { min: 60, max: 180 } }
  ],
  LANDSCAPING: [
    { name: 'LAWN MOWING', description: 'Regular grass cutting and lawn maintenance', basePrice: { min: 1000, max: 5000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'GARDEN DESIGN', description: 'Professional garden layout and design', basePrice: { min: 10000, max: 100000 }, estimatedDuration: { min: 480, max: 1920 } },
    { name: 'TREE PRUNING', description: 'Trimming and pruning trees', basePrice: { min: 2000, max: 15000 }, estimatedDuration: { min: 120, max: 360 } },
    { name: 'IRRIGATION INSTALLATION', description: 'Installing garden irrigation systems', basePrice: { min: 8000, max: 50000 }, estimatedDuration: { min: 240, max: 720 } },
    { name: 'HARDSCAPING', description: 'Patios, walkways, and retaining walls', basePrice: { min: 15000, max: 150000 }, estimatedDuration: { min: 480, max: 1920 } }
  ],
  'PEST CONTROL': [
    { name: 'TERMITE TREATMENT', description: 'Professional termite extermination', basePrice: { min: 5000, max: 30000 }, estimatedDuration: { min: 120, max: 360 } },
    { name: 'RODENT CONTROL', description: 'Rat and mouse extermination', basePrice: { min: 3000, max: 15000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'COCKROACH EXTERMINATION', description: 'Eliminating cockroach infestations', basePrice: { min: 2000, max: 10000 }, estimatedDuration: { min: 60, max: 120 } },
    { name: 'BED BUG TREATMENT', description: 'Professional bed bug removal', basePrice: { min: 5000, max: 25000 }, estimatedDuration: { min: 120, max: 300 } },
    { name: 'FUMIGATION', description: 'Full property fumigation service', basePrice: { min: 8000, max: 50000 }, estimatedDuration: { min: 180, max: 480 } }
  ],
  'SOLAR INSTALLATION': [
    { name: 'SOLAR PANEL INSTALLATION', description: 'Installing solar panel systems', basePrice: { min: 50000, max: 500000 }, estimatedDuration: { min: 480, max: 1440 } },
    { name: 'INVERTER INSTALLATION', description: 'Solar inverter setup and configuration', basePrice: { min: 15000, max: 80000 }, estimatedDuration: { min: 120, max: 360 } },
    { name: 'SOLAR BATTERY INSTALLATION', description: 'Battery storage system installation', basePrice: { min: 30000, max: 200000 }, estimatedDuration: { min: 180, max: 480 } },
    { name: 'SOLAR SYSTEM MAINTENANCE', description: 'Regular maintenance of solar systems', basePrice: { min: 3000, max: 15000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'SOLAR WATER HEATER', description: 'Solar water heating system installation', basePrice: { min: 40000, max: 150000 }, estimatedDuration: { min: 240, max: 720 } }
  ],
  'SECURITY SYSTEMS': [
    { name: 'CCTV INSTALLATION', description: 'Security camera system setup', basePrice: { min: 10000, max: 100000 }, estimatedDuration: { min: 180, max: 720 } },
    { name: 'ALARM SYSTEM INSTALLATION', description: 'Burglar alarm system setup', basePrice: { min: 8000, max: 50000 }, estimatedDuration: { min: 120, max: 360 } },
    { name: 'ACCESS CONTROL', description: 'Keycard and biometric access systems', basePrice: { min: 15000, max: 150000 }, estimatedDuration: { min: 240, max: 960 } },
    { name: 'INTERCOM INSTALLATION', description: 'Video and audio intercom systems', basePrice: { min: 5000, max: 30000 }, estimatedDuration: { min: 120, max: 360 } },
    { name: 'ELECTRIC FENCE', description: 'Electric fence installation', basePrice: { min: 20000, max: 100000 }, estimatedDuration: { min: 480, max: 1440 } }
  ],
  ROOFING: [
    { name: 'ROOF INSTALLATION', description: 'New roof installation', basePrice: { min: 50000, max: 500000 }, estimatedDuration: { min: 960, max: 2880 } },
    { name: 'ROOF REPAIR', description: 'Fixing leaks and damaged sections', basePrice: { min: 5000, max: 50000 }, estimatedDuration: { min: 120, max: 480 } },
    { name: 'GUTTER INSTALLATION', description: 'Installing roof gutters', basePrice: { min: 8000, max: 40000 }, estimatedDuration: { min: 240, max: 720 } },
    { name: 'ROOF INSPECTION', description: 'Professional roof assessment', basePrice: { min: 2000, max: 10000 }, estimatedDuration: { min: 60, max: 180 } },
    { name: 'WATERPROOFING', description: 'Roof waterproofing treatment', basePrice: { min: 10000, max: 80000 }, estimatedDuration: { min: 240, max: 720 } }
  ],
  FLOORING: [
    { name: 'TILE INSTALLATION', description: 'Ceramic and porcelain tile fitting', basePrice: { min: 5000, max: 50000 }, estimatedDuration: { min: 480, max: 1920 } },
    { name: 'HARDWOOD FLOORING', description: 'Wooden floor installation', basePrice: { min: 20000, max: 200000 }, estimatedDuration: { min: 480, max: 1440 } },
    { name: 'LAMINATE FLOORING', description: 'Laminate floor installation', basePrice: { min: 10000, max: 80000 }, estimatedDuration: { min: 240, max: 960 } },
    { name: 'EPOXY FLOORING', description: 'Epoxy coating application', basePrice: { min: 15000, max: 100000 }, estimatedDuration: { min: 480, max: 1440 } },
    { name: 'CARPET INSTALLATION', description: 'Wall-to-wall carpet fitting', basePrice: { min: 8000, max: 60000 }, estimatedDuration: { min: 180, max: 720 } }
  ],
  'GENERAL HANDYMAN': [
    { name: 'GENERAL REPAIRS', description: 'Various minor repairs around the house', basePrice: { min: 1000, max: 10000 }, estimatedDuration: { min: 30, max: 180 } },
    { name: 'FURNITURE ASSEMBLY', description: 'Assembly of flat-pack furniture', basePrice: { min: 1500, max: 8000 }, estimatedDuration: { min: 60, max: 240 } },
    { name: 'PICTURE HANGING', description: 'Hanging pictures, mirrors, and shelves', basePrice: { min: 500, max: 3000 }, estimatedDuration: { min: 30, max: 90 } },
    { name: 'FIXTURE INSTALLATION', description: 'Installing various fixtures and fittings', basePrice: { min: 1000, max: 5000 }, estimatedDuration: { min: 30, max: 120 } },
    { name: 'MINOR ELECTRICAL', description: 'Small electrical tasks like changing outlets', basePrice: { min: 1000, max: 5000 }, estimatedDuration: { min: 30, max: 90 } }
  ]
};

/**
 * Seed sample services for categories
 * @returns {Promise<void>}
 */
const seedSampleServices = async () => {
  try {
    console.log('\nStarting to seed sample services...');

    let createdCount = 0;
    let skippedCount = 0;

    for (const [categoryName, services] of Object.entries(sampleServices)) {
      const category = await ServiceCategory.findOne({ name: categoryName });

      if (!category) {
        console.log(`Category "${categoryName}" not found, skipping services...`);
        continue;
      }

      for (const serviceData of services) {
        // Check if service already exists
        const existingService = await Service.findOne({
          name: serviceData.name,
          category: category._id
        });

        if (existingService) {
          skippedCount++;
          continue;
        }

        // Create service
        await Service.create({
          ...serviceData,
          category: category._id,
          isCustom: false,
          approvalStatus: 'approved',
          isActive: true,
          searchTags: serviceData.name.toLowerCase().split(' ')
        });

        createdCount++;
      }

      console.log(`Created services for: ${categoryName}`);
    }

    console.log(`\nService seeding complete!`);
    console.log(`- Services created: ${createdCount}`);
    console.log(`- Services skipped: ${skippedCount}`);

    return { createdCount, skippedCount };
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  }
};

/**
 * Clear all service data
 * @returns {Promise<void>}
 */
const clearServiceData = async () => {
  try {
    console.log('Clearing service data...');

    await Service.deleteMany({});
    await ServiceCategory.deleteMany({});

    console.log('All service data cleared!');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

/**
 * Main seeder function
 * @param {Object} options - Seeder options
 * @returns {Promise<void>}
 */
const runSeeder = async (options = {}) => {
  const { clearExisting = false, includeServices = true } = options;

  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dumuwaks';
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB');
    }

    if (clearExisting) {
      await clearServiceData();
    }

    await seedCategories(includeServices);

    console.log('\nSeeding completed successfully!');

    // Close connection if we opened it
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  runSeeder({ clearExisting: false, includeServices: true });
}

module.exports = {
  seedCategories,
  seedSampleServices,
  clearServiceData,
  runSeeder,
  serviceCategories,
  sampleServices
};
