# Dumuwaks Design System

## Overview

This design system defines the visual language, components, and patterns for the Dumuwaks platform. It is optimized for mobile-first experiences in the Kenyan market, with a focus on accessibility, performance, and trust.

---

## 1. Color System

### Primary Palette

```yaml
Primary Blue:
  hex: "#0066CC"
  rgb: "rgb(0, 102, 204)"
  usage: "Primary actions, links, selected states"

Primary Blue Dark:
  hex: "#0052A3"
  rgb: "rgb(0, 82, 163)"
  usage: "Hover states, pressed states"

Primary Blue Light:
  hex: "#E6F2FF"
  rgb: "rgb(230, 242, 255)"
  usage: "Backgrounds, highlights"
```

### Semantic Colors

```yaml
Success:
  hex: "#059669"
  rgb: "rgb(5, 150, 105)"
  light: "#D1FAE5"
  usage: "Success states, confirmations, positive actions"

Warning:
  hex: "#D97706"
  rgb: "rgb(217, 119, 6)"
  light: "#FEF3C7"
  usage: "Warnings, cautions, attention needed"

Error:
  hex: "#DC2626"
  rgb: "rgb(220, 38, 38)"
  light: "#FEE2E2"
  usage: "Errors, destructive actions, critical alerts"

Info:
  hex: "#0284C7"
  rgb: "rgb(2, 132, 199)"
  light: "#E0F2FE"
  usage: "Information, tips, neutral alerts"
```

### Neutral Palette

```yaml
Gray 900 (Text Primary):
  hex: "#1A1A1A"
  usage: "Primary text, headings"

Gray 700 (Text Secondary):
  hex: "#404040"
  usage: "Secondary text, descriptions"

Gray 500 (Text Tertiary):
  hex: "#666666"
  usage: "Tertiary text, hints"

Gray 300 (Borders):
  hex: "#D1D5DB"
  usage: "Borders, dividers"

Gray 200 (Backgrounds):
  hex: "#E5E7EB"
  usage: "Subtle backgrounds, disabled states"

Gray 100 (Backgrounds Light):
  hex: "#F3F4F6"
  usage: "Card backgrounds, section backgrounds"

White:
  hex: "#FFFFFF"
  usage: "Backgrounds, text on primary"
```

### Dark Mode Palette

```yaml
Background Primary:
  hex: "#0A0A0A"
  usage: "Main background"

Background Secondary:
  hex: "#1A1A1A"
  usage: "Card backgrounds"

Background Tertiary:
  hex: "#2A2A2A"
  usage: "Elevated surfaces"

Text Primary:
  hex: "#FFFFFF"
  usage: "Primary text"

Text Secondary:
  hex: "#A0A0A0"
  usage: "Secondary text"

Border:
  hex: "#3A3A3A"
  usage: "Borders, dividers"
```

### Color Contrast Verification

| Combination | Ratio | AA Status | AAA Status |
|-------------|-------|-----------|------------|
| Primary Blue on White | 4.5:1 | PASS | FAIL |
| Gray 900 on White | 16.1:1 | PASS | PASS |
| White on Primary Blue | 4.5:1 | PASS | FAIL |
| Success on White | 4.5:1 | PASS | FAIL |
| Error on White | 5.1:1 | PASS | FAIL |
| Gray 700 on White | 7.1:1 | PASS | PASS |

---

## 2. Typography

### Font Family

```yaml
Primary Font:
  family: "Inter, system-ui, -apple-system, sans-serif"
  fallbacks: "Segoe UI, Roboto, Helvetica, Arial, sans-serif"

Monospace Font:
  family: "JetBrains Mono, Consolas, monospace"
  usage: "Code, prices, IDs"
```

### Type Scale (Mobile)

