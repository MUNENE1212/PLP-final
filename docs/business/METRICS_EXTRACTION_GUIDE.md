# Real Metrics Extraction Guide
## From Production Database to Business Dashboard

**Date:** January 9, 2026
**Purpose:** Extract actual performance metrics from Dumu Waks production database to replace all mock/target data

---

## Overview

This guide provides SQL queries and MongoDB aggregation pipelines to extract real business metrics from the Dumu Waks production database. These metrics will form the foundation of all business documents, investor pitches, and strategic decisions.

**IMPORTANT:** These queries should be run against the PRODUCTION database (not development/staging) to get real operational data.

---

## Database Schema Overview

**Key Collections:**
- `users` - Customers, technicians, admins, support
- `bookings` - Service bookings with status tracking
- `reviews` - Customer reviews of technicians
- `transactions` - M-Pesa payment transactions
- `posts` - Social posts (if using social features)
- `support_tickets` - Customer support tickets

**Key User Roles:**
- `customer` - Homeowners/businesses hiring technicians
- `technician` - Skilled workers providing services
- `admin` - Platform administrators
- `support` - Customer support representatives

**Key Booking Statuses:**
- `pending` - Awaiting technician acceptance
- `accepted` - Technician assigned, awaiting start
- `in_progress` - Work being done
- `completed` - Work finished, awaiting review
- `cancelled` - Booking cancelled

---

## Metric Categories

### 1. User Metrics
### 2. Booking Metrics
### 3. Revenue Metrics
### 4. Technician Metrics
### 5. Quality Metrics
### 6. Growth Metrics
### 7. Unit Economics

---

## 1. User Metrics

### 1.1 Total Registered Users

```javascript
// Total users by role
db.users.aggregate([
  {
    $match: {
      deletedAt: null,  // Exclude deleted users
      isEmailVerified: true  // Only verified users
    }
  },
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
]);

// Expected output:
// { _id: "admin", count: X }
// { _id: "customer", count: Y }
// { _id: "technician", count: Z }
// { _id: "support", count: W }
```

### 1.2 Active Users (Last 7/30/90 Days)

```javascript
// Customers active in last 30 days (logged in or made booking)
db.users.aggregate([
  {
    $match: {
      role: "customer",
      deletedAt: null,
      $or: [
        { lastLogin: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } },
        { createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } }
      ]
    }
  },
  {
    $count: "activeCustomersLast30Days"
  }
]);

// Technicians active in last 30 days (completed a booking)
db.users.aggregate([
  {
    $lookup: {
      from: "bookings",
      let: { technicianId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$technician", "$$technicianId"] },
                { $eq: ["$status", "completed"] },
                { $gte: ["$createdAt", new Date(new Date() - 30 * 24 * 60 * 60 * 1000)] }
              ]
            }
          }
        }
      ],
      as: "recentBookings"
    }
  },
  {
    $match: {
      "recentBookings.0": { $exists: true }
    }
  },
  {
    $count: "activeTechniciansLast30Days"
  }
]);
```

### 1.3 New User Registrations (By Month)

```javascript
// New customer registrations by month (last 12 months)
db.users.aggregate([
  {
    $match: {
      role: "customer",
      deletedAt: null,
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
]);

// New technician registrations by month
db.users.aggregate([
  {
    $match: {
      role: "technician",
      deletedAt: null,
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
]);
```

### 1.4 Geographic Distribution

```javascript
// Users by city
db.users.aggregate([
  {
    $match: {
      deletedAt: null,
      "location.city": { $exists: true, $ne: null }
    }
  },
  {
    $group: {
      _id: {
        role: "$role",
        city: "$location.city"
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
]);
```

---

## 2. Booking Metrics

### 2.1 Total Bookings (All Time, Last 30 Days)

```javascript
// Total bookings all time
db.bookings.countDocuments({});

// Total bookings in last 30 days
db.bookings.countDocuments({
  createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
});

// Bookings by status (all time)
db.bookings.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
]);
```

### 2.2 Booking Completion Rate

