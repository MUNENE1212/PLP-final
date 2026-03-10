# Wireframe Concepts
## Dumuwaks Redesign - Textual Descriptions

---

## Overview

This document describes wireframe concepts for key screens in the Dumuwaks redesign. All designs follow mobile-first principles with minimum touch targets of 48px and optimized for 320-414px screen widths.

---

## Screen 1: Landing Page (Redesigned)

### Purpose
First point of contact for both customers and technicians. Quick access to core actions.

### Layout Description

```
+=======================================================================+
|                    STATUS BAR (System)                                |
|                    Time | Signal | Battery                            |
+=======================================================================+
|                                                                       |
|  [Logo] Dumuwaks                              [Login] [Sign Up]       |
|                                                                       |
+=======================================================================+
|                                                                       |
|                     HERO SECTION                                     |
|                                                                       |
|              [Illustration: Technician at work]                       |
|                                                                       |
|           "Find Skilled Technicians Instantly"                       |
|                                                                       |
|      "Plumbers, Electricians, Carpenters & more                     |
|       available near you right now"                                  |
|                                                                       |
|  +---------------------------------------------------------------+    |
|  |  [Search Icon] What service do you need?            [Camera] |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
|         [Find a Technician]  [Register as Technician]               |
|             (Primary)              (Secondary)                       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  QUICK CATEGORIES                                                    |
|                                                                       |
|  +---------+  +---------+  +---------+  +---------+                  |
|  | [Icon]  |  | [Icon]  |  | [Icon]  |  | [Icon]  |                  |
|  |Plumbing |  |Electric |  |Carpentry|  |Painting |                  |
|  |  156    |  |  124    |  |   89    |  |   67    |                  |
|  +---------+  +---------+  +---------+  +---------+                  |
|                                                                       |
|  +---------+  +---------+  +---------+  +---------+                  |
|  | [Icon]  |  | [Icon]  |  | [Icon]  |  | [Icon]  |                  |
|  |  HVAC   |  |Cleaning |  | Masonry |  | More... |                  |
|  |   45    |  |  112    |  |   34    |  |  View   |                  |
|  +---------+  +---------+  +---------+  +---------+                  |
|                                                                       |
+=======================================================================+
|                                                                       |
|  WHY DUMUWAKS?                                                       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Shield Icon]  Verified Technicians                       |       |
|  | All technicians are ID-verified and background checked    |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Money Icon]  Transparent Pricing                         |       |
|  | See prices upfront. No hidden fees. No surprises.         |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Clock Icon]  Available Now                               |       |
|  | Many technicians available within 30 minutes              |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  HOW IT WORKS                                                        |
|                                                                       |
|  Step 1: Choose Service                                              |
|  [Tap card] --> Select from visual categories                        |
|                                                                       |
|  Step 2: Pick Technician                                             |
|  [Compare icon] --> View ratings, gallery, prices                    |
|                                                                       |
|  Step 3: Book & Pay                                                  |
|  [Calendar icon] --> Schedule, pay booking fee via M-Pesa            |
|                                                                       |
|  Step 4: Get It Done                                                 |
|  [Check icon] --> Technician arrives, work completed                 |
|                                                                       |
+=======================================================================+
|                                                                       |
|  EMERGENCY?                                                          |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [!] Need help urgently? Tap here for emergency booking    |       |
|  |     Available 24/7 | Response within 30 min               |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|                   GET STARTED TODAY                                   |
|                                                                       |
|         [Find a Technician]  [Register as Technician]               |
|                                                                       |
+=======================================================================+
|                                                                       |
|  [Home]    [Search]   [Bookings]   [Messages]   [Profile]           |
|   Icon      Icon        Icon         Icon         Icon               |
|                                                                       |
+=======================================================================+
```

### Design Specifications

**Header:**
- Height: 56px
- Logo: 120px width
- Buttons: 48px height, 12px padding

**Hero Section:**
- Illustration: 200px x 200px, optimized SVG
- Search bar: Full width - 32px margins, 56px height
- Camera button: 48px x 48px touch target
- Primary CTA: Full width - 32px margins, 56px height
- Secondary CTA: Full width - 32px margins, 48px height

**Category Cards:**
- Grid: 4 columns on mobile, 8px gap
- Card size: 72px x 80px minimum
- Icon: 32px x 32px
- Technician count: 12px font

