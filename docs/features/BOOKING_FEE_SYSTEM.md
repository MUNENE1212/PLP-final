# Booking Fee System - Complete Guide

## Overview

The booking fee system implements a **20% refundable deposit** that customers must pay before technician matching begins. This ensures commitment from both parties and provides protection against cancellations.

---

## Key Features

✅ **20% Refundable Deposit** - Customers pay 20% of total price upfront
✅ **Escrow Protection** - Fee held securely until job completion
✅ **Automatic Calculation** - Integrated with pricing service
✅ **Smart Release** - Released to technician after job verification
✅ **Refund Support** - Full refund if booking cancelled
✅ **Workflow Integration** - Blocks matching until fee paid

---

## How It Works

### 1. Booking Creation

When a customer creates a booking:

```javascript
POST /api/v1/bookings

{
  "serviceCategory": "plumbing",
  "serviceType": "Pipe Repair",
  "description": "Leaking pipe in kitchen",
  "serviceLocation": {
    "coordinates": [36.8219, -1.2921],
    "address": "123 Main St, Nairobi"
  },
  "scheduledDate": "2025-01-30T10:00:00Z",
  "urgency": "medium"
}
```

**Response includes:**

```json
{
  "success": true,
  "message": "Booking created successfully. Please pay the booking fee to proceed with matching.",
  "booking": {
    "_id": "...",
    "bookingNumber": "BKG-1738012345-00001",
    "pricing": {
      "totalAmount": 2500,
      "bookingFee": 500,
      "remainingAmount": 2000,
      "currency": "KES"
    },
    "bookingFee": {
      "required": true,
      "percentage": 20,
      "amount": 500,
      "status": "pending"
    }
  },
  "nextSteps": {
    "action": "pay_booking_fee",
    "amount": 500,
    "currency": "KES",
    "description": "20% refundable booking deposit required before technician matching",
    "endpoint": "/api/v1/bookings/[booking_id]/booking-fee/confirm"
  }
}
```

### 2. Payment Process

Customer initiates payment via M-Pesa/Card/Wallet:

```javascript
// Step 1: Create transaction (via payment gateway)
POST /api/v1/payments/initiate

{
  "bookingId": "...",
  "amount": 500,
  "type": "booking_fee",
  "method": "mpesa"
}

// Step 2: Confirm booking fee payment
POST /api/v1/bookings/:id/booking-fee/confirm

{
  "transactionId": "transaction_id_from_payment"
}
```

**System validates:**
- Transaction exists and is completed
- Amount matches booking fee (500 KES)
- Customer owns the booking

**On success:**
- Booking fee status → `held`
- Fee held in escrow
- Booking status → `matching` (ready for technician assignment)

### 3. Technician Matching

Once booking fee is paid (`status: 'held'`):

- AI matching algorithm activates
- Available technicians notified
- Customer can view/compare technician prices
- Technician accepts job → status changes to `accepted`

### 4. Job Completion & Fee Release

After technician completes work:

```javascript
// Technician requests completion
POST /api/v1/bookings/:id/completion/request

// Customer verifies
POST /api/v1/bookings/:id/completion/respond
{
  "approved": true,
  "feedback": "Great work!"
}

// System auto-releases booking fee to technician
POST /api/v1/bookings/:id/booking-fee/release
```

**Fee release triggers when:**
- Customer approves completion (`status: 'verified'`)
- Support confirms after follow-up (`escrowReleaseCondition: 'support_approved'`)
- Auto-approval after 7 days unreachable

### 5. Cancellation & Refunds

If booking cancelled before completion:

```javascript
POST /api/v1/bookings/:id/booking-fee/refund

{
  "reason": "Customer cancelled due to emergency"
}
```

**Refund conditions:**
- Booking status: `cancelled`, `disputed`, or `rejected`
- Fee status: `held` (in escrow)
- Only support/admin can process refund

---

## API Endpoints

### Get Booking Fee Status

```http
GET /api/v1/bookings/:id/booking-fee
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "bookingFee": {
    "required": true,
    "percentage": 20,
    "amount": 500,
    "status": "held",
    "paidAt": "2025-01-27T12:00:00Z",
    "heldInEscrow": true,
    "transactionId": "..."
  },
  "bookingStatus": "matching",
  "totalAmount": 2500,
  "remainingAmount": 2000
}
```

