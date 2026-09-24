// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "First run",
    name: "Nothing here yet, and one way forward",
    description: "The empty state of a new account is not an error: it says what will appear and offers the one action that fills it. Never the same copy as a search with no results — those are different situations wearing the same layout.",
    uses: ["EmptyState", "Button"],
    code: `<EmptyState
  icon="rocket"
  title="No runs yet"
  description="Start one and it will show up here with its logs and timings."
  action={<Button variant="primary">Start a run</Button>}
/>`,
    render: () => h(A.EmptyState, {titleAs: "p", icon: "rocket", title: "No runs yet",
      description: "Start one and it will show up here with its logs and timings.",
      action: h(A.Button, {variant: "primary"}, "Start a run")}),
  },
  {
    variant: "No results",
    name: "The filter matched nothing",
    description: "Different from an empty account: here there IS data, the query just missed it. The action clears the filter instead of creating something — offering Create here sends people down the wrong path.",
    uses: ["EmptyState", "Button"],
    code: `<EmptyState
  icon="search"
  title="No members match “curator”"
  description="Check the spelling, or clear the filter to see all 9 members."
  action={<Button variant="outline" onClick={clear}>Clear filter</Button>}
/>`,
    render: () => h(A.EmptyState, {titleAs: "p", icon: "search", title: "No members match \u201Ccurator\u201D",
      description: "Check the spelling, or clear the filter to see all 9 members.",
      action: h(A.Button, {variant: "outline"}, "Clear filter")}),
  },
];
