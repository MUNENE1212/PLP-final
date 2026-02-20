# Real-Time Pricing & Negotiation API Documentation

## Overview

Task #74 implements dynamic pricing with surge detection, peak hour pricing, and enhanced multi-round negotiation capabilities.

## Backend Services

### Dynamic Pricing Service

Location: `/backend/src/services/dynamicPricing.service.js`

#### Features

- **Surge Pricing**: Automatically calculates surge multipliers based on demand per category
- **Peak Hour Detection**: Kenya peak hours (7-9 AM and 5-7 PM) with 1.1x multiplier
- **Demand Tracking**: Tracks active bookings per category per hour using Redis cache
- **Combined Multipliers**: Stacks surge and peak hour multipliers with diminishing returns

#### Key Functions

```javascript
// Calculate dynamic price for a service
const result = await calculateDynamicPrice({
  serviceCategory: 'plumbing',
  serviceType: 'Pipe Repair',
  urgency: 'high',
  scheduledDateTime: new Date(),
  basePrice: 1500,
  distanceFee: 200
});

// Get surge info for a category
const surgeInfo = await getSurgeInfo('plumbing');

// Get market rates for all categories
const marketRates = await getMarketRates();

// Get active surge alerts
const alerts = await getSurgeAlerts();
```

#### Surge Thresholds

| Bookings/Hour | Multiplier | Level    |
|---------------|------------|----------|
| 5+            | 1.2x       | Low      |
| 10+           | 1.3x       | Moderate |
| 15+           | 1.4x       | High     |
| 20+           | 1.5x       | Severe   |

### Socket Events

Location: `/backend/src/socketHandlers/pricing.handler.js`

#### Client -> Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `pricing:subscribe` | Subscribe to pricing updates | - |
| `pricing:unsubscribe` | Unsubscribe from updates | - |
| `pricing:get_market_rates` | Request current market rates | - |
| `pricing:get_surge` | Get surge for category | `{ category: string }` |
| `pricing:get_estimate` | Get price estimate | See below |
| `counter_offer:subscribe` | Subscribe to counter-offers | `{ bookingId: string }` |
| `counter_offer:unsubscribe` | Unsubscribe | `{ bookingId: string }` |

#### Server -> Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `pricing:market_rates` | Market rates update | `MarketRatesResponse` |
| `pricing:surge_alert` | Surge alerts | `SurgeAlertsResponse` |
| `pricing:surge_info` | Single category surge | `SurgeInfo` |
| `pricing:estimate` | Price estimate | `DynamicPriceResponse` |
| `pricing:error` | Error response | `{ error: string }` |
| `counter_offer:new` | New counter-offer | `{ bookingId, counterOffer }` |
| `counter_offer:accepted` | Offer accepted | `{ bookingId, ... }` |
| `counter_offer:rejected` | Offer rejected | `{ bookingId, canRenegotiate }` |

### REST API Endpoints

#### Submit Counter Offer (Technician)

```http
POST /api/v1/bookings/:id/counter-offer
Authorization: Bearer <token>
Content-Type: application/json

{
  "proposedAmount": 5000,
  "reason": "Additional materials required",
  "additionalNotes": "Will need copper piping",
  "expiresInHours": 24
}
```

**Response:**
```json
{
  "success": true,
  "message": "Counter offer submitted successfully",
  "counterOffer": {
    "proposedBy": "...",
    "proposedAt": "2026-02-20T...",
    "status": "pending",
    "proposedPricing": { ... },
    "reason": "...",
    "validUntil": "...",
    "round": 1
  },
  "negotiationHistory": [...],
  "roundsRemaining": 4,
  "booking": { ... }
}
```

#### Respond to Counter Offer (Customer)

```http
POST /api/v1/bookings/:id/counter-offer/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "accepted": false,
  "notes": "That's above my budget",
  "counterAmount": 4500
}
```

**Response (with counter-proposal):**
```json
{
  "success": true,
  "message": "Counter offer rejected. Your counter-proposal has been sent.",
  "isCounterProposal": true,
  "counterOffer": { ... },
  "negotiationHistory": [...],
  "roundsRemaining": 3
}
```

