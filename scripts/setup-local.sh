#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export npm_config_cache="${npm_config_cache:-/workspace/.npm}"
npm ci --no-audit --no-fund
npm ci --prefix backend --no-audit --no-fund
npm ci --prefix frontend --no-audit --no-fund
# Docker verifies content digests. Use the official image without disabling trust checks.
docker pull mongo@sha256:4b58ebcb1dc7a7b4e84cd8ce9098d48764ae4478876898ff9551acf2ac4a6a6d
mkdir -p /workspace/.community-donation
node <<'NODE'
const fs = require('fs');
const crypto = require('crypto');
for (const [name, contents] of [
  ['backend.env', () => `MONGO_URI=mongodb://127.0.0.1:27017/community_donation\nPORT=5000\nJWT_SECRET=${crypto.randomBytes(48).toString('hex')}\n`],
  ['demo.env', () => `DEMO_PASSWORD=${crypto.randomBytes(24).toString('hex')}\n`]
]) {
  const file = `/workspace/.community-donation/${name}`;
  if (!fs.existsSync(file)) fs.writeFileSync(file, contents(), { mode: 0o600 });
}
NODE
