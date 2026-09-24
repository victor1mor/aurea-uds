---
archetype: media_streaming
patterns: MediaLibrary, CaptureTranscript, ResourceWorkbench
---

# Media · streaming

An audio/video library with queue, playlists, tracks and chapters.
A library action doesn't interrupt what's playing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**MediaLibrary** — `MediaPlayerShell` is the player; `.media-library-row`
lists the items, `.media-compact` in the dense view and `.queue-list` for the
queue (`.queue-index` numbers it). Playing a library item ENQUEUES or
replaces by an explicit choice — it doesn't hijack the current playback.

**CaptureTranscript** — a synchronized caption/transcript: a `Timeline` of
chapters (jump by point), `LogStream`/`.memory-entry` for the running
transcript text, `.trace` links a text passage → time in the media.
Capturing (recording) requires explicit consent before it starts.

**ResourceWorkbench** — the item's tracks and resources: `TreeView`
(audio/caption/chapters) + `Tabs` + `CodeBlock` for technical metadata.
`.usage-bars` for bitrate/usage when relevant.

## Capabilities

- **library** — `.media-library-row`/`.media-compact`; search and facets
  as in the catalog (`SearchField` + `MultiCombobox`).
- **queue** — a reorderable `.queue-list`; removing from the queue doesn't skip the current one.
- **playlist** — a named collection of items; saves and reloads the order.
- **tracks** — `TreeView`/`Select` of tracks (audio language, caption).
- **chapters** — a `Timeline` of chapters; clicking jumps the `.media-seek`.
- **resume** — resumes from the saved point; the consumer holds the position.

## Invariants

> "library actions never interrupt playback unexpectedly"

Browsing, faceting, editing metadata or reordering the queue does NOT stop
playback. Only the player controls (`.media-control`) change what plays,
and by an explicit action. Switching tracks within the SAME item is allowed;
leaving for another item asks for confirmation if something is playing.

> "capture requires consent and provenance"

Recording/capturing doesn't start without explicit consent (a `Dialog` of
scope: what, for how long). All captured material carries
provenance — origin, time, author — in `.memory-entry`, and this persists
with the artifact.

## States

- `loading` — `Skeleton` in the list; `.media-placeholder` in the player.
- `playing`/`paused` — `.media-state` reflects it; `Badge` on the active queue item.
- `buffering` — `.media-seek-buffered` shows what's loaded; controls alive.
- `empty` — an empty library: `EmptyState` with import.
- `capturing` — a persistent recording indicator (never hidden).
- `error` — `Alert` in the player; the queue stays intact.