### Confirm Booking Fee Payment

```http
POST /api/v1/bookings/:id/booking-fee/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "transactionId": "transaction_id_from_payment"
}
```

**Access:** Customer/Corporate only

**Validations:**
- Customer owns booking
- Fee not already paid
- Transaction exists and completed
- Amount matches booking fee

**Response:**

```json
{
  "success": true,
  "message": "Booking fee confirmed and held in escrow",
  "booking": {
    "id": "...",
    "bookingNumber": "BKG-...",
    "status": "matching",
    "bookingFee": {
      "status": "held",
      "paidAt": "2025-01-27T12:00:00Z",
      "heldInEscrow": true
    }
  }
}
```

### Release Booking Fee to Technician

```http
POST /api/v1/bookings/:id/booking-fee/release
Authorization: Bearer {admin_or_support_token}
```

**Access:** Admin/Support only

**Requirements:**
- Fee status: `held`
- Job status: `verified`

**Response:**

```json
{
  "success": true,
  "message": "Booking fee released to technician",
  "booking": {
    "bookingFee": {
      "status": "released",
      "releasedAt": "2025-01-29T14:00:00Z"
    }
  },
  "transaction": {
    "type": "booking_fee_release",
    "amount": 500,
    "recipient": "technician_id"
  }
}
```

### Refund Booking Fee to Customer

```http
POST /api/v1/bookings/:id/booking-fee/refund
Authorization: Bearer {admin_or_support_token}
Content-Type: application/json

{
  "reason": "Booking cancelled by customer"
}
```

**Access:** Admin/Support only

**Requirements:**
- Fee status: `held`
- Booking status: `cancelled`, `disputed`, or `rejected`

**Response:**

```json
{
  "success": true,
  "message": "Booking fee refunded to customer",
  "booking": {
    "bookingFee": {
      "status": "refunded",
      "refundedAt": "2025-01-27T15:00:00Z",
      "notes": "Booking cancelled by customer"
    }
  },
  "transaction": {
    "type": "booking_fee_refund",
    "amount": 500,
    "recipient": "customer_id"
  }
}
```

---

## Database Schema

### Booking Model - bookingFee Field

```javascript
bookingFee: {
  required: {
    type: Boolean,
    default: true
  },
  percentage: {
    type: Number,
    default: 20
  },
  amount: Number, // Calculated as 20% of pricing.totalAmount
  status: {
    type: String,
    enum: ['pending', 'paid', 'held', 'released', 'refunded'],
    default: 'pending'
  },
  paidAt: Date,
  releasedAt: Date,
  refundedAt: Date,
  heldInEscrow: {
    type: Boolean,
    default: false
  },
  escrowReleaseCondition: {
    type: String,
    enum: ['job_verified', 'support_approved', 'auto_released'],
    default: 'job_verified'
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  refundTransactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  notes: String
}
```

### Transaction Types

New transaction types added:

- `booking_fee` - Customer pays 20% deposit
- `booking_fee_release` - Release fee to technician
- `booking_fee_refund` - Refund fee to customer

---

## Workflow States

### Booking Status Flow with Fee

```
1. CREATE BOOKING
   status: 'pending'
   bookingFee.status: 'pending'
   ↓
2. PAY BOOKING FEE
   bookingFee.status: 'held'
   status: 'matching'
   ↓
3. TECHNICIAN ASSIGNED
   status: 'assigned'
   ↓
4. TECHNICIAN ACCEPTS
   status: 'accepted'
   ↓
5. JOB IN PROGRESS
   status: 'in_progress'
   ↓
6. TECHNICIAN REQUESTS COMPLETION
   status: 'completed'
   ↓
7. CUSTOMER VERIFIES
   status: 'verified'
   bookingFee.status: 'released' (auto-released to technician)
   ↓
8. FINAL PAYMENT
   status: 'paid'
```

### Cancellation Flow

```
1. BOOKING CANCELLED
   status: 'cancelled'
   ↓
2. SUPPORT REFUNDS FEE
   bookingFee.status: 'refunded'
   ↓
3. REFUND TRANSACTION CREATED
   Transaction.type: 'booking_fee_refund'
```

---

## Frontend Integration

### React Example - Display Booking Fee

