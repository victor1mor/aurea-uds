---
archetype: support_service
patterns: ConversationChannel, CollectionWorkbench, SchedulePlanner, RunSession
---

# Support · service

Inbox, case history, SLA and escalation: the identity of the case and the
channel stays visible and escalating records a reason and an owner.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**ConversationChannel** — the case conversation in `.message` + `Avatar`;
`.status-dot` of the agent's presence. `NotificationCenter` notifies of a new reply.
The header pins the case (id, customer, channel) outside what scrolls.

**CollectionWorkbench** — the inbox/queue is a `DataGrid`: priority, SLA remaining,
state, owner. `SearchField` + faceted `MultiCombobox` (queue,
severity, channel). `SegmentedControl` for "my cases" ⟷ team queue.

**SchedulePlanner** — SLA windows and scheduled follow-ups in `.agenda-list`;
native `Input type="date"`; `.time-display` for the SLA clock.

**RunSession** — service automations (macros, bots) as a run:
`Timeline`/`.invocation`; escalation is an event with `.approval` and a receipt.

## Capabilities

- **inbox** — a `DataGrid` of the queue; sort by SLA/priority; assign.
- **case history** — an append-only `Timeline` of the case: messages, changes, escalations.
- **SLA** — `Badge`/`.time-display` of the time remaining; an alert as it expires.
- **escalation** — a `Dialog` that requires a reason + a new owner; becomes an event.

## Invariants

> "case and channel identity remain visible"

The case id, customer and channel (email/chat/phone) stay pinned in the header,
outside the conversation's scroll. You never lose track of which case or channel you're
replying to; switching cases is an explicit action, not a scroll effect.

> "escalation records reason and owner"

Escalating is not a silent button: a `Dialog` requires a REASON and a new OWNER, and the
act enters the case `Timeline` (who escalated, to whom, why, when). No
anonymous escalation; the chain of responsibility stays auditable.

## States

- `loading` — `Skeleton` in the queue and the conversation.
- `empty` — a zeroed inbox: `EmptyState` ("no cases in the queue").
- `open`/`pending`/`resolved` — a state `Badge`; SLA running on the open ones.
- `sla_breach` — a highlighted `Alert`/`Badge`; the case rises in the queue.
- `escalated` — `Badge` + an event in the `Timeline`; the new owner visible.
- `error` — `Alert`; the case conversation stays readable.
