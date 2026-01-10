# 🔧 Powerful Diagnostic System - Complete Guide

## Overview

The Intelligent Diagnostic System guides users through structured problem identification to:
- ✅ Offer DIY solutions when appropriate (saving users money)
- ✅ Identify when professional help is truly needed
- ✅ Help technicians come prepared with the right tools and parts
- ✅ Assess urgency (routine, urgent, emergency)
- ✅ Reduce wrong searches and mismatches

---

## 🎯 Key Features

### 1. **Smart Question Flows**
- Each problem has 3-5 targeted questions
- Branching logic based on answers
- Multiple question types (text, single-choice, yes-no, scale)
- Collects specific symptoms, severity, and context

### 2. **DIY Solution Detection**
- Analyzes answer patterns
- Offers step-by-step DIY instructions when safe
- Includes tools, materials, estimated time, and difficulty
- Safety warnings for risky procedures
- Saves users money on simple fixes!

### 3. **Technician Preparation**
When professional help is needed, the system provides:
- **Likely causes**: What's probably wrong
- **Tools needed**: What the technician should bring
- **Common parts**: Replacement parts that might be needed
- **Estimated duration**: How long the job will take
- **Complexity level**: Simple, moderate, or complex

### 4. **Urgency Assessment**
- **Routine**: Normal maintenance issues
- **Urgent**: Needs attention soon (within 24-48 hours)
- **Emergency**: Immediate attention required (safety risk)

---

## 📋 Available Diagnostic Flows

### Plumbing (2 flows)
1. **Leaky Faucet**
   - Checks location, faucet type, leak source, severity
   - DIY: Replace washer/cartridge (30-60 min, moderate)
   - Technician comes prepared with: Basin wrench, repair kit, replacement parts

2. **Clogged Drain**
   - Checks drain type, severity, duration
   - DIY: Boiling water, baking soda, plunger (15-30 min, easy)
   - Technician comes prepared with: Professional snake, hydro-jetting, drain camera

### Electrical (2 flows)
3. **Outlet Not Working**
   - Checks extent of issue, breaker status, damage signs
   - DIY: Reset breaker/GFCI (5-10 min, easy)
   - Technician comes prepared with: Voltage tester, multimeter, new outlets

4. **Lights Flickering**
   - Checks which lights, when it happens, sounds
   - No DIY (safety concern)
   - Technician comes prepared with: Voltage tester, multimeter, replacement fixtures

### Carpentry (1 flow)
5. **Door Not Closing Properly**
   - Checks door type, issue pattern, duration, damage
   - DIY: Adjust hinges/alignment (30-60 min, easy)
   - Technician comes prepared with: Plane, shims, new hinges, weatherstripping

### Appliance Repair (1 flow)
6. **Refrigerator Not Cooling**
   - Checks if running, freezer status, sounds, timeline
   - DIY: Clean condenser coils (20-30 min, easy)
   - Technician comes prepared with: Multimeter, refrigerant, replacement parts

---

## 🔌 API Endpoints

### Get Available Problems
```http
GET /api/v1/diagnostic/problems?category=Plumbing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "Plumbing": [
      { "id": "...", "name": "Leaky Faucet" },
      { "id": "...", "name": "Clogged Drain" }
    ]
  }
}
```

### Start Diagnostic Session
```http
POST /api/v1/diagnostic/:problemId/start
```

**Response:**
```json
{
  "success": true,
  "data": {
    "problemId": "...",
    "problemName": "Leaky Faucet",
    "serviceCategory": "Plumbing",
    "question": {
      "id": "q1",
      "question": "Where is the faucet located?",
      "type": "single-choice",
      "options": [
        { "value": "kitchen", "label": "Kitchen Sink" },
        { "value": "bathroom", "label": "Bathroom Sink" }
      ]
    },
    "questionNumber": 1,
    "totalQuestions": 5
  }
}
```

### Submit Answer
```http
POST /api/v1/diagnostic/:problemId/answer
Content-Type: application/json

{
  "answers": {
    "q1": "kitchen",
    "q2": "cartridge"
  }
}
```

**Response (more questions):**
```json
{
  "success": true,
  "data": {
    "hasNextQuestion": true,
    "question": { ... },
    "questionNumber": 3,
    "totalQuestions": 5
  }
}
```

**Response (diagnosis complete):**
```json
{
  "success": true,
  "data": {
    "hasNextQuestion": false,
    "diagnosis": {
      "problemSummary": "Kitchen Sink, Cartridge, From spout, Slow drip, Yes",
      "urgency": "routine",
      "hasDIYSolution": true,
      "diySolution": {
        "title": "Replace Faucet Washer or Cartridge",
        "description": "Most leaky faucets are caused by worn washers or cartridges...",
        "steps": ["Turn off water supply...", "Remove the faucet handle..."],
        "tools": ["Adjustable wrench", "Screwdriver", "Replacement washer/cartridge"],
        "materials": ["Replacement washer or cartridge", "Plumber's tape"],
        "estimatedTime": "30-60 minutes",
        "difficulty": "moderate",
        "safetyWarnings": ["Turn off water supply before starting..."]
      },
      "needsProfessional": false,
      "recommendations": ["DIY", "cost-effective", "quick-fix"]
    }
  }
}
```

---

## 🎨 Frontend Integration

### Component Structure

