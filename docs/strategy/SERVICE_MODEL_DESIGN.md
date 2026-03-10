# Dumuwaks Service Model Design

## "WORD BANK" Service Discovery System

---

## Document Information
- **Version**: 1.0
- **Date**: February 2026
- **Status**: Strategic Design
- **Author**: Strategic Planning Agent

---

## Executive Summary

This document outlines the "WORD BANK" service model - an innovative approach to service discovery that presents services as selectable keywords in an intuitive, visual format. This model addresses the challenge of service discovery in a marketplace with 99+ service types across 12 categories, making it easy for customers to find services while allowing technicians to define their unique offerings.

---

## Part 1: WORD BANK Concept Overview

### 1.1 What is the WORD BANK?

The WORD BANK is a **visual service selector** that presents all available services as selectable "word chips" or "tags" in an organized, browsable format. Rather than navigating through complex category hierarchies, users can:

1. **Browse** all available services at a glance
2. **Select** multiple services they need
3. **Discover** related services they hadn't considered
4. **Customize** by adding services not in the standard list

### 1.2 Design Philosophy

| Principle | Implementation |
|-----------|----------------|
| **Visual First** | Services displayed as visual word chips, not dropdowns |
| **CAPS LOCK Standard** | All service names in UPPERCASE for visual consistency |
| **Instant Discovery** | No deep navigation - everything visible at once |
| **Flexible Expansion** | Technicians can add custom services |
| **Smart Grouping** | Related services cluster together visually |

### 1.3 User Experience Goals

**For Customers**:
- See ALL available services at once
- Select multiple services for complex jobs
- Discover related services easily
- Understand service scope quickly

**For Technicians**:
- Define their service offerings clearly
- Add custom/niche services they specialize in
- Stand out with unique service combinations
- Easy profile completion

---

## Part 2: Service Category Architecture

### 2.1 Primary Categories (12 Categories)

```
+------------------+------------------+------------------+
|  PLUMBING        |  ELECTRICAL      |  CARPENTRY       |
+------------------+------------------+------------------+
|  MASONRY         |  PAINTING        |  HVAC            |
+------------------+------------------+------------------+
|  WELDING         |  AUTO REPAIR     |  APPLIANCE       |
+------------------+------------------+------------------+
|  CLEANING        |  LANDSCAPING     |  SECURITY        |
+------------------+------------------+------------------+
```

### 2.2 Complete Service WORD BANK

#### PLUMBING SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| PLB-001 | PIPE REPAIR | Fixing leaking or broken pipes | 1-2 hours |
| PLB-002 | TAP INSTALLATION | Installing new taps/faucets | 30-60 min |
| PLB-003 | TAP REPAIR | Fixing dripping or faulty taps | 30 min |
| PLB-004 | TOILET REPAIR | Fixing toilet mechanisms | 1-2 hours |
| PLB-005 | TOILET INSTALLATION | New toilet fitting | 2-3 hours |
| PLB-006 | DRAIN CLEANING | Unclogging drains | 1-2 hours |
| PLB-007 | WATER HEATER INSTALL | Geyser installation | 2-3 hours |
| PLB-008 | WATER HEATER REPAIR | Geyser troubleshooting | 1-2 hours |
| PLB-009 | BOREHOLE PUMP | Pump installation/repair | 3-4 hours |
| PLB-010 | WATER TANK INSTALL | Tank mounting and piping | 2-4 hours |
| PLB-011 | SEPTIC TANK | Cleaning and maintenance | 2-3 hours |
| PLB-012 | BATHROOM FITOUT | Complete bathroom installation | 1-2 days |
| PLB-013 | KITCHEN SINK | Installation and repairs | 1-2 hours |
| PLB-014 | WATER METER | Installation and testing | 1 hour |
| PLB-015 | LEAK DETECTION | Finding hidden leaks | 1-2 hours |
| PLB-CUS | CUSTOM PLUMBING | User-defined plumbing service | Variable |

