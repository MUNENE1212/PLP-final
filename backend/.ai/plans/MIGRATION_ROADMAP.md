# Dumu Waks Design Migration Roadmap

*X/Twitter-Inspired Design System Implementation Plan*
*Generated: 2025-02-06*

## Executive Summary

This document outlines the step-by-step migration plan for transforming the Dumu Waks platform to a modern, X/Twitter-inspired dark theme design. The roadmap is organized into phases, each with specific deliverables, timelines, and success criteria.

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Phase 1: Design Foundation](#phase-1-design-foundation)
3. [Phase 2: Core Components](#phase-2-core-components)
4. [Phase 3: Layout Components](#phase-3-layout-components)
5. [Phase 4: Page Redesigns](#phase-4-page-redesigns)
6. [Phase 5: Polish & Optimization](#phase-5-polish--optimization)
7. [Testing & Validation](#testing--validation)
8. [Launch Plan](#launch-plan)

---

## Migration Overview

### Current State

| Aspect | Current | Target |
|--------|---------|--------|
| Theme | Light/dark toggle | Dark-first |
| Design System | Tailwind default | Custom X-inspired |
| Components | Basic | Comprehensive library |
| Mobile | Responsive | Mobile-first |
| Brand Presence | Standard | Prominent |

### Target Outcomes

1. **Modern Dark Theme**: X/Twitter-inspired black theme
2. **Brand Cohesion**: Orange accent throughout
3. **Component Library**: Reusable, documented components
4. **Mobile Excellence**: Optimized for Kenyan mobile users
5. **Accessibility**: WCAG AA compliant

### Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1 | 2 weeks | Week 1 | Week 2 |
| Phase 2 | 2 weeks | Week 3 | Week 4 |
| Phase 3 | 2 weeks | Week 5 | Week 6 |
| Phase 4 | 3 weeks | Week 7 | Week 9 |
| Phase 5 | 2 weeks | Week 10 | Week 11 |
| **Total** | **11 weeks** | | |

---

## Phase 1: Design Foundation

**Duration**: 2 weeks
**Goal**: Establish design tokens, base styles, and tooling

### Week 1: Design Tokens & Configuration

**Tasks**:
- [ ] Configure Tailwind CSS with custom theme
- [ ] Define CSS custom properties for design tokens
- [ ] Set up color palette (X-inspired dark + orange accent)
- [ ] Define typography scale (Inter font)
- [ ] Create spacing scale
- [ ] Define border radius tokens
- [ ] Set up shadow/elevation tokens

**Deliverables**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { /* X-inspired palette */ },
      fontFamily: { /* Inter, JetBrains Mono */ },
      spacing: { /* 4px base scale */ }
    }
  }
}

// styles/tokens.css
:root {
  --dw-color-black: #000000;
  --dw-color-orange-500: #f97316;
  /* ... all design tokens */
}
```

### Week 2: Base Styles & Reset

**Tasks**:
- [ ] Create global reset styles
- [ ] Implement dark theme base styles
- [ ] Set up base typography
- [ ] Create utility classes for common patterns
- [ ] Configure theme toggle (if needed)
- [ ] Set up CSS-in-JS or CSS modules configuration

**Deliverables**:
```css
/* styles/base.css */
@import 'tokens.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--dw-color-black);
  color: var(--dw-color-text-primary);
  font-family: var(--dw-font-family-base);
}
```

**Success Criteria**:
- [ ] Design tokens defined and documented
- [ ] Base styles applied without breaking existing layout
- [ ] Dark theme renders correctly
- [ ] No visual regressions on existing pages

---

## Phase 2: Core Components

**Duration**: 2 weeks
**Goal**: Build foundational component library

### Week 3: Buttons & Inputs

**Tasks**:
- [ ] Create Button component (primary, secondary, ghost, glass)
- [ ] Create ButtonGroup component
- [ ] Create Input component (text, email, tel)
- [ ] Create Textarea component
- [ ] Create Select component
- [ ] Create Checkbox/Radio components
- [ ] Create Toggle/Switch component

**Deliverables**:
```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   └── Button.test.tsx
├── Input/
│   ├── Input.tsx
│   ├── Input.stories.tsx
│   └── Input.test.tsx
...
```

**Component Specifications**:

```typescript
// Button variants
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'glass';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}
```

### Week 4: Badges, Icons, Typography

**Tasks**:
- [ ] Create Badge component (status, verification)
- [ ] Create Icon component (Lucide React integration)
- [ ] Create Avatar component
- [ ] Create Heading component
- [ ] Create Text component
- [ ] Create Link component
- [ ] Create Tooltip component

**Deliverables**:
```
components/
├── Badge/
├── Icon/
├── Avatar/
├── Heading/
├── Text/
├── Link/
└── Tooltip/
```

**Success Criteria**:
- [ ] All components have Storybook stories
- [ ] All components have unit tests
- [ ] Components accessible (keyboard, screen reader)
- [ ] Dark theme variants working

---

## Phase 3: Layout Components

**Duration**: 2 weeks
**Goal**: Build navigation and layout structure

### Week 5: Navigation Components

**Tasks**:
- [ ] Create Header component (desktop/mobile)
- [ ] Create Sidebar component (desktop)
- [ ] Create BottomNav component (mobile)
- [ ] Create Breadcrumb component
- [ ] Create Tab component
- [ ] Create Pagination component

**Specifications**:

```typescript
// Header: Fixed top, glass effect
interface HeaderProps {
  showSidebar?: boolean;
  transparent?: boolean;
}

// Sidebar: 275px fixed, collapsible
interface SidebarProps {
  collapsed?: boolean;
  items: NavItem[];
}

// BottomNav: 60px fixed, 4 items
interface BottomNavProps {
  items: BottomNavItem[];
}
```

### Week 6: Card & Container Components

**Tasks**:
- [ ] Create Card component (base)
- [ ] Create ServiceCard component
- [ ] Create TechnicianCard component
- [ ] Create ReviewCard component
- [ ] Create Modal component
- [ ] Create Sheet/Drawer component (mobile)
- [ ] Create Container component (max-width)

**Component Hierarchy**:

```
Card (base)
├── ServiceCard (extends Card)
│   ├── Technician info
│   ├── Service details
│   └── Book button
├── TechnicianCard (extends Card)
│   ├── Avatar & info
│   ├── Rating & reviews
│   └── Contact button
└── ReviewCard (extends Card)
    ├── Rating
    ├── Review text
    └── Author info
```

**Success Criteria**:
- [ ] Navigation works on mobile (bottom nav)
- [ ] Navigation works on desktop (sidebar)
- [ ] Cards follow X/Twitter pattern
- [ ] Modals have proper focus management
- [ ] All components responsive

---

## Phase 4: Page Redesigns

**Duration**: 3 weeks
**Goal**: Redesign key pages with new design system

### Week 7: Homepage & Search

**Tasks**:
- [ ] Redesign Homepage
  - Hero section with CTA
  - Featured services grid
  - How it works section
  - Trust signals
- [ ] Redesign Search/Results page
  - Search bar with filters
  - Service card grid
  - Sort options
  - Map toggle (future)

**Homepage Structure**:
```
+------------------------------------------+
| [Header: Logo, Nav, CTA]                 |
+------------------------------------------+
|                                          |
| [Hero: Find trusted technicians]         |
| [Search bar]                             |
|                                          |
| [Featured Categories]                    |
| [Popular Technicians]                    |
| [How It Works]                           |
| [Trust Badges]                           |
|                                          |
+------------------------------------------+
| [Footer]                                 |
+------------------------------------------+
```

### Week 8: Technician Profile & Booking

**Tasks**:
- [ ] Redesign Technician Profile page
  - Profile header with avatar
  - About section
  - Services offered
  - Portfolio gallery
  - Reviews section
  - Availability calendar
- [ ] Redesign Booking Flow
  - Step 1: Service selection
  - Step 2: Date & time
  - Step 3: Location
  - Step 4: Review & pay

**Profile Page Structure**:
```
+------------------+------------------------+
| [Sidebar Nav]    | [Profile Header]       |
|                  | [About]                |
| [Similar]        | [Services]             |
|                  | [Portfolio]            |
|                  | [Reviews]              |
|                  | [Book Button - Sticky] |
+------------------+------------------------+
```

### Week 9: User Dashboard & Messages

**Tasks**:
- [ ] Redesign User Dashboard
  - Overview stats
  - Active bookings
  - Past bookings
  - Saved technicians
- [ ] Redesign Messages page
  - Conversation list
  - Chat interface
  - WhatsApp share button

**Dashboard Structure**:
```
+------------------------------------------+
| [Header]                                 |
+------------------------------------------+
|                                          |
| [Stats Cards: Active, Past, Saved]       |
|                                          |
| [Active Bookings - Card Grid]            |
|                                          |
| [Past Bookings - List]                   |
|                                          |
+------------------------------------------+
```

**Success Criteria**:
- [ ] All pages use new component library
- [ ] Responsive design on all breakpoints
- [ ] Accessibility standards met
- [ ] Performance targets achieved

---

## Phase 5: Polish & Optimization

**Duration**: 2 weeks
**Goal**: Refine interactions, animations, and performance

### Week 10: Micro-interactions & Animations

**Tasks**:
- [ ] Add hover states to all interactive elements
- [ ] Add focus indicators for keyboard navigation
- [ ] Create loading states (skeleton screens)
- [ ] Add page transitions
- [ ] Add success/error animations
- [ ] Add glassmorphism effects to key components

**Animation Checklist**:

```css
/* Hover states */
.button:hover { /* scale, color change */ }
.card:hover { /* background shift */ }

/* Focus states */
.button:focus-visible { /* outline */ }
.input:focus { /* border + shadow */ }

/* Loading states */
.skeleton { /* shimmer animation */ }
.spinner { /* rotation */ }

/* Page transitions */
.page-enter { /* fade in + slide up */ */
.page-exit { /* fade out */ }
```

### Week 11: Performance & Accessibility

**Tasks**:
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minimize JavaScript bundle
- [ ] Implement code splitting
- [ ] Add service worker for offline support
- [ ] Conduct accessibility audit
- [ ] Fix a11y issues
- [ ] Cross-browser testing

**Performance Targets**:

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 2s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| First Input Delay | < 100ms | Lighthouse |
| Lighthouse Score | 90+ | Lighthouse |

**Accessibility Checklist**:

- [ ] WCAG 2.2 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Forms properly labeled
- [ ] ARIA attributes correct

**Success Criteria**:
- [ ] Lighthouse score 90+
- [ ] WCAG AA compliant
- [ ] Works on Safari, Chrome, Firefox
- [ ] Smooth 60fps animations

---

## Testing & Validation

### Testing Strategy

#### Visual Regression Testing

```bash
# Chromatic or Percy for visual regression
npm run test:visual
```

#### Unit Testing

```typescript
// Example test
describe('Button', () => {
  it('renders primary variant correctly', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-orange-500');
  });

  it('is accessible', () => {
    const results = axeLite(<Button>Click</Button>);
    expect(results).toHaveNoViolations();
  });
});
```

#### E2E Testing

```typescript
// Playwright example
test('booking flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="service-card"]');
  await page.click('[data-testid="book-button"]');
  await page.fill('[data-testid="date-input"]', '2025-02-10');
  await page.click('[data-testid="confirm-booking"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### User Testing

1. **Internal Testing**: Team testing for 1 week
2. **Beta Testing**: 10-20 users for 2 weeks
3. **Feedback Collection**: Surveys, interviews
4. **Iteration**: Fix critical issues

---

## Launch Plan

### Pre-Launch Checklist

- [ ] All phases completed
- [ ] Tests passing
- [ ] Performance targets met
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Team trained on new design

### Launch Strategy

#### Phase 1: Soft Launch (Week 1)

- Enable for 10% of users
- Monitor for issues
- Collect feedback

#### Phase 2: Gradual Rollout (Week 2-3)

- Increase to 50% of users
- Continue monitoring
- Address issues

#### Phase 3: Full Launch (Week 4)

- 100% of users
- Announcement communications
- Marketing push

### Post-Launch

- [ ] Monitor analytics
- [ ] Collect user feedback
- [ ] Plan iteration cycle
- [ ] Update documentation

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Performance degradation | Progressive enhancement, lazy loading |
| Browser compatibility | Feature detection, fallbacks |
| User resistance | Gradual rollout, feedback channels |
| Accessibility issues | Continuous a11y testing |
| Scope creep | Strict phase boundaries, prioritization |

---

## Success Metrics

### Quantitative

| Metric | Baseline | Target |
|--------|----------|--------|
| Mobile conversion rate | X% | +20% |
| Time to book | X minutes | -30% |
| Bounce rate | X% | -15% |
| Session duration | X minutes | +20% |
| Lighthouse score | X | 90+ |

### Qualitative

- User satisfaction scores
- Brand perception feedback
- Accessibility compliance
- Code maintainability

---

## Resource Requirements

### Team

- 1 Senior Frontend Developer (lead)
- 1 Frontend Developer (components)
- 1 UI/UX Designer (support)
- 1 QA Engineer (testing)

### Tools

- Storybook (component documentation)
- Chromatic (visual regression)
- Playwright (E2E testing)
- axe DevTools (accessibility)
- Lighthouse (performance)

---

## Sources & References

- All research documents in `.ai/research/`
- Current Dumu Waks codebase
- Tailwind CSS documentation
- X/Twitter design patterns

---

*Document Version: 1.0*
*Last Updated: 2025-02-06*

## Appendix: Migration Task Breakdown

### Detailed Task List

```markdown
## Phase 1 Tasks
- [ ] DW-001: Configure Tailwind with custom theme
- [ ] DW-002: Define design tokens
- [ ] DW-003: Create base styles
- [ ] DW-004: Set up dark theme
- [ ] DW-005: Configure Inter font
- [ ] DW-006: Create spacing scale
- [ ] DW-007: Define color palette

## Phase 2 Tasks
- [ ] DW-101: Create Button component
- [ ] DW-102: Create Input component
- [ ] DW-103: Create Badge component
- [ ] DW-104: Create Icon component
- [ ] DW-105: Create Avatar component
- [ ] DW-106: Create Tooltip component

## Phase 3 Tasks
- [ ] DW-201: Create Header component
- [ ] DW-202: Create Sidebar component
- [ ] DW-203: Create BottomNav component
- [ ] DW-204: Create Card component
- [ ] DW-205: Create ServiceCard component
- [ ] DW-206: Create Modal component

## Phase 4 Tasks
- [ ] DW-301: Redesign Homepage
- [ ] DW-302: Redesign Search page
- [ ] DW-303: Redesign Profile page
- [ ] DW-304: Redesign Booking flow
- [ ] DW-305: Redesign Dashboard
- [ ] DW-306: Redesign Messages page

## Phase 5 Tasks
- [ ] DW-401: Add hover states
- [ ] DW-402: Add loading states
- [ ] DW-403: Add page transitions
- [ ] DW-404: Optimize images
- [ ] DW-405: Implement code splitting
- [ ] DW-406: Accessibility audit
```
