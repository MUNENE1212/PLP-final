# WORD BANK UX Concept
## Visual Service Discovery for Dumuwaks

---

## Concept Overview

### What is the WORD BANK?

The WORD BANK is a visual, interactive service selection interface where services are displayed as selectable "chips" or "tags" - similar to hashtags or skill badges. Users can browse, tap to select, and instantly see matching technicians.

### Core Philosophy

> "Services should be as easy to browse as products in a catalog - visual, tappable, and intuitive."

### Key Principles

1. **Visual First** - Icons/images before text
2. **Tappable** - Touch-friendly chips (48px+ touch targets)
3. **Instant Feedback** - Immediate results on selection
4. **Flexible** - Mix of preset and custom services
5. **Multilingual** - Works in English and Swahili

---

## Service Hierarchy

### Three-Level Structure

```
CATEGORY (Visual Card)
    |
    +-- SERVICE TYPE (Word Bank Chip)
            |
            +-- SERVICE VARIATION (Sub-chip, optional)
```

### Example: Plumbing Category

```
PLUMBING (Card with icon)
    |
    +-- Tap Repair (Chip)
    +-- Toilet Installation (Chip)
    +-- Pipe Repair (Chip)
    +-- Water Tank (Chip)
    +-- Leak Fix (Chip)
    +-- Drain Unblocking (Chip)
    +-- [Custom: Bathroom Renovation] (Technician-added chip)
    +-- [Custom: Solar Water Heater] (Technician-added chip)
```

---

## Customer-Facing WORD BANK

### Screen 1: Service Category Selection (Visual Grid)

```
+-----------------------------------------------------------------------+
|  [Status Bar: 9:41 | 4G | 100%]                                       |
+-----------------------------------------------------------------------+
|  < Back           Find a Service                 [?] [Notification]   |
+-----------------------------------------------------------------------+
|                                                                       |
|  What do you need help with?                                         |
|                                                                       |
|  [Search: "leaking tap, pipe repair..."          ] [Voice] [Camera]  |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|  +------------------+  +------------------+  +------------------+     |
|  |     [ICON]       |  |     [ICON]       |  |     [ICON]       |     |
|  |    PLUMBING      |  |   ELECTRICAL     |  |   CARPENTRY      |     |
|  |  156 technicians |  |  124 technicians |  |   89 technicians |     |
|  +------------------+  +------------------+  +------------------+     |
|                                                                       |
|  +------------------+  +------------------+  +------------------+     |
|  |     [ICON]       |  |     [ICON]       |  |     [ICON]       |     |
|  |    PAINTING      |  |     HVAC         |  |   CLEANING       |     |
|  |   67 technicians |  |   45 technicians |  |  112 technicians |     |
|  +------------------+  +------------------+  +------------------+     |
|                                                                       |
|  +------------------+  +------------------+                           |
|  |     [ICON]       |  |     [ICON]       |                           |
|  |    MASONRY       |  |    WELDING       |                           |
|  |   34 technicians |  |   28 technicians |                           |
|  +------------------+  +------------------+                           |
|                                                                       |
|  Can't find your category? [Browse All Services]                      |
|                                                                       |
+-----------------------------------------------------------------------+
|  [Home]  [Search]  [Bookings]  [Messages]  [Profile]     <-- Bottom  |
+-----------------------------------------------------------------------+
```

**Design Notes:**
- Category cards are 160px x 120px on mobile
- Icons are 48px x 48px, clearly recognizable
- Technician count builds confidence
- Tap anywhere on card to select

---

### Screen 2: WORD BANK - Service Selection (The Core Concept)

