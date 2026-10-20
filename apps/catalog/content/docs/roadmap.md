---
title: Roadmap
description: Where Aurea stands, and what has to be true before version 1.0.
icon: path
---

Aurea is in `0.x`. No dates are promised here: each step ships when it is done and checked. What changed in each release is in the [changelog](https://github.com/victor1mor/aurea-uds/blob/main/CHANGELOG.md).

## What 0.x means

- A minor release can break the API.
- Every break is written in the changelog. `0.x` is not a license to break things silently.
- All seven packages move together, with the same version number.

## What 1.0 will promise

From `1.0` on, Aurea follows [Semantic Versioning](https://semver.org) without the `0.x` exception: the public API does not break without a new major version.

## Already in place

- The web packages (React and plain CSS) and the React Native package, on the public npm registry.
- Server Components support, proven on every check by two apps that are built from the packages: one in Next.js, one in Vite.
- Tests in three browser engines: Chromium, Firefox and WebKit.
- Pixel snapshots of the site, and an accessibility sweep of every page in both themes.
- A check that installs the published packages in a clean folder and builds them on both sides of the server and client boundary.
- A props table on the component pages, checked against the TypeScript types.

## Before 1.0

1. **Finish the open requests.** The requests from apps that use Aurea today are worked through first.
2. **Review every component, variant by variant.** Anatomy, sizes, states and keyboard behavior are checked one component at a time, and corrected where they fall short.
3. **Run the native package on iOS devices.** It has been tested on Android devices; iPhone runs come before `1.0`.
4. **More brand palettes.** The brand axis changes color only, and the yellow of the default brand stays fixed. Two more ready-made palettes come before `1.0`.
5. **An independent audit.** Everything is reviewed by someone who did not write the code, and what the audit finds is fixed before the release.
6. **A final visual review** of every page, in both themes.

## Decided not to build

- **A rich text engine.** The block editor gives the frame; the text engine stays with your app. The reason is security: whoever owns the editing surface owns the safety of pasted HTML, and only your app can decide what is safe to render.
- **Routing in React Native.** Aurea gives the look of the navigation; the router is your app's choice.
- **Gradients.** They are not part of the identity. The one exception is inside the color pickers, where the gradient is the content itself.

## Ask for something

Missing a component or a feature? [Open an issue](https://github.com/victor1mor/aurea-uds/issues). Every issue is read; what makes sense joins the queue, with no promised date.
