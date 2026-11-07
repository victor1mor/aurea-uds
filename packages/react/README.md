# @aurea-uds/react

The React components of the **Aurea Universal Design System**.

```bash
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

## Usage

Load the fonts **before** the stylesheet — the core does not embed any font.

```js
import "@aurea-uds/fonts/css";
import "@aurea-uds/core/css";
import {AureaProvider, Button} from "@aurea-uds/react";

export default () => (
  <AureaProvider spriteUrl="/aurea-icons.svg">
    <Button variant="primary">Send</Button>
  </AureaProvider>
);
```

`spriteUrl` points to the file from `@aurea-uds/icons` — copy it to where your app serves static files.
It is configuration, so it lives on the provider, not on each component that draws an icon. The default
strings are in English; `strings={ptBR}` swaps them for the Portuguese ones.

## Import by category

The main entry point works, but each category is also an entry point of its own, so you can take one
part of the system without the rest:

```js
import {Button} from "@aurea-uds/react/actions";
```

Six modules bring an optional engine and therefore stay **out of the main entry point** — importing a
`Button` must never pull in a dependency you did not install:

| Import | Requires you to install |
|---|---|
| `@aurea-uds/react/code-editor` | `codemirror` and the `@codemirror/*` packages |
| `@aurea-uds/react/data-grid` | `@tanstack/react-table` |
| `@aurea-uds/react/qrcode` | `qr` |
| `@aurea-uds/react/calendar` | `react-day-picker` |
| `@aurea-uds/react/chart` | `recharts` |
| `@aurea-uds/react/graph` | `@xyflow/react` |

### The graph (`DependencyGraph`) and its three optional pieces

Each one is loaded only when its feature is requested. Without it, the graph warns once in the console
and carries on without the feature — it does not break the screen.

| For | Install |
|---|---|
| layered, tree or circular layout (`layout="layered"`, `"tree"`, `"radial"`) | `elkjs` |
| the edge that routes around a node after manual arranging | `@tisoap/react-flow-smart-edge` |
| an image of the graph (`toPng()`, `toSvg()`) | `modern-screenshot` |

**Layout off the main thread (`layoutWorker`).** On a large graph, the layout can freeze the screen for a
few seconds. The graph accepts a Web Worker that the app creates — every bundler creates workers its own
way, so the app is the one that supplies it. Aurea publishes the worker on its own entry point,
`@aurea-uds/react/graph-worker`, which brings the `elkjs` worker (the optional peer) along — the app does
not import the engine separately. In Vite:

```js
import TrabalhadorDoMapa from "@aurea-uds/react/graph-worker?worker";

<DependencyGraph layout="layered" layoutWorker={() => new TrabalhadorDoMapa()} … />
```

In any other bundler, the way that always works: copy `node_modules/elkjs/lib/elk-worker.min.js` to the
app's public folder and pass `layoutWorker={() => new Worker("/elk-worker.min.js")}`.

## Hooks

Four are public, and they are the part of the API that **has no page in the catalog** — the catalog
documents components, and a hook is not a component. Until that changes, this is where they are written
down.

```js
import {AureaProvider, useToast} from "@aurea-uds/react";

function BotaoSalvar() {
  const toast = useToast();                                  // inside AureaProvider
  return <Button onClick={() => toast.add({
    title: "Saved",
    description: "Two files uploaded.",
    type: "success",                                         // info | success | warning | danger
  })}>Save</Button>;
}
```

The stack draws itself: `AureaProvider` already mounts the toast viewport, so there is no `<Toaster/>` to
place and no second provider to install.

| Hook | What it returns |
|---|---|
| `useToast()` | `add({title, description, type})`, plus `close(id)` and the live list. The queue is Base UI's |
| `useAureaTheme()` | reads and changes **both** axes on `<html>`: `theme` (`dark`/`light`) and `density`. `theme` is `null` on the server — do not render what depends on the theme until it stops being `null` |
| `useAureaStrings()` | the string dictionary, merged with what you passed to the provider |
| `useSpriteUrl()` | where the icon sprite is being loaded from |

## Requirements

React 19 or newer. In React 19 `ref` is a regular prop, and the types depend on that.

## License

Apache-2.0.
