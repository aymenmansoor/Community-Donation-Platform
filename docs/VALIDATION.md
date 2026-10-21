# ShareBloom validation record — 21 October 2026

All application tests below used real local MongoDB; browser scenarios used the real React/Express app. No public deployment occurred.

| Stage / check | Recorded result |
| --- | --- |
| Baseline | 6 backend tests and 4 frontend tests passed |
| Stage 1 security | 9 backend tests passed before advancing |
| Stage 2 authentication | 12 backend / 4 frontend tests passed before advancing |
| Stage 3 administration | 15 backend / 6 frontend tests and production build passed |
| Stage 4 branding/images | Frontend tests and build passed; two verified licensed photo listings added; six additional licensed, visually reviewed illustrations attached while preserving records |
| Final backend suite | 17 passed; 0 failed, skipped or cancelled |
| Final frontend suite | 10 passed across 3 suites; 0 failed or skipped |
| Production frontend build | Passed under Vite; React Router use-client directive notices remain (this is a client-only SPA) |
| Real desktop/mobile Chromium | 9 scenarios passed; no browser runtime exceptions |
| Genuine screenshots | 16 images, with capture manifest and SHA-256 verification |
| Backend dependency audit | 0 known vulnerabilities in the recorded production dependency audit |
| Frontend dependency audit | 0 known vulnerabilities after compatible remediation plus Vite/Vitest migration (recorded JSON summary below) |
| Updated Docker images | API/frontend images built with trusted CA and TLS verification |
| Authenticated Compose | MongoDB/API healthy; production frontend served on loopback only |
| Verified local HTTPS transport | Secure/HttpOnly cookies, session restore, CSRF denial, donation lifecycle and logout revocation passed |

The end-to-end run caught and corrected credentialed CORS configuration. It also exposed test-helper timing/selector assumptions, which were corrected before the final passing run. A failed attempt was not counted as a pass.

Photograph sourcing is complete: six Pexels illustrations fill previously empty fictional listing image fields. Source/derivative checksums and visual matching limitations are documented. Before/after comparison verified all other donation fields, requests and pre-existing upload bytes were unchanged; the second attachment run made no changes.

Compatible patches initially left 109 frontend audit entries. A subsequent focused migration to Vite/Vitest removed the retired build/test tree while preserving React screens, API behavior and all ten frontend test assertions. Tests, production build and nine real browser scenarios were rerun and passed with the new tooling. The final audit is clean, but that does not establish complete application security.

All new production modules are below 200 lines. Session/admin credentials and local TLS keys are outside the checkout. No genuine user records were deleted or migrated, no paid services were enabled, and there is no invented public URL. Local success does not establish fresh-cloud restoration or final public-host security.

Frontend final full dependency audit: `{"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}`.

Backend final full dependency audit: `{"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}`.
