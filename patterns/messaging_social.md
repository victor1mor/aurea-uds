---
archetype: messaging_social
patterns: ConversationChannel, CollectionWorkbench, MediaLibrary
---

# Messaging · social

Conversations, threads and feed: presence and read are signals, not permissions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**ConversationChannel** — `.message` alternating author, `Avatar` + `.status-dot`
of presence. `NotificationCenter` (step 4) announces off-screen arrival:
the ARRIVAL is a live region (`role="log"`/`aria-live`), the history is not. Mentions
become a `Badge`/link in the message body.

**CollectionWorkbench** — the list of conversations/threads is a `DataList`;
`SearchField` over messages, `MultiCombobox` to facet (channel, person,
unread). `Pagination`/scroll with `Skeleton` on load.

**MediaLibrary** — media attachments use `.media-compact`; opening enlarges in a
`Dialog` (lightbox, focus trapped). `MediaPlayerShell` for inline audio/video.

## Capabilities

- **threads** — a nested conversation; the root and the thread share a visible
  identity (`Breadcrumb`/channel header).
- **delivery** — per-message state in `.status-dot`/`Badge` (sent →
  delivered), separate from read.
- **presence** — `.status-dot` on the `Avatar`; it's a HINT, not access control.
- **comments** — replies in `.message` under the root; count visible.
- **mentions** — `Badge`/link; announces via `NotificationCenter` to the mentioned person.
- **sharing** — forward in a `Dialog` with scope (to whom, what).

## Invariants

> "presence never grants permission"

Being online/visible does NOT grant access to anything. Presence (`.status-dot`) is a social
signal; permission comes from a role (`.permission-row`), verified separately.
No one enters a channel by being "present" — the gate is explicit.

> "delivery and read state remain distinct"

Delivered ≠ read. They are two separate signals (`.status-dot`/`Badge`), never
collapsed into one. "Delivered" doesn't imply seen; the UI shows both stages
and never infers a read from a delivery.

## States

- `loading` — `Skeleton` in the list and the bubbles.
- `empty` — no conversations: `EmptyState` with "start a conversation".
- `sending` — an optimistic message with a pending `.status-dot`; a failure marks retry.
- `unread` — a counter on the channel; an unread dot (as in the NotificationCenter).
- `error` — `Alert`/retry per message; the history stays readable.
- `offline` — `Banner`; a local send queue, delivered on reconnect.
