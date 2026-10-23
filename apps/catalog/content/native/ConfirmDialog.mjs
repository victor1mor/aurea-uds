// O ConfirmDialog do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Fechado no começo: a página mostra o botão que o
// abre, e o toque abre a caixa de verdade. Tocar fora não fecha — é a diferença dele para o Dialog.
import {createElement as h, useState} from "react";
import {Button, ConfirmDialog, Text} from "../../../../packages/native/dist/index.js";

const coluna = {display: "grid", gap: "var(--space-3)", justifyItems: "start"};

// O botão, a caixa e o que aconteceu: `props` são as da caixa, `rotulo` o do botão que a abre.
function ComPergunta({rotulo, tom, props, feito}) {
  const [aberta, setAberta] = useState(false);
  const [resposta, setResposta] = useState(null);
  return h("div", {style: coluna},
    h(Button, {appearance: "outline", tone: tom, onPress: () => { setResposta(null); setAberta(true); }}, rotulo),
    resposta && h(Text, {tone: "muted"}, resposta),
    h(ConfirmDialog, {...props, open: aberta,
      onConfirm: () => { setAberta(false); setResposta(feito); },
      onCancel: () => { setAberta(false); setResposta("Cancelled."); }}));
}

export default {
  install: 'import {ConfirmDialog} from "@aurea-uds/native";',
  api: {
    cancelLabel: "The way out, before the confirm button in reading order. Without it, the strings phrase (\"Cancel\"). On a touch screen the focus is not moved to it: the screen reader reads the description first.",
    confirmLabel: "Name the action, not the agreement: \"Delete\" tells what the button does. Without it, the strings phrase (\"Continue\").",
    onCancel: "Required. Fires on the cancel button and on Android's Back button. A tap outside does NOT close this dialog.",
    testID: "The id for tests; the two buttons get the same id with -cancelar and -confirmar.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [open, setOpen] = useState(false);
<Button appearance="outline" tone="danger" onPress={() => setOpen(true)}>Delete report</Button>
<ConfirmDialog
  open={open}
  title="Delete this report?"
  description="It leaves every dashboard, and it cannot be brought back."
  confirmLabel="Delete"
  destructive
  onConfirm={() => { setOpen(false); remove(); }}
  onCancel={() => setOpen(false)}
/>`,
      render: () => h(ComPergunta, {rotulo: "Delete report", tom: "danger", feito: "Deleted.",
        props: {title: "Delete this report?", description: "It leaves every dashboard, and it cannot be brought back.",
          confirmLabel: "Delete", destructive: true}}),
    },
    {
      title: "Not destructive",
      description: "Without destructive the confirm button is the brand one: for a decision that matters but destroys nothing.",
      code: `<ConfirmDialog
  open={open}
  title="Publish the report?"
  description="Everyone in the workspace will see it."
  confirmLabel="Publish"
  cancelLabel="Not yet"
  onConfirm={publish}
  onCancel={close}
/>`,
      render: () => h(ComPergunta, {rotulo: "Publish report", feito: "Published.",
        props: {title: "Publish the report?", description: "Everyone in the workspace will see it.",
          confirmLabel: "Publish", cancelLabel: "Not yet"}}),
    },
    {
      title: "Default labels",
      description: "Without labels the buttons say the strings phrases, \"Cancel\" and \"Continue\" — in Portuguese with ptBR.",
      code: `<ConfirmDialog open={open} title="Leave the form?" description="What you typed is not saved."
  onConfirm={leave} onCancel={close} />`,
      render: () => h(ComPergunta, {rotulo: "Leave the form", feito: "Left the form.",
        props: {title: "Leave the form?", description: "What you typed is not saved."}}),
    },
  ],
};
