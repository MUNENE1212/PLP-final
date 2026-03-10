# Success Metrics & KPI Framework

## Measurement Framework for FundiPro

**Version:** 1.0
**Date:** February 17, 2026

---

## Executive Summary

This document defines the Key Performance Indicators (KPIs) and measurement framework for tracking the success of the FundiPro platform transformation. Metrics are organized by stakeholder perspective and implementation phase.

---

## 1. Measurement Philosophy

### 1.1 Measurement Principles

1. **User-Centric:** Every metric traces back to user benefit
2. **Actionable:** Metrics must inform decisions
3. **Leading + Lagging:** Mix of predictive and outcome metrics
4. **Simple:** Easy to understand and communicate
5. **Automated:** Collected and reported automatically

### 1.2 Metric Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Growth** | User acquisition | Signups, activations |
| **Engagement** | User activity | Sessions, features used |
| **Quality** | User satisfaction | NPS, ratings, complaints |
| **Business** | Revenue & efficiency | GMV, commission, costs |
| **Technical** | System health | Uptime, latency, errors |

---

## 2. North Star Metric

### Primary Metric: Monthly Gross Merchandise Value (GMV)

**Definition:** Total value of services transacted through the platform per month.

**Why GMV:**
- Indicates marketplace liquidity
- Measures value creation for both sides
- Directly correlates to revenue
- Simple to understand and track

**Targets:**

| Period | GMV Target | Rationale |
|--------|------------|-----------|
| Month 3 | KES 5M | Proof of concept |
| Month 6 | KES 25M | Product-market fit |
| Month 12 | KES 50M | Scaling |
| Year 2 | KES 250M | Market leadership |

---

## 3. Customer Metrics (Wanjiku Persona)

### 3.1 Acquisition Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Customer Signups | New customer registrations | 1,000/month | Daily |
| Signup Conversion | % visitors who signup | 5% | Weekly |
| CAC | Customer Acquisition Cost | KES 500-1,000 | Monthly |
| Channel Mix | Signups by source | Track all | Weekly |

### 3.2 Engagement Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| MAU | Monthly Active Users | 60% of registered | Monthly |
| Service Discovery Time | Time to find service | <1 minute | Daily |
| Booking Completion Rate | % who complete booking | 85% | Daily |
| Sessions per User | Average sessions/month | 3+ | Monthly |
| Feature Adoption | % using key features | Track each | Weekly |

### 3.3 Satisfaction Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| NPS | Net Promoter Score | 50+ | Monthly |
| App Store Rating | Average rating | 4.5+ | Weekly |
| CSAT | Customer Satisfaction Score | 4.5/5 | Per booking |
| Review Rate | % who leave reviews | 40% | Weekly |
| Support Tickets | Tickets per 1000 users | <10 | Weekly |

### 3.4 Retention Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| 30-Day Retention | % return within 30 days | 40% | Monthly |
| Repeat Booking Rate | % who book again | 50% | Monthly |
| Churn Rate | % inactive after 90 days | <20% | Monthly |
| LTV | Customer Lifetime Value | KES 5,000+ | Quarterly |

---

## 4. Technician Metrics (John Persona)

### 4.1 Supply Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Technician Signups | New technician registrations | 200/month | Daily |
| Verification Rate | % verified within 7 days | 80% | Weekly |
| Profile Completion | Avg profile completeness | 80%+ | Weekly |
| Active Technicians | % with booking in 30 days | 50% | Monthly |
| Technician CAC | Acquisition Cost | KES 200-500 | Monthly |

### 4.2 Quality Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Avg Rating | Average technician rating | 4.5/5 | Weekly |
| Response Time | Avg time to respond | <15 min | Daily |
| Completion Rate | % jobs completed | 95% | Weekly |
| No-Show Rate | % who don't show | <2% | Weekly |
| Dispute Rate | % bookings disputed | <1% | Weekly |

### 4.3 Earnings Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Avg Earnings | Monthly earnings per technician | KES 30,000+ | Monthly |
| Earnings Growth | Month-over-month growth | 10%+ | Monthly |
| Payout Success | % successful payouts | 99% | Daily |
| Time to Payout | Hours from completion to payout | <24h | Daily |

### 4.4 Retention Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| 90-Day Retention | % active after 90 days | 60% | Monthly |
| Churn Rate | % leave platform | <10%/month | Monthly |
| NPS (Technician) | Technician Net Promoter Score | 40+ | Monthly |

---

## 5. Platform Business Metrics

### 5.1 Revenue Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| GMV | Gross Merchandise Value | See targets | Daily |
| Take Rate | Effective commission rate | 12-15% | Monthly |
| Revenue | Platform revenue | KES 6.5M/mo (Y1) | Daily |
| ARPU | Avg Revenue Per User | KES 200/month | Monthly |
| Revenue per Booking | Avg revenue per transaction | KES 500 | Weekly |

### 5.2 Unit Economics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| LTV:CAC Ratio | Lifetime value to acquisition cost | 5:1+ | Quarterly |
| Payback Period | Months to recover CAC | <6 months | Quarterly |
| Gross Margin | Revenue minus variable costs | 70%+ | Monthly |
| Contribution Margin | Per-transaction margin | 10%+ | Weekly |

