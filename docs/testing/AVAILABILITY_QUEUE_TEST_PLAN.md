# Test Plan for Task #73: Real-Time Availability & Queue System

## Overview
This document provides test scenarios and acceptance criteria for the Real-Time Availability & Queue System implementation.

## Test Categories

### 1. Backend Service Tests

#### 1.1 Availability Service Tests

**File to create:** `/backend/src/services/availability.service.test.js`

**Test Scenarios:**

```javascript
describe('Availability Service', () => {
  describe('updateTechnicianStatus', () => {
    it('should update technician status to online', async () => {
      // Test updating to online
    });

    it('should update technician status to busy with booking', async () => {
      // Test updating to busy with currentBookingId
    });

    it('should update technician status to away', async () => {
      // Test updating to away
    });

    it('should update technician status to offline', async () => {
      // Test updating to offline, should clear currentBookingId
    });

    it('should reject invalid status', async () => {
      // Test with invalid status like 'unknown'
    });

    it('should reject non-technician users', async () => {
      // Test with customer user
    });

    it('should reject inactive technician', async () => {
      // Test with suspended technician
    });

    it('should broadcast status change via socket', async () => {
      // Verify socket emission
    });
  });

  describe('updateStatusBasedOnBooking', () => {
    it('should set busy when booking starts', async () => {
      // bookingStatus = 'in_progress'
    });

    it('should set online when booking completes', async () => {
      // bookingStatus = 'completed'
    });

    it('should set online when booking is cancelled', async () => {
      // bookingStatus = 'cancelled'
    });

    it('should not change status for pending booking', async () => {
      // bookingStatus = 'pending'
    });
  });

  describe('calculateQueuePosition', () => {
    it('should return position 1 for first in queue', async () => {
      // Single booking scenario
    });

    it('should return correct position with multiple bookings', async () => {
      // Multiple bookings scenario
    });

    it('should return 0 when no technician assigned', async () => {
      // Booking without technician
    });

    it('should estimate wait time correctly', async () => {
      // Verify wait time calculation (60 min per booking)
    });

    it('should notify customer via socket', async () => {
      // Verify socket emission to customer
    });

    it('should handle non-existent booking', async () => {
      // Invalid booking ID
    });
  });

  describe('getOnlineTechnicianCount', () => {
    it('should return count for specific category', async () => {
      // Category-specific count
    });

    it('should return counts for all categories', async () => {
      // All categories count
    });

    it('should only count online technicians', async () => {
      // Exclude busy, away, offline
    });

    it('should only count active technicians', async () => {
      // Exclude suspended, inactive
    });

    it('should broadcast count via socket', async () => {
      // Verify socket emission
    });

    it('should return 0 for category with no online technicians', async () => {
      // Empty category
    });
  });

  describe('setInactiveTechniciansAway', () => {
    it('should set online technicians to away after 5 minutes', async () => {
      // Test auto-away mechanism
    });

    it('should not affect busy technicians', async () => {
      // Busy should stay busy
    });

    it('should not affect away technicians', async () => {
      // Away should stay away
    });

    it('should not affect offline technicians', async () => {
      // Offline should stay offline
    });

    it('should notify affected technicians', async () => {
      // Verify socket notification
    });

    it('should return count of affected technicians', async () => {
      // Verify return value
    });
  });

  describe('getTechnicianStatus', () => {
    it('should return current status', async () => {
      // Get status for online technician
    });

    it('should return offline for technician without availability', async () => {
      // New technician
    });

    it('should handle non-existent technician', async () => {
      // Invalid ID
    });
  });

  describe('getOnlineTechnicians', () => {
    it('should return list of online technicians', async () => {
      // Get all online
    });

    it('should filter by category', async () => {
      // Category-specific list
    });

    it('should include busy technicians', async () => {
      // Should include busy in the list
    });

    it('should sort by rating', async () => {
      // Verify sorting
    });

    it('should return empty array for category with no technicians', async () => {
      // Empty category
    });
  });
});
```

#### 1.2 Socket Handler Tests

**File to create:** `/backend/src/socketHandlers/availability.handler.test.js`

**Test Scenarios:**

