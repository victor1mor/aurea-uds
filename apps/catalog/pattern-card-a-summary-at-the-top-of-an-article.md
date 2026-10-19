# A summary at the top of an article

Three short points before the long text, for the reader who has thirty seconds. It is a card with a short title and a list, not an alert: an alert interrupts, a summary waits to be read. The check icon is decoration; the list is announced as a list.

## Usage

```tsx
import {Card, Stack, Cluster, Icon} from "@aurea-uds/react";
```

```tsx
<Card>
  <Stack gap="tight">
    <h2>In 30 seconds</h2>
    <Stack gap="tight" role="list">
      <Cluster role="listitem" gap="tight" align="start" wrap={false}>
        <Icon name="check" />The new model arrives in March.
      </Cluster>
      <Cluster role="listitem" gap="tight" align="start" wrap={false}>
        <Icon name="check" />It costs 6% more than the current one.
      </Cluster>
      <Cluster role="listitem" gap="tight" align="start" wrap={false}>
        <Icon name="check" />Orders open next week.
      </Cluster>
    </Stack>
  </Stack>
</Card>
```
