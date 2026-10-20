# The main navigation of an application

Collapsing keeps the icons and drops the labels — it narrows the column, it does not hide the navigation. On a narrow screen the AppShell turns the same sidebar into a drawer, so there is one navigation, not two.

## Usage

```tsx
import {Sidebar} from "@aurea-uds/react";
```

```tsx
<Sidebar
  label="Main"
  current="runs"
  items={[
    {id: "overview", label: "Overview", icon: "squares-four", href: "#"},
    {id: "runs", label: "Runs", icon: "play", href: "#"},
    {id: "members", label: "Members", icon: "users", href: "#"},
  ]}
/>
```
