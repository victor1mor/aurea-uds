# RTL

Mirror Aurea for right-to-left languages with two settings, and know what stays in place on purpose.

Aurea supports right-to-left writing, such as Arabic and Hebrew. The stylesheet is written with logical properties along the line, so the layout mirrors itself. You set the direction in two places, and that is all.

## Turn it on

1. Put `dir="rtl"` on the `html` element. This mirrors the CSS. It is the app's job: Aurea does not touch the document.
2. Pass `direction="rtl"` to `AureaProvider`. This tells the components that place popups and read arrow keys.

```tsx
<html lang="ar" dir="rtl">
  <body>
    <AureaProvider direction="rtl">
      <App />
    </AureaProvider>
  </body>
</html>
```

Set `lang` to the language of the page as well. Screen readers need it.

```tsx
<div dir="rtl">
  <Timeline
    items={[
      {title: "Created", description: "Draft opened", time: "10:02"},
      {title: "Reviewed", time: "11:40"},
    ]}
  />
</div>
```

## What each setting does

The `dir` attribute drives the CSS. Margins, paddings, positions and text alignment are written as start and end, not left and right, so they flip with the direction. It works on any element, which is why the example above mirrors inside a page that reads left to right.

The `direction` prop drives behavior. It goes to Base UI, which uses it for the side a popup opens on and for the meaning of the left and right arrow keys. A few Aurea components also read it: the `TreeView` arrow points the other way, the arrow of the `AppShell` collapse button follows the direction, and the horizontal axis of the color area and the color slider runs from the right.

## What stays in place

Some things do not mirror, on purpose:

- **The check mark of `Checkbox`.** It is a drawn mark, not a direction.
- **The `Spinner`.** It is a drawn glyph too, and keeps its shape.
- **`Drawer side="left"` and `side="right"`.** The names promise a physical side, so the drawer keeps it.
- **Icons.** The glyphs are not flipped. Where an arrow means "next" or "back", pass the glyph that points the right way for the direction, for example `caret-left` instead of `caret-right`.

## Your own CSS

Write your additions the same way, and they mirror with the rest:

| Instead of | Write |
|---|---|
| `margin-left` | `margin-inline-start` |
| `padding-right` | `padding-inline-end` |
| `left: 0` | `inset-inline-start: 0` |
| `text-align: left` | `text-align: start` |

```css
.order-total {
  margin-inline-start: auto;
  padding-inline: var(--space-4);
  text-align: end;
}
```

## Known limit

Six rules in the stylesheet still use the `:dir(rtl)` selector: the corner position of an anchored `Badge`, the arrow of `Select`, and the thumb of `Switch`. Some build tools rewrite `:dir()`, and after the rewrite these rules can stop matching. New rules in the core resolve direction with logical properties instead, and these six are on the list to move.

## React Native

On React Native, the right-to-left layout is switched on by the app, through React Native itself. Aurea has no prop for it. `Heading`, `Paragraph` and `Code` take `align="start"` and `align="end"`, which follow the direction instead of a fixed side.

## Next steps

- Read the rest of the CSS rules in [Styling](./docs-styling.html).
- Choose the right arrow glyphs in [Icons](./docs-icons.html).
- Check keyboard and screen reader support in [Accessibility](./docs-accessibility.html).
