# Swagger API Documentation - Quick Start

## Installation

### Option 1: Using the Setup Script (Recommended)

```bash
cd backend
chmod +x setup-swagger.sh
./setup-swagger.sh
```

### Option 2: Manual Installation

```bash
cd backend
npm install --save swagger-jsdoc swagger-ui-express
```

---

## Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## Access Swagger UI

Open your browser and navigate to:

```
http://localhost:5000/api-docs
```

---

## Quick Test

### 1. Register a User

Click on `POST /api/v1/auth/register` and use:

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "phoneNumber": "+254712345678",
  "password": "SecurePass123!",
  "role": "customer"
}
```

### 2. Login

Click on `POST /api/v1/auth/login` and use:

```json
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

Copy the `token` from the response.

### 3. Authorize

1. Click the **"Authorize"** button at the top right (🔓)
2. Paste your token
3. Click "Authorize"
4. Click "Close"

### 4. Test Protected Endpoints

Now you can test any endpoint that requires authentication!

Try: `GET /api/v1/auth/me` to get your profile.

---

## Features

✅ Interactive API documentation
✅ Built-in request/response testing
✅ Authentication support (JWT)
✅ Request validation
✅ Response examples
✅ Schema visualization
✅ cURL command generation

---

## Available Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Password reset
- And more...

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/nearby-technicians` - Find nearby technicians
- `GET /api/v1/users/:id` - Get user by ID
- And more...

### Bookings
- `GET /api/v1/bookings` - Get bookings
- `POST /api/v1/bookings` - Create booking
- `PUT /api/v1/bookings/:id/status` - Update booking status
- And more...

### Support
- `GET /api/v1/support/dashboard` - Support dashboard
- `POST /api/v1/support/tickets` - Create ticket
- `GET /api/v1/support/tickets` - Get tickets
- And more...

### Plus: Transactions, Posts, Reviews, Messages, Notifications

---

## Files Structure

```
backend/
├── src/
│   ├── config/
│   │   └── swagger.js          # Swagger configuration
│   ├── docs/
│   │   └── swagger.docs.js     # API documentation
│   └── server.js                # Swagger integration
├── SWAGGER_README.md            # This file
├── SWAGGER_TESTING_GUIDE.md    # Detailed guide
└── setup-swagger.sh             # Setup script
```

---

## Troubleshooting

### Server won't start?
- Check MongoDB is running
- Verify `.env` file exists
- Check port 5000 is not in use

### Can't see Swagger UI?
- Ensure dependencies are installed
- Restart the server
- Clear browser cache

### 401 Unauthorized errors?
- Click "Authorize" button
- Make sure you're using a valid token
- Login again if token expired

---

## Additional Help

For detailed testing workflows and examples, see:
**SWAGGER_TESTING_GUIDE.md**

---

## Screenshot Preview

When you open http://localhost:5000/api-docs, you'll see:

```
╔══════════════════════════════════════════╗
║   BaiTech API Documentation              ║
║   Version: 1.0.0                         ║
╠══════════════════════════════════════════╣
║                                          ║
║  🔓 Authorize                            ║
║                                          ║
║  📁 Authentication                       ║
║     POST /api/v1/auth/register           ║
║     POST /api/v1/auth/login              ║
║     GET  /api/v1/auth/me                 ║
║                                          ║
║  📁 Users                                ║
║     GET  /api/v1/users                   ║
║     GET  /api/v1/users/nearby-technicians║
║     GET  /api/v1/users/{id}              ║
║                                          ║
║  📁 Bookings                             ║
║  📁 Transactions                         ║
║  📁 Posts                                ║
║  📁 Reviews                              ║
║  📁 Support                              ║
║  📁 Messages                             ║
║  📁 Notifications                        ║
║                                          ║
╚══════════════════════════════════════════╝
```

---

## Production Deployment

For production, you may want to:

1. **Disable Swagger** or restrict access:

```javascript
// In server.js
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec));
}
```

2. **Add authentication** to Swagger UI:

```javascript
app.use('/api-docs', (req, res, next) => {
  // Add basic auth or other protection
  next();
}, swaggerUi.serve);
```

3. **Update server URLs** in `swagger.js`:

```javascript
servers: [
  {
    url: 'https://api.baitech.com',
    description: 'Production server'
  }
]
```

---

## Support

Need help? Check:
1. SWAGGER_TESTING_GUIDE.md (detailed guide)
2. Server console logs
3. Browser developer console (F12)
4. MongoDB connection status

Happy Testing! 🚀
