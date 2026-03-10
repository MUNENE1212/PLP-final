# Dumuwaks Wireframes

## Overview

This document contains ASCII wireframes for key screens in the Dumuwaks platform, designed for mobile-first (375px width) with measurements and specifications.

---

## 1. Home Screen with WORD BANK

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [Logo] DUMUWAKS         [Search] [Menu]  |
|                                    56px  |
+------------------------------------------+
|                                          |
|   What do you need fixed today?          |
|                                          |
| +--------------------------------------+ |
| | [Search services...]            [Q]  | |
| +--------------------------------------+ |
|                                          |
| POPULAR SERVICES                         |
|                                          |
| +-----------+  +-----------+             |
| |  [IMAGE]  |  |  [IMAGE]  |             |
| |           |  |           |             |
| | PLUMBING  |  |ELECTRICAL |             |
| |   tap     |  |   tap     |             |
| +-----------+  +-----------+             |
|   168px         168px                    |
|                                          |
| +-----------+  +-----------+             |
| |  [IMAGE]  |  |  [IMAGE]  |             |
| |           |  |           |             |
| | CLEANING  |  |CARPENTRY  |             |
| |   tap     |  |   tap     |             |
| +-----------+  +-----------+             |
|                                          |
| +-----------+  +-----------+             |
| |  [IMAGE]  |  |  [IMAGE]  |             |
| |           |  |           |             |
| | PAINTING  |  | APPLIANCE |             |
| |   tap     |  |  REPAIR   |             |
| +-----------+  +-----------+             |
|                                          |
| [+ VIEW ALL 16 CATEGORIES]    56px       |
|                                          |
+------------------------------------------+
| HOW IT WORKS                             |
|                                          |
| 1. Choose Service                        |
|    Browse services or search             |
|                                          |
| 2. Pick Technician                       |
|    View ratings and reviews              |
|                                          |
| 3. Get it Done                           |
|    Track and pay securely                |
|                                          |
+------------------------------------------+
| TRUSTED BY KENYANS                       |
|                                          |
| +----------+ +----------+ +----------+   |
| | 500+     | | 4.8      | | 10,000+  |   |
| | Verified | | Average  | | Jobs     |   |
| | Techs    | | Rating   | | Done     |   |
| +----------+ +----------+ +----------+   |
|                                          |
+------------------------------------------+
| [Home]  [Bookings]  [Messages]  [Profile]|
|                                    56px  |
+------------------------------------------+
```

### Specifications

```yaml
Header:
  height: 56px
  logo_width: 120px
  search_icon: 24px
  menu_icon: 24px
  padding: 16px horizontal

Search Bar:
  height: 48px
  padding: 12px
  border_radius: 8px
  border: 1px solid #E5E7EB
  background: #F9FAFB

Service Card:
  width: calc(50% - 8px) = 168px
  height: 140px
  image_height: 80px
  border_radius: 12px
  padding: 12px
  margin_bottom: 16px

CTA Button:
  height: 56px
  width: calc(100% - 32px) = 327px
  border_radius: 8px
  margin_top: 16px

Trust Stats:
  height: 80px
  item_width: calc(33.33% - 16px) = 96px
  margin_top: 24px

Bottom Navigation:
  height: 56px
  icon_size: 24px
  label_size: 10px
  padding: 8px
