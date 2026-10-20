# v0.8.2

React Native gets InputGroup, InputGroupAddon and PasswordField, and Button accepts any drawing in leading and trailing.

Three field components that the web already had now exist in React Native: `InputGroup`, `InputGroupAddon` and `PasswordField`. `Button` gains `leading` and `trailing` slots for any drawing, including your own logo.

## New

### React Native

- **[`InputGroup`](./inputgroup.html)**: a field box that holds things inside it. The group draws the border, radius, background, height, invalid and focus states; the `Input` inside it goes quiet, so there is no border inside a border. Focus reaches the group through context, since React Native has no `:focus-within`.
- **[`InputGroupAddon`](./inputgroupaddon.html)**: a slot inside the group. It has no `side` prop, unlike the web: the order is the order you write in JSX.
- **[`PasswordField`](./passwordfield.html)**: a password field with a show/hide button. It does not accept `secureTextEntry`. The button's label announces the state, and `autoCapitalize` defaults to `none`.
- **[`Button`](./button.html)**: `leading` and `trailing` accept any drawing, not just Aurea icons. The slot does not tint what it receives, so a third-party logo keeps its own colors.
- **Sign-in provider logos come from your app.** Aurea does not ship company trademarks; pass the logo through `Button`'s `leading` or `trailing`.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.2 @aurea-uds/core@0.8.2 @aurea-uds/fonts@0.8.2 @aurea-uds/icons@0.8.2
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.2
```
