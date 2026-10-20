# v0.8.13

The React Native Card responds to taps with onPress, and the BottomNav can size itself to its tabs with width="content".

Two additions: a tappable [`Card`](./card.html) in React Native, and a compact [`BottomNav`](./bottomnav.html) on the web and in React Native. Without the new props, nothing changes.

## New

- **`Card` with `onPress` (React Native)**: `<Card onPress={open} accessibilityLabel="…">`. You no longer need to wrap the card in a `Pressable`.
- With `onPress`, the type requires `accessibilityLabel`, and screen readers treat the card as a button.
- With `onPress`, the type does not accept `variant="brand"`, because that variant requires an `action` button, and a button inside a button disappears for VoiceOver on iPhone.
- A tappable card without `variant` uses the `interactive` skin. Its press feedback matches `Button` (scale 0.97, opacity 0.9).
- A card with `onPress` must not contain other tappable elements; the type cannot check your content.
- **`BottomNav` `width="content"`**, on the web and in React Native: the bar sizes to its tabs and centres itself instead of spanning edge to edge. Only on `floating`; ignored on `edge`. With four tabs the gain is small (about 275 instead of 328 on a 360 screen).

## Fixed

- The `BottomNav` documentation still described the iPhone safe area as padding inside the bar. Since v0.8.8 it is an outer margin.
- If your floating bar still sits in a box or behind the Android buttons, update and remove any painted `View` wrapped around `BottomNav`: that wrapper draws the box. The underlying fixes shipped in v0.8.8.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.13 @aurea-uds/core@0.8.13 @aurea-uds/fonts@0.8.13 @aurea-uds/icons@0.8.13
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.13
```