#### Get Negotiation History

```http
GET /api/v1/bookings/:id/negotiation-history
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentCounterOffer": { ... },
    "negotiationHistory": [
      {
        "round": 1,
        "proposedBy": "technician",
        "proposedAmount": 5000,
        "status": "rejected",
        "response": { ... }
      },
      {
        "round": 2,
        "proposedBy": "customer",
        "proposedAmount": 4500,
        "status": "pending"
      }
    ],
    "originalPricing": {
      "totalAmount": 4000,
      "currency": "KES"
    },
    "maxRounds": 5,
    "roundsRemaining": 3
  }
}
```

#### Withdraw Counter Offer (Technician)

```http
DELETE /api/v1/bookings/:id/counter-offer
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Found alternative solution"
}
```

## Frontend Components

### DynamicPriceCalculator

Location: `/frontend/src/components/pricing/DynamicPriceCalculator.tsx`

Displays real-time price breakdown with:
- Base price
- Applied multipliers (surge, peak hour, urgency, technician tier, time-based)
- Distance fees
- Booking fee
- Total amount

```tsx
<DynamicPriceCalculator
  breakdown={priceBreakdown}
  showDetails={true}
/>
```

### SurgeAlert

Location: `/frontend/src/components/pricing/SurgeAlert.tsx`

High demand banner showing:
- Current surge level
- Affected categories
- Price increase percentage
- Explanation of surge pricing
- Tips for avoiding surge

```tsx
<SurgeAlert
  alerts={surgeAlerts}
  onDismiss={() => setSurgeAlerts([])}
/>
```

### CounterOfferNegotiation

Location: `/frontend/src/components/booking/CounterOfferNegotiation.tsx`

Enhanced negotiation UI with:
- Price comparison view (original vs proposed)
- Negotiation history timeline
- Accept/Reject/Counter actions
- Real-time updates via socket
- Round tracking

```tsx
<CounterOfferNegotiation
  booking={booking}
  counterOffer={counterOffer}
  negotiationHistory={history}
  maxRounds={5}
  roundsRemaining={3}
  userRole="customer"
  onAccept={handleAccept}
  onReject={handleReject}
  onCounterPropose={handleCounter}
/>
```

## TypeScript Types

Location: `/frontend/src/types/pricing.ts`

Key types:
- `DynamicPriceBreakdown`
- `SurgeInfo`
- `PeakInfo`
- `SurgeAlert`
- `MarketRatesResponse`
- `CounterOffer`
- `NegotiationHistoryItem`
- `PRICING_SOCKET_EVENTS`

## Constants

### Maximum Negotiation Rounds
- 5 rounds maximum
- Each rejection allows a counter-proposal

### Counter-Offer Expiration
- Default: 24 hours
- Configurable via `expiresInHours` parameter

### Peak Hours (Kenya)
- Morning: 7:00 AM - 9:00 AM
- Evening: 5:00 PM - 7:00 PM
- Peak multiplier: 1.1x

## Error Handling

### Common Errors

| Code | Message | Resolution |
|------|---------|------------|
| 400 | Maximum negotiation rounds reached | Accept or reject current offer |
| 400 | Counter offer has expired | Request new offer |
| 403 | Only technicians can submit counter offers | Check user role |
| 403 | Only customers can respond | Check user role |
| 404 | Booking not found | Verify booking ID |

## Testing

### Manual Testing

1. Create a booking with a service category
2. Assign technician to booking
3. Technician submits counter-offer via API or socket
4. Customer receives notification
5. Customer accepts, rejects, or counters
6. Repeat until agreement or max rounds

### Socket Testing

```javascript
// Connect and subscribe
socket.emit('pricing:subscribe');

// Listen for updates
socket.on('pricing:market_rates', console.log);
socket.on('pricing:surge_alert', console.log);
```

## Deployment Notes

1. Redis is optional but recommended for demand tracking
2. Falls back to database queries if Redis unavailable
3. Surge cache TTL: 5 minutes
4. Market rates broadcast: every 30 seconds
