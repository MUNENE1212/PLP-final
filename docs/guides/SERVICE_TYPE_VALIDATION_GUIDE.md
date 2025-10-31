# Service Type Validation & Selection System

## Overview

This system prevents pricing errors by helping users select the correct service type before falling back to general pricing. It includes intelligent validation, fuzzy matching, and user-friendly suggestions.

---

## Problem Solved

### Before (Potential Issues):
❌ User types "leak repair" but it's spelled wrong → Falls back to general pricing (may be inaccurate)
❌ User enters "tap fixing" instead of "faucet_repair" → No exact match, uses fallback
❌ User confused about which service to select → Picks wrong one
❌ Spelling mistakes lead to generic pricing → Customer dissatisfaction

### After (Solution):
✅ User gets list of ALL available services for the category
✅ Fuzzy search finds similar services even with typos
✅ Intelligent suggestions based on what user typed
✅ Clear pricing shown for each service type
✅ Fallback to general is EXPLICIT choice, not automatic
✅ Better user experience, more accurate pricing

---

## Architecture

### Backend Components

```
📁 controllers/pricing.controller.js
├── getServiceTypes()         → Get all services for category
├── validateServiceType()     → Validate & suggest alternatives
└── Helper Functions:
    ├── calculateSimilarity() → Fuzzy string matching
    └── levenshteinDistance() → Edit distance calculation

📁 routes/pricing.routes.js
├── GET /api/v1/pricing/service-types/:category
└── POST /api/v1/pricing/validate-service

📁 services/pricing.service.js
└── calculatePrice() → Fallback mechanism (existing)
```

### Frontend Components

```
📁 components/bookings/ServiceTypeSelector.tsx
└── Main component with:
    ├── Service list with search
    ├── Custom input validation
    ├── Suggestions display
    └── Fallback option
```

---

## API Endpoints

### 1. Get Available Service Types

**Endpoint:** `GET /api/v1/pricing/service-types/:category`

**Access:** Public

**Parameters:**
- `category` (path) - Service category (plumbing, electrical, etc.)

**Response:**
```json
{
  "success": true,
  "category": "plumbing",
  "serviceTypes": [
    {
      "serviceType": "leak_repair",
      "description": "Leak detection and repair",
      "basePrice": 1500,
      "priceUnit": "fixed",
      "estimatedDuration": 2,
      "isGeneral": false
    },
    {
      "serviceType": "pipe_installation",
      "description": "Pipe installation and fitting",
      "basePrice": 3000,
      "priceUnit": "fixed",
      "estimatedDuration": 3,
      "isGeneral": false
    },
    {
      "serviceType": "general",
      "description": "General plumbing service (fallback)",
      "basePrice": 2000,
      "priceUnit": "fixed",
      "estimatedDuration": 2,
      "isGeneral": true
    }
  ],
  "count": 16
}
```

**Use Cases:**
- Populate dropdown/selection list
- Show user all available options
- Display pricing for each service

---

### 2. Validate Service Type & Get Suggestions

**Endpoint:** `POST /api/v1/pricing/validate-service`

**Access:** Public

**Request Body:**
```json
{
  "serviceCategory": "plumbing",
  "serviceType": "leak fixing"  // User's input (may have typos)
}
```

**Response (Exact Match Found):**
```json
{
  "success": true,
  "valid": true,
  "match": {
    "serviceType": "leak_repair",
    "description": "Leak detection and repair",
    "basePrice": 1500,
    "priceUnit": "fixed"
  },
  "suggestions": []
}
```

**Response (No Exact Match - With Suggestions):**
```json
{
  "success": true,
  "valid": false,
  "requestedServiceType": "leak fixing",
  "message": "Service type 'leak fixing' not found. Please select from suggestions or use general plumbing service.",
  "suggestions": [
    {
      "serviceType": "leak_repair",
      "description": "Leak detection and repair",
      "basePrice": 1500,
      "priceUnit": "fixed",
      "similarity": 0.75
    },
    {
      "serviceType": "faucet_repair",
      "description": "Tap/faucet repair or replacement",
      "basePrice": 1000,
      "priceUnit": "fixed",
      "similarity": 0.45
    }
  ],
  "fallback": {
    "serviceType": "general",
    "description": "General plumbing service (fallback)",
    "basePrice": 2000,
    "priceUnit": "fixed",
    "note": "This is a fallback option that will be used if no specific service is selected"
  }
}
```