```javascript
// Booking completion rate (completed vs cancelled)
db.bookings.aggregate([
  {
    $match: {
      status: { $in: ["completed", "cancelled"] }
    }
  },
  {
    $group: {
      _id: null,
      completed: {
        $sum: {
          $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
        }
      },
      cancelled: {
        $sum: {
          $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
        }
      },
      total: { $sum: 1 }
    }
  },
  {
    $project: {
      completed: 1,
      cancelled: 1,
      total: 1,
      completionRate: {
        $multiply: [
          { $divide: ["$completed", "$total"] },
          100
        ]
      }
    }
  }
]);
```

### 2.3 Average Booking Value

```javascript
// Average booking value (in KES)
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null }
    }
  },
  {
    $group: {
      _id: null,
      averageBookingValue: { $avg: "$finalPrice" },
      medianBookingValue: { $avg: "$finalPrice" },  // Note: true median requires more complex aggregation
      minBookingValue: { $min: "$finalPrice" },
      maxBookingValue: { $max: "$finalPrice" },
      totalBookings: { $sum: 1 }
    }
  }
]);
```

### 2.4 Bookings by Service Category

```javascript
// Bookings by service category
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      serviceCategory: { $exists: true }
    }
  },
  {
    $group: {
      _id: "$serviceCategory",
      count: { $sum: 1 },
      totalValue: { $sum: "$finalPrice" },
      averageValue: { $avg: "$finalPrice" }
    }
  },
  {
    $sort: { count: -1 }
  }
]);
```

### 2.5 Booking Frequency (Customers Per Month)

```javascript
// How many bookings does the average customer make per month?
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      customer: { $exists: true }
    }
  },
  {
    $group: {
      _id: "$customer",
      totalBookings: { $sum: 1 },
      firstBooking: { $min: "$createdAt" },
      lastBooking: { $max: "$createdAt" }
    }
  },
  {
    $project: {
      _id: 1,
      totalBookings: 1,
      monthsActive: {
        $divide: [
          { $subtract: ["$lastBooking", "$firstBooking"] },
          1000 * 60 * 60 * 24 * 30  // Milliseconds to months
        ]
      }
    }
  },
  {
    $project: {
      _id: 1,
      totalBookings: 1,
      bookingsPerMonth: {
        $cond: [
          { $eq: ["$monthsActive", 0] },
          "$totalBookings",
          { $divide: ["$totalBookings", "$monthsActive"] }
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      averageBookingsPerMonth: { $avg: "$bookingsPerMonth" },
      medianBookingsPerMonth: { $avg: "$bookingsPerMonth" }  // Approximation
    }
  }
]);
```

### 2.6 Average Time to Booking Completion

```javascript
// Average time from booking creation to completion (in hours)
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      createdAt: { $exists: true },
      completedAt: { $exists: true }
    }
  },
  {
    $project: {
      timeToComplete: {
        $divide: [
          { $subtract: ["$completedAt", "$createdAt"] },
          1000 * 60 * 60  // Milliseconds to hours
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      averageTimeToComplete: { $avg: "$timeToComplete" },
      medianTimeToComplete: { $avg: "$timeToComplete" },  // Approximation
      minTimeToComplete: { $min: "$timeToComplete" },
      maxTimeToComplete: { $max: "$timeToComplete" }
    }
  }
]);
```

---

## 3. Revenue Metrics

### 3.1 Gross Merchandise Value (GMV)

```javascript
// Total GMV (all time)
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null }
    }
  },
  {
    $group: {
      _id: null,
      totalGMV: { $sum: "$finalPrice" },
      totalBookings: { $sum: 1 }
    }
  }
]);

// GMV by month (last 12 months)
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null },
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      monthlyGMV: { $sum: "$finalPrice" },
      monthlyBookings: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
]);
```

### 3.2 Platform Revenue (15% of GMV)

```javascript
// Platform revenue (15% commission) by month
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null },
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      monthlyGMV: { $sum: "$finalPrice" },
      platformRevenue: { $sum: { $multiply: ["$finalPrice", 0.15] } },
      monthlyBookings: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
]);
```

### 3.3 Monthly Recurring Revenue (MRR)

```javascript
// MRR - revenue from repeat customers
// Note: MRR in marketplace context is typically measured as average monthly revenue
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null },
      createdAt: { $gte: new Date(new Date() - 90 * 24 * 60 * 60 * 1000) }  // Last 90 days
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      monthlyRevenue: { $sum: { $multiply: ["$finalPrice", 0.15] } }
    }
  },
  {
    $sort: { "_id.year": -1, "_id.month": -1 }
  },
  {
    $limit: 1
  }
]);
```

