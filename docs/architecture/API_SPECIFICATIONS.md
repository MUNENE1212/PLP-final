# API Specifications - Dumuwaks Service & Payment Architecture

## Overview

This document defines RESTful API endpoints for the new service discovery (WORD BANK), payment plans, and escrow system.

**Base URL**: `/api/v1`
**Authentication**: Bearer JWT Token
**Content-Type**: `application/json`

---

## Table of Contents

1. [Service Discovery APIs](#1-service-discovery-apis)
2. [Technician Service Management APIs](#2-technician-service-management-apis)
3. [Booking with New Pricing APIs](#3-booking-with-new-pricing-apis)
4. [Payment Flow APIs](#4-payment-flow-apis)
5. [Escrow Management APIs](#5-escrow-management-apis)
6. [Payout Management APIs](#6-payout-management-apis)
7. [Error Responses](#7-error-responses)
8. [Webhook Endpoints](#8-webhook-endpoints)

---

## 1. Service Discovery APIs

### 1.1 Get All Categories

List all service categories (for WORD BANK home screen).

```
GET /api/v1/services/categories
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `popular` | boolean | No | Filter to popular categories only |
| `group` | string | No | Filter by group (home_maintenance, etc.) |
| `limit` | number | No | Max results (default: 20) |

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "64a7b8c9d123456789012345",
        "slug": "plumbing",
        "name": "PLUMBING",
        "icon": "faucet",
        "imageUrl": "https://cdn.dumuwaks.com/categories/plumbing.jpg",
        "color": {
          "primary": "#0066CC",
          "secondary": "#E6F2FF"
        },
        "group": "home_maintenance",
        "displayOrder": 1,
        "isPopular": true,
        "servicesCount": 11,
        "stats": {
          "totalBookings": 1520,
          "activeTechnicians": 45,
          "averageRating": 4.7
        }
      }
    ],
    "total": 16,
    "groups": {
      "home_maintenance": 6,
      "cleaning_pest": 2,
      "appliances_hvac": 2,
      "security_outdoor": 2,
      "specialty_services": 4
    }
  }
}
```

---

### 1.2 Get Single Category

Get category details with services.

```
GET /api/v1/services/categories/:slug
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "64a7b8c9d123456789012345",
      "slug": "plumbing",
      "name": "PLUMBING",
      "description": "Professional plumbing services for residential and commercial properties",
      "icon": "faucet",
      "imageUrl": "https://cdn.dumuwaks.com/categories/plumbing.jpg"
    },
    "services": [
      {
        "_id": "64a7b8c9d123456789012346",
        "slug": "pipe-repair",
        "name": "PIPE REPAIR",
        "shortName": "PIPE",
        "icon": "wrench",
        "defaultPricing": {
          "model": "hourly",
          "baseRate": 500,
          "priceRange": {
            "min": 500,
            "max": 2000
          },
          "estimatedDuration": {
            "min": 30,
            "max": 120
          }
        }
      }
    ]
  }
}
```

---

### 1.3 Get Services by Category (WORD BANK)

Get all services for a category - the WORD BANK selection interface.

```
GET /api/v1/services/categories/:categoryId/services
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search within category services |
| `sort` | string | No | Sort by: popular, name, price |

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "64a7b8c9d123456789012345",
      "name": "PLUMBING",
      "icon": "faucet"
    },
    "services": [
      {
        "_id": "64a7b8c9d123456789012346",
        "slug": "pipe-repair",
        "name": "PIPE REPAIR",
        "shortName": "PIPE REPAIR",
        "icon": "wrench",
        "description": "Repair of leaking, burst, or damaged pipes",
        "defaultPricing": {
          "model": "hourly",
          "baseRate": 500,
          "unitLabel": null,
          "priceRange": { "min": 500, "max": 2000 }
        },
        "displayOrder": 1,
        "stats": {
          "bookingCount": 520,
          "averagePrice": 850
        }
      }
    ],
    "total": 11,
    "allowCustomService": true
  }
}
```

---

### 1.4 Search Services

Global search across all services.

```
GET /api/v1/services/search
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (min 2 chars) |
| `limit` | number | No | Max results (default: 20) |
| `category` | string | No | Filter by category ID |

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "query": "leaking pipe",
    "results": [
      {
        "_id": "64a7b8c9d123456789012346",
        "name": "PIPE REPAIR",
        "slug": "pipe-repair",
        "category": {
          "_id": "64a7b8c9d123456789012345",
          "name": "PLUMBING",
          "slug": "plumbing"
        },
        "matchScore": 0.95,
        "defaultPricing": {
          "model": "hourly",
          "baseRate": 500
        }
      }
    ],
    "total": 5,
    "suggestions": ["pipe repair", "drain cleaning", "leak detection"]
  }
}
```

---

### 1.5 Get Service Details

Get detailed information about a specific service.

```
GET /api/v1/services/:serviceId
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "service": {
      "_id": "64a7b8c9d123456789012346",
      "slug": "pipe-repair",
      "name": "PIPE REPAIR",
      "description": "Professional repair of leaking, burst, or damaged water pipes. Includes inspection, diagnosis, and repair using quality materials.",
      "category": {
        "_id": "64a7b8c9d123456789012345",
        "name": "PLUMBING",
        "slug": "plumbing"
      },
      "defaultPricing": {
        "model": "hourly",
        "baseRate": 500,
        "unitLabel": null,
        "estimatedDuration": {
          "min": 30,
          "max": 120,
          "typical": 60
        },
        "priceRange": {
          "min": 500,
          "max": 2000
        }
      },
      "icon": "wrench",
      "imageUrl": "https://cdn.dumuwaks.com/services/pipe-repair.jpg",
      "tags": ["emergency", "residential", "commercial"],
      "stats": {
        "bookingCount": 520,
        "averagePrice": 850,
        "averageRating": 4.8
      }
    },
    "availableTechnicians": 12,
    "startingPrice": 450
  }
}
```

---

### 1.6 Find Technicians for Service

Get technicians who offer a specific service.

```
GET /api/v1/services/:serviceId/technicians
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lng` | number | Yes | Longitude |
| `radius` | number | No | Search radius in km (default: 10, max: 50) |
| `sort` | string | No | Sort by: rating, distance, price, completion |
| `limit` | number | No | Max results (default: 20) |

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "service": {
      "_id": "64a7b8c9d123456789012346",
      "name": "PIPE REPAIR"
    },
    "technicians": [
      {
        "_id": "64a7b8c9d123456789012347",
        "firstName": "John",
        "lastName": "Kamau",
        "profilePicture": "https://cdn.dumuwaks.com/users/john.jpg",
        "rating": {
          "average": 4.8,
          "count": 127
        },
        "distance": 2.3,
        "pricing": {
          "model": "hourly",
          "rate": 500,
          "unitLabel": null
        },
        "stats": {
          "completedBookings": 127,
          "completionRate": 98,
          "responseTime": 15
        },
        "isAvailable": true,
        "nextAvailable": null
      }
    ],
    "total": 12,
    "searchCenter": {
      "lat": -1.2921,
      "lng": 36.8219
    },
    "searchRadius": 10
  }
}
```

---

## 2. Technician Service Management APIs

### 2.1 Get Technician's Services

List all services offered by the authenticated technician.

```
GET /api/v1/technician/services
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "_id": "64a7b8c9d123456789012348",
        "service": {
          "_id": "64a7b8c9d123456789012346",
          "name": "PIPE REPAIR",
          "slug": "pipe-repair",
          "category": {
            "_id": "64a7b8c9d123456789012345",
            "name": "PLUMBING"
          }
        },
        "isCustom": false,
        "pricing": {
          "model": "hourly",
          "rate": 500,
          "minimumCharge": 300,
          "estimatedDuration": {
            "min": 30,
            "max": 90,
            "typical": 45
          }
        },
        "availability": {
          "isAvailable": true
        },
        "status": "active",
        "stats": {
          "totalBookings": 45,
          "completedBookings": 43,
          "totalEarnings": 32500,
          "averageRating": 4.9,
          "reviewCount": 38
        },
        "workSamples": [
          {
            "imageUrl": "https://cdn.dumuwaks.com/work/sample1.jpg",
            "caption": "Kitchen pipe repair"
          }
        ]
      }
    ],
    "total": 5,
    "categories": ["plumbing"],
    "stats": {
      "totalServices": 5,
      "activeServices": 4,
      "customServices": 1
    }
  }
}
```

---

### 2.2 Add Service to Technician Profile

Select a service from WORD BANK and add to technician profile.

```
POST /api/v1/technician/services
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "serviceId": "64a7b8c9d123456789012346",
  "pricing": {
    "model": "hourly",
    "rate": 500,
    "minimumCharge": 300,
    "estimatedDuration": {
      "min": 30,
      "max": 90,
      "typical": 45
    }
  },
  "serviceArea": {
    "maxDistance": 15,
    "counties": ["Nairobi", "Kiambu"]
  }
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Service added to your profile",
  "data": {
    "technicianService": {
      "_id": "64a7b8c9d123456789012348",
      "service": {
        "_id": "64a7b8c9d123456789012346",
        "name": "PIPE REPAIR"
      },
      "pricing": {
        "model": "hourly",
        "rate": 500
      },
      "status": "active"
    }
  }
}
```

---

### 2.3 Create Custom Service

Create a custom service not in WORD BANK.

```
POST /api/v1/technician/services/custom
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Solar Water Heater Repair",
  "description": "Repair and maintenance of solar water heating systems including panel inspection, pipe repair, and thermostat replacement",
  "categoryId": "64a7b8c9d123456789012345",
  "pricing": {
    "model": "hourly",
    "rate": 800,
    "estimatedDuration": {
      "min": 60,
      "max": 240,
      "typical": 120
    }
  },
  "serviceArea": {
    "maxDistance": 20
  }
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Custom service created. Pending admin approval.",
  "data": {
    "technicianService": {
      "_id": "64a7b8c9d123456789012349",
      "customService": {
        "name": "Solar Water Heater Repair",
        "description": "Repair and maintenance...",
        "isApproved": false
      },
      "category": {
        "_id": "64a7b8c9d123456789012345",
        "name": "PLUMBING"
      },
      "isCustom": true,
      "pricing": {
        "model": "hourly",
        "rate": 800
      },
      "status": "active",
      "verification": {
        "isVerified": false
      }
    }
  }
}
```

---

### 2.4 Update Technician Service

Update pricing or availability for a service.

```
PATCH /api/v1/technician/services/:technicianServiceId
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "pricing": {
    "model": "hourly",
    "rate": 550,
    "minimumCharge": 350
  },
  "availability": {
    "isAvailable": true,
    "availableDays": [1, 2, 3, 4, 5],
    "timeSlots": [
      { "start": "08:00", "end": "12:00" },
      { "start": "14:00", "end": "18:00" }
    ]
  },
  "status": "active"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "technicianService": {
      "_id": "64a7b8c9d123456789012348",
      "pricing": {
        "model": "hourly",
        "rate": 550
      }
    }
  }
}
```

---

### 2.5 Delete Technician Service

Remove a service from technician profile.

```
DELETE /api/v1/technician/services/:technicianServiceId
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Service removed from your profile"
}
```

---

### 2.6 Add Work Sample to Service

Upload work sample photos for a service.

```
POST /api/v1/technician/services/:technicianServiceId/work-samples
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (form-data):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Yes | Image file |
| `caption` | string | No | Photo caption |
| `isBeforeAfter` | boolean | No | Is this a before/after pair |
| `beforeImage` | file | No | Before image (if isBeforeAfter) |

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Work sample added",
  "data": {
    "workSample": {
      "imageUrl": "https://cdn.dumuwaks.com/work/abc123.jpg",
      "publicId": "work/abc123",
      "caption": "Kitchen sink repair - before and after",
      "isBeforeAfter": true,
      "beforeImageUrl": "https://cdn.dumuwaks.com/work/abc124.jpg"
    }
  }
}
```

---

## 3. Booking with New Pricing APIs

### 3.1 Create Booking with Service Selection

Create a booking using the new service selection system.

```
POST /api/v1/bookings
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "serviceDetails": {
    "categoryId": "64a7b8c9d123456789012345",
    "serviceId": "64a7b8c9d123456789012346",
    "customServiceName": null,
    "customServiceDescription": null,
    "isCustomService": false
  },
  "description": "Kitchen sink has been leaking for two days. Water is coming from under the cabinet.",
  "urgency": "high",
  "serviceLocation": {
    "coordinates": [36.8219, -1.2921],
    "address": "123 Westlands Road, Nairobi",
    "city": "Nairobi",
    "county": "Nairobi",
    "landmarks": "Near Sarit Centre",
    "accessInstructions": "Gate code: 1234"
  },
  "timeSlot": {
    "date": "2026-02-18",
    "startTime": "14:00",
    "endTime": "16:00"
  },
  "images": [
    "https://cdn.dumuwaks.com/temp/booking-img1.jpg"
  ],
  "technicianId": "64a7b8c9d123456789012347",
  "pricingPreferences": {
    "model": "hourly",
    "estimatedHours": 1.5
  }
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "_id": "64a7b8c9d123456789012350",
      "bookingNumber": "BK26020001",
      "serviceDetails": {
        "category": {
          "_id": "64a7b8c9d123456789012345",
          "name": "PLUMBING"
        },
        "service": {
          "_id": "64a7b8c9d123456789012346",
          "name": "PIPE REPAIR"
        },
        "isCustomService": false
      },
      "description": "Kitchen sink has been leaking...",
      "urgency": "high",
      "status": "pending",
      "technician": {
        "_id": "64a7b8c9d123456789012347",
        "firstName": "John",
        "lastName": "Kamau"
      },
      "pricing": {
        "basePrice": 750,
        "urgencyPremium": 150,
        "subtotal": 900,
        "platformFee": 112,
        "totalAmount": 1012
      },
      "paymentPlan": {
        "_id": "64a7b8c9d123456789012351",
        "depositAmount": 202,
        "finalPaymentAmount": 810
      }
    },
    "requiresDeposit": true,
    "depositAmount": 202,
    "paymentMethods": ["mpesa", "card"]
  }
}
```

---

### 3.2 Get Price Estimate

Calculate price estimate before booking.

```
POST /api/v1/bookings/estimate
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "serviceId": "64a7b8c9d123456789012346",
  "technicianId": "64a7b8c9d123456789012347",
  "urgency": "high",
  "scheduledDate": "2026-02-18T14:00:00Z",
  "estimatedHours": 1.5
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "estimate": {
      "pricingModel": "hourly",
      "baseRate": 500,
      "hours": 1.5,
      "baseAmount": 750,
      "urgencyPremium": {
        "multiplier": 1.2,
        "amount": 150
      },
      "weekendPremium": {
        "applies": false,
        "amount": 0
      },
      "subtotal": 900,
      "platformFee": {
        "percentage": 12.5,
        "amount": 112
      },
      "tax": {
        "percentage": 0,
        "amount": 0
      },
      "totalAmount": 1012,
      "deposit": {
        "percentage": 20,
        "amount": 202
      },
      "technicianEarnings": 886,
      "priceRange": {
        "min": 750,
        "max": 1350
      },
      "validUntil": "2026-02-17T15:00:00Z"
    },
    "technicianPricing": {
      "model": "hourly",
      "rate": 500,
      "minimumCharge": 300
    }
  }
}
```

---

### 3.3 Get Booking with Payment Details

Get booking details including payment plan and escrow status.

```
GET /api/v1/bookings/:bookingId
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "64a7b8c9d123456789012350",
      "bookingNumber": "BK26020001",
      "customer": {
        "_id": "64a7b8c9d123456789012352",
        "firstName": "Mary",
        "lastName": "Wanjiru"
      },
      "technician": {
        "_id": "64a7b8c9d123456789012347",
        "firstName": "John",
        "lastName": "Kamau",
        "phoneNumber": "+254712345678",
        "profilePicture": "https://cdn.dumuwaks.com/users/john.jpg"
      },
      "serviceDetails": {
        "category": { "name": "PLUMBING" },
        "service": { "name": "PIPE REPAIR" }
      },
      "description": "Kitchen sink has been leaking...",
      "status": "in_progress",
      "serviceLocation": {
        "address": "123 Westlands Road, Nairobi",
        "coordinates": [36.8219, -1.2921]
      },
      "timeSlot": {
        "date": "2026-02-18",
        "startTime": "14:00",
        "endTime": "16:00"
      },
      "pricing": {
        "totalAmount": 1012
      },
      "paymentPlan": {
        "_id": "64a7b8c9d123456789012351",
        "model": { "type": "hourly", "rate": 500 },
        "breakdown": {
          "baseAmount": 750,
          "urgencyPremium": 150,
          "subtotal": 900,
          "platformFee": 112,
          "totalAmount": 1012
        },
        "deposit": {
          "required": true,
          "type": "percentage",
          "amount": 20,
          "refundable": true
        },
        "depositAmount": 202,
        "depositStatus": "paid",
        "finalPayment": {
          "amount": 810,
          "status": "pending"
        },
        "status": "deposit_paid"
      },
      "escrow": {
        "_id": "64a7b8c9d123456789012353",
        "status": "funded",
        "amounts": {
          "held": 202,
          "released": 0
        }
      }
    }
  }
}
```

---

## 4. Payment Flow APIs

### 4.1 Initiate Deposit Payment

Pay the booking deposit (20%).

```
POST /api/v1/bookings/:bookingId/payments/deposit
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "paymentMethod": "mpesa",
  "phoneNumber": "+254712345678"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Payment initiated. Check your phone for M-Pesa prompt.",
  "data": {
    "transaction": {
      "_id": "64a7b8c9d123456789012354",
      "transactionNumber": "TXN260217001",
      "amount": 202,
      "currency": "KES",
      "paymentMethod": "mpesa",
      "status": "pending",
      "mpesaDetails": {
        "merchantRequestId": "12345-67890",
        "checkoutRequestId": "ws_CO_123456789"
      }
    },
    "bookingId": "64a7b8c9d123456789012350",
    "expiresAt": "2026-02-17T14:05:00Z"
  }
}
```

---

### 4.2 Initiate Final Payment

Pay the remaining balance after service completion.

```
POST /api/v1/bookings/:bookingId/payments/final
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "paymentMethod": "mpesa",
  "phoneNumber": "+254712345678"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Payment initiated. Check your phone for M-Pesa prompt.",
  "data": {
    "transaction": {
      "_id": "64a7b8c9d123456789012355",
      "transactionNumber": "TXN260217002",
      "amount": 810,
      "currency": "KES",
      "paymentMethod": "mpesa",
      "status": "pending"
    },
    "amountBreakdown": {
      "serviceAmount": 810,
      "platformFeeIncluded": true
    }
  }
}
```

---

### 4.3 Verify Payment Status

Check if payment was successful.

```
GET /api/v1/payments/:transactionId/verify
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "64a7b8c9d123456789012354",
      "transactionNumber": "TXN260217001",
      "amount": 202,
      "status": "completed",
      "paymentMethod": "mpesa",
      "mpesaDetails": {
        "mpesaReceiptNumber": "QEK5R67890",
        "transactionDate": "2026-02-17T14:02:35Z"
      },
      "completedAt": "2026-02-17T14:02:35Z"
    },
    "booking": {
      "_id": "64a7b8c9d123456789012350",
      "status": "assigned",
      "depositStatus": "paid"
    }
  }
}
```

---

### 4.4 Request Price Adjustment

Technician requests a price change.

```
POST /api/v1/bookings/:bookingId/price-adjustment
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "proposedTotal": 1200,
  "reason": "Additional pipe replacement required. Original estimate was for repair only.",
  "additionalNotes": "Found corroded pipe section that needs full replacement."
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Price adjustment request sent to customer",
  "data": {
    "negotiation": {
      "originalTotal": 1012,
      "proposedTotal": 1200,
      "difference": 188,
      "status": "pending",
      "validUntil": "2026-02-17T16:00:00Z"
    }
  }
}
```

---

### 4.5 Respond to Price Adjustment

Customer accepts or rejects price adjustment.

```
POST /api/v1/bookings/:bookingId/price-adjustment/respond
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "accepted": true,
  "notes": "Approved. Please proceed with the full replacement."
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Price adjustment accepted",
  "data": {
    "booking": {
      "_id": "64a7b8c9d123456789012350",
      "pricing": {
        "totalAmount": 1200
      },
      "paymentPlan": {
        "depositAmount": 240,
        "finalPaymentAmount": 960,
        "additionalPaymentRequired": 38
      }
    }
  }
}
```

---

## 5. Escrow Management APIs

### 5.1 Get Escrow Details

Get escrow status for a booking.

```
GET /api/v1/bookings/:bookingId/escrow
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "escrow": {
      "_id": "64a7b8c9d123456789012353",
      "status": "funded",
      "amounts": {
        "held": 202,
        "released": 0,
        "refunded": 0,
        "pending": 0
      },
      "releaseConditions": {
        "type": "customer_confirmation",
        "autoReleaseAfter": 48,
        "requirePhotoEvidence": true
      },
      "releaseSchedule": {
        "scheduledAt": "2026-02-20T14:00:00Z"
      },
      "fundedAt": "2026-02-17T14:02:35Z",
      "holdStartedAt": "2026-02-17T14:02:35Z",
      "events": [
        {
          "type": "created",
          "triggeredAt": "2026-02-17T14:00:00Z"
        },
        {
          "type": "funded",
          "amount": 202,
          "triggeredAt": "2026-02-17T14:02:35Z",
          "notes": "Funded via transaction TXN260217001"
        }
      ]
    }
  }
}
```

---

### 5.2 Release Escrow (Customer)

Customer confirms completion and releases escrow.

```
POST /api/v1/bookings/:bookingId/escrow/release
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "rating": 5,
  "review": "Excellent work! Fixed the leak quickly and cleaned up after.",
  "tags": ["on_time", "quality_work", "professional"]
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Escrow released. Technician will receive payment within 24 hours.",
  "data": {
    "escrow": {
      "status": "released",
      "amounts": {
        "held": 0,
        "released": 202
      },
      "releasedAt": "2026-02-17T16:30:00Z"
    },
    "payout": {
      "scheduled": true,
      "scheduledFor": "2026-02-18T10:00:00Z",
      "amount": 177,
      "method": "mpesa"
    }
  }
}
```

---

### 5.3 Raise Dispute

Raise a dispute on escrow funds.

```
POST /api/v1/bookings/:bookingId/escrow/dispute
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "reason": "Work was not completed as agreed. Leak is still present.",
  "description": "Technician claimed to fix the leak but it started leaking again within 2 hours.",
  "evidence": [
    "https://cdn.dumuwaks.com/disputes/evidence1.jpg",
    "https://cdn.dumuwaks.com/disputes/evidence2.jpg"
  ]
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Dispute raised. Our support team will contact you within 24 hours.",
  "data": {
    "escrow": {
      "status": "disputed",
      "dispute": {
        "raisedAt": "2026-02-17T17:00:00Z",
        "raisedBy": "64a7b8c9d123456789012352",
        "reason": "Work was not completed as agreed. Leak is still present."
      }
    },
    "supportTicket": {
      "_id": "64a7b8c9d123456789012356",
      "ticketNumber": "DSP-2602001",
      "status": "open",
      "priority": "high"
    }
  }
}
```

---

## 6. Payout Management APIs

### 6.1 Get Technician Payouts

Get payout history for technician.

```
GET /api/v1/technician/payouts
```

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status |
| `startDate` | date | No | Filter from date |
| `endDate` | date | No | Filter to date |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "_id": "64a7b8c9d123456789012357",
        "payoutNumber": "PO-202602-00001",
        "payoutType": "daily",
        "amounts": {
          "grossAmount": 1500,
          "platformFees": 188,
          "netAmount": 1312
        },
        "itemCount": 2,
        "paymentMethod": {
          "type": "mpesa",
          "mpesaNumber": "+254712345678"
        },
        "status": "completed",
        "completedAt": "2026-02-17T10:30:00Z",
        "transactionReference": "QEK5R67891"
      }
    ],
    "summary": {
      "totalEarnings": 45000,
      "totalPayouts": 38500,
      "pendingPayouts": 6500,
      "heldInEscrow": 500
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

### 6.2 Get Payout Details

Get details of a specific payout.

```
GET /api/v1/technician/payouts/:payoutId
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "payout": {
      "_id": "64a7b8c9d123456789012357",
      "payoutNumber": "PO-202602-00001",
      "amounts": {
        "grossAmount": 1500,
        "platformFees": 188,
        "netAmount": 1312
      },
      "items": [
        {
          "booking": {
            "_id": "64a7b8c9d123456789012350",
            "bookingNumber": "BK26020001",
            "serviceType": "PIPE REPAIR"
          },
          "amount": 1012,
          "platformFee": 126,
          "netAmount": 886
        },
        {
          "booking": {
            "_id": "64a7b8c9d123456789012358",
            "bookingNumber": "BK26020002",
            "serviceType": "TAP INSTALLATION"
          },
          "amount": 488,
          "platformFee": 62,
          "netAmount": 426
        }
      ],
      "paymentMethod": {
        "type": "mpesa",
        "mpesaNumber": "+254712345678",
        "mpesaName": "JOHN KAMAU"
      },
      "status": "completed",
      "processedAt": "2026-02-17T10:00:00Z",
      "completedAt": "2026-02-17T10:30:00Z",
      "transactionReference": "QEK5R67891"
    }
  }
}
```

---

### 6.3 Update Payout Preferences

Update payout method and schedule.

```
PATCH /api/v1/technician/payout-preferences
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "payoutType": "daily",
  "paymentMethod": {
    "type": "mpesa",
    "mpesaNumber": "+254712345678"
  },
  "minimumPayoutAmount": 500
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Payout preferences updated",
  "data": {
    "preferences": {
      "payoutType": "daily",
      "paymentMethod": {
        "type": "mpesa",
        "mpesaNumber": "+254712345678",
        "verified": true
      },
      "minimumPayoutAmount": 500,
      "nextPayoutScheduled": "2026-02-18T10:00:00Z"
    }
  }
}
```

---

### 6.4 Request Instant Payout

Request immediate payout (with potential fee).

```
POST /api/v1/technician/payouts/instant
```

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "amount": 5000
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Instant payout initiated",
  "data": {
    "payout": {
      "_id": "64a7b8c9d123456789012359",
      "payoutNumber": "PO-202602-00002",
      "payoutType": "instant",
      "amounts": {
        "grossAmount": 5000,
        "platformFees": 0,
        "adjustments": -50,
        "netAmount": 4950
      },
      "status": "processing",
      "fee": {
        "percentage": 1,
        "amount": 50,
        "reason": "Instant payout processing fee"
      },
      "estimatedCompletion": "2026-02-17T15:00:00Z"
    }
  }
}
```

