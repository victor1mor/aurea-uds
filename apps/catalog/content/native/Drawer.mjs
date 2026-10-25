// O Drawer do nativo no site (bloco 1, o 5-A — 23/10/2026): o painel que entra pela borda, fechado até o toque no botão —
// a página parada mostra o gatilho. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h, useState} from "react";
import {Button, Drawer, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

// O gatilho e a gaveta, com o `open` guardado aqui, como a tela do app guardaria.
function Gaveta({rotulo = "Open filters", titulo = "Filters", ...props}) {
  const [aberta, setAberta] = useState(false);
  const fechar = () => setAberta(false);
  return h("div", null,
    h(Button, {appearance: "outline", onPress: () => setAberta(true)}, rotulo),
    h(Drawer, {open: aberta, onClose: fechar, title: titulo, ...props},
      h(Stack, {align: "start"},
        h(Text, {tone: "muted"}, "Only the reports that match stay on the list."),
        h(Button, {tone: "brand", onPress: fechar}, "Apply"))));
}

export default {
  install: 'import {Drawer} from "@aurea-uds/native";',
  api: {
    open: "Controlled: the screen keeps it, and onClose asks to close.",
    title: "The title at the top, announced as a header; it names the panel.",
    onClose: "The backdrop, the close button and the system back button all route here.",
    side: "The edge it slides from: left or right, physical sides that do not swap with the language. A panel that rises from the bottom is the BottomSheet.",
    scroll: "The body scrolls (a ScrollView). On by default; turn it off when the content scrolls by itself.",
    style: "Style for the panel.",
    testID: "Test id of the window; the backdrop gets `<testID>-fundo`.",
  },
  examples: [
    {
      title: "Usage",
      description: "Closed until the button opens it. It slides in from the right, over a backdrop that closes it.",
      code: `const [open, setOpen] = useState(false);

<Button appearance="outline" onPress={() => setOpen(true)}>Open filters</Button>
<Drawer open={open} onClose={() => setOpen(false)} title="Filters">
  <Stack align="start">
    <Text tone="muted">Only the reports that match stay on the list.</Text>
    <Button tone="brand" onPress={() => setOpen(false)}>Apply</Button>
  </Stack>
</Drawer>`,
      render: () => h(Gaveta),
    },
    cada({titulo: "Sides", descricao: "The physical edge it slides from.",
      valores: ["left", "right"],
      codigo: v => `<Drawer side="${v}" open={open} onClose={close} title="Filters">…</Drawer>`,
      peca: v => h(Gaveta, {side: v, rotulo: `Open from the ${v}`})}),
    {
      title: "A body that does not scroll",
      description: "scroll={false} leaves the body as a plain View, for content that scrolls by itself.",
      code: `<Drawer scroll={false} open={open} onClose={close} title="Filters">…</Drawer>`,
      render: () => h(Gaveta, {scroll: false, rotulo: "Open without scroll"}),
    },
  ],
};