```javascript
describe('Availability Socket Handler', () => {
  describe('availability:update event', () => {
    it('should update technician status', async () => {
      // Emit update event
    });

    it('should reject non-technician users', async () => {
      // Customer trying to update
    });

    it('should emit confirmation to technician', async () => {
      // availability:updated event
    });

    it('should broadcast change to all users', async () => {
      // availability:changed event
    });

    it('should handle errors gracefully', async () => {
      // Error handling
    });
  });

  describe('availability:get_status event', () => {
    it('should return current status', async () => {
      // Get status event
    });

    it('should handle non-existent technician', async () => {
      // Invalid ID
    });
  });

  describe('availability:get_online_count event', () => {
    it('should return count for category', async () => {
      // Get count event
    });

    it('should emit count to requester', async () => {
      // availability:online_count event
    });
  });

  describe('queue:subscribe event', () => {
    it('should join queue room', async () => {
      // Subscribe to queue updates
    });

    it('should emit current position', async () => {
      // Initial position update
    });

    it('should handle invalid booking ID', async () => {
      // Error handling
    });
  });

  describe('queue:unsubscribe event', () => {
    it('should leave queue room', async () => {
      // Unsubscribe from queue
    });
  });

  describe('availability:heartbeat event', () => {
    it('should update activity timestamp', async () => {
      // Heartbeat processing
    });

    it('should only track technicians', async () => {
      // Ignore non-technicians
    });
  });

  describe('disconnect event', () => {
    it('should set technician to offline', async () => {
      // On socket disconnect
    });

    it('should clean up activity tracking', async () => {
      // Remove from Map
    });
  });

  describe('auto-away timer', () => {
    it('should run every minute', async () => {
      // Timer verification (mock timers)
    });

    it('should set inactive technicians to away', async () => {
      // 5-minute threshold
    });
  });
});
```

### 2. Frontend Component Tests

#### 2.1 useTechnicianAvailability Hook Tests

**File to create:** `/frontend/src/hooks/useTechnicianAvailability.test.ts`

**Test Scenarios:**

```typescript
describe('useTechnicianAvailability Hook', () => {
  describe('initialization', () => {
    it('should initialize with offline status', () => {
      // Initial state
    });

    it('should auto-set online when enabled', () => {
      // autoOnline option
    });

    it('should not initialize for non-technicians', () => {
      // Customer user
    });
  });

  describe('status updates', () => {
    it('should update status to online', async () => {
      // setOnline()
    });

    it('should update status to busy with booking', async () => {
      // setBusy(bookingId)
    });

    it('should update status to away', async () => {
      // setAway()
    });

    it('should update status to offline', async () => {
      // setOffline()
    });

    it('should emit socket event on status change', async () => {
      // Socket emission
    });

    it('should optimistically update local state', async () => {
      // Immediate state update
    });
  });

  describe('heartbeat mechanism', () => {
    it('should start heartbeat on mount', () => {
      // Timer start
    });

    it('should emit heartbeat at interval', async () => {
      // Regular heartbeat
    });

    it('should stop heartbeat when offline', async () => {
      // Timer cleanup
    });

    it('should clean up heartbeat on unmount', () => {
      // Timer cleanup
    });
  });

  describe('socket event handling', () => {
    it('should handle status:updated event', async () => {
      // Update from server
    });

    it('should handle auto_away event', async () => {
      // Auto-away notification
    });

    it('should handle error events', async () => {
      // Error handling
    });
  });

  describe('convenience methods', () => {
    it('should return isOnline flag correctly', () => {
      // Boolean flags
    });

    it('should return isBusy flag correctly', () => {
      // Boolean flags
    });

    it('should return isAway flag correctly', () => {
      // Boolean flags
    });

    it('should return isOffline flag correctly', () => {
      // Boolean flags
    });
  });

  describe('callbacks', () => {
    it('should call onStatusChange callback', async () => {
      // Status change callback
    });

    it('should call onError callback', async () => {
      // Error callback
    });
  });
});
```

#### 2.2 QueuePositionDisplay Component Tests

**File to create:** `/frontend/src/components/booking/QueuePositionDisplay.test.tsx`

**Test Scenarios:**

```typescript
describe('QueuePositionDisplay Component', () => {
  describe('rendering', () => {
    it('should show loading state initially', () => {
      // Loading spinner
    });

    it('should show queue position when available', () => {
      // Position display
    });

    it('should show estimated wait time', () => {
      // Wait time formatting
    });

    it('should show technician name', () => {
      // Technician info
    });

    it('should show "next in line" for position 1', () => {
      // Special UI for position 1
    });

    it('should show "no technician" message', () => {
      // No technician assigned
    });

    it('should show error state', () => {
      // Error display
    });
  });

  describe('socket integration', () => {
    it('should subscribe to queue on mount', () => {
      // Socket subscription
    });

    it('should unsubscribe on unmount', () => {
      // Socket cleanup
    });

    it('should update on position change', async () => {
      // Real-time update
    });

    it('should handle socket errors', async () => {
      // Error handling
    });
  });

  describe('time formatting', () => {
    it('should format minutes correctly', () => {
      // Minutes display
    });

    it('should format hours correctly', () => {
      // Hours display
    });

    it('should format hours and minutes correctly', () => {
      // Mixed format
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      // Accessibility
    });

    it('should be keyboard navigable', () => {
      // Keyboard navigation
    });
  });
});
```

