# The current item of the sidebar, five ways

`sidebarIndicator` sets how the item you are on is drawn: `brand` (the default), `segment` (the capsule of the selected tab, with no line), `segment-dot`, `segment-line` and `subtle`. Switch them here, on the real shell.

## Usage

```tsx
import {AppShell, Sidebar, RadioGroup} from "@aurea-uds/react";
```

```tsx
const ways = [
  {label: "Brand", sidebarIndicator: "brand"},
  {label: "Segment", sidebarIndicator: "segment"},
  {label: "Dot", sidebarIndicator: "segment-dot"},
  {label: "Line", sidebarIndicator: "segment-line"},
  {label: "Subtle", sidebarIndicator: "subtle"},
] as const;

function Shell() {
  const [way, setWay] = useState<(typeof ways)[number]>(ways[1]);
  return (
    <AppShell
      layout="sidebar"
      sidebarIndicator={way.sidebarIndicator}
      brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
      navItems={items}
      currentNavId="tasks"
    >
      <h1>Tasks</h1>
      <RadioGroup label="The current item" orientation="horizontal" value={way.sidebarIndicator}
        onValueChange={(v) => setWay(ways.find((w) => w.sidebarIndicator === v)!)}>
        {ways.map((w) => <Radio key={w.sidebarIndicator} value={w.sidebarIndicator} label={w.label} />)}
      </RadioGroup>
    </AppShell>
  );
}

<Shell />
```
