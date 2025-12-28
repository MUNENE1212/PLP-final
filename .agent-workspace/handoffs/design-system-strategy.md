# Design System Strategy for Dumu Waks PWA

**Prepared By**: Orchestrator Agent  
**Date**: 2025-12-28  
**For**: Design and Implementation Agents  
**Project Phase**: Design System Development

---

## 1. Design Philosophy

### Core Principles

1. **Mobile-First**: Design for thumb zone, optimize touch targets, prioritize gestures
2. **Performance**: Animations serve purpose, never sacrifice speed for effects
3. **Accessibility**: WCAG 2.1 AA minimum, design for everyone
4. **Consistency**: Design tokens drive all decisions, systematic approach
5. **Delight**: Micro-interactions create emotional connection

### Brand Personality

- **Professional**: Trust, reliability, expertise
- **Modern**: Forward-thinking, innovative, tech-savvy
- **Warm**: Human, approachable, friendly
- **Dynamic**: Energy, movement, progress

---

## 2. Design Tokens

### 2.1 Color System

#### Primary Palette (Warm Orange - Energy & Action)

```css
/* Primary - Orange */
--color-primary-50: #fff7ed;
--color-primary-100: #ffedd5;
--color-primary-200: #fed7aa;
--color-primary-300: #fdba74;
--color-primary-400: #fb923c;
--color-primary-500: #f97316;  /* Main brand color */
--color-primary-600: #ea580c;
--color-primary-700: #c2410c;
--color-primary-800: #9a3412;
--color-primary-900: #7c2d12;
```

**Rationale**: Orange conveys energy, warmth, and action. It stands out from the sea of blue competitors and feels more human and approachable.

#### Secondary Palette (Teal - Trust & Growth)

```css
/* Secondary - Teal */
--color-secondary-50: #f0fdfa;
--color-secondary-100: #ccfbf1;
--color-secondary-200: #99f6e4;
--color-secondary-300: #5eead4;
--color-secondary-400: #2dd4bf;
--color-secondary-500: #14b8a6;
--color-secondary-600: #0d9488;
--color-secondary-700: #0f766e;
--color-secondary-800: #115e59;
--color-secondary-900: #134e4a;
```

**Rationale**: Teal provides trustworthy, calming contrast to orange. Used for success states, CTAs on orange backgrounds, and information.

#### Semantic Colors

```css
/* Success */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-700: #15803d;

/* Warning */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-700: #b45309;

/* Error */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-700: #b91c1c;

/* Info */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-700: #1d4ed8;
```

#### Neutral Palette (Warm Grays)

```css
/* Neutral - Warm Gray */
--color-neutral-50: #fafaf9;
--color-neutral-100: #f5f5f4;
--color-neutral-200: #e7e5e4;
--color-neutral-300: #d6d3d1;
--color-neutral-400: #a8a29e;
--color-neutral-500: #78716c;
--color-neutral-600: #57534e;
--color-neutral-700: #44403c;
--color-neutral-800: #292524;
--color-neutral-900: #1c1917;
```

#### Dark Mode Overrides

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Background: True black for OLED */
    --color-bg-primary: #000000;
    --color-bg-secondary: #0a0a0a;
    --color-bg-tertiary: #141414;
    --color-bg-elevated: #1a1a1a;
    
    /* Text: Reduced saturation */
    --color-text-primary: #fafafa;
    --color-text-secondary: #a1a1aa;
    --color-text-tertiary: #71717a;
    
    /* Primary colors: Slightly muted for dark mode */
    --color-primary-500: #fb923c;  /* Lighter for contrast */
    --color-secondary-500: #2dd4bf;
  }
}
```

#### Gradients

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
--gradient-primary-reverse: linear-gradient(135deg, #ea580c 0%, #f97316 100%);

/* Accent Gradient */
--gradient-accent: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);

/* Mesh Gradient (for hero backgrounds) */
--gradient-mesh: 
  radial-gradient(at 40% 20%, hsla(25, 95%, 53%, 0.3) 0px, transparent 50%),
  radial-gradient(at 80% 0%, hsla(189, 77%, 44%, 0.3) 0px, transparent 50%),
  radial-gradient(at 0% 50%, hsla(355, 85%, 55%, 0.2) 0px, transparent 50%),
  radial-gradient(at 80% 50%, hsla(340, 75%, 55%, 0.2) 0px, transparent 50%),
  radial-gradient(at 0% 100%, hsla(22, 100%, 55%, 0.2) 0px, transparent 50%),
  radial-gradient(at 80% 100%, hsla(242, 100%, 70%, 0.2) 0px, transparent 50%);
```

### 2.2 Typography System

#### Font Families