#### 2.3 OnlineCounter Component Tests

**File to create:** `/frontend/src/components/technician/OnlineCounter.test.tsx`

**Test Scenarios:**

```typescript
describe('OnlineCounter Component', () => {
  describe('rendering', () => {
    it('should display count correctly', () => {
      // Count display
    });

    it('should display category name', () => {
      // Category label
    });

    it('should hide label when showLabel is false', () => {
      // Label toggle
    });

    it('should apply size classes correctly', () => {
      // Size variants
    });

    it('should display animated indicator', () => {
      // Animation
    });
  });

  describe('category names', () => {
    it('should show "Plumbers" for plumbing', () => {
      // Category formatting
    });

    it('should show "Electricians" for electrical', () => {
      // Category formatting
    });

    it('should show "Technicians" for unknown', () => {
      // Default category name
    });
  });

  describe('socket integration', () => {
    it('should request count on mount', () => {
      // Initial count request
    });

    it('should update count on socket event', async () => {
      // Real-time update
    });

    it('should animate on count change', async () => {
      // Animation trigger
    });

    it('should only update for matching category', async () => {
      // Category filtering
    });
  });

  describe('styling', () => {
    it('should apply dark mode styles', () => {
      // Dark mode
    });

    it('should apply custom className', () => {
      // Custom styling
    });
  });
});
```

#### 2.4 AvailabilityIndicator Component Tests

**File to create:** `/frontend/src/components/technician/AvailabilityIndicator.test.tsx`

**Test Scenarios:**

```typescript
describe('AvailabilityIndicator Component', () => {
  describe('status rendering', () => {
    it('should show green dot for online', () => {
      // Online status
    });

    it('should show yellow dot for busy', () => {
      // Busy status
    });

    it('should show orange dot for away', () => {
      // Away status
    });

    it('should show gray dot for offline', () => {
      // Offline status
    });
  });

  describe('animation', () => {
    it('should animate online status', () => {
      // Pulse animation
    });

    it('should not animate other statuses', () => {
      // No animation
    });
  });

  describe('label display', () => {
    it('should show label when enabled', () => {
      // Label toggle
    });

    it('should hide label when disabled', () => {
      // Label toggle
    });

    it('should show correct status text', () => {
      // Label text
    });
  });

  describe('sizing', () => {
    it('should apply sm size classes', () => {
      // Small size
    });

    it('should apply md size classes', () => {
      // Medium size
    });

    it('should apply lg size classes', () => {
      // Large size
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Accessibility
    });
  });
});
```

### 3. Integration Tests

#### 3.1 End-to-End Flow Tests

**Test Scenarios:**

```typescript
describe('Availability Flow Integration', () => {
  it('should complete full availability update flow', async () => {
    // 1. Technician connects
    // 2. Set status to online
    // 3. Verify broadcast to all users
    // 4. Verify database update
  });

  it('should complete queue position flow', async () => {
    // 1. Create booking
    // 2. Assign technician
    // 3. Customer subscribes to queue
    // 4. Verify position update
    // 5. Complete previous booking
    // 6. Verify position change
  });

  it('should complete booking lifecycle flow', async () => {
    // 1. Technician is online
    // 2. Accept booking -> still online
    // 3. Start booking -> becomes busy
    // 4. Complete booking -> becomes online
  });

  it('should complete auto-away flow', async () => {
    // 1. Technician is online
    // 2. Send heartbeats
    // 3. Stop sending heartbeats
    // 4. Wait 5 minutes
    // 5. Verify auto-away status
  });
});
```

### 4. Performance Tests

**Test Scenarios:**

```typescript
describe('Performance Tests', () => {
  it('should handle 1000 status updates per second', async () => {
    // Load testing
  });

  it('should handle 100 concurrent queue subscriptions', async () => {
    // Concurrent connections
  });

  it('should calculate queue position in under 100ms', async () => {
    // Performance benchmark
  });

  it('should handle 500 online technicians', async () => {
    // Scalability test
  });
});
```

## Test Coverage Requirements