#### ELECTRICAL SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| ELE-001 | WIRING INSTALLATION | New electrical wiring | Half day+ |
| ELE-002 | WIRING REPAIR | Fixing faulty wiring | 1-3 hours |
| ELE-003 | SOCKET INSTALLATION | Adding new power points | 1 hour |
| ELE-004 | SWITCH REPAIR | Fixing faulty switches | 30 min |
| ELE-005 | LIGHTING INSTALL | Light fixture mounting | 1-2 hours |
| ELE-006 | CEILING FAN | Fan installation/repair | 1-2 hours |
| ELE-007 | DB BOARD | Distribution board work | 2-4 hours |
| ELE-008 | EARTH SYSTEM | Grounding installation | 2-3 hours |
| ELE-009 | SURGE PROTECTION | Lightning/surge protectors | 1-2 hours |
| ELE-010 | GENERATOR INSTALL | Backup generator setup | 4+ hours |
| ELE-011 | SOLAR PANEL | Solar installation | 1-2 days |
| ELE-012 | INVERTER SETUP | Power backup systems | 2-4 hours |
| ELE-013 | CCTV WIRING | Security camera setup | 3-4 hours |
| ELE-014 | INTERCOM | Installation and repair | 2-3 hours |
| ELE-015 | ELECTRIC FENCE | Perimeter security | 1 day+ |
| ELE-CUS | CUSTOM ELECTRICAL | User-defined electrical service | Variable |

#### CARPENTRY SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| CRP-001 | DOOR INSTALLATION | Hanging new doors | 1-2 hours |
| CRP-002 | DOOR REPAIR | Fixing door issues | 1 hour |
| CRP-003 | WINDOW FRAME | Frame installation/repair | 2-3 hours |
| CRP-004 | FLOORING | Wood floor installation | 1-2 days |
| CRP-005 | CABINET MAKING | Custom cabinets | 2-5 days |
| CRP-006 | KITCHEN FITOUT | Complete kitchen fitting | 3-5 days |
| CRP-007 | WARDROBE | Built-in wardrobes | 1-2 days |
| CRP-008 | FURNITURE REPAIR | Restoring furniture | 2-4 hours |
| CRP-009 | SHELVING | Shelf installation | 1-2 hours |
| CRP-010 | DECKING | Outdoor deck construction | 2-3 days |
| CRP-011 | PARTITION | Room partitions | 1-2 days |
| CRP-012 | CEILING | Drop ceiling installation | 1-2 days |
| CRP-013 | FENCE (WOODEN) | Wooden fencing | 1-2 days |
| CRP-014 | GATES (WOODEN) | Wooden gate construction | 1 day |
| CRP-015 | CUSTOM FURNITURE | Bespoke furniture making | Variable |
| CRP-CUS | CUSTOM CARPENTRY | User-defined carpentry service | Variable |

#### MASONRY SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| MSN-001 | WALL CONSTRUCTION | Building walls | 1-3 days |
| MSN-002 | WALL REPAIR | Fixing damaged walls | 2-4 hours |
| MSN-003 | FOUNDATION | Foundation work | 3-7 days |
| MSN-004 | FLOOR TILING | Tile installation | 1-2 days |
| MSN-005 | WALL TILING | Wall tiling | 1-2 days |
| MSN-006 | PLASTERING | Wall plastering | 1-2 days |
| MSN-007 | PAVING | Outdoor paving | 1-3 days |
| MSN-008 | BRICKWORK | Brick construction | 2-5 days |
| MSN-009 | STONE WORK | Stone masonry | 2-5 days |
| MSN-010 | CHIMNEY | Chimney construction/repair | 1-2 days |
| MSN-011 | RETAINING WALL | Structural walls | 2-4 days |
| MSN-012 | WATERPROOFING | Damp proofing | 1-2 days |
| MSN-013 | CONCRETE WORK | Slabs, driveways | 1-3 days |
| MSN-014 | BOUNDARY WALL | Perimeter walls | 3-7 days |
| MSN-015 | RESTORATION | Building restoration | Variable |
| MSN-CUS | CUSTOM MASONRY | User-defined masonry service | Variable |

