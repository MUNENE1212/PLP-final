# Swagger API Testing Guide for BaiTech

## Overview
This guide will help you set up and use Swagger UI to test all your BaiTech API routes interactively.

---

## Installation

### 1. Install Dependencies
Run the following command in your backend directory:

```bash
cd backend
npm install --save swagger-jsdoc swagger-ui-express
```

### 2. Verify Installation
Check that the packages were added to your `package.json`:
- `swagger-jsdoc`
- `swagger-ui-express`

---

## Starting the Server

1. Make sure your MongoDB is running
2. Start the server:

```bash
npm run dev
# or
npm start
```

3. You should see the server start message with the port (default: 5000)

---

## Accessing Swagger Documentation

### Web Interface
Open your browser and navigate to:

```
http://localhost:5000/api-docs
```

You should see the Swagger UI interface with:
- API title and description
- List of all available endpoints grouped by tags
- Interactive "Try it out" functionality

### JSON Specification
To get the raw OpenAPI JSON specification:

```
http://localhost:5000/api-docs.json
```

---

## Using Swagger UI

### 1. Exploring Endpoints

**Navigation:**
- Endpoints are grouped by tags (Authentication, Users, Bookings, etc.)
- Click on a tag to expand/collapse the endpoints
- Click on an endpoint to see details

**Endpoint Information:**
- HTTP method (GET, POST, PUT, DELETE) is color-coded
- Endpoint path
- Description
- Parameters (query, path, body)
- Request body schema
- Response schemas
- Example values

### 2. Testing Endpoints Without Authentication

For public endpoints (like registration, login):

1. Click on the endpoint (e.g., `POST /api/v1/auth/register`)
2. Click "Try it out" button
3. Fill in the request body with your data
4. Click "Execute"
5. View the response below