### Backend
- [ ] Service functions: 90%+ coverage
- [ ] Socket handlers: 85%+ coverage
- [ ] Edge cases: 100% coverage
- [ ] Error paths: 100% coverage

### Frontend
- [ ] Hooks: 90%+ coverage
- [ ] Components: 85%+ coverage
- [ ] User interactions: 100% coverage
- [ ] Error states: 100% coverage

## Test Data Setup

### Sample Technicians

```javascript
const testTechnicians = [
  {
    _id: 'tech1',
    role: 'technician',
    status: 'active',
    firstName: 'John',
    lastName: 'Plumber',
    skills: [{ name: 'Pipe Repair', category: 'plumbing' }],
    availability: {
      status: 'online',
      lastSeen: new Date(),
      currentBookingId: null,
      queuePosition: 0
    }
  },
  {
    _id: 'tech2',
    role: 'technician',
    status: 'active',
    firstName: 'Jane',
    lastName: 'Electrician',
    skills: [{ name: 'Wiring', category: 'electrical' }],
    availability: {
      status: 'busy',
      lastSeen: new Date(),
      currentBookingId: 'booking1',
      queuePosition: 1
    }
  }
];
```

### Sample Bookings

```javascript
const testBookings = [
  {
    _id: 'booking1',
    customer: 'customer1',
    technician: 'tech1',
    status: 'pending',
    queuePosition: 1
  },
  {
    _id: 'booking2',
    customer: 'customer2',
    technician: 'tech1',
    status: 'pending',
    queuePosition: 2
  }
];
```

## Mocking Strategy

### Socket.IO Mock

```javascript
// Mock socket instance
const mockIo = {
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
  on: jest.fn(),
  sockets: {
    adapter: {
      rooms: new Map()
    }
  }
};
```

### Database Mock

```javascript
// Mock User model
jest.mock('../models/User');
jest.mock('../models/Booking');
```

## Acceptance Criteria

### Must Have (P0)
- [ ] All service functions working correctly
- [ ] All socket events emitting correctly
- [ ] Status updates persisting to database
- [ ] Queue position calculating accurately
- [ ] Online counts displaying correctly
- [ ] Auto-away mechanism working
- [ ] All components rendering without errors
- [ ] Real-time updates working
- [ ] Error handling working

### Should Have (P1)
- [ ] 90%+ test coverage achieved
- [ ] Performance benchmarks met
- [ ] Accessibility requirements met
- [ ] Dark mode support working

### Nice to Have (P2)
- [ ] Animation polish
- [ ] Additional edge case handling
- [ ] Performance optimizations

## Test Execution

### Run Backend Tests
```bash
cd backend
npm test -- availability.service.test.js
npm test -- availability.handler.test.js
```

### Run Frontend Tests
```bash
cd frontend
npm test -- useTechnicianAvailability.test.ts
npm test -- QueuePositionDisplay.test.tsx
npm test -- OnlineCounter.test.tsx
npm test -- AvailabilityIndicator.test.tsx
```

### Run All Tests
```bash
npm run test:coverage
```

## Continuous Integration

Ensure all tests run in CI pipeline:
- [ ] Tests run on every PR
- [ ] Tests run on merge to master
- [ ] Coverage reports generated
- [ ] Failed tests block deployment

## Manual Testing Checklist

### Technician Status Management
- [ ] Technician can go online
- [ ] Technician can go offline
- [ ] Technician can set away
- [ ] Status persists on refresh
- [ ] Auto-away after 5 minutes
- [ ] Heartbeat keeps online status

### Queue Position
- [ ] Queue position displays correctly
- [ ] Position updates in real-time
- [ ] Estimated wait time accurate
- [ ] "Next in line" shows special UI
- [ ] Error states handled

### Online Counters
- [ ] Count displays correctly
- [ ] Count updates in real-time
- [ ] Category names formatted
- [ ] Animation works

### Availability Indicators
- [ ] Correct colors per status
- [ ] Animation for online status
- [ ] Labels toggle correctly
- [ ] Sizes work correctly

### Socket Events
- [ ] Events emit correctly
- [ ] Events received correctly
- [ ] Reconnection works
- [ ] Error handling works

## Bug Report Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Node version:
- Browser:
- OS:

## Screenshots
[If applicable]

## Logs
[Relevant console/server logs]
```

## Questions for QA Agent

1. Should we test edge cases like network disconnections during status updates?
2. Should we add tests for rate limiting on socket events?
3. Should we test the system with a large number of concurrent users?
4. Should we add visual regression tests for the components?
5. Should we test internationalization of category names?
