# v0.66.0

Fields with an error keep their fill and get a thin red border and a red label.

## Changed

- **The invalid state of every field.** The field no longer turns pink: its fill stays the same as a valid field, and its border turns red, in the color of the error message. Nothing changes size. This covers `Input`, `Textarea`, `Select`, `Combobox`, `MultiCombobox`, `SearchField`, `PasswordField`, `NumberField`, `ColorField`, `OTPField`, `InputGroup`, `DatePicker`, `FileInput`, `Checkbox`, `Radio` and the groups. Web and native.
- **Focus keeps the red.** On the web the focus ring is red and sits on the border; on native the border gets the focus width, in red.
- **The label of the field or group turns red.** The label of each option stays in the text color.
- **`Checkbox` with an error**: empty, the red border; checked, solid red with a white check. A checked `Radio` keeps its fill and gets the red border.
- **`Switch` no longer changes with an error.** Its error is the message below the field and `aria-invalid` for screen readers.
- **Native `Checkbox` and `Radio`** now take the error from the surrounding `Field`.
- **High contrast** (`data-contrast="high"`) keeps the red border on fields with an error.

## Fixed

- **Native `Checkbox` corner.** The box keeps its 24 size and now has an 8 corner, like the checkbox on the phone in the reference. It had the 6 corner of the web box, which made the larger native box look square.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.66.0 @aurea-uds/core@0.66.0 @aurea-uds/fonts@0.66.0 @aurea-uds/icons@0.66.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.66.0
```
