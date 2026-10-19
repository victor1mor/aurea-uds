# MemoryLedger

What the agent stored, recalled or forgot — and where it came from.

## Usage

```tsx
import {MemoryLedger} from "@aurea-uds/react";
```

```tsx
<MemoryLedger records={[
  {id: "1", content: "Prefers metric units", scope: "semantic",
   operation: "added", time: "10:02", source: "conversation"},
  {id: "2", content: "Old shipping address", scope: "episodic",
   operation: "forgotten", time: "10:41"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `records` | `MemoryRecord[]` | — | One entry per posting, not per memory. A ledger is append-only: "forgotten" does not drop the row, it records the forgetting — and that row is exactly what you go looking for when an agent stops knowing something. |
| `label` | `string` | "Memory ledger" | Accessible name of the list. |
| `className` | `string` | — | On the list. |
