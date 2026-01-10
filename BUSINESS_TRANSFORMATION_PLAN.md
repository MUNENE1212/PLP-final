# Dumu Waks - Business Transformation Plan
## From Startup Concept to Fundable Business

**Date:** January 9, 2026
**Status:** Strategic Planning Phase
**Objective:** Transform Dumu Waks from a startup with mock data to a fundable business with real metrics, honest market positioning, and a clear path to sustainable growth and job creation.

---

## Executive Summary

Dumu Waks is a **live, operational platform** processing real transactions in Kenya's $25-30B maintenance and repair services market. However, to attract serious funding and create sustainable jobs, we must transition from using mock/pro-forma data to documenting **real performance metrics**, conducting **genuine market research**, and building **honest financial projections** based on actual traction.

**The Challenge:**
- Current narratives rely on projected/simulated metrics
- Seed data used for development is still in codebase
- Business documents use placeholder/target numbers instead of real performance
- No comprehensive market research validating assumptions
- Financial models are projections, not extrapolations of actual data

**The Opportunity:**
- Platform is LIVE and processing real transactions
- Real customers, technicians, and bookings exist
- M-Pesa payments are operational
- 4.2+ average ratings indicate product-market fit
- First-mover advantage in massive underserved market

**The Transformation:**
Replace all mock/target data with real metrics from production, conduct honest market research, build financial models from actual performance, and position Dumu Waks as a practical startup seeking funding to scale proven operations, not a concept asking for funding to experiment.

---

## Current State Assessment

### Platform Status: LIVE & OPERATIONAL

**What's Real:**
- ✅ Live URL: https://ementech-frontend.onrender.com/
- ✅ Real bookings being processed
- ✅ M-Pesa payments integrated and operational
- ✅ Real customers and technicians using platform
- ✅ Admin dashboard tracking actual metrics
- ✅ 99+ service types across 12 categories
- ✅ AI matching algorithm deployed

**What's Mock/Seed Data:**
- ❌ `backend/src/scripts/seed.js` - Sample users for testing
- ❌ `backend/src/scripts/seedPricing.js` - Sample pricing configuration
- ❌ Business narratives using target metrics ("80,000+ KES/month for technicians")
- ❌ Investor pitch with projected numbers instead of actuals

**What's Missing:**
- 📊 Real operational metrics dashboard (actual users, bookings, revenue)
- 📈 Unit economics analysis (real CAC, LTV, retention, churn)
- 📚 Market research validating assumptions
- 💰 Financial modeling based on actual performance
- 🎯 Go-to-market strategy for scaling to next milestone
- ⚠️ Risk assessment and mitigation strategies
- 📋 Investor data room with due diligence documents

---

## Transformation Roadmap

### Phase 1: Data Extraction & Validation (Week 1-2)
**Objective:** Replace all mock data with real performance metrics

#### 1.1 Real Metrics Dashboard
Extract actual data from production database:

**User Metrics:**
- Total registered customers (actual count)
- Total registered technicians (actual count)
- Active users in last 7/30/90 days
- User growth rate (week-over-week, month-over-month)
- Geographic distribution (cities, neighborhoods)

**Booking Metrics:**
- Total bookings processed (all time, last 30 days)
- Booking completion rate (completed vs cancelled)
- Average booking value (in KES)
- Booking frequency per customer
- Most booked service categories
- Average time from booking to completion

**Revenue Metrics:**
- Gross Merchandise Value (GMV) - actual total
- Platform revenue (15% of GMV) - actual
- Average revenue per booking
- Monthly recurring revenue (MRR)
- Revenue growth rate

**Technician Metrics:**
- Active technicians (completed booking in last 30 days)
- Average monthly earnings per technician (REAL data, not "80,000+ KES")
- Technician retention rate (30-day, 90-day)
- Top-performing technicians by earnings and rating
- Average technician rating (actual average)

**Quality Metrics:**
- Average customer rating (actual)
- Average technician rating (actual)
- Booking dispute rate
- Customer complaint rate
- Technician suspension rate

#### 1.2 Unit Economics Analysis

**Customer Acquisition Cost (CAC):**
- Total marketing spend (last 6 months)
- New customers acquired
- CAC = Marketing Spend / New Customers
- CAC by channel (Facebook, Google, referrals, etc.)

**Customer Lifetime Value (LTV):**
- Average revenue per customer per month
- Average customer lifespan (months active)
- LTV = ARPM × Customer Lifespan
- LTV:CAC ratio (target: >3:1)

