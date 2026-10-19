# Transaction flow

What is being bought, what it adds up to, which saved method pays for it, and — before anything is charged — the consequence in one sentence. Every terminal result leaves an immutable receipt with the idempotency key, so a double click has an answer. A refund points back at that receipt instead of erasing it.

## Usage

```tsx
import {Status, Alert, DataList, Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about the TRANSACTION, so it comes from its own state
// machine. This contract has no "actions" region, so each action lives in the region it
// affects: refund in `reversal`, cancel and authorize in `review`, next to the sentence
// that says what they will do. Three of the six actions have no transition at all, and
// settle/fail/dispute are transitions without an action — the acquirer settles, the
// network declines, and the cardholder disputes through the issuer. Never this screen.
const actions = allowedFrom(tx.state);   // settled -> ["refund"]

// Money is an INTEGER in minor units: there is still no decimal type in JavaScript
// (TC39 Decimal is stage 1). Sum in integers, divide by 100 only to format.
const total = subtotal + fees.reduce((t, f) => t + f.cents, 0);
const money = new Intl.NumberFormat(locale, {style: "currency", currency, currencyDisplay: "code"});
const show = cents => money.format(cents / 100);

<div className="stack">
  {/* Status says what state it is IN; the Alert announces what just happened —
      Alert is role="status" on its own, and role="alert" when it is a failure */}
  <div role="group" aria-label="Status">
    <div className="cluster" style={{justifyContent:"space-between"}}>
      <strong>{tx.id} · {tx.reference}</strong>
      {/* requires_action IS the universal waiting_user (ADR-0018): pass the state and
          the sentence comes from the vocabulary, so there is no second wording */}
      {tx.state === "requires_action"
        ? <Status state="waiting_user" />
        : <Status variant={tone[tx.state]}>{label[tx.state]}</Status>}
    </div>
    {notice && <Alert variant={notice.variant}>{notice.text}</Alert>}
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <div>
      <div role="group" aria-label="Items">
        <DataList items={tx.items.map(i => ({term: i.label, value: show(i.cents)}))} />
      </div>
      {/* the total is SUMMED, never written beside the numbers it sums */}
      <div role="group" aria-label="Amounts">
        <DataList items={[{term:"Subtotal", value: show(subtotal)},
                          ...fees.map(f => ({term: f.label, value: show(f.cents)})),
                          {term:"Total", value: <strong>{show(total)}</strong>}]} />
      </div>
    </div>
    <div>
      {/* the method is a REFERENCE to something the provider holds. No card number, no
          CVV, no expiry: under PCI DSS 4.0.1 those fields belong to the provider's
          iframe or redirect, never to this page */}
      <div role="group" aria-label="Payment"><DataList items={tx.method} /></div>
      {/* immutable receipt on every terminal result, and it carries the idempotency key —
          the only thing that answers "did the double click charge me twice?" */}
      {tx.receipt &&
        <div role="group" aria-label="Receipt"><DataList items={tx.receipt} /></div>}
    </div>
  </div>

  {/* amount, currency, fees and CONSEQUENCE before the commit — the number inside the
      sentence is the same show(total), so the two can never disagree */}
  {!tx.receipt &&
    <div role="group" aria-label="Review">
      <div className="hint">{card} will be charged {show(total)} once. Retrying with the
        same Idempotency-Key does not charge twice.</div>
      {review.length > 0 && <Toolbar label="Review decision">…</Toolbar>}
    </div>}

  {/* a reversal never erases: it points back at the original receipt */}
  {(tx.reversal || refund.length > 0) &&
    <div role="group" aria-label="Reversal">
      {tx.reversal && <div className="hint">{tx.reversal}</div>}
      {refund.length > 0 && <Toolbar label="Reversal">…</Toolbar>}
    </div>}
</div>
```
