# v0.8.12

A new type scale (12 to 48). Web components return to 14 pixels, while React Native components use 16.

The type scale changes to **12, 14, 16, 18, 20, 24, 30, 36, 48**. On the web, component text becomes smaller than in v0.8.8 to v0.8.11; in React Native it stays one step larger.

## Changed

- **Web**: components return to 14 (button, field, `Select`, tabs, sidebar, label), and supporting text to 12 (badge, tag, field error). Small buttons and fields stay at 14. Card titles are 14 with medium weight.
- **Web, on phones**: text typed into fields grows to 16, which keeps Safari from zooming the page.
- **React Native**: components stay at 16 and supporting text at 14, one step above the web. Component `size` values are unchanged; the mapping is done in one place.
- **Headings** barely change: `lg` 20 to 18, `2xl` 25 to 24, `3xl` 31 to 30.

## Breaking changes

- **Smaller web text**: component text goes from 16 to 14 compared with v0.8.8 to v0.8.11, and `md`, the `body` size, also becomes 14.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.12 @aurea-uds/core@0.8.12 @aurea-uds/fonts@0.8.12 @aurea-uds/icons@0.8.12
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.12
```
