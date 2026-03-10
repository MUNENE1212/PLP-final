# ADR-002: Monetary Values Stored as Integers (Cents)

## Status: Accepted

## Context

We need to store and calculate monetary values (KES - Kenyan Shillings) for bookings, payments, escrows, and payouts. The choice of data type affects:
- Precision of calculations
- Comparison operations
- API responses
- Database storage

### Options Considered

1. **Float/Double**: Native JavaScript numbers (IEEE 754)
2. **String**: Store as "1500.00"
3. **Integer (Cents)**: Store 1500.00 KES as 150000 cents
4. **Decimal128**: MongoDB's arbitrary precision decimal type
5. **Dedicated Money Library**: Use a library like dinero.js or currency.js

## Decision

We will store all monetary values as **integers in cents** (KES * 100).

```javascript
// Example: KES 1,500.00 stored as 150000
const priceInKES = 1500;
const priceInCents = Math.round(priceInKES * 100); // 150000

// Display
const displayPrice = (priceInCents / 100).toLocaleString('en-KE', {
  style: 'currency',
  currency: 'KES'
}); // "KES 1,500.00"
```

### Rationale

1. **No Floating-Point Errors**: `0.1 + 0.2 !== 0.3` in JavaScript floats
2. **Exact Comparisons**: `150000 === 150000` always true
3. **Simple Arithmetic**: `a + b` and `a - b` work correctly
4. **M-Pesa Compatibility**: M-Pesa API uses integer amounts
5. **Database Efficiency**: Integers index and query faster than decimals

### What We Avoid

```javascript
// Floating-point issues we avoid:
0.1 + 0.2  // 0.30000000000000004
1.005 * 100 // 100.49999999999999
10.00 * 0.07 // 0.7000000000000001
```

## Implementation

### Database Schema

```javascript
// All amounts in cents
amounts: {
  held: { type: Number, default: 0 },      // 150000 = KES 1,500
  released: { type: Number, default: 0 },  // 75000 = KES 750
  refunded: { type: Number, default: 0 }
}
```

### API Responses

```javascript
// Option 1: Return cents, let frontend format
{
  "amount": 150000,  // Frontend divides by 100
  "currency": "KES"
}

// Option 2: Return both (recommended)
{
  "amount": 150000,
  "amountFormatted": "KES 1,500.00",
  "currency": "KES"
}
```

### Frontend Display

```typescript
// Utility function
export function formatKES(cents: number): string {
  return (cents / 100).toLocaleString('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Usage
formatKES(150000); // "KES 1,500.00"
formatKES(99);     // "KES 0.99"
```

### Calculations

```javascript
// Correct way to add/subtract
const total = price1InCents + price2InCents;
const fee = Math.round(total * 0.15); // 15% fee

// Division (e.g., splitting)
const split = Math.floor(total / 2); // Floor to avoid rounding up

// Percentage
const percentage = Math.round((part / total) * 100); // Returns percentage as integer
```

## Consequences

### Positive
- No floating-point rounding errors
- Faster database operations
- Simpler comparison logic
- M-Pesa API compatible

### Negative
- Need to convert for display
- Must remember to divide/multiply by 100
- Risk of forgetting conversion in new code

### Mitigation
- Use helper functions for all conversions
- Add ESLint rule to warn on direct monetary arithmetic
- Code review checklist includes checking money handling

---

## Related Decisions

- ADR-001: Clean Architecture Pattern
- ADR-003: Feature Flags for Gradual Rollout