**Technician Economics:**
- Real average monthly earnings (median, 75th percentile)
- Real income distribution (not just top performers)
- Technician acquisition cost
- Technician retention cost

**Retention & Churn:**
- Customer retention rate (30-day, 90-day)
- Technician retention rate (30-day, 90-day)
- Customer churn rate
- Technician churn rate
- Rebooking rate (percentage of customers who book again)

**Deliverable:** `docs/business/REAL_METRICS_DASHBOARD.md`

---

### Phase 2: Market Research & Validation (Week 3-4)
**Objective:** Validate market assumptions with genuine research

#### 2.1 Kenya Maintenance & Repair Market Study

**Primary Research:**
- Survey 500+ homeowners about their service provider hiring habits
- Survey 200+ technicians about their income and work acquisition
- Interview 20+ customers who used Dumu Waks
- Interview 20+ technicians earning through Dumu Waks
- Mystery shopping competitor platforms (Jiji, local directories)

**Key Questions to Answer:**
- What is the REAL size of Kenya's maintenance/repair market? (not $25-30B assumption)
- How much do households actually spend monthly on repairs? (actual data)
- What are the biggest pain points with current solutions? (validated problems)
- How do customers currently find technicians? (actual behavior)
- What is technician income volatility? (real income data)
- What would make customers switch from current methods? (validated value proposition)

**Secondary Research:**
- Kenya Bureau of Statistics household expenditure data
- Construction industry reports
- Labor market statistics for skilled trades
- Competitor analysis (Jiji, Biashara.co, local directories)
- Smartphone penetration and mobile money usage statistics

**Competitive Intelligence:**
- Jiji.co.ke: Total service listings, pricing, engagement
- Local competitor platforms (if any exist)
- International competitors (Uber, TaskRabbit - if operating in Kenya)
- Alternative solutions (hardware stores, word-of-mouth referrals)

**Deliverable:** `docs/business/MARKET_RESEARCH_REPORT.md`

#### 2.2 Customer & Technician Interviews

**Structured Interview Guide:**
- Pain points with current methods
- Experience using Dumu Waks
- Willingness to pay premium for verified quality
- Feature requests and improvement suggestions
- Referral likelihood (NPS score)
- Competitive alternatives considered

**Quantitative Surveys:**
- Demographic data (age, location, income level)
- Service usage patterns (frequency, types of services)
- Satisfaction scores (CSAT, NPS)
- Price sensitivity analysis
- Feature prioritization

**Deliverable:** `docs/customer-interviews/` and `docs/technician-interviews/`

---

### Phase 3: Competitive Analysis & Positioning (Week 5)
**Objective:** Honest assessment of competitive landscape

#### 3.1 Direct Competitor Analysis

**Jiji.co.ke:**
- Total service provider listings (actual count)
- Pricing structure (free vs paid listings)
- Trust features (reviews, verification, escrow)
- User experience audit
- Market share estimate

**Emerging Competitors:**
- Any new entrants in last 12 months
- Their funding status and growth trajectory
- Feature comparison matrix
- Pricing comparison

**Indirect Competitors:**
- Hardware stores (referral networks)
- Property management companies
- Real estate agents (maintenance referrals)
- Word-of-mouth networks

#### 3.2 Competitive Positioning Matrix

Create honest comparison:
| Feature | Jiji | Competitor X | Dumu Waks |
|---------|------|--------------|-----------|
| AI Matching | No | ? | ✅ 9-factor |
| Escrow Payments | No | ? | ✅ 20% deposit |
| Verified Reviews | Basic | ? | ✅ Multi-aspect |
| Technician Payout | N/A | ? | ✅ 85% |
| Real Users | 100,000+ | ? | [ACTUAL COUNT] |
| Monthly Bookings | Unknown | ? | [ACTUAL COUNT] |

**Deliverable:** `docs/business/COMPETITIVE_ANALYSIS.md`

---

### Phase 4: Financial Modeling & Projections (Week 6-7)
**Objective:** Build financial model from actual performance, not wishful thinking

#### 4.1 Historical Financial Performance

**Last 6-12 Months Actual Data:**
- Monthly GMV (Gross Merchandise Value)
- Monthly platform revenue (15% of GMV)
- Monthly operating expenses (breakdown by category)
- Monthly burn rate
- Cash balance trajectory

**Unit Economics (Real):**
- Actual CAC (by channel)
- Actual LTV (by customer cohort)
- Actual LTV:CAC ratio
- Actual payback period
- Actual contribution margin

#### 4.2 Forward Financial Projections

