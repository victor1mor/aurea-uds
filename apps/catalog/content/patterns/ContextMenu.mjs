// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: a medição mostrou 77 dos 90 componentes com ZERO composição
// resolvida, contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {ContextMenu, Card} from "../../../../packages/react/dist/index.js";

const PORTAL = "This page is static HTML: the popup lives in a portal and only exists in a real "
  + "React app. The preview shows the trigger; the code is the whole composition.";

export default [
  {
    variant: "Canvas",
    name: "Right-click on an item",
    description: "The menu the mouse expects on an item, and the keyboard reaches with Shift+F10. It never replaces a visible control: everything here has another way in.",
    uses: ["ContextMenu", "Card"],
    note: PORTAL,
    code: `<ContextMenu label="Item actions" items={[
  {label: "Rename", leadingIcon: "edit"},
  {label: "Move to…", leadingIcon: "folder"},
  "separator",
  {label: "Delete", leadingIcon: "trash-can"},
]}>
  <Card>Right-click this card, or focus it and press Shift+F10.</Card>
</ContextMenu>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(Card, null, "Right-click this card, or focus it and press Shift+F10.")),
  },
];
