# v0.59.1

The CodeEditor focus ring follows the focus tokens; security headers on the documentation site.

Nothing changes on screen.

## Fixed

- The `CodeEditor` focus ring follows `--focus-width` like every other component. Before, its width and offset were fixed numbers, so changing the token did not reach the editor.

## The documentation site

- The site now sends security headers: a content security policy, HSTS, `nosniff`, `X-Frame-Options` and a permissions policy.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.59.1 @aurea-uds/core@0.59.1 @aurea-uds/fonts@0.59.1 @aurea-uds/icons@0.59.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.59.1
```
