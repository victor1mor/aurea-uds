// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Path",
    name: "Where this page sits",
    description: "Every level is a link except the last, which is the page itself and carries aria-current. A breadcrumb whose last item is also a link tells the screen reader that the user can navigate to where they already are.",
    uses: ["Breadcrumb"],
    code: `<Breadcrumb items={[
  {label: "Components", href: "./index.html"},
  {label: "Actions", href: "./index.html#actions"},
  {label: "Button"},
]} />`,
    render: () => h(A.Breadcrumb, {items: [
      {label: "Components", href: "#"}, {label: "Actions", href: "#"}, {label: "Button"}]}),
  },
];
