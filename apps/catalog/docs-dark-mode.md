# Dark Mode

Switch between the light and dark themes, follow the system, and save the choice.

Aurea's themes are CSS. The page reads its colors from the `data-theme` attribute on `<html>`: `light` or `dark`. Both themes are complete: light and dark are equal.

```html
<html data-theme="dark">
```

The attribute is required. Without it, the color roles are not defined and the page has no colors.

Put the theme in the markup that the server sends. Then the first paint is already right, with no flash.

```tsx
import {ThemeToggle} from "@aurea-uds/react";

export function Toolbar() {
  return (
    <>
      <ThemeToggle />
      <ThemeToggle mode="light-dark-system" />
    </>
  );
}
```

## The theme switch

[ThemeToggle](./themetoggle.html) is the ready-made switch. It has two modes.

| Mode | What it is |
|---|---|
| `light-dark` | The default. One round button that flips the theme. It shows where it goes: a dark moon in the light theme, a yellow sun in the dark theme |
| `light-dark-system` | Three options in a row: light, dark and system. System follows the computer and changes with it |

The button's accessible name says what it does: "Switch to dark theme" or "Switch to light theme". The three-option mode is a radio group named "Theme", moved with the arrow keys.

ThemeToggle changes the theme. It does not save the choice. See [Saving the choice](#saving-the-choice).

## With AureaProvider

[AureaProvider](./aureaprovider.html) can own the theme. It writes `data-theme` on `<html>` for you.

| Prop | What it does |
|---|---|
| `theme` | The theme, controlled: `"light"`, `"dark"` or `"system"` |
| `defaultTheme` | The first theme, uncontrolled |
| `onThemeChange` | Called with the theme on screen: `"light"` or `"dark"` |
| `onThemePreferenceChange` | Called with what was chosen, which can be `"system"` |

- With `"system"`, the provider follows the computer's light or dark setting, and changes when it changes. The page still gets `light` or `dark`: the CSS knows only those two.
- With neither `theme` nor `defaultTheme`, the provider adopts the `data-theme` already in the markup. It does not overwrite it.

```tsx
import {AureaProvider} from "@aurea-uds/react";

export function App({children}: {children: React.ReactNode}) {
  return <AureaProvider defaultTheme="system">{children}</AureaProvider>;
}
```

## Reading the theme

`useAureaTheme()` reads the theme and the density straight from `<html>`. It follows the attribute, whoever changes it.

| Field | Type | What it is |
|---|---|---|
| `theme` | `"light"`, `"dark"` or `null` | The theme on screen |
| `preference` | `"light"`, `"dark"`, `"system"` or `null` | What was chosen. Outside a provider, the theme on screen |
| `density` | `"compact"`, `"comfortable"`, `"spacious"` or `null` | The density on screen |
| `setTheme` | function | Sets `"light"`, `"dark"` or `"system"` |
| `toggleTheme` | function | Flips what is on screen |
| `setDensity` | function | Sets the density |

`theme` is `null` on the server, because the server cannot know it. While it is `null`, do not render anything that depends on the theme.

Inside an `AureaProvider`, `setTheme` goes through the provider. Outside one, it writes the attribute directly. Outside a provider, `"system"` writes the computer's current theme once; it does not follow later changes.

`useTheme()` is the other hook. It reads the theme from the provider instead of the page. Use it only inside an `AureaProvider` that owns the theme. See [useAureaTheme](./useaureatheme.html) and [useTheme](./usetheme.html).

## Saving the choice

Aurea stores nothing, on purpose. Remembering a person's choice is the application's job.

Save the value from `onThemePreferenceChange`, and give it back as `defaultTheme` on the next visit.

```tsx
import {AureaProvider, ThemeToggle, type AureaThemePreference} from "@aurea-uds/react";

const saved = localStorage.getItem("theme") as AureaThemePreference | null;

export function App() {
  return (
    <AureaProvider
      defaultTheme={saved ?? "system"}
      onThemePreferenceChange={(choice) => localStorage.setItem("theme", choice)}
    >
      <ThemeToggle mode="light-dark-system" />
    </AureaProvider>
  );
}
```

This example runs in the browser only. With server rendering, the saved theme has to reach `<html>` before the page paints. The next section does that.

## Next.js with next-themes

[next-themes](https://github.com/pacocoursey/next-themes) saves the choice, follows the system and sets the theme before the first paint. It writes `data-theme` on `<html>` by default: the same attribute Aurea reads. No glue code is needed.

```bash
pnpm add next-themes
```

```tsx
// app/layout.tsx
import {ThemeProvider} from "next-themes";
import {AureaProvider} from "@aurea-uds/react";
import "@aurea-uds/fonts/css";
import "@aurea-uds/core/css";

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" enableSystem>
          <AureaProvider>{children}</AureaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Leave `theme` and `defaultTheme` off the `AureaProvider`. Then next-themes is the only one writing the attribute.

Switch the theme with the `setTheme` of next-themes. ThemeToggle writes through Aurea, which next-themes does not see, so the choice would not be saved.

```tsx
"use client";
import {useTheme} from "next-themes";
import {Button} from "@aurea-uds/react";

export function ThemeButtons() {
  const {setTheme} = useTheme();
  return (
    <>
      <Button onClick={() => setTheme("light")}>Light</Button>
      <Button onClick={() => setTheme("dark")}>Dark</Button>
      <Button onClick={() => setTheme("system")}>System</Button>
    </>
  );
}
```

To read the theme in a component, `useAureaTheme()` works next to next-themes, because it reads the attribute.

## Plain HTML

Without React, set the attribute yourself, or use the small script in `@aurea-uds/core/js`:

```html
<script src="node_modules/@aurea-uds/core/dist/aurea.js"></script>
<script>
  window.Aurea.setTheme("light");
</script>
```

## A dark part in a light page

`data-theme` works on any element, not only `<html>`. A [Section](./section.html) with `theme="dark"` makes a dark band in a light page, and a [Card](./card.html) with `variant="contrast"` puts the dark theme inside one card. See [Theming](./docs-theming.html).

## Styling for both themes

Use the color roles, and your own styles follow the theme with no extra rule:

```css
.my-panel {
  background: var(--card);
  color: var(--card-foreground);
}
```

Avoid fixed colors. A hex value that reads well on one theme is usually wrong on the other. The roles are listed on [Colors](./docs-colors.html).

## In React Native

The native `AureaProvider` owns the theme. It is required: without it, the components have no colors.

- With no `theme` and no `defaultTheme`, it follows the device's light or dark setting, until `setTheme` is called. From then on, the choice wins.
- If the device does not report a setting, the theme is dark.
- `theme` is controlled. `defaultTheme` is the first value. `onThemeChange` reports a change.
- `useAureaTheme()` from `@aurea-uds/native` returns `theme`, `density`, `setTheme`, `setDensity` and `toggleTheme`. On the device the theme is never `null`.
- The native theme accepts `"light"` and `"dark"`. There is no `"system"` value: leaving the theme unset is how it follows the device.
- The native ThemeToggle is the round button that flips the theme. It draws the `moon` and `sun` icons from your icon registry, in their filled form. Register them, or the icon does not draw.

```tsx
import {AureaProvider, ThemeToggle, criarRegistroDeIcones} from "@aurea-uds/native";
import MoonFill from "@aurea-uds/native/icons/moon-fill";
import SunFill from "@aurea-uds/native/icons/sun-fill";

const icons = criarRegistroDeIcones({"moon-fill": MoonFill, "sun-fill": SunFill});

export function App() {
  return (
    <AureaProvider icons={icons}>
      <ThemeToggle />
    </AureaProvider>
  );
}
```

Like on the web, the native provider saves nothing. Store the choice yourself and pass it back as `defaultTheme`.
