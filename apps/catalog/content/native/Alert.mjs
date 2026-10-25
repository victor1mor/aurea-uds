// O Alert do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h, useState} from "react";
import {Alert, Button} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-3)", width: "min(32rem, 100%)"};
const ESTADOS = ["waiting_user", "waiting_approval", "waiting_dependency", "offline", "stale", "partial", "degraded"];

// O aviso que se fecha: o X chama `onDismiss`, e quem guarda se ele está na tela é a tela.
function Fechavel() {
  const [aberto, setAberto] = useState(true);
  return h("div", {style: largura}, aberto
    ? h(Alert, {variant: "info", title: "New version", onDismiss: () => setAberto(false)}, "Restart the app to update.")
    : h("div", null, h(Button, {appearance: "outline", onPress: () => setAberto(true)}, "Show the alert again")));
}

export default {
  install: 'import {Alert} from "@aurea-uds/native";',
  api: {
    variant: "Tone and, with it, how the screen reader hears it: danger is an alert that interrupts; the others are polite and wait their turn.",
    state: "One of the seven universal states. It picks the variant (waiting is info, the rest warning) and writes the sentence; children replace the sentence.",
    icon: "Overrides the glyph. By default it follows the variant, in the filled form; the glyph has to be in the app's icon registry.",
    onDismiss: "Shows the X (the CloseButton, named \"Close\") and is called when it is pressed. The Alert does not hide itself.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Alert variant="success" title="Saved">Your changes are live.</Alert>`,
      render: () => h("div", {style: largura}, h(Alert, {variant: "success", title: "Saved"}, "Your changes are live.")),
    },
    cada({titulo: "Variants", descricao: "What the message means. danger interrupts the screen reader; the other three wait their turn.",
      valores: ["info", "success", "warning", "danger"], estilo: largura,
      codigo: v => `<Alert variant="${v}" title="variant ${v}">The message, in context.</Alert>`,
      peca: v => h(Alert, {variant: v, title: `variant ${v}`}, "The message, in context.")}),
    cada({titulo: "Universal states", descricao: "A state picks the variant and writes the sentence: waiting is info, the rest is a warning.",
      valores: ESTADOS, estilo: largura,
      codigo: v => `<Alert state="${v}" />`,
      peca: v => h(Alert, {state: v})}),
    {
      title: "Dismissible",
      description: "onDismiss shows the X. The screen keeps the state: here the alert comes back with the button.",
      code: `const [open, setOpen] = useState(true);
{open && (
  <Alert variant="info" title="New version" onDismiss={() => setOpen(false)}>
    Restart the app to update.
  </Alert>
)}`,
      render: () => h(Fechavel),
    },
    {
      title: "Your own icon",
      description: "icon swaps the glyph of the variant for one from the app's registry.",
      code: `<Alert variant="info" icon="bell" title="Reminder">The report is due on Friday.</Alert>`,
      render: () => h("div", {style: largura}, h(Alert, {variant: "info", icon: "bell", title: "Reminder"}, "The report is due on Friday.")),
    },
  ],
};
