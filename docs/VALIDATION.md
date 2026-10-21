# Validation record — 21 October 2026

Validated in the cloud workspace, using a real MongoDB 8.0.16 database, Node 24, React, Express and Chromium. No public deployment was performed.

| Check | Result |
| --- | --- |
| Locked installation, root/backend/frontend | Passed using `scripts/setup-local.sh` with services stopped |
| Local MongoDB ping and API database health | Passed |
| Backend integration tests | 6 passed, 0 failed, 0 skipped |
| Frontend Jest tests | 4 passed, 0 failed, 0 skipped |
| Production React build | Passed; existing Browserslist/deprecation notices remain |
| Real browser scenarios | 6 passed with real HTTP/database requests and no browser runtime exceptions |
| Screenshots | 9 captured; all SHA-256 hashes checked against `capture-manifest.json` |
| Fictional seed repeatability | Rerun preserved 3 accounts, 6 listings and 3 sample requests |
| Backend production dependency audit | 0 known vulnerabilities reported |
| Root production dependency audit (Axios) | 0 known vulnerabilities reported |
| Frontend dependency audit | 371 affected package entries remain; 6 critical, 127 high, 129 moderate, 109 low |
| Docker images | Backend and frontend built with TLS verification and a trusted proxy CA |
| Fresh authenticated Compose stack | MongoDB and API healthy; Nginx production frontend started on loopback only |
| Production container browser rehearsal | SPA routing, signup/login, donation creation, profile and database health passed |

React Scripts/Jest versions were not upgraded. The React Router/Jest issue was fixed using an explicit CommonJS export mapping and encoding globals. Compatible same-major dependency updates separately addressed known backend, Axios and React Router advisories. Remaining frontend audit findings require triage before launching publicly; a successful build or local browser check is not a clean security audit.

The screenshot script restores the stable fixture statuses after its checks and removes temporary browser test records. Fictional accounts use reserved `.test` email addresses and no real telephone numbers. Private generated values are held outside the checkout, not in screenshots or committed configuration.

The container rehearsal used a separate authenticated database volume; the local development database and fixture data were retained. The rehearsal's web binding was loopback only. No paid resources, public application, or real credentials were published.
