# Progress

Progress shows how far a task has gone. With a value it is determinate; without one it is indeterminate — the total is not known yet, and a piece runs across the track instead of a 0% that reads as stalled. The anatomy is the reference library's ProgressBar: the detail above, on the end side, and the track below.

## Usage

```tsx
import {Progress} from "@aurea-uds/react";
```

```tsx
<Progress value={64} label="Uploading" />
<Progress label="Counting files" />
```

- No value, no aria-valuenow: the bar never announces a 0% it does not mean.

- With reduced motion the indeterminate bar does not run — it fills and dims, and never stands still at 40%.

- A text detail is heard once, inside aria-valuetext ("64%, 2.3 MB/s").

- Tone uses Button's closed list: paused is neutral, failed is danger. Every tone keeps 3:1 against the track.

## Examples

### Detail

Speed, time left, bytes — small, muted, with figures of equal width so the numbers do not jitter.

```tsx
<Progress value={64} label="Uploading" detail="2.3 MB/s · 12 s left" />
<Progress label="Counting files" detail="1,204 files" />
```

### Tone

What the colour means. Paused is neutral; failed is danger.

```tsx
<Progress value={40} label="Paused" tone="neutral" detail="Paused" />
<Progress value={100} label="Done" tone="success" detail="Done" />
<Progress value={72} label="Disk" tone="warning" detail="72% full" />
<Progress value={58} label="Upload" tone="danger" detail="Failed at 58%" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | Percentage, 0 to 100. Clamped once and used for both the fill and aria-valuenow, so what is drawn and what is announced cannot drift apart. Without a value the bar is indeterminate: a piece two fifths wide runs across the track — the reference library's numbers, 1.5 s — instead of a 0% that reads as stalled. With reduced motion it does not run: the whole bar, dimmed, never a still piece that would read as 40% done. |
| `label` | `string` | — | Accessible name of the bar. Not drawn. Without it the screen reader announces a bare number with no subject. |
| `detail` | `ReactNode` | — | Supporting text above the track, on the end side — the reference library's ProgressBar.Output: speed, time left, bytes. Small, muted, tabular figures. As text it also becomes aria-valuetext; anything else (a link) stays where it is for the screen reader to reach. |
| `tone` | `brand \| neutral \| success \| warning \| danger \| info` | brand | What the fill colour means — the same closed list as Button's tone. Paused is neutral; failed is danger. Every tone keeps 3:1 against the track in both themes, except brand in the light theme (the brand gold is a fill, ADR-0054). |
| `showLabel` | `boolean` | false | shows the label above the bar, at the start (the reference library's progress bar). Without it, label only names the bar for screen readers. |
| `showValue` | `boolean` | false | shows the value ("60%") above the bar, at the end, when there is no detail. |
| `size` | `"sm" \| "md" \| "lg"` | "md" | The track: 4, 8 or 12 thick — the reference library's. |
| `className` | `string` | — | Goes on the outer box, the one that holds the detail and the track. |