**Conservative Scenario (Base Case):**
- Assumptions based on actual growth rates (not hockey sticks)
- Linear growth from current baseline
- No major product breakthroughs assumed
- No competitor response factored

**Moderate Scenario (Target Case):**
- Optimistic but achievable growth (2-3x current growth rate)
- Successful feature launches
- Moderate marketing spend increase
- Some competitive pressure

**Aggressive Scenario (Best Case):**
- Viral growth
- Successful funding and aggressive expansion
- Competitive wins
- Market leadership achieved

**3-Year Projection:**
- Year 1: Extrapolation of current trends + marketing impact
- Year 2: Scaling to new cities (Mombasa, Kisumu, Nakuru)
- Year 3: Regional expansion (Uganda, Tanzania)

**Key Financial Metrics:**
- Monthly GMV
- Platform revenue
- Gross margin
- EBITDA (break-even timeline)
- Cash flow

**Deliverable:** `docs/business/FINANCIAL_MODEL.xlsx` and `docs/business/FINANCIAL_PROJECTIONS.md`

#### 4.3 Funding Requirements

**Use of Funds (Honest Breakdown):**
- Technician acquisition: X% (target: Y technicians in Z months)
- Customer marketing: X% (target: Y customers in Z months)
- Product development: X% (features: mobile app, AI improvements, etc.)
- Operations/team: X% (hiring: developers, marketing, operations)
- Contingency: X% (buffer for unexpected challenges)

**Runway Analysis:**
- Current burn rate: [ACTUAL]
- Requested funding amount: [TO BE DETERMINED]
- Expected runway: [MONTHS] to reach [MILESTONE]
- Next funding round: [WHEN] at [VALUATION]

**Deliverable:** `docs/business/FUNDING_REQUIREMENTS.md`

---

### Phase 5: Risk Assessment & Mitigation (Week 8)
**Objective:** Honest assessment of challenges and threats

#### 5.1 Business Risks

**Market Risks:**
- Market size overestimated (mitigation: ongoing market research)
- Customer adoption slower than expected (mitigation: pilot programs, partnerships)
- Technician supply shortage (mitigation: training programs, apprenticeships)

**Competitive Risks:**
- Well-funded competitor enters market (mitigation: fast scaling, network effects)
- Jiji adds matching and payments (mitigation: focus on superior experience)
- Price wars (mitigation: value-added features, technician loyalty)

**Operational Risks:**
- Payment system failures (M-Pesa outages) (mitigation: multiple payment rails)
- Quality control issues (mitigation: robust verification, insurance)
- Technician fraud (mitigation: escrow, background checks, reviews)
- Data breaches (mitigation: security audits, insurance)

**Financial Risks:**
- Runway shorter than expected (mitigation: conservative spending, milestone-based funding)
- Unit economics don't improve at scale (mitigation: continuous optimization)
- Unable to raise next round (mitigation: focus on profitability path)

**Regulatory Risks:**
- Platform worker classification changes (mitigation: legal compliance)
- Data privacy regulations (mitigation: GDPR-compliant systems)
- M-Pesa policy changes (mitigation: multiple payment options)

**Deliverable:** `docs/business/RISK_ASSESSMENT.md`

#### 5.2 Mitigation Strategies

For each risk:
- Probability (High/Medium/Low)
- Impact (High/Medium/Low)
- Mitigation plan (specific actions)
- Owner (who is responsible)
- Timeline (when to implement)

---

### Phase 6: Go-to-Market Strategy (Week 9)
**Objective:** Practical plan to scale to next milestone

#### 6.1 Target Milestone (18 Months)

**Quantitative Goals (Based on Reality, Not Dreams):**
- [ACTUAL CURRENT] → [TARGET] customers
- [ACTUAL CURRENT] → [TARGET] technicians
- [ACTUAL CURRENT] → [TARGET] monthly bookings
- [ACTUAL CURRENT] → [TARGET] monthly GMV
- [ACTUAL CURRENT] → [TARGET] monthly revenue

**Qualitative Goals:**
- Market leadership in Nairobi
- Expansion to 2 additional cities
- Mobile app launch (iOS + Android)
- Strategic partnerships (hardware stores, property managers)

#### 6.2 Customer Acquisition Strategy

**Channels (Priority by Real Performance):**
1. **Referral Program** (lowest CAC, highest retention)
   - Incentive structure (both referrer and referee)
   - Tracking and automation
   - Target: 30% of new customers from referrals