**Similarity Score:**
- 1.0 = Perfect match
- 0.8+ = Very similar (substring match)
- 0.6-0.8 = Word overlap detected
- 0.3-0.6 = Some similarity (Levenshtein distance)
- <0.3 = Not shown in suggestions

---

## Fuzzy Matching Algorithm

### How It Works:

```javascript
// 1. Substring matching (highest priority)
if (longer.includes(shorter)) return 0.8;

// 2. Word overlap
words1 = "leak repair" → ["leak", "repair"]
words2 = "leak_detection" → ["leak", "detection"]
commonWords = ["leak"] → 50% overlap = 0.6-0.9 similarity

// 3. Levenshtein distance (edit distance)
"leak fixing" vs "leak_repair"
Distance = 7 edits → similarity = 0.4
```

### Examples:

| User Input | Matches | Similarity | Reason |
|------------|---------|------------|--------|
| "leak fix" | leak_repair | 0.8 | Substring match |
| "pipe fitting" | pipe_installation | 0.75 | Word overlap (pipe) |
| "tap repair" | faucet_repair | 0.6 | Similar concept |
| "leak" | leak_repair | 0.8 | Substring match |
| "leek repair" | leak_repair | 0.7 | One character typo |

---

## Frontend Integration

### Basic Usage

```tsx
import ServiceTypeSelector from '@/components/bookings/ServiceTypeSelector';

function CreateBooking() {
  const [serviceCategory, setServiceCategory] = useState('plumbing');
  const [serviceType, setServiceType] = useState('');

  return (
    <form>
      {/* Category Selection */}
      <select
        value={serviceCategory}
        onChange={(e) => setServiceCategory(e.target.value)}
      >
        <option value="plumbing">Plumbing</option>
        <option value="electrical">Electrical</option>
        {/* ... */}
      </select>

      {/* Service Type Selection */}
      <ServiceTypeSelector
        serviceCategory={serviceCategory}
        value={serviceType}
        onChange={setServiceType}
      />

      <button type="submit">Get Price Estimate</button>
    </form>
  );
}
```

### Component Features

1. **Service List with Search**
   - Shows all available services
   - Real-time search filtering
   - Displays pricing and duration

2. **Custom Input**
   - User can type custom service description
   - Validates against database
   - Shows fuzzy match suggestions

3. **Smart Suggestions**
   - Top 5 most similar services
   - Shows similarity percentage
   - One-click selection

4. **Fallback Option**
   - Clearly marked as "General Service"
   - Explains it's for unlisted services
   - User must explicitly choose it

5. **Selected Service Display**
   - Shows what's been selected
   - Displays pricing info
   - Easy to change selection

---

## User Flow

### Scenario 1: User Knows Exact Service

```
1. Select category: "Plumbing"
2. Search: "leak"
3. See: "Leak detection and repair - KES 1,500"
4. Click to select
5. ✅ Service selected, proceed to booking
```

### Scenario 2: User Has Typo

```
1. Select category: "Electrical"
2. Click "Can't find service?"
3. Type: "socet installation" (typo)
4. Click "Check"
5. See suggestions:
   - "socket_installation" (85% match) ✨
   - "switch_installation" (45% match)
6. Click suggestion
7. ✅ Correct service selected
```

### Scenario 3: Service Not Listed

```
1. Select category: "Carpentry"
2. Click "Can't find service?"
3. Type: "custom treehouse building"
4. Click "Check"
5. See: "Service not found"
6. See suggestions based on keywords
7. Options:
   a) Select a suggested service if relevant
   b) Click "Use General Carpentry Service"
8. ✅ Fallback selected with user consent
```

### Scenario 4: Browse Services

```
1. Select category: "HVAC"
2. See full list of services:
   - AC Installation - KES 6,000
   - AC Repair - KES 2,500
   - AC Servicing - KES 1,500
   - ...
3. Scroll through options
4. Click desired service
5. ✅ Service selected
```

---

## Benefits

### For Users:
✅ **No guessing** - See all available services
✅ **Accurate pricing** - Right service = right price
✅ **Typo forgiveness** - Fuzzy matching catches mistakes
✅ **Clear choices** - Pricing shown upfront
✅ **Flexible** - Can describe custom services

### For Business:
✅ **Accurate quotes** - Less pricing disputes
✅ **Better data** - Know what services customers want
✅ **Professional UX** - Modern, intelligent interface
✅ **Reduced support** - Users select correctly first time
✅ **Extensible** - Easy to add new services

