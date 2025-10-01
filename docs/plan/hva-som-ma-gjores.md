## Hva som må gjøres (neste sprint(er))

### Kjerne
- Ferdigstille synlighetsmerke og rapporterings-aksjon i feeden; koble `POST /post/:id/report` og per-user+IP limit.
- Legge til E2E smoke-flow: Stripe subscribe → entitlement-gating på beskyttede ruter.
- Utvide smoke-skript for backend med flere scenarier (moderation, posts visibility).

### Observability
- Sentry performance-spans for nøkkelruter (chat, actions, payments, feed-load).
- Flere breadcrumbs rundt SSE-tilkobling og snapshot-refresh.

### Data og migrasjoner
- Eventuell migrering/normalisering av historiske `ChangeLog` → `ChangeEvent` hvis aktuelt.
- Flere seed-varianter (fler brukere, følger/abonnent-relasjoner, volum av poster).

### CI/CD
- Cache-optimalisering i GitHub Actions.
- Kjør backend smoke som egen jobb og last opp rapporter som artefakter.

### DX
- Makefile/npx-skript for vanlige oppgaver (dev, seed, smoke, burst).
- Enkle `.http`-filer eller REST Client samling for lokale kall.

### QA og sikkerhet
- Negative tester for Zod-validering og rate limiting.
- Sikkerhetsreview av dev-only-ruter og cookie-flagg.