#### PAINTING SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| PNT-001 | INTERIOR PAINTING | Indoor walls and ceilings | 1-3 days |
| PNT-002 | EXTERIOR PAINTING | Outdoor walls | 2-4 days |
| PNT-003 | ROOF PAINTING | Roof coating | 1-2 days |
| PNT-004 | FENCE PAINTING | Metal/wood fence painting | 1 day |
| PNT-005 | FURNITURE PAINTING | Refinishing furniture | 1-2 days |
| PNT-006 | WALLPAPER | Installation and removal | 1-2 days |
| PNT-007 | TEXTURE COATING | Textured finishes | 1-2 days |
| PNT-008 | WATERPROOF COAT | Waterproof painting | 1 day |
| PNT-009 | STAINING | Wood staining | 1 day |
| PNT-010 | VARNISHING | Wood varnishing | 1 day |
| PNT-011 | SPRAY PAINTING | Industrial spraying | Variable |
| PNT-012 | SIGNAGE | Sign painting | 2-4 hours |
| PNT-013 | DECORATIVE | Murals, decorative work | Variable |
| PNT-014 | TOUCH-UP | Minor paint repairs | 1-2 hours |
| PNT-015 | PRIMING | Surface preparation | 1 day |
| PNT-CUS | CUSTOM PAINTING | User-defined painting service | Variable |

#### HVAC (HEATING, VENTILATION, AIR CONDITIONING)

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| HVAC-001 | AC INSTALLATION | Air conditioner mounting | 2-4 hours |
| HVAC-002 | AC REPAIR | Air conditioner repair | 1-2 hours |
| HVAC-003 | AC SERVICING | Maintenance and cleaning | 1-2 hours |
| HVAC-004 | AC GAS REFILL | Refrigerant recharge | 1 hour |
| HVAC-005 | AC DUCTING | Duct installation | 1-2 days |
| HVAC-006 | VENTILATION | Vent system installation | 1-2 days |
| HVAC-007 | EXHAUST FAN | Fan installation | 1-2 hours |
| HVAC-008 | HEATER INSTALL | Room heater setup | 1-2 hours |
| HVAC-009 | HEATER REPAIR | Heater troubleshooting | 1-2 hours |
| HVAC-010 | THERMOSTAT | Thermostat installation | 1 hour |
| HVAC-011 | INSULATION | Thermal insulation | 1-2 days |
| HVAC-012 | CHILLER | Commercial cooling | Variable |
| HVAC-013 | REFRIGERATION | Fridge/freezer repair | 1-2 hours |
| HVAC-014 | COLD ROOM | Cold room installation | 2-5 days |
| HVAC-015 | AIR PURIFICATION | Air quality systems | 2-4 hours |
| HVAC-CUS | CUSTOM HVAC | User-defined HVAC service | Variable |

#### WELDING SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| WLD-001 | GATE FABRICATION | Metal gate construction | 1-3 days |
| WLD-002 | GATE REPAIR | Gate repairs | 2-4 hours |
| WLD-003 | FENCE FABRICATION | Metal fencing | 1-3 days |
| WLD-004 | GRILL WORK | Window/door grills | 1-2 days |
| WLD-005 | STEEL DOOR | Metal door fabrication | 1-2 days |
| WLD-006 | RAILINGS | Staircase railings | 1-2 days |
| WLD-007 | STEEL STRUCTURE | Structural steel work | Variable |
| WLD-008 | TRAILER REPAIR | Trailer welding | 2-4 hours |
| WLD-009 | VEHICLE WELDING | Automotive welding | 2-4 hours |
| WLD-010 | TANK FABRICATION | Metal tanks | 1-2 days |
| WLD-011 | STAINLESS WORK | Stainless steel fabrication | Variable |
| WLD-012 | ALUMINUM WORK | Aluminum welding | Variable |
| WLD-013 | PIPE WELDING | Industrial pipe work | Variable |
| WLD-014 | ARTISTIC METAL | Decorative metalwork | Variable |
| WLD-015 | MACHINE REPAIR | Equipment welding repair | Variable |
| WLD-CUS | CUSTOM WELDING | User-defined welding service | Variable |

