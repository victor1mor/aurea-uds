<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/catalog/assets/logo/aurea-readme-escuro.svg">
    <img src="apps/catalog/assets/logo/aurea-readme-claro.svg" alt="Aurea" width="360">
  </picture>
</h1>

**Aurea Universal Design System** — one design system with two outputs: the **web** (React and CSS) and
**mobile** (React Native). The look is one, and it does not change from one side to the other.

Documentation, live examples and release notes: **[aureauds.dev](https://aureauds.dev)**.

## The look

- floating, independent surfaces;
- cards, dialogs and panels with a 22 px radius;
- text buttons, fields, filters and tabs shaped as capsules;
- the main yellow is the same in the light and the dark theme;
- Inter for text, Sora for headings and IBM Plex Mono for code;
- Phosphor icons, with the filled shape on the selected item;
- three densities: compact, comfortable and spacious;
- every colour, radius, type and space value comes from a token;
- contrast is measured by the test suite, in both themes and every brand.

## Install

The packages are on the public npm registry under the `@aurea-uds` scope. The current version and what
changed in each one are in the [CHANGELOG](CHANGELOG.md) and on the
[release notes](https://aureauds.dev/releases.html). Before `1.0`, a minor version can include breaking
changes; they are listed under "Breaking changes" in the release notes.

**For the web** (the same packages with any of the four package managers):

```bash
npm install @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
yarn add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
bun add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

No React? `@aurea-uds/core` and `@aurea-uds/fonts` are enough: the core brings the stylesheet and a little
behaviour in plain JavaScript.

The icon set in `@aurea-uds/icons` is a static file: copy `dist/aurea-icons.svg` to where your app serves
files and point the `AureaProvider` to it.

**After updating Aurea, restart the development server** (`vite`, `next dev`). A server that was already
running keeps serving the previous version, and the symptom is misleading: icons requested by old names, or
components without the new feature. Restarting fixes it; there is no cache to clear.

**For mobile (React Native):** it is a separate package, `@aurea-uds/native`. Its component list **is not
the web list with items missing**: it is its own, with its own installation and dependencies. Start with
[`packages/native/README.md`](packages/native/README.md) and do not install the web packages.

## Use in HTML

Load the fonts **before** the core. Plain HTML does not understand package names (`@aurea-uds/...`): point
to the installed file (adjust the path) or serve the `dist` folder through a bundler.

```html
<html data-theme="dark" data-density="comfortable">
  <link rel="stylesheet" href="node_modules/@aurea-uds/fonts/dist/fonts.css">
  <link rel="stylesheet" href="node_modules/@aurea-uds/core/dist/aurea.css">
  <button class="btn btn-primary" type="button">Save</button>
</html>
```

With a bundler, prefer the entry points: `import "@aurea-uds/fonts/css"` and `"@aurea-uds/core/css"`.

## Use in React

Requires React 19 or newer: components take `ref` as a regular prop, which is React 19 behaviour.

Wrap the application in `AureaProvider`. It provides the default strings, tells the components where the
icon sprite is, and mounts what tooltips and toasts use.

```tsx
import { AureaProvider } from "@aurea-uds/react";
import "@aurea-uds/fonts/css"; // before the core
import "@aurea-uds/core/css";

export default function App() {
  return <AureaProvider><Screen /></AureaProvider>;
}
```

**The default strings are in English.** For Brazilian Portuguese, pass `strings={ptBR}` (also exported
by `@aurea-uds/react`), or replace single strings: `<AureaProvider strings={{ close: "Fechar" }}>`.

### Server Components

The main entry point is a **server** module, so importing from it in a Server Component works. Interactive
modules carry `"use client"` themselves. These stay on the server: the main entry point, the markup-only
components (`Card`, `Stack`, `Cluster`, `Grid` and the others in `markup.tsx`) and the helper functions —
`cx`, `defaultStrings`, `ptBR`, `defaultSpriteUrl` —, which can therefore be *called* on the server.

Two proof applications are built on every check — one in a framework with server components, one in a
client-only bundler —, and the build fails if a directive is missing or appears where it is not needed.

### Six modules with an optional engine, each on its own entry point

`@aurea-uds/react` has **one** required dependency: `@base-ui/react`. Six modules need a heavier engine,
and each one is declared as an **optional peer dependency**, so the rest of the library costs nothing:

| Component | Import from | Install with it |
|---|---|---|
| `CodeEditor` | `@aurea-uds/react/code-editor` | `codemirror`, `@codemirror/*`, `@lezer/highlight` |
| `DataGrid` | `@aurea-uds/react/data-grid` | `@tanstack/react-table` |
| `QRCode` | `@aurea-uds/react/qrcode` | `qr` |
| `Calendar` | `@aurea-uds/react/calendar` | `react-day-picker` |
| `Chart`, `ChartLegend`, `ChartTooltip` | `@aurea-uds/react/chart` | `recharts` |
| `DependencyGraph` | `@aurea-uds/react/graph` | `@xyflow/react` |

They are **not** exported from the main entry point: if they were, importing a `Button` would load a
dependency you did not install, and the import would break.

Everything else is on the main entry point and also by category (`@aurea-uds/react/actions`, `/inputs`,
`/navigation`, `/overlays`, `/disclosure`, `/feedback`, `/data-display`, `/identity`, `/media`, `/code`,
`/communication`, `/layout`, `/system`, `/agents`). The package is ESM with `sideEffects: false`, so the
bundler drops what you do not import either way; the category entry points are for reading and for
adopting in parts.

### Icons: point the provider to your sprite

`Icon` draws a glyph as `<use href="{spriteUrl}#i-{name}">`. The default is `/aurea-icons.svg`, which only
works when the app is served from the domain root. **If that is not your case, set it once on the
provider**, or every icon of every component fails silently:

```tsx
<AureaProvider spriteUrl="/assets/aurea-icons.svg">{children}</AureaProvider>
```

Copy `node_modules/@aurea-uds/icons/dist/aurea-icons.svg` to that path, or bundle it and pass the resulting
URL. On a page that inlines the icons as `<symbol>`, pass `spriteUrl=""` so the reference stays local.

**Icon names are checked by TypeScript**: `<Icon name="chevron-down">` (the Phosphor name is
`caret-down`) does not compile, in `leadingIcon`, `icon` or any prop that takes an icon. If you use your
own sprite, declare its names **once**:

```tsx
declare module "@aurea-uds/react" {
  interface AureaIconNames { brand: true }
}
```

### Accessible overlays

Focus trapping, closing with Esc, returning focus and scroll locking come from
[Base UI](https://base-ui.com): `Dialog`, `Drawer`, `Tooltip`, `Popover`, `DropdownMenu`, `ContextMenu`,
`Combobox`, `Tabs` and `useToast()`.

### Theme and density

`useAureaTheme()` reads and writes the two axes Aurea puts on `<html>`: `data-theme` and `data-density`.
It reads the DOM instead of keeping its own state, so it follows whoever actually changes the attribute.
`theme` is `null` while it is unknown — on the server it cannot be known, and pretending otherwise causes a
hydration mismatch.

**It stores nothing, on purpose.** Remembering the preference is the application's job. To store it,
follow the system and avoid the flash on load, [`next-themes`](https://github.com/pacocoursey/next-themes)
already does it all and writes `data-theme` on `<html>` — the same attribute Aurea reads. What no theme
library covers is **density**, which is an Aurea axis; that is what the hook is for.

### Right-to-left

The CSS uses logical properties on the inline axis and mirrors itself. It takes two steps:

```tsx
<html dir="rtl">                        {/* mirrors the CSS */}
  <AureaProvider direction="rtl">       {/* tells Base UI */}
    {children}
  </AureaProvider>
</html>
```

The provider does not touch the DOM: putting `dir` on `<html>` is the application's job. Not mirrored, on
purpose: the `Checkbox` check, the spinner (glyphs drawn with a border) and `Drawer side="left"|"right"`
(the name promises a physical side).

## For AI assistants

The documentation is also published as text for AI assistants: the index at `https://aureauds.dev/llms.txt`,
everything in one file at `https://aureauds.dev/llms-full.txt`, and every page as `.md`, next to the
`.html`. The Aurea skill lives in [`skills/aurea-uds/SKILL.md`](skills/aurea-uds/SKILL.md) and installs
with:

```bash
npx skills add victor1mor/aurea-uds
```

## Build the catalog locally

Build, then open any page straight from disk — the pages do not need a server:

```bash
pnpm build
```

Open `apps/catalog/index.html`. To serve it (port 8123):

```bash
python -m http.server 8123
```

The numbers below are generated from the repository; the full figures are in [STATE.md](STATE.md).

<!-- state:begin -->
615 pages generated — 228 component, 234 pattern, 15 block, 23 recipe, 104 documentation and 11 area index pages — from 138 component records. Every page has the same core: breadcrumb, preview, the code that produces it, installation, provenance and previous/next. 44 components have hand-written content; the other 105 have a starter — the real preview and the code, without extra examples yet. 150 components publish the props table.
<!-- state:end -->

## Repository layout

- `apps/catalog`: the documentation site, **generated** from the registry by `scripts/build-catalog.mjs`;
- `packages/tokens`: the tokens in the DTCG 2025.10 format and the generated CSS;
- `packages/fonts`: Inter, Sora and IBM Plex Mono (WOFF2) and `fonts.css`; and, for React Native, the same three as static TTF, one file per weight;
- `packages/contracts`: the project contract and the registry (one record per component);
- `packages/core`: the generated CSS (tokens and components) and the plain JavaScript behaviour;
- `packages/icons`: the Phosphor icon sprite;
- `packages/react`: the React components, typed;
- `packages/native`: the React Native components;
- [`decisions/`](decisions/README.md): the recorded design decisions;
- [`docs/`](docs/): how components are built, where to change what, when something is done, and the road to `1.0`.

## Support

Aurea is free for everyone, and I maintain it on my own.

Requests, questions and bug reports are welcome: open an issue. I read everything, and what makes sense goes
into the queue and is fixed at the project's pace, with no promised deadline.

The idea is to help, especially people who cannot pay for a UI library.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). To report a security issue, follow [SECURITY.md](SECURITY.md) —
do not open a public issue.

## License

Apache 2.0 — see [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) (Inter, Sora and
IBM Plex Mono under OFL 1.1, Phosphor Icons under MIT).