---

## 7. Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "pricing.rate",
        "message": "Rate must be at least KES 100"
      }
    ]
  },
  "requestId": "req_64a7b8c9d12345678901235a"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `ESCROW_ERROR` | 400 | Escrow operation failed |
| `BOOKING_ERROR` | 400 | Booking operation failed |
| `SERVICE_ERROR` | 400 | Service operation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 8. Webhook Endpoints

### 8.1 M-Pesa Callback

Receive M-Pesa payment notifications.

```
POST /api/v1/webhooks/mpesa
```

**Request Body** (from Safaricom):
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "12345-67890",
      "CheckoutRequestID": "ws_CO_123456789",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 202 },
          { "Name": "MpesaReceiptNumber", "Value": "QEK5R67890" },
          { "Name": "TransactionDate", "Value": 20260217140235 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

**Response** `200 OK`:
```json
{
  "ResultCode": 0,
  "ResultDesc": "Accepted"
}
```

---

### 8.2 Payout Status Callback

Receive payout status updates from payment provider.

```
POST /api/v1/webhooks/payouts
```

**Headers**:
```
X-Signature: <hmac-sha256 signature>
```

**Request Body**:
```json
{
  "payoutId": "PO-202602-00001",
  "status": "completed",
  "transactionReference": "QEK5R67891",
  "completedAt": "2026-02-17T10:30:00Z"
}
```

**Response** `200 OK`:
```json
{
  "received": true
}
```

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Service Discovery | 100 | 1 minute |
| Booking Creation | 10 | 1 minute |
| Payment Initiation | 5 | 1 minute |
| Search | 30 | 1 minute |
| General API | 60 | 1 minute |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-17 | System Architect | Initial API specification |

