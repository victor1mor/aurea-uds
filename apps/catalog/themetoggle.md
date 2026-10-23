# ThemeToggle

The light/dark switch, with colour in the glyph: a dark moon in the light theme, the brand yellow sun in the dark one.

## Usage

```tsx
import {ThemeToggle} from "@aurea-uds/react";
```

```tsx
<ThemeToggle />
```

## Examples

### Three positions — light, dark and the system

mode="light-dark-system" is the switch at the top of this site: three choices in one capsule, and "System" follows the computer. It is a radio group named "Theme": Tab enters on the chosen one, the arrows move and choose.

```tsx
<ThemeToggle mode="light-dark-system" />
```

### Sizes

The control sizes, from xs to xl; on a touch screen every size floors at 44.

```tsx
<ThemeToggle size="xs" />
<ThemeToggle size="sm" />
<ThemeToggle size="md" />
<ThemeToggle size="lg" />
<ThemeToggle size="xl" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `"light-dark" \| "light-dark-system"` | "light-dark" | light-dark is the button that flips the theme. light-dark-system is the reference's three-way switch — light, dark and system (follow the computer, and change with it): a radio group of three icon options, the chosen one filled. |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | "md" | The IconButton size. The button is round, like every icon-only button (ADR-0052). |
| `disabled` | `boolean` | false | Blocks the switch. |
| `className` | `string` | — | Added to the button. |
| `pressed` | `boolean` | — | Inherited from IconButton, where it is deprecated. The toggle's state is the document theme, not this prop. |
| `grow` | `boolean` | false | Inherited from Button: the button takes the free space of its row. |
