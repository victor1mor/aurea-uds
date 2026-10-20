# v0.8.3

React Native fixes for brand and destructive text contrast and for Input dropping props, plus Separator, a link tone on Text and new PasswordField props.

A React Native release focused on sign-in screens. `Input` now forwards every `TextInput` prop, so password managers, autocorrect and the keyboard's next key work again. Brand and destructive text reach readable contrast in the light theme, and `Separator` arrives.

## New

### React Native

- **[`Text`](./text.html)**: a `link` tone, so you no longer need to set the link color by hand.
- **[`PasswordField`](./passwordfield.html)**: `leading`, a slot in front of the field (for a padlock, for example).
- **[`PasswordField`](./passwordfield.html)**: `icons`. The show/hide eye needs the `view` and `view--off` icons in the registry; without them the button is invisible and the warning only appears in development.
- **[`Separator`](./separator.html)**: same color and thickness as the web one, horizontal or vertical, plus a `label` for a line with text in the middle ("or continue with"). `label` does not exist on the web. It has no accessibility role, because React Native has no `separator` role.

## Fixed

### React Native

- **Brand text was written in the fill yellow.** [`Button`](./button.html) and [`IconButton`](./iconbutton.html) with `appearance="ghost"` or `"outline"` and `tone="brand"` measured 1.73:1 on the light theme. The label now uses `link`: the same hue, darker, 5.02:1 on light, and unchanged on dark.
- **Destructive text was also below contrast on light** (4.30:1). Ghost and outline buttons with `tone="destructive"` now use `danger400` (6.86:1 light, 7.47:1 dark), matching the web.
- **[`Input`](./input.html) silently dropped props.** `autoComplete`, `textContentType`, `autoCorrect`, `returnKeyType`, `onSubmitEditing`, `maxLength` and any other `TextInput` prop were discarded, and so were the ones `PasswordField` forwarded. `InputProps` now extends `TextInputProps` (minus what Aurea controls), and `ref` is accepted as a prop.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.3 @aurea-uds/core@0.8.3 @aurea-uds/fonts@0.8.3 @aurea-uds/icons@0.8.3
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.3
```