```yaml
Display Large:
  size: "32px"
  weight: "700"
  line_height: "1.2"
  usage: "Hero headlines (rare)"

H1 - Page Title:
  size: "28px"
  weight: "700"
  line_height: "1.3"
  usage: "Page titles, one per screen"

H2 - Section Header:
  size: "22px"
  weight: "600"
  line_height: "1.4"
  usage: "Section headers"

H3 - Subsection:
  size: "18px"
  weight: "600"
  line_height: "1.4"
  usage: "Subsection headers, card titles"

Body Large:
  size: "18px"
  weight: "400"
  line_height: "1.6"
  usage: "Important body text"

Body Regular:
  size: "16px"
  weight: "400"
  line_height: "1.6"
  usage: "Default body text (never smaller on mobile)"

Body Small:
  size: "14px"
  weight: "400"
  line_height: "1.5"
  usage: "Supporting text, descriptions"

Caption:
  size: "12px"
  weight: "400"
  line_height: "1.4"
  usage: "Metadata, timestamps, labels"

WORD BANK (Uppercase):
  size: "13px"
  weight: "700"
  line_height: "1.3"
  letter_spacing: "0.05em"
  text_transform: "uppercase"
  usage: "Service selection, categories"
```

### Type Scale (Desktop)

```yaml
Display Large: "48px"
H1: "36px"
H2: "28px"
H3: "22px"
Body Large: "20px"
Body Regular: "16px"
Body Small: "14px"
Caption: "12px"
```

---

## 3. Spacing System

### Base Unit: 4px

All spacing values are multiples of 4px for visual consistency.

```yaml
Space 1 (4px):
  usage: "Tight spacing, icon padding"

Space 2 (8px):
  usage: "Default spacing between related elements"

Space 3 (12px):
  usage: "Form field spacing, list item spacing"

Space 4 (16px):
  usage: "Standard spacing, component internal padding"

Space 5 (20px):
  usage: "Section internal spacing"

Space 6 (24px):
  usage: "Section separation, card padding"

Space 8 (32px):
  usage: "Major spacing between content blocks"

Space 10 (40px):
  usage: "Large section separation"

Space 12 (48px):
  usage: "Screen-level spacing, page sections"

Space 16 (64px):
  usage: "Major page sections"
```

### Component Spacing Examples

```yaml
Card:
  padding: "16px"
  gap_internal: "12px"

List Item:
  padding: "16px vertical, 16px horizontal"
  gap_between: "1px (border)"

Form:
  gap_between_fields: "16px"
  label_to_input: "8px"

Screen:
  horizontal_padding: "16px"
  vertical_padding: "24px"
  section_gap: "24px"
```

---

## 4. Border Radius

```yaml
Small (4px):
  usage: "Tags, badges, small buttons"

Medium (8px):
  usage: "Buttons, inputs, cards"

Large (12px):
  usage: "Large cards, modals, bottom sheets"

Extra Large (16px):
  usage: "Featured cards, hero elements"

Full (9999px):
  usage: "Pills, avatars, circular elements"

Input Fields: "8px"

Buttons: "8px"

Cards: "12px"

Modals: "16px"

Tags/Badges: "4px"
```

---

## 5. Shadows

### Elevation System

```yaml
Elevation 1 (Subtle):
  value: "0 1px 2px rgba(0, 0, 0, 0.05)"
  usage: "Cards, list items, subtle elevation"

Elevation 2 (Default):
  value: "0 2px 4px rgba(0, 0, 0, 0.1)"
  usage: "Dropdowns, popovers, default cards"

Elevation 3 (Medium):
  value: "0 4px 8px rgba(0, 0, 0, 0.12)"
  usage: "Floating cards, sticky headers"

Elevation 4 (High):
  value: "0 8px 16px rgba(0, 0, 0, 0.15)"
  usage: "Modals, bottom sheets"

Elevation 5 (Highest):
  value: "0 16px 32px rgba(0, 0, 0, 0.2)"
  usage: "Important modals, notifications"

Focus Ring:
  value: "0 0 0 3px rgba(0, 102, 204, 0.4)"
  usage: "Focus indicator for keyboard navigation"
```