#### AUTO REPAIR SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| AUTO-001 | ENGINE REPAIR | Engine diagnostics/repair | Variable |
| AUTO-002 | OIL CHANGE | Oil and filter change | 30-60 min |
| AUTO-003 | BRAKE SERVICE | Brake pads/discs | 1-2 hours |
| AUTO-004 | CLUTCH REPAIR | Clutch replacement | 3-5 hours |
| AUTO-005 | GEARBOX | Transmission work | 4+ hours |
| AUTO-006 | SUSPENSION | Shock absorbers/suspension | 2-4 hours |
| AUTO-007 | TYRE SERVICE | Tire fitting/puncture | 30-60 min |
| AUTO-008 | BATTERY | Battery replacement | 30 min |
| AUTO-009 | ELECTRICAL | Auto electrical | 1-3 hours |
| AUTO-010 | AC SERVICE | Car air conditioning | 1-2 hours |
| AUTO-011 | EXHAUST | Exhaust system repair | 1-2 hours |
| AUTO-012 | RADIATOR | Cooling system | 1-2 hours |
| AUTO-013 | BODY WORK | Panel beating | Variable |
| AUTO-014 | SPRAY PAINTING | Car respraying | 1-3 days |
| AUTO-015 | TUNING | Engine tuning | 2-4 hours |
| AUTO-CUS | CUSTOM AUTO | User-defined auto service | Variable |

#### APPLIANCE REPAIR

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| APP-001 | WASHING MACHINE | Washer repair | 1-2 hours |
| APP-002 | DRYER | Dryer repair | 1-2 hours |
| APP-003 | DISHWASHER | Dishwasher repair | 1-2 hours |
| APP-004 | REFRIGERATOR | Fridge repair | 1-2 hours |
| APP-005 | FREEZER | Freezer repair | 1-2 hours |
| APP-006 | COOKER | Stove/oven repair | 1-2 hours |
| APP-007 | MICROWAVE | Microwave repair | 1 hour |
| APP-008 | BLENDER | Small appliance repair | 30 min |
| APP-009 | IRON | Iron repair | 30 min |
| APP-010 | KETTLE | Kettle repair | 30 min |
| APP-011 | TOASTER | Toaster repair | 30 min |
| APP-012 | TV REPAIR | Television repair | 1-2 hours |
| APP-013 | COMPUTER | PC/laptop repair | Variable |
| APP-014 | PRINTER | Printer repair | 1 hour |
| APP-015 | WATER DISPENSER | Dispenser repair | 1 hour |
| APP-CUS | CUSTOM APPLIANCE | User-defined appliance service | Variable |

#### CLEANING SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| CLN-001 | DEEP CLEANING | Thorough home cleaning | 4-8 hours |
| CLN-002 | MOVE-IN CLEAN | Pre-occupancy cleaning | 4-6 hours |
| CLN-003 | MOVE-OUT CLEAN | End of tenancy cleaning | 4-6 hours |
| CLN-004 | CARPET CLEANING | Carpet shampooing | 2-4 hours |
| CLN-005 | UPHOLSTERY | Furniture cleaning | 2-4 hours |
| CLN-006 | WINDOW CLEANING | Glass cleaning | 2-4 hours |
| CLN-007 | POST-CONSTRUCTION | After building cleanup | 1-2 days |
| CLN-008 | OFFICE CLEANING | Commercial cleaning | Variable |
| CLN-009 | FLOOR POLISHING | Floor buffing/polishing | 2-4 hours |
| CLN-010 | GARDEN CLEANUP | Yard clearing | 2-4 hours |
| CLN-011 | GUTTER CLEANING | Gutter clearing | 1-2 hours |
| CLN-012 | MATTRESS CLEANING | Mattress sanitization | 1 hour |
| CLN-013 | PRESSURE WASHING | Power washing | 2-4 hours |
| CLN-014 | MOLD REMOVAL | Mold treatment | 2-4 hours |
| CLN-015 | PEST CONTROL | Insect/rodent control | 2-4 hours |
| CLN-CUS | CUSTOM CLEANING | User-defined cleaning service | Variable |