### For Developers:
✅ **Reusable component** - Use anywhere in app
✅ **Type-safe** - TypeScript interfaces
✅ **Well-documented** - Clear API contracts
✅ **Testable** - Isolated validation logic
✅ **Maintainable** - Clean separation of concerns

---

## Testing

### Test Cases:

#### 1. Service Type Listing
```bash
# Get all plumbing services
GET /api/v1/pricing/service-types/plumbing

Expected: 16 services returned, 'general' at the end
```

#### 2. Exact Match
```bash
POST /api/v1/pricing/validate-service
{
  "serviceCategory": "plumbing",
  "serviceType": "leak_repair"
}

Expected: valid: true, match object returned
```

#### 3. Typo Handling
```bash
POST /api/v1/pricing/validate-service
{
  "serviceCategory": "electrical",
  "serviceType": "socet installation"
}

Expected:
- valid: false
- suggestions[0].serviceType = "socket_installation"
- similarity > 0.7
```

#### 4. Substring Match
```bash
POST /api/v1/pricing/validate-service
{
  "serviceCategory": "carpentry",
  "serviceType": "door"
}

Expected:
- suggestions include "door_installation", "door_repair"
- High similarity scores (>0.8)
```

#### 5. No Match
```bash
POST /api/v1/pricing/validate-service
{
  "serviceCategory": "painting",
  "serviceType": "xyz123"
}

Expected:
- valid: false
- suggestions: [] (or low similarity)
- fallback provided
```

---

## Configuration

### Similarity Threshold

Default: `0.3` (30% similarity minimum)

Adjust in `pricing.controller.js`:
```javascript
.filter(s => s.similarity > 0.3)  // Change this value
```

- Higher (0.5+) = Fewer, more relevant suggestions
- Lower (0.2) = More suggestions, less relevant

### Max Suggestions

Default: `5` suggestions

Adjust in `pricing.controller.js`:
```javascript
.slice(0, 5)  // Change this value
```

---

## Future Enhancements

### Planned Features:

1. **AI-Powered Categorization**
   - Use ML to auto-categorize custom descriptions
   - "My sink is dripping" → category: plumbing, type: leak_repair

2. **Learning from History**
   - Track what users select after seeing suggestions
   - Improve similarity algorithm over time

3. **Popular Services Badge**
   - Mark frequently booked services
   - Show in search results

4. **Price Range Filters**
   - Filter services by budget
   - "Show services under 3,000 KES"

5. **Service Bundles**
   - "Kitchen Plumbing Package"
   - Combines multiple services at discount

6. **Voice Input**
   - Describe service verbally
   - AI transcription + validation

---

## Troubleshooting

### Issue: No suggestions shown
**Cause:** Similarity threshold too high or no similar services
**Solution:** Lower threshold or check service names in database

### Issue: Too many irrelevant suggestions
**Cause:** Similarity threshold too low
**Solution:** Raise threshold from 0.3 to 0.5

### Issue: Component not loading services
**Cause:** API endpoint not accessible or category invalid
**Solution:** Check network tab, verify category name

### Issue: Fallback always being used
**Cause:** Service types not properly seeded
**Solution:** Run `node src/scripts/seedPricing.js`

---

## Summary

This validation system provides:

✅ **99+ service types** across 8 categories
✅ **Intelligent fuzzy matching** for typos
✅ **User-friendly selection** interface
✅ **Accurate pricing** - right service, right price
✅ **Fallback safety net** - with user consent
✅ **Professional UX** - modern, responsive
✅ **Production-ready** - tested and documented

**Result: Better user experience + More accurate pricing + Fewer disputes**

---

## Quick Start

### 1. Backend Setup
```bash
# Seed database with services
cd backend
node src/scripts/seedPricing.js
```

### 2. Test API
```bash
# Get services
curl http://localhost:5000/api/v1/pricing/service-types/plumbing

# Validate service
curl -X POST http://localhost:5000/api/v1/pricing/validate-service \
  -H "Content-Type: application/json" \
  -d '{"serviceCategory":"plumbing","serviceType":"leak fix"}'
```

### 3. Frontend Integration
```tsx
import ServiceTypeSelector from '@/components/bookings/ServiceTypeSelector';

// Use in your booking form
<ServiceTypeSelector
  serviceCategory="plumbing"
  value={serviceType}
  onChange={setServiceType}
/>
```

### 4. Done! 🎉

Your users can now intelligently select service types with validation and suggestions!
