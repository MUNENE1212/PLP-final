require('dotenv').config();
const mongoose = require('mongoose');
const DiagnosticFlow = require('../models/DiagnosticFlow');

const diagnosticFlows = [
  // ==================== PLUMBING ====================
  {
    serviceCategory: 'Plumbing',
    problemName: 'Leaky Faucet',
    questions: [
      {
        id: 'q1',
        question: 'Where is the faucet located?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'kitchen', label: 'Kitchen Sink' },
          { value: 'bathroom', label: 'Bathroom Sink' },
          { value: 'bathtub', label: 'Bathtub' },
          { value: 'outdoor', label: 'Outdoor Faucet' }
        ]
      },
      {
        id: 'q2',
        question: 'What type of faucet do you have?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'compression', label: 'Compression (two handles)' },
          { value: 'cartridge', label: 'Cartridge (one handle)' },
          { value: 'ball', label: 'Ball faucet' },
          { value: 'disc', label: 'Ceramic Disc' },
          { value: 'unsure', label: 'Not Sure' }
        ]
      },
      {
        id: 'q3',
        question: 'Where is the leak coming from?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'spout', label: 'From the spout (when off)' },
          { value: 'handle', label: 'Around the handle' },
          { value: 'base', label: 'From the base of the faucet' },
          { value: 'under', label: 'Under the sink' }
        ]
      },
      {
        id: 'q4',
        question: 'How severe is the leak?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'drip', label: 'Slow drip (less than 1 drop per second)', isDIYCandidate: true, severity: 'low' },
          { value: 'steady', label: 'Steady stream', isDIYCandidate: true, severity: 'medium' },
          { value: 'spray', label: 'Spraying/water spraying out', isDIYCandidate: false, severity: 'high' }
        ]
      },
      {
        id: 'q5',
        question: 'Can you turn off the water supply to the faucet?',
        type: 'yes-no',
        required: true,
        options: [
          { value: 'yes', label: 'Yes', isDIYCandidate: true },
          { value: 'no', label: 'No (valve stuck or missing)', isDIYCandidate: false, severity: 'high' }
        ]
      }
    ],
    diySolutions: [
      {
        condition: new Map([['q4', 'drip'], ['q5', 'yes']]),
        title: 'Replace Faucet Washer or Cartridge',
        description: 'Most leaky faucets are caused by worn washers or cartridges. This is a simple repair you can do yourself.',
        steps: [
          'Turn off water supply under the sink',
          'Remove the faucet handle (unscrew or pop off cap)',
          'Use a wrench to remove the packing nut',
          'Remove the stem/valve assembly',
          'Replace the washer or cartridge',
          'Reassemble in reverse order',
          'Turn water back on and test'
        ],
        tools: ['Adjustable wrench', 'Screwdriver', 'Replacement washer/cartridge', 'Plumber\'s tape', 'Towel'],
        materials: ['Replacement washer or cartridge', 'Plumber\'s tape (Teflon tape)'],
        estimatedTime: '30-60 minutes',
        difficulty: 'moderate',
        safetyWarnings: [
          'Turn off water supply before starting',
          'Close the drain stopper to avoid losing small parts',
          'Be gentle with old fixtures - they can be brittle'
        ]
      }
    ],
    technicianPreparation: {
      likelyCauses: [
        'Worn out O-rings or washers',
        'Corroded valve seat',
        'Damaged cartridge',
        'Loose packing nut',
        'High water pressure'
      ],
      toolsNeeded: [
        'Basin wrench',
        'Faucet repair kit',
        'Valve seat wrench',
        'Plumber\'s grease',
        'Replacement cartridges'
      ],
      commonParts: ['O-rings', 'Washers', 'Cartridges', 'Valve seats', 'Aerators'],
      estimatedJobDuration: '1-2 hours',
      complexity: 'simple'
    },
    urgencyIndicators: [
      { questionId: 'q4', answerValue: 'spray', urgency: 'urgent' },
      { questionId: 'q5', answerValue: 'no', urgency: 'urgent' }
    ],
    isActive: true
  },

  {
    serviceCategory: 'Plumbing',
    problemName: 'Clogged Drain',
    questions: [
      {
        id: 'q1',
        question: 'Which drain is clogged?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'kitchen_sink', label: 'Kitchen Sink' },
          { value: 'bathroom_sink', label: 'Bathroom Sink' },
          { value: 'shower', label: 'Shower/Tub Drain' },
          { value: 'toilet', label: 'Toilet' }
        ]
      },
      {
        id: 'q2',
        question: 'How bad is the clog?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'slow', label: 'Slow drainage', isDIYCandidate: true, severity: 'low' },
          { value: 'standing', label: 'Water standing/not draining', isDIYCandidate: true, severity: 'medium' },
          { value: 'overflow', label: 'Water overflowing', isDIYCandidate: false, severity: 'high' },
          { value: 'backup', label: 'Water backing up into other drains', isDIYCandidate: false, severity: 'emergency' }
        ]
      },
      {
        id: 'q3',
        question: 'How long has this been happening?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'today', label: 'Just started today' },
          { value: 'week', label: 'Past few days to a week' },
          { value: 'weeks', label: 'Several weeks' },
          { value: 'ongoing', label: 'Ongoing/recurring problem' }
        ]
      },
      {
        id: 'q4',
        question: 'Have you tried any solutions already?',
        type: 'multiple-choice',
        required: false,
        options: [
          { value: 'drano', label: 'Chemical drain cleaner' },
          { value: 'plunger', label: 'Plunging' },
          { value: 'snake', label: 'Drain snake/auger' },
          { value: 'none', label: 'Nothing yet' }
        ]
      }
    ],
    diySolutions: [
      {
        condition: new Map([['q2', 'slow'], ['q3', 'today']]),
        title: 'Simple Unclogging Methods',
        description: 'Most minor clogs can be cleared with simple household methods.',
        steps: [
          'Start with boiling water (for kitchen sinks only)',
          'Try a mixture of baking soda and vinegar',
          'Use a plunger with a tight seal',
          'Remove and clean the p-trap (U-shaped pipe under sink)',
          'Use a drain snake for stubborn clogs'
        ],
        tools: ['Plunger', 'Drain snake (optional)', 'Pliers', 'Bucket', 'Towel'],
        materials: ['Baking soda', 'White vinegar', 'Boiling water'],
        estimatedTime: '15-30 minutes',
        difficulty: 'easy',
        safetyWarnings: [
          'Never use boiling water on plastic pipes or toilet bowls',
          'Don\'t mix chemical drain cleaners with other methods',
          'Wear gloves to protect hands from bacteria',
          'Place bucket under p-trap before removing'
        ]
      }
    ],
    technicianPreparation: {
      likelyCauses: [
        'Hair and soap buildup (bathroom)',
        'Grease and food debris (kitchen)',
        'Foreign objects',
        'Tree roots (main line)',
        'Collapsed or damaged pipe'
      ],
      toolsNeeded: [
        'Professional drain snake',
        'Hydro-jetting equipment',
        'Drain camera',
        'Rooter equipment',
        'Replacement pipe sections'
      ],
      commonParts: ['P-traps', 'Drain covers', 'Pipe sections', 'Ferrules', 'Slip nuts'],
      estimatedJobDuration: '1-3 hours',
      complexity: 'moderate'
    },
    urgencyIndicators: [
      { questionId: 'q2', answerValue: 'overflow', urgency: 'urgent' },
      { questionId: 'q2', answerValue: 'backup', urgency: 'emergency' },
      { questionId: 'q3', answerValue: 'ongoing', urgency: 'urgent' }
    ],
    isActive: true
  },

  // ==================== ELECTRICAL ====================
  {
    serviceCategory: 'Electrical',
    problemName: 'Outlet Not Working',
    questions: [
      {
        id: 'q1',
        question: 'Is only one outlet not working or multiple?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'one', label: 'Just one outlet' },
          { value: 'multiple', label: 'Multiple outlets', isDIYCandidate: false, severity: 'medium' },
          { value: 'room', label: 'Whole room', isDIYCandidate: false, severity: 'high' },
          { value: 'house', label: 'Entire house', isDIYCandidate: false, severity: 'emergency' }
        ]
      },
      {
        id: 'q2',
        question: 'Have you checked the circuit breaker?',
        type: 'yes-no',
        required: true,
        options: [
          { value: 'yes_reset', label: 'Yes, I reset it', isDIYCandidate: true },
          { value: 'yes_tripped', label: 'Yes, it was tripped' },
          { value: 'not_tripped', label: 'Yes, but it\'s not tripped', isDIYCandidate: false },
          { value: 'no', label: 'No', isDIYCandidate: true }
        ]
      },
      {
        id: 'q3',
        question: 'Any signs of damage or burning?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'none', label: 'No visible damage', isDIYCandidate: true },
          { value: 'discoloration', label: 'Discoloration around outlet', isDIYCandidate: false, severity: 'high' },
          { value: 'sparks', label: 'Sparks when plugging in', isDIYCandidate: false, severity: 'emergency' },
          { value: 'smell', label: 'Burning smell', isDIYCandidate: false, severity: 'emergency' },
          { value: 'warm', label: 'Outlet feels warm', isDIYCandidate: false, severity: 'high' }
        ]
      },
      {
        id: 'q4',
        question: 'Is it a GFCI outlet (has test/reset buttons)?',
        type: 'yes-no',
        required: false,
        options: [
          { value: 'yes', label: 'Yes', isDIYCandidate: true },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Not sure' }
        ]
      }
    ],
    diySolutions: [
      {
        condition: new Map([['q1', 'one'], ['q2', 'yes_tripped'], ['q3', 'none']]),
        title: 'Reset Circuit Breaker or GFCI',
        description: 'Often the solution is simply resetting a tripped breaker or GFCI outlet.',
        steps: [
          'Locate your electrical panel',
          'Find the tripped breaker (middle position)',
          'Flip it fully OFF, then back ON',
          'If GFCI outlet, press the RESET button',
          'Test the outlet again'
        ],
        tools: ['Flashlight'],
        materials: [],
        estimatedTime: '5-10 minutes',
        difficulty: 'easy',
        safetyWarnings: [
          'If breaker trips again immediately, stop and call an electrician',
          'Never force a breaker into position',
          'If you see burning or sparks, turn off power immediately'
        ]
      }
    ],
    technicianPreparation: {
      likelyCauses: [
        'Tripped circuit breaker',
        'GFCI outlet needs reset',
        'Faulty outlet',
        'Loose wire connections',
        'Overloaded circuit',
        'Damaged wiring'
      ],
      toolsNeeded: [
        'Voltage tester',
        'Multimeter',
        'Wire strippers',
        'Outlet receptacle',
        'Wire nuts',
        'Electrical tape'
      ],
      commonParts: ['Outlet receptacles', 'Circuit breakers', 'GFCI outlets', 'Wire connectors'],
      estimatedJobDuration: '1-2 hours',
      complexity: 'moderate'
    },
    urgencyIndicators: [
      { questionId: 'q1', answerValue: 'house', urgency: 'emergency' },
      { questionId: 'q3', answerValue: 'sparks', urgency: 'emergency' },
      { questionId: 'q3', answerValue: 'smell', urgency: 'emergency' },
      { questionId: 'q3', answerValue: 'warm', urgency: 'urgent' },
      { questionId: 'q3', answerValue: 'discoloration', urgency: 'urgent' }
    ],
    isActive: true
  },

  {
    serviceCategory: 'Electrical',
    problemName: 'Lights Flickering',
    questions: [
      {
        id: 'q1',
        question: 'Which lights are flickering?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'one', label: 'One light fixture' },
          { value: 'room', label: 'Whole room' },
          { value: 'house', label: 'Throughout the house' }
        ]
      },
      {
        id: 'q2',
        question: 'When does the flickering happen?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'constant', label: 'Constantly', isDIYCandidate: false, severity: 'high' },
          { value: 'appliances', label: 'When large appliances turn on', isDIYCandidate: false, severity: 'medium' },
          { value: 'wind', label: 'When it\'s windy outside', isDIYCandidate: false, severity: 'medium' },
          { value: 'random', label: 'Randomly/intermittently' }
        ]
      },
      {
        id: 'q3',
        question: 'Any buzzing sounds from switches/outlets?',
        type: 'yes-no',
        required: true,
        options: [
          { value: 'yes', label: 'Yes', isDIYCandidate: false, severity: 'high' },
          { value: 'no', label: 'No' }
        ]
      }
    ],
    diySolutions: [],
    technicianPreparation: {
      likelyCauses: [
        'Loose bulb or fixture',
        'Loose wire connection',
        'Voltage fluctuation',
        'Overloaded circuit',
        'Faulty light switch',
        'Service entry cable issue (if outside)'
      ],
      toolsNeeded: [
        'Voltage tester',
        'Multimeter',
        'Wire strippers',
        'Screwdrivers',
        'Replacement fixtures/switches'
      ],
      commonParts: ['Light switches', 'Wire connectors', 'Light fixtures', 'Bulbs'],
      estimatedJobDuration: '1-3 hours',
      complexity: 'moderate'
    },
    urgencyIndicators: [
      { questionId: 'q2', answerValue: 'constant', urgency: 'urgent' },
      { questionId: 'q3', answerValue: 'yes', urgency: 'urgent' },
      { questionId: 'q2', answerValue: 'wind', urgency: 'urgent' }
    ],
    isActive: true
  },

  // ==================== CARPENTRY ====================
  {
    serviceCategory: 'Carpentry',
    problemName: 'Door Not Closing Properly',
    questions: [
      {
        id: 'q1',
        question: 'What type of door is it?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'interior', label: 'Interior door' },
          { value: 'exterior', label: 'Exterior/entry door' },
          { value: 'cabinet', label: 'Cabinet door' },
          { value: 'drawer', label: 'Drawer' }
        ]
      },
      {
        id: 'q2',
        question: 'What\'s the issue?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'stick', label: 'Door sticks or rubs', isDIYCandidate: true },
          { value: 'latch', label: 'Won\'t latch/lock', isDIYCandidate: true },
          { value: 'swing', label: 'Swings open/closed by itself', isDIYCandidate: true },
          { value: 'gap', label: 'Large gaps around door', isDIYCandidate: false },
          { value: 'frame', label: 'Frame appears damaged', isDIYCandidate: false, severity: 'medium' }
        ]
      },
      {
        id: 'q3',
        question: 'How long has this been happening?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'sudden', label: 'Started suddenly' },
          { value: 'gradual', label: 'Gradually got worse over time' },
          { value: 'seasonal', label: 'Happens only during certain seasons' }
        ]
      },
      {
        id: 'q4',
        question: 'Any visible damage to hinges or hardware?',
        type: 'yes-no',
        required: true,
        options: [
          { value: 'yes', label: 'Yes', isDIYCandidate: true },
          { value: 'no', label: 'No' }
        ]
      }
    ],
    diySolutions: [
      {
        condition: new Map([['q2', 'stick'], ['q4', 'no']]),
        title: 'Adjust Door Alignment',
        description: 'Most sticking doors can be fixed with simple adjustments.',
        steps: [
          'Tighten all hinge screws',
          'Check for paint buildup on door or frame',
          'Sand down high spots where rubbing occurs',
          'Adjust strike plate if door won\'t latch',
          'Add weatherstripping if gaps are present'
        ],
        tools: ['Screwdriver', 'Sandpaper (80-120 grit)', 'Plane (optional)', 'Hammer', 'Punch'],
        materials: ['Screws (longer if needed)', 'Paint thinner', 'Weatherstripping', 'Wood filler'],
        estimatedTime: '30-60 minutes',
        difficulty: 'easy',
        safetyWarnings: [
          'Be careful not to over-tighten screws',
          'Wear eye protection when sanding',
          'If door is exterior, ensure proper security after adjustments'
        ]
      }
    ],
    technicianPreparation: {
      likelyCauses: [
        'Loose hinges',
        'House settling',
        'Humidity/warped wood',
        'Worn hinges or hardware',
        'Improper installation',
        'Foundation issues'
      ],
      toolsNeeded: [
        'Drill',
        'Screwdrivers',
        'Chisel',
        'Plane',
        'Level',
        'Shims',
        'New hinges/hardware'
      ],
      commonParts: ['Hinges', 'Screws', 'Strike plates', 'Door shims', 'Weatherstripping'],
      estimatedJobDuration: '1-2 hours',
      complexity: 'simple'
    },
    urgencyIndicators: [
      { questionId: 'q1', answerValue: 'exterior', urgency: 'urgent' },
      { questionId: 'q2', answerValue: 'frame', urgency: 'urgent' }
    ],
    isActive: true
  },

  // ==================== APPLIANCE REPAIR ====================
  {
    serviceCategory: 'Appliance Repair',
    problemName: 'Refrigerator Not Cooling',
    questions: [
      {
        id: 'q1',
        question: 'Is the refrigerator running at all?',
        type: 'yes-no',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, it\'s running' },
          { value: 'no', label: 'No, completely dead', isDIYCandidate: true, severity: 'medium' }
        ]
      },
      {
        id: 'q2',
        question: 'Is the freezer working while the fridge is warm?',
        type: 'yes-no',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, freezer is cold' },
          { value: 'no', label: 'No, both are warm' }
        ]
      },
      {
        id: 'q3',
        question: 'Any unusual sounds?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'none', label: 'No unusual sounds' },
          { value: 'clicking', label: 'Clicking sound', isDIYCandidate: false },
          { value: 'loud', label: 'Loud humming or buzzing', isDIYCandidate: false },
          { value: 'rattling', label: 'Rattling or vibrating', isDIYCandidate: true }
        ]
      },
      {
        id: 'q4',
        question: 'When did the problem start?',
        type: 'single-choice',
        required: true,
        options: [
          { value: 'sudden', label: 'Suddenly stopped cooling' },
          { value: 'gradual', label: 'Gradually got worse' },
          { value: 'frost', label: 'After noticing excessive frost buildup' }
        ]
      },
      {
        id: 'q5',
        question: 'Have you cleaned the condenser coils recently?',
        type: 'yes-no',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, within last 6 months' },
          { value: 'no', label: 'No/Not sure', isDIYCandidate: true }
        ]
      }
    ],
    diySolutions: [
      {
        condition: new Map([['q1', 'yes'], ['q5', 'no']]),
        title: 'Clean Condenser Coils',
        description: 'Dirty condenser coils are the #1 cause of cooling problems.',
        steps: [
          'Unplug the refrigerator for safety',
          'Locate coils (back or bottom of fridge)',
          'Use vacuum with brush attachment to clean coils',
          'Use coil brush for stubborn dirt',
          'Clean fan blades while at the back',
          'Plug back in and wait 2-4 hours for cooling'
        ],
        tools: ['Vacuum with brush attachment', 'Coil cleaning brush', 'Flashlight'],
        materials: [],
        estimatedTime: '20-30 minutes',
        difficulty: 'easy',
        safetyWarnings: [
          'Always unplug before cleaning',
          'Be gentle with coils and fins',
          'Don\'t use water or liquid cleaners',
          'Ensure fridge is level after cleaning'
        ]
      }
    ],
    technicianPreparation: {
      likelyCauses: [
        'Dirty condenser coils',
        'Faulty evaporator fan',
        'Defrost thermostat failure',
        'Compressor issues',
        'Refrigerant leak',
        'Thermostat problems',
        'Door seal/gasket failure'
      ],
      toolsNeeded: [
        'Multimeter',
        'Refrigerant manifold gauge',
        'Vacuum pump',
        'Refrigerant',
        'Thermometer',
        'Replacement parts (fans, thermostats, etc.)'
      ],
      commonParts: ['Evaporator fan motor', 'Condenser fan', 'Start relay', 'Thermostat', 'Defrost timer', 'Door gaskets'],
      estimatedJobDuration: '2-4 hours',
      complexity: 'complex'
    },
    urgencyIndicators: [
      { questionId: 'q4', answerValue: 'sudden', urgency: 'urgent' },
      { questionId: 'q3', answerValue: 'clicking', urgency: 'urgent' }
    ],
    isActive: true
  }
];

async function seedDiagnostics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing diagnostic flows
    await DiagnosticFlow.deleteMany({});
    console.log('🗑️  Cleared existing diagnostic flows');

    // Insert new diagnostic flows
    const insertedFlows = await DiagnosticFlow.insertMany(diagnosticFlows);
    console.log(`✅ Inserted ${insertedFlows.length} diagnostic flows`);

    console.log('\n📋 Diagnostic flows successfully seeded!');
    console.log('\n🔧 Available Diagnostic Flows:');
    insertedFlows.forEach(flow => {
      console.log(`  • ${flow.serviceCategory}: ${flow.problemName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding diagnostic flows:', error);
    process.exit(1);
  }
}

seedDiagnostics();
