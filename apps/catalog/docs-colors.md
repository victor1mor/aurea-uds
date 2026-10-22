# Colors

The color roles of Aurea, what each one is for, and their values in the light and dark themes.

Aurea names colors by role, not by hue. A component asks for "the card" or "the text on the primary button", and each theme answers with its own value.

Every role is a CSS custom property. The values come from the token file (DTCG format) and are written in hex or OKLCH. The same roles exist in React Native, with camelCase names.

The page always has a theme: `data-theme="light"` or `data-theme="dark"` on `<html>`. Without it, the color roles are not defined. See [Dark Mode](./docs-dark-mode.html).

```css
.my-panel {
  background: var(--card);
  color: var(--card-foreground);
}

.my-action {
  background: var(--primary);
  color: var(--primary-foreground);
}
```

## Accent

The accent is the brand yellow, `oklch(0.795 0.184 86.047)`. It is the same in both themes. It marks the main action, the current item and the chosen control.

| Token | Use |
|---|---|
| `--primary` | The yellow fill: the primary button, the brand card, full bars |
| `--primary-foreground` | Text and icons on the yellow. Dark gray in both themes |
| `--primary-hover` | The yellow fill under the pointer |
| `--primary-active` | The yellow fill while pressed |
| `--primary-emphasis` | Yellow used as text or icon: the current item, the primary badge |
| `--primary-outline` | Yellow used as a stroke or a thin mark |
| `--primary-mark` | The small brown mark on the yellow: the switch knob, the slider thumb center |
| `--link` | Link text |
| `--link-hover` | Link text under the pointer |
| `--control-selected` | A checked checkbox, radio, switch or slider |
| `--control-selected-foreground` | The check mark on a checked control |
| `--control-selected-dot` | The white dot of a checked radio |

In the light theme, emphasis text and links use the brand blue (`#0246f1`), which measures 5.59:1 to 6.67:1 on the light backgrounds. The yellow stays the brand: fills, checked controls, and emphasis in the dark theme.

## Neutrals

Neutrals are the grays that fill quiet controls and hover states.

| Token | Use |
|---|---|
| `--secondary` | The neutral fill of secondary and tertiary buttons, and of a list item under the pointer |
| `--secondary-foreground` | Text on `--secondary` |
| `--secondary-hover` | `--secondary` under the pointer |
| `--muted` | A quiet neutral fill |
| `--accent` | The hover fill of outline and ghost buttons. In Aurea it is a gray, not the brand color |
| `--accent-foreground` | Text on `--accent` |
| `--segment` | The chosen tab in tabs and segmented controls |

## Fills

Aurea draws no borders around components. A piece that needs to stand apart from what is behind it gets a fill instead. The fills are the text color at a low opacity, so they show on any background.

| Token | Use |
|---|---|
| `--fill-1` | The text color at 6% |
| `--fill-2` | The text color at 10%: fields, outline buttons, toolbars, code blocks |
| `--fill-3` | The text color at 20%: the box of a checkbox or radio, the track of a switch |
| `--fill-2-solid` | `--fill-2` mixed opaque over the page color |
| `--fill-3-solid` | `--fill-3` mixed opaque over the page color |

Use the `-solid` versions when something passes behind the piece, or when one piece covers another. A see-through fill would let it show.

## Status colors

There are four status colors: success, warning, danger and info. Each one has three roles, and they are never swapped.

| Role | Success | Warning | Danger | Info |
|---|---|---|---|---|
| Full fill | `--success` | `--warning` | `--destructive` | `--info` |
| Text on the fill | `--success-foreground` | `--warning-foreground` | `--destructive-foreground` | `--info-foreground` |
| Fill under the pointer | `--success-hover` | `--warning-hover` | none | `--info-hover` |
| Text, icon or bar on the page | `--success-400` | `--warning-400` | `--danger-400` | `--info-400` |
| Soft background | `--success-bg` | `--warning-bg` | `--danger-bg` | `--info-bg` |

- The full fill is the **same color in both themes**. A solid success button looks the same in light and dark.
- Text on the warning fill is dark gray. Text on the other three fills is white.
- Text, icons and progress bars on the page use the `-400` role. Each theme sets it so it reads on its own surfaces.
- **Never paint text with a full fill color.** In the dark theme, the fills used as text fall below 4.5:1.

## Foreground

| Token | Use |
|---|---|
| `--foreground` | Body text |
| `--foreground-strong` | Text that must stand out a little more |
| `--muted-foreground` | Secondary text: hints, descriptions, metadata |
| `--subtle-foreground` | Quiet text |
| `--text-muted` | Another name for `--muted-foreground` |

## Background

`--background` is the page. The `<body>` gets it, with `--foreground` as its text color, as soon as the Aurea CSS loads.

## Surface

Surfaces float over the page: cards, dialogs, menus, panels.

