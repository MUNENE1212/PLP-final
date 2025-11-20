# 🎨 Dumu Waks Frontend

<div align="center">
  <img src="./public/images/logo-full.png" alt="Dumu Waks Logo" width="150"/>
  <br/>
  <br/>
</div>

Modern React TypeScript frontend for **Dumu Waks** - Professional Maintenance & Repair Services Platform connecting skilled technicians with customers across Kenya.

## 🚀 Tech Stack

- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool & dev server
- **Redux Toolkit** - State management with async thunks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/          # Layout components (Navbar, Footer)
│   │   ├── ui/              # UI primitives (Button, Input, Card)
│   │   ├── common/          # Shared components (LoadingScreen)
│   │   └── bookings/        # Feature-specific components
│   ├── pages/               # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   └── BookingDetail.tsx
│   ├── store/               # Redux store
│   │   ├── slices/          # Redux slices (auth, bookings, etc.)
│   │   ├── hooks.ts         # Typed Redux hooks
│   │   └── index.ts         # Store configuration
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios instance
│   │   └── geocoding.service.ts
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── config/              # App configuration
│   │   └── constants.ts     # App constants
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
│   ├── images/              # Logo variants (PNG)
│   │   ├── logo-full.png
│   │   ├── logo-medium.png
│   │   ├── logo-small.png
│   │   ├── logo-loading.png
│   │   └── logo-square.png
│   ├── favicons/            # Favicons for all devices
│   ├── favicon.ico
│   └── site.webmanifest     # PWA manifest
├── index.html               # HTML template with meta tags
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── process-logo.sh          # Logo processing script
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
# Create .env file (or use existing)
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Dumu Waks
VITE_APP_DESCRIPTION=Professional Maintenance & Repair Services Platform
EOF
```

3. **Process logo assets** (if needed)
```bash
# Install ImageMagick first
sudo apt-get install imagemagick potrace  # Ubuntu/Debian
# brew install imagemagick potrace  # macOS

# Process logo
./process-logo.sh
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload (port 3000)
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Lint code with ESLint
npm run type-check       # Check TypeScript types
```

## 🎨 Features

### ✅ Fully Implemented

- ✅ **Rebranded to Dumu Waks**
  - New logo with transparent PNGs
  - Comprehensive favicon set
  - PWA-ready with manifest
  - Dark mode support

- ✅ **Authentication System**
  - Login with email/password
  - Registration (Customer/Technician/Corporate)
  - JWT token management with refresh tokens
  - Protected routes with role-based access
  - Auto-logout on token expiration

- ✅ **Booking System**
  - Create bookings with service details
  - Upload photos for problem description
  - Real-time booking status tracking
  - Booking history and management
  - Counter offer handling
  - Job completion workflow

- ✅ **Payment Integration**
  - M-Pesa STK Push integration
  - Booking fee (20%) payment
  - Completion payment collection
  - Payment history tracking
  - Transaction status monitoring

- ✅ **State Management**
  - Redux Toolkit with typed hooks
  - Auth, bookings, notifications slices
  - LocalStorage persistence
  - Optimistic updates

- ✅ **UI Components**
  - Button (multiple variants: primary, secondary, outline, ghost, danger)
  - Input with validation and error handling
  - Card components with variants
  - Responsive Navbar with user menu
  - Footer with links
  - LoadingScreen with branded logo
  - Theme toggle (light/dark mode)

- ✅ **API Integration**
  - Axios instance with interceptors
  - Automatic token injection
  - Global error handling
  - Request/Response logging
  - Toast notifications

- ✅ **Responsive Design**
  - Mobile-first approach
  - Tablet and desktop optimized
  - Touch-friendly interactions
  - Accessible components

### 🚧 In Progress / Planned

- [ ] Real-time Messaging (Socket.IO integration started)
- [ ] Advanced search and filters
- [ ] Technician matching preferences UI
- [ ] Maps integration (Google Maps/Mapbox)
- [ ] Push notifications
- [ ] Service worker for offline support
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)

## 🔐 Authentication Flow

1. **Login**
   - User enters email and password
   - Redux thunk dispatches login action
   - Token stored in localStorage
   - User redirected based on role (customer/technician/admin)

2. **Protected Routes**
   - ProtectedRoute HOC checks authentication
   - Redirects to /login if not authenticated
   - Role-based access control (RBAC)
   - Automatic token refresh

3. **Token Management**
   - Axios interceptor adds Bearer token to requests
   - Auto-logout on 401 responses
   - Refresh token rotation
   - Secure token storage

## 🎯 Key Components

### Button
```tsx
import Button from '@/components/ui/Button';

