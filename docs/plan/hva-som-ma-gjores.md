## Hva som må gjøres (neste sprint(er))

### Kjerne
- Stripe: endelig E2E verifisering mot ekte webhook (ikke bare simulering), og UI-status etter kjøp.
- Utvide backend smokes ved behov (moderation-admin stub, posts visibility edge-cases).

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


