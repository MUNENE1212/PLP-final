# Service Discovery UX Design - WORD BANK Concept

## Overview

This document details the "WORD BANK" service discovery concept for Dumuwaks, designed to create a seamless, visual, and action-oriented way for customers to find and select services.

---

## Concept Definition

### What is the WORD BANK?

The WORD BANK is a visual, grid-based service selection interface where services are presented as bold, uppercase, easily scannable options. Instead of dropdown menus or long lists, users see a "bank" of services they can quickly tap to select.

### Design Philosophy

1. **Visual First**: Pictures speak louder than words
2. **CAPS LOCK Display**: Bold, uppercase text for instant recognition
3. **One Tap Selection**: No nested menus
4. **Progressive Disclosure**: Show more as needed
5. **Mobile Optimized**: Large touch targets, minimal text entry

---

## Service Discovery Architecture

### Level 1: Category Grid (Home Screen)

```
+------------------------------------------+
| DUMUWAKS                        [Menu]   |
+------------------------------------------+
|                                          |
|     What do you need fixed today?        |
|                                          |
|  +------------------------------------+  |
|  |  [Search services...]          Q]  |  |
|  +------------------------------------+  |
|                                          |
|  POPULAR SERVICES                        |
|                                          |
|  +-----------+  +-----------+            |
|  |  [IMAGE]  |  |  [IMAGE]  |            |
|  |           |  |           |            |
|  | PLUMBING  |  |ELECTRICAL |            |
|  |           |  |           |            |
|  +-----------+  +-----------+            |
|                                          |
|  +-----------+  +-----------+            |
|  |  [IMAGE]  |  |  [IMAGE]  |            |
|  |           |  |           |            |
|  | CLEANING  |  |CARPENTRY  |            |
|  |           |  |           |            |
|  +-----------+  +-----------+            |
|                                          |
|  +-----------+  +-----------+            |
|  |  [IMAGE]  |  |  [IMAGE]  |            |
|  |           |  |           |            |
|  | PAINTING  |  | APPLIANCE |            |
|  |           |  |  REPAIR   |            |
|  +-----------+  +-----------+            |
|                                          |
|  [+ VIEW ALL 16 CATEGORIES]              |
|                                          |
+------------------------------------------+
| [Home]  [Bookings]  [Messages]  [Profile]|
+------------------------------------------+
```

### Category Card Specifications

```yaml
Category Card:
  size: "50% width (2 per row on mobile)"
  min_height: "140px"
  image_height: "80px"
  border_radius: "12px"
  shadow: "0 2px 8px rgba(0,0,0,0.1)"

  States:
    default:
      background: "#FFFFFF"
      text_color: "#1A1A1A"
    pressed:
      background: "#F5F5F5"
      transform: "scale(0.98)"
    selected:
      border: "2px solid #0066CC"
      background: "#E6F2FF"
```

### All Service Categories (Visual Representation)

```
+------------------------------------------+
|           ALL SERVICES                   |
+------------------------------------------+
|                                          |
|  HOME MAINTENANCE                        |
|  +-----------+  +-----------+            |
|  |  [WRENCH] |  |  [BOLT]   |            |
|  | PLUMBING  |  |ELECTRICAL |            |
|  +-----------+  +-----------+            |
|  +-----------+  +-----------+            |
|  |  [WOOD]   |  |  [PAINT]  |            |
|  |CARPENTRY  |  | PAINTING  |            |
|  +-----------+  +-----------+            |
|  +-----------+  +-----------+            |
|  |  [ROOF]   |  |  [FLOOR]  |            |
|  |  ROOFING  |  | FLOORING  |            |
|  +-----------+  +-----------+            |
|                                          |
|  CLEANING & PEST                         |
|  +-----------+  +-----------+            |
|  | [SPARKLE] |  |   [BUG]   |            |
|  | CLEANING  |  |PEST CTRL  |            |
|  +-----------+  +-----------+            |
|                                          |
|  APPLIANCES & HVAC                       |
|  +-----------+  +-----------+            |
|  | [FRIDGE]  |  |  [SNOW]   |            |
|  | APPLIANCE |  |   HVAC    |            |
|  +-----------+  +-----------+            |
|                                          |
|  SECURITY & OUTDOOR                      |
|  +-----------+  +-----------+            |
|  |  [LOCK]   |  |  [TREE]   |            |
|  |LOCKSMITH  |  |LANDSCAPE  |            |
|  +-----------+  +-----------+            |
|                                          |
|  SPECIALTY SERVICES                      |
|  +-----------+  +-----------+            |
|  | [BRICK]   |  |  [FIRE]   |            |
|  | MASONRY   |  |  WELDING  |            |
|  +-----------+  +-----------+            |
|  +-----------+                           |
|  |  [?]     |                           |
|  | GENERAL  |                           |
|  |HANDYMAN  |                           |
|  +-----------+                           |
|                                          |
+------------------------------------------+
```

