# Portfolio deployment plan — approval required

Prepared 21 October 2026. This is an executable launch checklist, **not a record of deployment**. No resources, billing, public listeners, domains or external backup accounts were created. Existing application functionality and UI are unchanged.

## Recommended arrangement

Use one **Hetzner Cloud shared x86 VPS in an EU region**, with at least 2 vCPU, 4 GB RAM and 40 GB persistent SSD. Confirm x86 AVX support for MongoDB 8 before purchase. Choose the current equivalent plan rather than relying on an old SKU. Run the existing Docker Compose stack: React/Nginx, one Express process, private authenticated MongoDB and persistent upload/database volumes. Put Caddy in front for automatic Let's Encrypt HTTPS. Use one domain and one origin for UI, API and uploads; this avoids extra CORS/cookie configuration and separate hosting bills.

This is suitable for a low-traffic portfolio demo, with one host as a failure domain. It is not high availability. Avoid free ephemeral hosting for local uploads and MongoDB. Do not split this small application across frontend hosting, an API service and a database service unless traffic or operational requirements justify the extra configuration.

### Budget, not a verified provider quotation

Official pricing pages returned network-policy denials in this workspace. The figures below are planning allowances, **not confirmed current prices**. Confirm region, disk, IPv4, tax and backup charges in the provider checkout before requesting purchase approval.

| Component | Expected monthly allowance, excluding tax |
| --- | --- |
| Shared x86 4 GB VPS | €5–8 |
| Public IPv4 | €0.50–1 |
| Provider automatic backups | About 20% of VM price: €1–1.60 |
| Encrypted off-site object storage, small demo (roughly 5–20 GB retained) | €0–1 initially; budget €1 |
| Domain amortized over annual registration | €1–2 (roughly €12–24/year) |
| Caddy, Docker, HTTPS certificate, DNS | €0 software/certificate cost |
| **Expected total** | **Approximately €8–14/month; reserve €10–15 plus tax** |

Storage growth, restore egress, region changes and non-EUR billing can increase costs. Set the provider's available billing alerts, a storage alert and an upload-retention policy; alerts are not necessarily a spending cap. No payment method or billing was enabled.

