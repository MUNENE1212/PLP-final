# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

### Frontend (`cd frontend`)
- Dev server: `npm run dev` (Vite, port 5173)
- Build: `npm run build` (tsc + vite build)
- Type check: `npm run type-check` (tsc --noEmit)
- Lint: `npm run lint`
- Tests: `npm test` (vitest run)
- Single test: `npx vitest run src/components/ui/Card.test.tsx`
- Test watch: `npm run test:watch`
- Test coverage: `npm run test:coverage` (thresholds: 80% lines, 75% functions, 70% branches)

### Backend (`cd backend`)
- Dev server: `npm run dev` (nodemon, port 5000)
- Start: `npm start`
- Tests: `npm test` (jest --detectOpenHandles)
- Single test: `npx jest -- booking.test.js`
- Test coverage: `npm run test:coverage`
- Seed pricing data: `npm run seed:pricing`
- Seed general data: `npm run seed`
- Create DB indexes: `npm run indexes`

## Architecture

### Backend (Node.js/Express, CommonJS)

**Request flow:** Request → Global middleware (helmet, cors, compression, mongoSanitize, rateLimit) → Route → Route-level middleware (protect, authorize, validation) → Controller → Service → Model → Response

**API prefix:** All routes at `/api/v1/`. Health check also at `/health`.

**Response format:** All endpoints return `{ success: boolean, message: string, data?: any }`. List endpoints add `{ count, total, page, pages }`. Validation errors return `{ errors: [{ field, message, value }] }`.

**Auth middleware chain** (`backend/src/middleware/auth.js`):
- `protect` — verifies JWT from `Authorization: Bearer <token>`, sets `req.user`
- `authorize(...roles)` — role-based access (`customer`, `technician`, `corporate`, `support`, `admin`)
- `optionalAuth` — sets user if token present, doesn't require it

**Route middleware pattern:**
```javascript
router.post('/path', protect, authorize('customer'), [body('field').notEmpty(), validate], controllerFn);
```

**Controllers are split by feature concern** — e.g., booking has 6 controllers: `booking.base.controller.js`, `booking.status.controller.js`, `booking.completion.controller.js`, `booking.payment.controller.js`, `booking.offer.controller.js`, `booking.misc.controller.js`.

**Service layer** (`backend/src/services/`) handles business logic. Controllers call services, not models directly. Key services: `pricing.service.js` (multi-factor price calculation), `escrow.service.js` (payment holding), `mpesa.service.js` (Safaricom integration).

**Fee configuration** (`backend/src/config/fees.js`): Platform fee 7.5%, 16% VAT, tiered cancellation fees (0-75% based on time before booking), auto-release after 3 days, dispute hold 7 days.

**Booking status FSM:** `pending → matching → assigned → accepted → en_route → arrived → in_progress → paused → completed → verified → payment_pending → paid`. Can also reach `disputed`, `refunded`, `cancelled` states.

### Frontend (React 18 + TypeScript + Vite)

**Routing:** React Router v6 in `App.tsx`. Public routes (home, auth) and protected routes wrapped in `<ProtectedRoute>`. Admin routes nested under `/admin/*`.

**State:** Redux Toolkit with 16 slices in `frontend/src/store/slices/`. Typed hooks in `store/hooks.ts` (`useAppDispatch`, `useAppSelector`). Auth state hydrated from localStorage on load (keys prefixed `dumuwaks_`).

**API layer:** Shared axios instance at `frontend/src/lib/axios.ts` with request interceptor (injects bearer token) and response interceptor (handles 401 → clear tokens + redirect to login, shows toast for errors). Services in `frontend/src/services/` call this instance; Redux thunks call services.

**Path alias:** `@/*` maps to `./src/*` in imports.

**Components:** Feature-based organization under `frontend/src/components/` — `booking/`, `bookings/`, `admin/`, `matching/`, `payment/`, `profile/`, `social/`, `ui/` (shared atoms), `common/` (shared utilities).

**Design system:** Dark-only theme. CSS custom properties in `frontend/src/styles/tokens.css` define 6 color scales (mahogany, charcoal, circuit-blue, wrench-purple, soft-bone, steel-grey). Glassmorphism utilities (`.glass`, `.glass-card`), LED glow effects. Tailwind CSS for layout.

**Testing:** Vitest + React Testing Library. Test setup at `frontend/src/test/setup.tsx` provides `renderWithProviders()` (wraps Redux + Router), mock factories (`createMockUser()`, `createMockBooking()`), and mocks for localStorage, axios, socket.io.

**Real-time:** Socket.IO via `useSocket()` hook — connects when authenticated, handles messaging events (new_message, delivery/read receipts).

## Git & Deployment
- Main branch: `master` — push triggers auto-deploy to VPS via `.github/workflows/deploy-vps.yml`
- Feature branches: `feature/*`, `bugfix/*`, `hotfix/*`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`)
- Production: https://dumuwaks.ementech.co.ke (frontend), https://api.ementech.co.ke (API)
- VPS: PM2 cluster mode (2 instances), Nginx reverse proxy, Let's Encrypt SSL
