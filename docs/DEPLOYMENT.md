# ShareBloom deployment preparation

The application is validated locally. Nothing has been deployed publicly and no paid resources have been created. Obtain the owner's approval for the hosting provider, domain, resource plan, and public deployment before launching.

## Prepared architecture

`compose.demo.yaml` builds the React frontend into Nginx, proxies `/api` and `/uploads` to Express, and keeps MongoDB on the private Compose network. The web listener binds only to `127.0.0.1:8080`; an approved HTTPS gateway is required for public access. The frontend uses same-origin requests in this configuration. Separate static hosting can instead build with `REACT_APP_API_URL=https://<approved-api-host>` and must allow that API origin in its frontend CSP.

MongoDB is pinned to an official image digest. Its data and uploaded images use separate persistent volumes. Database initialization creates a database-scoped `readWrite` application user; Express never uses the root database account. Initialization runs only on a fresh volume. Rotate existing credentials in MongoDB as well as in host settings; changing environment values does not change users in an existing volume.

## Private configuration

Copy `deploy/demo.env.example` to a private file outside the checkout. Generate independent random values for the root database password, application database password, and JWT signing secret. Use hexadecimal database passwords with the Compose template so URI escaping is unambiguous. Set `PUBLIC_ORIGIN` to the exact approved HTTPS frontend origin, without a trailing slash. Never put credentials in React variables: every `REACT_APP_*` value is public build output.

For a managed database, set backend `MONGO_URI` securely with a least-privilege application account, TLS enabled, and a narrow provider network allowlist. Do not expose MongoDB's port publicly. For a self-hosted database without TLS on the private Compose network, explicitly set `MONGO_NETWORK=private`; external databases require TLS. Set `NODE_ENV=production`, `HOST=0.0.0.0`, `CORS_ORIGIN`, `JWT_SECRET` (at least 32 random characters), and an absolute persistent `UPLOAD_DIR`. The API refuses production startup without these required settings. Readiness is `GET /api/health`, which checks the live database connection. Startup waits for MongoDB before accepting traffic.

## Build and local rehearsal

Use Docker Compose v2 and a private environment file:

```bash
docker compose --env-file /absolute/private/demo.env -f compose.demo.yaml config --quiet
docker compose --env-file /absolute/private/demo.env -f compose.demo.yaml build
# Local rehearsal only; the web port remains bound to loopback.
docker compose --env-file /absolute/private/demo.env -f compose.demo.yaml up -d
```

If Docker's default configuration directory is read-only in a cloud task, set `DOCKER_CONFIG` to a writable directory outside the checkout. Do not print `docker compose config` without `--quiet`: expanded output contains secrets. Behind a trusted corporate/cloud TLS proxy, the Dockerfiles accept an optional BuildKit `build_ca` secret containing the organization CA certificate; forward standard proxy build arguments and ensure the proxy hostname resolves in the build network. Never disable TLS verification or commit private proxy configuration. Stop a rehearsal with the same command prefix and `down`; do not add `--volumes` unless deliberately deleting demo data. Local development uses a different MongoDB container and volume.

## Authorization and data review

- API endpoints verify HS256 JWT signatures, expiry, and the current database user. Passwords are bcrypt hashes; input length is capped before hashing. Session tokens expire after one hour.
- Donors can post and delete their own listings and update requests only for their own items. Requesters can create requests as themselves. Client-supplied ownership and initial status fields are ignored.
- Request histories are filtered on the server. Arbitrary user IDs, another donor's requests, and unauthenticated data requests are denied. Status updates accept only Approved or Rejected. UI Approve/Reject and Delete controls call those protected endpoints.
- CORS uses explicit origins. CORS alone is not authorization; JWT checks protect API data independently. Browser sessions now use HttpOnly, SameSite=Lax cookies and CSRF headers. Use same-site frontend/API HTTPS hosts, ideally the prepared same-origin proxy; unrelated-site hosting can block the cookie. Approved CORS origins receive explicit allow-credentials responses.
- Uploads decode PNG/JPEG/WebP, limit input to 5 MiB and 25 million pixels, re-encode metadata-free WebP, use random names, reject SVG/HTML/malformed data, and apply `nosniff` and a restrictive upload CSP. Valid images are intentionally publicly retrievable by their random URL. Never upload private or identifying photos to a public demo. Persistent volume backups and retention are required. Add malware scanning, quotas and retention before opening unrestricted public uploads.
- The prepared Nginx frontend restricts scripts and network requests to the same origin. Bootstrap is bundled locally. JWTs have been moved out of browser localStorage into revocable HttpOnly cookies with CSRF protection. A fresh session is required after the security upgrade. Do not load untrusted third-party scripts.
- A single-process auth throttle is present. Before public launch, configure gateway rate limits and body/time limits for **all** API routes, including signup and uploads. Use shared rate-limit storage if scaling. Do not trust arbitrary forwarded headers; configure any trusted proxy explicitly for the chosen provider.

## Remaining launch decisions

1. Approve a provider/domain and budget; configure HTTPS and the exact CORS origin. Do not use the example domain as a live endpoint.
2. Configure private database authentication, secrets, backups and persistent upload storage. Test restoration and credential rotation. Verify the selected host supports persistent disk; ephemeral serverless filesystems will lose uploads.
3. Decide whether the demo allows public registration/uploads or uses a limited sandbox. Add abuse controls, monitoring, log retention, a privacy notice and a reset/retention policy appropriate to that decision. Email ownership verification/password recovery are not implemented.
4. Repeat dependency audits before launch. The final frontend and backend audits report zero known vulnerabilities after replacing retired React Scripts/Jest with Vite/Vitest. This preserves the application and tests, but audits do not establish complete security or final-host readiness.
5. Seed only fictional data after approval. The local seed script refuses remote databases unless `ALLOW_DEMO_SEED=true` is explicitly set; never reuse local demo passwords as production credentials or publish private keys. Existing seed accounts preserve their original password when rerun.
6. Run the API tests, frontend tests, production build, and browser flow against the final HTTPS host, then verify unauthorized requests, cross-origin responses, upload persistence, mobile layout and backup recovery before announcing the URL.

Local checks are not evidence of a public deployment or a new cloud-task restoration.

## Latest authentication rehearsal

The updated images were built and the authenticated Compose stack started locally. `scripts/production-smoke.cjs` exercised cookie sessions through a loopback HTTPS gateway with certificate verification enabled: database health, login, Secure/HttpOnly flags, session restoration, CSRF denial, donation creation/deletion and logout revocation passed. This is a Node HTTPS transport check, not a public-host browser validation. The development UI has separate real Chromium desktop/mobile coverage.

The helper expects a private local certificate/key in `/workspace/.community-donation/tls` (or `LOCAL_TLS_DIR`) and a loopback Compose stack on 8080 with `PUBLIC_ORIGIN=https://localhost:8443`. Never commit the key or reuse this test certificate for public hosting. The client explicitly trusts the test certificate; it never disables TLS verification.