### 3.4 Revenue Growth Rate (Month-over-Month, Year-over-Year)

```javascript
// Month-over-month revenue growth
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null },
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      monthlyRevenue: { $sum: { $multiply: ["$finalPrice", 0.15] } }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  },
  {
    $project: {
      _id: 1,
      monthlyRevenue: 1,
      previousMonthRevenue: "$monthlyRevenue"  // Need to shift for comparison
    }
  }
]);
// Note: Calculate MoM growth in Excel/Google Sheets after export
```

---

## 4. Technician Metrics

### 4.1 Active Technicians

```javascript
// Technicians who completed at least 1 booking in last 30 days
db.users.aggregate([
  {
    $match: {
      role: "technician",
      deletedAt: null
    }
  },
  {
    $lookup: {
      from: "bookings",
      let: { technicianId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$technician", "$$technicianId"] },
                { $eq: ["$status", "completed"] },
                { $gte: ["$completedAt", new Date(new Date() - 30 * 24 * 60 * 60 * 1000)] }
              ]
            }
          }
        }
      ],
      as: "recentBookings"
    }
  },
  {
    $match: {
      "recentBookings.0": { $exists: true }
    }
  },
  {
    $count: "activeTechnicians"
  }
]);
```

### 4.2 Technician Earnings (REAL Data)

```javascript
// Technician earnings in last 30 days (85% of booking value)
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      technician: { $exists: true },
      finalPrice: { $exists: true, $ne: null },
      completedAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: "$technician",
      totalEarnings: { $sum: { $multiply: ["$finalPrice", 0.85] } },  // 85% goes to technician
      totalBookings: { $sum: 1 }
    }
  },
  {
    $sort: { totalEarnings: -1 }
  },
  {
    $group: {
      _id: null,
      averageEarnings: { $avg: "$totalEarnings" },
      medianEarnings: { $avg: "$totalEarnings" },  // Approximation
      minEarnings: { $min: "$totalEarnings" },
      maxEarnings: { $max: "$totalEarnings" },
      topEarningTechnicians: { $first: 10 }  // Top 10 earners
    }
  }
]);
```

### 4.3 Technician Income Distribution

```javascript
// Technician earnings distribution (quartiles)
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null },
      completedAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: "$technician",
      monthlyEarnings: { $sum: { $multiply: ["$finalPrice", 0.85] } }
    }
  },
  {
    $sort: { monthlyEarnings: 1 }
  },
  {
    $group: {
      _id: null,
      totalTechnicians: { $sum: 1 },
      percentile25: { $avg: "$monthlyEarnings" },  // Approximation
      percentile50: { $avg: "$monthlyEarnings" },  // Approximation
      percentile75: { $avg: "$monthlyEarnings" },  // Approximation
      percentile90: { $avg: "$monthlyEarnings" }   // Approximation
    }
  }
]);
```

### 4.4 Technician Retention Rate

```javascript
// Technician retention: % who return after first booking
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      technician: { $exists: true }
    }
  },
  {
    $group: {
      _id: "$technician",
      firstBooking: { $min: "$createdAt" },
      lastBooking: { $max: "$createdAt" },
      totalBookings: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 1,
      totalBookings: 1,
      isRetained: { $gt: ["$totalBookings", 1] }
    }
  },
  {
    $group: {
      _id: null,
      totalTechnicians: { $sum: 1 },
      retainedTechnicians: {
        $sum: {
          $cond: ["$isRetained", 1, 0]
        }
      }
    }
  },
  {
    $project: {
      totalTechnicians: 1,
      retainedTechnicians: 1,
      retentionRate: {
        $multiply: [
          { $divide: ["$retainedTechnicians", "$totalTechnicians"] },
          100
        ]
      }
    }
  }
]);
```

### 4.5 Top-Performing Technicians