**Example: Register a User**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+254712345678",
  "password": "SecurePass123!",
  "role": "customer"
}
```

### 3. Testing Protected Endpoints (With Authentication)

Most endpoints require authentication. Here's how to use them:

#### Step 1: Get Authentication Token

1. First, register or login to get a JWT token
2. Use `POST /api/v1/auth/login`:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

3. Copy the `token` from the response

#### Step 2: Authorize Swagger

1. Scroll to the top of the Swagger page
2. Click the **"Authorize"** button (🔓 icon)
3. In the dialog that appears:
   - Paste your token in the "Value" field
   - Format: `Bearer <your-token-here>`
   - OR just paste the token (Swagger adds "Bearer" automatically)
4. Click "Authorize"
5. Click "Close"

#### Step 3: Test Protected Endpoints

Now you can test any protected endpoint:

1. Click on the endpoint
2. Click "Try it out"
3. Fill in the required parameters
4. Click "Execute"
5. View the response

**The authorization will be automatically included in all requests!**

### 4. Testing Different HTTP Methods

#### GET Requests (Retrieve Data)
- **Query Parameters**: Fill in the query parameter fields
- **Path Parameters**: Fill in the path parameter fields (e.g., user ID)

Example: Get User by ID
```
GET /api/v1/users/{id}
```
- Fill in the `id` field with an actual user ID
- Click Execute

#### POST Requests (Create Data)
- **Request Body**: Fill in the JSON body
- Use the example provided or modify as needed

Example: Create Booking
```
POST /api/v1/bookings
```

```json
{
  "serviceType": "plumbing",
  "description": "Fix leaking pipe",
  "scheduledDate": "2025-10-15T10:00:00Z",
  "serviceLocation": {
    "coordinates": [36.817223, -1.286389],
    "address": "123 Main St, Nairobi"
  },
  "urgency": "high"
}
```

#### PUT Requests (Update Data)
- Similar to POST
- Requires both path parameter (resource ID) and request body

Example: Update User Profile
```
PUT /api/v1/users/{id}
```

#### DELETE Requests (Remove Data)
- Usually only requires path parameter (resource ID)

Example: Delete Post
```
DELETE /api/v1/posts/{id}
```

---

## Common Testing Workflows

### Workflow 1: Complete User Journey

1. **Register** → `POST /api/v1/auth/register`
2. **Login** → `POST /api/v1/auth/login` (copy token)
3. **Authorize** → Click "Authorize" button, paste token
4. **Get Profile** → `GET /api/v1/auth/me`
5. **Update Profile** → `PUT /api/v1/users/{id}`

### Workflow 2: Create and Manage Booking

1. **Login as Customer** → Get token
2. **Find Technicians** → `GET /api/v1/users/nearby-technicians?lat=-1.286389&lng=36.817223`
3. **Create Booking** → `POST /api/v1/bookings`
4. **View Booking** → `GET /api/v1/bookings/{id}`
5. **Update Status** → `PUT /api/v1/bookings/{id}/status`

### Workflow 3: Support Ticket Creation

1. **Login as Customer** → Get token
2. **Create Ticket** → `POST /api/v1/support/tickets`
3. **View Ticket** → `GET /api/v1/support/tickets/{id}`
4. **Add Message** → `POST /api/v1/support/tickets/{id}/messages`
5. **Rate Ticket** → `POST /api/v1/support/tickets/{id}/rate` (after resolution)

### Workflow 4: Social Features

1. **Login** → Get token
2. **Create Post** → `POST /api/v1/posts`
3. **Like Post** → `POST /api/v1/posts/{id}/like`
4. **Add Comment** → `POST /api/v1/posts/{id}/comment`
5. **Follow User** → `POST /api/v1/users/{id}/follow`

---

## Tips and Best Practices

### 1. Using Query Parameters

For filtering and pagination:

```
GET /api/v1/users?role=technician&page=1&limit=20
```

In Swagger:
- Each query parameter has its own input field
- Fill in only the ones you need
- Leave others empty

### 2. Testing Geospatial Queries

Example coordinates for Nairobi:
- Latitude: `-1.286389`
- Longitude: `36.817223`
- Radius: `10` (km)

```
GET /api/v1/users/nearby-technicians?lat=-1.286389&lng=36.817223&radius=10
```

### 3. Working with Date/Time

Use ISO 8601 format:
```
2025-10-15T10:00:00Z
```

### 4. Handling File Uploads

For endpoints that accept file uploads (like profile pictures):
- Currently, these need to be tested with Postman or cURL
- Swagger UI has limited support for multipart/form-data

### 5. Testing Pagination

```
GET /api/v1/bookings?page=1&limit=20&sort=-createdAt
```

Parameters:
- `page`: Page number (starts at 1)
- `limit`: Items per page (max usually 100)
- `sort`: Sort field (prefix with `-` for descending)

### 6. Response Status Codes

- **200 OK**: Successful GET/PUT/DELETE
- **201 Created**: Successful POST
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Server Error**: Internal server error

---

## Testing Different User Roles

### As Customer

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "role": "customer"
}
```

**Can Test:**
- Create bookings
- View own bookings
- Create posts
- Write reviews
- Create support tickets

### As Technician

```json
{
  "email": "tech@example.com",
  "password": "SecurePass123!",
  "role": "technician"
}
```

**Can Test:**
- View assigned bookings
- Update booking status
- Update pricing
- Manage availability
- Portfolio management

### As Support Agent

```json
{
  "email": "support@example.com",
  "password": "SecurePass123!",
  "role": "support"
}
```

**Can Test:**
- View support dashboard
- Assign tickets
- Update ticket status
- Close tickets
- View statistics

### As Admin

```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "role": "admin"
}
```

**Can Test:**
- All endpoints
- User management
- Dispute resolution
- System statistics

---

## Advanced Features

### 1. Testing with Multiple Users

Open multiple browser tabs/windows:
- Tab 1: Login as Customer
- Tab 2: Login as Technician
- Tab 3: Login as Support

Each tab maintains its own authorization token.

### 2. Copying cURL Commands

Swagger can generate cURL commands:
1. After executing a request
2. Scroll down to "Responses"
3. Click on "cURL" tab
4. Copy the command for terminal use

### 3. Downloading Response

Click the "Download" button to save responses as files.

### 4. Exploring Schemas

Click on "Schemas" at the bottom to see all data models:
- User
- Booking
- Transaction
- Post
- Review
- SupportTicket

---

## Troubleshooting

### Issue: "Failed to fetch" Error

