---
archetype: file_cloud
patterns: CollectionWorkbench, ResourceWorkbench
---

# Files · cloud

Browse, transfer and restore files with verifiable integrity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**CollectionWorkbench** — `TreeView` for the folder hierarchy (full
keyboard: arrows, Home/End, `aria-expanded` — step 3) + `DataGrid` for the
active folder's contents (name, size, modified; sort and multi-select
native to the grid). `SearchField` searches within the folder scope;
`Breadcrumb` marks the path.

**ResourceWorkbench** — upload via `FileInput` (dropzone with real
type/size validation on the client — step 2); transfer queue with
`.file-list`/`.file-item` + `Progress` per item; `.usage-bars` for
storage quota. File preview in a `Drawer` with `Tabs`
(preview / versions / activity).

## Capabilities

- **browse** — `TreeView` + `DataGrid` + `Breadcrumb`; `ContextMenu` on the
  row (rename, move, restore).
- **transfer** — `FileInput` validates BEFORE queueing (`matchesAccept`,
  `maxSize`); rejections become `FileRejection`s listed with a reason.
- **resume** — an interrupted item stays in the queue with its state and a "resume"
  action; it never disappears silently.
- **checksum** — hash shown in the file panel (inline `CodeBlock`).
- **conflict** — `Dialog` with both versions side by side and an explicit
  choice (keep both / replace); never resolve on its own.
- **restore** — trash is a folder like the others (same `DataGrid`);
  restoring shows the destination before confirming.

## Invariants

> "resume validates checksum"

Resuming a transfer re-verifies the checksum of the already-sent chunk before
continuing; if it diverges, it restarts and reports it (`Alert warning`), it does not
corrupt in silence.

> "restore retains provenance"

A restored item keeps its history (who deleted it, when, from where) in the
activity tab (`Timeline`). Restoring is not creating a new file.

## States

- `loading` — `Skeleton` in the rows; the tree loads per expanded node.
- `empty` — the folder's `EmptyState` with the dropzone as the primary action.
- `syncing` — `Badge` per item + `Progress`; the queue is visible, not modal.
- `conflict` — an explicit state in the queue; blocks only the item, not the queue.
- `error` — per item, with a reason and retry; one failure doesn't take down the batch.