### 5.3 Growth Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| GMV Growth | Month-over-month GMV growth | 20%+ | Monthly |
| User Growth | Month-over-month user growth | 15%+ | Monthly |
| Market Share | % of addressable market | 2% (Y1) | Quarterly |

---

## 6. Technical Metrics

### 6.1 Performance Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Page Load Time | Time to interactive | <2 seconds | Real-time |
| API Latency (P95) | 95th percentile response time | <500ms | Real-time |
| Time to First Byte | Server response time | <200ms | Real-time |
| Bundle Size | JS bundle size | <200KB | Per deploy |

### 6.2 Reliability Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Uptime | System availability | 99.9% | Real-time |
| Error Rate | % requests with errors | <0.1% | Real-time |
| Mean Time to Recovery | Avg time to fix issues | <1 hour | Per incident |
| Deployment Frequency | Deploys per week | 5+ | Weekly |

### 6.3 Payment Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Payment Success Rate | % successful payments | 98%+ | Daily |
| Payment Latency | Time to payment confirmation | <30 seconds | Real-time |
| M-Pesa Downtime Impact | % affected by outages | <1% | Per incident |
| Refund Rate | % transactions refunded | <1% | Weekly |

---

## 7. Feature-Specific Metrics

### 7.1 WORD BANK Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Service Discovery Time | Time to select service | <60 seconds | Daily |
| Category Click-Through | % who click category then service | 70%+ | Weekly |
| Search Usage | % who use search vs browse | Track | Weekly |
| Custom Service Usage | % bookings with custom services | 10%+ | Monthly |

### 7.2 Payment Plan Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Plan Completion | % who complete payment plan setup | 80%+ | Weekly |
| Pricing Model Mix | Distribution of pricing models | Track | Monthly |
| Milestone Usage | % large jobs using milestones | 20%+ | Monthly |

### 7.3 Escrow Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Escrow Adoption | % payments through escrow | 90%+ | Weekly |
| Auto-Release Rate | % auto-released after completion | 80%+ | Weekly |
| Dispute Rate | % escrows disputed | <1% | Weekly |
| Dispute Resolution Time | Avg days to resolve | <7 days | Weekly |

---

## 8. Dashboard & Reporting

### 8.1 Executive Dashboard

**Daily:**
- GMV (today, MTD, vs target)
- Active bookings
- New signups (customers, technicians)
- Payment success rate

**Weekly:**
- GMV trend
- User acquisition by channel
- NPS trend
- Key conversion funnels

**Monthly:**
- Full metrics report
- Unit economics
- Competitive analysis
- Strategic progress

### 8.2 Operational Dashboard

**Real-time:**
- System health
- Error rates
- Payment processing
- Active sessions

**Hourly:**
- Booking funnel
- Support tickets
- Technician availability

### 8.3 Product Dashboard

**Daily:**
- Feature usage
- A/B test results
- User feedback

**Weekly:**
- Feature adoption curves
- Cohort analysis
- Funnel optimization

---

## 9. Targets by Phase

### Phase 1 (Foundation) - End of Week 4

| Metric | Target |
|--------|--------|
| Services seeded | 99+ |
| Categories seeded | 12 |
| WORD BANK functional | Yes |
| Service discovery time | <2 minutes |

### Phase 2 (Core Features) - End of Week 8

| Metric | Target |
|--------|--------|
| Custom service creation | Functional |
| Payment plan builder | Functional |
| Profile completion avg | 60% |

### Phase 3 (Payments) - End of Week 12

| Metric | Target |
|--------|--------|
| M-Pesa integration | Live (sandbox) |
| Payment success rate | 95%+ |
| Escrow functional | Yes |

### Phase 4 (Launch) - End of Week 16

| Metric | Target |
|--------|--------|
| Verified technicians | 500+ |
| GMV (first month) | KES 5M |
| NPS (initial) | 30+ |
| App store rating | 4.0+ |

---

## 10. Measurement Tools

| Tool | Purpose | Metrics Collected |
|------|---------|-------------------|
| **Mixpanel/Amplitude** | Product analytics | User behavior, funnels |
| **Google Analytics** | Web analytics | Traffic, conversions |
| **Datadog/New Relic** | Performance | Latency, errors, uptime |
| **Stripe Dashboard** | Payments | Transaction success |
| **M-Pesa Portal** | M-Pesa metrics | STK success rates |
| **Custom Dashboard** | Business metrics | GMV, KPIs |
| **Zendesk/Intercom** | Support | Tickets, satisfaction |

---

## 11. Success Criteria Summary

### Year 1 Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| Market validation | 5,000+ technicians | Database |
| Customer adoption | 25,000+ customers | Database |
| Revenue | KES 50M GMV/month | Financial |
| Quality | 4.5+ app rating | App stores |
| Satisfaction | NPS 50+ | Survey |
| Retention | 40% 30-day retention | Analytics |

### Exit Criteria for Each Phase

| Phase | Must Achieve |
|-------|--------------|
| Phase 1 | WORD BANK functional, all services seeded |
| Phase 2 | Custom services saving, payment plans functional |
| Phase 3 | M-Pesa processing payments, escrow holding funds |
| Phase 4 | 500+ verified technicians, launch-ready |

---

*End of Success Metrics Document*
