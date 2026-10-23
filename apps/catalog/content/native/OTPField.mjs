// O OTPField do nativo no site (bloco 1, o 5-A — 23/10/2026): o campo de código de uso único, rodando pelo
// `react-native-web` — um campo de texto invisível por cima das casas, que recebe o teclado e o colar.
import {createElement as h, useState} from "react";
import {Field, OTPField, Text} from "../../../../packages/native/dist/index.js";

const largura = {width: "min(24rem, 100%)"};

// O controlado: a linha de baixo mostra o que chegou.
function Codigo() {
  const [codigo, setCodigo] = useState("");
  return h("div", {style: {...largura, display: "grid", gap: "var(--space-2)"}},
    h(Field, {label: "Code sent by SMS"}, h(OTPField, {length: 6, value: codigo, onValueChange: setCodigo})),
    h(Text, {size: "sm", tone: "muted"}, codigo.length === 6 ? `Complete: ${codigo}` : `${codigo.length} of 6 digits`));
}

export default {
  install: 'import {OTPField} from "@aurea-uds/native";',
  api: {
    value: "The code, owned by the screen. Only digits enter, cut at length.",
    defaultValue: "The code it starts with, when the field keeps its own state.",
    onValueChange: "Called on every digit, and once with the whole code when it is pasted or filled from the SMS.",
    label: "The name the screen reader hears; for it the boxes are one field. Inside a Field, the Field's label.",
    disabled: "Dims the boxes; the field takes no input. Without it, the Field's.",
    style: "Style for the row of boxes.",
    testID: "Test id of the row; each box gets `<testID>-casa-<n>` and the field `<testID>-campo`.",
  },
  examples: [
    {
      title: "Usage",
      description: "Touch the boxes to type. Only digits enter; on a phone the code from the SMS fills it in one go.",
      code: `const [code, setCode] = useState("");

<Field label="Code sent by SMS">
  <OTPField length={6} value={code} onValueChange={setCode} />
</Field>`,
      render: () => h(Codigo),
    },
    {
      title: "Length and name",
      description: "length sets the boxes; label names it when there is no Field around.",
      code: `<OTPField length={4} label="Card PIN" />`,
      render: () => h(OTPField, {length: 4, label: "Card PIN"}),
    },
    {
      title: "Masked",
      description: "mask hides each digit behind a dot.",
      code: `<OTPField length={4} label="Card PIN" mask defaultValue="2580" />`,
      render: () => h(OTPField, {length: 4, label: "Card PIN", mask: true, defaultValue: "2580"}),
    },
    {
      title: "Error",
      description: "Inside a Field with an error, every box shows it and the field is announced as invalid.",
      code: `<Field label="Code sent by SMS" error="That code has expired. Ask for a new one.">
  <OTPField length={6} defaultValue="482913" />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Code sent by SMS", error: "That code has expired. Ask for a new one."},
        h(OTPField, {length: 6, defaultValue: "482913"}))),
    },
    {
      title: "Disabled",
      code: `<OTPField length={6} label="Code sent by SMS" disabled />`,
      render: () => h(OTPField, {length: 6, label: "Code sent by SMS", disabled: true}),
    },
  ],
};
