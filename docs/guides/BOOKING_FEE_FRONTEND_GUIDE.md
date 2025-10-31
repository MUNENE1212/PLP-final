# Booking Fee Frontend Integration Guide

## Overview

This guide explains how to integrate the booking fee system into your React/TypeScript frontend.

---

## Files Created

### 1. Services

#### `/src/services/bookingFee.service.ts`
API service for booking fee operations:
- `getBookingFeeStatus()` - Get fee status
- `confirmBookingFee()` - Confirm payment
- `releaseBookingFee()` - Release to technician (Admin)
- `refundBookingFee()` - Refund to customer (Admin)

#### `/src/services/pricing.service.ts`
API service for pricing operations:
- `getPriceEstimate()` - Get price estimate
- `getServiceCatalog()` - Get service catalog
- `calculatePrice()` - Calculate exact price
- `comparePrices()` - Compare technician prices

### 2. Components

#### `/src/components/bookings/BookingFeeCard.tsx`
Displays booking fee status with:
- Status indicator (pending/held/released/refunded)
- Amount breakdown
- Payment button
- Security features
- Timestamps

#### `/src/components/bookings/PriceEstimate.tsx`
Shows detailed price breakdown:
- Base price
- Distance fees
- Multipliers
- Booking fee (20%)
- Remaining balance

#### `/src/components/bookings/BookingFeePaymentModal.tsx`
Payment modal supporting:
- M-Pesa payment
- Card payment
- Wallet payment
- Payment validation
- Security information

---

## Integration Steps

### Step 1: Update CreateBooking Page

Add price estimation and booking fee display:

```typescript
import { useState, useEffect } from 'react';
import { getPriceEstimate } from '@/services/pricing.service';
import PriceEstimate from '@/components/bookings/PriceEstimate';
import BookingFeePaymentModal from '@/components/bookings/BookingFeePaymentModal';
import { confirmBookingFee } from '@/services/bookingFee.service';

const CreateBooking = () => {
  const [pricing, setPricing] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);

  // Get price estimate when form changes
  useEffect(() => {
    if (formData.serviceCategory && formData.serviceType && formData.serviceLocation) {
      fetchPriceEstimate();
    }
  }, [formData.serviceCategory, formData.serviceType, formData.urgency]);

  const fetchPriceEstimate = async () => {
    try {
      const response = await getPriceEstimate({
        serviceCategory: formData.serviceCategory,
        serviceType: formData.serviceType,
        urgency: formData.urgency || 'medium',
        serviceLocation: {
          type: 'Point',
          coordinates: formData.serviceLocation.coordinates,
        },
        scheduledDateTime: formData.scheduledDate,
      });

      setPricing(response.estimate);
    } catch (error) {
      console.error('Error fetching price estimate:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create booking
      const result = await dispatch(createBooking(formData)).unwrap();

      // Save booking ID
      setCreatedBookingId(result.booking._id);

      // Show payment modal if booking fee is pending
      if (result.booking.bookingFee.status === 'pending') {
        setShowPaymentModal(true);
      } else {
        navigate(`/bookings/${result.booking._id}`);
      }
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const handlePaymentSuccess = async (transactionId) => {
    try {
      await confirmBookingFee(createdBookingId, { transactionId });
      toast.success('Booking fee paid! Finding you a technician...');
      navigate(`/bookings/${createdBookingId}`);
    } catch (error) {
      toast.error('Failed to confirm booking fee');
    }
  };

  return (
    <div>
      {/* Booking Form */}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}

        {/* Price Estimate */}
        {pricing && (
          <PriceEstimate
            pricing={pricing}
            isEstimate={true}
          />
        )}

        <Button type="submit">
          Create Booking
        </Button>
      </form>

      {/* Payment Modal */}
      {showPaymentModal && createdBookingId && pricing && (
        <BookingFeePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={pricing.bookingFee}
          currency={pricing.currency}
          bookingId={createdBookingId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
```

