# MVP Realty

MVP Realty is a pnpm monorepo with a customer-facing **Next.js 16** website and a **Payload v3** CMS backed by PostgreSQL. Turborepo runs the apps and shared TypeScript packages together.

If this is your first time working in the repository, follow **First-time setup** from top to bottom.

## What runs locally

| Service       | URL or port                   | Purpose                      |
| ------------- | ----------------------------- | ---------------------------- |
| Web app       | <http://localhost:3003>       | Customer-facing website      |
| Payload admin | <http://localhost:3002/admin> | CMS and local admin account  |
| Payload API   | <http://localhost:3002/api>   | REST API used by the web app |
| PostgreSQL    | `localhost:5435`              | Local CMS database           |

Keep ports `3002`, `3003`, and `5435` free while developing. The web server can choose another port when `3003` is busy, but the local environment and generated URLs expect `3003`.

## Prerequisites

Install these before continuing:

- [Git](https://git-scm.com/)
- [nvm](https://github.com/nvm-sh/nvm) for Node.js
- Docker Desktop **or** [Colima](https://github.com/abiosoft/colima)

The repository selects Node 24 from `.nvmrc` and pins pnpm `11.2.1`. You do not need to install pnpm globally; Corepack handles it below.

## First-time setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd mvp-realty
```

Replace `<repository-url>` with the URL your team provides.

### 2. Install the correct Node and pnpm versions

```bash
nvm install
nvm use

corepack enable
corepack prepare pnpm@11.2.1 --activate
pnpm --version
```

`pnpm --version` should print `11.2.1`.

### 3. Install dependencies

```bash
pnpm install
```

This also installs the repository's Lefthook Git hooks.

### 4. Create your local environment files

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env.local
```

Generate a private Payload signing secret:

```bash
openssl rand -base64 32
```

Open `apps/backend/.env.local` and replace:

```env
PAYLOAD_SECRET=replace-with-openssl-rand-base64-32
```

with the generated value. Do not commit either `.env.local` file or share your local secret.

The important local values are:

```env
# apps/web/.env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002

# apps/backend/.env.local
DATABASE_URL=postgres://mvp_realty_db:mvp_realty_db@localhost:5435/mvp_realty_db
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3002
DB_PUSH=false
```

Normal development uses committed Payload migrations. Keep `DB_PUSH=false` or leave it unset.

### 5. Start Docker

Choose one container runtime. Do not run multiple Docker runtimes at the same time unless you understand Docker contexts and port forwarding.

#### Docker Desktop

Open Docker Desktop and wait until it reports that Docker is running.

#### Colima

```bash
colima start
```

For either option, confirm Docker and Compose are ready:

```bash
docker info
docker compose version
```

Both commands must succeed before continuing.

### 6. Create and prepare the local database

Start PostgreSQL:

```bash
pnpm docker:up
```

Apply the committed Payload migrations:

```bash
pnpm -C apps/backend migrate
```

Seed the starter homepage, Header, Footer, and media:

```bash
pnpm -C apps/backend seed:local
```

The seed validates the canonical media, reconciles the complete starter CMS content, and reports what changed. It is safe to rerun when the canonical starter content is unchanged: it reuses media by checksum, skips unchanged globals and pages, and refuses to overwrite conflicting editorial changes. It never copies or creates an admin account; each developer creates their own local user.

### 7. Start development

```bash
pnpm dev
```

Wait until both apps report that they are ready, then open:

- Web app: <http://localhost:3003>
- Payload admin: <http://localhost:3002/admin>

### 8. Create your local Payload admin

A new database shows Payload's **first-user registration** screen at <http://localhost:3002/admin>. Create your own local email and password there.

There is no shared default admin password. Your account exists only in your local PostgreSQL volume and must never be committed to the repository. Normal colleague onboarding uses migrations and the canonical seed rather than a database dump, so password hashes, sessions, local secrets, generated IDs, and timestamps are not transferred.

If the page shows a normal login form instead of first-user registration, that database already contains a user.

## Confirm that everything works

A successful setup should satisfy all of these checks:

1. <http://localhost:3003> loads the website.
2. <http://localhost:3002/admin> loads Payload and accepts your local account.
3. Payload contains a published page with the slug `home`.
4. Payload contains Header and Footer globals and five starter media records.
5. `pnpm -C apps/backend migrate:status` reports the current migration as applied.

> **Important:** the web app has a deliberate fixture fallback. It can display a complete-looking homepage when Payload is unavailable or its page data is invalid. Seeing the website alone does not prove the CMS is connected; check Payload admin or the `home` page API too.

## Daily development

From the repository root:

```bash
nvm use
pnpm dev
```

`pnpm dev` ensures PostgreSQL is running and starts both Next.js apps through Turborepo.

To stop the apps, press `Ctrl+C`. PostgreSQL remains available for the next session. To stop it too:

```bash
pnpm docker:down
```

`docker:down` preserves your local database volume.

## Database lifecycle

Committed Payload migrations are the schema source of truth.

| Command                               | What it does                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm docker:up`                      | Starts local PostgreSQL and waits for it to become healthy                   |
| `pnpm docker:down`                    | Stops PostgreSQL but preserves local data                                    |
| `pnpm -C apps/backend migrate`        | Applies pending Payload migrations                                           |
| `pnpm -C apps/backend migrate:status` | Shows applied and pending migrations                                         |
| `pnpm -C apps/backend seed:local`     | Validates and reconciles starter CMS content and media without copying users |
| `pnpm docker:reset`                   | **Deletes the local PostgreSQL volume** and recognized seed-media copies     |

### Completely reset local data

Only use this when you intentionally want to delete all local CMS content and users:

```bash
pnpm docker:reset
pnpm -C apps/backend migrate
pnpm -C apps/backend seed:local
pnpm dev
```

The reset removes only recognized checksum-matching seed files from `apps/backend/media`; it never blanket-deletes unrelated local uploads. The PostgreSQL reset still deletes all database records, including users and editor-created media metadata.

Then visit <http://localhost:3002/admin> and create a new first user.

## Quality commands

Run these from the repository root:

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `pnpm typecheck`    | Type-checks every workspace                         |
| `pnpm lint`         | Runs ESLint across the monorepo                     |
| `pnpm test`         | Runs Vitest across the monorepo                     |
| `pnpm format`       | Formats supported files with Prettier               |
| `pnpm format:check` | Checks formatting without changing files            |
| `pnpm build`        | Builds both applications for production             |
| `pnpm clean`        | Removes dependencies and generated app/Turbo caches |

Run a command in one workspace with either form:

```bash
pnpm --filter @mvp-realty/web test
pnpm -C apps/backend generate:types
```

## Common problems

### `pnpm: command not found`

Enable the repository's pinned pnpm version:

```bash
corepack enable
corepack prepare pnpm@11.2.1 --activate
```

### `ERR_PNPM_UNSUPPORTED_ENGINE`

The wrong Node version is active:

```bash
nvm install
nvm use
```

### Cannot connect to the Docker daemon

Start Docker Desktop or run:

```bash
colima start
```

Then verify:

```bash
docker info
docker compose version
```

### Port is already allocated

Check the conflicting port:

```bash
lsof -nP -iTCP:5435 -sTCP:LISTEN
lsof -nP -iTCP:3002 -sTCP:LISTEN
lsof -nP -iTCP:3003 -sTCP:LISTEN
```

Stop the conflicting process or container. Prefer keeping the documented ports instead of allowing the apps to move silently.

### Payload reports that a table or relation does not exist

PostgreSQL is running, but the Payload schema was not migrated:

```bash
pnpm -C apps/backend migrate
```

Restart `pnpm dev` afterward.

### Payload is empty after a database reset

A reset creates a blank database. Rebuild it in this order:

```bash
pnpm -C apps/backend migrate
pnpm -C apps/backend seed:local
```

Then create the first admin at <http://localhost:3002/admin>.

### The web homepage works, but Payload does not

The frontend is probably rendering its fixture fallback. Check the backend terminal output and open <http://localhost:3002/admin>. Also verify that the published `home` page exists in Payload.

### Payload cannot load `sharp` or process images

```bash
pnpm rebuild sharp
```

Restart development afterward.

## Repository map

```text
apps/
  web/                 Customer-facing Next.js app on port 3003
  backend/             Payload admin/API on port 3002
    src/collections/   Users, Media, and Pages collections
    src/blocks/        Payload page-builder blocks
    src/globals/       Header and Footer globals
    src/migrations/    Committed Payload database migrations
    src/scripts/       Seed, audit, and local admin utilities
packages/
  api-contracts/       Runtime schemas and types shared across apps
  ui/                  Shared React primitives
tooling/               Shared ESLint, Prettier, TypeScript, Tailwind, and Vitest configs
docs/                  Architecture, product, and implementation documentation
.agents/skills/         Team-shared agent skills
```

The apps consume shared packages directly through workspace dependencies and Next.js transpilation; shared packages do not require a separate build during development.

## Git hooks

Lefthook installs during `pnpm install`:

- Pre-commit formats and ESLint-fixes staged files, then re-stages them.
- Pre-push runs `pnpm typecheck` and `pnpm lint`.

Use `git commit --no-verify` only when you understand why a hook must be bypassed.

## Agent and framework guidance

- [`AGENTS.md`](./AGENTS.md) contains the canonical repository rules for coding agents.
- App-specific rules live in [`apps/web/AGENTS.md`](./apps/web/AGENTS.md) and [`apps/backend/AGENTS.md`](./apps/backend/AGENTS.md).
- Payload guidance is available at [`.agents/skills/payload/`](./.agents/skills/payload/).
- Payload block-renderer guidance is available at [`.agents/skills/payload-block-renderer/`](./.agents/skills/payload-block-renderer/).
- Installed, version-matched Next.js documentation lives under `node_modules/next/dist/docs/` after `pnpm install`.
