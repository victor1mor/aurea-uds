# CloseButton

CloseButton is the small round button that closes a notice, a panel or a dialog: a 24 circle on the neutral fill with a 16 X in the Bold stroke. It names itself — "Close", or "Fechar" with the Portuguese strings — so a bare `<CloseButton />` is never a mute control.

## Usage

```tsx
import {CloseButton} from "@aurea-uds/react";
```

```tsx
<CloseButton onClick={close} />
```

- The accessible name comes by itself; pass `label` to say what closes when a screen has more than one.

- A 24 circle with a 16 glyph, so it sits in a title row without making it taller.

- On touch the circle stays 24 and the target grows to 44 around it, invisibly.

- Darkens on hover and shrinks a little when pressed, like every Aurea button.

- `children` replaces the X when a closing action needs another glyph.

## Examples

### In a title row

At the end of a card's title row. The `label` says what closes.

```tsx
<Card>
  <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
    <strong>Backup finished</strong>
    <CloseButton label="Close notice" onClick={close} />
  </div>
  <Text color="muted">Photos were saved at 22:40.</Text>
</Card>
```

### Disabled

When closing is not possible yet — while a save is still running, for example.

```tsx
<CloseButton disabled />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | strings.close | The accessible name. Defaults to "Close" ("Fechar" in ptBR); pass what closes when there is more than one on the screen, e.g. "Close notice". |
| `children` | `ReactNode` | the X (Bold) | Replaces the X, as in the reference. Keep it a 16 glyph. |
| `onClick` | `MouseEventHandler` | — | What closing does. On native, `onPress`. |
| `disabled` | `boolean` | false | Disables the button; it leaves the focus order. |
