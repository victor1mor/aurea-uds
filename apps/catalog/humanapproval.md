# HumanApproval

The gate: what is about to happen, and a person's decision.

## Usage

```tsx
import {HumanApproval} from "@aurea-uds/react";
```

```tsx
<HumanApproval
  title="Delete 12 archived records"
  risk="high"
  details={[{term: "Table", value: "invoices"}, {term: "Rows", value: "12"}]}
  onApprove={() => {}}
  onDeny={() => {}}
/>
```

## Examples

### Risk

How much the action can break. The word goes on the card; the colour only repeats it.

```tsx
<HumanApproval title="Send the weekly report (low risk)" risk="low" />
<HumanApproval title="Send the weekly report (medium risk)" risk="medium" />
<HumanApproval title="Send the weekly report (high risk)" risk="high" />
```

### Decided

Once decided, the pair of buttons becomes the result instead of disappearing, so the trace of the choice stays.

```tsx
<HumanApproval title="Send the weekly report (approved)" risk="low" decision="approved" />
<HumanApproval title="Send the weekly report (denied)" risk="low" decision="denied" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | What is being asked for. Names the region for a screen reader when it is a string. |
| `description` | `ReactNode` | — | What will happen if this is approved, in plain words. |
| `details` | `Array<{ term: string; value: ReactNode }>` | — | The exact parameters, as a DataList and not as prose: whoever approves needs to read what will actually run, and a paragraph hides a file path in the middle of a sentence. |
| `risk` | `"low" \| "medium" \| "high"` | — | Three steps, measured from the reference. |
| `reasoning` | `ReactNode` | — | Why the agent wants this. |
| `deadline` | `ReactNode` | — | When the decision is due. Shown as text — expiry is yours to enforce, because only you know what happens when it lapses. |
| `decision` | `"approved" \| "denied"` | — | Once decided, the pair of buttons becomes the RESULT instead of disappearing. Disappearing erases the trace of what the person chose, and that is the difference between a record and a tidy screen. |
| `onApprove` | `() => void` | — | Fires on approve. |
| `onDeny` | `() => void` | — | Fires on deny. Deny comes FIRST in reading and tab order: the destructive action should not be the first to take focus nor the easiest to hit without reading. |
| `className` | `string` | — | On the region. |
