# Badge

Badge is short metadata in a pill — and, with `anchor`, the counter that rides on the corner of something else. One component covers both because they are the same object: a small mark that qualifies what is next to it.

## Usage

```tsx
import {Badge} from "@aurea-uds/react";
```

```tsx
<Badge variant="success">Ready</Badge>
<Badge variant="success" emphasis="outline">Ready</Badge>
<Badge variant="success" emphasis="solid">Ready</Badge>
```

- Three emphases — `soft` (the tinted pill), `outline`, and `solid`. All 36 combinations of variant × emphasis × theme were measured for contrast; the lowest is 5.6:1.

- Three sizes. `md` is the historical one and did not move, so nothing that already used Badge changed by a pixel.

- Accessories: a status `dot`, a round `image`, and `leading`/`trailing` nodes.

- Numbers: `count` with `max` (over it, `99+`) and `showZero` — zero hides itself, because an empty inbox does not deserve a mark. `formatBadgeCount` is exported so your accessible name can say the same string the eye sees.

- `anchor` hangs it on a corner of any child, with `anchorShape="circle"` pulling it 14% back for round parents. A cutout ring in the surface colour keeps it from melting into the icon; override `--badge-ring` when the surface is not the page background.

- An anchored badge is aria-hidden ON PURPOSE: the count belongs in the accessible name of the thing it decorates. A bell announced as "bell 8" tells nobody what the 8 is.

## Examples

### Flat

The soft tone without the line around it — the reference's release badge at the top of this site.

```tsx
<Badge tone="primary" emphasis="flat" leading={<Icon name="rocket" />}>What's new</Badge>
<Badge tone="success" emphasis="flat">Ready</Badge>
```

### Sizes, and what goes inside

A status dot, a round picture, or a glyph before and after the text.

```tsx
<Badge size="sm" dot variant="success">Online</Badge>
<Badge size="md" image="/ana.jpg" imageAlt="">Ana</Badge>
<Badge size="lg" trailing={<Icon name="arrow-right" />}>Next</Badge>
```

### Counting, and the ceiling

Over `max` it reads `99+`. Zero hides itself unless you ask for it — that is the same rule the reference implementations settled on.

```tsx
<Badge count={5} emphasis="solid" variant="danger" />
<Badge count={100} emphasis="solid" variant="danger" />
<Badge count={1000} max={999} emphasis="solid" variant="danger" />
```

### anchor — the counter on the corner

Pass the thing being decorated as children. The count goes in ITS accessible name; the badge itself is hidden from screen readers.

```tsx
<Badge anchor="top-end" count={8} emphasis="solid" variant="danger">
  <IconButton icon="bell" label="Notifications, 8 unread" />
</Badge>
```

### anchorShape — square corner, or round

On a circle the badge is pulled 14% back into the corner. Without that it floats off the edge, which is the giveaway of a counter glued on by hand.

```tsx
<Badge anchor="bottom-end" anchorShape="circle" dot variant="success">
  <Avatar alt="Ana Prado" fallback="AP" />
</Badge>
```

### Every tone

Six tones that carry meaning, four for the state of a job, and eight category colours that mark a group and say nothing about health. There is no yellow: it belongs to the brand. Pair the colour with a word.

```tsx
<Badge tone="neutral">Neutral</Badge>
<Badge tone="primary">Primary</Badge>
<Badge tone="info">Info</Badge>
<Badge tone="success">Success</Badge>
<Badge tone="warning">Warning</Badge>
<Badge tone="danger">Danger</Badge>
<Badge tone="running">Running</Badge>
<Badge tone="paused">Paused</Badge>
<Badge tone="offline">Offline</Badge>
<Badge tone="review">In review</Badge>
<Badge tone="red">Red</Badge>
<Badge tone="orange">Orange</Badge>
<Badge tone="green">Green</Badge>
<Badge tone="teal">Teal</Badge>
<Badge tone="cyan">Cyan</Badge>
<Badge tone="blue">Blue</Badge>
<Badge tone="violet">Violet</Badge>
<Badge tone="pink">Pink</Badge>
```

### Four sizes

`xs` is 16 high and borderless: the counter that rides on an icon, the one BottomNav asks for. `md` is the default.

```tsx
<Badge tone="primary" emphasis="solid" size="xs">3</Badge>
<Badge tone="primary" emphasis="solid" size="sm">Small</Badge>
<Badge tone="primary" emphasis="solid" size="md">Medium</Badge>
<Badge tone="primary" emphasis="solid" size="lg">Large</Badge>
```

### anchor — all four corners

The counter hangs off any corner of the thing it decorates. Each count lives in the accessible name of the button; the badge stays hidden from screen readers.

