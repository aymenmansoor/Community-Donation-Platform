# Validation and demo fixtures

Use Node 24, npm 11, MongoDB 8, and Chromium. Install locked dependencies with `npm ci` in the root, backend and frontend. Start MongoDB and the two application services as described in the README.

```bash
npm test --prefix backend
CI=true npm test --prefix frontend -- --watchAll=false --runInBand
CI=true npm run build --prefix frontend
```

The backend's Node test runner creates a unique `community_test_*` database on local MongoDB, runs six integration tests, and removes only that database and its temporary uploads. It covers health/CORS, signup/login, ownership/role enforcement, upload validation, request identity/privacy, approvals/rejections and deletion. Tests need a real database and fail without it.

The four frontend tests use the existing React Scripts/Jest runner. `moduleNameMapper` resolves React Router 7's existing CommonJS exports for Jest 27, and `setupTests.js` supplies TextEncoder/TextDecoder. The compatibility fix needs no React Router or Jest upgrade. A separate same-major React Router security update was applied after auditing the dependencies; Jest/React Scripts remain unchanged. Tests assert current app behavior instead of the obsolete Create React App welcome text.

## Fictional seed data

Set a private `DEMO_PASSWORD` of 12–72 bytes, plus `MONGO_URI`, then run:

```bash
node --env-file=/absolute/private/backend.env --env-file=/absolute/private/demo.env backend/scripts/seed-demo.js
```

The script creates Mira Willow (`mira.donor@example.test`), Rowan Vale (`rowan.requester@example.test`), and Ellis Fern (`ellis.requester@example.test`), six realistic listings, and three requests (Pending, Approved, Rejected). Names and scenarios are fictional; the reserved `.test` addresses do not send mail. Contact details are intentionally not shared. Existing records and passwords are preserved on repeated runs. The password is supplied privately and is never committed or displayed in screenshots.

## Real browser checks and screenshots

With the seeded local services running and Chromium installed:

```bash
node --env-file=/absolute/private/backend.env --env-file=/absolute/private/demo.env scripts/browser-smoke.cjs
```

The script uses the pinned Playwright development dependency and the system Chromium executable (`CHROMIUM_PATH` can override `/usr/bin/chromium`). It performs six browser scenarios without mocking API responses: registration, donor login/home, donation posting, profile/deletion, requester browsing/submission/history, and donor status management observed in the requester session. Temporary fixtures are removed afterward; the seeded request's status is restored to Pending.

It writes nine genuine full-page screenshots to `docs/screenshots/`, along with a capture manifest recording the browser, viewport, checks and SHA-256 hashes. Screenshots show the running React app, not HTML mockups or composed illustrations. Listing cards without uploaded photos display the application's normal local fallback image. No password or token is displayed.

The script is intended for the dedicated fictional demo database. Do not run it against real user data or a public deployment without adapting the fixture lifecycle.