### Step 2: Update BookingDetail Page

Display booking fee status:

```typescript
import { useState, useEffect } from 'react';
import { getBookingFeeStatus } from '@/services/bookingFee.service';
import BookingFeeCard from '@/components/bookings/BookingFeeCard';
import BookingFeePaymentModal from '@/components/bookings/BookingFeePaymentModal';

const BookingDetail = ({ bookingId }) => {
  const [feeStatus, setFeeStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchFeeStatus();
  }, [bookingId]);

  const fetchFeeStatus = async () => {
    try {
      const response = await getBookingFeeStatus(bookingId);
      setFeeStatus(response);
    } catch (error) {
      console.error('Error fetching fee status:', error);
    }
  };

  const handlePaymentSuccess = async (transactionId) => {
    try {
      await confirmBookingFee(bookingId, { transactionId });
      toast.success('Booking fee confirmed!');
      fetchFeeStatus(); // Refresh status
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  if (!feeStatus) return <div>Loading...</div>;

  return (
    <div>
      {/* Booking details */}

      {/* Booking Fee Card */}
      <BookingFeeCard
        bookingFee={feeStatus.bookingFee}
        totalAmount={feeStatus.totalAmount}
        remainingAmount={feeStatus.remainingAmount}
        currency="KES"
        showPayButton={feeStatus.bookingFee.status === 'pending'}
        onPayClick={() => setShowPaymentModal(true)}
      />

      {/* Payment Modal */}
      <BookingFeePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={feeStatus.bookingFee.amount}
        currency="KES"
        bookingId={bookingId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
```

### Step 3: Update Booking List

Show payment status in booking cards:

```typescript
import { BookingFeeStatus } from '@/services/bookingFee.service';

const BookingCard = ({ booking }) => {
  const getFeeStatusBadge = (status) => {
    const configs = {
      pending: { label: 'Payment Required', color: 'bg-yellow-100 text-yellow-800' },
      held: { label: 'Fee Paid', color: 'bg-blue-100 text-blue-800' },
      released: { label: 'Fee Released', color: 'bg-green-100 text-green-800' },
      refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
    };

    const config = configs[status] || configs.pending;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3>{booking.serviceType}</h3>
        {getFeeStatusBadge(booking.bookingFee?.status)}
      </div>

      {booking.bookingFee?.status === 'pending' && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Pay {booking.bookingFee.amount} KES to proceed
        </div>
      )}
    </div>
  );
};
```

---

## Payment Integration

### M-Pesa Integration

Update `BookingFeePaymentModal.tsx` to integrate with M-Pesa STK Push:

```typescript
const initiateMpesaPayment = async (phoneNumber, amount) => {
  try {
    // Call your M-Pesa STK Push API
    const response = await axiosInstance.post('/payments/mpesa/stkpush', {
      phoneNumber,
      amount,
      bookingId,
      type: 'booking_fee',
    });

    // Poll for payment status
    const transactionId = response.data.transactionId;
    await pollPaymentStatus(transactionId);

    return transactionId;
  } catch (error) {
    throw new Error('M-Pesa payment failed');
  }
};

const pollPaymentStatus = async (transactionId) => {
  // Poll every 2 seconds for up to 60 seconds
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const status = await axiosInstance.get(`/payments/status/${transactionId}`);

    if (status.data.status === 'completed') {
      return true;
    } else if (status.data.status === 'failed') {
      throw new Error('Payment failed');
    }
  }

  throw new Error('Payment timeout');
};
```

### Card Payment Integration

For Stripe or Flutterwave:

```typescript
const initiateCardPayment = async (cardDetails, amount) => {
  try {
    // Use Stripe Elements or Flutterwave inline
    const response = await axiosInstance.post('/payments/card/charge', {
      cardNumber: cardDetails.number,
      expiry: cardDetails.expiry,
      cvc: cardDetails.cvc,
      amount,
      bookingId,
      type: 'booking_fee',
    });

    return response.data.transactionId;
  } catch (error) {
    throw new Error('Card payment failed');
  }
};
```