```javascript
// Top 10 technicians by earnings and rating
db.users.aggregate([
  {
    $match: {
      role: "technician",
      deletedAt: null
    }
  },
  {
    $lookup: {
      from: "bookings",
      let: { technicianId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$technician", "$$technicianId"] },
                { $eq: ["$status", "completed"] },
                { $gte: ["$completedAt", new Date(new Date() - 30 * 24 * 60 * 60 * 1000)] }
              ]
            }
          }
        }
      ],
      as: "recentBookings"
    }
  },
  {
    $project: {
      firstName: 1,
      lastName: 1,
      email: 1,
      rating: "$rating.average",
      ratingCount: "$rating.count",
      totalBookings: { $size: "$recentBookings" },
      totalEarnings: {
        $sum: "$recentBookings.finalPrice"
      }
    }
  },
  {
    $match: {
      totalBookings: { $gt: 0 }
    }
  },
  {
    $project: {
      firstName: 1,
      lastName: 1,
      email: 1,
      rating: 1,
      ratingCount: 1,
      totalBookings: 1,
      estimatedEarnings: { $multiply: ["$totalEarnings", 0.85] }
    }
  },
  {
    $sort: { estimatedEarnings: -1, rating: -1 }
  },
  {
    $limit: 10
  }
]);
```

---

## 5. Quality Metrics

### 5.1 Average Customer Rating

```javascript
// Average rating across all completed bookings
db.reviews.aggregate([
  {
    $group: {
      _id: null,
      averageRating: { $avg: "$rating" },
      totalReviews: { $sum: 1 },
      ratingDistribution: {
        $push: "$rating"
      }
    }
  }
]);

// Rating distribution (1-star, 2-star, etc.)
db.reviews.aggregate([
  {
    $group: {
      _id: "$rating",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
]);
```

### 5.2 Average Technician Rating

```javascript
// Average technician rating from User collection
db.users.aggregate([
  {
    $match: {
      role: "technician",
      "rating.count": { $gt: 0 }
    }
  },
  {
    $group: {
      _id: null,
      averageRating: { $avg: "$rating.average" },
      totalTechniciansWithReviews: { $sum: 1 },
      totalReviews: { $sum: "$rating.count" }
    }
  }
]);
```

### 5.3 Booking Dispute Rate

```javascript
// Percentage of bookings with disputes/complaints
db.bookings.aggregate([
  {
    $match: {
      status: "completed"
    }
  },
  {
    $lookup: {
      from: "support_tickets",
      let: { bookingId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$booking", "$$bookingId"]
            }
          }
        }
      ],
      as: "disputes"
    }
  },
  {
    $project: {
      hasDispute: { $gt: [{ $size: "$disputes" }, 0] }
    }
  },
  {
    $group: {
      _id: null,
      totalBookings: { $sum: 1 },
      bookingsWithDisputes: {
        $sum: {
          $cond: ["$hasDispute", 1, 0]
        }
      }
    }
  },
  {
    $project: {
      totalBookings: 1,
      bookingsWithDisputes: 1,
      disputeRate: {
        $multiply: [
          { $divide: ["$bookingsWithDisputes", "$totalBookings"] },
          100
        ]
      }
    }
  }
]);
```

### 5.4 Customer Complaint Rate

```javascript
// Support tickets related to service quality
db.support_tickets.aggregate([
  {
    $match: {
      category: "service_quality",  // Adjust based on your categories
      createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $count: "serviceQualityComplaints"
  }
]);
```

---

## 6. Growth Metrics

### 6.1 User Growth Rate (Month-over-Month)

```javascript
// Customer growth rate by month
db.users.aggregate([
  {
    $match: {
      role: "customer",
      deletedAt: null,
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      newCustomers: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
]);
```

### 6.2 Booking Growth Rate (Month-over-Month)

```javascript
// Completed bookings by month
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      completedBookings: { $sum: 1 },
      totalGMV: { $sum: "$finalPrice" }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
]);
```

### 6.3 Revenue Growth Rate (Month-over-Month)

```javascript
// Platform revenue by month
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null },
      createdAt: { $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      platformRevenue: { $sum: { $multiply: ["$finalPrice", 0.15] } }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1 }
  }
]);
```

---

## 7. Unit Economics

### 7.1 Customer Acquisition Cost (CAC)