```
+-----------------------------------------------------------------------+
|  [Status Bar: 9:41 | 4G | 100%]                                       |
+-----------------------------------------------------------------------+
|  < Back         Plumbing Services               [Filter] [Sort]       |
+-----------------------------------------------------------------------+
|                                                                       |
|  What specifically do you need?                                       |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | POPULAR SERVICES                                            [x] |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +------------+ +------------+ +------------+ +------------+          |
|  | [ICON]     | | [ICON]     | | [ICON]     | | [ICON]     |          |
|  | Tap Repair | | Toilet Fix | | Leak       | | Pipe       |          |
|  | FROM KES500| | FROM KES1K | | FROM KES800| | FROM KES600|          |
|  +-----[SELECT]+ +------------+ +------------+ +------------+          |
|                                                                       |
|  +------------+ +------------+ +------------+ +------------+          |
|  | [ICON]     | | [ICON]     | | [ICON]     | | [ICON]     |          |
|  | Drain      | | Water Tank | | Shower     | | Geyser     |          |
|  | FROM KES800| | FROM KES2.5K| | FROM KES1K| | FROM KES2K |          |
|  +------------+ +------------+ +------------+ +------------+          |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | SPECIALIZED SERVICES                                              |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +------------+ +------------+ +------------+ +------------+          |
|  | [ICON]     | | [ICON]     | | [ICON]     | | [ICON]     |          |
|  | Bathroom   | | Kitchen    | | Solar      | | Borehole   |          |
|  | Reno       | | Plumbing   | | Heater     | | Pump       |          |
|  | FROM KES15K| | FROM KES8K | | FROM KES3K | | FROM KES5K |          |
|  +------------+ +------------+ +------------+ +------------+          |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | CUSTOM SERVICES NEAR YOU (Technician-defined)                     |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +------------+ +------------+ +------------+                         |
|  | *CUSTOM*   | | *CUSTOM*   | | *CUSTOM*   |                         |
|  | Water      | | Jacuzzi    | | Pool       |                         |
|  | Meter      | | Install    | | Plumbing   |                         |
|  | FROM KES1K | | FROM KES10K| | FROM KES5K |                         |
|  +------------+ +------------+ +------------+                         |
|                                                                       |
|  [Can't find what you need? Describe it or upload a photo]            |
|                                                                       |
+-----------------------------------------------------------------------+
|  1 selected: Tap Repair                           [Find Technicians] |
+-----------------------------------------------------------------------+
|  [Home]  [Search]  [Bookings]  [Messages]  [Profile]                 |
+-----------------------------------------------------------------------+
```

**Key Features:**

1. **Visual Service Chips**
   - Each service is a tappable card (100px x 80px minimum)
   - Icon + name + starting price
   - Selected state clearly visible (highlighted border, checkmark)

2. **Pricing Transparency**
   - "FROM KES X" shows minimum price
   - Builds trust, reduces surprises
   - Based on technician pricing data

3. **Service Grouping**
   - Popular (most booked)
   - Specialized (higher skill)
   - Custom (technician-defined)

4. **Multi-Select Capability**
   - Select multiple services for comparison
   - Or select one and proceed

5. **Fallback Options**
   - "Can't find it?" prompts description/photo
   - Voice input for accessibility
   - Camera for visual problem description

---

### Screen 3: Selected Services Summary

```
+-----------------------------------------------------------------------+
|  [Status Bar: 9:41 | 4G | 100%]                                       |
+-----------------------------------------------------------------------+
|  < Back           Your Selection                      [Modify]         |
+-----------------------------------------------------------------------+
|                                                                       |
|  SELECTED SERVICES                                                    |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [X] Tap Repair                          FROM KES 500 - 1,500    |  |
|  +-----------------------------------------------------------------+  |
|  | [X] Leak Detection                      FROM KES 800 - 2,000    |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  ESTIMATED TOTAL: KES 1,300 - 3,500                                  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | PROBLEM DESCRIPTION (Optional)                                    |  |
|  |                                                                   |  |
|  | [Tap icon] What's the issue?                                      |  |
|  | [________________________]                                        |  |
|  |                                                                   |  |
|  | [Photo icon] Add photos (helps technicians prepare)               |  |
|  | [+ Add Photo] [+ Add Photo] [+ Add Photo]                         |  |
|  |                                                                   |  |
|  | [Mic icon] Or describe with voice                                 |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | LOCATION                                                          |  |
|  |                                                                   |  |
|  | [Map pin icon] Kilimani, Nairobi                                  |  |
|  | [Detect my location]  [Enter manually]                            |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | URGENCY                                                           |  |
|  |                                                                   |  |
|  | [!] EMERGENCY (Within 2 hours)  [Schedule for later]              |  |
|  |     +50% urgency fee applies                                      |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
+-----------------------------------------------------------------------+
|                                     [Find 12 Available Technicians]   |
+-----------------------------------------------------------------------+
```

---

## Technician-Facing WORD BANK

### Screen: Service Definition Interface

