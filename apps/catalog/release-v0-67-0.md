# v0.67.0

NumberField, OTPField, InputGroup and FileInput take aria-invalid, and a Field with an error now reaches them.

## Added

- **`aria-invalid` on `NumberField`, `OTPField`, `InputGroup` and `FileInput`.** Inside a `Field` with `error` it arrives on its own. Before, the error message showed below and the field stayed as if it were valid, and a screen reader did not hear "invalid". Each one now looks like the other fields with an error: the fill stays the same, the border turns red in the color of the message, and the label of the `Field` turns red.
- **`NumberField`**: the mark goes to the text field in the middle, and the whole group turns red.
- **`OTPField`**: every box turns red.
- **`InputGroup`**: the mark goes to the field in the middle, not to the box. A field that sets its own `aria-invalid` keeps it.
- **`FileInput`**: the drop area turns red. A refused file still turns it red with or without the mark.
- Web only: on native these four already took the error from the surrounding `Field`.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.67.0 @aurea-uds/core@0.67.0 @aurea-uds/fonts@0.67.0 @aurea-uds/icons@0.67.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.67.0
```
