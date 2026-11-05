# v0.57.0

Row dividers, a header pinned to the page, gradients allowed, and five site fixes.

New options on tables, and gradients are no longer off-limits. Nothing changes unless you use the new options.

## New

- **Row dividers.** `Table` and `DataGrid` take `dividers`: a light line between the body rows, none after the last — the frame stays and no measurement changes. On React Native, `Table` with `dividers` groups the rows into a single card with the same light line between them. Not applied with the Aurea Ember brand.
- **A header pinned to the page.** `DataGrid` takes `stickyHeader="page"`: the header follows the page as it scrolls and stops right under whatever stays fixed at the top (the `AppShell` bar, a site header) — no box with its own scroll. `stickyHeader` alone still pins the header inside a box with a ceiling.

## Changed

- **Gradients are allowed.** The old "no gradients" rule is gone, from the guidelines and from the checks.

## Site

- The sidebar filters now filter. On Patterns (by component), Releases (by month) and Tokens (by `$type`), choosing a filter shows only the matching group or tokens.
- "View as Markdown" opens the page's Markdown. It used to reopen the same page. Every page with the page menu now has its `.md` next to it.
- The sidebar opens at the current page, and keeps its scroll position as you move from page to page.
- Links that leave the site open in a new tab, and screen readers announce it.
- The home page uses the same top bar as every other page.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.57.0 @aurea-uds/core@0.57.0 @aurea-uds/fonts@0.57.0 @aurea-uds/icons@0.57.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.57.0
```
