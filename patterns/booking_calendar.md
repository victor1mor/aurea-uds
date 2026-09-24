---
archetype: booking_calendar
patterns: SchedulePlanner, FormFlow, TransactionFlow, IdentityAccess
---

# Booking · calendar

Book a time slot: availability, customer details, payment and
confirmation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**SchedulePlanner** — `.schedule-grid` for the week (free/taken slots)
and `.agenda-list` for the list view — both views show the SAME
slots. Date navigation with native `Input type="date"` (step 5
decision: keyboard, screen reader and localization come from the browser).

**FormFlow** — a `.stepper` flow with 3 steps: time → details →
payment. `Field` + `Input`/`Select`; recurrence is a `Select` of
ready-made options (weekly, biweekly…), not an RRULE builder.

**TransactionFlow** — summary in `.flow-panel`: service, duration, price,
`.flow-total`. Terminal result (confirmed/declined) in a `Banner` +
receipt with a code.

**IdentityAccess** — identify yourself before paying; account and payment
method visible in the summary. Cancellation/rescheduling requires the same
identity that booked.

## Capabilities

- **availability** — only free slots are interactive; a taken one is visible
  but disabled (it doesn't disappear — emptiness would mislead).
- **recurrence** — a `Select` of ready-made patterns; the created series is listed
  BEFORE confirming ("6 occurrences, through Aug 22").
- **timezone** — the slot's zone appears spelled out next to the time
  on EVERY screen of the flow, not just the first.
- **confirmation** — the final step shows everything (`.flow-summary`) and the button
  states the consequence ("Confirm and pay $120").
- **payment** — in the `.stepper`, before confirmation; a payment failure
  returns to the payment step with the slot still held for N minutes
  (and the deadline visible).

## Invariants

> "timezone is visible before confirmation"

A time never appears without its zone ("2:00 PM — Eastern Time").
If the browser's zone differs from the service's zone, both are shown.

> "conflicts offer an alternate slot"

A slot taken between choice and confirmation → `Alert` within the flow
itself with the 3 nearest free times as a 1-click action.
Never just "unavailable, try again".

## States

- `loading` — `Skeleton` in the shape of the slot grid.
- `empty` — a day with no slots: `EmptyState` with "next available day".
- `conflict` — see the invariant above; a flow state, not a generic error.
- `error` (payment) — `Alert` at the step, data preserved, local retry.
- `success` — `Banner success` + receipt; the calendar reflects the booking.
