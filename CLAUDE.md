# Claude Code instructions

@AGENTS.md

`AGENTS.md` is the canonical source of repository-wide project instructions. Follow it in full and
keep this file limited to Claude Code integration notes.

## Working in this repository

- Read the relevant `docs/adr/` records and `CONTEXT.md` when present before architectural changes.
- When a task matches a workflow in `.agents/skills/`, load its `SKILL.md` before implementation and
  follow the workflow rather than reproducing it here.
- Use Bun and the exact scripts documented in `AGENTS.md`; in particular, use `bun run build` and
  `bun run test`, not Bun's similarly named built-ins.
- Check `git status` before and after edits. Preserve unrelated changes and stage explicit paths.
- Prefer focused discovery and verification. Do not read secrets from `.env` files or include them in
  prompts, output, commits, or logs.
- Keep progress updates concise and finish with the files changed and checks actually run.

# Claude Code instructions

Follow AGENTS.md as the primary project workflow.

## Codebase Memory

Use Codebase Memory before broad Grep/Glob exploration when the task concerns:

- architecture;
- symbol discovery;
- consumers;
- call paths;
- dependency impact;
- cross-module changes.

Do not skip reading current source before editing.

## Delegation

Before delegating repository work, gather structural context in the parent
session and pass concrete project names, qualified symbols, paths and graph
evidence to the subagent.

## Compaction recovery

After context compaction:

1. recover durable project context from Engram;
2. re-check the current git diff;
3. verify the active Codebase Memory project;
4. continue from current repository state, not memory alone.

If this file conflicts with `AGENTS.md`, follow `AGENTS.md` unless the user explicitly directs
otherwise.
