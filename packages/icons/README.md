# @aurea-uds/icons

The icon sprite **Aurea UDS** draws from. The glyphs are [Phosphor Icons](https://phosphoricons.com), in the
**Regular** and **Fill** weights; this package only puts them together in a single SVG sprite. Up to
`0.12.4` they were IBM's Carbon Icons.

```bash
pnpm add @aurea-uds/icons
```

Copy `dist/aurea-icons.svg` to where your app serves static files and tell the provider where it is:

```jsx
<AureaProvider spriteUrl="/aurea-icons.svg">
```

Markup outside React points straight to the symbol:

```html
<svg class="icon" aria-hidden="true"><use href="/aurea-icons.svg#i-magnifying-glass"></use></svg>
```

The symbol id is `i-` followed by the Phosphor name exactly as Phosphor writes it: `caret-down` becomes
`#i-caret-down`. The filled shape has the `-fill` suffix: `#i-caret-down-fill`. In React, it is
`<Icon name="caret-down" weight="fill" />`; Aurea uses the filled shape on the selected item (the active
tab, the current menu item) and in alerts.

Phosphor's brand logos (`apple-logo` and the other 78 with `-logo` in the name) **are not included**: a
third party's trademark does not belong in an Apache-2.0 library.

## Coming from Carbon

Every name changed. The `carbon-para-phosphor.json` table maps the 260 Carbon names that Aurea and the
known apps used to the Phosphor name that replaces each one:

```js
import tabela from "@aurea-uds/icons/carbon-para-phosphor.json" with {type: "json"};
tabela["chevron--down"]; // "caret-down"
```

Carbon's `*--filled` icons become the same name with `weight="fill"`.

## License

Apache-2.0 for this package. The glyphs are Phosphor Icons, under the MIT license — the copyright and
permission notice it requires is in [`NOTICE`](./NOTICE), which is part of the published files.
