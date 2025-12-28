interface Problem {
  category: string;
  symptoms: string[];
  potentialCauses: string[];
  diySolution?: string;
  professionalRequired: boolean;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  estimatedCost: string;
  technicianType: string;
}

export const problemDatabase: Problem[] = [
  // Plumbing
  {
    category: 'Plumbing',
    symptoms: ['dripping faucet', 'leaking pipe', 'clogged drain', 'low water pressure', 'running toilet'],
    potentialCauses: ['worn washer', 'loose connection', 'debris buildup', 'pipe corrosion', 'valve issue'],
    diySolution: 'Replace washer or use plunger for minor clogs',
    professionalRequired: false,
    urgency: 'low',
    estimatedCost: 'KES 500-2,000',
    technicianType: 'Plumber'
  },
  {
    category: 'Plumbing',
    symptoms: ['burst pipe', 'flooding', 'no water in house', 'water heater leaking'],
    potentialCauses: ['pipe freeze', 'corrosion', 'high water pressure', 'old age'],
    professionalRequired: true,
    urgency: 'emergency',
    estimatedCost: 'KES 5,000-15,000',
    technicianType: 'Plumber'
  },

  // Electrical
  {
    category: 'Electrical',
    symptoms: ['outlet not working', 'tripping breaker', 'lights flickering'],
    potentialCauses: ['tripped GFCI', 'overloaded circuit', 'loose wiring'],
    diySolution: 'Reset GFCI or redistribute load',
    professionalRequired: false,
    urgency: 'low',
    estimatedCost: 'KES 1,000-3,000',
    technicianType: 'Electrician'
  },
  {
    category: 'Electrical',
    symptoms: ['burning smell', 'sparks', 'shock from outlet', 'warm outlets'],
    potentialCauses: ['short circuit', 'overloaded circuit', 'faulty wiring'],
    professionalRequired: true,
    urgency: 'emergency',
    estimatedCost: 'KES 3,000-10,000',
    technicianType: 'Electrician'
  },

  // Appliances
  {
    category: 'Appliance',
    symptoms: ['fridge not cooling', 'washer not spinning', 'oven not heating'],
    potentialCauses: ['broken thermostat', 'belt issue', 'heating element'],
    professionalRequired: true,
    urgency: 'medium',
    estimatedCost: 'KES 2,000-8,000',
    technicianType: 'Appliance Repair'
  },

  // Carpentry
  {
    category: 'Carpentry',
    symptoms: ['broken door', 'loose cabinet', 'broken furniture', 'squeaky floor'],
    potentialCauses: ['broken hinge', 'loose screws', 'wood rot', 'structural issue'],
    diySolution: 'Tighten screws or replace hinges',
    professionalRequired: false,
    urgency: 'low',
    estimatedCost: 'KES 1,000-5,000',
    technicianType: 'Carpenter'
  },

  // HVAC
  {
    category: 'HVAC',
    symptoms: ['ac not cooling', 'furnace not heating', 'strange noises from vents'],
    potentialCauses: ['dirty filter', 'refrigerant leak', 'thermostat issue'],
    diySolution: 'Replace air filter',
    professionalRequired: false,
    urgency: 'medium',
    estimatedCost: 'KES 2,000-10,000',
    technicianType: 'HVAC Technician'
  }
];

export const detectProblem = (description: string): Problem | null => {
  const lowerDesc = description.toLowerCase();

  for (const problem of problemDatabase) {
    for (const symptom of problem.symptoms) {
      if (lowerDesc.includes(symptom.toLowerCase()) ||
          symptom.toLowerCase().includes(lowerDesc)) {
        return problem;
      }
    }
  }

  return null;
};

export const getRecommendation = (problem: Problem) => {
  if (problem.urgency === 'emergency') {
    return {
      message: `⚠️ **EMERGENCY**: This requires immediate professional attention.\n\n**Issue:** ${problem.category}\n**Risk:** Fire hazard, water damage, or safety risk\n\n**Action Required:**\n1. Turn off power/water supply if safe\n2. Contact emergency technician immediately\n3. Do not attempt DIY`,
      showBookButton: true,
      ctaText: 'Book Emergency Technician'
    };
  }

  if (problem.professionalRequired) {
    return {
      message: `**Professional Service Recommended**\n\n**Issue:** ${problem.category}\n**Estimated Cost:** ${problem.estimatedCost}\n\nWhile you could attempt DIY, we recommend a professional for:\n• Safety assurance\n• Proper tools\n• Warranty on work\n• Long-term solution`,
      showBookButton: true,
      ctaText: `Book ${problem.technicianType}`
    };
  }

  return {
    message: `**DIY Solution Possible** 💪\n\n**Issue:** ${problem.category}\n\n${problem.diySolution}\n\n**Estimated Savings:** ${problem.estimatedCost}\n\n**Still need help?** We can connect you with a professional if the DIY doesn't work.`,
    showBookButton: true,
    ctaText: 'Book Technician Anyway'
  };
};

