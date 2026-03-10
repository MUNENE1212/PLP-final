# ADR-001: Clean Architecture Pattern for Service & Payment System

## Status: Accepted

## Context

Dumuwaks is adding a flexible service discovery system (WORD BANK), technician-defined pricing, and escrow-based payments. The existing codebase follows a traditional MVC pattern with some organizational debt. We need to decide on the architectural approach for the new features.

### Options Considered

1. **Continue MVC Pattern**: Add new models, views, controllers following existing patterns
2. **Layered Architecture**: Separate into presentation, business, and data layers
3. **Clean Architecture (Hexagonal)**: Domain-centric with ports and adapters
4. **Microservices**: Split into separate service discovery, payment, and booking services

## Decision

We will use **Clean Architecture (Hexagonal) principles** adapted to our existing codebase:

```
+----------------------------------+
|     External Systems Layer        |  <- Express routes, MongoDB, M-Pesa API
+----------------------------------+
|     Adapters Layer                |  <- Controllers, Repository implementations
+----------------------------------+
|     Application Layer             |  <- Use cases, Services
+----------------------------------+
|     Domain Layer                  |  <- Entities, Value Objects, Business Rules
+----------------------------------+
```

### Rationale

1. **Domain Independence**: Payment and escrow logic should not depend on M-Pesa, MongoDB, or Express
2. **Testability**: Core business logic can be tested without mocking external systems
3. **Maintainability**: Changes to payment gateways don't affect escrow logic
4. **Incremental Adoption**: Can implement in new modules while keeping existing MVC

### Implementation Approach

We adapt Clean Architecture pragmatically:

**Domain Layer (Models with Business Logic)**
```javascript
// Escrow model with domain methods
EscrowSchema.methods.release = async function(amount, userId) {
  // Business rule: Cannot release from empty escrow
  if (this.balances.held < amount) {
    throw new Error('Insufficient held balance');
  }
  
  // Domain logic: Update balances
  this.balances.held -= amount;
  this.balances.released += amount;
  
  // Domain event: Record in history
  this.addEvent('released', amount, userId);
};
```

**Application Layer (Services)**
```javascript
// services/escrow.service.js
class EscrowService {
  async releaseAfterCompletion(bookingId) {
    const escrow = await this.escrowRepository.findByBooking(bookingId);
    const payment = await this.paymentService.processPayout(escrow);
    await this.notificationService.notifyTechnician(escrow.technician, payment);
  }
}
```

**Adapters Layer (Controllers)**
```javascript
// controllers/escrow.controller.js
async function releaseEscrow(req, res) {
  const { bookingId } = req.params;
  const result = await escrowService.releaseAfterCompletion(bookingId);
  return res.json({ success: true, data: result });
}
```

## Consequences

### Positive
- Business logic isolated from infrastructure concerns
- Easier to swap payment gateways (M-Pesa to Flutterwave)
- Better testability with pure domain logic
- Clearer separation of concerns

### Negative
- Learning curve for developers unfamiliar with Clean Architecture
- More boilerplate code for dependency injection
- Need to maintain consistency between new and existing code

### Mitigation
- Document patterns clearly in architecture docs
- Code reviews to ensure architectural compliance
- Gradual refactoring of existing code when touching it

---

## Related Decisions

- ADR-002: Monetary Values as Integers (Cents)
- ADR-003: Feature Flags for Gradual Rollout
- ADR-004: Event Sourcing for Escrow Audit Trail
