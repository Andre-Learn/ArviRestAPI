# ZFloryn API v2.0 — Upgrade Notes

## What's New

### 🌐 New Frontend Pages
- **`/`** — Redesigned premium landing page (dark mode, glassmorphism, gradient accents)
- **`/pricing`** — Full pricing page with plan comparison table and FAQ
- **`/login`** — Auth login page
- **`/register`** — Auth register page  
- **`/dashboard`** — User dashboard (API key, usage, plan info)
- **`/docs`** — Completely rebuilt documentation with sidebar, search, Try It buttons
- **`/404`** — New 404 page

### 🔑 Authentication System (NEW)
- `POST /auth/register` — Register with username, email, password
- `POST /auth/login` — Login, returns session token
- `POST /auth/logout` — Logout
- `GET /auth/me` — Get current user info (requires Bearer token)
- `POST /auth/regenerate-key` — Regenerate API key (requires Bearer token)

### ⚙️ Backend Additions (src/)
| File | Description |
|------|-------------|
| `src/auth.ts` | User storage, API key management, session handling |
| `src/authRoutes.ts` | Auth API route handlers |
| `src/middleware.ts` | API key validation + rate limiting + plan delay |
| `src/users.json` | Auto-created on first run — user accounts |
| `src/usage.json` | Auto-created on first run — daily usage tracking |

### 🎨 Shared Assets (public/)
| File | Description |
|------|-------------|
| `public/platform.css` | Shared CSS for all new pages |
| `public/platform.js` | Shared JS (auth helpers, theme toggle, toast) |

## Plan Limits

| Plan    | Requests/day | Delay  | Price     |
|---------|-------------|--------|-----------|
| Free    | 500         | 5s     | Gratis    |
| Basic   | 1,500       | 4s     | Rp10.000  |
| Pro     | 3,500       | 3s     | Rp15.000  |
| Premium | 5,000       | 2s     | Rp25.000  |

## Unchanged Files
- All `/router/**` files — completely untouched
- `src/autoload.ts` — untouched  
- `src/chat.ts` — untouched
- `src/response.ts` — untouched
- `src/config.json` — untouched
- All existing API endpoints — preserved exactly

## Setup
```bash
npm run dev          # Development with ts-node
npm run build        # Compile TypeScript
npm start            # Run compiled JS
```

## Upgrade Admin's Plan
To manually set a user's plan, edit `src/users.json` and change `"plan"` to `"basic"`, `"pro"`, or `"premium"`, and set `"expiredAt"` to an ISO date string.
