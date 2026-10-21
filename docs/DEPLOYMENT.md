# Portfolio demo deployment preparation

The application is validated locally. Nothing has been deployed publicly and no paid resources have been created. Obtain the owner's approval for the hosting provider, domain, resource plan, and public deployment before launching.

## Prepared architecture

`compose.demo.yaml` builds the React frontend into Nginx, proxies `/api` and `/uploads` to Express, and keeps MongoDB on the private Compose network. The web listener binds only to `127.0.0.1:8080`; an approved HTTPS gateway is required for public access. The frontend uses same-origin requests in this configuration. Separate static hosting can instead build with `REACT_APP_API_URL=https://<approved-api-host>` and must allow that API origin in its frontend CSP.

MongoDB is pinned to an official image digest. Its data and uploaded images use separate persistent volumes. Database initialization creates a database-scoped `readWrite` application user; Express never uses the root database account. Initialization runs only on a fresh volume. Rotate existing credentials in MongoDB as well as in host settings; changing environment values does not change users in an existing volume.

## Private configuration

Copy `deploy/demo.env.example` to a private file outside the checkout. Generate independent random values for the root database password, application database password, and JWT signing secret. Use hexadecimal database passwords with the Compose template so URI escaping is unambiguous. Set `PUBLIC_ORIGIN` to the exact approved HTTPS frontend origin, without a trailing slash. Never put credentials in React variables: every `REACT_APP_*` value is public build output.

For a managed database, set backend `MONGO_URI` securely with a least-privilege application account, TLS enabled, and a narrow provider network allowlist. Do not expose MongoDB's port publicly. Set `NODE_ENV=production`, `HOST=0.0.0.0`, `CORS_ORIGIN`, `JWT_SECRET` (at least 32 random characters), and an absolute persistent `UPLOAD_DIR`. The API refuses production startup without these required settings. Readiness is `GET /api/health`, which checks the live database connection. Startup waits for MongoDB before accepting traffic.

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
- CORS uses explicit origins. CORS alone is not authorization; JWT checks protect API data independently. No cross-site cookie credentials are used.
- Uploads accept PNG/JPEG/WebP signatures only, limit files to 5 MiB, use random names, disallow SVG/HTML, and apply `nosniff` and a restrictive upload CSP. Valid images are intentionally publicly retrievable by their random URL. Never upload private or identifying photos to a public demo. Persistent volume backups and retention are required. Consider trusted image re-encoding and malware scanning before opening unrestricted public uploads.
- The prepared Nginx frontend restricts scripts and network requests to the same origin. Bootstrap is bundled locally. JWTs remain in browser localStorage; a stronger production session design would use secure HttpOnly cookies with CSRF protection. Do not load untrusted third-party scripts.
- A single-process auth throttle is present. Before public launch, configure gateway rate limits and body/time limits for **all** API routes, including signup and uploads. Use shared rate-limit storage if scaling. Do not trust arbitrary forwarded headers; configure any trusted proxy explicitly for the chosen provider.

## Remaining launch decisions

1. Approve a provider/domain and budget; configure HTTPS and the exact CORS origin. Do not use the example domain as a live endpoint.
2. Configure private database authentication, secrets, backups and persistent upload storage. Test restoration and credential rotation. Verify the selected host supports persistent disk; ephemeral serverless filesystems will lose uploads.
3. Decide whether the demo allows public registration/uploads or uses a limited sandbox. Add abuse controls, monitoring, log retention, a privacy notice and a reset/retention policy appropriate to that decision. Email ownership verification/password recovery are not implemented.
4. Review dependency audit findings separately. This project retains Create React App 5. React Router and backend packages received compatible same-major security updates; the Jest compatibility fix itself uses configuration rather than a runner/toolchain upgrade. The final backend audit reports zero known vulnerabilities. The frontend audit still reports 371 affected package entries (6 critical, 127 high, 129 moderate, 109 low), largely in the legacy build/development dependency tree; these findings must be triaged before public launch. The static container does not ship Node build dependencies, but that does not make the audit clean. Audit build dependencies separately from shipped runtime dependencies.
5. Seed only fictional data after approval. The local seed script refuses remote databases unless `ALLOW_DEMO_SEED=true` is explicitly set; never reuse local demo passwords as production credentials or publish private keys. Existing seed accounts preserve their original password when rerun.
6. Run the API tests, frontend tests, production build, and browser flow against the final HTTPS host, then verify unauthorized requests, cross-origin responses, upload persistence, mobile layout and backup recovery before announcing the URL.

Local checks are not evidence of a public deployment or a new cloud-task restoration.