**Trust Badges:**
- Full width cards, 16px padding
- Icon: 24px
- Text: 14px body, 12px description

**Bottom Navigation:**
- Height: 56px + safe area
- Icons: 24px
- Labels: 10px
- Active indicator: 2px underline

---

## Screen 2: Service Discovery (WORD BANK)

### Purpose
Visual service selection using the WORD BANK concept.

### Layout Description

```
+=======================================================================+
|                    STATUS BAR (System)                                |
+=======================================================================+
|                                                                       |
|  < Back            Plumbing Services              [Filter] [Sort]     |
|                                                                       |
+=======================================================================+
|                                                                       |
|  What specifically do you need?                                       |
|                                                                       |
|  +---------------------------------------------------------------+    |
|  | [Search] Type or describe your problem...           [Camera] |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
+=======================================================================+
|                                                                       |
|  POPULAR SERVICES                                            [See All]|
|                                                                       |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|  |  [ICON]   | |  [ICON]   | |  [ICON]   | |  [ICON]   |              |
|  |Tap Repair | |Toilet Fix | |  Leak     | |  Pipe     |              |
|  |FROM KES500| |FROM KES1K | |FROM KES800| |FROM KES600|              |
|  | [SELECTED]| |           | |           | |           |              |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|                                                                       |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|  |  [ICON]   | |  [ICON]   | |  [ICON]   | |  [ICON]   |              |
|  |  Drain    | |Water Tank | |  Shower   | |  Geyser   |              |
|  |FROM KES800| |FROM KES2.5| |FROM KES1K | |FROM KES2K |              |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|                                                                       |
+=======================================================================+
|                                                                       |
|  SPECIALIZED SERVICES                                                |
|                                                                       |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|  |  [ICON]   | |  [ICON]   | |  [ICON]   | |  [ICON]   |              |
|  |Bathroom   | | Kitchen   | |  Solar    | | Borehole  |              |
|  |  Reno     | | Plumbing  | |  Heater   | |   Pump    |              |
|  |FROM KES15K| |FROM KES8K | |FROM KES3K | |FROM KES5K |              |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|                                                                       |
+=======================================================================+
|                                                                       |
|  CUSTOM SERVICES NEAR YOU                                            |
|                                                                       |
|  [Badge: CUSTOM] Water Meter Install | FROM KES 1K | 3 technicians  |
|                                                                       |
|  [Badge: CUSTOM] Jacuzzi Install     | FROM KES 10K| 2 technicians   |
|                                                                       |
|  [Badge: CUSTOM] Pool Plumbing       | FROM KES 5K | 1 technician    |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [?] Can't find what you need?                             |       |
|  |     Describe your problem or upload a photo               |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  STICKY BOTTOM BAR                                                   |
|  +-----------------------------------------------------------+       |
|  | 1 selected: Tap Repair                    [Find 12 Techs] |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  [Home]    [Search]   [Bookings]   [Messages]   [Profile]           |
|                                                                       |
+=======================================================================+
```

### Design Specifications

**Service Chips:**
- Size: 100px x 100px (on 375px screens)
- Gap: 8px
- Icon: 32px x 32px
- Price text: 10px, muted color
- Selected state: 3px border, primary color, subtle shadow

**Custom Services List:**
- Full width - 32px margins
- Height: 64px per item
- Badge: 12px font, accent color

**Sticky Bottom Bar:**
- Height: 72px (includes safe area)
- Always visible when scrolling
- Selection count + CTA

---

## Screen 3: Technician Results

### Purpose
Display matching technicians with key information for comparison.

### Layout Description

