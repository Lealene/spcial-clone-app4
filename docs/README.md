# Docs

Project documentation lives here: PRDs, architecture decisions, research notes, and agent-grounding docs.

## Structure

Use the docs area that matches the kind of information being recorded:

```txt
docs/
├── README.md
├── AGENTS.md
├── architecture/          # durable contracts and architectural rules
├── runbooks/              # operational procedures and incident/deploy steps
├── agent-loop/            # active work queues, run logs, and decisions
├── features/              # feature-specific behavior docs
├── codebase-alignment/    # dated investigation and refactor/alignment plans
├── design-port/
│   └── README.md
└── homepage-payload-cms/
    └── README.md
```

For codebase-alignment or architecture-deepening work, use a dated folder:

```txt
docs/codebase-alignment/YYYY-MM-DD-short-topic/
├── README.md
├── phase-01-topic-name.md
├── phase-02-topic-name.md
└── phase-03-topic-name.md
```

Each phase file should include Scope, Current Shape, Problem, Target Shape, Implementation Notes, Verification, and Status. Keep phase files independently understandable and independently actionable. Use lowercase kebab-case and absolute dates. If an alignment result becomes a permanent rule, promote the final version into `docs/architecture/`.

## Current Docs

- [Design port](./design-port/README.md) - source of truth for the approved web design port.
- [CMS page builder architecture](./architecture/cms-page-builder.md) - active architecture for Payload `Pages`, CMS page blocks, and web rendering.
- [Homepage Payload CMS](./homepage-payload-cms/README.md) - historical plan for making the homepage and future pages Payload-driven.
- [Architecture deepening alignment plan](./codebase-alignment/2026-06-19-architecture-deepening/README.md) - phased codebase-alignment plan for the current CMS and design-system refactors.
