# ContainerScope

Declares an Aurea container: the box that container-responsive values measure themselves against.

## Usage

```tsx
import {ContainerScope} from "@aurea-uds/react";
```

```tsx
<ContainerScope>
  <Toolbar orientation={{base: "vertical", container: {sm: "horizontal"}}}>
    <Button>Save</Button>
    <Button>Discard</Button>
  </Toolbar>
</ContainerScope>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | What is measured against this box. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