```
+=======================================================================+
|                    STATUS BAR (System)                                |
+=======================================================================+
|                                                                       |
|  < Back        12 Plumbers Available           [Map] [List]          |
|                                                                       |
+=======================================================================+
|                                                                       |
|  FILTERS APPLIED:                                                    |
|  [Tap Repair x] [Kilimani x] [Available Now x]    [Clear All]        |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +---------------------------------------------------------------+    |
|  |                                                               |    |
|  |  [PROFILE PHOTO]     Peter Kamau Ngugi                        |    |
|  |  (80px circle)                                                |    |
|  |                      [Badge: TOP PRO] [Badge: VERIFIED]       |    |
|  |                      Rating: 4.9 (127 reviews)                |    |
|  |                      Available in 25 min | 3.2 km away        |    |
|  |                                                               |    |
|  |  SERVICES OFFERED:                                            |    |
|  |  [Tap Repair] [Leak Fix] [Toilet] [+3 more]                   |    |
|  |                                                               |    |
|  |  PRICE RANGE: KES 500 - 2,500 per job                         |    |
|  |                                                               |    |
|  |  RECENT WORK:                                                 |    |
|  |  [Img1] [Img2] [Img3] [Img4] [Img5] [See all]                 |    |
|  |  (60x60 thumbs)                                               |    |
|  |                                                               |    |
|  |  [View Full Profile]                    [Book Now]            |    |
|  |                                                               |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +---------------------------------------------------------------+    |
|  |                                                               |    |
|  |  [PROFILE PHOTO]     John Mwangi                              |    |
|  |                                                               |    |
|  |                      [Badge: VERIFIED]                        |    |
|  |                      Rating: 4.7 (89 reviews)                 |    |
|  |                      Available in 45 min | 5.1 km away        |    |
|  |                                                               |    |
|  |  SERVICES OFFERED:                                            |    |
|  |  [Tap Repair] [Pipe] [Drain] [+2 more]                        |    |
|  |                                                               |    |
|  |  PRICE RANGE: KES 400 - 2,000 per job                         |    |
|  |                                                               |    |
|  |  RECENT WORK:                                                 |    |
|  |  [Img1] [Img2] [Img3] [Img4] [Img5] [See all]                 |    |
|  |                                                               |    |
|  |  [View Full Profile]                    [Book Now]            |    |
|  |                                                               |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +---------------------------------------------------------------+    |
|  |                                                               |    |
|  |  [PROFILE PHOTO]     Mary Wanjiru                             |    |
|  |                                                               |    |
|  |                      [Badge: NEW]                             |    |
|  |                      Rating: 5.0 (12 reviews)                 |    |
|  |                      Available in 15 min | 1.8 km away        |    |
|  |                                                               |    |
|  |  SERVICES OFFERED:                                            |    |
|  |  [Tap Repair] [Leak Fix] [CUSTOM: Water Meter]                |    |
|  |                                                               |    |
|  |  PRICE RANGE: KES 500 - 1,800 per job                         |    |
|  |                                                               |    |
|  |  RECENT WORK:                                                 |    |
|  |  [Img1] [Img2] [Img3]                                         |    |
|  |                                                               |    |
|  |  [View Full Profile]                    [Book Now]            |    |
|  |                                                               |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
+=======================================================================+
|                                                                       |
|  [Home]    [Search]   [Bookings]   [Messages]   [Profile]           |
|                                                                       |
+=======================================================================+
```

### Design Specifications

**Technician Card:**
- Full width - 24px margins
- Padding: 16px
- Profile photo: 80px x 80px circle
- Badges: 12px font, pill shape
- Rating: 16px star + 14px text
- Service chips: 8px padding, 12px font
- Work thumbnails: 60px x 60px, 4px border-radius
- CTA buttons: 48px height

**Key Information Hierarchy:**
1. Photo + Name (most prominent)
2. Badges + Rating
3. Availability + Distance
4. Services
5. Price
6. Work samples
7. Actions

---

## Screen 4: Quick Booking Flow

### Purpose
Streamlined booking with minimal friction.

### Layout Description

