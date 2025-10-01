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
- Frontend GitHub Actions workflow (`.github/workflows/e2e.yml`): lint, enhetstester (n/a) og Playwright smoke.
- Playwright-smoke kjører grønt lokalt (2/2 passer).
- Backend smoke-script verifiserer auth, 422-validering og rate limit (lokalt).

### Docker Compose
- `docker-compose.yml` orkestrerer `mongo`, `backend` (3006) og `frontend` (3002) med env-plassholdere.
- Kjøring: `docker compose up -d --build`

### Frontend-Backend integrasjon
- Student Center viser `ChangeEvent`-liste og detaljer, med live oppdateringer.
- Wallet-side kan smoke-teste `POST /payments/create-session` og viser `clientSecret`.

### Gjenstående arbeid før pilot
- Fullfør synlighetsmerke og "Report" i feeden, koble mot backend.
- E2E-røyk for Stripe subscribe → entitlement gating flow.
- Oppdatere dokumentasjon og sjekklister (denne statusen, hva som gjenstår, pilot-sjekkliste).