```

---

## 2. Service Selection - WORD BANK

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [<- Back]     PLUMBING            56px   |
+------------------------------------------+
|                                          |
|   What specifically do you need?         |
|                                          |
| +--------+ +--------+ +--------+         |
| |  PIPE  | |  TAP   | | DRAIN  |         |
| | REPAIR | |INSTALL | |CLEANING|         |
| |        | |        | |        |         |
| +--------+ +--------+ +--------+         |
|   111px     111px     111px              |
|                                          |
| +--------+ +--------+ +--------+         |
| | TOILET | | WATER  | | BOILER |         |
| | REPAIR | |  TANK  | |SERVICE |         |
| |        | |        | |        |         |
| +--------+ +--------+ +--------+         |
|                                          |
| +--------+ +--------+ +--------+         |
| | SHOWER | |  BATH  | | WATER  |         |
| | REPAIR | | REPAIR | | HEATER |         |
| |        | |        | |        |         |
| +--------+ +--------+ +--------+         |
|                                          |
| +--------+ +--------+                    |
| |  LEAK  | | SEPTIC |                    |
| |DETECT- | |  TANK  |                    |
| |  ION   | |        |                    |
| +--------+ +--------+                    |
|                                          |
| Service not listed?                      |
| [+ DESCRIBE YOUR OWN]                    |
|                                          |
+------------------------------------------+
|                                          |
| [CONTINUE ->]                   56px     |
|                                          |
+------------------------------------------+
```

### Specifications

```yaml
Word Bank Item:
  width: calc(33.33% - 8px) = 111px
  height: 90px
  padding: 12px
  border_radius: 8px
  background: #F3F4F6
  margin_bottom: 8px
  margin_right: 8px (except last in row)

Typography:
  font_size: 13px
  font_weight: 700
  text_transform: uppercase
  letter_spacing: 0.05em
  line_height: 1.3

Selected State:
  background: #0066CC
  text_color: #FFFFFF

Continue Button:
  height: 56px
  width: calc(100% - 32px) = 327px
  position: fixed bottom
  margin_bottom: 24px
```

---

## 3. Location & Time Selection

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [<- Back]    Step 1 of 3          56px   |
+------------------------------------------+
|                                          |
|   Step 1 [======        ] 33%            |
|                                          |
+------------------------------------------+
|                                          |
|   Where do you need the technician?      |
|                                          |
| +--------------------------------------+ |
| | [GPS ICON]  USE CURRENT LOCATION     | |
| +--------------------------------------+ |
|                                          |
|   - OR -                                 |
|                                          |
|   Enter address:                         |
| +--------------------------------------+ |
| | Westlands, Nairobi                   | |
| +--------------------------------------+ |
|                                          |
|   Nearby landmarks (optional):           |
| +--------------------------------------+ |
| | Near Westgate Mall                   | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   When do you need it?                   |
|                                          |
| +----------+ +----------+ +-----------+  |
| |   NOW    | |  TODAY   | | TOMORROW  |  |
| | selected | |          | |           |  |
| +----------+ +----------+ +-----------+  |
|                                          |
| +-----------+                            |
| |PICK DATE  |                            |
| +-----------+                            |
|                                          |
+------------------------------------------+
|                                          |
| [NEXT: Find Technicians ->]     56px     |
|                                          |
+------------------------------------------+
```

### Specifications

```yaml
Progress Bar:
  height: 4px
  width: calc(100% - 32px) = 327px
  border_radius: 2px
  background: #E5E7EB
  fill: #0066CC

GPS Button:
  height: 56px
  width: calc(100% - 32px) = 327px
  border_radius: 8px
  border: 2px solid #0066CC
  background: transparent

Input Fields:
  height: 56px
  width: calc(100% - 32px) = 327px
  border_radius: 8px
  border: 1px solid #D1D5DB
  font_size: 16px

Time Option Buttons:
  width: calc(33.33% - 16px) = 96px
  height: 48px
  border_radius: 8px
  selected_background: #0066CC
  unselected_background: #F3F4F6

Next Button:
  height: 56px
  width: calc(100% - 32px) = 327px
  background: #0066CC
  color: #FFFFFF