---

## Level 2: Sub-Service Selection (WORD BANK)

After selecting a category, users see specific services as a WORD BANK:

```
+------------------------------------------+
| [<- Back]      PLUMBING                  |
+------------------------------------------+
|                                          |
|  What specifically do you need?          |
|                                          |
|  +----------+ +----------+ +----------+  |
|  |   PIPE   | |   TAP    | |  DRAIN   |  |
|  |  REPAIR  | |INSTALLAT-| | CLEANING |  |
|  |          | |   ION    | |          |  |
|  +----------+ +----------+ +----------+  |
|                                          |
|  +----------+ +----------+ +----------+  |
|  |  TOILET  | |  WATER   | |  BOILER  |  |
|  |  REPAIR  | |   TANK   | | SERVICE  |  |
|  |          | |          | |          |  |
|  +----------+ +----------+ +----------+  |
|                                          |
|  +----------+ +----------+ +----------+  |
|  |  SHOWER  | |   BATH   | |  WATER   |  |
|  |  REPAIR  | |  REPAIR  | | HEATER   |  |
|  |          | |          | |          |  |
|  +----------+ +----------+ +----------+  |
|                                          |
|  +----------+ +----------+               |
|  |  LEAK    | | SEPTIC   |               |
|  |DETECTION | |  TANK    |               |
|  |          | |          |               |
|  +----------+ +----------+               |
|                                          |
|  Service not listed?                     |
|  [+ DESCRIBE YOUR OWN]                   |
|                                          |
+------------------------------------------+
```

### WORD BANK Specifications

```yaml
Word Bank Item:
  size: "33% width (3 per row on mobile)"
  min_height: "90px"
  padding: "12px"
  border_radius: "8px"

  Typography:
    font_family: "Inter, system-ui, sans-serif"
    font_weight: "700"  # Bold
    text_transform: "uppercase"
    font_size: "14px"
    letter_spacing: "0.05em"

  States:
    default:
      background: "#F5F5F5"
      text_color: "#1A1A1A"
    pressed:
      background: "#E5E5E5"
    selected:
      background: "#0066CC"
      text_color: "#FFFFFF"
```

### Complete Service Hierarchy

