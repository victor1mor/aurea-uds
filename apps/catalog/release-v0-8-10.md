# v0.8.10

Select gets Aurea's own skin and floating list instead of the browser's native control. Also ships v0.8.9, with navItems on AppShell and labelWidth on Field.

The web [`Select`](./select.html) no longer opens the operating system's list: it is now built on Base UI with Aurea's skin. The way you write it stays the same, but the element on the page changes. This release also publishes v0.8.9, which fixes a double sidebar box in `AppShell` and squeezed horizontal fields.

## New

- **`Select` props**: `items`, `onValueChange`, `placeholder` and `required`.

## Changed

- **`Select` has Aurea's skin**: a capsule trigger and a floating list like [`Combobox`](./combobox.html), without a search field. It is still the same `Select` component.
- **Usage is unchanged**: `<option>` and `<optgroup>` as children, `value` and `defaultValue`, `onChange` with `e.target.value`, `name` (submitted through a hidden field), `disabled` and `size`.
- Keyboard: arrows, Home, End, Enter and Space.

## Fixed

- **Documentation site**: nine samples scrolled inside their box and two pages overflowed sideways at 320 pixels. The samples were rearranged to fit.

## Breaking changes

- **`Select` renders a `<button>` with the `combobox` role**, not a `<select>`, and `ref` points to that button. If you read `ref.current.value` or styled `select` by tag name, update that code.

## Includes v0.8.9

### New

- **[`AppShell`](./appshell.html) `navItems`, `currentNavId` and `navLabel`**: the list goes into the `Sidebar` that the shell already creates. Passing another `Sidebar` as `navigation` produced two nested boxes that cut text; with `navItems` there is one box and long names end in "…". `navigation` still works and is now optional; when both are set, the list comes first.
- **[`Field`](./field.html) `labelWidth`**: in `orientation="horizontal"` the label column was a fixed 192 pixels (`--field-label-width`). On a 375-pixel phone the selected value could disappear. `labelWidth="auto"` sizes the column to the label; a CSS length (`"8rem"`) sets another width. Without the prop, 192 as before.
- To use the fixes, replace `navigation={<Sidebar items current />}` with `navItems` and `currentNavId`, and add `labelWidth="auto"` to narrow fields.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.10 @aurea-uds/core@0.8.10 @aurea-uds/fonts@0.8.10 @aurea-uds/icons@0.8.10
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.10
```
