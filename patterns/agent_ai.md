---
archetype: agent_ai
patterns: RunSession, ConversationChannel, ResourceWorkbench, ReviewCompare
---

# Agents · AI

Agent console: conversation, runs with tool calls, explicit approval
and an auditable receipt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**RunSession** — the run is a `Timeline` of turns; each tool call is
an `.invocation` with input/output in `CodeBlock`. Run status in a
`Badge` (accepted → running → waiting_approval → done). `LogStream` for
the raw output; `.approval` for the approval gate; `.trace` links
turn → tool call → result.

**ConversationChannel** — `.message` alternating user/agent, `Avatar`
on both. `NotificationCenter` (step 4) announces arrival off-screen:
the ARRIVAL is a live region, the panel is not.

**ResourceWorkbench** — the context the agent sees: `TreeView` of
files/resources + `Tabs` + `CodeBlock`. What the agent can touch is
visible before it runs.

**ReviewCompare** — every proposed change becomes a before/after diff in
`Tabs` + `CodeBlock`, with approve/reject in a `Dialog` that states the
scope ("changes 3 files").

## Capabilities

- **turns** — `Timeline`; the active turn is marked, history scrollable.
- **tools** — `.invocation` per call: name, arguments, result,
  duration. Collapsed by default, expandable.
- **approval** — `.approval` blocks the run at `waiting_approval`;
  approving requires seeing the diff (ReviewCompare), not just a button.
- **receipts** — a terminal run produces an immutable receipt: id, cost, result,
  hash — rendered in `.memory-entry`/`CodeBlock`, with a permalink.
- **provenance** — each produced artifact points to the run and the turn that
  created it (`Badge` + link).

## Invariants

> "approval is explicit"

No consequential action executes by timeout, default or scroll.
The gate shows SCOPE (what, where, how much) and requires a click/Enter on the
approve control. Cancel is always visible and the same size.

> "a terminal run cannot lose its receipt"

Interrupting or cancelling also emits a receipt (a terminal state ≠ success).
The receipt persists outside the conversation: deleting the chat doesn't delete the receipt.

## States

- `running` — pulsing `Badge` + live `LogStream`; live updates can
  be paused (the stream has a pause, the state isn't lost).
- `waiting_approval` — a highlighted state; `NotificationCenter` announces
  it if the tab is in the background.
- `error` — the failed turn stays in the `Timeline` with the cause; retry creates
  a new turn, it doesn't erase the failed one.
- `offline` — `Banner`; the local conversation stays readable.
