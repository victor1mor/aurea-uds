---
title: Roadmap
description: Where Aurea stands, and what has to be true before version 1.0.
icon: path
sources: none
---

Aurea is in `0.x`. No dates are promised here: each step ships when it is done and checked. What changed in each release is in the [release notes](./releases.html).

## What 0.x means

- A minor release can break the API.
- Every break is written in the release notes. `0.x` is not a license to break things silently.
- All seven packages move together, with the same version number.

## What 1.0 will promise

From `1.0` on, Aurea follows [Semantic Versioning](https://semver.org) without the `0.x` exception: the public API does not break without a new major version.

## Already in place

- The web packages (React and plain CSS) and the React Native package, on the public npm registry.
- Thirteen brands: the default Aurea Gold, Aurea Ember and eleven more palettes. A brand changes color only; the yellow of the default brand stays fixed.
- Server Components support, proven on every check by two apps that are built from the packages: one in Next.js, one in Vite.
- On every change, the accessibility sweep of every page in both themes, the size checks and the right-to-left checks run in three browser engines: Chromium, Firefox and WebKit.
- Pixel snapshots of the site.
- A check that installs the published packages in a clean folder and builds them on both sides of the server and client boundary.
- A props table on the component pages, checked against the TypeScript types.

## Before 1.0

1. **Finish the open requests.** The requests from apps that use Aurea today are worked through first.
2. **The same components on the web and in React Native.** What one side has and the other lacks is closed, in both directions, with the same names.
3. **Review every component, variant by variant.** Anatomy, sizes, states and keyboard behavior are checked one component at a time, and corrected where they fall short.
4. **Accessibility measured against WCAG 2.2.** Aurea aims at WCAG 2.2 AA. Today the automated sweep checks the WCAG 2.0 and 2.1 rules; the 2.2 rules are checked before `1.0`. Every component is also checked with forced colors and with reduced motion. The known gaps are on the [Accessibility](./docs-accessibility.html) page.
5. **Motion that explains a change.** Components respond to touch and to state changes with short motion, and keep still when the system asks for reduced motion.
6. **A written stability rule.** What counts as public API, and how long a name marked for removal keeps working.
7. **Every browser test in continuous integration.** Today it runs the accessibility sweep, the size, right-to-left and snapshot checks; the other browser tests run before each release, and move into it.
8. **Lighter packages with proven origin.** Build provenance on every package, a smaller stylesheet, and styles and icons that can be loaded in parts.
9. **Run the native package on iOS devices.** It has been tested on Android devices; iPhone runs come before `1.0`.
10. **A release candidate used by real apps** for some weeks before `1.0`.
11. **An independent audit.** Everything is reviewed by someone who did not write the code, and what the audit finds is fixed before the release.
12. **A final visual review** of every page, in both themes.

## Decided not to build

- **A rich text engine.** The block editor gives the frame; the text engine stays with your app. The reason is security: whoever owns the editing surface owns the safety of pasted HTML, and only your app can decide what is safe to render.
- **Routing in React Native.** Aurea gives the look of the navigation; the router is your app's choice.

## Ask for something

Missing a component or a feature? [Open an issue](https://github.com/victor1mor/aurea-uds/issues). Every issue is read; what makes sense joins the queue, with no promised date.