```

---

## 4. Technician Results

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [<- Back]   5 TECHNICIANS         56px   |
+------------------------------------------+
|                                          |
| Sorted by: Match Quality  [Filter]       |
|                                          |
+------------------------------------------+
| +--------------------------------------+ |
| | [PHOTO] John Kamau          [95/100] | |
| |          Electrician                  | |
| |          ***** 4.8 | 2.3km | 500/hr   | |
| |                                      | |
| | "Specializes in residential..."      | |
| |                                      | |
| | [Plumbing - Expert] [Electrical]     | |
| |                                      | |
| | [VIEW PROFILE]    [BOOK NOW]         | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| +--------------------------------------+ |
| | [PHOTO] Mary Wanjiku        [92/100] | |
| |          Plumber                      | |
| |          ***** 4.9 | 3.1km | 450/hr   | |
| |                                      | |
| | "10 years experience in..."          | |
| |                                      | |
| | [Plumbing - Expert] [Drainage]       | |
| |                                      | |
| | [VIEW PROFILE]    [BOOK NOW]         | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| +--------------------------------------+ |
| | [PHOTO] Peter Ochieng       [88/100] | |
| |          Plumber                      | |
| |          **** 4.6 | 4.5km | 400/hr    | |
| |                                      | |
| | "Fast and reliable service..."       | |
| |                                      | |
| | [Plumbing - Advanced]                | |
| |                                      | |
| | [VIEW PROFILE]    [BOOK NOW]         | |
| +--------------------------------------+ |
|                                          |
| [Load More Technicians...]               |
|                                          |
+------------------------------------------+
| [Home]  [Bookings]  [Messages]  [Profile]|
|                                    56px  |
+------------------------------------------+
```

### Specifications

```yaml
Technician Card:
  width: calc(100% - 32px) = 327px
  min_height: 180px
  padding: 16px
  border_radius: 12px
  border: 1px solid #E5E7EB
  margin_bottom: 12px

Profile Photo:
  size: 64px
  border_radius: 50%
  border: 3px solid #F3F4F6

Match Score:
  position: top right
  font_size: 18px
  font_weight: 700
  color: #0066CC (if high) / #D97706 (if medium)

Skill Tags:
  height: 28px
  padding: 4px 12px
  border_radius: 4px
  background: #E6F2FF
  font_size: 12px

Action Buttons:
  height: 40px
  width: calc(50% - 8px) = 147px
  border_radius: 8px
  margin_top: 12px
```

---

## 5. Booking Confirmation

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [<- Back]    Step 3 of 3         56px   |
+------------------------------------------+
|                                          |
|   Step 3 [===============] 100%          |
|                                          |
+------------------------------------------+
|                                          |
|   BOOKING SUMMARY                        |
|                                          |
| +--------------------------------------+ |
| | Service:     Plumbing                | |
| | Technician:  John Kamau              | |
| | Date/Time:   Today, 2:00 PM          | |
| | Location:    Westlands, Nairobi      | |
| | Problem:     Kitchen sink leak       | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   PRICING                                |
|                                          |
| +--------------------------------------+ |
| | Estimated Service:     KES 1,500     | |
| | Booking Fee:           KES 200       | |
| | -------------------------------------| |
| | To Pay Now:            KES 200       | |
| | Remaining on Completion: KES 1,300   | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   PAYMENT METHOD                         |
|                                          |
| +--------------------------------------+ |
| | [X] M-Pesa                            | |
| |     Phone: +254 7XX XXX XXX          | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [ ] Credit/Debit Card                | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
| By confirming, you agree to the          |
| Terms of Service and Privacy Policy      |
|                                          |
| [CONFIRM & PAY KES 200]         56px     |
|                                          |
+------------------------------------------+
```

### Specifications

```yaml
Summary Card:
  width: calc(100% - 32px) = 327px
  padding: 16px
  border_radius: 12px
  background: #F9FAFB

Pricing Card:
  width: calc(100% - 32px) = 327px
  padding: 16px
  border_radius: 12px
  border: 2px solid #0066CC

Price Text:
  font_size: 14px (labels)
  font_size: 20px (total)
  font_weight: 600

Payment Option:
  height: 56px
  padding: 12px 16px
  border_radius: 8px
  border: 1px solid #D1D5DB