2. **Content Marketing** (SEO, thought leadership)
   - Blog: "How to find good plumbers in Nairobi"
   - YouTube: maintenance tips, technician spotlights
   - Social media: customer success stories
   - Target: 25% of new customers from organic

3. **Paid Social** (Facebook, Instagram)
   - Targeting: homeowners, 25-55, Nairobi
   - Creative: customer testimonials, before/after
   - Budget: [X] KES/month
   - Target CAC: [Y] KES
   - Target: 25% of new customers from paid

4. **Partnerships** (hardware stores, property managers)
   - Commission structure for referrals
   - Co-marketing campaigns
   - Target: 20% of new customers from partners

#### 6.3 Technician Acquisition Strategy

**Channels:**
1. **Technician Referrals** (most effective)
   - Incentive: bonus for every successful referral
   - Target: 40% of new technicians

2. **Trade Schools & Vocational Training** (pipeline)
   - Partnerships with technical institutes
   - Guest lectures, workshops
   - Target: 20% of new technicians

3. **Social Media Recruitment** (Facebook groups)
   - "Technician spotlight" posts
   - Income transparency (real earnings data)
   - Target: 20% of new technicians

4. **Field Recruitment** (on-the-ground)
   - Visit hardware stores, construction sites
   - Sign-up events in neighborhoods
   - Target: 20% of new technicians

#### 6.4 Retention Strategy

**Customer Retention:**
- Email marketing (monthly newsletter, tips, promos)
- SMS notifications (booking confirmations, technician en route)
- Loyalty program (discounts for repeat customers)
- Rebooking incentives (10% off 3rd booking)

**Technician Retention:**
- Minimum income guarantee (top performers)
- Tier progression system (clear growth path)
- Training and skill development
- Community building (forums, events)

**Deliverable:** `docs/business/GO_TO_MARKET_STRATEGY.md`

---

### Phase 7: Investor Pitch Deck (Week 10-11)
**Objective:** Create honest, data-driven pitch deck

#### Slide Structure

**Slide 1: Title**
- Logo + Tagline: "Skilled Technicians. Verified Quality. Transparent Pricing."
- Contact info

**Slide 2: Problem**
- "The $150B informal services sector has NO infrastructure"
- Customer pain: "Can't find reliable technicians"
- Technician pain: "Can't find consistent work"
- [USE REAL CUSTOMER QUOTES from interviews]

**Slide 3: Solution**
- AI matching + verified reputation + escrow payments
- [SCREENSHOTS of actual platform, not mockups]
- Real customer testimonials with photos

**Slide 4: Market**
- [REAL MARKET SIZE from research, not $25-30B assumption]
- Serviceable Addressable Market (SAM)
- Serviceable Obtainable Market (SOM)

**Slide 5: Product**
- [LIVE DEMO if possible, else screenshots]
- 9-factor AI matching (explain briefly)
- M-Pesa integration with escrow
- 5-tier technician progression

**Slide 6: Traction (ALL REAL DATA)**
- [ACTUAL] total users
- [ACTUAL] total bookings
- [ACTUAL] monthly GMV
- [ACTUAL] monthly revenue
- [ACTUAL] growth rates (MoM, YoY)
- [ACTUAL] ratings and reviews

**Slide 7: Business Model**
- 15% platform fee
- 85% technician payout
- [ACTUAL] unit economics:
  - CAC: [REAL NUMBER]
  - LTV: [REAL NUMBER]
  - LTV:CAC: [REAL RATIO]
  - Payback period: [REAL MONTHS]

**Slide 8: Go-to-Market**
- Customer acquisition channels (with real CAC data)
- Technician acquisition strategy
- Retention metrics (real retention rates)
- Expansion plan (Nairobi → Mombasa → East Africa)

**Slide 9: Competition**
- [HONEST COMPARISON TABLE]
- Acknowledge competitors' strengths
- Highlight Dumu Waks' unfair advantages
- First-mover advantage window (18-24 months)

**Slide 10: Financial Projections**
- [BASED ON REAL PERFORMANCE, not hockey sticks]
- 3-year forecast
- Conservative, moderate, aggressive scenarios
- Path to profitability timeline

**Slide 11: The Team**
- Founders with photos and bios
- Advisory board (if any)
- Key hires planned
- [FOCUS ON RELEVANT EXPERIENCE]

**Slide 12: The Ask**
- Raising: [AMOUNT]
- Use of funds: [HONEST BREAKDOWN]
- Runway: [MONTHS]
- Milestones to be achieved:
  - [TARGET] customers
  - [TARGET] technicians
  - [TARGET] monthly GMV
  - [TARGET] cities