```
+-----------------------------------------------------------------------+
|  [Status Bar: 9:41 | 4G | 100%]                                       |
+-----------------------------------------------------------------------+
|  < Back        My Services                       [+ Add Custom]       |
+-----------------------------------------------------------------------+
|                                                                       |
|  YOUR SERVICES                                                        |
|  Customers will see these when searching for technicians             |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | PLUMBING SERVICES                                           [Edit]|  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  PRESET SERVICES (Select to offer)                                    |
|                                                                       |
|  +------------+ +------------+ +------------+ +------------+          |
|  | [CHECK]    | | [ ]        | | [CHECK]    | | [ ]        |          |
|  | Tap Repair | | Toilet Fix | | Leak       | | Pipe       |          |
|  | KES 500-   | |            | | KES 800-   | |            |          |
|  | 1,500      | |            | | 2,000      | |            |          |
|  +------------+ +------------+ +------------+ +------------+          |
|                                                                       |
|  +------------+ +------------+ +------------+ +------------+          |
|  | [CHECK]    | | [ ]        | | [CHECK]    | | [ ]        |          |
|  | Drain      | | Water Tank | | Shower     | | Geyser     |          |
|  | KES 800-   | |            | | KES 1,000- | |            |          |
|  | 2,000      | |            | | 2,500      | |            |          |
|  +------------+ +------------+ +------------+ +------------+          |
|                                                                       |
|  YOUR CUSTOM SERVICES                                                 |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [EDIT] Bathroom Renovation         KES 15,000 - 50,000    [DEL] |  |
|  |       Full bathroom overhaul, tiles, fixtures, plumbing         |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [EDIT] Solar Water Heater Install  KES 3,000 - 5,000     [DEL] |  |
|  |       Installation labor for solar systems                      |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [EDIT] Water Meter Installation    KES 1,000 - 2,000     [DEL] |  |
|  |       Nairobi Water approved installer                          |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [+ Add Another Custom Service]                                       |
|                                                                       |
+-----------------------------------------------------------------------+
|                                     [Save Services]    |
+-----------------------------------------------------------------------+
```

---

### Add Custom Service Modal

```
+-----------------------------------------------------------------------+
|                                                                       |
|  ADD CUSTOM SERVICE                                            [X]    |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|  Service Name *                                                       |
|  +-------------------------------------------------------------+      |
|  | e.g., "Jacuzzi Installation"                                |      |
|  +-------------------------------------------------------------+      |
|                                                                       |
|  Category *                                                           |
|  +-------------------------------------------------------------+      |
|  | Plumbing v                                                  |      |
|  +-------------------------------------------------------------+      |
|                                                                       |
|  Description (Optional)                                               |
|  +-------------------------------------------------------------+      |
|  | Describe what this service includes...                      |      |
|  |                                                             |      |
|  +-------------------------------------------------------------+      |
|                                                                       |
|  Pricing *                                                            |
|  +---------------------------+  +---------------------------+         |
|  | Minimum: KES [____10,000] |  | Maximum: KES [____25,000] |         |
|  +---------------------------+  +---------------------------+         |
|                                                                       |
|  Pricing Type *                                                       |
|  ( ) Per Job (Fixed Price)                                            |
|  (x) Price Range (Depends on scope)                                   |
|  ( ) Per Hour                                                         |
|  ( ) Per Unit (e.g., per socket, per tap)                             |
|                                                                       |
|  Add Example Photos (Helps customers understand)                      |
|  [+ Add Photo] [+ Add Photo] [+ Add Photo]                            |
|                                                                       |
+-----------------------------------------------------------------------+
|                     [Cancel]          [Add Service]                   |
+-----------------------------------------------------------------------+
```

---

## Interaction Design

### Chip Selection Behavior

**Unselected State:**
```
+------------------+
|     [ICON]       |
|   Service Name   |
|   FROM KES 500   |
+------------------+
  Border: Gray (#E5E7EB)
  Background: White
  Text: Dark gray (#374151)
```

**Selected State:**
```
+------------------+
|  [CHECK] [ICON]  |
|   Service Name   |
|   FROM KES 500   |
+------------------+
  Border: Primary color (#4F46E5)
  Background: Light primary (#EEF2FF)
  Text: Primary (#4F46E5)
  Checkmark animation
```

**Hover/Press State:**
```
  Scale: 1.02
  Shadow: Subtle elevation
  Haptic feedback: Light tap
```