Confirm Button:
  height: 56px
  width: calc(100% - 32px) = 327px
  background: #0066CC
  color: #FFFFFF
  font_size: 16px
  font_weight: 600
```

---

## 6. Technician Profile (Redesigned)

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [<- Back]   JOHN KAMAU           56px   |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| |                                      | |
| |    WORK GALLERY (Swipeable)          | |
| |                                      | |
| |    [PHOTO 1] [PHOTO 2] [PHOTO 3]     | |
| |                                      | |
| |    < • • ● • • >                     | |
| |                                      | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   [PHOTO] John Kamau       [4.8 Stars]   |
|   Verified Plumber                       |
|   12 years | 200+ jobs | Nairobi         |
|                                          |
|   [Verified] [Background Check]          |
|                                          |
+------------------------------------------+
|                                          |
|   SERVICES & PRICING                     |
|                                          |
| +--------------------------------------+ |
| | Pipe Repair.......KES 500/hr         | |
| | Tap Installation..KES 800/tap        | |
| | Drain Cleaning....KES 1,500 fixed    | |
| | Water Tank........KES 400/hr         | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   ABOUT JOHN                             |
|   "I specialize in residential plumbing  |
|    with 12 years of experience..."       |
|                                          |
+------------------------------------------+
|                                          |
|   CERTIFICATIONS                         |
|   [NCA License] [Plumbing Certificate]   |
|                                          |
+------------------------------------------+
|                                          |
|   REVIEWS (47)                  [See All]|
|                                          |
| +--------------------------------------+ |
| | "Great work, arrived on time..."      | |
| | - Mary W. | ***** | 2 days ago        | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [MESSAGE]              [BOOK NOW]  56px  |
|   156px                   171px          |
+------------------------------------------+
| [Home]  [Bookings]  [Messages]  [Profile]|
|                                    56px  |
+------------------------------------------+
```

### Specifications

```yaml
Work Gallery:
  height: 200px
  width: 100%
  border_radius: 0 (full width)
  indicator_dots: bottom center

Profile Section:
  padding: 16px
  photo_size: 80px
  photo_border: 3px solid #F3F4F6

Services Card:
  width: calc(100% - 32px) = 327px
  padding: 16px
  border_radius: 12px
  background: #F9FAFB

Service Item:
  height: 40px
  border_bottom: 1px solid #E5E7EB

Review Card:
  width: calc(100% - 32px) = 327px
  padding: 12px
  border_radius: 8px
  background: #F9FAFB

Bottom Actions:
  position: fixed bottom
  padding: 12px 16px
  gap: 12px
  button_height: 56px

Book Button:
  flex: 1
  background: #0066CC
  color: #FFFFFF

Message Button:
  width: 156px
  border: 2px solid #0066CC
  background: transparent
```

---

## 7. Technician Service Setup

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [<- Back]   YOUR SERVICES        56px   |
+------------------------------------------+
|                                          |
|   Step 2 [========        ] 50%          |
|                                          |
+------------------------------------------+
|                                          |
|   Tap services you offer:                |
|                                          |
|   PLUMBING SERVICES                      |
|                                          |
| +--------+ +--------+ +--------+         |
| | [X]    | | [X]    | | [ ]    |         |
| |  PIPE  | |  TAP   | | DRAIN  |         |
| | REPAIR | |INSTALL | |CLEANING|         |
| |SELECTED| |SELECTED | |        |         |
| +--------+ +--------+ +--------+         |
|                                          |
| +--------+ +--------+ +--------+         |
| | [ ]    | | [ ]    | | [ ]    |         |
| | TOILET | | WATER  | | BOILER |         |
| | REPAIR | |  TANK  | |SERVICE |         |
| |        | |        | |        |         |
| +--------+ +--------+ +--------+         |
|                                          |
+------------------------------------------+
|                                          |
|   YOUR SELECTED SERVICES (2)             |
|                                          |
| +--------------------------------------+ |
| | 1. Pipe Repair                   [X] | |
| |    Pricing: [X] Hourly  [ ] Fixed     | |
| |    Rate: KES [500] per hour           | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | 2. Tap Installation              [X] | |
| |    Pricing: [ ] Hourly  [X] Per Item  | |
| |    Rate: KES [800] per tap            | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   [+ ADD CUSTOM SERVICE]                 |
|                                          |
+------------------------------------------+
|                                          |
| [NEXT: Build Portfolio ->]      56px     |
|                                          |
+------------------------------------------+
```

### Specifications

```yaml
Selected Service Card:
  width: calc(100% - 32px) = 327px
  padding: 16px
  border_radius: 12px
  border: 2px solid #0066CC
  margin_bottom: 12px

