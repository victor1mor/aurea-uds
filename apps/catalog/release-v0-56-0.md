# v0.56.0

High contrast and large text for the whole app, turned on by the app.

Two reading modes your app can turn on, in every brand. Nothing changes until you use them.

## New

- **`AppShell highContrast`** — an outline on fields, cards and buttons, the supporting text closer to the text, links always underlined, and the control marks in ink. It is everything the system's "increase contrast" setting does, and more, without waiting for the system. Or set `data-contrast="high"` on any container.
- **`AppShell textSize="lg"`** — every text step 2px larger (body text goes from 14px to 16px), and the medium control grows to the 44px touch target. Or set `data-text="lg"` on any container.
- Both mark the page root as well, so menus and dialogs that open outside the shell match. The new `textSize.lg` token group holds the larger steps.

## Includes v0.55.0

- **`ButtonGroup`** — a split button keeps its round end and its divider with the menu open.
- **`DropdownMenu align`**, and **`description` and `trailingIcon`** on menu items.
- **Aurea Ember** — the dark focus ring and the links in the brand's own orange; in the light theme, links and the focus ring as in the system the brand was made for.
- **Native field focus** — a 2px border, one line in the browser too.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.56.0 @aurea-uds/core@0.56.0 @aurea-uds/fonts@0.56.0 @aurea-uds/icons@0.56.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.56.0
```
