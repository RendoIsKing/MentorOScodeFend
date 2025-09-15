# Testing

## Smoke tests (reliable)

Run the minimal, reliable e2e smoke layer:

```
cd frontend
npm run test:smoke
```

This runs:
- `tests/e2e/fe-be-health.spec.ts`
- `tests/e2e/actions-api.spec.ts`

## Full e2e (with quarantined UI tests)

To run all e2e tests (some UI tests are currently quarantined/`test.skip`):

```
cd frontend
npx playwright test
```

Quarantined specs (temporarily skipped while we add durable UI hooks):
- `tests/e2e/create-post-feed.spec.ts`
- `tests/e2e/upload-post.spec.ts`
- `tests/e2e/chat-action-snapshot.spec.ts`
- `tests/e2e/swap-exercise-updates.spec.ts`

Remove the `test.skip` lines at the top of those files to re-enable when ready.

## Stable UI hooks

We expose stable `data-test`/`data-testid` attributes to avoid brittle selectors:

Upload flow (/upload and /upload/compose):
- `[data-test="file-input"]` on the hidden `<input type="file">`
- `[data-test="go-compose"]` on the button that advances to compose (if present)
- `[data-test="post-submit"]` on the final publish/submit button

Student page:
- `[data-testid="nutrition-kcal"]` around the calories value (e.g. `2400 kcal`)
- `[data-testid="weight-last"]` around the latest logged weight (e.g. `81 kg`)
- `[data-testid="plan-summary"]` around the plan summary block

## Dev routes & actions alias

Backend exposes:
- `POST /api/backend/v1/dev/bootstrap`
- `POST /api/backend/v1/dev/login-as`
- `GET  /api/backend/v1/events`
- `POST /api/backend/v1/interaction/actions/apply`

Ensure `DEV_LOGIN_ENABLED=true` in backend for local testing.


