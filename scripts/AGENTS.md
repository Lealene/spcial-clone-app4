# Scripts agent instructions

Root rules in `/AGENTS.md` apply. Scripts are project automation and deployment entrypoints.

## Hard rules

- Use bash with `set -euo pipefail` for shell scripts.
- Keep scripts runnable from the repo root unless their help text says otherwise.
- Use pnpm and workspace filters; do not introduce npm/yarn commands.
- Avoid destructive behavior without explicit user confirmation.
- If a script changes env names, package scope, port behavior, or deployment behavior, update README and relevant `AGENTS.md` files in the same PR.

## Railway scripts

`railway.json` calls `scripts/railway-build.sh` and `scripts/railway-start.sh`. Both branch on `APP_TARGET`, with valid values `web` and `backend`, because Railway services deploy from the repo root to keep the workspace lockfile available.