```css
/* Display Font - Headings */
--font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;

/* Body Font - UI and Content */
--font-body: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace - Code and Technical */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Type Scale

```css
/* Display */
--text-display-3xl: 4.5rem;      /* 72px */
--text-display-2xl: 3.75rem;     /* 60px */
--text-display-xl: 3rem;         /* 48px */
--text-display-lg: 2.25rem;      /* 36px */

/* Heading */
--text-h1: 2rem;                 /* 32px */
--text-h2: 1.5rem;               /* 24px */
--text-h3: 1.25rem;              /* 20px */
--text-h4: 1.125rem;             /* 18px */
--text-h5: 1rem;                 /* 16px */
--text-h6: 0.875rem;             /* 14px */

/* Body */
--text-xl: 1.25rem;              /* 20px */
--text-lg: 1.125rem;             /* 18px */
--text-base: 1rem;               /* 16px */
--text-sm: 0.875rem;             /* 14px */
--text-xs: 0.75rem;              /* 12px */
```

#### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Line Heights

```css
--leading-tight: 1.2;
--leading-snug: 1.3;
--leading-normal: 1.5;
--leading-relaxed: 1.6;
--leading-loose: 1.8;
```

#### Letter Spacing

```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
```

### 2.3 Spacing System

```css
/* Base unit: 4px */
--spacing-0: 0;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
```

### 2.4 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;      /* 4px */
--radius-md: 0.5rem;       /* 8px */
--radius-lg: 0.75rem;      /* 12px */
--radius-xl: 1rem;         /* 16px */
--radius-2xl: 1.5rem;      /* 24px */
--radius-3xl: 2rem;        /* 32px */
--radius-full: 9999px;
```

### 2.5 Shadows

```css
/* Elevation */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored shadows */
--shadow-primary: 0 10px 15px -3px rgba(249, 115, 22, 0.3);
--shadow-secondary: 0 10px 15px -3px rgba(20, 184, 166, 0.3);

/* Inner shadow */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### 2.6 Z-Index Scale

```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

---

## 3. Component Specifications

### 3.1 Button Component

#### Variants

**Primary Button**
```css
.btn-primary {
  background: var(--color-primary-500);
  color: white;
  padding: 0.75rem 1.5rem;  /* 12px 24px - meets 48px height */
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  min-height: 48px;  /* WCAG touch target */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}
```

**Secondary Button**
```css
.btn-secondary {
  background: var(--color-secondary-500);
  color: white;
  /* Same specs as primary */
}
```

**Outline Button**
```css
.btn-outline {
  background: transparent;
  border: 2px solid var(--color-primary-500);
  color: var(--color-primary-500);
}
```

**Ghost Button**
```css
.btn-ghost {
  background: transparent;
  color: var(--color-primary-500);
}

.btn-ghost:hover {
  background: var(--color-primary-50);
}
```

#### Sizes

```css
.btn-sm {
  padding: 0.625rem 1rem;  /* 10px 16px */
  min-height: 44px;  /* Minimum WCAG */
  font-size: var(--text-sm);
}

.btn-md {
  padding: 0.75rem 1.5rem;  /* 12px 24px */
  min-height: 48px;
  font-size: var(--text-base);
}

.btn-lg {
  padding: 1rem 2rem;  /* 16px 32px */
  min-height: 52px;
  font-size: var(--text-lg);
}
```

#### Icon Button

```css
.btn-icon {
  padding: 0.75rem;  /* 12px - makes 48x48 with 24px icon */
  min-width: 48px;
  min-height: 48px;
}
```

#### Loading State

```css
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: "";
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  top: 50%;
  left: 50%;
  margin-left: -0.625rem;
  margin-top: -0.625rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 3.2 Card Component

#### Base Card

```css
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-neutral-200);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

#### Glassmorphism Card

```css
.card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-xl);
}
```

#### Interactive Card

```css
.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-primary);
}

.card-interactive:active {
  transform: scale(0.98);
}
```

### 3.3 Input Component

#### Text Input

```css
.input {
  width: 100%;
  padding: 0.875rem 1rem;  /* 14px 16px - meets 48px total */
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  min-height: 48px;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.input::placeholder {
  color: var(--color-neutral-400);
}
```

#### Input with Floating Label

```css
.input-wrapper {
  position: relative;
}

.input-float {
  padding: 1.5rem 1rem 0.5rem;  /* Top padding for label */
}

.input-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-neutral-400);
  transition: all 0.2s;
  pointer-events: none;
}

.input-float:focus + .input-label,
.input-float:not(:placeholder-shown) + .input-label {
  top: 0.5rem;
  font-size: var(--text-xs);
  color: var(--color-primary-500);
}
```

