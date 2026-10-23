// 0.32.0, ADR-0069 — o `ColorField` (o Victor, 14/10/2026: "Pode, componente novo"), com os exemplos da
// referência: as variações, no cartão, a descrição, obrigatório, desligado, a largura, o erro, um canal, com o
// valor e no formulário. As prévias que mudam são VIVAS (`embed`): o código vale no Enter, as setas mexem no canal.
import {createElement as h, useState} from "react";
import {Button, Card, ColorField, ColorSwatch, Field} from "../../../packages/react/dist/index.js";

const coluna = {display: "grid", gap: "var(--space-4)", width: "min(100%, 20rem)"};
const linha = {display: "flex", flexWrap: "wrap", alignItems: "end", gap: "var(--space-3)"};

function ComOErro() {
  const [cor, setCor] = useState("");
  return h("div", {style: coluna},
    h(Field, {label: "Brand colour", required: true, error: cor === "" ? "Pick a colour — hex, rgb() or hsl()." : undefined},
      h(ColorField, {value: cor, onValueChange: setCor, placeholder: "#0485f7"})));
}

function UmCanal() {
  const [cor, setCor] = useState("#0485f7");
  return h("div", {style: coluna},
    h("div", {style: linha},
      h(Field, {label: "Hue"}, h(ColorField, {channel: "hue", value: cor, onValueChange: setCor, width: "6rem"})),
      h(Field, {label: "Saturation"}, h(ColorField, {channel: "saturation", value: cor, onValueChange: setCor, width: "6rem"})),
      h(Field, {label: "Brightness"}, h(ColorField, {channel: "brightness", value: cor, onValueChange: setCor, width: "6rem"}))),
    h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-2)"}},
      h(ColorSwatch, {color: cor, label: "The colour"}), h("code", null, cor)));
}

// Os canais de um espaço, repartindo uma cor só. O código e o desenho saem da MESMA lista (`CANAIS_HSL`,
// `CANAIS_RGB`), com a largura que o desenho usa.
const CANAIS_HSL = {inicio: "hsl(200, 80%, 50%)", espaco: "hsl", amostra: "The HSL colour",
  canais: [["hue", "Hue"], ["saturation", "Saturation"], ["lightness", "Lightness"]]};
const CANAIS_RGB = {inicio: "rgba(240, 194, 0, 0.8)", espaco: "rgb", amostra: "The RGB colour",
  canais: [["red", "Red"], ["green", "Green"], ["blue", "Blue"], ["alpha", "Alpha"]]};

function Canais({inicio, espaco, amostra, canais}) {
  const [cor, setCor] = useState(inicio);
  return h("div", {style: coluna},
    h("div", {style: linha}, ...canais.map(([canal, nome]) => h(Field, {key: canal, label: nome},
      h(ColorField, {channel: canal, colorSpace: espaco, value: cor, onValueChange: setCor, width: "6rem"})))),
    h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-2)"}},
      h(ColorSwatch, {color: cor, label: amostra}), h("code", null, cor)));
}

const codigoDosCanais = ({inicio, espaco, amostra, canais}) => `const [colour, setColour] = useState("${inicio}");

${canais.map(([canal, nome]) => `<Field label="${nome}"><ColorField channel="${canal}" colorSpace="${espaco}" `
  + `value={colour} onValueChange={setColour} width="6rem" /></Field>`).join("\n")}
<ColorSwatch color={colour} label="${amostra}" />`;

function ComOValor() {
  const [cor, setCor] = useState("#16a34a");
  return h("div", {style: coluna},
    h(Field, {label: "Accent"}, h(ColorField, {value: cor, onValueChange: setCor})),
    h("div", {style: linha},
      h("code", null, cor === "" ? "(empty)" : cor),
      h(Button, {size: "sm", appearance: "outline", onClick: () => setCor("#0485f7")}, "Reset")));
}

