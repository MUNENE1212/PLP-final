# BaiTech Frontend

Modern React TypeScript frontend for the BaiTech platform - AI-Powered Technician & Community Platform.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/          # Layout components (Navbar, Footer, etc.)
│   │   └── ui/              # UI components (Button, Input, Card, etc.)
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Dashboard.tsx
│   ├── store/               # Redux store
│   │   ├── slices/          # Redux slices
│   │   └── index.ts         # Store configuration
│   ├── lib/                 # Utilities
│   │   ├── axios.ts         # Axios instance with interceptors
│   │   └── utils.ts         # Helper functions
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── config/              # Configuration
│   │   └── constants.ts     # App constants
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=BaiTech
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Lint code
npm run type-check       # Check TypeScript types
```

## 🎨 Features

### ✅ Implemented

- ✅ **Authentication System**
  - Login with email/password
  - Registration (Customer/Technician)
  - JWT token management
  - Protected routes
  - Auto-logout on token expiration

- ✅ **State Management**
  - Redux Toolkit setup
  - Auth slice with async thunks
  - Typed hooks (useAppDispatch, useAppSelector)
  - LocalStorage persistence

- ✅ **UI Components**
  - Button (multiple variants)
  - Input with error handling
  - Card components
  - Responsive Navbar
  - Layout system

- ✅ **Pages**
  - Home/Landing page
  - Login page
  - Register page
  - Dashboard (Customer/Technician)

- ✅ **API Integration**
  - Axios instance with interceptors
  - Automatic token injection
  - Error handling
  - Request/Response logging

- ✅ **Styling**
  - Tailwind CSS
  - Custom theme colors
  - Responsive design
  - Dark mode ready

### 🚧 To Be Implemented

- [ ] Booking System
- [ ] Technician Search & Matching
- [ ] Real-time Messaging (Socket.IO)
- [ ] Profile Management
- [ ] Review System
- [ ] Payment Integration
- [ ] Notifications
- [ ] File Upload (Images/Videos)
- [ ] Maps Integration (Google Maps)

## 🔐 Authentication Flow

1. **Login**
   - User enters email and password
   - Redux action dispatches login thunk
   - Token stored in localStorage
   - User redirected to dashboard

2. **Protected Routes**
   - ProtectedRoute component checks authentication
   - Redirects to login if not authenticated
   - Allows role-based access control

3. **Token Management**
   - Axios interceptor adds token to requests
   - Auto-logout on 401 responses
   - Refresh token support (to be implemented)

## 🎯 Key Components

### Button

```tsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
Sizes: `sm`, `md`, `lg`

### Input

```tsx
import Input from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  error="Invalid email"
  helperText="Enter your email address"
/>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## 🔗 API Integration

The app uses Axios with interceptors for API calls:

```typescript
import axios from '@/lib/axios';

// GET request
const response = await axios.get('/users');

// POST request
const response = await axios.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

Interceptors automatically:
- Add Authorization header with JWT token
- Handle errors globally
- Show toast notifications
- Redirect to login on 401

## 🎨 Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Custom Colors

Primary color palette defined in `tailwind.config.js`:

```css
primary-50 to primary-900
secondary-50 to secondary-900
```

## 📱 Responsive Design

All components are mobile-first responsive:

```tsx
// Mobile (default) -> Tablet (md) -> Desktop (lg)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

## 🔍 TypeScript

The project uses strict TypeScript:

- All components are typed
- Redux state is fully typed
- API responses are typed
- Form data is validated with Zod

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Environment Variables

Make sure to set production environment variables:

```bash
VITE_API_URL=https://api.baitech.com/api/v1
VITE_SOCKET_URL=https://api.baitech.com
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see backend LICENSE file

---

**Made with ❤️ by the BaiTech Team**
