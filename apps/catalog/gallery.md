# Gallery

A grid of pictures you can pick from, and enlarge in the dialog that already exists.

## Usage

```tsx
import {Gallery} from "@aurea-uds/react";
```

```tsx
<Gallery
  label="Product photos"
  items={photos}
  selected={chosen}
  onSelect={setChosen}
  zoom
/>
```

## Examples

### Choosing several

With selectionMode="multiple" every tile is a toggle: click to add or remove it, in the order chosen.

```tsx
<Gallery
  label="Photos to share"
  items={photos}
  selectionMode="multiple"
  selectedIds={chosen}
  onSelectionChange={setChosen}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{id, src, alt, caption?, kind?, duration?}>` | — | The pictures, as data — the same idiom as Timeline, DataList and Stepper. Each tile renders an <Image>, so the reserved box and the broken-source fallback come with it. `kind: "video"` puts the house Badge on the photo, with `duration` (seconds) as m:ss — the media player's format — and "Video" for screen readers. Without `kind`, it is a photo, as before. |
| `selected` | `string` | — | The id of the chosen item. The gallery keeps no selection of its own: in the MediaLibrary archetype the library, the detail panel and the player share ONE constant, and three parallel strings that happen to agree today is the I1 finding waiting for the first rename. |
| `onSelect` | `(id: string) => void` | — | Called on click. Without it and without zoom the tiles are not buttons at all — a button that does nothing is a focus stop that lies to anyone on a keyboard. |
| `selectionMode` | `"single" \| "multiple"` | "single" | The reference library's name for it. With "multiple", every tile is a toggle button (aria-pressed) with the same .is-selected mark as everywhere else, clicking marks instead of zooming, and the chosen ids come from selectedIds. |
| `selectedIds` | `string[]` | — | The chosen tiles when selectionMode is "multiple". The gallery keeps no choice of its own, as with `selected`. |
| `onSelectionChange` | `(ids: string[]) => void` | — | The new list after a tile is toggled, in the order they were chosen. The same name as DataGrid. |
| `hasMore` | `boolean` | false | There is more after the last tile. A row after the grid (the measure of the reference library's load-more table row) is watched, and calls onReachEnd when it enters the screen. |
| `loading` | `boolean` | false | A part is on its way: the row shows the Spinner, the list is aria-busy, and onReachEnd is not called again until it ends. |
| `onReachEnd` | `() => void` | — | Called when the end row is on screen and nothing is loading. If the new part does not fill the screen, it is called again. |
| `zoom` | `boolean` | false | Clicking also enlarges the picture in the Dialog this library already has — focus trap, Escape and backdrop included. No second floating surface is born for this. |
| `ratio` | `string` | 1/1 | Aspect ratio of every tile, passed straight to Image. Square by default because a grid of mixed ratios is a ragged grid. |
| `label` | `string` | Gallery | Accessible name of the list. Name it for what it holds — two unnamed galleries on a page announce the same thing twice. |
| `--gallery-min` | `CSS custom property` | 8rem | Minimum tile width. The grid fills with as many columns as fit, so the container decides the count, not a prop. Same escape valve as --carousel-slide. |