```javascript
import React, { useState } from 'react';
import axios from 'axios';

const BookingFeePayment = ({ booking }) => {
  const [paying, setPaying] = useState(false);

  const handlePayment = async () => {
    setPaying(true);

    try {
      // Step 1: Initiate payment
      const paymentResponse = await axios.post('/api/v1/payments/initiate', {
        bookingId: booking._id,
        amount: booking.bookingFee.amount,
        type: 'booking_fee',
        method: 'mpesa'
      });

      const { transactionId } = paymentResponse.data;

      // Step 2: Confirm booking fee
      const confirmResponse = await axios.post(
        `/api/v1/bookings/${booking._id}/booking-fee/confirm`,
        { transactionId }
      );

      alert('Booking fee paid! Your booking is now being matched with technicians.');

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="booking-fee-card">
      <h3>Booking Fee Required</h3>
      <p>
        A refundable deposit of <strong>{booking.bookingFee.amount} {booking.pricing.currency}</strong>
        {' '}(20% of total) is required before we match you with a technician.
      </p>

      <div className="fee-breakdown">
        <div>Total Amount: {booking.pricing.totalAmount} KES</div>
        <div>Booking Fee (20%): {booking.bookingFee.amount} KES</div>
        <div>Remaining: {booking.pricing.remainingAmount} KES</div>
      </div>

      <button onClick={handlePayment} disabled={paying}>
        {paying ? 'Processing...' : `Pay ${booking.bookingFee.amount} KES`}
      </button>

      <small>
        ✓ 100% Refundable if you cancel<br/>
        ✓ Released to technician after job completion<br/>
        ✓ Secure escrow protection
      </small>
    </div>
  );
};

export default BookingFeePayment;
```

### Display Fee Status

```javascript
const BookingFeeStatus = ({ bookingId }) => {
  const [feeStatus, setFeeStatus] = useState(null);

  useEffect(() => {
    fetchFeeStatus();
  }, [bookingId]);

  const fetchFeeStatus = async () => {
    const response = await axios.get(`/api/v1/bookings/${bookingId}/booking-fee`);
    setFeeStatus(response.data);
  };

  if (!feeStatus) return <div>Loading...</div>;

  return (
    <div className="fee-status">
      <h4>Booking Fee Status</h4>
      <div className="status-badge" data-status={feeStatus.bookingFee.status}>
        {feeStatus.bookingFee.status.toUpperCase()}
      </div>

      {feeStatus.bookingFee.status === 'pending' && (
        <p>Payment required to continue</p>
      )}

      {feeStatus.bookingFee.status === 'held' && (
        <p>
          Fee held in escrow. Will be released to technician after job completion.
          <br/>
          <small>Paid: {new Date(feeStatus.bookingFee.paidAt).toLocaleString()}</small>
        </p>
      )}

      {feeStatus.bookingFee.status === 'released' && (
        <p>
          Fee released to technician.
          <br/>
          <small>Released: {new Date(feeStatus.bookingFee.releasedAt).toLocaleString()}</small>
        </p>
      )}

      {feeStatus.bookingFee.status === 'refunded' && (
        <p>
          Fee refunded to your account.
          <br/>
          <small>Refunded: {new Date(feeStatus.bookingFee.refundedAt).toLocaleString()}</small>
        </p>
      )}

      <div className="amount-info">
        <div>Booking Fee: {feeStatus.bookingFee.amount} KES</div>
        <div>Remaining Balance: {feeStatus.remainingAmount} KES</div>
      </div>
    </div>
  );
};
```

---

## Business Logic

### Why 20%?

- **Commitment**: Significant enough to ensure customer commitment
- **Not Burdensome**: Not too high to discourage bookings
- **Industry Standard**: Aligns with common deposit practices
- **Covers Costs**: Helps cover platform costs if booking cancelled

### Refund Policy