```
+=======================================================================+
|                    STATUS BAR (System)                                |
+=======================================================================+
|                                                                       |
|  < Back              Book Technician                 Step 1 of 3      |
|                                                                       |
+=======================================================================+
|                                                                       |
|  SELECTED TECHNICIAN                                                 |
|                                                                       |
|  +---------------------------------------------------------------+    |
|  | [Photo 48px]  Peter Kamau Ngugi                               |    |
|  |               4.9 (127) | Available in 25 min                 |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
+=======================================================================+
|                                                                       |
|  SERVICE DETAILS                                                     |
|                                                                       |
|  Selected Service: Tap Repair                                        |
|  +---------------------------------------------------------------+    |
|  | [Check] Tap Repair | FROM KES 500 - 1,500                    |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
|  Describe your problem (optional):                                   |
|  +---------------------------------------------------------------+    |
|  | The kitchen tap is dripping continuously. It's worse at     |    |
|  | night...                                                     |    |
|  |                                                               |    |
|  +---------------------------------------------------------------+    |
|  | Characters: 67/500                                           |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
|  Add photos (helps technician prepare):                              |
|  +-----------+ +-----------+ +-----------+                           |
|  |   [+]     | |  [Img1]   | |  [Img2]   |                           |
|  | Add Photo | |   [X]     | |   [X]     |                           |
|  +-----------+ +-----------+ +-----------+                           |
|                                                                       |
+=======================================================================+
|                                                                       |
|  SCHEDULE                                                            |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | (!) EMERGENCY                                              |       |
|  |     I need this done ASAP (within 2 hours)                 |       |
|  |     +50% urgency fee applies                               |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  - OR -                                                              |
|                                                                       |
|  Schedule for later:                                                 |
|                                                                       |
|  +-------------------------------+ +-----------------------+          |
|  | Date: [February 18, 2026  v] | | Time: [10:00 AM  v]  |          |
|  +-------------------------------+ +-----------------------+          |
|                                                                       |
+=======================================================================+
|                                                                       |
|  PRICE ESTIMATE                                                      |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | Service: Tap Repair                              KES 500   |       |
|  | Call-out fee (booking fee):                      KES 200   |       |
|  | Travel fee (3.2 km):                             KES 150   |       |
|  |-----------------------------------------------------------|       |
|  | Estimated Total:                            KES 850-1,850   |       |
|  |                                                           |       |
|  | Final price confirmed after technician assessment         |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  LOCATION                                                            |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Map Pin] Kilimani, Nairobi                                |       |
|  |           Near Yaya Centre                                  |       |
|  |                                                           |       |
|  | [Edit Location]                                            |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |                    [Continue to Payment]                  |       |
|  |                    (Primary, full width)                  |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
```

### Design Specifications

**Step Indicator:**
- Height: 40px
- Progress bar: 33% filled
- Text: 12px

**Form Fields:**
- Height: 56px (touch-friendly)
- Label above field: 14px, medium
- Input: 16px (prevents iOS zoom)
- Error state: Red border + text below

**Photo Upload:**
- Thumbnail size: 80px x 80px
- Add button: Dashed border
- Max 5 photos

**Price Estimate:**
- Card with subtle background
- Line items: 14px
- Total: 18px bold
- Notice: 12px italic

**Primary CTA:**
- Height: 56px
- Full width - 24px margins
- Sticky at bottom (optional)

---

## Screen 5: Payment Modal (M-Pesa STK Push)

### Purpose
Seamless M-Pesa payment with STK push.

### Layout Description

```
+=======================================================================+
|                                                                       |
|                       PAYMENT REQUIRED                               |
|                                                                       |
+=======================================================================+
|                                                                       |
|  To confirm your booking, please pay the booking fee:                |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |                    KES 200.00                             |       |
|  |              Booking Fee (Refundable)                     |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  PAYMENT METHOD                                                      |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [M-Pesa Logo]  M-Pesa                                     |       |
|  |                **** 254712345678                          |       |
|  |                                     [Selected: Check]     |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Card Icon]    Credit/Debit Card                          |       |
|  |                                     [Select]              |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |              [Pay KES 200 with M-Pesa]                    |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  After clicking Pay:                                                 |
|  1. Check your phone for M-Pesa prompt                               |
|  2. Enter your M-Pesa PIN                                            |
|  3. Wait for confirmation                                            |
|                                                                       |
|  [Cancel]                                                            |
|                                                                       |
+=======================================================================+
```

### Payment Processing State

```
+=======================================================================+
|                                                                       |
|                    PROCESSING PAYMENT                                |
|                                                                       |
+=======================================================================+
|                                                                       |
|                       [Spinner Animation]                            |
|                                                                       |
|              Waiting for M-Pesa confirmation...                      |
|                                                                       |
|              Please check your phone and enter                        |
|              your M-Pesa PIN to complete payment                      |
|                                                                       |
|                       [30s timeout bar]                              |
|                                                                       |
|              Having trouble? [Cancel Payment]                        |
|                                                                       |
+=======================================================================+
```

### Payment Success State

