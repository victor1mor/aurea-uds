---
archetype: commerce_finance
patterns: TransactionFlow, AnalyticsWorkbench, IdentityAccess, ReviewCompare
---

# Commerce · finance

Cart, order, payment and reconciliation: a consequential write is
idempotent and a terminal result becomes an immutable receipt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**TransactionFlow** — the checkout is a `.stepper`/`.step`: cart → details →
payment → confirmation. `.flow-panel` with `.flow-summary` and `.flow-total`
always visible; `Banner`/`Alert` for the result; a `Badge` for the order
status. The confirm button shows `loading` and locks resubmission.

**AnalyticsWorkbench** — revenue, MRR, refunds in `KPI`/`.pattern-kpis`;
series in `.chart-line`/`.chart-area` with `.legend`; `DataGrid` as the
tabular alternative (always — a number must be read, not just seen).
`SegmentedControl` for the time range.

**IdentityAccess** — who pays/approves: `Avatar` + `.permission-row` of
roles; sensitive actions (refund) confirm in a `Dialog` with scope.

**ReviewCompare** — reconciliation compares expected ⟷ received in `Tabs` +
`DataGrid`/`CodeBlock`; a discrepancy is approved/adjusted in a `Dialog`; `Timeline`
of the transaction history.

## Capabilities

- **cart** — `DataList` of items + `.flow-summary`; edit quantity inline.
- **order** — `.stepper`; a state `Badge`; a receipt at the end.
- **payment** — method by REFERENCE (saved card as a label). Card/PIX data
  goes to the payment provider — the Aurea UI doesn't collect financial
  secrets in clear text; the field is the provider's (iframe/redirect), not ours.
- **invoice** — an immutable `CodeBlock`/`.memory-entry`; permalink + download.
- **subscription** — state + next cycle in a `Badge`; pause/cancel with scope.
- **refund** — a scope `Dialog` (amount, reason); generates its own receipt.
- **reconciliation** — ReviewCompare expected ⟷ received.

## Invariants

> "consequential writes are idempotent"

Pay/charge/refund carries an idempotency key: resubmitting (double
click, network retry, browser back) does NOT duplicate the effect. The button
locks in `loading`; the same order resubmitted returns the SAME result,
not a second charge.

> "terminal results produce immutable receipts"

Every terminal result — success, failure, refund — produces an immutable receipt
(`.memory-entry`/`CodeBlock`): id, amount, time, hash, permalink.
Cancelling also emits a receipt. Removing the order from view doesn't remove the receipt.

## States

- `loading` — `Skeleton` in the summary and the KPIs.
- `empty` — an empty cart: `EmptyState` with "keep shopping".
- `processing` — a locked button + `Progress`; no resubmission possible.
- `paid`/`failed` — `Badge` + `Banner`; a receipt in both.
- `refunded` — a distinct `Badge`; the refund receipt chained to the original.
- `error` — `Alert` with an idempotent retry; the total doesn't change on its own.