**Slide 13: Contact**
- Email, phone, website
- Call to action: "Let's build the future of African services together"

**Deliverable:** `docs/investor/Dumu_Waks_Pitch_Deck.pptx`

---

### Phase 8: Data Room Preparation (Week 12)
**Objective:** Prepare all documents for investor due diligence

#### Data Room Structure

**Company Documents:**
- Certificate of incorporation
- Shareholder agreement
- Cap table
- Board meeting minutes
- Intellectual property (trademarks, patents if any)

**Financial Documents:**
- Last 12 months P&L
- Last 12 months balance sheet
- Last 12 months cash flow statement
- Current month financials
- Financial model (Excel)
- Budget vs actuals

**Legal Documents:**
- Customer terms of service
- Technician service agreement
- Privacy policy
- M-Pesa integration agreement
- Employee contracts
- Consultant agreements
- Insurance policies

**Product & Technology:**
- Product roadmap
- Technical architecture overview
- Security audit report (if available)
- API documentation
- User guides

**Market & Competition:**
- Market research report
- Competitive analysis
- Customer interviews (video clips if possible)
- Technician testimonials (video clips if possible)
- Press coverage (if any)

**Metrics & Analytics:**
- Real metrics dashboard (screenshots)
- Cohort analysis
- Unit economics calculator
- Churn analysis
- Funnel analysis

**Team & HR:**
- Organizational chart
- Founder bios
- Employee handbook (if exists)
- Hiring plan

**Deliverable:** Virtual data room (e.g., DocSend, Box)

---

## Success Metrics (Transformation Completion)

The transformation is complete when:

✅ **All mock data removed from business documents**
✅ **Real metrics dashboard published** (actual users, bookings, revenue)
✅ **Market research conducted** (500+ surveys, 40+ interviews)
✅ **Unit economics calculated** (real CAC, LTV, retention, churn)
✅ **Competitive analysis published** (honest comparison)
✅ **Financial model built** (based on actual performance)
✅ **Funding strategy defined** (round size, use of funds, milestones)
✅ **Pitch deck created** (100% real data)
✅ **Data room prepared** (all due diligence documents)
✅ **Risk assessment published** (honest challenges and mitigations)
✅ **Go-to-market strategy published** (practical scaling plan)

---

## Key Principles for This Transformation

### 1. Honesty Over Hype
- Use real numbers, even if they're smaller than projections
- Acknowledge challenges, don't hide them
- Validate assumptions with research, don't guess

### 2. Data Over Opinions
- Base decisions on actual data from production
- Survey customers and technicians, don't assume their needs
- Research competitors, don't dismiss them

### 3. Realistic Projections
- Build financial models from actual growth rates
- Scenario planning (conservative, moderate, aggressive)
- Don't promise hockey-stick growth without evidence

### 4. Investor-Ready Materials
- Professional pitch deck with real metrics
- Comprehensive data room for due diligence
- Clear use of funds and milestones

### 5. Focus on Sustainable Growth
- Unit economics that work at scale
- Path to profitability, not just growth at all costs
- Real job creation, not just "we'll create jobs"

---

## Next Steps

1. **Week 1-2:** Extract real metrics from production database
2. **Week 3-4:** Conduct market research and customer/technician interviews
3. **Week 5:** Competitive analysis and positioning
4. **Week 6-7:** Financial modeling and projections
5. **Week 8:** Risk assessment and mitigation
6. **Week 9:** Go-to-market strategy
7. **Week 10-11:** Investor pitch deck
8. **Week 12:** Data room preparation

**Total Timeline:** 12 weeks to full transformation

**Immediate Action (This Week):**
- Extract real metrics from production database
- Create REAL_METRICS_DASHBOARD.md
- Design market research surveys
- Identify target customers/technicians for interviews

---

## Conclusion

Dumu Waks is already a live, operational platform with real traction. The transformation is not about building a new product—it's about **being honest about current performance**, **conducting genuine research**, and **positioning the company for sustainable growth and funding**.

Investors fund companies that:
1. Have real traction (not just projections)
2. Know their market (validated through research)
3. Understand their unit economics (real CAC, LTV, retention)
4. Have a clear plan (go-to-market strategy)
5. Are honest about challenges (risk assessment)

This transformation plan will position Dumu Waks as a practical, fundable startup that creates real jobs and generates real sustainable value.

---

**Status:** Draft - Ready for Execution
**Owner:** Dumu Waks Founding Team
**Review Date:** Weekly during transformation
**Completion Target:** 12 weeks from start date

