---
title: Animation
description: The motion Aurea ships, the tokens behind it, and how it stops when the user asks for less movement.
icon: copy-simple
sources: css:--duration-*, css:--ease-*
---

Aurea moves little, and only to explain a change: a window that opens, a button that is pressed, something that is still loading. All of it is plain CSS in the core stylesheet. There is no animation library to install.

## Built-in motion

These components move on their own:

| What | How it moves |
|---|---|
| `Button` and `IconButton` | colors change smoothly; the button shrinks a little while pressed |
| `Dialog` | the backdrop fades in; the window fades in from slightly larger, and leaves slightly smaller |
| `Drawer` | slides in from its side |
| `Popover` and `Tooltip` | fade and grow in, fade and shrink out |
| `Toast` | slides in, and slides out in the direction it was swiped |
| `Accordion` | the chevron turns when an item opens |
| `Spinner`, `Skeleton`, `Progress`, `ProgressCircle` | loop while the wait has no end |

A tooltip opened from the keyboard, or moved to a neighbor, appears at once, without the entry animation.


```tsx
<Popover trigger={<Button>Open popover</Button>} title="Popover">
  It grows in and shrinks out.
</Popover>
```

## Motion tokens

Every transition in the core reads its timing from a token. Use the same tokens in your own CSS, and your motion matches the rest of the interface.

| Token | Value | Used for |
|---|---|---|
| `--duration-fast` | 120ms | color changes, presses, and dialogs, popovers and tooltips that leave |
| `--duration-base` | 180ms | the switch, popovers and tooltips that enter |
| `--duration-slow` | 280ms | dialogs, drawers and toasts that enter |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | the default curve |
| `--ease-emphasized` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | the drawer and the toast sliding in |

```css
.result-row {
  transition: background var(--duration-fast) var(--ease-standard);
}

.result-row:hover {
  background: var(--fill-1);
}
```

The loops (the spinner, the skeleton pulse and the indeterminate progress) keep their own timing, because they repeat.

## Entering and leaving

Dialogs, drawers, popovers, tooltips and toasts are built on Base UI. While one of them enters, it carries `data-starting-style`. While it leaves, it carries `data-ending-style`. The core sets the start and end look on these attributes, and the transition does the rest.

Change the movement by writing your own rule for the same attributes. Your CSS sits outside the `aurea` cascade layer, so it wins:

```css
.popover[data-starting-style],
.popover[data-ending-style] {
  opacity: 0;
  scale: 1;
}
```

This popover now only fades. See [Styling](./docs-styling.html) for the other state attributes.

## Reduced motion

Aurea follows the system setting. When the user turns on "reduce motion", the media query `prefers-reduced-motion: reduce` matches, and the stylesheet acts on its own. It has eight rules for it:

- **One global rule.** It cuts every animation and every transition on the page to almost zero, plays each animation once, and turns smooth scrolling off.
- **Seven rules for single parts.** They remove the transition of the slider thumb, the color area thumb, the color swatch, the progress circle fill and the accordion chevron. The skeleton stops pulsing.
- **The indeterminate progress bar** does not freeze as a short piece, which would read as a value. It shows the whole bar, dimmed.

CSS cannot reach motion you start from JavaScript. Check the same setting before you animate:

```ts
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

## React Native

React Native has no stylesheet cascade, so there is no global rule. The native components that animate ask the system first, and stay still when the user asked for less movement ("Reduce Motion" on iOS, "Remove animations" on Android).

The same question is public for your own animations: `useReduceMotion()`. It returns `true`, `false`, or `null` while the system has not answered yet. Wait for the answer, so not even one frame plays for someone who asked for none. The durations come from the tokens, as numbers in milliseconds.

```tsx
import * as React from "react";
import {Animated} from "react-native";
import {useAureaTokens, useReduceMotion} from "@aurea-uds/native";

export function FadeIn({children}: {children: React.ReactNode}) {
  const t = useAureaTokens();
  const reduce = useReduceMotion();
  const opacity = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (reduce === null) return;
    if (reduce) { opacity.setValue(1); return; }
    Animated.timing(opacity, {toValue: 1, duration: t.size.durationBase, useNativeDriver: true}).start();
  }, [reduce, opacity, t.size.durationBase]);
  return <Animated.View style={{opacity}}>{children}</Animated.View>;
}
```

## Next steps

- Target state attributes in [Styling](./docs-styling.html).
- See every token on the [Tokens](./tokens.html) page.
- Read how Aurea serves low vision in [Accessibility](./docs-accessibility.html).
