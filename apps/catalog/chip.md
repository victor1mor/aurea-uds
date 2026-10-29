# Chip

Another name for Badge, for those who know this piece as a chip. Identical in everything: the same props, the same look, the same behaviour.

## Usage

```tsx
import {Chip} from "@aurea-uds/react";
```

```tsx
<Cluster>
  <Chip tone="success">Paid</Chip>
  <Chip tone="primary" emphasis="solid">New</Chip>
  <Chip tone="blue">Design</Chip>
</Cluster>
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
| `ring` | `boolean` | — | A finish the app chooses (ADR-0086): around a badge that is not solid, its tone at 30%, inside the edge — it never changes the size. It is a line — the named exception to "no line", only when chosen. Writes data-ring; the same attribute on a container (or <html>) covers the badges inside, and ring={false} takes one out. On solid it draws nothing. Web and native. |