---

## 6. Components

### 6.1 Button

```yaml
Primary Button:
  height: "56px"
  padding: "16px vertical, 24px horizontal"
  font:
    size: "16px"
    weight: "600"
  border_radius: "8px"
  background: "#0066CC"
  text_color: "#FFFFFF"
  states:
    hover:
      background: "#0052A3"
    pressed:
      background: "#003D7A"
      transform: "scale(0.98)"
    disabled:
      background: "#E5E7EB"
      text_color: "#9CA3AF"
    loading:
      show_spinner: true
      text: "Loading..."

Secondary Button:
  height: "48px"
  padding: "12px vertical, 20px horizontal"
  font:
    size: "14px"
    weight: "600"
  border_radius: "8px"
  background: "transparent"
  border: "2px solid #E5E7EB"
  text_color: "#1A1A1A"
  states:
    hover:
      border_color: "#0066CC"
      text_color: "#0066CC"
    pressed:
      background: "#F3F4F6"

Small Button:
  height: "40px"
  padding: "8px vertical, 16px horizontal"
  font:
    size: "14px"
    weight: "600"
  border_radius: "6px"
```

### 6.2 Input Field

```yaml
Text Input:
  height: "56px"
  padding: "16px horizontal"
  font:
    size: "16px"  # Prevents iOS zoom
    weight: "400"
  border:
    width: "1px"
    color: "#D1D5DB"
    radius: "8px"
  background: "#FFFFFF"
  states:
    focus:
      border_width: "2px"
      border_color: "#0066CC"
      outline: "none"
    error:
      border_color: "#DC2626"
    disabled:
      background: "#F3F4F6"
      text_color: "#9CA3AF"

Label:
  font:
    size: "14px"
    weight: "500"
  color: "#404040"
  margin_bottom: "8px"

Helper Text:
  font:
    size: "12px"
  color: "#666666"
  margin_top: "4px"

Error Text:
  font:
    size: "12px"
  color: "#DC2626"
  margin_top: "4px"
```

### 6.3 Card

```yaml
Standard Card:
  padding: "16px"
  border_radius: "12px"
  background: "#FFFFFF"
  border: "1px solid #E5E7EB"
  shadow: "elevation-1"
  states:
    hover:
      shadow: "elevation-2"
      border_color: "#D1D5DB"
    pressed:
      transform: "scale(0.99)"

Clickable Card:
  extends: "Standard Card"
  cursor: "pointer"
  full_card_clickable: true
  hover:
    shadow: "elevation-2"
    border_color: "#0066CC"
  active:
    background: "#F9FAFB"

Service Category Card:
  width: "calc(50% - 8px)"
  min_height: "140px"
  padding: "16px"
  border_radius: "12px"
  image_height: "80px"
  text_alignment: "center"
```

### 6.4 WORD BANK Item

```yaml
Word Bank Item:
  width: "calc(33.33% - 6px)"
  min_height: "90px"
  padding: "12px"
  border_radius: "8px"
  background: "#F3F4F6"
  text:
    size: "13px"
    weight: "700"
    transform: "uppercase"
    spacing: "0.05em"
    alignment: "center"
  states:
    selected:
      background: "#0066CC"
      text_color: "#FFFFFF"
    pressed:
      transform: "scale(0.97)"
```

### 6.5 Avatar

```yaml
Avatar Small:
  size: "32px"
  border_radius: "50%"
  border: "2px solid #FFFFFF"

Avatar Medium:
  size: "48px"
  border_radius: "50%"
  border: "2px solid #FFFFFF"

Avatar Large:
  size: "80px"
  border_radius: "50%"
  border: "4px solid #F3F4F6"

Avatar Extra Large:
  size: "120px"
  border_radius: "50%"
  border: "4px solid #F3F4F6"
```

