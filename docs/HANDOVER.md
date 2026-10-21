# ShareBloom handover

The repository stays `aymenmansoor/Community-Donation-Platform`, on `main`. The application now has ShareBloom branding, hardened input/upload boundaries, revocable cookie authentication, server-enforced Donor/Requester/Admin access control, a matching admin dashboard, genuine screenshots and documented hosting preparation. Existing records and genuine uploads were preserved. Local services use the existing workspace; no additional worktree or public deployment was created.

## Focused implementation commits

| Commit | Change |
| --- | --- |
| `5f988c6` | Input boundaries, real image decoding, rate limits and security logging |
| `50ad782` | HttpOnly/revocable sessions, CSRF, authentication checks and explicit admin bootstrap |
| `fd6a6b8` | Admin statistics, users, suspension, reversible moderation, requests and audit interface |
| `7554fe3` | ShareBloom branding, responsive navigation, photo previews and two licensed photo samples |
| `9f93982` | Expanded permissions/configuration/browser coverage and compatible dependency remediation |
| `b021fb6` | Preserve saved image references if audit storage fails |
| `1652de2` | Support legacy email casing without rewriting existing accounts |
| `bb70868` | Replace retired frontend build/test tooling with audited Vite/Vitest, preserving UI and assertions |

The final documentation/gallery commit follows these commits; no history was rewritten.

## Verified results

- 17 backend tests passed against real MongoDB; 10 frontend tests passed; no tests were skipped or remain failing.
- Nine real Chromium scenarios passed, including desktop donor/requester/admin flows and mobile admin/requester navigation.
- Production frontend build passed. Docker API/frontend images built with TLS verification.
- Authenticated Compose started locally and passed a verified local HTTPS cookie/CSRF/session/donation/logout rehearsal. The temporary rehearsal was stopped; its volumes were retained.
- Sixteen actual screenshots are under `docs/screenshots/`; hashes and dimensions are recorded in the capture manifest, and README has the gallery.
- Local demo data ends with four fictional accounts (including a privately provisioned Admin), eight listings and three stable sample requests in Pending/Approved/Rejected states. The original three accounts/six listings/requests remain.
- Private development configuration, generated admin credentials and local TLS keys are outside the checkout under `/workspace/.community-donation/`. No values are committed or included in screenshots. Existing users must sign in again after the session upgrade.

## Remaining blockers and unexecuted checks

**Stage 4 is partially complete.** Two matching CC0/public-domain photo listings are available with author/source attribution and verified upstream checksums. The original six fictional listings still need suitable licensed photographs. Pexels and Wikimedia requests were denied by runtime policy; their domains are saved in the environment draft. Save the network additions in environment settings to resume licence verification and sourcing. No unrelated or unknown-licence photos were attached to existing records. No genuine uploads were replaced.

The final frontend and backend audits both report zero known vulnerabilities. Compatible patches alone left 109 legacy frontend entries; a focused Vite/Vitest migration removed the retired React Scripts/Jest tree without changing UI flows or removing assertions. All ten frontend tests, the build and nine browser scenarios passed afterward. Re-audit before launch; this is not a security guarantee.

Final public-host browser/TLS checks, backup restoration, multi-instance/shared throttling, proxy configuration and production monitoring have not been tested because no public hosting has been approved. The current throttles use per-process memory; email verification, password recovery, MFA and tamper-proof external audit storage are not implemented. Passing tests do not guarantee security.

See [testing](TESTING.md), [security design](SECURITY.md), [validation](VALIDATION.md), [deployment preparation](DEPLOYMENT.md) and [photo attribution](../backend/fixtures/photos/ATTRIBUTION.md). Public deployment, paid resources and disclosure of real credentials still require explicit approval.
