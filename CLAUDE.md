# CLAUDE.md

## Build & Run

### Backend (`cd backend`) — Node.js/Express, CommonJS
```
npm run dev          # nodemon, port 5000
npm test             # jest --detectOpenHandles
npx jest -- <file>   # single test
npm run seed:pricing # seed pricing data
npm run seed         # seed general data
npm run indexes      # create DB indexes
```

### Frontend (`cd frontend`) — React 18 + TypeScript + Vite
```
npm run dev          # Vite, port 5173
npm run build        # tsc + vite build
npm run type-check   # tsc --noEmit
npm run lint
npm test             # vitest run
npx vitest run <path>  # single test
```

### SEO (`cd seo`) — Next.js 14
```
npm run dev          # port 3000
npm run build && npm start
```

## Architecture

Monorepo: `backend/` + `frontend/` + `seo/`

### Backend

**Request flow:** Request → Global middleware (helmet, cors, compression, mongoSanitize, rateLimit) → Route → Route-level middleware (protect, authorize, validation) → Controller → Service → Model → Response

**API:** All routes at `/api/v1/`. Health check at `/health`.

**Response format:** `{ success, message, data? }`. Lists add `{ count, total, page, pages }`. Validation errors: `{ errors: [{ field, message, value }] }`.

**Auth chain** (`middleware/auth.js`):
- `protect` — JWT from `Authorization: Bearer <token>`, sets `req.user`
- `authorize(...roles)` — roles: `customer`, `technician`, `corporate`, `support`, `admin`
- `optionalAuth` — sets user if token present, doesn't require it

**Route pattern:**
```javascript
router.post('/path', protect, authorize('customer'), [body('field').notEmpty(), validate], controllerFn);
```

**Controllers** split by feature concern — e.g., booking: `booking.base`, `booking.status`, `booking.completion`, `booking.payment`, `booking.offer`, `booking.misc`.

**Service layer** (`services/`) handles business logic. Controllers call services, not models directly.

**Booking FSM:** `pending → matching → assigned → accepted → en_route → arrived → in_progress → paused → completed → verified → payment_pending → paid`. Also: `disputed`, `refunded`, `cancelled`.

**Fees** (`config/fees.js`): Platform 7.5%, VAT 16%, tiered cancellation (0-75%), escrow auto-release 3 days, dispute hold 7 days.

### Frontend

**State:** Redux Toolkit, 16 slices in `store/slices/`. Typed hooks: `useAppDispatch`, `useAppSelector`. Auth hydrated from localStorage (`dumuwaks_` prefix).

**API layer:** Shared axios instance (`lib/axios.ts`) with interceptors for auth token injection and 401 handling. Services → Redux thunks.

**Path alias:** `@/*` → `./src/*`

**Components:** Feature-based: `booking/`, `bookings/`, `admin/`, `matching/`, `payment/`, `profile/`, `social/`, `ui/` (atoms), `common/` (utilities).

**Design system:** Dark-only. CSS tokens in `styles/tokens.css` (mahogany, charcoal, circuit-blue, wrench-purple, soft-bone, steel-grey). Glassmorphism + LED glow. Tailwind for layout.

**Testing:** Vitest + RTL. `test/setup.tsx` provides `renderWithProviders()`, mock factories, mocks for localStorage/axios/socket.io.

**Real-time:** Socket.IO via `useSocket()` hook.

### SEO

Dynamic rendering: Nginx routes bots to Next.js SSR, regular users to React SPA. Generates `robots.txt`, `sitemap.xml`. JSON-LD structured data.

## Conventions

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`)
- **Branches:** `feature/*`, `bugfix/*`, `hotfix/*`
- **Main branch:** `master` — push triggers auto-deploy via `.github/workflows/deploy-vps.yml`
