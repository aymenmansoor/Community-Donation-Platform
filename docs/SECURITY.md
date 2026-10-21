# ShareBloom security design and limits

This is a security-hardening implementation with automated verification, not a guarantee against all vulnerabilities. Do not launch publicly until the remaining dependency, hosting and abuse-control work has been reviewed.

## Authentication

Passwords are bcrypt hashes at cost 12. Registration requires 12 characters minimum and at most 72 UTF-8 bytes, a valid email, a bounded name and an allowed public role. Emails are normalized and uniquely indexed. Duplicate registration gets the same successful status/message as a new registration; missing and suspended accounts share the login failure message and perform a cost-matched password comparison. No password hash is returned by an API.

Browser sessions are one-hour HS256 JWTs with issuer, audience and expiry checks. The JWT is kept in a HttpOnly, SameSite=Lax cookie, with Secure and a `__Secure-` name in production. Only a token hash is persisted in the session collection. Logout removes that session server-side. Every authenticated request checks the current database user and session expiry, so a valid token cannot bypass suspension. Suspension/reactivation revokes all that user's sessions; reactivation never revives an old session.

Cookie-authenticated POST/PUT/PATCH/DELETE requests require the session's unpredictable CSRF token in `X-CSRF-Token`. Login/session restoration returns that token to the approved frontend; it is held in memory. CORS allows credentialed requests only for exact configured origins. State-changing requests from unapproved origins are rejected independently of CORS. Configure frontend/API under the same site, ideally one origin through Nginx; unrelated sites may block the SameSite cookie.

Browser bearer tokens from the previous implementation are removed from localStorage. The stored `user` value contains only display/profile data; the server-restored session controls routing and every server permission. Invalid/expired sessions clear the interface and return protected routes to sign-in. API clients may explicitly request a bearer token using `X-Session-Transport: bearer` at login; bearer requests still require an active server-side session and current account permissions. Never log these tokens.

## Authorization

| Role | Server-enforced abilities |
| --- | --- |
| Donor | Create listings as themselves, delete their own listings, view and decide requests for their own items |
| Requester | Browse published items, create a Pending request as themselves, read only their own requests |
| Admin | Read statistics/users/listings/requests/audits, suspend/reactivate ordinary accounts, hide/restore donations with reasons |

Client-supplied ownership, requester identity and initial request status are ignored. Public registration cannot create Admin accounts. Admin user updates allow only account status; role updates, arbitrary fields and changes to Admin accounts are rejected. Initial admin provisioning is an explicit private CLI operation that refuses existing-email promotion and refuses a second bootstrap. Protect production database/CLI access; there is no public admin creation endpoint. Run bootstrap as a single controlled operation, not concurrently.

Moderation is reversible and preserves records and uploaded files. Hidden listings cannot receive new requests and are absent from requester browsing, while the owner and Admin can review them. Existing request histories are retained. Donor deletion is an explicit owner action and removes that item's requests as before; onboarding/seed scripts do not delete genuine records.

## Input, uploads and transport

Inputs reject MongoDB operator keys, dotted/bracketed property names, prototype keys and excessive nesting. Each mutation picks named fields rather than spreading request bodies. Object IDs, enums, text bounds, pagination and search are validated. Admin search is escaped as literal text. JSON bodies are size-limited and database schemas add validation; existing records are not bulk-rewritten to adopt new defaults.

Rate limits cover all APIs, auth attempts, request creation and uploads. They currently use per-process memory and client IP: deploy shared rate storage/gateway limits before scaling, and explicitly configure trusted proxies for the selected host. An untrusted forwarded header is never accepted as a client identity. The default unauthenticated-proxy arrangement can group clients under one IP and needs deployment-specific review.

New photographs are decoded with Sharp, restricted to JPEG/PNG/WebP, bounded to 5 MiB and 25 million pixels, rotated/resized to at most 1200×1200, and re-encoded as WebP with metadata stripped. Animated files, SVG/HTML, fake headers and malformed images are rejected. Names are random UUIDs. Existing genuine uploads are preserved. New image names are unpredictable, but uploads are intentionally public resources; do not upload confidential photos. Further production malware scanning, quotas and retention are still appropriate.

Helmet headers, upload CSP, `nosniff`, JSON error responses and no-store API responses reduce exposure. The Nginx frontend has a same-origin CSP including blob image previews. Database/HTTP errors do not return stack traces or credentials. Production startup requires exact HTTPS origins, an absolute persistent upload directory and a private random secret. Remote MongoDB needs TLS; a self-hosted private-network exception must be explicitly declared with `MONGO_NETWORK=private`. Disabling database TLS explicitly is rejected.

## Audit and privacy

MongoDB audit events record actions, actor IDs, target IDs, outcome and time for registration, login, logout, denial, rate limiting, donor/request actions, provisioning and administrative mutations. Admin mutations write an audit event before changing state. Passwords, tokens, cookies, request bodies and credential-bearing URIs are not included. Audit events have a 90-day TTL; protect database access and review retention requirements. These records are not a tamper-proof external ledger, and an attempted admin event can exist if a subsequent database operation fails. Unexpected errors are logged by type only. Rate-limit logging is best effort to avoid making a throttled request depend on logging availability.

## Outstanding review

The final backend and frontend audits report zero known vulnerabilities. Compatible patches reduced findings, but 109 legacy build/dev entries remained, so the retired React Scripts/Jest tooling was replaced with Vite/Vitest. The React application, API and test assertions were preserved. Do not serve the Vite development server publicly or run untrusted build inputs. Re-run audits and review newly disclosed advisories before deployment; a zero-count audit does not guarantee security.

Before launch, configure HTTPS, a private authenticated database, persistent storage/backups, shared abuse controls, monitoring, secure admin access, a registration/upload policy, and privacy/retention terms. Email verification, password reset, MFA and external immutable audit export are not implemented. Reassess security on the final host and dependency versions.
