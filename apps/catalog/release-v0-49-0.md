# v0.49.0

The network map lets go of the selected node when you click the empty canvas or press Escape.

`DependencyGraph` can now clear its selection. Read "Breaking changes" if you pass `onSelect`.

## Breaking changes

- **`onSelect` on `DependencyGraph` now receives `string | null`**: `null` when the selection is cleared. A handler that only accepts a string (`(id: string) => …`, or the setter of a `useState<string>()`) stops compiling — accept `null`, as `selectedId` already does.
- **`graphSelectionCleared`** is a new phrase in `AureaStrings` ("No node selected"): what the screen reader hears when the map clears the selection. If you build the whole dictionary yourself, add it.

## Fixed

- **`DependencyGraph`: a click on the empty canvas and Escape clear the selected node.** Before, only choosing another node took the selection away, and the app had no way to know the click landed outside. Dragging to pan does not clear it. When Escape clears the selection it stops there, so a dialog around the map stays open; with nothing selected it passes on as before, and inside a text field it belongs to the field. In the editable mode the engine's own selection is cleared too, and `onSelectionChange` receives an empty list.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.49.0 @aurea-uds/core@0.49.0 @aurea-uds/fonts@0.49.0 @aurea-uds/icons@0.49.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.49.0
```