| Token | Use |
|---|---|
| `--card` | Cards, dialogs and panels |
| `--card-foreground` | Text on a card |
| `--popover` | Menus, popovers and tooltips |
| `--popover-foreground` | Text on a popover |
| `--surface-1` | The first level of surface. Same as `--card` |
| `--surface-2` | The second level |
| `--surface-3` | The third level |
| `--surface-inset` | A recessed area, below the page |
| `--surface-hover` | A surface under the pointer |
| `--sidebar` | The application sidebar |
| `--sidebar-foreground` | Text in the sidebar |
| `--sidebar-primary` | The current item in the sidebar |
| `--sidebar-accent` | A sidebar item under the pointer |

## Form field

Fields (input, textarea, select, number field) are filled with `--fill-2`. They have no border.

An invalid field turns its fill to `--danger-bg`, and its focus ring to `--danger-400`. No red line is drawn.

The `secondary` look of a field uses `--secondary` instead.

## Separator

`--border` is the color of the [Separator](./separator.html), a 1px drawn line between groups. It is a fill, not a border around a piece.

The outline card is the only component with a border. Its line is the text color at 10%.

## Category colors

Eight colors mark a **group**, not a status: "Cars" and "Bikes", not "done" or "failed". They are `red`, `orange`, `green`, `teal`, `cyan`, `blue`, `violet` and `pink`.

| Token | Use |
|---|---|
| `--category-red` | Text and icon of the category |
| `--category-red-bg` | The soft background of the category |

The other seven follow the same pattern. Yellow is not a category: it belongs to the brand.

- Category colors do not change with the brand. The name says the color.
- Neighbors on the color wheel alternate two lightness levels, so they differ by more than hue.
- Each one passes 4.5:1 in both themes.
- The color never goes alone. Put the word on it, and an icon if you can.

The [Badge](./badge.html) takes them as `variant` on the web and as `tone` in React Native.

## Other

| Token | Use |
|---|---|
| `--focus-strong` | The focus ring. The yellow in the dark theme, the text color in the light theme |
| `--selection` | Selected text |
| `--overlay` | The veil behind dialogs and drawers |
| `--chart-1` to `--chart-5` | The chart scale. In the default brand, five steps of one blue |

## Primitives

Primitives are the raw values behind the roles. They are the same in both themes. Prefer the roles.

| Token | Value |
|---|---|
| `--brand-yellow` | `oklch(0.795 0.184 86.047)` |
| `--brand-yellow-ink` | `#242424`, the text on the yellow |
| `--brand-yellow-foreground` | `oklch(0.421 0.095 57.708)`, the brown mark on the yellow |
| `--white` | `oklch(1 0 0)` |
| `--black` | `oklch(0 0 0)` |

## How to use colors

Pair each fill with its own text color. `--card` goes with `--card-foreground`, `--primary` with `--primary-foreground`.

```css
.notice {
  background: var(--warning-bg);
  color: var(--foreground);
}

.notice-icon {
  color: var(--warning-400);
}

.save {
  background: var(--primary);
  color: var(--primary-foreground);
}

.save:hover {
  background: var(--primary-hover);
}
```

In React Native, read the roles from `useAureaTokens()`. Colors come as hex strings, because React Native does not read OKLCH.

```tsx
import {View, Text} from "react-native";
import {useAureaTokens} from "@aurea-uds/native";

export function Panel() {
  const t = useAureaTokens();
  return (
    <View style={{backgroundColor: t.color.card}}>
      <Text style={{color: t.color.cardForeground}}>Saved</Text>
    </View>
  );
}
```

## Default theme

The main roles, side by side.

| Token | Light | Dark |
|---|---|---|
| `--background` | `#f5f5f5` | `#1f1f1f` |
| `--foreground` | `#242424` | `#ffffff` |
| `--card` | `#ffffff` | `#292929` |
| `--secondary` | `#ebebeb` | `#333333` |
| `--muted-foreground` | `#616161` | `#adadad` |
| `--border` | `#e0e0e0` | `#525252` |
| `--primary` | the brand yellow | the brand yellow |
| `--primary-foreground` | `#242424` | `#242424` |
| `--success` | `#107c10` | `#107c10` |
| `--success-400` | `#0e700e` | `#54b054` |
| `--warning` | `#f7630c` | `#f7630c` |
| `--warning-400` | `#8a3707` | `#faa06b` |
| `--destructive` | `#c50f1f` | `#c50f1f` |
| `--danger-400` | `#b10e1c` | `#eeacb2` |
| `--info` | `#0078d4` | `#0078d4` |
| `--info-400` | `#006cbf` | `#5caae5` |
| `--overlay` | black at 40% | black at 50% |

Every token, with its value in each theme, is on the [Tokens](./tokens.html) page.

## Customizing colors

The yellow is Aurea's identity and stays the same in every theme. Another palette comes in as a **brand**, with `data-brand`. You can also override a single role in your own CSS. Both are explained in [Theming](./docs-theming.html).
