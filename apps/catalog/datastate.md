# DataState

One region, four faces: loading, failed, empty, or the content itself.

## Usage

```tsx
import {DataState} from "@aurea-uds/react";
```

```tsx
<DataState state={query.state} message={query.error} skeleton={<InvoiceSkeleton />}
  emptyTitle="No invoices" action={<Button variant="primary">New invoice</Button>}>
  {() => <InvoiceTable rows={query.data} />}
</DataState>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `loading \| error \| empty \| UniversalState` | — | Leave it out and the children render, plain. THE RULE THAT MATTERS: the three terminal faces (loading, error, empty) replace the content, and every universal state (stale, partial, degraded, offline, waiting_*) does NOT — it keeps the content on screen and puts the notice above it. Showing old data without saying so is worse than showing none, and hiding what the reader already had because it went stale is losing information they were using. This is the same decision DataGrid took. |
| `children` | `ReactNode \| (() => ReactNode)` | — | REQUIRED. Pass a function when building the content is expensive: in the loading face it is never called, so you do not pay to render what has not arrived. |
| `message` | `ReactNode` | — | Replaces the built-in sentence. Only you know what actually failed — "the billing service is down" beats "this could not be loaded". |
| `skeleton` | `ReactNode` | — | The shape of what is coming. The default is a single bar, which is honest but says nothing; a skeleton that mirrors the real layout is what stops the page from jumping when the data lands. |
| `emptyTitle` | `ReactNode` | "Nothing here yet" | Say what is missing in the words of the thing: "No invoices" beats "No results". |
| `emptyIcon` | `IconName` | "document--blank" | Passed through to EmptyState. |
| `action` | `ReactNode` | — | The way out of the empty face — usually the button that creates the first one. |
| `catchErrors` | `boolean` | false | Catches a rendering error inside the region and shows the error face in its place, with a "Try again" button that renders the content again — the rest of the screen stays. Without it, the error goes up as before and can blank the whole page. The message prop also applies to this face. |
| `onCatch` | `(error: unknown, info: ErrorInfo) => void` | — | Called once for each error caught by catchErrors, with the error and React's component stack — the place to send it to your error log. |