**Full Refund When:**
- Customer cancels before technician accepts
- Technician doesn't show up
- Service cannot be completed (technician's fault)
- Dispute resolved in customer's favor

**No Refund When:**
- Customer cancels after technician en route
- Customer not available at scheduled time
- Customer dispute resolved in technician's favor
- Late cancellation (< 2 hours notice)

**Partial Refund When:**
- Cancellation with 2-24 hours notice (50% refund)
- Partial service completion agreed

---

## Error Handling

### Common Errors

**1. Booking fee already paid**

```json
{
  "success": false,
  "message": "Booking fee already paid"
}
```

**Solution:** Check fee status before attempting payment.

**2. Transaction amount mismatch**

```json
{
  "success": false,
  "message": "Transaction amount (450) does not match booking fee (500)"
}
```

**Solution:** Ensure payment amount exactly matches `booking.bookingFee.amount`.

**3. Job not verified**

```json
{
  "success": false,
  "message": "Job must be verified before releasing booking fee"
}
```

**Solution:** Wait for customer to verify completion or support to approve.

**4. Cannot refund**

```json
{
  "success": false,
  "message": "Booking must be cancelled, disputed, or rejected to refund booking fee"
}
```

**Solution:** Update booking status first, then refund.

---

## Security Considerations

✅ **Escrow Protection:** Fees held in secure escrow until conditions met
✅ **Authorization:** Only customer can pay, only support can refund/release
✅ **Validation:** Amount and transaction verification before confirmation
✅ **Audit Trail:** All fee transactions tracked with timestamps
✅ **Fraud Prevention:** Integration with fraud detection system

---

## Testing

### Test Scenarios

```bash
# 1. Create booking with fee
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceCategory": "plumbing",
    "serviceType": "Pipe Repair",
    "description": "Leaking pipe",
    "serviceLocation": {
      "coordinates": [36.8219, -1.2921],
      "address": "123 Main St"
    },
    "scheduledDate": "2025-01-30T10:00:00Z",
    "urgency": "medium"
  }'

# 2. Check fee status
curl http://localhost:5000/api/v1/bookings/$BOOKING_ID/booking-fee \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# 3. Confirm payment
curl -X POST http://localhost:5000/api/v1/bookings/$BOOKING_ID/booking-fee/confirm \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "$TRANSACTION_ID"}'

# 4. Release fee (as support)
curl -X POST http://localhost:5000/api/v1/bookings/$BOOKING_ID/booking-fee/release \
  -H "Authorization: Bearer $SUPPORT_TOKEN"

# 5. Refund fee (as support)
curl -X POST http://localhost:5000/api/v1/bookings/$BOOKING_ID/booking-fee/refund \
  -H "Authorization: Bearer $SUPPORT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Customer cancelled"}'
```

---

## Analytics & Reporting

### Booking Fee Metrics

```javascript
// Get booking fee statistics
const getBookingFeeStats = async (startDate, endDate) => {
  const stats = await Transaction.aggregate([
    {
      $match: {
        type: { $in: ['booking_fee', 'booking_fee_release', 'booking_fee_refund'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.gross' }
      }
    }
  ]);

  return stats;
};

// Example output:
// [
//   { _id: 'booking_fee', count: 150, totalAmount: 75000 },
//   { _id: 'booking_fee_release', count: 120, totalAmount: 60000 },
//   { _id: 'booking_fee_refund', count: 30, totalAmount: 15000 }
// ]

// Escrow balance
const getEscrowBalance = async () => {
  const heldFees = await Booking.aggregate([
    {
      $match: {
        'bookingFee.status': 'held',
        'bookingFee.heldInEscrow': true
      }
    },
    {
      $group: {
        _id: null,
        totalHeld: { $sum: '$bookingFee.amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return heldFees[0];
};
```

---

## Troubleshooting

### Issue: Booking stuck in pending status

**Cause:** Customer didn't pay booking fee
**Solution:** Send reminder to pay or cancel booking

### Issue: Fee not released after completion

**Cause:** Job status not updated to 'verified'
**Solution:** Check completion workflow, manually verify if needed

### Issue: Refund not processing

**Cause:** Fee status not 'held' or booking status invalid
**Solution:** Verify booking status is cancelled/disputed/rejected

---

## Future Enhancements

- **Dynamic Fee Percentage:** Allow configurable fee percentage per service category
- **Payment Plans:** Split payment for high-value bookings
- **Loyalty Waiver:** Waive fee for repeat customers
- **Instant Release:** Option for customer to release fee early
- **Partial Release:** Release percentage based on completion checkpoints

---

## Support

For issues or questions:
- Check booking fee status via API
- Review transaction history
- Contact support team
- Check audit logs for fee-related events

---

**Last Updated:** January 2025
**Version:** 1.0
**Status:** Production Ready ✅