```yaml
PLUMBING:
  - PIPE REPAIR
  - TAP INSTALLATION
  - DRAIN CLEANING
  - TOILET REPAIR
  - WATER TANK
  - BOILER SERVICE
  - SHOWER REPAIR
  - BATH REPAIR
  - WATER HEATER
  - LEAK DETECTION
  - SEPTIC TANK

ELECTRICAL:
  - WIRING
  - SOCKET INSTALLATION
  - LIGHT FIXTURE
  - SWITCH REPAIR
  - CIRCUIT BREAKER
  - FAN INSTALLATION
  - INVERTER SETUP
  - SOLAR PANEL
  - SECURITY LIGHTS
  - ELECTRIC FENCE

CARPENTRY:
  - FURNITURE REPAIR
  - DOOR INSTALLATION
  - WINDOW FRAME
  - CABINET MAKING
  - SHELF INSTALLATION
  - DECK BUILDING
  - FLOOR INSTALLATION
  - WOOD FLOORING
  - CUSTOM FURNITURE
  - WOOD RESTORATION

PAINTING:
  - INTERIOR PAINTING
  - EXTERIOR PAINTING
  - WALL REPAIR
  - CEILING PAINTING
  - FENCE PAINTING
  - ROOF PAINTING
  - DECORATIVE FINISH
  - WATERPROOFING
  - STAIN REMOVAL

CLEANING:
  - DEEP CLEANING
  - CARPET CLEANING
  - WINDOW CLEANING
  - UPHOLSTERY
  - POST-CONSTRUCTION
  - MOVE-IN/OUT
  - OFFICE CLEANING
  - MATTRESS CLEANING
  - GUTTER CLEANING

APPLIANCE REPAIR:
  - REFRIGERATOR
  - WASHING MACHINE
  - DRYER REPAIR
  - DISHWASHER
  - MICROWAVE
  - OVEN REPAIR
  - COOKER REPAIR
  - BLENDER REPAIR
  - IRON REPAIR

HVAC:
  - AC INSTALLATION
  - AC REPAIR
  - AC SERVICING
  - HEATER REPAIR
  - VENTILATION
  - DUCT CLEANING
  - THERMOSTAT
  - FAN INSTALLATION

LOCKSMITH:
  - LOCK INSTALLATION
  - LOCK REPAIR
  - KEY DUPLICATION
  - CAR LOCKOUT
  - HOME LOCKOUT
  - SAFE OPENING
  - SECURITY UPGRADE
  - DIGITAL LOCKS

LANDSCAPING:
  - LAWN MOWING
  - GARDEN DESIGN
  - TREE TRIMMING
  - HEDGE TRIMMING
  - IRRIGATION
  - FENCING
  - PAVING
  - COMPOSTING

ROOFING:
  - ROOF REPAIR
  - ROOF INSPECTION
  - GUTTER INSTALLATION
  - LEAK REPAIR
  - ROOF CLEANING
  - FLASHING REPAIR
  - ROOF VENTILATION

FLOORING:
  - TILE INSTALLATION
  - WOOD FLOORING
  - VINYL FLOORING
  - CARPET INSTALLATION
  - FLOOR REPAIR
  - GROUT CLEANING
  - FLOOR LEVELING

MASONRY:
  - WALL BUILDING
  - BRICK WORK
  - STONE WORK
  - PLASTERING
  - CONCRETE WORK
  - FOUNDATION
  - CHIMNEY REPAIR

WELDING:
  - GATE FABRICATION
  - RAILINGS
  - METAL REPAIR
  - FRAME WORK
  - WINDOW BARS
  - CUSTOM METALWORK

PEST CONTROL:
  - COCKROACH
  - TERMITES
  - RODENTS
  - BED BUGS
  - ANTS
  - FLEAS
  - MOSQUITOES
  - GENERAL FUMIGATION

GENERAL HANDYMAN:
  - SMALL REPAIRS
  - FURNITURE ASSEMBLY
  - HANGING ITEMS
  - MINOR PLUMBING
  - MINOR ELECTRICAL
  - GENERAL MAINTENANCE
```

---

## Level 3: Custom Service Definition

When a user's specific need isn't listed:

```
+------------------------------------------+
| [<- Back]   DESCRIBE YOUR NEED           |
+------------------------------------------+
|                                          |
|  Tell us what you need in your own words |
|                                          |
|  +------------------------------------+  |
|  |                                    |  |
|  | I need someone to fix my solar     |  |
|  | water heater that stopped working  |  |
|  | yesterday. It's making a strange   |  |
|  | noise and not heating water.       |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  Which category does this fit?           |
|                                          |
|  [PLUMBING] [ELECTRICAL] [APPLIANCE]     |
|                                          |
|  Add photos (helps technicians):         |
|  +----------+ +----------+               |
|  |  [PHOTO] | |    +]    |               |
|  |    1     | |  ADD     |               |
|  +----------+ +----------+               |
|                                          |
+------------------------------------------+
|                                          |
|  [CONTINUE ->]                           |
|                                          |
+------------------------------------------+
```

