---
archetype: regulated_records
patterns: IdentityAccess, CollectionWorkbench, FormFlow, ReviewCompare
---

# Regulated records

Consent, audit, error prevention and retention: least privilege
is visible and a consequential submission includes review and a receipt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**IdentityAccess** — who can do what is explicit: `Avatar` +
`.permission-row` per role, with the ACTIVE privilege visible. An action beyond the
role doesn't appear enabled; elevating access confirms in a `Dialog` with scope.

**CollectionWorkbench** — records in a `DataGrid` with an audit trail;
`SearchField` + faceted `MultiCombobox`. Each row links to its history
(append-only `Timeline`).

**FormFlow** — entry with error prevention: `Field` + per-field validation
(`.field-error`), a `.stepper` with a review step before submitting.
Consent is an explicit `Checkbox`, recorded with a time.

**ReviewCompare** — before submitting/changing, `Tabs` + `CodeBlock`/`DataGrid`
show what changes; confirming generates an immutable receipt (`.memory-entry`).

## Capabilities

- **consent** — an explicit `Checkbox` per purpose; recorded (who/when);
  revocable, and the revocation is recorded too.
- **audit** — an append-only `Timeline` per record; immutable, exportable.
- **error prevention** — per-field validation + a review step + scope
  confirmation; nothing consequential in one click.
- **retention** — `Badge`/`.time-display` of the retention deadline; purging is
  an action with scope and a receipt, never silent.

## Invariants

> "least privilege is visible"

What the current role CAN do is explicit (`.permission-row`); what it cannot do
doesn't appear enabled waiting for an error. Elevated privilege is temporary,
visible and recorded. The user sees their own scope — no hidden power.

> "consequential submission includes review and receipt"

A consequential submission always has TWO things: a review step
(ReviewCompare — what will be written) BEFORE, and an immutable receipt AFTER (id,
content, time, hash, author). No blind submitting; no action without proof.

## States

- `loading` — `Skeleton` in the list and the form.
- `empty` — `EmptyState` as far as the role allows creating.
- `reviewing` — the `.stepper` review step; going back is possible.
- `submitted` — an immutable receipt shown and linked to the record.
- `denied` — an action beyond the role: an `Alert` explains the required privilege.
- `error` — `Alert`; the draft and the consent given remain.