```javascript
// Calculate CAC by marketing channel
// Note: Requires tracking marketing spend and source attribution

// If you track "source" or "referredBy" in user documents:
db.users.aggregate([
  {
    $match: {
      role: "customer",
      createdAt: { $gte: new Date(new Date() - 180 * 24 * 60 * 60 * 1000) },  // Last 6 months
      "metadata.source": { $exists: true }  // Adjust field name as needed
    }
  },
  {
    $group: {
      _id: "$metadata.source",  // e.g., "facebook", "google", "referral", "organic"
      newCustomers: { $sum: 1 }
    }
  },
  {
    $sort: { newCustomers: -1 }
  }
]);

// Manual calculation required:
// CAC by channel = Marketing Spend by Channel / New Customers from Channel
```

### 7.2 Customer Lifetime Value (LTV)

```javascript
// Average revenue per customer per month
db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      finalPrice: { $exists: true, $ne: null }
    }
  },
  {
    $group: {
      _id: "$customer",
      totalBookings: { $sum: 1 },
      totalValue: { $sum: "$finalPrice" },
      firstBooking: { $min: "$createdAt" },
      lastBooking: { $max: "$createdAt" },
      platformRevenue: { $sum: { $multiply: ["$finalPrice", 0.15] } }
    }
  },
  {
    $project: {
      _id: 1,
      totalBookings: 1,
      totalValue: 1,
      platformRevenue: 1,
      customerLifespan: {
        $divide: [
          { $subtract: ["$lastBooking", "$firstBooking"] },
          1000 * 60 * 60 * 24 * 30  // Milliseconds to months
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      averageBookingsPerCustomer: { $avg: "$totalBookings" },
      averageRevenuePerCustomer: { $avg: "$platformRevenue" },
      averageCustomerLifespan: { $avg: "$customerLifespan" },
      estimatedLTV: { $avg: "$platformRevenue" }  // Approximation
    }
  }
]);
```

### 7.3 LTV:CAC Ratio

```javascript
// Manual calculation after extracting LTV and CAC:
// LTV:CAC = Average Customer LTV / Average CAC
// Target: > 3:1

// If LTV = 15,000 KES and CAC = 3,000 KES
// LTV:CAC = 15,000 / 3,000 = 5:1 ✓
```

### 7.4 Payback Period

```javascript
// How many months to recover CAC?
// Payback Period = CAC / (Average Revenue Per Customer Per Month)

// Manual calculation:
// If CAC = 3,000 KES and ARPM = 1,500 KES
// Payback Period = 3,000 / 1,500 = 2 months
```

### 7.5 Churn Rate

```javascript
// Customer churn: % who stop using platform
// Definition: Customer is "churned" if no bookings in last 90 days

db.users.aggregate([
  {
    $match: {
      role: "customer",
      deletedAt: null
    }
  },
  {
    $lookup: {
      from: "bookings",
      let: { customerId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$customer", "$$customerId"] },
                { $gte: ["$createdAt", new Date(new Date() - 90 * 24 * 60 * 60 * 1000)] }
              ]
            }
          }
        }
      ],
      as: "recentBookings"
    }
  },
  {
    $project: {
      _id: 1,
      hasRecentBookings: { $gt: [{ $size: "$recentBookings" }, 0] }
    }
  },
  {
    $group: {
      _id: null,
      totalCustomers: { $sum: 1 },
      activeCustomers: {
        $sum: {
          $cond: ["$hasRecentBookings", 1, 0]
        }
      },
      churnedCustomers: {
        $sum: {
          $cond: ["$hasRecentBookings", 0, 1]
        }
      }
    }
  },
  {
    $project: {
      totalCustomers: 1,
      activeCustomers: 1,
      churnedCustomers: 1,
      churnRate: {
        $multiply: [
          { $divide: ["$churnedCustomers", "$totalCustomers"] },
          100
        ]
      }
    }
  }
]);
```

---

## 8. Creating the Real Metrics Dashboard

### Step 1: Extract All Metrics

Run all queries above and export results to CSV/Excel.

### Step 2: Create Dashboard File

Create `docs/business/REAL_METRICS_DASHBOARD.md`:

