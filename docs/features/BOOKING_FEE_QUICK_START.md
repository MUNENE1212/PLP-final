# Booking Fee System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Understanding the Flow (30 seconds)

```
Customer Creates Booking → System Calculates 20% Fee → Customer Pays Fee →
Fee Held in Escrow → Technician Matched → Job Done → Customer Verifies →
Fee Released to Technician
```

### Step 2: Create a Booking with Fee (2 minutes)

```bash
# Create booking
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceCategory": "plumbing",
    "serviceType": "Pipe Repair",
    "description": "Kitchen pipe leaking",
    "serviceLocation": {
      "coordinates": [36.8219, -1.2921],
      "address": "123 Main Street, Nairobi"
    },
    "scheduledDate": "2025-01-30T10:00:00Z",
    "urgency": "medium"
  }'
```

**Response includes:**
- Total price: e.g., 2500 KES
- Booking fee (20%): e.g., 500 KES
- Remaining balance: e.g., 2000 KES
- Next step: Pay booking fee

### Step 3: Pay the Booking Fee (1 minute)

```bash
# First, initiate payment via your payment gateway (M-Pesa/Stripe)
# Then confirm the booking fee:

curl -X POST http://localhost:5000/api/v1/bookings/BOOKING_ID/booking-fee/confirm \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TRANSACTION_ID_FROM_PAYMENT"
  }'
```

**Result:**
- Fee status → `held`
- Booking status → `matching`
- Technician matching begins!

### Step 4: Check Fee Status (30 seconds)

```bash
curl http://localhost:5000/api/v1/bookings/BOOKING_ID/booking-fee \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "bookingFee": {
    "amount": 500,
    "status": "held",
    "paidAt": "2025-01-27T12:00:00Z",
    "heldInEscrow": true
  },
  "totalAmount": 2500,
  "remainingAmount": 2000
}
```

### Step 5: After Job Completion (30 seconds)

When customer verifies job completion, the booking fee is **automatically released** to the technician.

For manual release (Support/Admin only):

```bash
curl -X POST http://localhost:5000/api/v1/bookings/BOOKING_ID/booking-fee/release \
  -H "Authorization: Bearer YOUR_SUPPORT_TOKEN"
```

---

## 🔄 Refund Process

If booking is cancelled:

```bash
curl -X POST http://localhost:5000/api/v1/bookings/BOOKING_ID/booking-fee/refund \
  -H "Authorization: Bearer YOUR_SUPPORT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer cancelled before technician assigned"
  }'
```

---

## 📊 What You Get

✅ **20% Upfront Payment** - Ensures customer commitment
✅ **Escrow Protection** - Fee safely held until job done
✅ **Automatic Release** - No manual intervention needed
✅ **Full Refund Support** - If booking cancelled
✅ **Audit Trail** - Complete transaction history

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Percentage** | Fixed 20% of total booking amount |
| **Refundable** | 100% refundable if booking cancelled |
| **Escrow** | Held securely, cannot be accessed during service |
| **Auto-Release** | Released when customer verifies completion |
| **Status Tracking** | Real-time status updates (pending/held/released/refunded) |

---

## 🔐 Security

- Only customers can pay booking fee
- Only support/admin can release or refund
- Transaction amount must match exactly
- All actions logged with timestamps

---

## 💡 Pro Tips

1. **Show fee upfront** - Display booking fee during price calculation
2. **Use escrow messaging** - Tell customers their money is safe
3. **Auto-reminders** - Send payment reminders if fee not paid
4. **Quick refunds** - Process refunds fast to build trust
5. **Monitor escrow** - Track total amount held in escrow

---

## 📱 Frontend Integration

```javascript
// React example
const BookingFlow = () => {
  const [booking, setBooking] = useState(null);

  const createBooking = async (data) => {
    const response = await axios.post('/api/v1/bookings', data);
    setBooking(response.data.booking);

    // Show payment modal
    if (response.data.nextSteps.action === 'pay_booking_fee') {
      showPaymentModal(response.data.nextSteps.amount);
    }
  };

  const confirmFee = async (transactionId) => {
    await axios.post(
      `/api/v1/bookings/${booking._id}/booking-fee/confirm`,
      { transactionId }
    );

    alert('Fee paid! Matching you with a technician...');
  };

  return (
    <div>
      {/* Your booking form */}
      {booking && booking.bookingFee.status === 'pending' && (
        <PaymentButton
          amount={booking.bookingFee.amount}
          onSuccess={confirmFee}
        />
      )}
    </div>
  );
};
```

---

## 📈 Analytics

Track these metrics:

```javascript
// Total escrow balance
const escrowBalance = await Booking.aggregate([
  { $match: { 'bookingFee.status': 'held' } },
  { $group: { _id: null, total: { $sum: '$bookingFee.amount' } } }
]);

// Fee collection rate
const collectionRate = await Booking.aggregate([
  { $group: {
      _id: '$bookingFee.status',
      count: { $sum: 1 }
    }
  }
]);
```

---

## 🐛 Troubleshooting

**Problem:** Booking stuck in 'pending'
**Solution:** Customer hasn't paid booking fee yet

**Problem:** Fee not releasing after completion
**Solution:** Ensure booking status is 'verified', then manually release

**Problem:** Payment rejected
**Solution:** Check transaction amount matches booking fee exactly

---

## 📚 Full Documentation

For detailed documentation, see:
- `BOOKING_FEE_SYSTEM.md` - Complete guide
- `BOOKING_FEE_IMPLEMENTATION_SUMMARY.md` - Technical details
- `PRICING_SYSTEM_DOCUMENTATION.md` - Pricing integration

---

## ✅ You're Ready!

The booking fee system is fully integrated and ready to use. Start creating bookings and the 20% fee will be automatically calculated and enforced!

**Need Help?** Check the full documentation or contact support.
