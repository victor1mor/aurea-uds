# v0.37.1

Wide content no longer widens the page inside DataState, Form and the Dialog body, and field placeholders reach 4.5:1 in the lory brand.

A small release with two fixes: wide content inside [DataState](./datastate.html), [Form](./form.html) and the [Dialog](./dialog.html) body scrolls in its own box instead of widening the page, and the placeholder text of fields reaches 4.5:1 in the `lory` brand.

## Fixed

- **Wide content no longer widens the page** inside `DataState`, `Form` and the `Dialog` body. A wide table inside a wrapper used to push the page sideways instead of scrolling in its own box (104 px at a 640 px window). Their grid now has one column that can shrink: `grid-template-columns: minmax(0, 1fr)`.
- **Field placeholders reach 4.5:1 in the `lory` brand.** The faint text color of `lory` (`subtle-foreground`, used by placeholders and by other secondary text) measured 2.5:1 in the light theme and 3.2:1 in the dark theme. In `lory`, it now matches the muted text color, and the muted color of the light theme is a little darker: 4.87:1 or more in the light theme and 5.5:1 or more in the dark theme, on fields, cards and the page. The default brand does not change.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.37.1 @aurea-uds/core@0.37.1 @aurea-uds/fonts@0.37.1 @aurea-uds/icons@0.37.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.37.1
```