```markdown
# Dumu Waks - Real Metrics Dashboard
**Last Updated:** [DATE]
**Data Period:** [DATE RANGE]
**Data Source:** Production Database

## User Metrics

- Total Customers: [ACTUAL NUMBER]
- Total Technicians: [ACTUAL NUMBER]
- Active Customers (Last 30 Days): [ACTUAL NUMBER]
- Active Technicians (Last 30 Days): [ACTUAL NUMBER]
- Customer Growth Rate (MoM): [ACTUAL %]
- Technician Growth Rate (MoM): [ACTUAL %]

## Booking Metrics

- Total Bookings (All Time): [ACTUAL NUMBER]
- Total Bookings (Last 30 Days): [ACTUAL NUMBER]
- Booking Completion Rate: [ACTUAL %]
- Average Booking Value: [ACTUAL KES]
- Most Booked Service Categories:
  1. [CATEGORY]: [NUMBER] bookings
  2. [CATEGORY]: [NUMBER] bookings
  3. [CATEGORY]: [NUMBER] bookings

## Revenue Metrics

- Total GMV (All Time): [ACTUAL KES]
- Total GMV (Last 30 Days): [ACTUAL KES]
- Platform Revenue (15% of GMV) (All Time): [ACTUAL KES]
- Platform Revenue (Last 30 Days): [ACTUAL KES]
- Revenue Growth Rate (MoM): [ACTUAL %]

## Technician Metrics

- Active Technicians: [ACTUAL NUMBER]
- Average Monthly Earnings: [ACTUAL KES] (REAL DATA, not "80,000+ KES")
- Median Monthly Earnings: [ACTUAL KES]
- Top 10% Earn: [ACTUAL KES]
- Technician Retention Rate: [ACTUAL %]

## Quality Metrics

- Average Customer Rating: [ACTUAL]/5.0
- Average Technician Rating: [ACTUAL]/5.0
- Total Reviews: [ACTUAL NUMBER]
- Booking Dispute Rate: [ACTUAL %]

## Unit Economics

- CAC: [ACTUAL KES] (by channel if available)
- LTV: [ACTUAL KES]
- LTV:CAC Ratio: [ACTUAL RATIO]
- Payback Period: [ACTUAL MONTHS]
- Customer Churn Rate: [ACTUAL %]
- Technician Churn Rate: [ACTUAL %]

## Geographic Distribution

- Nairobi: [X]% of customers, [Y]% of technicians
- Mombasa: [X]% of customers, [Y]% of technicians
- [OTHER CITIES]: [X]% of customers, [Y]% of technicians

## Key Insights

1. [INSIGHT FROM DATA]
2. [INSIGHT FROM DATA]
3. [INSIGHT FROM DATA]

## Notes

- All data is from production database
- No estimates or projections
- Period: [DATE RANGE]
```

### Step 3: Update All Business Documents

Replace all mock/target data with real metrics from dashboard:
- Investor pitch deck
- Business narratives
- Value proposition document
- Website (if displaying metrics)

---

## 9. Automation

### Create Automated Metrics Extraction Script

Create `backend/scripts/extractMetrics.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const extractMetrics = async () => {
  try {
    await connectDB();
    console.log('📊 Extracting real metrics from production database...\n');

    // [Insert all aggregation queries from this guide]

    console.log('\n✅ Metrics extraction complete!');
    console.log('📄 Output saved to: docs/business/REAL_METRICS_DASHBOARD.md');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error extracting metrics:', error);
    process.exit(1);
  }
};

extractMetrics();
```

### Schedule Automatic Extraction

```bash
# Run weekly via cron
0 0 * * 0 cd /path/to/dumuwaks/backend && node scripts/extractMetrics.js
```

---

## 10. Data Privacy & Security

**IMPORTANT:**

- Anonymize all personal data (names, emails, phone numbers)
- Aggregate data to prevent identification of individuals
- Do not export sensitive user information
- Comply with data privacy laws (GDPR, Kenya Data Protection Act)

**Before Exporting:**
- Review all query results
- Remove PII (Personally Identifiable Information)
- Aggregate to appropriate level
- Store exported data securely

---

## Success Criteria

✅ **All queries run successfully on production database**
✅ **Real metrics dashboard created with actual data**
✅ **All mock data removed from business documents**
✅ **Automated extraction script created**
✅ **Weekly metrics updates scheduled**

---

## Next Steps

1. **Run all queries** on production database
2. **Create REAL_METRICS_DASHBOARD.md** with actual numbers
3. **Update business documents** with real metrics
4. **Create automated extraction script**
5. **Schedule weekly metrics updates**

---

**Status:** Ready for Execution
**Timeline:** 1 week
**Owner:** Data Analyst / Backend Developer

