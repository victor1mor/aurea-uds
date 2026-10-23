# AureaProvider

Root provider: strings, icon sprite, text direction, toasts and where popups mount.

## Usage

```tsx
import {AureaProvider} from "@aurea-uds/react";
```

```tsx
<AureaProvider spriteUrl="/assets/aurea-icons.svg" direction="ltr" strings={{close: "Fechar"}}>
  <App />
</AureaProvider>
```

## Examples

### Theme

defaultTheme seeds the theme and lets the user change it; theme controls it from your state. "system" follows the computer and keeps following it. The switch below is this site's own provider, live.

```tsx
<AureaProvider defaultTheme="light">…</AureaProvider>
<AureaProvider defaultTheme="dark">…</AureaProvider>
<AureaProvider defaultTheme="system">…</AureaProvider>
<AureaProvider theme="light" onThemePreferenceChange={setTheme}>…</AureaProvider>
<AureaProvider theme="dark" onThemePreferenceChange={setTheme}>…</AureaProvider>
<AureaProvider theme="system" onThemePreferenceChange={setTheme}>…</AureaProvider>
```

### Density

The same two forms for the density: defaultDensity seeds it, density controls it. The control below changes this site's density, live — every control on the page follows.

```tsx
<AureaProvider defaultDensity="compact">…</AureaProvider>
<AureaProvider defaultDensity="comfortable">…</AureaProvider>
<AureaProvider defaultDensity="spacious">…</AureaProvider>
<AureaProvider density="compact" onDensityChange={setDensity}>…</AureaProvider>
<AureaProvider density="comfortable" onDensityChange={setDensity}>…</AureaProvider>
<AureaProvider density="spacious" onDensityChange={setDensity}>…</AureaProvider>
```

### Direction

direction="rtl" tells the engine that the inline axis runs right to left, so popups and arrow keys mirror. The CSS mirrors on its own from the dir attribute — the box below is a dir="rtl" page in miniature.

```tsx
<html dir="rtl">
  <AureaProvider direction="rtl">…</AureaProvider>
</html>
```

### Where the toasts appear

toastPlacement picks one of six places for the messages of useToast(). bottom, the middle of the bottom edge, is the default — and the one this site uses: the button shows it.

```tsx
<AureaProvider toastPlacement="top-start">…</AureaProvider>
<AureaProvider toastPlacement="top">…</AureaProvider>
<AureaProvider toastPlacement="top-end">…</AureaProvider>
<AureaProvider toastPlacement="bottom-start">…</AureaProvider>
<AureaProvider toastPlacement="bottom">…</AureaProvider>
<AureaProvider toastPlacement="bottom-end">…</AureaProvider>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Your application. Put the provider once, at the root — everything below it reads the context. |
| `strings` | `Partial<AureaStrings>` | English defaults | Overrides for the built-in accessible names and labels. Merged over the defaults, so you translate only what you need. `ptBR` ships as a ready locale. |
| `spriteUrl` | `string` | "/aurea-icons.svg" | Where the icon sprite lives. Application configuration, so it belongs here and not on every Icon — an app served from a sub-path used to lose every glyph and had to be fixed component by component. |
| `direction` | `ltr \| rtl` | ltr | Tells the engine which way the inline axis runs, so popup sides and arrow keys mirror. The CSS mirrors on its own through logical properties — but you still have to put dir="rtl" on your <html>; the provider does not touch the DOM. |
| `portalContainer` | `HTMLElement \| null` | — | Where every popup mounts: dialog, drawer, tooltip, popover, hover card, both menus, notification panel, combobox list and toasts. Unset, they mount on document.body — which is what lets them stack and position without inheriting overflow or transform from anything. Point it at a node inside one of your landmarks when you need popup content to satisfy the "all content in a landmark" check. |
| `theme` | `AureaThemePreference` | — | Controlled theme. Pass it to command; the provider then never writes it on its own. "system" follows the computer's light/dark (prefers-color-scheme) and changes with it. |
| `defaultTheme` | `AureaThemePreference` | — | Seeds the theme without controlling it. With NEITHER of the two, the provider adopts whatever the document already carries on <html> — the data-theme in the markup exists so the page does not flash, and a provider that overwrote it on first paint would bring the flash back. "system" follows the computer's light/dark (prefers-color-scheme) and changes with it. |
| `onThemeChange` | `(theme: AureaTheme) => void` | — | Fires with the new theme, whether it changed from here or from useTheme. |
| `onThemePreferenceChange` | `(preference: AureaThemePreference) => void` | — | Called with what was CHOSEN, which can be "system" (onThemeChange gets the theme on screen). The moment to save the choice. |
| `density` | `AureaDensity` | — | Controlled density. Same convention as theme. |
| `defaultDensity` | `AureaDensity` | — | Seeds the density without controlling it. |
| `onDensityChange` | `(density: AureaDensity) => void` | — | Fires with the new density. |
| `toastPlacement` | `"top" \| "top-start" \| "top-end" \| "bottom" \| "bottom-start" \| "bottom-end"` | "bottom" | Where the toasts of useToast() appear. bottom (the middle of the bottom edge) is the reference library's default. 460 wide from 640 up; the screen minus 16 on each side on a phone. |
