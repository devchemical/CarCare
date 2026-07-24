# AGENTS.md

Instructions for coding agents working in the Keepel repository. This file follows the
[AGENTS.md open format](https://agents.md/) and complements the human-facing `README.md`.

## Project overview

Keepel is a responsive vehicle-maintenance web application. It lets authenticated users manage
vehicles, maintenance records, schedules, costs, and reports.

- **Runtime:** Node.js 20.9+ and Bun 1.3+
- **Application:** Next.js 16 App Router, React 19, strict TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui and Radix primitives
- **Backend:** Supabase Auth, PostgreSQL, Storage, and Row Level Security
- **Validation and forms:** Zod and React Hook Form
- **Tests:** Vitest for unit/integration tests and Playwright for end-to-end tests
- **Quality tools:** Oxlint and Oxfmt

The repository is a single application, not a monorepo. If a nested `AGENTS.md` is added later,
its instructions take precedence for files in that subtree. An explicit user instruction always
takes precedence over repository guidance.

## Setup

Run commands from the repository root.

```bash
bun install
cp .env.example .env.local
bun dev
```

Populate `.env.local` from a development Supabase/Upstash environment. Never copy credentials,
tokens, production data, or a populated environment file into source control.

## Commands

Use the package scripts rather than similarly named Bun built-ins.

```bash
bun dev                    # Start the development server
bun run build              # Create a production build
bun start                  # Serve the production build

bun fmt:check              # Check formatting
bun run fmt                # Format files
bun lint                   # Run Oxlint
bun type-check             # Run TypeScript without emitting

bun run test               # Run all Vitest unit/integration tests
bun run test:unit          # Run unit tests
bun run test:integration   # Run integration tests
bun run test:e2e           # Run Playwright tests
bun run test:watch         # Run Vitest in watch mode
```

For a focused Vitest run, pass the relevant file after `--`:

```bash
bun run test -- tests/unit/auth/example.test.ts
```

Before handing off a code change, run the smallest relevant tests while iterating, then run:

```bash
bun fmt:check
bun lint
bun type-check
bun run test
bun run build
```

Run `bun run test:e2e` when changing a user journey, auth flow, privacy flow, routing behavior, or
Playwright support code. The Playwright configuration starts controlled local services and the app;
do not point E2E tests at production.

## Repository map

- `app/` — App Router pages, layouts, route handlers, and Server Actions
- `components/` — feature and reusable UI components
- `contexts/` — auth projection, Supabase data client, and application data providers
- `hooks/` — reusable client hooks
- `lib/auth/` — server-auth boundary, typed contracts, redirects, and invalidation
- `lib/supabase/` — browser/server clients, SSR cookie behavior, and proxy logic
- `lib/privacy/` — signed consent contract and server adapter
- `lib/analytics/` — consent-gated, server-only analytics transport
- `lib/security/` — HMAC and client-IP helpers
- `proxy.ts` — top-level Next.js proxy entry point
- `scripts/` — database SQL and maintenance scripts
- `tests/unit/` — isolated behavior tests
- `tests/integration/` — boundary and multi-module tests
- `tests/e2e/` — Playwright journeys with controlled services
- `docs/adr/` — accepted architecture decisions
- `docs/agents/` — issue-tracker, domain-doc, and triage conventions

Before changing architecture or domain language, read `CONTEXT.md` when present and the relevant
records in `docs/adr/`. Do not silently contradict an ADR.

## Architecture invariants

### Authentication

Authentication is server-authoritative.

1. `proxy.ts` delegates to `lib/supabase/proxy.ts` to refresh SSR cookies and protect routes.
2. Login, signup, Google OAuth, callback exchange, and logout cross server boundaries.
3. Browser-facing auth outcomes use typed contracts and never expose sessions or tokens.
4. `AuthProjectionProvider` seeds the UI with the minimal `AuthState`/`CurrentUser` projection.
5. Cross-tab coordination sends semantic invalidation only, never credentials or session payloads.

Use verified claims for navigation decisions and authenticated user lookup for private operations.
Validate third-party response shapes and redirect URLs at the server boundary. Treat a missing
session as anonymous or as the established sanitized session-expiry outcome; never leak provider
messages.

### Data

- Server Components use the server Supabase client.
- Client Components access the single browser Supabase client through `useSupabase()`.
- Feature state and optimistic mutations belong in `DataContext`; do not create extra browser
  Supabase clients.
- Every new table requires RLS, policies scoped with `auth.uid()`, appropriate constraints, and
  indexes justified by its query patterns.

### Privacy and analytics

- Consent is signed and enforced on the server.
- Analytics is optional, anonymous, consent-gated, and server-only.
- Do not add browser analytics secrets, stable user identifiers, or silent tracking fallbacks.

## Code conventions

- Keep TypeScript strict and avoid `any`; validate untrusted data at boundaries.
- Prefer Server Components. Add `"use client"` only when hooks, state, context, or browser APIs
  require it.
- Authenticate inside every private Server Action or route handler; route protection alone is not
  authorization.
- Use the `@/` alias for project imports.
- Follow existing local naming: PascalCase components/types, camelCase functions, and
  `UPPER_SNAKE_CASE` constants. Match the surrounding file convention when legacy filenames differ.
- Reuse existing UI primitives, contexts, hooks, and utilities before adding a parallel abstraction.
- Use `sonner` for toasts and `lucide-react` for icons.
- Preserve responsive behavior, keyboard access, focus handling, labels, and light/dark themes in UI
  changes.
- Keep comments focused on intent, invariants, or non-obvious trade-offs.

## Working agreement

1. Inspect the current worktree before editing. Preserve unrelated tracked and untracked changes.
2. Understand the nearest implementation, tests, ADRs, and issue context before proposing a new
   abstraction.
3. For behavior changes, work test-first: add a failing test, make the smallest implementation pass,
   then refactor.
4. Keep scope narrow. Do not bundle opportunistic migrations, feature additions, or cleanup.
5. Stage explicit paths only. Never use destructive Git commands or overwrite user work.
6. Report which checks ran and distinguish regressions caused by the change from pre-existing
   failures.

## Security

- Never commit `.env*` files other than sanitized templates, API keys, tokens, cookies, or user data.
- Keep server-only modules and credentials out of client bundles.
- Validate inputs with Zod or an equivalent established boundary validator.
- Sanitize same-origin redirects with the shared auth redirect utility; do not implement ad hoc
  redirect validation.
- Preserve rate limiting on auth actions and privacy-preserving rate-limit identifiers.
- Do not expose Supabase sessions, access/refresh tokens, provider error text, or analytics secrets
  in browser-facing results or logs.
- Treat RLS as defense in depth, not a substitute for authenticating private server operations.
- Report vulnerabilities privately rather than opening a public issue.

## Pull requests and commits

- Keep commits focused and use imperative commit subjects.
- Include tests for changed behavior.
- In a handoff or pull-request description, summarize the change, security/architecture impact, and
  exact verification performed.
- Do not claim a check passed unless it was run in the current worktree.
- GitHub Issues are the request and planning surface; see `docs/agents/issue-tracker.md` and
  `docs/agents/triage-labels.md` before changing issue state or labels.

# Project agent instructions

## Source of truth

The current repository is the authoritative source.

Codebase Memory and Engram are navigation and historical-context tools.
Validate their results against the current source before modifying code.

## Context acquisition

Before broad repository exploration:

1. Use Codebase Memory to inspect architecture, symbols, dependencies,
   consumers, call paths and change impact.
2. Identify the smallest relevant set of files.
3. Read the actual source files before editing.
4. Do not infer runtime behavior from the graph alone.

For delegated tasks, pass the project name, qualified symbols, relevant paths
and discovered call-chain evidence to the subagent.

## Persistent memory

Use Engram for:

- architectural decisions;
- verified non-obvious bug causes;
- project-specific conventions;
- rejected approaches and their rationale;
- relevant unfinished work.

Do not save:

- source files;
- generated summaries of the whole repository;
- raw logs;
- temporary command output;
- obvious facts;
- speculative conclusions.

Validate retrieved memories against the current code.

## Shell efficiency

Prefer RTK for verbose commands such as:

- tests;
- linting;
- git diff and git status;
- broad searches;
- directory trees;
- build output.

Use unfiltered commands when exact output is necessary.
Inspect RTK's retained raw failure log before re-running a failed command.

## Change workflow

Before editing:

1. inspect relevant Engram decisions when applicable;
2. query Codebase Memory;
3. inspect actual source and tests;
4. state the intended change and risk surface.

After editing:

1. run focused tests;
2. run relevant static checks;
3. inspect the diff;
4. use Codebase Memory change-impact analysis for transversal changes;
5. save only durable new knowledge to Engram.

## Agent-specific adapters

`AGENTS.md` is the canonical shared instruction surface. Agent-specific files, including
`CLAUDE.md`, should import or point to this file and contain only adapter-specific guidance rather
than duplicating project rules.