// Enhanced bot response generator with problem detection
export const generateBotResponse = (userInput: string, conversationHistory: any[] = []): any => {
  const input = userInput.toLowerCase();
  const detectedProblem = detectProblem(userInput);

  // Check for emergency keywords first
  if (input.includes('emergency') || input.includes('fire') || input.includes('flood') || input.includes('burst')) {
    return {
      role: 'bot',
      content: "🚨 **EMERGENCY DETECTED**\n\nThis sounds like an emergency situation. Please take immediate action:\n\n1. Ensure your safety first\n2. Turn off power/water if safe to do so\n3. Evacuate if necessary\n\nI recommend booking an emergency technician immediately. Would you like me to help you with that?",
      options: ['Yes, book emergency technician', 'No, it\'s not urgent']
    };
  }

  // If we detected a specific problem, provide targeted advice
  if (detectedProblem) {
    const recommendation = getRecommendation(detectedProblem);

    return {
      role: 'bot',
      content: `I've identified a potential issue:\n\n${recommendation.message}`,
      options: [recommendation.ctaText, 'Tell me more about DIY solutions']
    };
  }

  // Category-based responses
  if (input.includes('leak') || input.includes('dripping') || input.includes('water')) {
    return {
      role: 'bot',
      content: "I understand you have a water leak issue. Let me ask a few questions to diagnose the problem:\n\n1. Where is the leak located? (faucet, pipe, toilet, water heater)\n2. How severe is it? (drip, steady stream, flooding)\n3. When did it start?"
    };
  }

  if (input.includes('power') || input.includes('electricity') || input.includes('outlet') || input.includes('switch')) {
    return {
      role: 'bot',
      content: "I see you're having electrical issues. This is potentially dangerous. ⚠️\n\nQuick safety check:\n• Is there a burning smell? → **Turn off power immediately**\n• Are sparks visible? → **Emergency - call electrician**\n\nWhat type of electrical problem are you experiencing?",
      options: ['Outlet not working', 'Lights flickering', 'Circuit breaker trips', 'Burning smell', 'Other']
    };
  }

  if (input.includes('plumbing') || input.includes('faucet') || input.includes('pipe') || input.includes('drain')) {
    return {
      role: 'bot',
      content: "Great, you have a plumbing issue. Based on common problems:\n\n🔧 **DIY Potential:**\n• Dripping faucet (washer replacement)\n• Clogged drain (plunger)\n\n👨‍🔧 **Professional Recommended:**\n• Burst pipes\n• Water heater issues\n• Low water pressure throughout house\n\nWhich scenario matches your situation?",
      options: ['Dripping faucet', 'Clogged drain', 'Burst pipe', 'Low pressure', 'Water heater']
    };
  }

  if (input.includes('ac') || input.includes('air conditioning') || input.includes('cooling') || input.includes('heating')) {
    return {
      role: 'bot',
      content: "I can help with HVAC issues! Common problems include:\n\n• AC not cooling properly\n• Furnace not heating\n• Strange noises from vents\n• Weak airflow\n\nWhat's happening with your HVAC system?",
      options: ['AC not cooling', 'Furnace not heating', 'Strange noises', 'Weak airflow']
    };
  }

  if (input.includes('furniture') || input.includes('door') || input.includes('cabinet') || input.includes('shelf')) {
    return {
      role: 'bot',
      content: "Carpentry issue detected! I can help with:\n\n• Broken doors or hinges\n• Loose cabinets\n• Furniture repair\n• Squeaky floors\n\nWhat needs to be fixed?",
      options: ['Broken door', 'Loose cabinet', 'Furniture repair', 'Floor issue']
    };
  }

  if (input.includes('fridge') || input.includes('refrigerator') || input.includes('washer') || input.includes('oven') || input.includes('appliance')) {
    return {
      role: 'bot',
      content: "Appliance repair! Let me identify the issue:\n\nCommon problems:\n• Refrigerator not cooling\n• Washer not spinning/draining\n• Oven not heating\n• Dishwasher not cleaning\n\nWhich appliance is acting up?",
      options: ['Refrigerator', 'Washing machine', 'Oven/Stove', 'Dishwasher', 'Other']
    };
  }

  // Default helpful response
  return {
    role: 'bot',
    content: "I'm here to help! Could you describe the problem in more detail? For example:\n\n• What's not working?\n• When did the issue start?\n• Any unusual sounds or smells?\n• Which room or area?\n\nThis will help me provide the best solution.",
    options: ['Plumbing', 'Electrical', 'Carpentry', 'Appliance', 'HVAC', 'Other']
  };
};