---

### Animation Guidelines

**Selection Animation:**
1. Chip scales up (1.05) - 100ms
2. Border color changes - 150ms
3. Checkmark fades in - 100ms
4. Returns to normal scale - 100ms

**Total: 350ms** - Quick enough to feel responsive, slow enough to perceive

**Deselection Animation:**
1. Checkmark fades out - 100ms
2. Border returns to gray - 150ms
3. Background returns to white - 150ms

---

### Accessibility Considerations

**Touch Targets:**
- Minimum 48px x 48px (WCAG 2.1 AA)
- Recommended 56px x 56px for primary actions
- 8px minimum spacing between targets

**Color Contrast:**
- All text must meet 4.5:1 contrast ratio
- Selected state must not rely on color alone
- Use icon + color + border for selection indication

**Screen Reader Support:**
- Each chip is a button with aria-pressed state
- "Tap Repair, starting from 500 Kenyan Shillings, not selected"
- On selection: "Tap Repair, selected"

**Keyboard Navigation:**
- Tab to navigate between chips
- Enter/Space to select
- Arrow keys for grid navigation
- Escape to deselect all

---

## Data Model for WORD BANK

### Service Definition Schema

```typescript
interface ServiceDefinition {
  id: string;
  name: string;
  nameSw: string; // Swahili translation
  category: ServiceCategory;
  icon: string; // Icon identifier or URL
  image?: string; // Optional representative image
  description?: string;
  isPreset: boolean; // true = platform-defined, false = technician-defined
  createdBy?: string; // technician ID if custom
  pricing: {
    min: number;
    max: number;
    currency: 'KES';
    type: 'fixed' | 'range' | 'hourly' | 'per_unit';
    unitLabel?: string; // e.g., "per tap", "per socket"
  };
  tags: string[]; // For search
  popularity: number; // Booking count
  avgRating: number;
  technicianCount: number; // How many offer this
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceCategory {
  id: string;
  name: string;
  nameSw: string;
  icon: string;
  color: string; // Theme color for category
  order: number; // Display order
}
```

### Technician Service Offering

```typescript
interface TechnicianServiceOffering {
  technicianId: string;
  serviceId: string;
  customPrice?: {
    min: number;
    max: number;
  };
  description?: string; // Technician-specific notes
  images?: string[]; // Example work photos
  isAvailable: boolean;
  responseTime: number; // Average in minutes
  completedJobs: number;
  rating: number;
}
```

---

## Backend Requirements

### API Endpoints Needed

**1. Get Services by Category**
```
GET /api/services?category=plumbing&location=nairobi
Response: {
  popular: ServiceDefinition[],
  specialized: ServiceDefinition[],
  custom: ServiceDefinition[]
}
```

**2. Create Custom Service (Technician)**
```
POST /api/technicians/:id/services
Body: {
  name: string,
  category: string,
  description?: string,
  pricing: {...},
  images?: string[]
}
```

**3. Get Technician Services**
```
GET /api/technicians/:id/services
Response: TechnicianServiceOffering[]
```

**4. Search Services**
```
GET /api/services/search?q=leak&category=plumbing
Response: ServiceDefinition[]
```

**5. Get Service Pricing**
```
GET /api/services/:id/pricing?location=nairobi
Response: {
  min: number,
  max: number,
  technicians: number,
  avgRating: number
}
```

---

## Implementation Phases

### Phase 1: Core WORD BANK (2 weeks)
- Visual category grid
- Service chip display
- Selection state management
- Basic search

### Phase 2: Custom Services (2 weeks)
- Technician service creation flow
- Custom service approval process
- Service management dashboard
- Pricing flexibility

### Phase 3: Enhanced Features (2 weeks)
- Photo-based service detection
- Voice input for service search
- Service recommendations
- Popularity-based sorting

### Phase 4: Analytics & Optimization (1 week)
- Track selection patterns
- A/B test chip layouts
- Optimize for conversion
- Performance monitoring

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to find service | 3+ minutes | < 1 minute |
| Service selection rate | Unknown | > 80% |
| Custom service adoption | 0% | > 30% of technicians |
| Search abandonment | Unknown | < 15% |
| Booking conversion from WORD BANK | N/A | > 60% |

---

*The WORD BANK concept transforms service discovery from a text-based search into a visual, browsable catalog experience.*