```typescript
interface DiagnosticState {
  problemId: string;
  currentStep: number;
  answers: Record<string, string>;
  diagnosis: DiagnosisResult | null;
}

// 1. User selects problem type
// 2. Start diagnostic flow
// 3. Display questions one by one
// 4. Collect answers
// 5. Generate diagnosis
// 6a. Show DIY solution (if applicable)
// 6b. OR show technician recommendation with prep info
```

### UI Flow

```
User: "I have a leaky faucet"
    ↓
DumuBot: Detects problem type → Initiates diagnostic
    ↓
[Question 1/5] Where is the faucet located?
    [Kitchen Sink] [Bathroom] [Bathtub] [Outdoor]
    ↓
[Question 2/5] What type of faucet do you have?
    [Compression] [Cartridge] [Ball] [Disc] [Not Sure]
    ↓
... (continues through questions)
    ↓
✅ DIAGNOSIS COMPLETE

💡 GOOD NEWS: This is a DIY fix!

Replace Faucet Washer or Cartridge
⏱️ Time: 30-60 minutes  |  Difficulty: Moderate

Tools needed:
• Adjustable wrench
• Screwdriver
• Replacement washer/cartridge
• Plumber's tape

Steps:
1. Turn off water supply under the sink
2. Remove the faucet handle
3. Use a wrench to remove the packing nut
...

⚠️ Safety:
• Turn off water supply before starting
• Close the drain stopper to avoid losing parts

[🎥 Watch Tutorial]  [📞 Still Need Help? Book Technician]
```

---

## 🔄 Integration with DumuBot

### Diagnostic Detection

DumuBot automatically detects when a user wants to diagnose:

```javascript
// Trigger phrases
- "diagnose my problem"
- "what's wrong with my..."
- "help me figure out..."
- "my faucet is leaking"
- "outlet not working"

// DumuBot responds:
"I can help diagnose that! Let me ask you a few questions..."
```

### Smart Recommendations

After diagnosis, DumuBot provides:

1. **If DIY available:**
   - Shows solution steps
   - Offers tutorial video link
   - Asks: "Would you like to try this yourself or book a technician?"

2. **If professional needed:**
   - Explains why professional help is needed
   - Shows technician prep info (tools, parts, complexity)
   - Offers: "Ready to book a technician who comes prepared?"

---

## 🚀 Benefits

### For Users:
- 💰 Save money with DIY solutions when appropriate
- 🎓 Learn about their home systems
- ⏱️ Get faster, more accurate service
- 🛡️ Stay safe with proper warnings

### For Technicians:
- 🔧 Come prepared with right tools and parts
- ⏰ Save time on diagnosis
- 📊 Better job estimates
- ⭐ Higher customer satisfaction

### For Platform:
- 📈 Reduced cancellations (better diagnosis)
- 💵 Higher job success rates
- 🎯 Better matching (technician skills → actual problem)
- 📱 Reduced support tickets

---

## 📊 Example Scenarios

### Scenario 1: DIY Candidate
**User:** "My kitchen faucet is dripping slowly"

**Diagnostic Flow:**
1. Location: Kitchen Sink ✓
2. Type: Cartridge ✓
3. Leak source: Spout ✓
4. Severity: Slow drip ✓
5. Can turn off water: Yes ✓

**Result:** DIY Solution
- Replace cartridge (30-60 min, moderate difficulty)
- User saves KES 1,500-3,000!
- Platform earns booking fee when user buys parts through affiliate link

### Scenario 2: Professional Needed
**User:** "Water spraying from my faucet!"

**Diagnostic Flow:**
1. Severity: Spraying → High severity
2. Can't turn off water: Urgent!

**Result:** Book Technician Immediately
- Urgency: Urgent
- Technician comes prepared with:
  - Emergency shut-off tools
  - Replacement cartridges
  - Extra supply lines (in case of damage)
- Customer knows what to expect

### Scenario 3: Emergency
**User:** "Sparks coming from outlet!"

**Diagnostic Flow:**
1. Signs of damage: Sparks → Emergency!

**Result:**
- Urgency: EMERGENCY
- Immediate technician dispatch
- Safety instructions provided instantly
- User told to turn off breaker immediately

---

## 🔮 Future Enhancements

1. **Image Recognition**
   - User uploads photo
   - AI identifies problem type
   - Auto-selects diagnostic flow

2. **Video Tutorials**
   - Embedded how-to videos for DIY solutions
   - Partner with local DIY experts
   - Affiliate revenue from tools/materials

3. **Parts Prediction**
   - Predict exact parts needed
   - Show pricing before technician arrives
   - Order parts in advance (faster service)

4. **AR Integration**
   - Augmented reality to guide DIY repairs
   - Overlay instructions on real-world view
   - Scan and identify parts automatically

---

## 📝 API Test Examples

```bash
# Get all plumbing problems
curl http://localhost:5000/api/v1/diagnostic/problems?category=Plumbing

# Start leaky faucet diagnostic
curl -X POST http://localhost:5000/api/v1/diagnostic/PROBLEM_ID/start

# Submit answer
curl -X POST http://localhost:5000/api/v1/diagnostic/PROBLEM_ID/answer \
  -H "Content-Type: application/json" \
  -d '{"answers": {"q1": "kitchen", "q2": "cartridge"}}'
```

---

## ✅ Ready to Use!

The powerful diagnostic system is now:
- ✅ Database seeded with 6 comprehensive flows
- ✅ API endpoints live and working
- ✅ Ready for frontend integration
- ✅ DumuBot can be enhanced to trigger diagnostics

Next: Integrate with frontend component to create an amazing user experience! 🚀
