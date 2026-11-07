# @aurea-uds/contracts

The contract of the **Aurea UDS** project, as machine-readable JSON.

```bash
pnpm add @aurea-uds/contracts
```

```js
import contract from "@aurea-uds/contracts/contract" with {type: "json"};
```

It states what the design system promises — identity, the catalog vocabulary, the lists of values that
each component's record is checked against — in a form a tool can read, instead of a paragraph a person
has to interpret.

## The API surface

```js
import surface from "@aurea-uds/contracts/api-surface" with {type: "json"};
```

Every component `@aurea-uds/react` exports, with its props and — when the type is a union of fixed
strings — the values each prop accepts. It is **derived**, not written: the build reads the declarations
the TypeScript compiler emits, so inheritance, `Omit`, `Pick` and chained aliases are resolved by the
compiler, not by guesswork. Editing it by hand is exactly the defect it exists to prevent.

It lets a tool answer "which variants does this component accept?" without reading our code or trusting
our prose — and it is what each component's record is checked against, so the two never drift apart.

## What is not here

The component records live in the repository, not in this package. They generate the catalog and let the
library be checked against itself; nothing outside the build uses them. If you need them, open an issue
asking for it, and they get an entry point. The API surface above is the part of that answer a tool
needs, which is why it ships in the package.

## License

Apache-2.0.
