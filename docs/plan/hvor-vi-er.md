## Hvor vi er (MVP status)

Denne siden oppsummerer ståa for MVP-en per dags dato.

### Observability
- Sentry koblet på frontend og backend via DSN env-variabler.
- Breadcrumbs lagt til for viktige hendelser: chat/plan-endringer og Stripe-betalinger.

### Sikkerhet og stabilitet
- Auth på chat/actions/SSE og sentrale student-endepunkter.
- Per-bruker+IP raterestriksjoner på risikoutsatte ruter.
- Zod-validering på fritekst og muterende payloads (422 med gode feilmeldinger).
- Alle mutasjoner logger `ChangeEvent` med `actor`, `before`, `after`.

### Data og seed
- Seed-script oppretter demo-brukere, 14 dagers `ChangeEvent`-historikk, 3 poster (public/followers/subscribers) og ett aktivt abonnement.

### CI og tester
- Frontend GitHub Actions workflow (`.github/workflows/e2e.yml`): lint og Playwright smoke.
- Lokale smokes: FE→BE health, actions API, feed tabs, entitlement 403→200 (simulert), og Wallet create-session.
- Backend smokes via `scripts/smoke.js` og `scripts/burst.js` (auth, 422, rate limit).

### Docker Compose
- `docker-compose.yml` orkestrerer `mongo`, `backend` (3006) og `frontend` (3002) med env-plassholdere.
- Kjøring: `docker compose up -d --build`

### Frontend-Backend integrasjon
- Student Center viser `ChangeEvent`-liste og detaljer, med live oppdateringer.
- Wallet-side smoke-tester `POST /payments/create-session` og viser `clientSecret`.
- Feed har synlighetsmerke og “Report”; tabs (Feed/Following/Subscribed) aktive.

### Gjenstående arbeid før pilot
- Stripe: end-to-end verifisering mot ekte webhook (lokal simulering er på plass).
- Dokumentere nødvendige env-nøkler i README/plan:
  - FRONTEND: `NEXT_PUBLIC_BACKEND_ORIGIN`, `NEXT_PUBLIC_API_SERVER`, `NEXT_PUBLIC_SENTRY_DSN`
  - BACKEND: `MONGO_URI`, `SESSION_SECRET`, `FRONTEND_ORIGIN`, `SENTRY_DSN`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`


