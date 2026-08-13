#!/usr/bin/env bash
#
# railway-start.sh — single start entrypoint for both Railway services.
#
# Mirrors railway-build.sh: branches on APP_TARGET to start the right app.
# Each app's `start` script reads $PORT (Railway injects it) and falls back to
# its local dev port.
set -euo pipefail

target="${APP_TARGET:-web}"
echo "railway-start: APP_TARGET=${target}"

case "${target}" in
  backend) pnpm --filter @mvp-realty/backend start ;;
  web) pnpm --filter @mvp-realty/web start ;;
  *) echo "railway-start: unknown APP_TARGET '${target}'" >&2; exit 1 ;;
esac
