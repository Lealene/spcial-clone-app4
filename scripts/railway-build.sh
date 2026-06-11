#!/usr/bin/env bash
#
# railway-build.sh — single build entrypoint for both Railway services.
#
# Both apps deploy from the repo root (pnpm workspace needs the root lockfile),
# so they share one root railway.json. This script branches on APP_TARGET,
# which is set per-service in Railway (web | backend), to build the right app.
set -euo pipefail

target="${APP_TARGET:-web}"
echo "railway-build: APP_TARGET=${target}"

case "${target}" in
  backend) pnpm --filter @mvp-realty/backend build ;;
  web) pnpm --filter @mvp-realty/web build ;;
  *) echo "railway-build: unknown APP_TARGET '${target}'" >&2; exit 1 ;;
esac