### 3.4 Bottom Navigation

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: var(--z-fixed);
  padding-bottom: env(safe-area-inset-bottom);  /* iOS safe area */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 64px;
  color: var(--color-neutral-500);
  transition: all 0.2s;
}

.nav-item.active {
  color: var(--color-primary-500);
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}
```

---

## 4. Animation Guidelines

### 4.1 Animation Principles

1. **Purposeful**: Every animation communicates something
2. **Natural**: Physics-based easing feels more realistic
3. **Performant**: Use transform and opacity only
4. **Respectful**: Honor prefers-reduced-motion

### 4.2 Duration Tokens

```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
```

### 4.3 Easing Functions

```css
/* Default - Natural feel */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);

/* In - Overshoot for attention */
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Out - Smooth deceleration */
--ease-out: cubic-bezier(0, 0, 0.2, 1);

/* In-Out - Balanced */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce - Playful */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Elastic - Springy */
--ease-elastic: cubic-bezier(0.87, 0, 0.13, 1);
```

### 4.4 Common Animations

#### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}
```

#### Slide Up

```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}
```

#### Scale In

```css
@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-in {
  animation: scaleIn var(--duration-fast) var(--ease-bounce);
}
```

#### Shimmer (Loading)

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 25%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 4.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base: 0-479px (Small phones) */
--breakpoint-sm: 640px;   /* 640px+ (Large phones) */
--breakpoint-md: 768px;   /* 768px+ (Tablets) */
--breakpoint-lg: 1024px;  /* 1024px+ (Small laptops) */
--breakpoint-xl: 1280px;  /* 1280px+ (Desktops) */
--breakpoint-2xl: 1536px; /* 1536px+ (Large screens) */
```

---

## 6. Accessibility Requirements

### 6.1 Color Contrast

- **Normal text**: 4.5:1 minimum
- **Large text (18px+)**: 3:1 minimum
- **UI components**: 3:1 minimum

### 6.2 Touch Targets

- **Minimum size**: 44x44px (WCAG AAA)
- **Recommended size**: 48x48px
- **Spacing**: 8px between targets

### 6.3 Focus States

```css
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### 6.4 Screen Reader Support

```html
<!-- ARIA labels -->
<button aria-label="Close modal">
  <X />
</button>

<!-- Live regions -->
<div role="status" aria-live="polite">
  {statusMessage}
</div>

<!-- Semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>
```

---

## 7. Implementation Guidelines

### 7.1 Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-bounce',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### 7.2 Component Structure

```
src/components/
├── ui/                    # Base UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Radio.tsx
│   ├── Switch.tsx
│   ├── Slider.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── BottomNav.tsx
│   ├── TopNav.tsx
│   ├── Modal.tsx
│   ├── BottomSheet.tsx
│   ├── Dropdown.tsx
│   ├── Tooltip.tsx
│   ├── Toast.tsx
│   ├── Spinner.tsx
│   └── Skeleton.tsx
├── layout/                # Layout components
│   ├── AppLayout.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
└── features/              # Feature-specific components
    ├── bookings/
    ├── messaging/
    ├── social/
    └── profiles/
```

---

## 8. Documentation Requirements

### 8.1 Component Documentation Template

```markdown
# ComponentName

## Description
Brief description of component purpose and usage.

## Usage
\`\`\`tsx
import ComponentName from '@/components/ui/ComponentName';

<ComponentName variant="primary" size="md">
  Content
</ComponentName>
\`\`\`

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' | 'primary' | Visual style variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Component size |
| disabled | boolean | false | Disable interaction |

## Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation supported
- Screen reader friendly

## Examples
### Default
\`\`\`tsx
<ComponentName>Default</ComponentName>
\`\`\`

### With Icon
\`\`\`tsx
<ComponentName icon={<Icon />}>With Icon</ComponentName>
\`\`\`
```

---

## 9. Success Metrics

### 9.1 Design System Maturity

- **Component Coverage**: 80%+ of UI needs
- **Token Usage**: 95%+ of styles use tokens
- **Consistency Score**: 90%+ design adherence
- **Documentation**: 100% of components documented

### 9.2 Performance Metrics

- **CSS Bundle Size**: <50KB
- **Component Render**: <16ms per component
- **Animation FPS**: 60fps maintained
- **Theme Switch**: <100ms

---

## 10. Next Steps

1. **Setup Design Tokens**: Configure Tailwind with new color system
2. **Create Component Library**: Build base UI components
3. **Implement Animations**: Add Framer Motion
4. **Test Accessibility**: Verify WCAG compliance
5. **Document Components**: Create Storybook or similar

---

**Prepared for immediate implementation by Design and Implementation agents. All specifications are actionable and ready to code.**
