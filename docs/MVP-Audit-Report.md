## MentorOS MVP Audit Report

### Status Table

| Item | Status |
|---|---|
| Core env, health, CORS, proxy | ✅ Pass |
| Dev login for tests | ✅ Pass |
| Pre-onboarding → Convert → StudentSnapshot | ✅ Pass |
| Student Center auto-refresh | ✅ Pass |
| Actions endpoint + safety rails + summaries | ✅ Pass |
| Upload flow (plural posts, returns `{ postId }`) | ✅ Pass |
| Mobile Home feed (TikTok-style) | ⚠️ Needs polish |
| Weight logging | ✅ Pass |
| Mongo indexes ensured on boot | ✅ Pass |
| Rate limiting + input validation | ⚠️ Needs polish (Zod missing) |
| Error boundaries & empty states | ⚠️ Needs polish |
| PWA basics | ✅ Pass |
| Playwright smokes present | ✅ Pass |
| CI workflow & Compose | ❌ Missing |

---

### Evidence and Notes

- Core env & bridge
  - Health: `backend/src/routes/health.ts:6` → `GET /api/backend/health` returns `{ ok: true }`
  - Mounted: `backend/src/server.ts:151` uses `healthRouter` under `/api/backend`
  - CORS with credentials and CSV origins + logging: `backend/src/server.ts:118-127`
  - Rate limit for backend: `backend/src/server.ts:138`
  - Frontend proxy rewrites: `frontend/next.config.js:65-70`

- Dev login for tests
  - Route mounted: `backend/src/server.ts:162` → `/api/backend/v1/dev/login-as`
  - Implementation: `backend/src/routes/dev/loginAs.ts:9-22` (POST) and `:25-40` (GET)

- Pre-onboarding → Convert → StudentSnapshot
  - Convert handler: `backend/src/routes/preonboarding/index.ts:114-148`
  - Creates `TrainingPlanVersion`, `NutritionPlanVersion`, upserts `StudentState`, creates `StudentSnapshot`, emits events

- Student Center auto-refresh
  - Event bus: `frontend/src/lib/snapshotBus.ts`
  - Emit on action success: `frontend/src/lib/api/actions.ts:29`
  - Student page subscribes: `frontend/src/app/(deskSidebar)/student/page.tsx:63`

- Actions endpoint + safety rails + summaries
  - Unified actions: `backend/src/routes/interaction.routes.ts:77-159`
  - Kcal rails 1200–5000: `:95-104`
  - 20% volume jump guard: `:117-127`
  - ChangeEvent summaries on mutations: `:135-137`, `:143-153`

- Upload flow
  - FE proxy route: `frontend/src/app/api/app-upload/route.ts:5-11,24-35`
  - BE plural posts route: `backend/src/routes/post.routes.ts:12-14`
  - Returns `{ postId }`: `backend/src/app/Controllers/Posts/Actions/createPost.action.ts:101-102`

- Mobile Home feed (TikTok-style)
  - Feed component: `frontend/src/components/shared/home-feed-carousel/index.tsx`
  - Infinite scroll via `react-window` and sentinel logic: `:131-167,139-149`
  - Right action rail overlay on mobile: `:499-513`
  - Needs polish: ensure strict 9:16 container and object-cover for perfect framing (currently responsive contain/fill). Caption gradient present at `:447`.

- Weight logging
  - Actions: `backend/src/routes/interaction.routes.ts:139-154`
  - Snapshot update pipeline: `backend/src/services/events/publish.ts`
  - FE emits refresh: `frontend/src/components/student/WeightInlineLogger.tsx:17`

- Mongo indexes ensured on boot
  - Boot call: `backend/src/server.ts:91`
  - Definitions: `backend/src/utils/ensureIndexes.ts`

- Rate limiting & input validation
  - express-rate-limit present: `backend/src/server.ts:138`
  - Zod missing for actions/upload payloads → recommend adding Zod guards (see Proposed Fixes)

- Error boundaries & fallbacks
  - Friendly empties exist in feed; global ErrorBoundary not present → recommend minimal boundary in app root

- PWA
  - Manifest: `frontend/public/manifest.webmanifest` (standalone, theme-color)
  - Head meta includes safe-area: `frontend/src/app/layout.tsx:57-63`

- Playwright smokes
  - Health: `frontend/tests/e2e/fe-be-health.spec.ts`
  - Actions rails: `frontend/tests/e2e/actions-rails.spec.ts`
  - Upload: `frontend/tests/e2e/upload-post.spec.ts`

- CI & Compose
  - No workflow or compose found → add minimal templates

---

### Autofixes Applied

1) Training plan save fallback required `notes` field

Diff:

```diff
backend/src/routes/interaction.routes.ts
@@
     sessions.push({
       day: 'Mon',
       focus: pickFocus[0],
       exercises: extractExercises(rawText),
      notes: [],
     });
```

2) Wallet page duplicated header

Diff:

```diff
frontend/src/components/wallet/index.tsx
@@
-import InnerPageHeader from "../shared/inner-page-header";
@@
-      <InnerPageHeader title="Wallet" showBackButton={false} />
```

---

### Proposed Patches (safe to apply)

1) Zod validation for actions apply

```diff
backend/src/routes/interaction.routes.ts
@@
import { z } from 'zod';
@@
const ActionSchema = z.object({
  type: z.enum(['PLAN_SWAP_EXERCISE','PLAN_SET_DAYS_PER_WEEK','NUTRITION_SET_CALORIES','WEIGHT_LOG','WEIGHT_DELETE']),
  payload: z.any().optional(),
  userId: z.string().optional(),
});
@@
    const { type, payload } = req.body || {};
    const parsed = ActionSchema.safeParse({ type, payload, userId });
    if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
```

2) Strict 9:16 media container and object-cover in mobile feed

```diff
frontend/src/components/shared/home-feed-carousel/index.tsx
@@ suggestion
Wrap the media container with `className="relative w-full aspect-[9/16] rounded-xl overflow-hidden"` and use `className="absolute inset-0 w-full h-full object-cover"` for both `<img>` and video.
```

3) Minimal ErrorBoundary wrapper

```diff
frontend/src/app/layout.tsx
@@ suggestion
Wrap `{postslot}{children}` in a simple ErrorBoundary component and render a friendly fallback on error.
```

4) Add CI workflow and Compose templates

Files to add (templates): `.github/workflows/e2e.yml`, `docker-compose.yml` with FE+BE+Mongo.

---

### MVP Go/No-Go

- Go with caveats: Core flows (convert → snapshot, actions with rails, upload, refresh, health/CORS, indexes, rate limit) are in place. Remaining polish items are visual strict 9:16 media container, Zod input validation, and adding CI/Compose. None block manual QA but are recommended before public demo.

What remains (ordered):
1. Add Zod guards for actions and upload endpoints.
2. Tighten mobile feed media container to strict 9:16 and object-cover.
3. Add minimal ErrorBoundary wrapper.
4. Add CI e2e workflow and docker-compose for staging.

---

### Pasteable Checklist (for PR)

```
[ ] Convert returns { snapshotId } + snapshot in Atlas
[ ] Actions: 800→422; 2800→200; summaries logged
[ ] Weight log refreshes Student instantly
[ ] Upload returns { postId } and post shows first
[ ] Mobile feed rail (≥44×44), caption gradient, sentinel ok
[ ] Rate limit + Zod guards
[ ] Indexes ensured
[ ] Playwright green locally
[ ] e2e workflow present
[ ] Compose up on staging (dev routes off)
```


