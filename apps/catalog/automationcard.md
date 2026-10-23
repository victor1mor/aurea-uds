# AutomationCard

A rule that runs on its own: when this, then that — and a switch.

## Usage

```tsx
import {AutomationCard} from "@aurea-uds/react";
```

```tsx
<AutomationCard
  name="Nightly reindex"
  trigger="Every day at 02:00 UTC"
  action="Run the indexer on changed documents"
  enabled
  onToggle={setEnabled}
  lastRun="yesterday, 02:00"
  lastResult="success"
/>
<AutomationCard
  name="Purge stale drafts"
  trigger="On draft older than 30 days"
  action="Move it to the archive"
  onToggle={setEnabled}
  lastRun="6 days ago"
  lastResult="failure"
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `ReactNode` | — | What the rule is called. |
| `trigger` | `ReactNode` | — | The WHEN. Rendered as the term/value pair the house already uses, not as prose: whoever reads this needs to find the condition without scanning a paragraph. |
| `action` | `ReactNode` | — | The THEN. A rule is a condition and a consequence — that pair is what separates this card from AgentCard, which is identity, and from TaskQueue, which is queued work. |
| `enabled` | `boolean` | — | Whether the rule is live. A disabled rule does not disappear and does not change colour: it recedes. Hiding it would hide the very rule someone is looking for in order to switch it back on. |
| `onToggle` | `(enabled: boolean) => void` | — | Without it there is no switch — a read-only card stays read-only instead of showing a control that does nothing. |
| `lastRun` | `ReactNode` | — | When it last fired. |
| `lastResult` | `"success" \| "failure"` | — | How it went, as a Status — so the outcome is a word and not only a colour. |
| `details` | `Array<{term: string; value: ReactNode}>` | — | Extra rows appended after WHEN and THEN in the same list. |
| `actions` | `ReactNode` | — | Buttons for the footer. They enter as nodes, so whoever builds the button knows what it does — the reference dispatches by string, which trades the compiler for a verbal agreement. |
| `className` | `string` | — | On the card. |
| `description` | `ReactNode` | — | One line under the name, saying what the automation does. It is separate from name so the card can lay the two out on its own grid. |