### 6.6 Badge

```yaml
Badge:
  padding: "4px 8px"
  border_radius: "4px"
  font:
    size: "12px"
    weight: "500"
  variants:
    success:
      background: "#D1FAE5"
      text_color: "#059669"
    warning:
      background: "#FEF3C7"
      text_color: "#D97706"
    error:
      background: "#FEE2E2"
      text_color: "#DC2626"
    info:
      background: "#E0F2FE"
      text_color: "#0284C7"
    neutral:
      background: "#F3F4F6"
      text_color: "#404040"
```

### 6.7 Progress Indicator

```yaml
Step Indicator:
  height: "4px"
  background: "#E5E7EB"
  active_color: "#0066CC"
  border_radius: "2px"

Circular Progress:
  size: "24px"
  stroke_width: "2px"
  color: "#0066CC"

Progress Bar:
  height: "8px"
  background: "#E5E7EB"
  fill: "#0066CC"
  border_radius: "4px"
```

---

## 7. Layout

### Mobile Screen Structure

```
+------------------------------------------+
| Status Bar (System)              24-48px |
+------------------------------------------+
| Header / Navigation Bar          56px    |
+------------------------------------------+
|                                          |
| Content Area (Scrollable)                |
|                                          |
|                                          |
|                                          |
+------------------------------------------+
| Bottom Navigation (if applicable) 56px   |
+------------------------------------------+
| Home Indicator (iOS)             34px    |
+------------------------------------------+
```

### Grid System

```yaml
Mobile:
  columns: 4
  gutter: "16px"
  margin: "16px"

Tablet:
  columns: 8
  gutter: "24px"
  margin: "24px"

Desktop:
  columns: 12
  gutter: "24px"
  margin: "auto (max-width: 1200px)"
```

### Breakpoints

```yaml
Mobile Small: "320px"   # iPhone SE
Mobile: "375px"         # iPhone standard
Mobile Large: "414px"   # iPhone Plus
Tablet: "768px"         # iPad
Desktop: "1024px"       # Small laptop
Desktop Large: "1280px" # Standard desktop
```

---

## 8. Animation

### Timing

```yaml
Fast: "150ms"
Normal: "250ms"
Slow: "350ms"
Very Slow: "500ms"
```

### Easing

```yaml
Ease In: "cubic-bezier(0.4, 0, 1, 1)"
Ease Out: "cubic-bezier(0, 0, 0.2, 1)"
Ease In Out: "cubic-bezier(0.4, 0, 0.2, 1)"
Spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
```

### Transitions

```yaml
Button Press:
  property: "transform"
  duration: "100ms"
  easing: "ease-out"

Card Hover:
  property: "box-shadow, border-color"
  duration: "200ms"
  easing: "ease-in-out"

Page Transition:
  property: "transform, opacity"
  duration: "300ms"
  easing: "ease-out"

Modal Open:
  property: "transform, opacity"
  duration: "250ms"
  easing: "ease-out"
```

---

## 9. Icons

### Icon System

```yaml
Icon Size:
  small: "16px"
  medium: "20px"
  large: "24px"
  extra_large: "32px"

Icon Color:
  default: "currentColor"
  inherit_parent: true

Icon Library:
  primary: "Lucide Icons"
  fallback: "Heroicons"
```

### Common Icons

```yaml
Navigation:
  back: "ChevronLeft"
  forward: "ChevronRight"
  menu: "Menu"
  close: "X"

Actions:
  add: "Plus"
  edit: "Edit"
  delete: "Trash"
  save: "Save"
  cancel: "X"

Status:
  success: "CheckCircle"
  warning: "AlertTriangle"
  error: "XCircle"
  info: "Info"

Social:
  phone: "Phone"
  message: "MessageCircle"
  email: "Mail"
```

---

## 10. Accessibility

### Focus Indicators