**Solution:**
- Check if server is running
- Verify the server URL in browser
- Check MongoDB connection

### Issue: 401 Unauthorized

**Solution:**
- Make sure you've clicked "Authorize"
- Check if token is still valid (tokens expire)
- Login again to get a new token

### Issue: Validation Errors

**Solution:**
- Check the request body schema
- Ensure all required fields are filled
- Verify data types match schema

### Issue: CORS Error

**Solution:**
- Check `corsOptions` in `server.js`
- Add your origin to the whitelist
- Restart the server

### Issue: Cannot see new endpoints

**Solution:**
- Restart the server
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## Example Test Scenarios

### Scenario 1: Complete Booking Flow

```javascript
// 1. Register Customer
POST /api/v1/auth/register
{
  "firstName": "Jane",
  "lastName": "Customer",
  "email": "jane@example.com",
  "phoneNumber": "+254723456789",
  "password": "SecurePass123!",
  "role": "customer"
}

// 2. Login
POST /api/v1/auth/login
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
// Copy token and authorize

// 3. Find Technicians
GET /api/v1/users/nearby-technicians
?lat=-1.286389&lng=36.817223&skills=plumbing

// 4. Create Booking
POST /api/v1/bookings
{
  "serviceType": "plumbing",
  "description": "Fix sink",
  "scheduledDate": "2025-10-20T09:00:00Z",
  "serviceLocation": {
    "coordinates": [36.817223, -1.286389],
    "address": "456 Oak St, Nairobi"
  }
}

// 5. View Booking
GET /api/v1/bookings/{id}

// 6. Create Payment
POST /api/v1/transactions
{
  "booking": "<booking-id>",
  "amount": 3000,
  "gateway": "mpesa"
}
```

### Scenario 2: Support Ticket Flow

```javascript
// 1. Login as Customer
POST /api/v1/auth/login

// 2. Create Ticket
POST /api/v1/support/tickets
{
  "subject": "Payment not processing",
  "description": "M-Pesa payment failing",
  "category": "payment",
  "priority": "high"
}

// 3. Add Message
POST /api/v1/support/tickets/{id}/messages
{
  "message": "I tried 3 times already"
}

// 4. Login as Support Agent
POST /api/v1/auth/login (with support credentials)

// 5. View Dashboard
GET /api/v1/support/dashboard

// 6. Assign Ticket
PUT /api/v1/support/tickets/{id}/assign
{
  "agentId": "<support-agent-id>"
}

// 7. Update Status
PUT /api/v1/support/tickets/{id}/status
{
  "status": "in_progress",
  "notes": "Investigating the issue"
}

// 8. Close Ticket
PUT /api/v1/support/tickets/{id}/close
{
  "summary": "Payment gateway issue resolved",
  "resolutionType": "solved"
}

// 9. Login back as Customer

// 10. Rate Ticket
POST /api/v1/support/tickets/{id}/rate
{
  "rating": 5,
  "feedback": "Quick resolution!"
}
```

---

## Additional Resources

### Swagger UI Documentation
- https://swagger.io/tools/swagger-ui/

### OpenAPI Specification
- https://swagger.io/specification/

### Testing Tools Comparison
| Tool | Best For | Pros | Cons |
|------|----------|------|------|
| Swagger UI | Interactive docs | Visual, easy to use | Limited file upload |
| Postman | Complex testing | Collections, environments | Separate app |
| cURL | Scripts/automation | Command line | Less visual |
| Thunder Client | VS Code users | Integrated in IDE | VS Code only |

---

## Next Steps

1. **Install dependencies** if not already done
2. **Start the server**
3. **Open Swagger UI** at http://localhost:5000/api-docs
4. **Register a user** to get started
5. **Authorize** with your token
6. **Explore and test** all endpoints!

---

## Summary

Swagger UI provides:
✅ **Interactive API documentation**
✅ **Built-in testing interface**
✅ **Request/response examples**
✅ **Schema visualization**
✅ **No additional tools needed**
✅ **Real-time validation**
✅ **cURL command generation**

Happy Testing! 🚀

---

## Support

If you encounter issues:
1. Check the server console for errors
2. Verify MongoDB is running
3. Check browser console (F12)
4. Review this guide
5. Contact the development team
