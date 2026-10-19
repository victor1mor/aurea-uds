# Labelling something with several tags

Each choice stays visible as a chip, so the user reads the whole selection without opening the list again. Backspace removes the last one — the keyboard shape people already expect from an email To: field.

## Usage

```tsx
import {MultiCombobox} from "@aurea-uds/react";
```

```tsx
const [tags, setTags] = useState([]);

<MultiCombobox
  label="Labels"
  placeholder="Add a label…"
  value={tags}
  onValueChange={setTags}
  items={[
    {value: "bug", label: "bug"},
    {value: "docs", label: "documentation"},
    {value: "a11y", label: "accessibility"},
  ]}
/>
```
