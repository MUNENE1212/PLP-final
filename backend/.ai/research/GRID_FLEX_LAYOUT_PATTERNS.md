# CSS Grid and Flexbox Modern Layout Patterns

*Research Document for Dumu Waks Platform Rebranding*
*Generated: 2025-02-06*

## Executive Summary

This document covers modern CSS layout patterns using CSS Grid and Flexbox for 2025 web applications. These patterns form the foundation of responsive, accessible, and maintainable layouts for the Dumu Waks marketplace platform.

## Table of Contents

1. [Layout System Overview](#layout-system-overview)
2. [Grid Layout Patterns](#grid-layout-patterns)
3. [Flexbox Layout Patterns](#flexbox-layout-patterns)
4. [Responsive Design Strategy](#responsive-design-strategy)
5. [Component Layout Patterns](#component-layout-patterns)
6. [Container Queries](#container-queries)
7. [Performance Considerations](#performance-considerations)
8. [Implementation Examples](#implementation-examples)

---

## Layout System Overview

### When to Use Grid vs Flexbox

| Use Case | Recommended | Why |
|----------|-------------|-----|
| Two-dimensional layout | CSS Grid | Rows and columns simultaneously |
| One-dimensional layout | Flexbox | Single row or column |
| Card grids | CSS Grid | Equal sizing, alignment |
| Navigation | Flexbox | Spacing, distribution |
| Overall page layout | CSS Grid | Main, sidebar, header relationship |
| Component internals | Flexbox | Button groups, form rows |

### Modern Browser Support

As of 2025:
- **CSS Grid**: 98%+ browser support
- **Flexbox**: 99%+ browser support
- **Container Queries**: 85%+ browser support (use fallbacks)

---

## Grid Layout Patterns

### 1. Holy Grail Layout (Marketplace Standard)

The classic marketplace layout with header, sidebar, main content, and footer:

```css
.marketplace-layout {
  display: grid;
  min-height: 100vh;
  grid-template-areas:
    "header header header"
    "sidebar main widgets"
    "footer footer footer";
  grid-template-columns: 275px 1fr 350px;
  grid-template-rows: auto 1fr auto;
}

@media (max-width: 1280px) {
  .marketplace-layout {
    grid-template-areas:
      "header header"
      "main widgets"
      "footer footer";
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 768px) {
  .marketplace-layout {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### 2. Card Grid System

For service listings and technician profiles:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

/* With featured first item */
.card-grid-featured {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.card-grid-featured > :first-child {
  grid-column: span 2;
  grid-row: span 2;
}

@media (max-width: 768px) {
  .card-grid-featured > :first-child {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```

### 3. Responsive Image Gallery

For technician work portfolios:

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 200px;
  gap: 16px;
}

/* Masonry-style with grid-auto-flow */
.gallery-masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 200px;
  grid-auto-flow: dense;
  gap: 16px;
}

.gallery-masonry .wide {
  grid-column: span 2;
}

.gallery-masonry .tall {
  grid-row: span 2;
}

.gallery-masonry .large {
  grid-column: span 2;
  grid-row: span 2;
}
```

### 4. Subgrid for Nested Content

```css
.parent-grid {
  display: grid;
  grid-template-columns: 250px 1fr 150px;
  gap: 24px;
}

.card-with-subgrid {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  /* Inherits parent's 3 columns */
}
```

---

## Flexbox Layout Patterns

### 1. Navigation Bar

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--dw-bg-secondary);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

### 2. Card Content Layout

```css
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: var(--dw-dark-gray);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.card-info {
  flex: 1;
  min-width: 0; /* Enables text truncation */
}

.card-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}
```

### 3. Button Groups

```css
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.button-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Segmented control style */
.segmented-control {
  display: flex;
  background: var(--dw-medium-gray);
  border-radius: 8px;
  padding: 4px;
}

.segmented-control button {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--dw-text-secondary);
  border-radius: 6px;
}

.segmented-control button.active {
  background: var(--dw-bg-primary);
  color: var(--dw-text-primary);
  font-weight: 600;
}
```

### 4. Form Rows

```css
.form-row {
  display: flex;
  gap: 16px;
}

.form-row > * {
  flex: 1;
  min-width: 0; /* Important for inputs */
}

.form-row-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-row-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .form-row-2,
  .form-row-3 {
    grid-template-columns: 1fr;
  }
}
```

---

## Responsive Design Strategy

### Mobile-First Breakpoints

```css
/* Mobile First Approach */
/* Base styles: 320px+ */

.container {
  width: 100%;
  padding: 0 16px;
}

/* Small devices */
@media (min-width: 640px) {
  .container {
    max-width: 640px;
    margin: 0 auto;
  }
}

/* Medium devices */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding: 0 24px;
  }
}

/* Large devices */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

/* Extra large devices */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### Sticky Positioning Patterns

```css
/* Sticky header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--dw-border-subtle);
}

/* Sticky sidebar */
.layout-sidebar {
  position: sticky;
  top: 73px; /* Header height */
  height: calc(100vh - 73px);
  overflow-y: auto;
}

/* Sticky first column in table */
.sticky-table td:first-child {
  position: sticky;
  left: 0;
  background: var(--dw-dark-gray);
  z-index: 10;
}
```

---

## Component Layout Patterns

### 1. Service Card (X/Twitter Style)

```css
.service-card {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto 1fr auto;
  gap: 12px 16px;
  padding: 16px;
  border-bottom: 1px solid var(--dw-border-subtle);
  transition: background 0.2s;
}

.service-card:hover {
  background: rgba(255, 255, 255, 0.03);
}

.service-card-avatar {
  grid-row: 1 / 3;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.service-card-header {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}

.service-card-name {
  font-weight: 700;
  color: var(--dw-text-primary);
}

.service-card-meta {
  font-size: 14px;
  color: var(--dw-text-secondary);
}

.service-card-content {
  grid-column: 2;
  color: var(--dw-text-primary);
  line-height: 1.5;
}

.service-card-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
```

### 2. Technician Profile Layout

```css
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  padding: 24px;
}

.profile-sidebar {
  position: sticky;
  top: 73px;
  height: fit-content;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    position: static;
  }
}
```

### 3. Booking Flow Steps

```css
.booking-steps {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.booking-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
}

.booking-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dw-medium-gray);
  color: var(--dw-text-secondary);
  font-weight: 600;
}

.booking-step.active {
  background: var(--dw-orange-500);
  color: white;
}

.booking-step.completed {
  background: var(--dw-success);
  color: white;
}

.booking-connector {
  width: 32px;
  height: 2px;
  background: var(--dw-border-default);
}
```

### 4. Bottom Navigation (Mobile)

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  background: rgba(22, 24, 28, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--dw-border-subtle);
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  color: var(--dw-text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.bottom-nav-item.active {
  color: var(--dw-orange-500);
}

.bottom-nav-icon {
  width: 24px;
  height: 24px;
}

.bottom-nav-label {
  font-size: 11px;
  font-weight: 500;
}
```

---

## Container Queries

### Container Query Setup

```css
/* Define container contexts */
.service-card,
.profile-card,
.search-result {
  container-name: card;
  container-type: inline-size;
}

/* Responsive based on container, not viewport */
@container card (min-width: 400px) {
  .card-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

@container card (min-width: 600px) {
  .card-content {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Fallback for Container Queries

```css
/* Progressive enhancement */
.card {
  display: flex;
  flex-direction: column;
}

@supports (container-type: inline-size) {
  .card {
    container-type: inline-size;
  }

  @container (min-width: 400px) {
    .card {
      flex-direction: row;
    }
  }
}
```

---

## Performance Considerations

### 1. Layout Shift Prevention

```css
/* Reserve space for dynamic content */
.skeleton-loader {
  min-height: 200px;
  background: linear-gradient(
    90deg,
    var(--dw-medium-gray) 25%,
    var(--dw-light-gray) 50%,
    var(--dw-medium-gray) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 2. Content Visibility

```css
/* Improve rendering performance */
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### 3. Reduce Layout Calculations

```css
/* Use transforms instead of layout properties */
.card {
  will-change: transform;
}

.card:hover {
  transform: translateY(-2px);
}
```

---

## Implementation Examples

### Complete Page Layout

```css
/* Dumu Waks Marketplace Layout */
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--dw-black);
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.page-main {
  display: grid;
  grid-template-columns: 275px minmax(0, 600px) 350px;
  gap: 0;
  flex: 1;
}

.page-sidebar {
  position: sticky;
  top: 73px;
  height: calc(100vh - 73px);
  overflow-y: auto;
  padding: 16px 0;
}

.page-content {
  min-width: 0;
  border-left: 1px solid var(--dw-border-subtle);
  border-right: 1px solid var(--dw-border-subtle);
}

.page-widgets {
  position: sticky;
  top: 73px;
  height: calc(100vh - 73px);
  overflow-y: auto;
  padding: 16px;
}

.page-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--dw-border-subtle);
}

/* Responsive */
@media (max-width: 1280px) {
  .page-main {
    grid-template-columns: 88px minmax(0, 1fr) 350px;
  }

  .page-sidebar {
    width: 88px;
  }

  .page-sidebar .nav-label {
    display: none;
  }
}

@media (max-width: 1024px) {
  .page-main {
    grid-template-columns: minmax(0, 1fr);
  }

  .page-sidebar,
  .page-widgets {
    display: none;
  }
}

@media (max-width: 640px) {
  .page-header {
    position: fixed;
  }

  .page-main {
    padding-top: 60px;
    padding-bottom: 60px;
  }
}
```

---

## Tailwind CSS Integration

```css
/* Tailwind utility classes for common patterns */

/* Grid utilities */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.grid-span-2 {
  grid-column: span 2 / span 2;
}

/* Flex utilities */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-col-mobile {
  flex-direction: column;
}

@media (min-width: 768px) {
  .flex-col-mobile {
    flex-direction: row;
  }
}

/* Sticky utilities */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}
```

---

## Sources

- CSS Grid Specification (W3C)
- CSS Flexbox Specification (W3C)
- CSS Containment Module Level 3 (Container Queries)
- Modern CSS Layout Patterns (2024-2025)

---

*Document Version: 1.0*
*Last Updated: 2025-02-06*
