## Pilot Readiness Checklist

### Observability
- [ ] Sentry DSN satt i `.env.local` (FE) og `.env` (BE)
- [ ] Breadcrumbs for chat/actions/Stripe skjer i prod

### Auth og sikkerhet
- [ ] Auth på alle muterende ruter og SSE
- [ ] Per-bruker+IP rate-limit på utsatte ruter
- [ ] Zod-validering på fritekst og mutasjoner (422 ved feil)

### Data
- [ ] Seed-script kjørt lokalt, verifisert data (14 dager + poster + sub)

### Betaling og entitlement
- [ ] Stripe nøkkelnavn konfigurert (ikke verdier i repo)
- [ ] `POST /payments/create-session` fungerer og returnerer `clientSecret`
- [ ] Entitlement-gating blokkerer ikke-abonnenter (403) på beskyttede ruter

### Tester og CI
- [ ] Frontend lint og Playwright-smoke grønt lokalt og i CI
- [ ] Backend smoke kjører grønt lokalt

### Dev Experience
- [ ] `docker compose up -d --build` starter FE/BE/DB
- [ ] README/Docs oppdatert for lokal kjøring, seed og smoke

### Milestones (status)
- [x] Auth/Rate-limit/Zod/ChangeEvent pipeline
- [x] Student Center endringer (liste + detaljer) med live oppdatering
- [x] Feed: synlighetsmerke, tabs og Report
- [x] Wallet: create-session smoke
- [x] Entitlement-guard (`/feature/protected-check`); simulert flip 403→200
- [x] CI workflow aktiv (FE)
- [x] Docker Compose