Verify: [Hetzner Cloud](https://www.hetzner.com/cloud/), [backup documentation](https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/), [Backblaze B2 pricing](https://www.backblaze.com/cloud-storage/pricing). B2 is the proposed independent backup destination; another S3-compatible provider is acceptable after confirming storage, request and egress charges.

## Decisions needed before any purchase or public launch

The owner must approve provider, region/data location, exact checkout cost, domain, monthly budget, and whether public signup/uploads are allowed. Recommended first release: limited portfolio sandbox with fictional data, explicit “demo—no real donations or personal information” notice and a documented reset policy. Current public signup/upload endpoints remain enabled in code; restricting them requires a separately reviewed gateway/application configuration before launch. Do not advertise a restricted sandbox until restrictions are tested. Email verification and account recovery are not implemented.

## Exact launch sequence

These commands are a plan to run **after approval**. Substitute the approved domain, release SHA and paths. Commands that require configuration work are expressly called out below; the current Compose template alone is not a public-ready gateway.

1. **Pin release and recheck dependencies.** In this checkout run:

   ```bash
   git switch main
   git pull --ff-only origin main
   git rev-parse HEAD
   npm ci --prefix backend
   npm ci --prefix frontend
   npm test --prefix backend
   npm test --prefix frontend
   npm run build --prefix frontend
   npm audit --prefix backend
   npm audit --prefix frontend
   ```

   Backend integration tests require the isolated local MongoDB described in TESTING.md. Record the exact approved SHA; deploy that SHA, not a moving branch. Keep only `main` in the source repository.

2. **Provision the approved VM.** Ubuntu 24.04 LTS x86, SSH key access, provider account MFA, recovery codes stored offline, automatic provider backups enabled only after cost approval. Create a non-root sudo operator; disable password/root SSH login after verifying a second key-based session. Install security updates and unattended security patches; arrange reboot maintenance. Verify CPU AVX support and disk capacity before installing MongoDB containers.

3. **Network perimeter.** At the provider firewall allow TCP 22 only from the operator's approved IP/CIDR and TCP 80/443 publicly; allow necessary outbound DNS/HTTPS/NTP. Do not expose 27017, 5000 or 8080. Use the provider firewall as well as host controls because published Docker ports can bypass ordinary UFW rules. Add DNS A to the VM; add AAAA only if IPv6 routing/firewall is tested. Wait for authoritative/public DNS convergence.

4. **Install Docker Engine and Compose v2 from Docker's official signed apt repository** following [Ubuntu installation instructions](https://docs.docker.com/engine/install/ubuntu/). Keep TLS and package signature verification enabled. Docker access is root-equivalent. Clone the repository into `/opt/sharebloom`, checkout the approved SHA, and keep runtime secrets outside the checkout. No third-party installation shell script is required.

5. **Create private configuration.** As root, `install -d -m 700 /etc/sharebloom`; copy `deploy/demo.env.example` to `/etc/sharebloom/app.env`, mode 600. Generate independent random hexadecimal Mongo root/application passwords (`openssl rand -hex 32`) and JWT secret (`openssl rand -hex 48`) into the private file using a secure editor or password manager. Set `PUBLIC_ORIGIN=https://APPROVED_DOMAIN`. Do not print expanded Compose configuration, commit credentials, expose secrets through React build variables, or reuse local demo passwords. Changing Mongo env values does not rotate users in an existing volume.

6. **Prepare and review a production gateway overlay before starting public services.** Keep `compose.demo.yaml` intact and write `compose.production.yaml` with Caddy, persistent Caddy `/data` and `/config` volumes, the chosen domain/ACME contact, and public ports 80/443 on Caddy only. Retain web's existing loopback-only 8080 listener, or remove it with a Compose-version-supported override. Caddy reverse-proxies to `web:80`; Nginx continues routing `/api` and `/uploads` to `api:5000`. Caddy automatically redirects HTTP to HTTPS. Pin an official Caddy image digest and validate its configuration without requesting a certificate first. Start with HSTS `max-age=2592000`; omit preload/includeSubDomains until every affected domain is HTTPS-ready.

   **Required gateway/proxy implementation gate:** current Express does not trust proxies. Configure exact trusted Nginx addresses in Express and exact trusted Caddy addresses in Nginx, using a dedicated, collision-checked fixed Compose subnet. Never enable unrestricted `trust proxy=true`. Caddy must overwrite incoming forwarded-client headers; Nginx must pass only the sanitized client address. Add gateway limits for every API route, stricter auth/upload limits, 6 MiB body limit, upstream timeouts and bounded connections. Test that forged `X-Forwarded-For` cannot evade limits, while two real clients receive independent limits. Current in-memory limits are suitable only for this single API process; scaling requires shared storage. This production overlay and trusted-proxy implementation are **not yet committed or tested**; do not open public access until complete.

   Apply container log rotation (for example 10 MiB × 3), `no-new-privileges` where compatible, and memory ceilings. Suggested Mongo wiredTiger cache 0.5 GB and container ceiling 2 GB, API 512 MB, Nginx 128 MB, Caddy 256 MB; leave host/build headroom. Test these limits under expected load. Leave database and uploads on named persistent volumes. Never run `down --volumes` on the live project.

7. **Build and inspect privately.** Once the production overlay is implemented:

   ```bash
   cd /opt/sharebloom
   docker compose --project-name sharebloom --env-file /etc/sharebloom/app.env \
     -f compose.demo.yaml -f compose.production.yaml config --quiet
   docker compose --project-name sharebloom --env-file /etc/sharebloom/app.env \
     -f compose.demo.yaml -f compose.production.yaml build
   ```

   Run a loopback rehearsal first, including authenticated Mongo connectivity, HTTPS cookies/CSRF and persistence. Never disable certificate verification. Provision the first Admin with the existing private admin script (see TESTING.md), independent credentials, no public self-registration role escalation. Seed only approved fictional data; copy licensed fixtures via the idempotent photo attachment script. Do not copy the entire development database or genuine uploads without a separate data review.

8. **Backups and mandatory restore drill.** Create an independent B2 bucket with encryption and a bucket/prefix-scoped application key; store the Restic repository password in an offline password manager and a root-readable host file. Use Restic authenticated encryption; provider disk encryption alone does not protect exported database dumps. Schedule daily backups at 03:00 UTC, retention 7 daily/4 weekly/3 monthly, weekly repository integrity checks and backup-age/error notifications. Set a non-overlap lock and `umask 077`.

   The backup job must briefly stop only the API to prevent writes across Mongo/upload capture, with a trap that restarts it on every exit; make a gzip `mongodump` of `community_donation`, archive the upload volume read-only, record checksums/release SHA and encrypt configuration needed for recovery. Pass Mongo credentials through a temporary mode-600 `mongodump --config` file inside the container, not password command arguments or logs. Resume the API immediately after capture, then transfer the consistent snapshot to Restic. Delete plaintext staging securely according to the host storage policy. Backup Caddy state or document ACME reissue. Do not put unencrypted archives in the repository or web root.

   **Restore gate:** restore to a new, isolated Compose project with fresh volumes and loopback-only ports; never use `mongorestore --drop` against live data. Restore DB and upload archive together, compare counts/checksums and image retrieval, verify authentication/authorization and three request states, and record elapsed recovery time. Provider snapshots supplement, rather than replace, the independent encrypted backup. Target RPO 24 hours and RTO 2–4 hours are goals until measured. Backup automation and this drill remain to be implemented/tested; no remote backup account has been created.

9. **Approved public start.** Only after steps 1–8 and explicit public-launch approval:

   ```bash
   docker compose --project-name sharebloom --env-file /etc/sharebloom/app.env \
     -f compose.demo.yaml -f compose.production.yaml up -d --wait
   docker compose --project-name sharebloom --env-file /etc/sharebloom/app.env \
     -f compose.demo.yaml -f compose.production.yaml ps
   ```

   Caddy obtains its certificate after DNS/ports are ready. Validate HTTP redirect, certificate chain/renewal configuration, `/api/health`, exact CORS origin, Secure/HttpOnly/SameSite cookies, CSRF rejection, unauthorized/other-owner denial, rate limits, upload type/size rejection, CSP and persistence after restart. Run the real browser suite against the approved HTTPS hostname using private test accounts; inspect desktop/mobile and all screenshots. Verify externally that database/API ports are closed. Do not log tokens or request bodies containing credentials. Remove test artefacts, keep fictional portfolio data, then announce the URL.

10. **Operations and rollback.** Monitor HTTPS uptime, `/api/health`, disk (>80%), memory, certificate expiry, container restarts and backup age (>26 hours). Keep bounded security/audit logs with access restricted to the operator; define deletion/retention and a short privacy notice. Review uploads periodically and add quotas/malware scanning before unrestricted public submissions. Patch and re-audit monthly. Record deployed image digests and SHA; rollback to known-good application images after backup, without deleting volumes or blindly downgrading Mongo. Restore into an isolated project first if data recovery is needed. Run a restore drill monthly and after material storage changes.

## Present readiness

Application tests and local screenshots are separate from final-host acceptance. Existing authentication, authorization, upload decoding, same-origin CORS/CSP and Compose persistence are prepared. Public proxy configuration, gateway abuse controls, encrypted backup automation/restore, final domain/TLS, retention/privacy choices and final-host browser validation remain launch gates. No claim of public production readiness or successful backup restoration is made.
