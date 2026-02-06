# Design System Architecture - Dumu Waks Platform

*Comprehensive Design System for X/Twitter-Inspired Marketplace*
*Generated: 2025-02-06*

## Executive Summary

This document outlines the complete design system architecture for the Dumu Waks technician marketplace platform. The system combines X/Twitter's dark theme aesthetics with marketplace-specific patterns, optimized for the Kenyan mobile-first market.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Library](#component-library)
7. [Pattern Library](#pattern-library)
8. [Animation & Motion](#animation--motion)
9. [Accessibility Standards](#accessibility-standards)
10. [Implementation Guide](#implementation-guide)

---

## Design Philosophy

### Core Principles

1. **Dark-First Design**: Optimized for dark theme with true black background
2. **Mobile-First**: 85%+ Kenyan users on mobile - design mobile-first
3. **Brand-Driven**: All interactions reinforce Dumu Waks brand
4. **Accessibility First**: WCAG AA compliance minimum
5. **Performance-Conscious**: Optimized for variable network conditions

### Visual Language

| Attribute | Value | Inspiration |
|-----------|-------|-------------|
| Theme | Dark Mode | X/Twitter 2025 |
| Accent | Orange-500 | Dumu Waks brand |
| Style | Minimalist, card-based | Modern marketplaces |
| Effects | Subtle glassmorphism | iOS/macOS influence |
| Layout | Grid + Flexbox | Modern CSS standards |

---

## Design Tokens

### Token Structure

```
dw/
├── color/
│   ├── base/
│   ├── semantic/
│   └── brand/
├── typography/
│   ├── font-family/
│   ├── font-size/
│   ├── font-weight/
│   └── line-height/
├── spacing/
│   ├── scale/
│   └── breakpoints/
├── border/
│   ├── radius/
│   └── width/
├── shadow/
│   ├── elevation/
│   └── ambient/
├── effect/
│   ├── blur/
│   └── transition/
└── z-index/
```

### Token Naming Convention

```css
/* Format: --dw-{category}-{variant}-{modifier} */
--dw-color-bg-primary
--dw-color-text-secondary
--dw-spacing-lg
--dw-radius-md
--dw-shadow-lg
```

---

## Color System

### Primary Palette

```css
:root {
  /* === Base Colors (X-Inspired) === */
  --dw-color-black: #000000;
  --dw-color-dark-gray: #16181c;
  --dw-color-medium-gray: #2f3336;
  --dw-color-light-gray: #71767b;
  --dw-color-off-white: #e7e9ea;

  /* === Brand Colors (Dumu Waks Orange) === */
  --dw-color-orange-50: #fff7ed;
  --dw-color-orange-100: #ffedd5;
  --dw-color-orange-200: #fed7aa;
  --dw-color-orange-300: #fdba74;
  --dw-color-orange-400: #fb923c;
  --dw-color-orange-500: #f97316;
  --dw-color-orange-600: #ea580c;
  --dw-color-orange-700: #c2410c;
  --dw-color-orange-800: #9a3412;
  --dw-color-orange-900: #7c2d12;

  /* === Semantic Colors === */
  --dw-color-success: #00ba7c;
  --dw-color-success-light: rgba(0, 186, 124, 0.15);
  --dw-color-warning: #f0c929;
  --dw-color-warning-light: rgba(240, 201, 41, 0.15);
  --dw-color-error: #f4212e;
  --dw-color-error-light: rgba(244, 33, 46, 0.15);
  --dw-color-info: #1d9bf0;
  --dw-color-info-light: rgba(29, 155, 240, 0.15);
}
```

### Semantic Color Mapping

| Usage | Light Mode | Dark Mode |
|-------|------------|-----------|
| Background Primary | #ffffff | #000000 |
| Background Secondary | #f7f9fa | #16181c |
| Background Tertiary | #eff3f4 | #2f3336 |
| Text Primary | #0a0a0a | #e7e9ea |
| Text Secondary | #536471 | #71767b |
| Text Tertiary | #8b98a5 | #8b98a5 |
| Border Subtle | rgba(0,0,0,0.1) | rgba(255,255,255,0.08) |
| Border Default | rgba(0,0,0,0.15) | rgba(255,255,255,0.12) |
| Border Strong | rgba(0,0,0,0.2) | rgba(255,255,255,0.2) |

---

## Typography

### Font Stack

```css
:root {
  /* Primary: Inter (Google Fonts) */
  --dw-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

  /* Monospace: JetBrains Mono */
  --dw-font-family-mono: 'JetBrains Mono', 'SF Mono', Monaco,
    'Cascadia Code', 'Roboto Mono', Consolas, monospace;

  /* Display: System fonts for large headings */
  --dw-font-family-display: -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, sans-serif;
}
```

### Type Scale

```css
:root {
  /* Display */
  --dw-text-display-xl: 48px;
  --dw-text-display-lg: 40px;
  --dw-text-display-md: 32px;

  /* Headings */
  --dw-text-heading-xl: 24px;
  --dw-text-heading-lg: 20px;
  --dw-text-heading-md: 18px;
  --dw-text-heading-sm: 16px;

  /* Body */
  --dw-text-body-lg: 16px;
  --dw-text-body-md: 15px;
  --dw-text-body-sm: 14px;

  /* Meta */
  --dw-text-meta: 13px;
  --dw-text-caption: 12px;
  --dw-text-tiny: 11px;
}

/* Line Heights */
:root {
  --dw-leading-tight: 1.2;
  --dw-leading-snug: 1.35;
  --dw-leading-normal: 1.5;
  --dw-leading-relaxed: 1.65;
}

/* Font Weights */
:root {
  --dw-weight-light: 300;
  --dw-weight-regular: 400;
  --dw-weight-medium: 500;
  --dw-weight-semibold: 600;
  --dw-weight-bold: 700;
}
```

### Typography Usage

| Element | Size | Weight | Line Height | Use Case |
|---------|------|--------|-------------|----------|
| H1 | 32px | 700 | 1.2 | Page titles |
| H2 | 24px | 700 | 1.3 | Section headers |
| H3 | 20px | 600 | 1.4 | Subsection headers |
| H4 | 18px | 600 | 1.4 | Card titles |
| Body | 15px | 400 | 1.5 | Content text |
| Small | 14px | 400 | 1.5 | Secondary text |
| Caption | 13px | 500 | 1.4 | Labels, metadata |
| Tiny | 12px | 500 | 1.4 | Timestamps, footnotes |

---

## Spacing & Layout

### Spacing Scale

```css
:root {
  --dw-spacing-0: 0;
  --dw-spacing-1: 4px;
  --dw-spacing-2: 8px;
  --dw-spacing-3: 12px;
  --dw-spacing-4: 16px;
  --dw-spacing-5: 20px;
  --dw-spacing-6: 24px;
  --dw-spacing-8: 32px;
  --dw-spacing-10: 40px;
  --dw-spacing-12: 48px;
  --dw-spacing-16: 64px;
  --dw-spacing-20: 80px;
  --dw-spacing-24: 96px;
}
```

### Breakpoints

```css
:root {
  --dw-breakpoint-xs: 375px;
  --dw-breakpoint-sm: 640px;
  --dw-breakpoint-md: 768px;
  --dw-breakpoint-lg: 1024px;
  --dw-breakpoint-xl: 1280px;
  --dw-breakpoint-2xl: 1536px;
}

/* Mobile-first media queries */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Container Widths

```css
:root {
  --dw-container-xs: 100%;
  --dw-container-sm: 640px;
  --dw-container-md: 768px;
  --dw-container-lg: 1024px;
  --dw-container-xl: 1280px;
  --dw-container-2xl: 1536px;
}
```

### Border Radius

```css
:root {
  --dw-radius-none: 0;
  --dw-radius-sm: 4px;
  --dw-radius-md: 8px;
  --dw-radius-lg: 12px;
  --dw-radius-xl: 16px;
  --dw-radius-2xl: 24px;
  --dw-radius-full: 9999px;
}
```

---

## Component Library

### Atomic Design Structure

```
atoms/
├── buttons/
│   ├── Button.tsx
│   ├── ButtonPrimary.tsx
│   ├── ButtonSecondary.tsx
│   └── ButtonGhost.tsx
├── inputs/
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   └── Checkbox.tsx
├── badges/
│   ├── Badge.tsx
│   ├── VerificationBadge.tsx
│   └── StatusBadge.tsx
├── icons/
│   └── Icon.tsx
└── typography/
    ├── Heading.tsx
    ├── Text.tsx
    └── Link.tsx

molecules/
├── cards/
│   ├── ServiceCard.tsx
│   ├── TechnicianCard.tsx
│   └── ReviewCard.tsx
├── forms/
│   ├── SearchInput.tsx
│   ├── DatePicker.tsx
│   └── LocationPicker.tsx
├── navigation/
│   ├── TabItem.tsx
│   └── Breadcrumb.tsx
└── feedback/
    ├── Toast.tsx
    ├── Alert.tsx
    └── Tooltip.tsx

organisms/
├── layouts/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── BottomNav.tsx
│   └── Footer.tsx
├── sections/
│   ├── ServiceGrid.tsx
│   ├── TechnicianList.tsx
│   └── ReviewsSection.tsx
└── templates/
    ├── BookingFlow.tsx
    ├── ProfilePage.tsx
    └── SearchResults.tsx
```

### Button Component

```typescript
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

// Variants
const variants = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600',
  secondary: 'bg-transparent border border-white/20 text-white',
  ghost: 'bg-transparent text-orange-500 hover:bg-orange-500/10',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20'
};

// Sizes
const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};
```

### Card Component

```typescript
// ServiceCard.tsx
interface ServiceCardProps {
  technician: {
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
  };
  service: {
    title: string;
    description: string;
    price: number;
    location: string;
  };
  onBook: () => void;
}
```

---

## Pattern Library

### Navigation Patterns

#### Desktop Sidebar (275px)

```
+------------------+
|  [Logo]          |
+------------------+
|  [Home]          |
|  [Search]        |
|  [Bookings]      |
|  [Messages]      |
|  [Profile]       |
+------------------+
|  [Post Job]      |
+------------------+
```

#### Mobile Bottom Nav (60px)

```
+----------------------------------+
| [Home] [Search] [Bookings] [Me] |
+----------------------------------+
```

### Card Patterns

#### Service Card (X-Style Tweet)

```
+------------------------------------------+
| [Avatar] Name ✓    •    Time        [⋮] |
|         @handle                                |
|                                          |
| Service description here...                 |
|                                          |
| [Image if present]                         |
|                                          |
| 📍 Location • 💰 Price                [Book] |
+------------------------------------------+
```

#### Technician Profile Card

```
+------------------------------------------+
| [Avatar] Name ★ 4.9               Verified |
|          Title                          |
|          Location • Since 2020          |
|                                          |
|  [Skills] [Experience] [Response Time]   |
|                                          |
|  [View Profile]        [Book Now]        |
+------------------------------------------+
```

### Form Patterns

#### Search & Filter

```
+------------------------------------------+
| 🔍 Search services...           [Filter] |
+------------------------------------------+
|                                          |
| Filters:                                 |
| ◉ Near me                                |
| ◉ Available today                        |
| ○ Rated 4+ stars                         |
|                                          |
| Clear all                                |
+------------------------------------------+
```

#### Booking Flow

```
Step 1 → Step 2 → Step 3 → Step 4 → Confirm

Each step:
- Clear title
- Single focus
- Progress indicator
- Back/Next navigation
```

---

## Animation & Motion

### Animation Tokens

```css
:root {
  /* Durations */
  --dw-duration-instant: 100ms;
  --dw-duration-fast: 200ms;
  --dw-duration-normal: 300ms;
  --dw-duration-slow: 500ms;

  /* Easing */
  --dw-ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --dw-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --dw-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --dw-ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);

  /* Springs */
  --dw-spring-default: 400px cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Motion Principles

1. **Purposeful**: Every animation serves a purpose
2. **Subtle**: Prefer micro-interactions over large movements
3. **Respectful**: Honor `prefers-reduced-motion`
4. **Performant**: Use transform/opacity only

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

### WCAG 2.2 Compliance

| Level | Requirement | Status |
|-------|-------------|--------|
| A | Basic accessibility | Compliant |
| AA | 4.5:1 contrast | Compliant |
| AAA | 7:1 contrast | Target |

### Keyboard Navigation

```typescript
// Focus management
const FocusTrap = ({ children, active }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [active]);

  return <div ref={ref}>{children}</div>;
};
```

### Screen Reader Support

```typescript
// ARIA labels
<Button
  aria-label="Book technician John Kamau"
  aria-describedby="booking-info"
>
  Book Now
</Button>

<span id="booking-info" className="sr-only">
  Opens booking form for electrical repair service
</span>
```

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--dw-color-orange-500);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Component-specific focus states */
.btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.input:focus {
  border-color: var(--dw-color-orange-500);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}
```

---

## Implementation Guide

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dumu Waks brand colors
        dw: {
          black: '#000000',
          dark: '#16181c',
          medium: '#2f3336',
          light: '#71767b',
          white: '#e7e9ea',

          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
          },

          success: '#00ba7c',
          warning: '#f0c929',
          error: '#f4212e',
          info: '#1d9bf0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ]
};
```

### Component Styling Approach

```typescript
// Example: ServiceCard component
import { cn } from '@/utils/cn';

interface ServiceCardProps {
  className?: string;
  // ... other props
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  className,
  ...props
}) => {
  return (
    <article
      className={cn(
        // Base styles
        'p-4 border-b border-white/8 transition-colors',
        'hover:bg-white/3 cursor-pointer',
        // Dark theme
        'bg-black',
        // Responsive
        'grid grid-cols-[auto_1fr] gap-3 md:gap-4',
        className
      )}
      {...props}
    >
      {/* Card content */}
    </article>
  );
};
```

### CSS-in-JS Alternative (Styled Components)

```typescript
import styled from 'styled-components';

const ServiceCard = styled.article`
  padding: var(--dw-spacing-4);
  border-bottom: 1px solid var(--dw-border-subtle);
  transition: background var(--dw-duration-fast) var(--dw-ease-default);
  background: var(--dw-color-black);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--dw-spacing-3);

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  @media (min-width: 768px) {
    gap: var(--dw-spacing-4);
  }
`;
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1-2)

1. Set up design tokens
2. Configure Tailwind/CSS variables
3. Create base styles
4. Implement dark theme toggle

### Phase 2: Core Components (Week 3-4)

1. Button components
2. Input components
3. Card components
4. Navigation components

### Phase 3: Page Templates (Week 5-6)

1. Homepage
2. Search/results page
3. Technician profile page
4. Booking flow pages
5. User dashboard

### Phase 4: Polish & Test (Week 7-8)

1. Micro-interactions
2. Animations
3. Accessibility audit
4. Performance optimization
5. Cross-browser testing

---

## Sources & References

- X/Twitter Design System (2024-2025)
- Apple Human Interface Guidelines
- Material Design 3
- WCAG 2.2 Guidelines
- Previous research documents in this folder

---

*Document Version: 1.0*
*Last Updated: 2025-02-06*

## Next Steps

1. Review and approve design system
2. Begin component implementation
3. Create Storybook/Docz documentation
4. Set up design token management
5. Initiate migration execution
