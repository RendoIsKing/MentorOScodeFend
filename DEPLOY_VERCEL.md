# Deploying Frontend to Vercel

This is a Next.js app. Backend calls must use absolute URLs from env.

## Environment variables (names only)
- `NEXT_PUBLIC_API_SERVER` (e.g. `https://<railway-app>.up.railway.app/api/backend`)
- `NEXT_PUBLIC_DOMAIN` (optional)
- `NEXT_PUBLIC_SENTRY_DSN` (optional)
- `NEXT_PUBLIC_STRIPE_KEY` (if used)

## Images & rewrites
- `next.config.js` includes `images.remotePatterns` allowing your backend host and `localhost:3006`.
- Dev rewrites map `/api/backend/*` → `http://localhost:3006/api/backend/*`.

## Build & start (local prod)
- `npm ci && npm run build && npm run start`
- Set `NEXT_PUBLIC_API_SERVER=http://localhost:3006`

## Checks
- Calls use `NEXT_PUBLIC_API_SERVER` (no hard-coded localhost)
- SSE client uses `NEXT_PUBLIC_API_SERVER` and `withCredentials` where needed
- Image hosts include your Railway domain
