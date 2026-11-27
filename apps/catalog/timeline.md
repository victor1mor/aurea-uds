# Timeline

Chronological sequence of events.

## Usage

```tsx
import {Timeline} from "@aurea-uds/react";
```

```tsx
<Timeline items={[
  {title: "Created", description: "by Curator", time: "09:00"},
  {title: "Shipped", time: "14:20"},
]} />
```

## Examples

### Icons, value and the time between

icon puts a glyph in a round frame in place of the dot; trailing goes to the right of the title; between is written beside the line, up to the next event.

```tsx
<Timeline items={[
  {title: "Report sent", icon: <Icon name="upload-simple" />, time: "Oct 1", trailing: "$1,240", between: "6 days later"},
  {title: "Approved", icon: <Icon name="check-circle" />, tone: "success", time: "Oct 7", trailing: <Badge tone="success">Paid</Badge>},
]} />
```

### Tones

The colour of the icon's frame, with the Badge's words. Without an icon, tone does nothing.

```tsx
<Timeline items={[
  {title: "tone neutral", icon: <Icon name="info" />, tone: "neutral"},
  {title: "tone primary", icon: <Icon name="info" />, tone: "primary"},
  {title: "tone info", icon: <Icon name="info" />, tone: "info"},
  {title: "tone success", icon: <Icon name="info" />, tone: "success"},
  {title: "tone warning", icon: <Icon name="info" />, tone: "warning"},
  {title: "tone danger", icon: <Icon name="info" />, tone: "danger"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TimelineItem[] — {title: ReactNode; description?: ReactNode; time?: ReactNode; icon?: ReactNode; tone?: TimelineTone; trailing?: ReactNode; between?: ReactNode}` | — | The events, rendered as an <ol> because the order IS the information. `time` is a node, so an absolute date and a relative one are equally welcome. `icon` puts a glyph in a 40px round frame in place of the dot (a node on the web, such as <Icon name="check" />; an icon name or drawing on React Native); `tone` colours that frame with the Badge words (neutral, primary, info, success, warning, danger); `trailing` goes to the right of the title; `between` is written beside the line, up to the next item, and never after the last one. One item with an icon gives every item a 40px marker column. Web and React Native. |
| `variant` | `"default" \| "ring" \| "latest" \| "time" \| "contrast"` | "default" | The style, all on the fixed rail that runs under the dots and stops at the last one: default (the solid yellow dot), ring (a hollow dot with a yellow ring), latest (muted dots, only the last one yellow with a halo), time (the time in a column on the left, right-aligned; the rail moves with the dot) or contrast (dots in the text colour). Written as data-timeline-style. Web and React Native; on React Native an item with an icon keeps its frame in every style. |