#### LANDSCAPING SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| LDN-001 | LAWN MOWING | Grass cutting | 1-2 hours |
| LDN-002 | GARDEN DESIGN | Landscape planning | Variable |
| LDN-003 | PLANTING | Tree/shrub planting | 2-4 hours |
| LDN-004 | IRRIGATION | Sprinkler systems | 1-2 days |
| LDN-005 | HEDGE TRIMMING | Hedge maintenance | 1-2 hours |
| LDN-006 | TREE PRUNING | Tree cutting/shaping | 2-4 hours |
| LDN-007 | TREE REMOVAL | Tree felling | 2-6 hours |
| LDN-008 | TURF INSTALLATION | Lawn installation | 1-2 days |
| LDN-009 | FLOWER BEDS | Flower garden creation | 2-4 hours |
| LDN-010 | COMPOSTING | Compost setup | 1-2 hours |
| LDN-011 | OUTDOOR LIGHTING | Garden lighting | 1-2 days |
| LDN-012 | WATER FEATURES | Fountains/ponds | 1-3 days |
| LDN-013 | RETAINING WALLS | Garden walls | 1-3 days |
| LDN-014 | PATIO CONSTRUCTION | Patio/deck building | 1-3 days |
| LDN-015 | FENCING | Garden fencing | 1-2 days |
| LDN-CUS | CUSTOM LANDSCAPE | User-defined landscape service | Variable |

#### SECURITY SERVICES

| Service Code | Display Name | Description | Avg. Duration |
|--------------|--------------|-------------|---------------|
| SEC-001 | ALARM SYSTEM | Burglar alarm installation | 2-4 hours |
| SEC-002 | CCTV INSTALLATION | Security cameras | 3-6 hours |
| SEC-003 | ACCESS CONTROL | Entry systems | 1-2 days |
| SEC-004 | ELECTRIC FENCE | Perimeter security | 1-2 days |
| SEC-005 | SMART LOCK | Digital door locks | 1-2 hours |
| SEC-006 | VIDEO DOORBELL | Smart doorbell | 1-2 hours |
| SEC-007 | MOTION SENSORS | Movement detection | 1-2 hours |
| SEC-008 | SMOKE DETECTORS | Fire safety | 1-2 hours |
| SEC-009 | FIRE ALARM | Fire alarm system | 1-2 days |
| SEC-010 | INTERCOM SYSTEM | Communication system | 2-4 hours |
| SEC-011 | GATE AUTOMATION | Automatic gates | 1 day |
| SEC-012 | GARAGE DOOR | Garage door systems | 2-4 hours |
| SEC-013 | SAFE INSTALLATION | Wall/floor safes | 2-4 hours |
| SEC-014 | BOLLARDS | Security bollards | 1 day |
| SEC-015 | BARRIER SYSTEMS | Vehicle barriers | 1 day |
| SEC-CUS | CUSTOM SECURITY | User-defined security service | Variable |

### 2.3 Custom Service Category

| Service Code | Display Name | Description |
|--------------|--------------|-------------|
| CUS-000 | YOUR SERVICE | User-defined service |

---

## Part 3: WORD BANK UI Design Specifications

### 3.1 Visual Layout

#### Desktop View (1200px+)

```
+------------------------------------------------------------------+
|  [Logo]     Find Services     [Search Bar.........]     [Login]  |
+------------------------------------------------------------------+
|                                                                   |
|  What do you need help with?                                      |
|                                                                   |
|  +--[ Category Filter ]----------------------------------------+  |
|  |  [ALL] [PLUMBING] [ELECTRICAL] [CARPENTRY] [MORE...]       |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  +--[ Service WORD BANK ]-------------------------------------+  |
|  |                                                             |  |
|  |  [PIPE REPAIR] [TAP INSTALL] [WIRING] [SOCKET] [DOOR]     |  |
|  |  [TOILET FIX] [LIGHTING] [FAN] [FLOORING] [CABINET]       |  |
|  |  [DRAIN CLEAN] [DB BOARD] [SOLAR] [WINDOW] [KITCHEN]      |  |
|  |  [WATER HEATER] [INVERTER] [FURNITURE] [WALL] [TILING]    |  |
|  |                                                             |  |
|  |  -- Plumbing Services --                                    |  |
|  |  [PIPE REPAIR] [TAP INSTALL] [TAP REPAIR] [TOILET FIX]    |  |
|  |  [TOILET INSTALL] [DRAIN CLEAN] [WATER HEATER]            |  |
|  |                                                             |  |
|  |  -- Or Add Your Own --                                      |  |
|  |  [ + ADD CUSTOM SERVICE ]                                   |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  Selected: [PIPE REPAIR x] [TAP INSTALL x]                       |
|                                                                   |
|  [ CONTINUE TO BOOKING ]                                          |
|                                                                   |
+------------------------------------------------------------------+
```