```
+=======================================================================+
|                                                                       |
|                    PAYMENT SUCCESSFUL                                |
|                                                                       |
+=======================================================================+
|                                                                       |
|                       [Checkmark Animation]                          |
|                                                                       |
|                    Payment Confirmed!                                |
|                                                                       |
|              Transaction ID: QWE12345RTY                             |
|              Amount: KES 200.00                                      |
|              Date: Feb 17, 2026 10:32 AM                             |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |         Your booking is now confirmed!                    |       |
|  |                                                           |       |
|  |         Peter Kamau has been notified and                 |       |
|  |         will arrive in approximately 25 minutes           |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  [Track Technician]                              [View Booking]      |
|                                                                       |
+=======================================================================+
```

### Design Specifications

**Modal Container:**
- Max width: 400px
- Padding: 24px
- Border-radius: 16px
- Background: White
- Overlay: Black 50%

**Amount Display:**
- Font size: 32px bold
- Label: 14px muted

**Payment Method Cards:**
- Height: 72px
- Touch target: Full card
- Selected state: Primary border

**Processing Animation:**
- Spinner: 48px
- Text: 16px
- Timeout bar: Linear countdown

---

## Screen 6: Technician Profile (Redesigned)

### Purpose
Showcase technician with visual-first approach and clear CTAs.

### Layout Description

```
+=======================================================================+
|                    STATUS BAR (System)                                |
+=======================================================================+
|                                                                       |
|  < Back        Technician Profile                    [Share] [Save]   |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |  [PROFILE PHOTO]                                          |       |
|  |  (120px circle)   Peter Kamau Ngugi                       |       |
|  |                                                            |       |
|  |                   [Badge: TOP PRO] [Badge: VERIFIED]      |       |
|  |                   [Badge: BACKGROUND CHECKED]             |       |
|  |                                                           |       |
|  |                   Rating: 4.9 (127 reviews)               |       |
|  |                   156 jobs completed | 10 yrs experience  |       |
|  |                                                           |       |
|  |  [Available Now - Green dot]                              |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  BIO                                                                 |
|                                                                       |
|  "Professional plumber with 10 years experience. Specializing       |
|   in residential and commercial plumbing. Available for emergencies  |
|   and scheduled appointments."                                        |
|                                                                       |
+=======================================================================+
|                                                                       |
|  SERVICES & PRICING                                            [See All]|
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | Tap Repair                           KES 500 - 1,500     |       |
|  +-----------------------------------------------------------+       |
|  | Leak Detection & Repair              KES 800 - 2,000     |       |
|  +-----------------------------------------------------------+       |
|  | Toilet Installation/Repair           KES 1,000 - 5,000   |       |
|  +-----------------------------------------------------------+       |
|  | CUSTOM: Bathroom Renovation          KES 15,000 - 50,000 |       |
|  +-----------------------------------------------------------+       |
|  | CUSTOM: Water Meter Install          KES 1,000 - 2,000   |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+========================================================================
|                                                                       |
|  WORK GALLERY                                            See All (23) |
|                                                                       |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|  |  [Img1]   | |  [Img2]   | |  [Img3]   | |  [Img4]   |              |
|  | Before/   | |           | | Before/   | |           |              |
|  |  After    | |           | |  After    | |           |              |
|  +-----------+ +-----------+ +-----------+ +-----------+              |
|                                                                       |
|  [Tap Repair - Kilimani] [Toilet Install - Westlands] [More...]      |
|                                                                       |
+=======================================================================+
|                                                                       |
|  REVIEWS                                                     See All  |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Photo] Wanjiku M.   *****(5)  |  2 days ago               |       |
|  |                                                           |       |
|  | "Peter fixed my leaking tap in 30 minutes. Very          |       |
|  |  professional and clean work. Highly recommend!"          |       |
|  |                                                           |       |
|  | Service: Tap Repair | Price: KES 800                      |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Photo] John K.   *****(5)  |  1 week ago                  |       |
|  |                                                           |       |
|  | "Installed a new toilet perfectly. Arrived on time,      |       |
|  |  explained everything, left the bathroom spotless."       |       |
|  |                                                           |       |
|  | Service: Toilet Install | Price: KES 3,500                |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  VERIFICATION                                                        |
|                                                                       |
|  [Check] National ID Verified                                        |
|  [Check] Phone Number Verified                                       |
|  [Check] Background Check Complete                                   |
|  [Check] Trade Certificate Verified                                  |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |  [Message]                          [Book This Technician] |       |
|  |  (Outline)                          (Primary, full width)  |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  [Home]    [Search]   [Bookings]   [Messages]   [Profile]           |
|                                                                       |
+=======================================================================+
```

