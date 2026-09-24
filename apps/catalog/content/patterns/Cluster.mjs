// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`. Medido em 21/08/2026: `.cluster` aparecia em UMA página do
// catálogo — a do próprio componente. E é o primitivo que mais se usa à mão: metade dos
// exemplos deste repositório escreve `display:flex; gap` inline no lugar dele. É buraco duplo,
// de composição e de adoção.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const largo = {width: "min(560px,100%)"};

export default [
  {
    variant: "Default",
    name: "A row of actions that wraps instead of overflowing",
    description: "Buttons side by side with the gap of the system, and a wrap that happens before anything is pushed off screen. Writing `display:flex` by hand gets the row right and the wrap wrong, which is only visible on the narrow viewport nobody tested.",
    uses: ["Cluster", "Button"],
    code: `<Cluster>
  <Button variant="primary">Save changes</Button>
  <Button variant="secondary">Save as draft</Button>
  <Button variant="ghost">Discard</Button>
</Cluster>`,
    render: () => h("div", {style: largo}, h(A.Cluster, null,
      h(A.Button, {variant: "primary"}, "Save changes"),
      h(A.Button, {variant: "secondary"}, "Save as draft"),
      h(A.Button, {variant: "ghost"}, "Discard"))),
  },
  {
    variant: "Default",
    name: "Tags under a heading",
    description: "A cluster of badges is the shape a filter list and a tag list share. The primitive is what keeps the vertical rhythm right when the second row appears — the case a hand-written flex row almost always gets wrong.",
    uses: ["Cluster", "Badge"],
    code: `<Cluster>
  {tags.map(t => <Badge key={t}>{t}</Badge>)}
</Cluster>`,
    render: () => h("div", {style: largo}, h(A.Cluster, null,
      ...["tokens", "accessibility", "dark theme", "density", "typography", "icons"]
        .map(t => h(A.Badge, {key: t}, t)))),
  },
  {
    variant: "Default",
    name: "Metadata beside a title",
    description: "Title, status and time on one line, aligned on their centres rather than their boxes. The alignment is the point: three elements of different heights on a hand-written row sit on three different baselines.",
    uses: ["Cluster", "Status", "Avatar"],
    code: `<Cluster>
  <strong>Nightly sweep</strong>
  <Status variant="success">Succeeded</Status>
  <span className="muted">1m 48s</span>
</Cluster>`,
    render: () => h("div", {style: largo}, h(A.Cluster, null,
      h(A.Avatar, {fallback: "CU", size: "sm"}),
      h("strong", null, "Nightly sweep"),
      h(A.Status, {variant: "success"}, "Succeeded"),
      h("span", {className: "muted"}, "1m 48s"))),
  },
];
