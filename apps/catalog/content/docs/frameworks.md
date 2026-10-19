---
title: Frameworks
description: Use Aurea with Next.js, Vite, plain HTML or React Native.
icon: stack
---

Two proof apps are built on every check of the repository: one in Next.js with Server Components, one in Vite with client rendering only. The examples on this page follow what they do. If a `"use client"` directive goes missing or shows up where it is not needed, those builds fail.

## Next.js

The App Router works with Server Components out of the box. You do not add `"use client"` to use Aurea.

### 1. Install the packages

```bash
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

Copy `node_modules/@aurea-uds/icons/dist/aurea-icons.svg` to `public/`. Next.js serves it at `/aurea-icons.svg`, which is where the components look by default.

### 2. Set up the root layout

The layout stays a Server Component. Import the fonts before the core, write the theme on the `html` element, and wrap the content in the provider.

```tsx
// app/layout.tsx
import type {ReactNode} from "react";
import {AureaProvider} from "@aurea-uds/react";
import "@aurea-uds/fonts/css";
import "@aurea-uds/core/css";

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <AureaProvider>{children}</AureaProvider>
      </body>
    </html>
  );
}
```

### 3. Use your first component

A page can import from the main entry point without any directive.

```tsx
// app/page.tsx
import {Button, Card, Stack} from "@aurea-uds/react";

export default function Page() {
  return (
    <main>
      <Card>
        <Stack>
          <Button variant="primary">Save</Button>
        </Stack>
      </Card>
    </main>
  );
}
```

### What runs where

- The main entry point is a server module, so importing from it in a Server Component works.
- The interactive modules carry `"use client"` themselves.
- Components that are only markup, such as `Card`, `Stack`, `Cluster` and `Grid`, render on the server and send no JavaScript.
- The helpers `cx`, `defaultStrings`, `ptBR` and `defaultSpriteUrl` can be called on the server.

A Server Component cannot pass a function to a client component. When you need state or an event handler, move that part to a file of your own marked `"use client"`:

```tsx
// app/save-toggle.tsx
"use client";

import {useState} from "react";
import {Toggle} from "@aurea-uds/react";

export function SaveToggle() {
  const [on, setOn] = useState(false);
  return <Toggle pressed={on} onPressedChange={setOn}>Autosave</Toggle>;
}
```

## Vite

### 1. Install the packages

```bash
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

Copy `node_modules/@aurea-uds/icons/dist/aurea-icons.svg` to `public/`.

### 2. Set up the entry file

```tsx
// src/main.tsx
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, Button} from "@aurea-uds/react";
import "@aurea-uds/fonts/css";
import "@aurea-uds/core/css";

function App() {
  return <Button variant="primary">Save</Button>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AureaProvider><App /></AureaProvider>
  </StrictMode>
);
```

Write the theme in `index.html`, on the `html` element, so the first paint is already right:

```html
<html lang="en" data-theme="dark" data-density="comfortable">
```

In a client-only bundler the `"use client"` directives are plain text and are dropped. Nothing else changes.

If the app is not served at the root of the domain, set `spriteUrl` on the provider to where the sprite really is.

## Plain HTML

Without React, install the CSS and the fonts:

```bash
pnpm add @aurea-uds/core @aurea-uds/fonts
```

Load the fonts **before** the core. Plain HTML does not understand package names, so point to the installed files (adjust the path) or serve them through a bundler.

```html
<html data-theme="dark" data-density="comfortable">
  <link rel="stylesheet" href="node_modules/@aurea-uds/fonts/dist/fonts.css">
  <link rel="stylesheet" href="node_modules/@aurea-uds/core/dist/aurea.css">
  <button class="btn btn-primary" type="button">Save</button>
</html>
```

With a bundler, use the entry points instead: `import "@aurea-uds/fonts/css"` and `import "@aurea-uds/core/css"`.

The core also ships a small plain-JavaScript file, `@aurea-uds/core/js`, for behavior the markup cannot do alone, such as tabs that move with the arrow keys and the copy and share buttons. It does nothing when there is no page, so it is safe to import during server rendering.

```html
<script src="node_modules/@aurea-uds/core/dist/aurea.js"></script>
```

## React Native

React Native uses its own package, `@aurea-uds/native`, with its own components. It works with Expo and needs React Native 0.76 or newer.

```bash
pnpm add @aurea-uds/native react-native-svg react-native-safe-area-context
```

The setup, with fonts and the provider, is in [Quick Start](./docs-quick-start.html#react-native).

## Next steps

- [Quick Start](./docs-quick-start.html)
- [Components](./components.html)
- [Dark Mode](./docs-dark-mode.html)
- [Styling](./docs-styling.html)