### Design Specifications

**Profile Header:**
- Photo: 120px circle, 4px primary ring
- Name: 24px bold
- Badges: Pill-shaped, 12px font
- Availability indicator: Animated pulse

**Services List:**
- Full width
- Height: 56px per item
- Right-aligned pricing
- Custom services: Accent color

**Gallery Grid:**
- 4 columns, 8px gap
- Square thumbnails
- Before/After badge overlay
- Tap to expand

**Reviews:**
- Card with subtle border
- Reviewer photo: 40px circle
- Star rating: 16px stars
- Service/Price tag: Muted

---

## Screen 7: Technician Service Management

### Purpose
Allow technicians to define and manage their services.

### Layout Description

```
+=======================================================================+
|                    STATUS BAR (System)                                |
+=======================================================================+
|                                                                       |
|  < Back             My Services                     [+ Add Custom]   |
|                                                                       |
+=======================================================================+
|                                                                       |
|  PROFILE COMPLETION                                                  |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |  [========80%=====                              ]          |       |
|  |                                                           |       |
|  |  Complete your profile to get more bookings               |       |
|  |  [Add work photos] [Set your location]                    |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  YOUR SERVICES                                            [Edit Mode] |
|                                                                       |
|  PLUMBING                                                             |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Check] Tap Repair                                        |       |
|  |         Per Job | KES 500 - 1,500                         |       |
|  |         [Edit Price]                                      |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Check] Leak Detection                                    |       |
|  |         Per Job | KES 800 - 2,000                         |       |
|  |         [Edit Price]                                      |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [ ] Toilet Installation                                   |       |
|  |     [Enable this service]                                 |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [ ] Water Tank Installation                               |       |
|  |     [Enable this service]                                 |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  YOUR CUSTOM SERVICES                                                |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Edit] Bathroom Renovation                                |       |
|  |        Per Job | KES 15,000 - 50,000                      |       |
|  |        "Full bathroom overhaul, tiles, fixtures..."       |       |
|  |        [Img1] [Img2] [Img3]                               |       |
|  |                                          [Delete]          |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
|  +-----------------------------------------------------------+       |
|  | [Edit] Water Meter Installation                           |       |
|  |        Per Job | KES 1,000 - 2,000                        |       |
|  |        "Nairobi Water approved installer"                  |       |
|  |        [Img1]                                             |       |
|  |                                          [Delete]          |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  +-----------------------------------------------------------+       |
|  |                                                           |       |
|  |              [+ Add Custom Service]                       |       |
|  |                                                           |       |
|  +-----------------------------------------------------------+       |
|                                                                       |
+=======================================================================+
|                                                                       |
|  [Home]    [Search]   [Bookings]   [Messages]   [Profile]           |
|                                                                       |
+=======================================================================+
```

### Design Specifications

**Completion Bar:**
- Height: 8px
- Animated progress
- Actionable suggestions

**Service Items:**
- Height: 80px (enabled) or 56px (disabled)
- Checkbox: 24px
- Price range: 14px, right-aligned
- Edit button: Text link

**Custom Service Card:**
- Expandable
- Description preview (truncated)
- Thumbnail strip
- Edit/Delete actions

**Add Custom Button:**
- Dashed border
- Centered text + icon
- Full width

---

## Mobile-First Design Checklist

For each screen, verify:

```
[ ] Touch targets >= 48px (56px preferred)
[ ] Font sizes >= 16px for inputs (prevents iOS zoom)
[ ] Primary actions in thumb zone (bottom 1/3)
[ ] No horizontal scrolling
[ ] Forms work one-handed
[ ] Critical info visible without scrolling
[ ] Loading states defined
[ ] Error states defined
[ ] Empty states defined
[ ] Offline behavior defined
[ ] M-Pesa integration seamless
[ ] Works on 320px width
```

---

*These wireframe concepts provide the foundation for implementation. Each screen should be prototyped and tested with real users before development.*