---

## Technician Service Definition

### How Technicians Define Their Services

Technicians use the same WORD BANK concept to select services they offer, with additional pricing options:

```
+------------------------------------------+
| [<- Back]   YOUR SERVICES                |
+------------------------------------------+
|                                          |
|  Tap services you offer:                 |
|                                          |
|  PLUMBING                                |
|  +----------+ +----------+ +----------+  |
|  | [X]      | | [X]      | | [ ]      |  |
|  |   PIPE   | |   TAP    | |  DRAIN   |  |
|  |  REPAIR  | |INSTALLAT-| | CLEANING |  |
|  | SELECTED | |   ION    | |          |  |
|  +----------+ +----------+ +----------+  |
|                                          |
+------------------------------------------+
|                                          |
|  SELECTED SERVICES (2)                   |
|  +------------------------------------+  |
|  | PIPE REPAIR                   [X]  |  |
|  | Pricing: [X] Hourly  [ ] Fixed     |  |
|  | Rate: KES [500] per hour           |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | TAP INSTALLATION              [X]  |  |
|  | Pricing: [ ] Hourly  [X] Per Item   |  |
|  | Rate: KES [800] per tap            |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
|                                          |
|  [SAVE SERVICES]                         |
|                                          |
+------------------------------------------+
```

### Custom Service Creation for Technicians

```
+------------------------------------------+
| [<- Back]   ADD CUSTOM SERVICE           |
+------------------------------------------+
|                                          |
|  Service Name:                           |
|  +------------------------------------+  |
|  | SOLAR WATER HEATER REPAIR          |  |
|  +------------------------------------+  |
|                                          |
|  Category:                               |
|  [Select Category            v]          |
|                                          |
|  Description:                            |
|  +------------------------------------+  |
|  | Repair and maintenance of solar    |  |
|  | water heating systems including    |  |
|  | panel inspection, pipe repair,     |  |
|  | and thermostat replacement.        |  |
|  +------------------------------------+  |
|                                          |
|  Pricing Model:                          |
|  [X] Per Hour    [ ] Fixed    [ ] Per Item|
|                                          |
|  Your Rate:                              |
|  KES [800] per hour                      |
|                                          |
|  Estimated Duration:                     |
|  [2-4] hours typical                     |
|                                          |
+------------------------------------------+
|                                          |
|  [SAVE SERVICE]                          |
|                                          |
+------------------------------------------+
```

---

## Visual Design Specifications

### Color Palette

```yaml
Primary Actions:
  active: "#0066CC"      # Blue for selected
  hover: "#0052A3"       # Darker blue

Backgrounds:
  card_default: "#F5F5F5"  # Light gray
  card_selected: "#0066CC" # Blue
  card_disabled: "#E0E0E0" # Gray

Text:
  primary: "#1A1A1A"       # Almost black
  on_selected: "#FFFFFF"   # White on blue
  secondary: "#666666"     # Gray

Accents:
  border: "#E0E0E0"
  shadow: "rgba(0,0,0,0.1)"
```

### Typography

```yaml
Category Names:
  font_size: "16px"
  font_weight: "700"       # Bold
  line_height: "1.2"

Service Names (WORD BANK):
  font_size: "13px"
  font_weight: "700"       # Bold
  text_transform: "uppercase"
  letter_spacing: "0.05em"
  line_height: "1.3"

Section Headers:
  font_size: "14px"
  font_weight: "600"       # Semi-bold
  color: "#666666"
```

### Spacing

