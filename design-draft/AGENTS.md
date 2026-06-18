# Design draft agent instructions

Root rules in `/AGENTS.md` apply. This directory is static design reference material, not production app code.

## Hard rules

- Do not delete this directory; it is a visual QA reference for the web port.
- Do not copy raw draft HTML/CSS directly into production.
- Port designs into `apps/web` as a Tailwind + shared-UI rewrite that follows `apps/web/AGENTS.md` and `docs/design-port-decisions.md`.
- Drop design-review/runtime tooling such as tweak panels when moving concepts into the app unless the user explicitly asks for that tooling.
- Treat photos/assets as source material; production assets should be slugified and served through the app's public assets or future Payload Media.
