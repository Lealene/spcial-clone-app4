# Docs

Project documentation lives here: PRDs, architecture decisions, research notes, and agent-grounding docs.

## Structure

Organize feature-specific docs under `docs/<feature>/`. Each feature folder should have a `README.md` as the entry point, with extra files added only when the feature needs deeper specs, research, decisions, or implementation notes.

```txt
docs/
├── README.md
├── AGENTS.md
├── design-port/
│   └── README.md
└── homepage-payload-cms/
    └── README.md
```

Use concise, descriptive folder names:

- `docs/<feature>/README.md` - feature overview and current source of truth.
- `docs/<feature>/plan.md` - implementation plan, if the README is becoming too long.
- `docs/<feature>/decisions.md` - notable decisions and tradeoffs.
- `docs/<feature>/research.md` - investigation notes and source links.

## Current Feature Docs

- [Design port](./design-port/README.md) - source of truth for the approved web design port.
- [Homepage Payload CMS](./homepage-payload-cms/README.md) - plan for making the homepage and future pages Payload-driven.