function NoFormulario() {
  const [enviado, setEnviado] = useState(null);
  return h("form", {style: coluna, onSubmit: (e) => {
    e.preventDefault();
    setEnviado(String(new FormData(e.currentTarget).get("brand")));
  }},
    h(Field, {label: "Brand colour", required: true}, h(ColorField, {name: "brand", defaultValue: "#f0c200"})),
    h("div", {style: linha},
      h(Button, {type: "submit", size: "sm"}, "Save"),
      h("output", {"aria-live": "polite"}, enviado === null ? "" : `brand = ${enviado}`)));
}

export default {
  description:
    "ColorField is the field for a colour: the swatch in front and the code — hex, rgb(), hsl() or hsb(). The code " +
    "applies on Enter or when the field loses focus; text that is not a colour goes back. With channel, it edits one " +
    "channel as a number. It is the same Input, with the same sizes and variants, and Field gives it the label.",

  install: 'import {ColorField} from "@aurea-uds/react";',

  features: [
    "The value is hex (#rrggbb, or #rrggbbaa with transparency): value, defaultValue, onValueChange, onValueCommitted — like ColorArea and ColorPicker.",
    "Without defaultValue the field starts empty; clearing it calls onValueChange with \"\".",
    "channel edits one channel — hue, saturation, brightness, lightness, red, green, blue or alpha — announced as a number with the colour's name.",
    "Inside a Field, the label, the description and the error are the Field's, as in every Aurea field.",
    "Inside a ColorPicker, without a value of its own, it edits the picker's colour.",
    "name sends the colour with a form, as hex.",
  ],

  examples: [
    {
      title: "Type a colour",
      description: "Type hex, rgb(), hsl() or hsb(), then Enter. Text that is not a colour goes back.",
      code: `<Field label="Colour">
  <ColorField defaultValue="#0485f7" />
</Field>`,
      embed: true,
      render: () => h("div", {style: coluna}, h(Field, {label: "Colour"}, h(ColorField, {defaultValue: "#0485f7"}))),
    },
    {
      title: "Variants",
      description: "Since 0.34.0 neither has a line: both are a translucent fill of the text colour — the same two as Input.",
      code: `<Field label="Primary"><ColorField defaultValue="#0485f7" /></Field>
<Field label="Secondary"><ColorField variant="secondary" defaultValue="#0485f7" /></Field>`,
      render: () => h("div", {style: coluna},
        h(Field, {label: "Primary"}, h(ColorField, {defaultValue: "#0485f7"})),
        h(Field, {label: "Secondary"}, h(ColorField, {variant: "secondary", defaultValue: "#0485f7"}))),
    },
    {
      title: "In a card",
      description: "On a card the field background disappears; variant=\"secondary\" keeps it visible.",
      code: `<Card>
  <Field label="Background"><ColorField variant="secondary" defaultValue="#7c3aed" /></Field>
</Card>`,
      render: () => h(Card, {style: {width: "100%", maxWidth: "22rem"}},
        h(Field, {label: "Background"}, h(ColorField, {variant: "secondary", defaultValue: "#7c3aed"}))),
    },
    {
      title: "Sizes",
      description: "sm, md and lg — the same steps as Input and Button.",
      code: `<ColorField size="sm" defaultValue="#e11d48" aria-label="Small" />
<ColorField defaultValue="#e11d48" aria-label="Medium" />
<ColorField size="lg" defaultValue="#e11d48" aria-label="Large" />`,
      render: () => h("div", {style: coluna},
        h(ColorField, {size: "sm", defaultValue: "#e11d48", "aria-label": "Small"}),
        h(ColorField, {defaultValue: "#e11d48", "aria-label": "Medium"}),
        h(ColorField, {size: "lg", defaultValue: "#e11d48", "aria-label": "Large"})),
    },
    {
      title: "With a description",
      description: "The Field's hint describes the field.",
      code: `<Field label="Link colour" hint="Hex, rgb() or hsl(). Enter applies it.">
  <ColorField defaultValue="#0485f7" />
</Field>`,
      render: () => h("div", {style: coluna},
        h(Field, {label: "Link colour", hint: "Hex, rgb() or hsl(). Enter applies it."}, h(ColorField, {defaultValue: "#0485f7"}))),
    },
    {
      title: "Required",
      description: "The Field's required marks the field.",
      code: `<Field label="Brand colour" required>
  <ColorField placeholder="#0485f7" />
</Field>`,
      render: () => h("div", {style: coluna},
        h(Field, {label: "Brand colour", required: true}, h(ColorField, {placeholder: "#0485f7"}))),
    },
    {
      title: "Disabled and read-only",
      description: "Disabled does not take input and is skipped by the keyboard; read-only is shown and focusable.",
      code: `<Field label="Theme colour"><ColorField defaultValue="#f0c200" disabled /></Field>
<Field label="Inherited colour"><ColorField defaultValue="#f0c200" readOnly /></Field>`,
      render: () => h("div", {style: coluna},
        h(Field, {label: "Theme colour"}, h(ColorField, {defaultValue: "#f0c200", disabled: true})),
        h(Field, {label: "Inherited colour"}, h(ColorField, {defaultValue: "#f0c200", readOnly: true}))),
    },
    {
      title: "Width",
      description: "The whole line, like the other fields. width sets another one.",
      code: `<Field label="Full line"><ColorField defaultValue="#16a34a" /></Field>
<Field label="Narrow"><ColorField defaultValue="#16a34a" width="12rem" /></Field>`,
      render: () => h("div", {style: {display: "grid", gap: "var(--space-4)", width: "min(100%, 28rem)"}},
        h(Field, {label: "Full line"}, h(ColorField, {defaultValue: "#16a34a"})),
        h(Field, {label: "Narrow"}, h(ColorField, {defaultValue: "#16a34a", width: "12rem"}))),
    },
    {
      title: "Validation",
      description: "The Field's error marks the field invalid and is read with it. Here, while the field is empty.",
      code: `const [colour, setColour] = useState("");

<Field label="Brand colour" required error={colour === "" ? "Pick a colour — hex, rgb() or hsl()." : undefined}>
  <ColorField value={colour} onValueChange={setColour} placeholder="#0485f7" />
</Field>`,
      embed: true,
      render: () => h(ComOErro),
    },
    {
      title: "One channel",
      description: "channel edits one channel as a number: arrows, Page Up/Down, Home and End. Three fields share one colour.",
      code: `const [colour, setColour] = useState("#0485f7");

<Field label="Hue"><ColorField channel="hue" value={colour} onValueChange={setColour} /></Field>
<Field label="Saturation"><ColorField channel="saturation" value={colour} onValueChange={setColour} /></Field>
<Field label="Brightness"><ColorField channel="brightness" value={colour} onValueChange={setColour} /></Field>`,
      embed: true,
      render: () => h(UmCanal),
    },
    {
      title: "With the value",
      description: "Controlled: the code follows the field, and the button sets it from outside.",
      code: `const [colour, setColour] = useState("#16a34a");

<Field label="Accent"><ColorField value={colour} onValueChange={setColour} /></Field>
<Button onClick={() => setColour("#0485f7")}>Reset</Button>`,
      embed: true,
      render: () => h(ComOValor),
    },
    {
      title: "In a form",
      description: "name sends the colour as hex.",
      code: `<form onSubmit={save}>
  <Field label="Brand colour" required>
    <ColorField name="brand" defaultValue="#f0c200" />
  </Field>
  <Button type="submit">Save</Button>
</form>`,
      embed: true,
      render: () => h(NoFormulario),
    },
    {
      title: "HSL channels",
      description: "colorSpace=\"hsl\" makes hue and saturation the HSL ones, beside lightness. Three fields share one colour.",
      code: codigoDosCanais(CANAIS_HSL),
      embed: true,
      render: () => h(Canais, CANAIS_HSL),
    },
    {
      title: "RGB channels and alpha",
      description: "Red, green and blue from 0 to 255, and alpha. They are RGB channels with or without "
        + "colorSpace=\"rgb\"; the prop only changes hue and saturation, so one value can go to every field of a picker.",
      code: codigoDosCanais(CANAIS_RGB),
      embed: true,
      render: () => h(Canais, CANAIS_RGB),
    },
  ],
};
