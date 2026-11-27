# v0.84.0

Native Alert gets the soft appearance and an action button; web Combobox options take a description and can be disabled; web Timeline items take an icon, a tone, a trailing value and the time between.

## Added

- **Native `Alert`: `appearance="soft"` and `action`**, as on the web. `soft` fills the alert with the state colour at 14%, with no shadow, a bold title and the body at 16 in the text colour. On the `ember` brand it stays a card, as on the web. `action` puts the alert's button below the text, in the same column; it keeps its own stop for the screen reader.
- **Web `Combobox` and `MultiCombobox`: `description` and `disabled` on an option**, as on native. The description is a second, quieter line under the label, and the screen reader hears it as the option's description. The filter still looks only at the label.
- **Web `Timeline`: `icon`, `tone`, `trailing` and `between` on an item**, as on native. `icon` puts a glyph in a 40px round frame in place of the dot; `tone` colours the frame with the `Badge` words (`neutral`, `primary`, `info`, `success`, `warning`, `danger`); `trailing` goes to the right of the title; `between` is written beside the line, up to the next item, and never after the last one. On the web, `icon` is a node, such as `<Icon name="check" />`. New types: `TimelineItem`, `TimelineTone`.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.84.0 @aurea-uds/core@0.84.0 @aurea-uds/fonts@0.84.0 @aurea-uds/icons@0.84.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.84.0
```
