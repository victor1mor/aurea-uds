# v0.83.1

A disabled Collapsible stays reachable by keyboard again, the tests run on Base UI 1.9.0, and the packages declare their module type.

## Fixed

- **A disabled `Collapsible` stays in the tab order.** Its trigger is focusable, says `aria-disabled="true"` and does not open. Since Base UI 1.9.0, which apps already received through the caret range, the trigger had become a natively disabled button that keyboard users could not reach. It looks the same as before.

## Changed

- **`@aurea-uds/react` depends on `@base-ui/react` `^1.9.0`** (it was `^1.6.0`), the version the test suite now runs on.
- **The packages declare their module type.** `@aurea-uds/core` and `@aurea-uds/tokens` are `"type": "module"`; `@aurea-uds/fonts` is `"type": "commonjs"`, which is what its native file already is.
- **`@aurea-uds/core/js` has types**, an empty declaration like the one for `@aurea-uds/core/css`.

No component, token value or style changes.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.83.1 @aurea-uds/core@0.83.1 @aurea-uds/fonts@0.83.1 @aurea-uds/icons@0.83.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.83.1
```
