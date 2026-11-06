# v0.59.0

Fixes from an external audit — KPI bars, the native Toast for VoiceOver, ToastHost and BottomNav without SafeAreaProvider.

Fixes from an external audit. Nothing changes on screen.

## Fixed

- **Two `KPI`s with bars on the same page keep their own selected bar.** Before, two `KPI`s with the same label — or with a label in JSX — shared one radio group, and the first lost its selected bar on load. Two identical `KPI`s are told apart by their `id`.
- **The native `Toast` is fully usable with VoiceOver.** Its action and close button were inside the group the screen reader reads as one item, which hides them on iOS. The icon and text are now the read group; the action and the close button sit next to it. Nothing moves on screen.
- **Native `ToastHost` and `BottomNav` no longer crash without `SafeAreaProvider`.** They read the safe area from context, falling back to the initial window metrics and then to zero, like the menus already did.
- `CodeBlock` and `Banner` call their hooks before any early return, so switching `copyable` or the `consent` variant between renders keeps their state.
- Submenus of `Menubar` use the app's portal container, like `DropdownMenu` and `ContextMenu`.
- The API docs of `Code`, `Heading` and `Paragraph` no longer say native takes `tone` (native takes `color`), and `ToolbarButton`'s `glow` no longer says it works on native, where the component is planned.
- The `LICENSE` of `@aurea-uds/native` and `@aurea-uds/icons` is now the same as the other packages.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.59.0 @aurea-uds/core@0.59.0 @aurea-uds/fonts@0.59.0 @aurea-uds/icons@0.59.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.59.0
```