```yaml
Grid:
  gap: "8px"              # Between cards
  margin: "16px"          # Screen edges

Card:
  padding: "16px"
  min_height: "90px"

Section:
  margin_bottom: "24px"
```

---

## Interaction Design

### Selection Flow

```
1. User taps category card
   -> Card shows pressed state (scale down 2%)
   -> Navigate to sub-service view

2. User taps service in WORD BANK
   -> Service shows selected state (blue background)
   -> Option to select multiple or continue

3. User taps "Continue"
   -> Selected services highlighted
   -> Navigate to location/time selection
```

### Animations

```yaml
Card Press:
  transform: "scale(0.98)"
  duration: "100ms"
  easing: "ease-out"

Selection:
  background_color: "F5F5F5 -> 0066CC"
  duration: "200ms"
  easing: "ease-in-out"

Page Transition:
  enter: "translateX(100% -> 0)"
  exit: "translateX(0 -> -30%)"
  duration: "300ms"
  easing: "ease-out"
```

---

## Accessibility Considerations

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | 4.5:1 minimum for all text |
| Touch Targets | 48x48px minimum (56px preferred) |
| Focus Indicators | 2px blue outline on focus |
| Screen Readers | ARIA labels on all cards |
| Color Independence | Icons + text, not color alone |

### Screen Reader Labels

```html
<!-- Category Card -->
<button
  role="option"
  aria-label="Plumbing services. Tap to see plumbing services."
  aria-selected="false"
>
  <img alt="" src="plumbing-icon.png" aria-hidden="true">
  <span>PLUMBING</span>
</button>

<!-- Service Selection -->
<button
  role="option"
  aria-label="Pipe repair service. Not selected. Tap to select."
  aria-selected="false"
>
  PIPE REPAIR
</button>
```

---

## Mobile Optimization

### Touch Target Sizing

```yaml
Category Cards:
  width: "calc(50% - 8px)"
  min_height: "140px"
  touch_area: "Full card clickable"

Service Items (WORD BANK):
  width: "calc(33.33% - 6px)"
  min_height: "90px"
  touch_area: "Full item clickable"

Continue Button:
  height: "56px"
  width: "100%"
  margin_top: "16px"
```

### Performance Considerations

```yaml
Image Optimization:
  format: "WebP with fallback"
  sizes: "3x for retina"
  lazy_loading: "Yes"

List Virtualization:
  threshold: "50+ items"
  implementation: "Windowing"

Offline Support:
  cache_strategy: "Cache first, network update"
  cached_data: "Service categories, popular services"
```

---

## Success Metrics

### Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Service Discovery Time | <30 sec | Time from landing to service selection |
| Tap Efficiency | 2-3 taps | Number of taps to find service |
| Category Penetration | >80% | Percentage of categories used |
| Search Usage | <20% | Percentage using search vs browsing |

### Conversion Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Selection Completion | >95% | Users who select a service |
| Time to Booking | <2 min | From selection to booking initiation |
| Abandonment Rate | <10% | Users who leave after selection |

---

## Implementation Priority

### Phase 1: Core WORD BANK (Week 1-2)
1. Category grid with images
2. Sub-service WORD BANK selection
3. Selection state and navigation
4. Mobile responsive layout

### Phase 2: Enhanced Discovery (Week 3-4)
1. Search functionality
2. Custom service description
3. Popular services algorithm
4. Recent services memory

### Phase 3: Technician Side (Week 5-6)
1. Service selection for technicians
2. Custom service creation
3. Pricing model selection
4. Service portfolio display

---

## Future Enhancements

### AI-Powered Suggestions
- "Based on your selection, you might also need..."
- Smart categorization of custom descriptions
- Seasonal/trending service promotion

### Visual Recognition
- Upload photo -> Suggest service category
- Identify problem from image
- Auto-generate service request

### Voice Input
- "I need a plumber" -> Navigate to plumbing
- Voice-to-text for custom descriptions
- Hands-free service selection
