# Dumuwaks UX Research Plan
## Comprehensive User-Centric Redesign Strategy

**Document Version:** 1.0
**Created:** February 17, 2026
**Status:** Research Phase

---

## Executive Summary

This document outlines a comprehensive UX research plan for redesigning Dumuwaks, a technician services marketplace connecting Kenyan customers with skilled technicians. The research focuses on creating a seamless, action-based, visually-driven experience that addresses the unique needs of the Kenyan market.

### Vision Statement
> "A seamless, no-struggle experience where customers find technicians through visual, action-based interfaces - where services are presented as a selectable word bank, and technicians can define their own unique offerings."

---

## Table of Contents

1. [User Persona Analysis](./01_USER_PERSONAS.md)
2. [User Journey Mapping](./02_USER_JOURNEYS.md)
3. [WORD BANK UX Concept](./03_WORD_BANK_CONCEPT.md)
4. [Competitor Analysis](./04_COMPETITOR_ANALYSIS.md)
5. [Wireframe Concepts](./05_WIREFRAME_CONCEPTS.md)
6. [Recommendations](./06_RECOMMENDATIONS.md)

---

## Research Objectives

### Primary Objectives
1. Understand the behaviors, needs, and pain points of three user types: Customers, Technicians, and Admins
2. Map complete user journeys to identify friction points and optimization opportunities
3. Design an innovative "WORD BANK" service discovery experience
4. Create mobile-first, pictorial/visual interfaces optimized for the Kenyan market
5. Enable technicians to define custom services beyond preset categories

### Secondary Objectives
1. Establish design principles for offline-first functionality
2. Integrate mobile money payment patterns (M-Pesa, etc.)
3. Build trust through visual verification and social proof
4. Reduce cognitive load through visual-first design

---

## Current State Analysis

### Existing Features (from codebase analysis)

**Authentication & User Management:**
- Email/password registration with phone verification
- Role-based access (customer, technician, admin, corporate, support)
- Profile management with location services

**Service Categories:**
- 15+ predefined categories (plumbing, electrical, carpentry, etc.)
- Skills management with proficiency levels
- Service type selection within categories

**Booking System:**
- AI-powered technician matching
- Dynamic pricing based on urgency and distance
- Booking fee payment via modal (M-Pesa integration)
- Status tracking (pending, accepted, in_progress, completed)

**Technician Features:**
- Work gallery (max 5 images with before/after capability)
- Availability toggle
- Rating and review system
- Subscription plans (free, pro, premium)

**Communication:**
- Real-time messaging (requires active booking)
- Socket.io integration for live updates

### Identified Pain Points

**For Customers:**
1. Service discovery is text-heavy and category-based (not visual)
2. No quick way to browse services without selecting a category first
3. Technician profiles are information-dense but not action-focused
4. Contact information is hidden until booking (safety feature but creates friction)

**For Technicians:**
1. Cannot add custom services outside predefined categories
2. Work gallery limited to 5 images
3. Complex profile setup with many required fields
4. No visual way to showcase service offerings

**For Admins:**
1. Multiple dashboards (Admin, Reports, Support, Settings, User Management)
2. Limited oversight into technician-customer interactions

---

## Design Principles for Redesign

### 1. Action-First, Not Information-First
Every screen should have a clear primary action. Users should know immediately what they can DO, not just what they can SEE.

### 2. Visual Over Textual
Use icons, images, and pictorial representations. Service selection should feel like browsing a visual catalog.

### 3. Word Bank Concept
Services displayed as selectable "chips" or "tags" - visual, tappable, and intuitive. Both preset and custom.

### 4. Mobile-First, Always
Design for 320px width first. Touch targets minimum 48px. Thumb-zone optimization.

### 5. Offline-Capable
Core features work without internet. Sync when connected. Show clear sync status.

### 6. Trust Through Transparency
Show ratings, reviews, verifications, and real photos prominently. Build confidence visually.

---

## Next Steps

1. Review detailed personas in [01_USER_PERSONAS.md](./01_USER_PERSONAS.md)
2. Study complete journeys in [02_USER_JOURNEYS.md](./02_USER_JOURNEYS.md)
3. Understand WORD BANK concept in [03_WORD_BANK_CONCEPT.md](./03_WORD_BANK_CONCEPT.md)
4. Review competitor insights in [04_COMPETITOR_ANALYSIS.md](./04_COMPETITOR_ANALYSIS.md)
5. Explore wireframes in [05_WIREFRAME_CONCEPTS.md](./05_WIREFRAME_CONCEPTS.md)
6. Read final recommendations in [06_RECOMMENDATIONS.md](./06_RECOMMENDATIONS.md)

---

## Research Methods Used

1. **Codebase Analysis:** Examined React components, user models, and existing flows
2. **Feature Audit:** Catalogued all existing functionality
3. **Industry Research:** Studied global best practices (TaskRabbit, Thumbtack, Urban Company)
4. **Market Context:** Applied Kenya-specific mobile money and connectivity patterns
5. **Heuristic Evaluation:** Applied Nielsen's 10 usability heuristics to current implementation

---

## Success Metrics

The redesign will be considered successful when:

| Metric | Current State | Target |
|--------|---------------|--------|
| Service discovery time | Multiple clicks to find service | < 3 taps to any service |
| Booking completion rate | Unknown | > 80% completion |
| Technician profile completion | Many incomplete profiles | > 90% complete |
| Mobile usability score | Not measured | > 90/100 |
| Time to first booking (new customer) | Unknown | < 5 minutes |
| Custom service adoption | 0% (not available) | > 30% of technicians |
| Customer satisfaction (NPS) | Unknown | > 50 |

---

*This research plan serves as the foundation for all subsequent UX design decisions for Dumuwaks.*
