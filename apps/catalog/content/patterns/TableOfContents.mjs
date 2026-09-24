// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "On this page",
    name: "An index that follows the reading",
    description: "It marks the section in view by itself — pass current only when something else owns that state. Sub-items are one level deep and no more: an index that needs three levels is a document that needs splitting.",
    uses: ["TableOfContents"],
    code: `<TableOfContents items={[
  {id: "install", label: "Installation"},
  {id: "usage", label: "Usage"},
  {id: "props", label: "Props", sub: true},
  {id: "a11y", label: "Accessibility"},
]} />`,
    render: () => h("div", {style: {width: "min(280px,100%)"}}, h(A.TableOfContents, {
      // rótulo próprio, como o starter já fazia: o padrão é "On this page" e a página do
      // catálogo já tem um índice com esse nome. Dois <nav> com o mesmo nome acessível é
      // `landmark-unique`, medido pelo axe em 22/08/2026.
      label: "Example sections",
      items: [{id: "install", label: "Installation"}, {id: "usage", label: "Usage"},
        {id: "props", label: "Props", sub: true}, {id: "a11y", label: "Accessibility"}]})),
  },
];
