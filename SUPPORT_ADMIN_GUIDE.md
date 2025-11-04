# Support & Admin Dashboard Guide

## Overview

The EmEnTech platform now has fully functional role-specific dashboards for Support and Admin users. This guide shows you how to access and use these dashboards.

## Test Accounts

### Admin Account
```
Email: admin@baitech.com
Password: Admin@123
Role: Admin
```

**Features:**
- Platform overview and statistics
- User management metrics
- Booking and revenue analytics
- Support ticket monitoring
- Top technician leaderboard
- Platform health monitoring
- Quick action buttons

### Support Account
```
Email: support@baitech.com
Password: Support@123
Role: Support
```

**Features:**
- Support ticket queue
- Performance metrics
- Customer satisfaction ratings
- Response time tracking
- Ticket filtering (All, Open, In Progress, Resolved)
- Personal performance dashboard
- Shift schedule display

### Other Test Accounts

**Technician 1:**
```
Email: tech1@baitech.com
Password: Tech@123
Role: Technician
```

**Technician 2:**
```
Email: tech2@baitech.com
Password: Tech@123
Role: Technician
```

**Customer:**
```
Email: customer1@gmail.com
Password: Customer@123
Role: Customer
```

## How to Test

### 1. Seed the Database (if not already done)

```bash
cd backend
node src/scripts/seed.js
```

This will:
- Clear existing users
- Create 5 test users (admin, 2 technicians, customer, support)
- Display credentials in the terminal

### 2. Start the Application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Login and Test

1. **Test Admin Dashboard:**
   - Navigate to http://localhost:5173/login
   - Login with admin@baitech.com / Admin@123
   - You'll be redirected to /dashboard
   - Admin dashboard will automatically load

2. **Test Support Dashboard:**
   - Logout from admin account
   - Login with support@baitech.com / Support@123
   - You'll be redirected to /dashboard
   - Support dashboard will automatically load

3. **Test Regular Dashboard:**
   - Logout from support account
   - Login with customer1@gmail.com / Customer@123
   - You'll see the regular customer/technician dashboard

## Dashboard Features

### Admin Dashboard

#### Key Metrics
- **Total Users**: Shows platform user count with daily growth
- **Technicians**: Active technician count
- **Active Bookings**: Current ongoing bookings
- **Total Revenue**: Platform revenue with pending payouts

#### Platform Health
- System status (Healthy/Degraded/Down)
- Uptime percentage
- Average response time
- Error rate monitoring

#### Recent Activity
- Real-time feed of platform activities
- User registrations
- Booking completions
- Payment processing
- Support ticket resolutions

#### Top Technicians
- Leaderboard of best-performing technicians
- Booking counts
- Ratings
- Earnings

#### Quick Actions
- View All Users
- Manage Technicians
- View Reports
- System Settings

### Support Dashboard

#### Performance Metrics
- **Open Tickets**: Active support requests
- **Resolved Today**: Today's resolution count
- **Avg Response Time**: How quickly you respond
- **Satisfaction**: Customer satisfaction rating

#### Ticket Management
- Filter tickets by status (All, Open, In Progress, Resolved)
- Priority indicators (Low, Medium, High, Urgent)
- Customer information
- Category tags
- Time tracking

#### Personal Performance
- Tickets handled count
- Resolution rate (percentage)
- Customer satisfaction score
- Visual progress bars

#### Quick Actions
- View All Tickets
- Knowledge Base access
- View Reports
- Set availability status

#### Schedule Display
- Shift start/end times
- Break times
- Daily schedule overview

## Role-Based Access

The application automatically routes users to the appropriate dashboard based on their role:

```typescript
if (user.role === 'admin') {
  → AdminDashboard
}
else if (user.role === 'support') {
  → SupportDashboard
}
else {
  → Regular Dashboard (Customer/Technician)
}
```

## Color Coding

Each role has a distinct color scheme for easy identification:

- **Admin**: Purple theme with Shield icon
- **Support**: Cyan theme with MessageCircle icon
- **Technician**: Green theme with Wrench icon
- **Customer**: Blue theme with User icon

## Dark Mode Support

Both dashboards fully support dark mode:
- Automatic theme adaptation
- Proper contrast ratios
- Consistent visual hierarchy
- Toggle via theme switcher in navbar

## API Integration (Coming Soon)

Currently using mock data. Replace with actual API calls:

**Admin Dashboard:**
```typescript
// Replace mock stats with:
const { data } = await api.get('/admin/stats');
const { data: activity } = await api.get('/admin/activity');
const { data: technicians } = await api.get('/admin/top-technicians');
```

**Support Dashboard:**
```typescript
// Replace mock tickets with:
const { data: tickets } = await api.get('/support/tickets', { params: { filter } });
const { data: stats } = await api.get('/support/stats');
```

## Responsive Design

Both dashboards are fully responsive:
- **Mobile** (< 640px): Single column, stacked layout
- **Tablet** (640px - 1024px): Two column layout
- **Desktop** (> 1024px): Multi-column grid with sidebar

## Testing Checklist

- [ ] Admin can login and see admin dashboard
- [ ] Support can login and see support dashboard
- [ ] Customer sees regular dashboard
- [ ] Technician sees regular dashboard
- [ ] Admin dashboard shows all metrics
- [ ] Support dashboard shows ticket filters
- [ ] Dark mode works on both dashboards
- [ ] Responsive layout works on mobile
- [ ] Navigation between pages works
- [ ] Logout redirects correctly
- [ ] Role badges show correct colors
- [ ] Time range filters work (admin)
- [ ] Ticket filters work (support)

## Troubleshooting

### Users not created
```bash
# Re-run seed script
cd backend
node src/scripts/seed.js
```

### Dashboard not loading
- Check that user is authenticated
- Verify role is set correctly in database
- Check browser console for errors

### Wrong dashboard showing
- Clear browser cache
- Logout and login again
- Verify user role in database

## Next Steps

1. **Connect to real APIs**: Replace mock data with actual backend endpoints
2. **Add ticket actions**: Implement assign, resolve, close actions
3. **Build user management**: Add CRUD operations for admin
4. **Create reports**: Add analytics and reporting features
5. **Implement notifications**: Real-time updates for new tickets/activities
6. **Add filtering**: Advanced search and filter capabilities
7. **Build knowledge base**: Support article management

## Database Schema

### Admin User
```javascript
{
  role: 'admin',
  firstName: 'John',
  lastName: 'Admin',
  email: 'admin@baitech.com',
  // Standard user fields
}
```

### Support User
```javascript
{
  role: 'support',
  firstName: 'Jane',
  lastName: 'Support',
  email: 'support@baitech.com',
  supportInfo: {
    employeeId: 'SUP001',
    department: 'general',
    specializations: ['bookings', 'accounts', 'technical'],
    languages: ['English', 'Swahili'],
    availability: {
      status: 'available',
      maxConcurrentTickets: 5
    },
    stats: {
      ticketsHandled: 150,
      ticketsClosed: 142,
      averageResponseTime: 15,
      averageResolutionTime: 45,
      satisfactionRating: 4.8,
      ratingCount: 120
    },
    shiftSchedule: [...]
  }
}
```

---

**Last Updated**: 2025-11-02
**Version**: 1.0.0
**Status**: ✅ Fully Implemented