---

## State Management (Optional)

If using Redux, add booking fee actions:

```typescript
// slices/bookingFeeSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bookingFeeService from '@/services/bookingFee.service';

export const fetchBookingFeeStatus = createAsyncThunk(
  'bookingFee/fetchStatus',
  async (bookingId: string) => {
    return await bookingFeeService.getBookingFeeStatus(bookingId);
  }
);

export const confirmFeePayment = createAsyncThunk(
  'bookingFee/confirm',
  async ({ bookingId, transactionId }: { bookingId: string; transactionId: string }) => {
    return await bookingFeeService.confirmBookingFee(bookingId, { transactionId });
  }
);

const bookingFeeSlice = createSlice({
  name: 'bookingFee',
  initialState: {
    status: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingFeeStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookingFeeStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(fetchBookingFeeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default bookingFeeSlice.reducer;
```

---

## Testing

### Test Scenarios

1. **Create Booking Flow**
   - Fill booking form
   - See price estimate
   - Submit booking
   - Payment modal appears
   - Complete payment
   - Redirected to booking details

2. **View Fee Status**
   - Open booking details
   - See fee status card
   - Check timestamps
   - View breakdown

3. **Payment Methods**
   - Test M-Pesa payment
   - Test card payment
   - Test wallet payment
   - Handle payment failures

---

## Styling

The components use Tailwind CSS. Key classes:

```css
/* Status colors */
.status-pending: bg-yellow-50 border-yellow-200 text-yellow-600
.status-held: bg-blue-50 border-blue-200 text-blue-600
.status-released: bg-green-50 border-green-200 text-green-600
.status-refunded: bg-gray-50 border-gray-200 text-gray-600

/* Price displays */
.price-amount: text-2xl font-bold text-green-600
.fee-amount: text-xl font-semibold text-blue-600
```

---

## Error Handling

Handle common errors:

```typescript
try {
  await confirmBookingFee(bookingId, { transactionId });
} catch (error: any) {
  if (error.response?.status === 400) {
    toast.error('Transaction amount mismatch');
  } else if (error.response?.status === 404) {
    toast.error('Booking not found');
  } else {
    toast.error('Payment confirmation failed');
  }
}
```

---

## Next Steps

1. ✅ Services created
2. ✅ Components created
3. ⏳ Integrate into CreateBooking page
4. ⏳ Integrate into BookingDetail page
5. ⏳ Add payment gateway integration
6. ⏳ Test all payment flows
7. ⏳ Add analytics tracking

---

## Quick Reference

### Import Statements

```typescript
// Services
import { getBookingFeeStatus, confirmBookingFee } from '@/services/bookingFee.service';
import { getPriceEstimate } from '@/services/pricing.service';

// Components
import BookingFeeCard from '@/components/bookings/BookingFeeCard';
import PriceEstimate from '@/components/bookings/PriceEstimate';
import BookingFeePaymentModal from '@/components/bookings/BookingFeePaymentModal';
```

### Key Props

```typescript
// BookingFeeCard
<BookingFeeCard
  bookingFee={feeStatus.bookingFee}
  totalAmount={feeStatus.totalAmount}
  remainingAmount={feeStatus.remainingAmount}
  currency="KES"
  showPayButton={true}
  onPayClick={() => setShowPaymentModal(true)}
/>

// PriceEstimate
<PriceEstimate
  pricing={pricingBreakdown}
  isEstimate={true}
/>

// BookingFeePaymentModal
<BookingFeePaymentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  amount={500}
  currency="KES"
  bookingId="booking_id"
  onPaymentSuccess={(txnId) => handleSuccess(txnId)}
/>
```

---

**Ready to integrate!** Use these components in your booking flow for a complete booking fee system.