<Button
  variant="primary"
  size="md"
  isLoading={false}
  onClick={() => console.log('clicked')}
>
  Click Me
</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `sm`, `md`, `lg`

### Input
```tsx
import Input from '@/components/ui/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email?.message}
  helperText="We'll never share your email"
  {...register('email')}
/>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Booking Details</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### LoadingScreen
```tsx
import LoadingScreen from '@/components/common/LoadingScreen';

<LoadingScreen
  message="Loading your bookings..."
  fullScreen={true}
/>
```

## 🔗 API Integration

The app uses Axios with interceptors for all API calls:

```typescript
import { api } from '@/services/api';

// GET request
const bookings = await api.get('/bookings');

// POST request
const booking = await api.post('/bookings', {
  serviceType: 'Plumbing',
  description: 'Leaking pipe in kitchen'
});

// File upload
const formData = new FormData();
formData.append('image', file);
await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Interceptors automatically:**
- Add Authorization header with JWT token
- Handle network errors globally
- Show toast notifications for errors
- Redirect to login on 401
- Retry failed requests with refresh token

## 🎨 Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes for consistent styling:

```tsx
<div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Welcome to Dumu Waks
  </h1>
</div>
```

### Custom Colors

Primary color palette defined in `tailwind.config.js`:

```css
/* Primary (Blue) */
primary-50 to primary-900

/* Success (Green) */
success-50 to success-900

/* Danger (Red) */
danger-50 to danger-900

/* Warning (Yellow) */
warning-50 to warning-900
```

### Dark Mode

All components support dark mode:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

## 📱 Responsive Design

Mobile-first responsive breakpoints:

```tsx
// Mobile (default) -> Tablet (md:768px) -> Desktop (lg:1024px) -> Wide (xl:1280px)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

## 🔍 TypeScript

Strict TypeScript configuration:

- All components are fully typed
- Redux state is fully typed with RootState
- API responses use defined interfaces
- Form data validated with Zod schemas
- No `any` types allowed

```typescript
// Type definitions
interface Booking {
  _id: string;
  serviceType: string;
  status: BookingStatus;
  customer: User;
  technician?: User;
  pricing: PricingDetails;
}

type BookingStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Environment Variables (Production)

```bash
VITE_API_URL=https://api.dumuwaks.com/api/v1
VITE_SOCKET_URL=https://api.dumuwaks.com
VITE_APP_NAME=Dumu Waks
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy dist/ folder
netlify deploy --prod --dir=dist
```

### Deploy to Render (with Backend)

Connected automatically via `render.yaml` in root directory.

## 🎨 Logo Assets

All logo assets are transparent PNGs optimized for web:

- **logo-small.png** (120x120) - Navbar
- **logo-medium.png** (200x200) - Footer, general use
- **logo-full.png** (500x500) - Hero sections
- **logo-loading.png** (300x300) - Loading screens
- **logo-square.png** (512x512) - Social media, PWA icon

**Process new logos:**
```bash
./process-logo.sh
```

See [REBRANDING.md](../REBRANDING.md) for full branding guidelines.

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Make your changes
3. Test thoroughly (TypeScript checks + visual testing)
4. Update documentation if needed
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file

---

<div align="center">
  <p><strong>Built with ❤️ in Kenya</strong></p>
  <p>Dumu Waks - Connecting Skilled Technicians with Customers</p>
  <img src="./public/images/logo-medium.png" alt="Dumu Waks" width="80"/>
</div>
