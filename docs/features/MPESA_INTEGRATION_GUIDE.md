# M-Pesa STK Push Integration Guide

## 🎉 Complete M-Pesa Integration

This guide covers the complete M-Pesa STK Push (Lipa na M-Pesa Online) integration for booking fee payments.

---

## 📦 What's Included

### Backend
✅ **M-Pesa Service** (`/backend/src/services/mpesa.service.js`)
- OAuth token generation
- STK Push initiation
- Transaction status query
- Callback processing

✅ **M-Pesa Controller** (`/backend/src/controllers/mpesa.controller.js`)
- Initiate STK Push endpoint
- Callback handler
- Transaction status query
- Payment history

✅ **M-Pesa Routes** (`/backend/src/routes/mpesa.routes.js`)
- 4 REST API endpoints
- Proper validation and authorization

### Frontend
✅ **Updated Payment Modal** (`/frontend/src/components/bookings/BookingFeePaymentModal.tsx`)
- M-Pesa phone number input
- STK Push initiation
- Payment status polling
- Error handling

---

## 🚀 Setup Instructions

### Step 1: Register for M-Pesa Daraja API

1. **Go to Daraja Portal**
   - Sandbox: https://developer.safaricom.co.ke/
   - Production: Contact Safaricom

2. **Create an App**
   - Log in to Daraja Portal
   - Click "Create App"
   - Fill in app details
   - Select "Lipa na M-Pesa Online" API

3. **Get Credentials**
   - Consumer Key
   - Consumer Secret
   - Passkey (for STK Push)
   - Business Shortcode

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# M-Pesa Configuration
MPESA_ENVIRONMENT=sandbox  # 'sandbox' or 'production'
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_SHORTCODE=174379  # Sandbox shortcode or your production shortcode

# Callback URL (must be publicly accessible)
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/payments/mpesa/callback
```

#### Sandbox Credentials (For Testing)

```bash
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=<from Daraja portal>
MPESA_CONSUMER_SECRET=<from Daraja portal>
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
```

### Step 3: Set Up Callback URL

#### For Local Development (Using ngrok)

```bash
# Install ngrok
npm install -g ngrok

# Start your backend server
npm start

# In another terminal, start ngrok
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add to .env:
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/v1/payments/mpesa/callback
```

#### For Production

```bash
# Use your actual domain
MPESA_CALLBACK_URL=https://api.yourdomain.com/api/v1/payments/mpesa/callback
```

**Important**:
- Callback URL must be HTTPS in production
- Register this URL in Daraja Portal under your app settings

### Step 4: Start Backend Server

```bash
cd backend
npm install
npm start
```

Verify M-Pesa routes are loaded:
```
✓ M-Pesa routes registered: /api/v1/payments/mpesa
```

---

## 🎯 API Endpoints

### 1. Initiate STK Push

Sends payment prompt to customer's phone.

```http
POST /api/v1/payments/mpesa/stkpush
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumber": "254712345678",
  "bookingId": "booking_id_here",
  "amount": 500,
  "type": "booking_fee"
}
```

**Phone Number Format:**
- `254712345678` ✅
- `0712345678` ✅ (auto-converted to 254)
- `+254712345678` ✅ (auto-cleaned)
- `712345678` ❌ (invalid)

**Response:**

```json
{
  "success": true,
  "message": "STK Push sent successfully. Please enter your M-Pesa PIN on your phone.",
  "data": {
    "transactionId": "mongodb_transaction_id",
    "checkoutRequestId": "ws_CO_123456789",
    "customerMessage": "Success. Request accepted for processing"
  }
}
```

### 2. M-Pesa Callback (Automatic)

Called by Safaricom servers when payment is complete.

```http
POST /api/v1/payments/mpesa/callback
Content-Type: application/json