#### Mobile View (375px)

```
+---------------------------+
|  [Logo]    [Menu] [Login] |
+---------------------------+
|  Find Services            |
|  [Search...........]      |
+---------------------------+
|  Categories:              |
|  [ALL v] [PLUMBING]       |
|  [ELECTRICAL] [MORE v]    |
+---------------------------+
|  Popular Services:        |
|                           |
|  [PIPE REPAIR]            |
|  [TAP INSTALL]            |
|  [WIRING]                 |
|  [SOCKET]                 |
|                           |
|  [ + ADD CUSTOM ]         |
+---------------------------+
|  Selected (2):            |
|  [PIPE REPAIR x]          |
|  [TAP INSTALL x]          |
+---------------------------+
|  [ CONTINUE ]             |
+---------------------------+
```

### 3.2 Service Chip Design Specifications

#### Default State

```css
.service-chip {
  /* Layout */
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  margin: 4px;

  /* Shape */
  border-radius: 20px;

  /* Colors */
  background: var(--dw-charcoal);
  border: 1px solid var(--dw-border-subtle);
  color: var(--dw-text-primary);

  /* Typography */
  font-family: var(--dw-font-family-base);
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  /* Interaction */
  cursor: pointer;
  transition: all 0.2s ease;
}
```

#### Selected State

```css
.service-chip.selected {
  background: var(--dw-circuit);
  border-color: var(--dw-circuit);
  color: white;
  box-shadow: var(--dw-shadow-led);
}
```

#### Hover State

```css
.service-chip:hover:not(.selected) {
  border-color: var(--dw-circuit);
  background: rgba(0, 144, 197, 0.1);
}
```

### 3.3 Category Color Coding

| Category | Primary Color | Chip Background (Selected) |
|----------|---------------|---------------------------|
| PLUMBING | #0090C5 (Circuit Blue) | #0090C5 |
| ELECTRICAL | #FFB800 (Amber) | #FFB800 |
| CARPENTRY | #8B5A2B (Wood Brown) | #8B5A2B |
| MASONRY | #808080 (Stone Grey) | #808080 |
| PAINTING | #E91E63 (Pink) | #E91E63 |
| HVAC | #00BCD4 (Cyan) | #00BCD4 |
| WELDING | #FF5722 (Deep Orange) | #FF5722 |
| AUTO REPAIR | #4CAF50 (Green) | #4CAF50 |
| APPLIANCE | #9C27B0 (Purple) | #9C27B0 |
| CLEANING | #2196F3 (Blue) | #2196F3 |
| LANDSCAPING | #4CAF50 (Green) | #4CAF50 |
| SECURITY | #F44336 (Red) | #F44336 |
| CUSTOM | #7D4E9F (Wrench Purple) | #7D4E9F |

---

## Part 4: User-Defined Service Workflow

### 4.1 Customer Adding Custom Service

**Flow**:

```
1. User clicks [ + ADD CUSTOM SERVICE ]
   |
   v
2. Modal opens with form:
   +------------------------------------------+
   |  Add Your Service                         |
   +------------------------------------------+
   |  Service Name: [___________________]      |
   |  (e.g., "SOLAR PANEL CLEANING")           |
   |                                          |
   |  Category:    [Select Category v]         |
   |                                          |
   |  Description: [___________________]       |
   |              [___________________]        |
   |              (Optional)                   |
   |                                          |
   |  [ CANCEL ]         [ ADD SERVICE ]       |
   +------------------------------------------+
   |
   v
3. Service added to selection with "CUSTOM" badge
   [SOLAR PANEL CLEANING *] (with asterisk for custom)
```

