// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {TreeView} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Files",
    name: "A source tree beside the editor",
    description: "Arrow keys walk it, Right opens a branch and Left closes it — the shape people already know from every file explorer. Only the branch the user is working in starts open.",
    uses: ["TreeView"],
    code: `<TreeView
  label="Files"
  defaultExpandedIds={["packages", "react"]}
  onSelect={node => open(node.id)}
  items={[
    {id: "packages", label: "packages", children: [
      {id: "react", label: "react", children: [
        {id: "index", label: "index.tsx"},
        {id: "inputs", label: "inputs.tsx"},
      ]},
      {id: "core", label: "core"},
    ]},
    {id: "readme", label: "README.md"},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}}, h(TreeView, {
      label: "Files", defaultExpandedIds: ["packages", "react"], items: [
        {id: "packages", label: "packages", children: [
          {id: "react", label: "react", children: [
            {id: "index", label: "index.tsx"}, {id: "inputs", label: "inputs.tsx"}]},
          {id: "core", label: "core"}]},
        {id: "readme", label: "README.md"},
      ]})),
  },
];