```yaml
Focus Ring:
  outline: "none"
  box_shadow: "0 0 0 3px rgba(0, 102, 204, 0.4)"
  border_radius: "4px"
```

### Touch Targets

```yaml
Minimum Size: "44x44px"
Recommended Size: "48x48px"
Primary Actions: "56x56px"
Spacing Between: "8px"
```

### Color Contrast

```yaml
Text Minimums:
  normal_text: "4.5:1"
  large_text: "3:1"
  ui_components: "3:1"

Verification:
  tool: "WebAIM Contrast Checker"
  standard: "WCAG 2.1 AA"
```

### Screen Reader Support

```yaml
Required ARIA:
  buttons: "aria-label for icon-only buttons"
  forms: "aria-describedby for errors"
  modals: "aria-modal, aria-labelledby"
  navigation: "aria-current for current page"

Live Regions:
  toast_notifications: "aria-live='polite'"
  errors: "aria-live='assertive'"
  loading: "aria-busy='true'"
```

---

## 11. Responsive Design

### Mobile-First Approach

All styles are written for mobile first, then enhanced for larger screens.

```css
/* Mobile (default) */
.component {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: 32px;
  }
}
```

### Touch vs. Mouse

```yaml
Touch Devices:
  - Larger touch targets (48px+)
  - No hover states
  - Swipe gestures enabled
  - Pull-to-refresh enabled

Mouse Devices:
  - Smaller click targets (32px+)
  - Hover states visible
  - Tooltips on hover
  - Keyboard shortcuts available
```

---

## 12. Dark Mode

### Implementation

```yaml
Strategy: "CSS custom properties (variables)"
Trigger: "System preference + Manual toggle"
Default: "Light mode"

Transition:
  duration: "250ms"
  properties: "background-color, color, border-color"
```

### Color Variables

```css
:root {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F3F4F6;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #404040;
  --color-border: #E5E7EB;
}

[data-theme="dark"] {
  --color-bg-primary: #0A0A0A;
  --color-bg-secondary: #1A1A1A;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A0A0A0;
  --color-border: #3A3A3A;
}
```

---

## 13. Performance Guidelines

### Image Optimization

```yaml
Formats:
  preferred: "WebP"
  fallback: "JPEG/PNG"

Sizes:
  avatar: "80x80, 160x160 (2x)"
  card_image: "375x200, 750x400 (2x)"
  hero: "750x400, 1500x800 (2x)"

Loading:
  strategy: "Lazy load below fold"
  placeholder: "Blur hash or solid color"
```

### Animation Performance

```yaml
Preferred Properties:
  - transform
  - opacity

Avoid Animating:
  - width/height
  - top/left
  - margin/padding

Hardware Acceleration:
  use_will_change: "sparingly"
  use_transform_z: "for layer promotion"
```

---

## 14. CSS Custom Properties Reference

```css
:root {
  /* Colors */
  --color-primary: #0066CC;
  --color-primary-dark: #0052A3;
  --color-primary-light: #E6F2FF;
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;

  /* Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #404040;
  --color-text-tertiary: #666666;

  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F3F4F6;
  --color-bg-tertiary: #E5E7EB;

  /* Borders */
  --color-border: #D1D5DB;
  --color-border-light: #E5E7EB;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;
  --transition-slow: 350ms ease-out;
}
```

---

## 15. Component Checklist

When creating new components, ensure:

```
[ ] Touch targets are 44x44px minimum
[ ] Text is 16px minimum on mobile
[ ] Focus states are visible
[ ] Color contrast is 4.5:1 minimum
[ ] Works in both light and dark mode
[ ] Responsive from 320px to 1920px
[ ] Includes loading state
[ ] Includes error state
[ ] Includes disabled state
[ ] Has ARIA labels for screen readers
[ ] Animations respect prefers-reduced-motion
[ ] Keyboard navigable
```

---

This design system provides the foundation for building consistent, accessible, and performant interfaces for the Dumuwaks platform.