Pricing Toggle:
  height: 40px
  width: calc(50% - 8px)
  border_radius: 8px
  selected_background: #0066CC

Rate Input:
  width: 120px
  height: 48px
  font_size: 18px
  font_weight: 600

Custom Service Button:
  height: 48px
  width: calc(100% - 32px) = 327px
  border: 2px dashed #D1D5DB
  background: transparent

Next Button:
  height: 56px
  width: calc(100% - 32px) = 327px
  background: #0066CC
  position: fixed bottom
```

---

## 8. Booking Tracking

### Mobile View (375px)

```
+------------------------------------------+
| Status Bar                        44px   |
+------------------------------------------+
| [<- Back]    BOOKING #BW-1234    56px   |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| |                                      | |
| |         LIVE MAP VIEW                | |
| |                                      | |
| |    [Customer Location]               | |
| |           |                          | |
| |           |  ETA: 15 min             | |
| |           v                          | |
| |    [Technician Moving]               | |
| |                                      | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   TECHNICIAN ARRIVING                    |
|                                          |
|   [PHOTO] John Kamau                     |
|   Electrician                             |
|                                          |
|   ETA: 15 minutes                        |
|   2.3 km away                            |
|                                          |
| +-----------+ +------------------------+ |
| | [CALL]    | | [MESSAGE]              | |
| +-----------+ +------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
|   BOOKING DETAILS                        |
|                                          |
|   Service: Plumbing - Pipe Repair        |
|   Address: Westlands, Nairobi            |
|   Time: Today, 2:00 PM                   |
|   Problem: Kitchen sink leak             |
|                                          |
+------------------------------------------+
|                                          |
|   [CANCEL BOOKING]                       |
|                                          |
+------------------------------------------+
| [Home]  [Bookings]  [Messages]  [Profile]|
|                                    56px  |
+------------------------------------------+
```

### Specifications

```yaml
Map View:
  height: 250px
  width: 100%
  border_radius: 0

Technician Card:
  padding: 16px
  border_bottom: 1px solid #E5E7EB

ETA Display:
  font_size: 32px
  font_weight: 700
  color: #0066CC

Action Buttons:
  height: 48px
  call_width: 80px
  message_width: calc(100% - 96px) = 231px
  gap: 8px

Booking Details:
  padding: 16px
  background: #F9FAFB

Cancel Button:
  height: 40px
  color: #DC2626
  border: none
  background: transparent
```

---

## Responsive Breakpoints

### Tablet (768px)

```
- 4 cards per row for service grid
- 5 items per row for WORD BANK
- 2 technician cards per row
- Sidebar for filters
```

### Desktop (1024px+)

```
- 6 cards per row for service grid
- 6 items per row for WORD BANK
- 3 technician cards per row
- Persistent sidebar
- Fixed header navigation
```

---

## Notes

1. All wireframes shown at 375px width (iPhone standard)
2. Status bar height varies by device (44px iPhone X+, 24px older)
3. Home indicator on iOS adds 34px at bottom
4. All touch targets are minimum 44x44px
5. Primary action buttons are 56px height
6. Font sizes never below 16px for body text on mobile