```tsx
<Badge anchor="top-start" count={2} emphasis="solid" tone="danger">
  <IconButton icon="bell" label="Alerts, 2 unread" />
</Badge>
<Badge anchor="top-end" count={8} emphasis="solid" tone="danger">
  <IconButton icon="bell" label="Notifications, 8 unread" />
</Badge>
<Badge anchor="bottom-start" count={1} emphasis="solid" tone="danger">
  <IconButton icon="bell" label="Reminders, 1 due" />
</Badge>
<Badge anchor="bottom-end" count={5} emphasis="solid" tone="danger">
  <IconButton icon="bell" label="Mentions, 5 new" />
</Badge>
```

### fit — as wide as the text

Inside a column a badge follows the column's width. `fit="content"` keeps it as wide as its text and leaves the row alone.

```tsx
<Stack>
  <Badge tone="info">Follows the column</Badge>
  <Badge tone="info" fit="content">As wide as its text</Badge>
</Stack>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `neutral \| primary \| info \| success \| warning \| danger \| running \| paused \| offline \| review \| red \| orange \| green \| teal \| cyan \| blue \| violet \| pink` | neutral | Tone of the label. The four operational ones exist because the state of a job is metadata as often as it is a condition; when it is a condition standing on its own, use Status. The eight colour names (red, orange, green, teal, cyan, blue, violet, pink) are CATEGORIES, not states — they mark a group (a section, a type of item) and say nothing about health. They skip yellow, which belongs to the brand, and pass AA in both themes in all three emphases. Pair the colour with a word or a leading icon: colour alone is never the label. |
| `tone` | `BadgeVariant` | — | The colour, with the native package's name — the same names on web and native. The same axis as variant; it wins when both are given. |
| `emphasis` | `soft \| outline \| solid \| flat` | soft | How loud the tone is. `soft` is the tinted pill you already know; `outline` is contour only; `solid` fills with the accent and is what a notification counter wants. All 36 combinations of variant × emphasis × theme were measured for contrast — the lowest is 5.6:1, and the skin spec keeps it that way. flat is the soft tone without the line around it, as the reference's chip. |
| `size` | `xs \| sm \| md \| lg` | md | `md` is the historical size and did not move, so nothing that already uses Badge changed. `xs` (16px, borderless) is the counter that rides on an icon — it is what BottomNav asks for; `sm` sits between them; `lg` is for a standalone label. Every size is its OWN class, never a contextual override: `geometry.spec` holds `.badge` to one height per page, and a rule that shrank it by context reproved — correctly. |
| `dot` | `boolean` | false | A status dot before the text, inheriting the current colour. With `anchor` and nothing to show, the dot IS the badge — the plain 8px mark that means "something new". |
| `leading / trailing` | `ReactNode` | — | A glyph before or after the text. They take a NODE, not an icon name, and that is a boundary decision, not laziness: Icon reads the sprite through a hook, so importing it here would drag this module to the client and undo the 118.5 KB that ADR-0026 saved. |
| `image / imageAlt` | `string` | — | A round picture at the start — an avatar or a flag. Empty alt when it is decorative, which is the usual case beside a name. |
| `count / max / showZero` | `number / number / boolean` | — / 99 / false | Numeric content. Over `max` it reads `99+`. Zero hides itself unless `showZero`, because an empty inbox does not deserve a mark. `formatBadgeCount(count, max)` is exported so the accessible name can say the same string the eye sees. |
| `fit` | `"auto" \| "content"` | "auto" | `content` keeps the badge as wide as its text even inside a column. The default follows the container, and that was measured: `.stack` declares no `align-items`, so a badge inside it stretches (300 px in a 300 px column, 55 px loose in a block). Implemented as `inline-size: fit-content`, not `align-self`, so a badge in a row keeps its vertical centring. Ignored with `anchor`. The native Badge takes the same prop. |
| `anchor` | `top-end \| top-start \| bottom-end \| bottom-start` | — | Switches to the OVERLAY shape: `children` becomes the thing being decorated (a bell, an avatar, a menu row) and the badge hangs off that corner. Without it, `children` is the pill's content and nothing about the old usage changes. |
| `anchorShape` | `square \| circle` | square | `circle` pulls the badge 14% back into the corner — the `overlap` of one of the references, and the number is theirs, measured in their source. Without it a counter on a round avatar floats off the edge. |
| `invisible` | `boolean` | false | Hides the overlay without moving the child. Use it when the count is loading rather than absent. |
| `children` | `ReactNode` | — | The label — or, with `anchor`, the element being decorated. Short by construction: it is a pill, and a badge that wraps to a second line is a sentence in the wrong component. |
| `badgeContent` | `ReactNode` | — | What the overlay shows when it is not a number. Named after a reference library's prop and not `content`, which collides with the HTML attribute of that name. |
