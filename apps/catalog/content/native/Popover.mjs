// O Popover do nativo no site (bloco 1, o 5-A — 23/10/2026): a janela pequena presa ao gatilho, fechada até o toque —
// a página parada mostra o gatilho. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Button, Popover} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const TEXTO = "Arrives in 2 to 3 working days.";

export default {
  install: 'import {Popover} from "@aurea-uds/native";',
  api: {
    trigger: "The element that opens it — a Button, an IconButton. Its own touch still works.",
    title: "Optional title inside the panel, announced as a header.",
    children: "The content. Plain text comes out muted, as the description; it may hold controls.",
    testID: "Test id; the backdrop gets `<testID>-fundo` and the panel `<testID>-painel`.",
  },
  examples: [
    {
      title: "Usage",
      description: "Opens on the touch; a touch outside or the system back button closes it.",
      code: `<Popover trigger={<Button appearance="outline">Delivery</Button>} title="Delivery">
  Arrives in 2 to 3 working days.
</Popover>`,
      render: () => h(Popover, {trigger: h(Button, {appearance: "outline"}, "Delivery"), title: "Delivery"}, TEXTO),
    },
    cada({titulo: "Sides", descricao: "The preferred side of the trigger. It flips on its own when there is no room.",
      valores: ["top", "right", "bottom", "left"],
      codigo: v => `<Popover side="${v}" trigger={<Button appearance="outline">${v}</Button>}>${TEXTO}</Popover>`,
      peca: v => h(Popover, {side: v, trigger: h(Button, {appearance: "outline"}, v)}, TEXTO)}),
    {
      title: "Arrow",
      description: "Off by default; arrow points the panel at its trigger.",
      code: `<Popover arrow trigger={<Button appearance="outline">Delivery</Button>} title="Delivery">
  Arrives in 2 to 3 working days.
</Popover>`,
      render: () => h(Popover, {arrow: true, trigger: h(Button, {appearance: "outline"}, "Delivery"), title: "Delivery"}, TEXTO),
    },
  ],
};
