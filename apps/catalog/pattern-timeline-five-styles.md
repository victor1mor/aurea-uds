# Five styles

variant (ADR-0084), all on the rail that runs under the dots and stops at the last one: default (the solid yellow dot), ring (a hollow dot with a yellow ring), latest (muted dots, only the last one yellow with a halo), time (the time in a column on the left) and contrast (dots in the text colour).

## Usage

```tsx
import {Timeline} from "@aurea-uds/react";
```

```tsx
<Timeline variant="default" items={events} />
<Timeline variant="ring" items={events} />
<Timeline variant="latest" items={events} />
<Timeline variant="time" items={events} />
<Timeline variant="contrast" items={events} />
```
