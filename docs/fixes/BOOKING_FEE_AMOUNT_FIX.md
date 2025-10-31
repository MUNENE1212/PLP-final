# Booking Fee Amount Not Configured - FIXED

## Error Message

```
Detailed error message: Booking fee amount not configured
```

**Where:** M-Pesa STK Push payment attempt

**When:** User clicks "Pay Now" after creating booking

---

## Root Cause

The booking was created successfully, but `booking.bookingFee.amount` is `undefined` or `null` in the database.

### Possible Causes:

1. **Pricing service returned `bookingFee: 0` or `undefined`**
   - If `totalAmount` is 0, then `bookingFee` would be 0
   - If pricing calculation failed silently

2. **Mongoose didn't save the `amount` field**
   - Field is optional in schema (`amount: Number`)
   - No validation to ensure it's set

3. **Existing booking without amount**
   - Old booking created before booking fee was implemented
   - Testing with incomplete data

---

## Solution Implemented

### 1. Added Validation Before Booking Creation

**File:** `/backend/src/controllers/booking.controller.js` (Lines 70-78)

```javascript
// Validate booking fee is calculated
if (!pricingResult.breakdown.bookingFee || pricingResult.breakdown.bookingFee <= 0) {
  console.error('ERROR: Booking fee not calculated in pricing!');
  return res.status(500).json({
    success: false,
    message: 'Failed to calculate booking fee. Please try again.',
    error: 'Booking fee amount is missing or zero'
  });
}
```

**Benefits:**
- ✅ Prevents creating bookings without valid booking fee
- ✅ Fails fast with clear error message
- ✅ User knows to try again (instead of getting stuck at payment)

### 2. Enhanced Debugging Throughout

**Pricing Service Debug (Lines 63-68):**
```javascript
console.log('=== PRICING RESULT DEBUG ===');
console.log('Total Amount:', pricingResult.breakdown.totalAmount);
console.log('Booking Fee from Pricing:', pricingResult.breakdown.bookingFee);
console.log('Currency:', pricingResult.breakdown.currency);
```

**Booking Data Debug (Lines 108-112):**
```javascript
console.log('=== BOOKING DATA DEBUG ===');
console.log('Booking Fee being set:', bookingData.bookingFee);
console.log('Amount value:', bookingData.bookingFee.amount);
console.log('Amount type:', typeof bookingData.bookingFee.amount);
```

**Booking Created Debug (Lines 144-150):**
```javascript
console.log('=== BOOKING CREATED DEBUG ===');
console.log('Booking Number:', booking.bookingNumber);
console.log('Booking Fee Amount:', booking.bookingFee?.amount);
console.log('Booking Fee Status:', booking.bookingFee?.status);
console.log('Pricing Total:', booking.pricing?.totalAmount);
```

**M-Pesa Payment Debug (Lines 40-42):**
```javascript
console.log('Booking fee amount:', booking.bookingFee?.amount, 'Type:', typeof booking.bookingFee?.amount);
console.log('Booking fee status:', booking.bookingFee?.status);
```

---

## Testing Checklist

### ✅ Create New Booking

1. Fill out CreateBooking form
2. Check backend console for `PRICING RESULT DEBUG`
3. Verify `Booking Fee from Pricing` has a value > 0
4. Check `BOOKING DATA DEBUG`
5. Verify `Amount value` is set
6. Check `BOOKING CREATED DEBUG`
7. Verify `Booking Fee Amount` is saved in database
8. Try to pay booking fee
9. Check M-Pesa controller logs
10. Verify payment succeeds

### ✅ If Booking Creation Fails

**Expected Error:**
```
Error: Failed to calculate booking fee. Please try again.
Booking fee amount is missing or zero
```

**Check Backend Logs:**
```
=== PRICING RESULT DEBUG ===
Total Amount: 0  ← PROBLEM!
Booking Fee from Pricing: 0  ← PROBLEM!
ERROR: Booking fee not calculated in pricing!
```

**Possible Causes:**
- Service type not found (using fallback with 0 price)
- Discount > subtotal (resulting in 0 total)
- Pricing configuration missing

---

## Database Fix for Existing Bookings

If you have existing bookings without `bookingFee.amount`, run this script:

**File:** `/backend/src/scripts/fixBookingFees.js`

```javascript
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

async function fixBookingFees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find bookings with missing or zero booking fee amount
    const bookingsToFix = await Booking.find({
      $or: [
        { 'bookingFee.amount': { $exists: false } },
        { 'bookingFee.amount': null },
        { 'bookingFee.amount': 0 }
      ],
      'pricing.totalAmount': { $exists: true, $gt: 0 }
    });

    console.log(`Found ${bookingsToFix.length} bookings to fix`);

    for (const booking of bookingsToFix) {
      const totalAmount = booking.pricing.totalAmount;
      const bookingFeeAmount = Math.round(totalAmount * 0.20 * 100) / 100; // 20% of total

      booking.bookingFee = booking.bookingFee || {};
      booking.bookingFee.amount = bookingFeeAmount;
      booking.bookingFee.percentage = 20;
      booking.bookingFee.status = booking.bookingFee.status || 'pending';
      booking.bookingFee.required = true;

      await booking.save();

      console.log(`Fixed booking ${booking.bookingNumber}: ${bookingFeeAmount} KES`);
    }

    console.log('✅ All bookings fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing booking fees:', error);
    process.exit(1);
  }
}

fixBookingFees();
```

