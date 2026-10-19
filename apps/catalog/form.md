# Form

Shows the error and collects the values. It does not decide what an error is.

## Usage

```tsx
import {Form, Field, Input, Button} from "@aurea-uds/react";
```

```tsx
<Form errors={errors} onSubmit={values => save(values)}>
  <Field label="E-mail" name="email"><Input name="email" type="email" /></Field>
  <Field label="Display name" name="nickname"><Input name="nickname" /></Field>
  <Button type="submit" variant="primary">Save</Button>
</Form>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `errors` | `Record<string, string \| string[]>` | — | Errors you already decided, keyed by the Field's name. AUREA VALIDATES NOTHING: no schema, no rules, no resolver, no field state. Validate wherever it suits you — a schema on the client, a server action, the API's answer — and hand the result over. That is why no form library is a dependency here: marrying one would force every project using Aurea to adopt it, including those that already validate another way. |
| `onSubmit` | `(values) => void` | — | Fires with the collected values, already gathered from the named controls. The native submit is prevented for you. |
| `children` | `ReactNode` | — | Fields and the submit button. The form only stacks them with breathing room — arranging beyond that is Stack and Grid's job, not a third way of doing layout. |
| `className` | `string` | — | Added to the <form>. Every other form attribute passes through. |