{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220191020363925",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 500 },
          { "Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV" },
          { "Name": "TransactionDate", "Value": 20191219102115 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

**What Happens:**
1. Safaricom calls this endpoint
2. Backend processes payment result
3. Updates transaction status
4. Updates booking fee status
5. Changes booking status to 'matching'

### 3. Query Transaction Status

Check payment status manually.

```http
GET /api/v1/payments/mpesa/status/:transactionId
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "transaction": {
    "id": "transaction_id",
    "status": "completed",
    "amount": 500,
    "currency": "KES",
    "paymentMethod": "mpesa",
    "mpesaReceiptNumber": "NLJ7RT61SV",
    "createdAt": "2025-01-27T10:00:00Z",
    "completedAt": "2025-01-27T10:02:15Z"
  }
}
```

**Status Values:**
- `initiated` - STK Push sent
- `pending` - Waiting for customer to enter PIN
- `completed` - Payment successful
- `failed` - Payment failed

### 4. Get Payment History

View all M-Pesa transactions.

```http
GET /api/v1/payments/mpesa/history?page=1&limit=10&status=completed
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "transactions": [...]
}
```

---

## 🔄 Complete Payment Flow

### Customer Journey

```
1. CUSTOMER CREATES BOOKING
   ↓
2. SYSTEM SHOWS BOOKING FEE (500 KES)
   ↓
3. CUSTOMER CLICKS "PAY WITH M-PESA"
   ↓
4. ENTERS PHONE NUMBER (254712345678)
   ↓
5. BACKEND SENDS STK PUSH
   POST /api/v1/payments/mpesa/stkpush
   ↓
6. CUSTOMER RECEIVES PROMPT ON PHONE
   "Enter M-Pesa PIN to pay 500 KES"
   ↓
7. CUSTOMER ENTERS PIN
   ↓
8. SAFARICOM PROCESSES PAYMENT
   ↓
9. SAFARICOM CALLS CALLBACK
   POST /api/v1/payments/mpesa/callback
   ↓
10. BACKEND UPDATES TRANSACTION
    Status: completed
    Booking Fee: held in escrow
    ↓
11. CUSTOMER SEES SUCCESS MESSAGE
    "Payment successful! Finding you a technician..."
    ↓
12. BOOKING STATUS CHANGES TO 'MATCHING'
```

### Technical Flow

```javascript
// 1. Frontend initiates payment
const response = await axios.post('/payments/mpesa/stkpush', {
  phoneNumber: '254712345678',
  bookingId: 'booking123',
  amount: 500,
  type: 'booking_fee'
});

// 2. Backend creates transaction
const transaction = await Transaction.create({
  type: 'booking_fee',
  amount: { gross: 500, net: 500, currency: 'KES' },
  payer: customerId,
  booking: bookingId,
  paymentMethod: 'mpesa',
  status: 'initiated'
});

// 3. Backend calls M-Pesa API
const stkResult = await mpesaService.initiateSTKPush({
  phoneNumber: '254712345678',
  amount: 500,
  accountReference: 'BKG-123',
  transactionDesc: 'Booking fee'
});

// 4. Save CheckoutRequestID
transaction.mpesaDetails = {
  checkoutRequestId: stkResult.checkoutRequestId,
  merchantRequestId: stkResult.merchantRequestId
};
transaction.status = 'pending';
await transaction.save();

// 5. Frontend polls for status
setInterval(async () => {
  const status = await axios.get(`/payments/mpesa/status/${transactionId}`);
  if (status.data.transaction.status === 'completed') {
    // Payment successful!
    onPaymentSuccess(transactionId);
  }
}, 2000);

// 6. M-Pesa calls callback (happens in background)
// POST /api/v1/payments/mpesa/callback
// Backend processes and updates transaction

// 7. Transaction status becomes 'completed'
transaction.status = 'completed';
transaction.mpesaDetails.mpesaReceiptNumber = 'NLJ7RT61SV';
await transaction.save();

// 8. Booking fee updated
booking.bookingFee.status = 'held';
booking.bookingFee.paidAt = new Date();
booking.status = 'matching';
await booking.save();
```

---

## 🧪 Testing

### Test Phone Numbers (Sandbox)

Safaricom provides test numbers for sandbox:

```
Success: 254708374149
Failed:  254711111111
```

### Test STK Push

```bash
# 1. Start backend
npm start

# 2. Start ngrok
ngrok http 5000

# 3. Update .env with ngrok URL
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/v1/payments/mpesa/callback

# 4. Make test request
curl -X POST http://localhost:5000/api/v1/payments/mpesa/stkpush \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254708374149",
    "bookingId": "BOOKING_ID",
    "amount": 10,
    "type": "booking_fee"
  }'

# 5. Check response
# Should see: "STK Push sent successfully"

# 6. Monitor ngrok console
# Watch for callback from M-Pesa

# 7. Check transaction status
curl http://localhost:5000/api/v1/payments/mpesa/status/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Scenarios

**1. Successful Payment**
```javascript
Phone: 254708374149
Amount: 10
Expected: ResultCode = 0, Status = completed
```

**2. Failed Payment (Insufficient funds)**
```javascript
Phone: 254711111111
Amount: 10
Expected: ResultCode = 1, Status = failed
```

**3. Cancelled by User**
```javascript
Phone: 254708374149
Amount: 10
Action: Click "Cancel" on phone prompt
Expected: ResultCode = 1032, Status = failed
```

**4. Timeout**
```javascript
Phone: 254708374149
Amount: 10
Action: Don't enter PIN within 60 seconds
Expected: ResultCode = timeout, Status = failed
```

---

## 🔒 Security Best Practices

### 1. Protect Credentials

```bash
# Never commit credentials
echo ".env" >> .gitignore

# Use environment variables
# Don't hardcode in code
```

### 2. Validate Callbacks

```javascript
// In mpesa.controller.js
if (!mpesaService.validateCallback(req.body)) {
  return res.status(400).json({
    ResultCode: 1,
    ResultDesc: 'Invalid callback'
  });
}
```

### 3. Verify Amounts

```javascript
// Ensure amount matches booking fee
if (amount !== booking.bookingFee.amount) {
  throw new Error('Amount mismatch');
}
```

### 4. Use HTTPS

```bash
# Production callback must be HTTPS
MPESA_CALLBACK_URL=https://api.yourdomain.com/...

# Not HTTP!
# MPESA_CALLBACK_URL=http://... ❌
```

### 5. Log Everything

```javascript
console.log('M-Pesa Callback:', JSON.stringify(req.body));
console.log('Transaction updated:', transaction._id);
```

---

## 🐛 Troubleshooting

### Issue: "Invalid Access Token"

**Cause**: Consumer Key/Secret incorrect
**Fix**: Check credentials in .env

```bash
# Verify credentials
curl -X GET "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
  -H "Authorization: Basic $(echo -n 'YOUR_KEY:YOUR_SECRET' | base64)"
```

### Issue: "Invalid Shortcode"

**Cause**: Wrong shortcode for environment
**Fix**:
- Sandbox: Use `174379`
- Production: Use your Paybill/Till number

### Issue: "Callback Not Received"

**Causes & Fixes**:

1. **URL not accessible**
   ```bash
   # Test callback URL
   curl https://your-callback-url/api/v1/payments/mpesa/callback
   # Should return 404 or 400, not timeout
   ```

2. **Ngrok session expired**
   ```bash
   # Restart ngrok
   ngrok http 5000
   # Update .env with new URL
   ```

3. **Firewall blocking**
   ```bash
   # Allow Safaricom IPs
   # Check your firewall settings
   ```

4. **Callback URL not registered**
   ```
   # Go to Daraja Portal
   # Update callback URL in app settings
   ```

### Issue: "STK Push Not Received on Phone"

**Causes & Fixes**:

1. **Wrong phone number format**
   ```javascript
   // Must be 254XXXXXXXXX
   // Use service to format: mpesaService.formatPhoneNumber()
   ```

2. **Phone not registered for M-Pesa**
   ```
   Solution: Register phone number with M-Pesa first
   ```

3. **Network issues**
   ```
   Solution: Try again or use different network
   ```

### Issue: "Payment Successful but Status Not Updated"

**Cause**: Callback processing failed
**Fix**:

```javascript
// Check transaction webhookData
const transaction = await Transaction.findById(id);
console.log('Webhook data:', transaction.webhookData);

// If no webhook data, M-Pesa didn't call callback
// Check ngrok/server logs
```

---

## 📊 Monitoring & Analytics

### Track M-Pesa Metrics

```javascript
// Success rate
const successRate = await Transaction.aggregate([
  { $match: { paymentMethod: 'mpesa' } },
  { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);

// Average transaction time
const avgTime = await Transaction.aggregate([
  { $match: {
      paymentMethod: 'mpesa',
      status: 'completed'
    }
  },
  { $project: {
      duration: {
        $subtract: ['$completedAt', '$createdAt']
      }
    }
  },
  { $group: {
      _id: null,
      avgDuration: { $avg: '$duration' }
    }
  }
]);

// Revenue by M-Pesa
const revenue = await Transaction.aggregate([
  { $match: {
      paymentMethod: 'mpesa',
      status: 'completed'
    }
  },
  { $group: {
      _id: null,
      total: { $sum: '$amount.gross' }
    }
  }
]);
```

---

## 🚀 Production Checklist

Before going live:

- [ ] Get production credentials from Safaricom
- [ ] Update .env with production keys
- [ ] Set MPESA_ENVIRONMENT=production
- [ ] Use your actual Paybill/Till number
- [ ] Ensure callback URL is HTTPS
- [ ] Register callback URL in Daraja Portal
- [ ] Test with real phone numbers
- [ ] Monitor callback success rate
- [ ] Set up error alerts
- [ ] Enable transaction logging
- [ ] Configure automatic reconciliation

---

## 📞 Support

### Safaricom Support
- Email: apisupport@safaricom.co.ke
- Portal: https://developer.safaricom.co.ke/support

### Documentation
- Daraja API Docs: https://developer.safaricom.co.ke/docs
- STK Push Guide: https://developer.safaricom.co.ke/lipa-na-m-pesa-online

---

## ✅ Summary

You now have:
- ✅ Complete M-Pesa STK Push integration
- ✅ Automatic callback handling
- ✅ Transaction status tracking
- ✅ Frontend payment modal
- ✅ Error handling
- ✅ Production-ready code

**Ready to accept M-Pesa payments!** 🎉

---

*Last Updated: January 2025*
*Version: 1.0*
*Environment: Node.js + Express + MongoDB + React + TypeScript*
