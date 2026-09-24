// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {MultiCombobox} from "../../../../packages/react/dist/index.js";

const LISTA = "This page is static HTML: the listbox opens in a portal and only exists in a real "
  + "React app. The preview shows the field with its chips; the code is the whole composition.";

export default [
  {
    variant: "Tags",
    name: "Labelling something with several tags",
    description: "Each choice stays visible as a chip, so the user reads the whole selection without opening the list again. Backspace removes the last one — the keyboard shape people already expect from an email To: field.",
    uses: ["MultiCombobox"],
    note: LISTA,
    code: `const [tags, setTags] = useState([]);

<MultiCombobox
  label="Labels"
  placeholder="Add a label…"
  value={tags}
  onValueChange={setTags}
  items={[
    {value: "bug", label: "bug"},
    {value: "docs", label: "documentation"},
    {value: "a11y", label: "accessibility"},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(MultiCombobox, {label: "Labels", placeholder: "Add a label…", items: [],
        value: [{value: "a11y", label: "accessibility"}]})),
  },
];
