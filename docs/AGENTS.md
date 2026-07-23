# Docs agent instructions

Root rules in `/AGENTS.md` apply. This directory holds PRDs, decisions, research, and agent-grounding docs.

## Hard rules

- Ground docs in current source files, scripts, and config. Do not invent ports, commands, versions, or deployment behavior.
- If a code change alters a convention, command, env var, port, generated-file rule, or workflow, update the relevant docs and `AGENTS.md` in the same PR.
- Prefer linking to source files or script names over copying command bodies that can drift.
- Keep decision docs explicit about status and date when they record temporary choices.

## Documentation areas

Use the docs area that matches the information being recorded:

- `docs/architecture/` — durable contracts and architectural rules that should outlive one project phase.
- `docs/runbooks/` — operational procedures, deploy steps, reindexing, and incident response.
- `docs/agent-loop/` — work queue, phase status, run log, and decisions for active agent work.
- `docs/features/` — feature-specific behavior docs.
- `docs/codebase-alignment/` — investigation and refactor/alignment plans grouped by date/topic.

For codebase-alignment or architecture-deepening work, use `docs/codebase-alignment/YYYY-MM-DD-short-topic/` with a `README.md` and phase docs named `phase-01-topic-name.md`, `phase-02-topic-name.md`, etc. Each phase file should include Scope, Current Shape, Problem, Target Shape, Implementation Notes, Verification, and Status.

- Use lowercase kebab-case and absolute dates.
- Keep each phase independently understandable and independently actionable.
- Do not include secrets, tokens, credentials, or private env values.
- If the work becomes a permanent rule, promote the final version into `docs/architecture/`.
- Keep root-level docs limited to this docs index, agent instructions, and repository-wide documentation that does not belong in a specific area.

## Design-port docs

`docs/design-port/README.md` is the current source of truth for the web design port. Read it before substantial design work in `apps/web`.
