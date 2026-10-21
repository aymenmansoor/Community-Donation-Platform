# ShareBloom tests and fictional fixtures

Use Node 24, npm 11, MongoDB 8 and Chromium. Install the frozen lockfiles in the root, backend and frontend. Stop only services you started before refreshing node_modules; `scripts/setup-local.sh` is the tested cloud setup entry point.

```bash
npm test --prefix backend
npm test --prefix frontend
npm run build --prefix frontend
```

The backend runner uses a unique local `community_test_*` database and temporary upload directory, then removes only those resources. Its 18 tests exercise real MongoDB, authentication, expired/invalid JWTs, cookie restoration/revocation/CSRF, RBAC, ownership, suspension, admin provisioning/permissions, reversible moderation/audits, upload decoding and limits, injection rejection, throttling and production configuration. No tests are skipped.

The ten frontend tests cover registration/login navigation, donor routes/forms, status changes, request histories, forged client roles, expired sessions, admin statistics/search/suspension, image previews and invalid image choices. The original test assertions now run with Vitest/jsdom. Vite/Vitest replaced the retired React Scripts/Jest dependency tree after compatible patches alone left 109 audit findings. React screens/API contracts remain unchanged; current React Router exports resolve natively. No assertions were removed or disabled.

## Fictional data and initial Admin

Set private `MONGO_URI` and `DEMO_PASSWORD` (12–72 bytes) outside the checkout:

```bash
node --env-file=/absolute/private/backend.env --env-file=/absolute/private/demo.env backend/scripts/seed-demo.js
node --env-file=/absolute/private/backend.env backend/scripts/seed-photos.js
node --env-file=/absolute/private/backend.env backend/scripts/attach-demo-photos.js
```

Three original fixture accounts are Mira Willow (`mira.donor@example.test`), Rowan Vale (`rowan.requester@example.test`) and Ellis Fern (`ellis.requester@example.test`). The original six listings and Pending/Approved/Rejected requests are preserved. Two additional fictional listings use correctly matched, verified CC0/public-domain photographs: a cup/saucer and a wall clock. Existing genuine uploads and populated image fields are never replaced. The six original items now have visually reviewed Pexels illustrations; see [attribution](../backend/fixtures/photos/ATTRIBUTION.md) for provenance and matching limitations.

Both seeds require explicit `ALLOW_DEMO_SEED=true` for non-local databases; do not use that override on real data. Reruns preserve existing records/passwords. No real email or phone details are used, and nothing sends mail.

For the first Admin only, use private `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` and `MONGO_URI`:

```bash
node --env-file=/absolute/private/backend.env --env-file=/absolute/private/admin.env backend/scripts/provision-admin.js
```

The local fictional admin is Sage Linden. There is no hardcoded password. Provisioning refuses a second bootstrap or existing-email promotion. The command is for a single controlled execution; production administrative recovery requires a separate authorized operation.

## Real Chromium flow and screenshots

Start the API and React services, seed the fictional database and provision its fictional Admin, then run:

```bash
node --env-file=/absolute/private/backend.env \
  --env-file=/absolute/private/demo.env \
  --env-file=/absolute/private/admin.env scripts/browser-smoke.cjs
```

The script uses pinned Playwright with `/usr/bin/chromium` (`CHROMIUM_PATH` can override it). Nine scenarios perform real registration, cookie login, photo preview/upload, profile/deletion, requester browsing/submission/history, donor decisions, admin search/suspension/reactivation/moderation/audit, mobile layout checks, server logout and protected-route rejection. No API responses are mocked.

Sixteen genuine images and a SHA-256 capture manifest are saved under `docs/screenshots/`. The browser checks use temporary fictional records, then restore the stable sample request status and remove their temporary account/listing/request. Audit events are retained. These scripts are for the dedicated fictional demo database, not real user data. Do not run them against public services without adapting the fixture lifecycle.

## Production transport rehearsal

See [deployment preparation](DEPLOYMENT.md) for the verified local TLS rehearsal. `scripts/production-smoke.cjs` tests the authenticated Compose configuration with a trusted local test certificate and leaves the key outside the checkout. The final public provider/domain, browser TLS configuration, abuse controls and backup recovery remain untested until approved hosting exists.

## Portfolio photo verification — 21 October 2026

18 backend tests passed against real MongoDB, including an isolated photo attachment test that preserves existing image bytes, IDs, donation metadata and request records; reruns are idempotent and ambiguous targets fail before writes. The live fixture before/after comparison found exactly six image-field changes and no other donation, request or prior upload-byte changes. Ten frontend tests, the production build and nine real Chromium scenarios passed. Sixteen screenshots were recaptured and their hashes refreshed. Both dependency audits reported zero known vulnerabilities. The build emitted non-failing React Router `use client` bundling warnings. No dependencies or UI flows changed in this follow-up.