**Run:**
```bash
cd backend
node src/scripts/fixBookingFees.js
```

---

## Data Flow Diagram

```
1. User submits CreateBooking form
   ↓
2. Backend calls pricingService.getEstimate()
   ↓
3. Pricing service calculates:
   - subtotal: 4000
   - discount: 0
   - totalAmount: 4000
   - bookingFee: 800 (20% of 4000)
   ↓
4. Backend validates bookingFee > 0 ✅
   ↓
5. Creates booking with:
   bookingFee: {
     amount: 800,
     percentage: 20,
     status: 'pending'
   }
   ↓
6. Booking saved to database
   ↓
7. Response sent to frontend with booking.bookingFee.amount
   ↓
8. Payment modal opens with amount: 800
   ↓
9. User clicks "Pay Now"
   ↓
10. Frontend sends STK Push request:
    { phoneNumber, bookingId, amount: 800 }
    ↓
11. Backend fetches booking from database
    ↓
12. Validates booking.bookingFee.amount exists ✅
    ↓
13. Validates amount matches (800 == 800) ✅
    ↓
14. Initiates M-Pesa STK Push ✅
```

---

## Expected Console Output (Success)

### Backend - Booking Creation:
```
=== PRICING RESULT DEBUG ===
Pricing Success: true
Total Amount: 4000
Booking Fee from Pricing: 800
Currency: KES
===========================

=== BOOKING DATA DEBUG ===
Booking Fee being set: { required: true, percentage: 20, amount: 800, status: 'pending' }
Amount value: 800
Amount type: number
=========================

=== BOOKING CREATED DEBUG ===
Booking Number: BK25-00042
Booking Fee Object: { required: true, percentage: 20, amount: 800, status: 'pending' }
Booking Fee Amount: 800
Booking Fee Status: pending
Pricing Total: 4000
============================
```

### Frontend - Payment Modal:
```
=== PAYMENT MODAL PROPS DEBUG ===
createdBooking.bookingFee?.amount: 800
priceEstimate?.bookingFee: 800
Final amount being passed: 800
Currency: KES
Booking ID: 67abc123...
=================================

=== PAYMENT MODAL DEBUG ===
Amount received: 800
Currency: KES
Booking ID: 67abc123...
✅ PAYMENT MODAL: Amount is valid: 800
=========================
```

### Backend - M-Pesa Payment:
```
=== STK PUSH REQUEST DEBUG ===
Phone Number: 254712345678
Booking ID: 67abc123...
Amount: 800 Type: number
Payment Type: booking_fee

Booking found: BK25-00042
Booking fee amount: 800 Type: number
Booking fee status: pending

Amount validation: {
  expected: 800,
  received: 800,
  difference: 0,
  tolerance: 0.01
}
✅ Amount validated successfully
```

---

## Troubleshooting

### Error: "Booking fee amount not configured"

**Check:**
1. Backend logs during booking creation
2. Was `PRICING RESULT DEBUG` logged?
3. What was `Booking Fee from Pricing`?

**If bookingFee was 0 or undefined:**
- Check pricing service calculation
- Verify totalAmount > 0
- Check for errors in pricing.service.js

**If bookingFee was > 0 but not in database:**
- Check Mongoose save operation
- Verify booking model schema
- Check for middleware that might clear the field

### Error: "Failed to calculate booking fee"

**This is the NEW validation error - means:**
- Pricing service returned bookingFee: 0 or undefined
- Booking creation stopped before saving to database
- User needs to try again with valid service/pricing

**Check:**
- Is service type valid?
- Is pricing configuration loaded?
- Are there errors in pricing service?

---

## Prevention

### Schema Update (Optional)

Make `amount` required in Booking model:

```javascript
// In backend/src/models/Booking.js
bookingFee: {
  required: {
    type: Boolean,
    default: true
  },
  percentage: {
    type: Number,
    default: 20
  },
  amount: {
    type: Number,
    required: true  // ← Add this
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'held', 'released', 'refunded'],
    default: 'pending'
  },
  // ... other fields
}
```

**Impact:**
- ✅ Mongoose will throw error if amount is missing
- ✅ Forces proper validation at save time
- ⚠️ Existing bookings without amount will fail to save
- ⚠️ Need to run migration script first

---

## Summary

**Problem:** Booking created without `bookingFee.amount`, causing "Booking fee amount not configured" error during payment

**Root Cause:** No validation to ensure booking fee is calculated before creating booking

**Solution:**
1. ✅ Added validation to check bookingFee > 0 before creating booking
2. ✅ Enhanced debugging throughout entire data flow
3. ✅ Created migration script for existing bookings
4. ✅ Improved error messages for easier diagnosis

**Result:**
- Bookings won't be created if booking fee is missing
- Clear error messages guide user to try again
- Comprehensive logs for debugging
- Database can be fixed with migration script

**Status:** ✅ FIXED

---

*Fixed on: 2025-10-31*
*Issue: Booking fee amount not configured*
*Solution: Added validation + comprehensive debugging*