### 4.2 Technician Adding Services to Profile

**Flow**:

```
1. Technician navigates to Profile > Services
   |
   v
2. Service selection interface:
   +------------------------------------------+
   |  What services do you offer?              |
   +------------------------------------------+
   |  [Search services...]                     |
   |                                          |
   |  -- Your Selected Services (5/20) --      |
   |  [PIPE REPAIR x] [TAP INSTALL x]          |
   |  [WIRING x] [SOCKET x] [LIGHTING x]       |
   |                                          |
   |  -- Suggested Based on Your Skills --     |
   |  [DB BOARD] [SWITCH REPAIR] [FAN]         |
   |                                          |
   |  -- Browse All Categories --              |
   |  [Plumbing v] [Electrical v] [Carpentry v]|
   |                                          |
   |  [ + ADD CUSTOM SERVICE ]                 |
   +------------------------------------------+
   |
   v
3. Custom service form (for technicians):
   +------------------------------------------+
   |  Add Custom Service                       |
   +------------------------------------------+
   |  Service Name: [___________________]      |
   |                                          |
   |  Category:    [Select Category v]         |
   |                                          |
   |  Description: [___________________]       |
   |              [___________________]        |
   |                                          |
   |  Your Rate:                               |
   |  KES [____]/[hour v]                      |
   |                                          |
   |  Experience:                              |
   |  [__] years in this service               |
   |                                          |
   |  [ CANCEL ]         [ ADD SERVICE ]       |
   +------------------------------------------+
```

### 4.3 Custom Service Approval Flow

```
Technician Adds Custom Service
   |
   v
System Checks:
   - Is this similar to existing service?
   - Is it appropriate?
   - Is it clear?
   |
   +-- Auto-approve if:
   |    - Unique and clear
   |    - No policy violations
   |    - Category-appropriate
   |
   +-- Flag for review if:
        - Potentially inappropriate
        - Unclear description
        - Potential trademark issue
```

---

## Part 5: Visual Representation Concepts

### 5.1 Pictorial Service Icons

Each primary service should have an associated icon for quick recognition:

| Service | Icon Concept | SVG Path (Conceptual) |
|---------|--------------|----------------------|
| PIPE REPAIR | Wrench on pipe | Tool icon |
| TAP INSTALL | Faucet | Water tap |
| WIRING | Cable/electric bolt | Lightning |
| SOCKET | Power outlet | Plug shape |
| DOOR | Door frame | Rectangle with hinge |
| FLOORING | Floor boards | Parallel lines |
| WALL | Brick pattern | Rectangle grid |
| PAINTING | Paint roller | Roller shape |
| AC | Air conditioner unit | Box with vents |
| GATE | Metal gate | Grid pattern |

### 5.2 Service Card Display

When displaying services in search results or technician profiles:

```
+----------------------------------+
|  [Icon]  PIPE REPAIR             |
|          Fix leaking pipes,      |
|          install new piping      |
|          From KES 1,500/hr       |
+----------------------------------+
```

### 5.3 Service Grouping Visualization

```
+--------------------------------------------------+
|  PLUMBING SERVICES                               |
|  =================================================|
|                                                  |
|  [Main Services]                                 |
|  [PIPE REPAIR] [DRAIN CLEAN] [LEAK DETECTION]   |
|                                                  |
|  [Installations]                                 |
|  [TAP INSTALL] [TOILET INSTALL] [WATER HEATER]  |
|                                                  |
|  [Maintenance]                                   |
|  [TAP REPAIR] [TOILET REPAIR] [SEPTIC TANK]     |
|                                                  |
+--------------------------------------------------+
```

---

## Part 6: Pricing Transparency Design

### 6.1 Service Price Display

**On Service Selection**:

```
+------------------------------------------+
|  PIPE REPAIR                             |
|  Avg. KES 1,500 - 3,000                  |
|  Based on 234 bookings                   |
+------------------------------------------+
```

**In Booking Summary**:

```
+------------------------------------------+
|  SERVICE BREAKDOWN                        |
+------------------------------------------+
|  PIPE REPAIR                              |
|  Estimated: 1-2 hours                     |
|  Rate: KES 2,000/hour                     |
|  Estimated Total: KES 2,000 - 4,000       |
|                                          |
|  + Platform Fee (15%): KES 300 - 600      |
|  + Booking Fee (20%): KES 400 - 800       |
|  --------------------------------------   |
|  Total Estimate: KES 2,700 - 5,400        |
+------------------------------------------+
```

### 6.2 Dynamic Pricing Indicators

```
[PIPE REPAIR] -- Standard Rate
[PIPE REPAIR] 🔥 -- High Demand (+20%)
[PIPE REPAIR] ⚡ -- Urgent (+50%)
[PIPE REPAIR] 🌙 -- After Hours (+25%)
```

---

## Part 7: Technical Implementation Considerations

### 7.1 Data Model for Services

```typescript
interface Service {
  _id: string;
  code: string;           // e.g., "PLB-001"
  name: string;           // e.g., "PIPE REPAIR"
  displayName: string;    // e.g., "PIPE REPAIR"
  category: string;       // e.g., "plumbing"
  description: string;
  icon?: string;          // Icon URL or identifier
  avgDuration: {          // Average duration
    min: number;
    max: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  priceRange?: {          // Optional platform-wide price range
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
  isCustom: boolean;      // User-defined vs platform-defined
  createdBy?: string;     // User ID if custom
  popularity: number;     // For sorting
  relatedServices: string[]; // Array of service IDs
  createdAt: Date;
  updatedAt: Date;
}

interface TechnicianService extends Service {
  technicianId: string;
  customRate?: {
    amount: number;
    unit: 'hour' | 'job' | 'day';
  };
  yearsExperience: number;
  isVerified: boolean;
  lastPerformed?: Date;
  jobsCompleted: number;
}
```

### 7.2 API Endpoints

```
GET  /api/v1/services                    # List all services
GET  /api/v1/services/categories         # List categories
GET  /api/v1/services/:category          # Services by category
GET  /api/v1/services/search?q=pipe      # Search services
POST /api/v1/services/custom             # Add custom service (customer)
GET  /api/v1/technicians/:id/services    # Technician's services
POST /api/v1/technicians/:id/services    # Add service to profile
PUT  /api/v1/technicians/:id/services/:serviceId  # Update service rate
DELETE /api/v1/technicians/:id/services/:serviceId # Remove service
```

### 7.3 Search and Filtering

```javascript
// Service search query
const searchServices = async (query, options = {}) => {
  const params = new URLSearchParams({
    q: query,
    category: options.category || '',
    limit: options.limit || 20,
    includeCustom: options.includeCustom || true
  });

  return fetch(`/api/v1/services/search?${params}`);
};
```

---

## Part 8: Implementation Roadmap

### Phase 1: Core WORD BANK (Weeks 1-3)

| Week | Deliverable |
|------|-------------|
| 1 | Service data model and API |
| 2 | WORD BANK UI component |
| 3 | Category filtering and search |

### Phase 2: Technician Integration (Weeks 4-5)

| Week | Deliverable |
|------|-------------|
| 4 | Technician service selection in profile |
| 5 | Custom service creation for technicians |

### Phase 3: Customer Features (Weeks 6-7)

| Week | Deliverable |
|------|-------------|
| 6 | Customer custom service requests |
| 7 | Service recommendation engine |

### Phase 4: Enhancement (Weeks 8-10)

| Week | Deliverable |
|------|-------------|
| 8 | Service icons and pictorial representation |
| 9 | Pricing transparency display |
| 10 | Analytics and optimization |

---

## Conclusion

The WORD BANK service model transforms service discovery from a complex hierarchical navigation into an intuitive, visual selection experience. By presenting services as selectable tags with:

- Clear visual hierarchy
- Category-based organization
- Custom service flexibility
- Transparent pricing

This model serves both customers (easy discovery) and technicians (flexible service definition) while positioning the platform as an industry-wide solution rather than a niche service.

**Next Steps**:
1. Finalize service taxonomy
2. Design and build WORD BANK UI component
3. Implement service selection in technician onboarding
4. Create custom service moderation workflow
5. Integrate with booking flow

---

*End of Service Model Design Document*
