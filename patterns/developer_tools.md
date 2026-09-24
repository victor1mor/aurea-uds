---
archetype: developer_tools
patterns: AppShell, ResourceWorkbench, ContentWorkbench, RunSession, ReviewCompare
---

# Developer tools

Dev IDE/platform: workspace, files, editor, terminal, tests,
builds and artifacts. Every output correlates; a dangerous command shows its scope.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AppShell** — `AppShell` with a side navigation bar and a `Breadcrumb`
of the current path (repo › folder › file). `CommandPaletteShell` to jump
to a file/command. `Banner` for the environment state (broken build, offline).

**ResourceWorkbench** — the project tree in a `TreeView`
(`.file-list`/`.file-item`); `Tabs` for open file tabs;
`.usage-bars`/`.health-matrix` for workspace resources.

**ContentWorkbench** — the editor in `.doc-main`; `CodeBlock` for
viewing; `Tabs` Edit ⟷ Preview. (The editor's React API is
Phase 5 step 3 — CodeMirror; here the recipe composes its slot.)

**RunSession** — terminal, tests and builds are runs: `LogStream` per
run, `.invocation`/`.trace` per command, a `Badge` for state
(running/passed/failed), `Progress` for the build. Live `.event-stream`;
artifacts in `.memory-entry` with a permalink.

**ReviewCompare** — code diffs in `Tabs` + `CodeBlock`; approve/
revert in a `Dialog` with scope. `Timeline` of the build/deploy history.

## Capabilities

- **workspace** — `AppShell` + `TreeView`; multiple projects via `Select`.
- **files** — `.file-list`/`.file-item`; open in a tab (`Tabs`).
- **editor** — CodeEditor slot (Phase 5.3); `CodeBlock` for reading.
- **terminal** — interactive `LogStream`; command and output in the same flow.
- **tests** — a run with a passed/failed `Badge`; a failure opens the snippet.
- **builds** — `Progress` + `LogStream`; an artifact at the end.
- **artifacts** — `.memory-entry`/`CodeBlock`: id, hash, permalink.
- **rollback** — revert a build/deploy via ReviewCompare with scope.

## Invariants

> "all outputs share correlation IDs"

Terminal, test, build and artifact of one action carry the SAME correlation
id, visible in `Badge`/`.trace`. From log to artifact you can
follow the chain; nothing is orphan output. Filtering by id joins everything from the run.

> "dangerous commands disclose scope before execution"

A destructive command (delete, overwrite, deploy to production) shows the
scope BEFORE running — a `Dialog` with what will be affected and where. It doesn't
execute by default, timeout or a distracted Enter; confirming requires reading the
scope, and cancel is the same size.

## States

- `loading` — `Skeleton` in the tree and the editor.
- `empty` — an empty workspace: `EmptyState` with clone/open project.
- `running` — a pulsing `Badge` + live `LogStream`/`Progress`.
- `passed`/`failed` — test/build result; a failure leads to the snippet/log.
- `dangerous` — scope confirmation required before acting.
- `error` — `Alert`; the workspace and open files remain.
