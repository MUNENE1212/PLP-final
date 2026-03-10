# ADR-003: Feature Flags for Gradual Rollout

## Status: Accepted

## Context

We are implementing a major system change involving:
- New service discovery (WORD BANK)
- Technician-defined pricing
- Escrow-based payments
- Payout system

We need to deploy these changes safely without breaking existing functionality.

### Options Considered

1. **Big Bang Deployment**: Deploy everything at once
2. **Branch per Feature**: Long-lived feature branches
3. **Feature Flags**: Toggle features at runtime
4. **A/B Testing Platform**: Third-party experimentation platform

## Decision

We will use **feature flags** for gradual rollout of new features.

### Feature Flag List

| Flag | Description | Default |
|------|-------------|---------|
| `WORD_BANK_ENABLED` | New service discovery UI | false |
| `TECHNICIAN_PRICING_ENABLED` | Technician-defined pricing | false |
| `PAYMENT_PLANS_ENABLED` | Flexible payment plans | false |
| `ESCROW_ENABLED` | Escrow payment system | false |
| `MILESTONE_PAYMENTS_ENABLED` | Milestone-based payments | false |
| `NEW_BOOKING_FLOW_ENABLED` | New booking wizard | false |
| `INSTANT_PAYOUT_ENABLED` | Instant payout option | false |

## Implementation

### Configuration

```javascript
// config/featureFlags.js
module.exports = {
  WORD_BANK_ENABLED: process.env.FF_WORD_BANK === 'true',
  TECHNICIAN_PRICING_ENABLED: process.env.FF_TECHNICIAN_PRICING === 'true',
  // ...
};
```

### Middleware

```javascript
// middleware/featureFlags.js
function requireFeature(flagName) {
  return (req, res, next) => {
    if (!featureFlags[flagName]) {
      return res.status(403).json({
        success: false,
        message: 'This feature is not available'
      });
    }
    next();
  };
}
```

### Route Protection

```javascript
router.get('/services/categories',
  requireFeature('WORD_BANK_ENABLED'),
  controller.getCategories
);
```

### Frontend

```typescript
// hooks/useFeatureFlag.ts
export function useFeatureFlag(flagName: string): boolean {
  const flags = useSelector((state: RootState) => state.config.featureFlags);
  return flags[flagName] ?? false;
}

// Usage
function HomePage() {
  const wordBankEnabled = useFeatureFlag('WORD_BANK_ENABLED');
  
  return wordBankEnabled ? <ServiceDiscoveryGrid /> : <LegacyView />;
}
```

### Rollout Strategy

```
Phase 1: Internal testing (flag = true for admin users)
Phase 2: Beta testers (flag = true for specific user IDs)
Phase 3: Percentage rollout (flag = true for 10% of users)
Phase 4: General availability (flag = true for all)
Phase 5: Cleanup (remove flag, make feature default)
```

## Consequences

### Positive
- Can deploy code without enabling features
- Easy rollback by toggling flag
- A/B testing capability
- Gradual rollout reduces risk

### Negative
- Code complexity with conditional paths
- Technical debt if flags not cleaned up
- Testing all combinations is harder

### Mitigation
- Document all feature flags
- Set expiration dates on flags
- Schedule cleanup sprints after rollout
- Maintain test coverage for both paths

---

## Related Decisions

- ADR-001: Clean Architecture Pattern
- ADR-002: Monetary Values as Integers
