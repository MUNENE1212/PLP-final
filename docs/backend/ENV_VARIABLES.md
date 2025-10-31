# Environment Variables Documentation

This document provides a comprehensive guide to all environment variables used in the BaiTech Backend API.

## Table of Contents

- [Quick Setup](#quick-setup)
- [Server Configuration](#server-configuration)
- [Database](#database)
- [Authentication & Security](#authentication--security)
- [Email Services](#email-services)
- [SMS Services](#sms-services)
- [Payment Gateways](#payment-gateways)
- [Push Notifications](#push-notifications)
- [File Storage](#file-storage)
- [Third-Party Services](#third-party-services)
- [Monitoring & Logging](#monitoring--logging)
- [Feature Flags](#feature-flags)
- [Client URLs](#client-urls)
- [Environment-Specific Variables](#environment-specific-variables)

---

## Quick Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Then edit `.env` with your values.

---

## Server Configuration

### NODE_ENV
- **Description**: Application environment
- **Type**: String
- **Options**: `development`, `production`, `test`
- **Default**: `development`
- **Required**: Yes
- **Example**: `NODE_ENV=production`

```bash
# Development - enables debugging, detailed errors
NODE_ENV=development

# Production - optimized performance, minimal errors
NODE_ENV=production

# Test - for running automated tests
NODE_ENV=test
```

### PORT
- **Description**: Server port number
- **Type**: Number
- **Default**: `5000`
- **Required**: No
- **Example**: `PORT=5000`

### API_VERSION
- **Description**: API version prefix
- **Type**: String
- **Default**: `v1`
- **Required**: No
- **Example**: `API_VERSION=v1`

---

## Database

### MONGODB_URI
- **Description**: MongoDB connection string
- **Type**: String (Connection URI)
- **Required**: Yes
- **Example**:
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/baitech

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baitech?retryWrites=true&w=majority

# With authentication
MONGODB_URI=mongodb://admin:password@localhost:27017/baitech?authSource=admin
```

**Notes:**
- Use MongoDB Atlas for production
- Ensure proper IP whitelisting
- Use strong passwords
- Enable TLS/SSL in production

---

## Authentication & Security

### JWT_SECRET
- **Description**: Secret key for signing JWT access tokens
- **Type**: String (64+ characters recommended)
- **Required**: Yes
- **Security**: High - Keep this secret!
- **Example**:
```bash
# Generate with:
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

### JWT_REFRESH_SECRET
- **Description**: Secret key for signing refresh tokens
- **Type**: String (64+ characters recommended)
- **Required**: Yes
- **Security**: High - Keep this secret!
- **Example**: Similar to JWT_SECRET but different value

### JWT_EXPIRE
- **Description**: Access token expiration time
- **Type**: String (time format)
- **Default**: `15m`
- **Recommended**: `15m` to `1h`
- **Example**: `JWT_EXPIRE=15m`
- **Formats**: `15m`, `1h`, `7d`, `1y`

### JWT_REFRESH_EXPIRE
- **Description**: Refresh token expiration time
- **Type**: String (time format)
- **Default**: `7d`
- **Recommended**: `7d` to `30d`
- **Example**: `JWT_REFRESH_EXPIRE=7d`

### BCRYPT_ROUNDS
- **Description**: Number of bcrypt hashing rounds
- **Type**: Number
- **Default**: `12`
- **Recommended**: `10-12` (10 = fast, 12 = secure)
- **Example**: `BCRYPT_ROUNDS=12`

### SESSION_SECRET
- **Description**: Secret for Express sessions
- **Type**: String
- **Required**: If using sessions
- **Example**: `SESSION_SECRET=your-session-secret`

---

## Email Services

### SMTP_HOST
- **Description**: SMTP server hostname
- **Type**: String
- **Required**: Yes (for email features)
- **Examples**:
```bash
# Gmail
SMTP_HOST=smtp.gmail.com

# SendGrid
SMTP_HOST=smtp.sendgrid.net

# Mailgun
SMTP_HOST=smtp.mailgun.org

# AWS SES
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
```

### SMTP_PORT
- **Description**: SMTP server port
- **Type**: Number
- **Common Ports**: `25`, `465`, `587`, `2525`
- **Recommended**: `587` (TLS) or `465` (SSL)
- **Example**: `SMTP_PORT=587`

### SMTP_USER
- **Description**: SMTP authentication username
- **Type**: String
- **Example**:
```bash
# Gmail
SMTP_USER=your-email@gmail.com

# SendGrid
SMTP_USER=apikey

# Others
SMTP_USER=your-smtp-username
```

### SMTP_PASS
- **Description**: SMTP authentication password
- **Type**: String
- **Security**: High - Use app-specific passwords
- **Example**:
```bash
# Gmail - Use App Password (not regular password)
SMTP_PASS=your-16-char-app-password

# SendGrid
SMTP_PASS=your-sendgrid-api-key

# Others
SMTP_PASS=your-smtp-password
```

### EMAIL_FROM
- **Description**: Default sender email address
- **Type**: String (Email)
- **Example**: `EMAIL_FROM=noreply@baitech.com`

### EMAIL_FROM_NAME
- **Description**: Default sender name
- **Type**: String
- **Example**: `EMAIL_FROM_NAME=BaiTech`

---

## SMS Services

### AT_USERNAME
- **Description**: Africa's Talking username
- **Type**: String
- **Required**: If using SMS features
- **Example**: `AT_USERNAME=sandbox` or `AT_USERNAME=your-username`
- **Get it from**: https://account.africastalking.com

### AT_API_KEY
- **Description**: Africa's Talking API key
- **Type**: String
- **Required**: If using SMS features
- **Security**: High - Keep secret
- **Example**: `AT_API_KEY=your-api-key-here`

### AT_SENDER_ID
- **Description**: SMS sender ID (brand name)
- **Type**: String (11 characters max)
- **Default**: `BAITECH`
- **Example**: `AT_SENDER_ID=BAITECH`
- **Note**: Requires approval from Africa's Talking

### TWILIO_ACCOUNT_SID
- **Description**: Twilio account SID (alternative SMS provider)
- **Type**: String
- **Required**: If using Twilio
- **Example**: `TWILIO_ACCOUNT_SID=ACxxxxxxxxxx`

### TWILIO_AUTH_TOKEN
- **Description**: Twilio auth token
- **Type**: String
- **Security**: High
- **Example**: `TWILIO_AUTH_TOKEN=your-auth-token`

### TWILIO_PHONE_NUMBER
- **Description**: Twilio phone number for sending SMS
- **Type**: String (Phone number)
- **Example**: `TWILIO_PHONE_NUMBER=+1234567890`

---

## Payment Gateways

### M-Pesa (Daraja API)

#### MPESA_CONSUMER_KEY
- **Description**: M-Pesa API consumer key
- **Type**: String
- **Environment**: Sandbox or Production
- **Get from**: https://developer.safaricom.co.ke
- **Example**: `MPESA_CONSUMER_KEY=your-consumer-key`

#### MPESA_CONSUMER_SECRET
- **Description**: M-Pesa API consumer secret
- **Type**: String
- **Security**: High
- **Example**: `MPESA_CONSUMER_SECRET=your-consumer-secret`

#### MPESA_PASSKEY
- **Description**: Lipa Na M-Pesa Online Passkey
- **Type**: String
- **Example**: `MPESA_PASSKEY=your-passkey`

#### MPESA_SHORTCODE
- **Description**: Business shortcode
- **Type**: Number
- **Sandbox**: `174379`
- **Example**: `MPESA_SHORTCODE=174379`

#### MPESA_ENVIRONMENT
- **Description**: M-Pesa environment
- **Options**: `sandbox`, `production`
- **Example**: `MPESA_ENVIRONMENT=sandbox`

#### MPESA_CALLBACK_URL
- **Description**: Callback URL for M-Pesa responses
- **Type**: String (URL)
- **Must be**: Publicly accessible HTTPS URL
- **Example**: `MPESA_CALLBACK_URL=https://api.baitech.com/api/v1/payments/mpesa/callback`

### Stripe

#### STRIPE_SECRET_KEY
- **Description**: Stripe secret API key
- **Type**: String
- **Security**: High - Server-side only
- **Formats**:
```bash
# Test mode
STRIPE_SECRET_KEY=sk_test_xxxxxxxx

# Live mode
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
```

#### STRIPE_PUBLISHABLE_KEY
- **Description**: Stripe publishable key
- **Type**: String
- **Security**: Medium - Can be public
- **Example**: `STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx`

#### STRIPE_WEBHOOK_SECRET
- **Description**: Stripe webhook signing secret
- **Type**: String
- **Used for**: Verifying webhook authenticity
- **Example**: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx`

---

## Push Notifications

### Firebase Configuration

#### FIREBASE_PROJECT_ID
- **Description**: Firebase project ID
- **Type**: String
- **Example**: `FIREBASE_PROJECT_ID=baitech-app`

#### FIREBASE_PRIVATE_KEY
- **Description**: Firebase private key
- **Type**: String (Multiline)
- **Security**: High
- **Format**: Must escape newlines
- **Example**:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

#### FIREBASE_CLIENT_EMAIL
- **Description**: Firebase client email
- **Type**: String (Email)
- **Example**: `FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com`

#### FIREBASE_SERVICE_ACCOUNT
- **Description**: Path to Firebase service account JSON file
- **Type**: String (File path)
- **Alternative to**: Individual Firebase env vars
- **Example**: `FIREBASE_SERVICE_ACCOUNT=./config/firebase-service-account.json`

---

## File Storage

### Cloudinary Configuration

#### CLOUDINARY_CLOUD_NAME
- **Description**: Cloudinary cloud name
- **Type**: String
- **Example**: `CLOUDINARY_CLOUD_NAME=your-cloud-name`
- **Get from**: https://cloudinary.com/console

#### CLOUDINARY_API_KEY
- **Description**: Cloudinary API key
- **Type**: String
- **Example**: `CLOUDINARY_API_KEY=123456789012345`

#### CLOUDINARY_API_SECRET
- **Description**: Cloudinary API secret
- **Type**: String
- **Security**: High
- **Example**: `CLOUDINARY_API_SECRET=your-api-secret`

---

## Third-Party Services

### Google Maps API

#### GOOGLE_MAPS_API_KEY
- **Description**: Google Maps API key for geocoding
- **Type**: String
- **Used for**: Location services, distance calculation
- **Example**: `GOOGLE_MAPS_API_KEY=AIza...`
- **Get from**: https://console.cloud.google.com

### Agora (Video Calling)

#### AGORA_APP_ID
- **Description**: Agora application ID
- **Type**: String
- **Example**: `AGORA_APP_ID=your-app-id`

#### AGORA_APP_CERTIFICATE
- **Description**: Agora app certificate
- **Type**: String
- **Example**: `AGORA_APP_CERTIFICATE=your-certificate`

---

## Monitoring & Logging

### Sentry (Error Tracking)

#### SENTRY_DSN
- **Description**: Sentry Data Source Name
- **Type**: String (URL)
- **Example**: `SENTRY_DSN=https://xxx@sentry.io/xxx`
- **Get from**: https://sentry.io

### New Relic (APM)

#### NEW_RELIC_LICENSE_KEY
- **Description**: New Relic license key
- **Type**: String
- **Example**: `NEW_RELIC_LICENSE_KEY=your-license-key`

#### NEW_RELIC_APP_NAME
- **Description**: Application name in New Relic
- **Type**: String
- **Example**: `NEW_RELIC_APP_NAME=BaiTech-Backend-Production`

### Logging

#### LOG_LEVEL
- **Description**: Logging level
- **Options**: `error`, `warn`, `info`, `debug`, `verbose`
- **Default**: `info`
- **Example**: `LOG_LEVEL=info`

#### LOG_FILE
- **Description**: Path to log file
- **Type**: String (File path)
- **Default**: `./logs/app.log`
- **Example**: `LOG_FILE=./logs/app.log`

---

## Feature Flags

### ENABLE_2FA
- **Description**: Enable two-factor authentication
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_2FA=true`

### ENABLE_EMAIL_VERIFICATION
- **Description**: Require email verification
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_EMAIL_VERIFICATION=true`

### ENABLE_PHONE_VERIFICATION
- **Description**: Require phone verification
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_PHONE_VERIFICATION=true`

### ENABLE_AI_MODERATION
- **Description**: Enable AI content moderation
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_AI_MODERATION=true`

### ENABLE_API_DOCS
- **Description**: Enable Swagger API documentation
- **Type**: Boolean
- **Default**: `true`
- **Recommended**: `true` for dev, `false` for production
- **Example**: `ENABLE_API_DOCS=true`

### MAINTENANCE_MODE
- **Description**: Put API in maintenance mode
- **Type**: Boolean
- **Default**: `false`
- **Example**: `MAINTENANCE_MODE=false`

---

## Client URLs

### CLIENT_WEB_URL
- **Description**: Frontend web application URL
- **Type**: String (URL)
- **Used for**: CORS, email links, redirects
- **Example**:
```bash
# Development
CLIENT_WEB_URL=http://localhost:3000

# Production
CLIENT_WEB_URL=https://baitech.com
```

### CLIENT_MOBILE_URL
- **Description**: Mobile app deep link scheme
- **Type**: String (URL scheme)
- **Used for**: Deep links, redirects
- **Example**: `CLIENT_MOBILE_URL=baitech://`

---

## Environment-Specific Variables

### Development (.env.development)

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/baitech-dev
JWT_SECRET=dev-secret-key
ENABLE_API_DOCS=true
LOG_LEVEL=debug
```

### Testing (.env.test)

```bash
NODE_ENV=test
PORT=5001
MONGODB_URI=mongodb://localhost:27017/baitech-test
JWT_SECRET=test-secret-key
ENABLE_API_DOCS=false
LOG_LEVEL=error
```

### Production (.env.production)

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://prod@cluster.mongodb.net/baitech
JWT_SECRET=super-strong-production-secret
ENABLE_API_DOCS=false
LOG_LEVEL=info
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Rate Limiting

### RATE_LIMIT_WINDOW_MS
- **Description**: Rate limit time window in milliseconds
- **Type**: Number
- **Default**: `900000` (15 minutes)
- **Example**: `RATE_LIMIT_WINDOW_MS=900000`

### RATE_LIMIT_MAX_REQUESTS
- **Description**: Maximum requests per window
- **Type**: Number
- **Default**: `100`
- **Example**: `RATE_LIMIT_MAX_REQUESTS=100`

---

## File Upload

### MAX_FILE_SIZE
- **Description**: Maximum file size in bytes
- **Type**: Number
- **Default**: `10485760` (10MB)
- **Example**: `MAX_FILE_SIZE=10485760`

### MAX_FILES_PER_UPLOAD
- **Description**: Maximum files per upload
- **Type**: Number
- **Default**: `5`
- **Example**: `MAX_FILES_PER_UPLOAD=5`

---

## Redis Configuration

### REDIS_HOST
- **Description**: Redis server hostname
- **Type**: String
- **Default**: `localhost`
- **Example**: `REDIS_HOST=localhost`

### REDIS_PORT
- **Description**: Redis server port
- **Type**: Number
- **Default**: `6379`
- **Example**: `REDIS_PORT=6379`

### REDIS_PASSWORD
- **Description**: Redis authentication password
- **Type**: String
- **Required**: If Redis has auth enabled
- **Example**: `REDIS_PASSWORD=your-redis-password`

### REDIS_URL
- **Description**: Redis connection URL (alternative to host/port/password)
- **Type**: String (URL)
- **Example**: `REDIS_URL=redis://:password@hostname:port/0`

---

## Security Checklist

Before going to production:

- [ ] Generate strong, unique secrets for JWT
- [ ] Never commit `.env` to version control
- [ ] Use environment-specific `.env` files
- [ ] Rotate secrets regularly
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS for all services
- [ ] Restrict database access by IP
- [ ] Use API keys instead of passwords where possible
- [ ] Enable 2FA for all third-party services
- [ ] Audit environment variables regularly

---

## Generating Secure Secrets

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generate Random String
```bash
openssl rand -base64 32
```

### Generate UUID
```bash
node -e "console.log(require('crypto').randomUUID())"
```

---

## Troubleshooting

### Common Issues

**Variables not loading**
- Check `.env` file exists in root directory
- Ensure `require('dotenv').config()` is at the top of server.js
- Verify variable names match exactly (case-sensitive)

**MongoDB connection fails**
- Check MONGODB_URI format
- Verify network access (IP whitelist)
- Check username/password encoding
- Test connection with MongoDB Compass

**Email not sending**
- Verify SMTP credentials
- Check if using App Password (Gmail)
- Test with SendGrid/Mailgun
- Check firewall/port blocking

**JWT errors**
- Ensure JWT_SECRET is set and matches
- Check token hasn't expired
- Verify Authorization header format

---

## Additional Resources

- [dotenv Documentation](https://www.npmjs.com/package/dotenv)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Twelve-Factor App](https://12factor.net/config)

---

## Support

For environment configuration issues:
- Email: devops@baitech.com
- Documentation: https://docs.baitech.com
- Issue Tracker: https://github.com/baitech/backend/issues

---

**Last Updated**: October 2025
