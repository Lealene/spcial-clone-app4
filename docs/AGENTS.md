# Docs agent instructions

Root rules in `/AGENTS.md` apply. This directory holds PRDs, decisions, research, and agent-grounding docs.

## Hard rules

- Ground docs in current source files, scripts, and config. Do not invent ports, commands, versions, or deployment behavior.
- If a code change alters a convention, command, env var, port, generated-file rule, or workflow, update the relevant docs and `AGENTS.md` in the same PR.
- Prefer linking to source files or script names over copying command bodies that can drift.
- Keep decision docs explicit about status and date when they record temporary choices.

## Design-port docs

`docs/design-port-decisions.md` is the current source of truth for the web design port. Read it before substantial design work in `apps/web`.
