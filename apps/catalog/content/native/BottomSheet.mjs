// O BottomSheet do nativo no site (bloco 1, o grupo 1 — 23/10/2026): a folha que sobe de baixo, que a web não tem.
// Fechada no começo — a página mostra o botão que a abre, e o toque abre a folha de verdade.
import {createElement as h, useState} from "react";
import {BottomSheet, Button, Stack, Text} from "../../../../packages/native/dist/index.js";

// Uma folha com o botão que a abre: `props` são as da folha, `filhos(fechar)` o que vai dentro.
function ComFolha({rotulo, props, filhos}) {
  const [aberta, setAberta] = useState(false);
  const fechar = () => setAberta(false);
  return h("div", null,
    h(Button, {appearance: "outline", onPress: () => setAberta(true)}, rotulo),
    h(BottomSheet, {...props, open: aberta, onClose: fechar}, filhos(fechar)));
}

const opcoes = (fechar) => h(Stack, null,
  h(Button, {appearance: "ghost", onPress: fechar}, "Newest first"),
  h(Button, {appearance: "ghost", onPress: fechar}, "Oldest first"),
  h(Button, {appearance: "ghost", onPress: fechar}, "By name"));

export default {
  install: 'import {BottomSheet} from "@aurea-uds/native";',
  description: "The sheet that rises from the bottom, where the thumb is. It has no web counterpart: on a phone held in one hand, a centred dialog puts the choices where they are hardest to reach.",
  api: {
    open: "Required. You own the state.",
    title: "The sheet's name, as a header. Optional here, and only here: a short sheet of options sometimes has none on screen.",
    children: "The content. Inside, fields take the grey of a white surface.",
    onClose: "Required. Called on a tap on the backdrop, on Android's Back button and when the sheet is dragged down past a third of its height (at least 80) or flicked down.",
    grabber: "Shows the handle on top. On by default; turn it off with draggable, or it promises a gesture that does not exist.",
    draggable: "Dragging down closes. On by default; letting go before a third of the height brings the sheet back. Turn it off when the content scrolls sideways.",
    scroll: "Wraps the content in a ScrollView. On by default; turn it off for short, fixed content.",
    style: "Added to the sheet, after the Aurea skin.",
    testID: "The id for tests; the backdrop gets the same id with -fundo.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [open, setOpen] = useState(false);
<Button appearance="outline" onPress={() => setOpen(true)}>Sort by</Button>
<BottomSheet open={open} onClose={() => setOpen(false)} title="Sort by">
  <Stack>
    <Button appearance="ghost" onPress={() => setOpen(false)}>Newest first</Button>
    <Button appearance="ghost" onPress={() => setOpen(false)}>Oldest first</Button>
    <Button appearance="ghost" onPress={() => setOpen(false)}>By name</Button>
  </Stack>
</BottomSheet>`,
      render: () => h(ComFolha, {rotulo: "Sort by", props: {title: "Sort by"}, filhos: opcoes}),
    },
    {
      title: "Without the handle",
      description: "grabber={false} with draggable={false}: no handle and no drag; the backdrop and the Back button still close it.",
      code: `<BottomSheet open={open} onClose={close} title="Sort by" grabber={false} draggable={false}>
  …
</BottomSheet>`,
      render: () => h(ComFolha, {rotulo: "Open without handle", props: {title: "Sort by", grabber: false, draggable: false}, filhos: opcoes}),
    },
    {
      title: "Fixed content",
      description: "scroll={false} drops the ScrollView, for a short sheet with an answer and a button.",
      code: `<BottomSheet open={open} onClose={close} title="Report sent" scroll={false}>
  <Stack>
    <Text tone="muted">We will email you when it is ready.</Text>
    <Button onPress={close}>Done</Button>
  </Stack>
</BottomSheet>`,
      render: () => h(ComFolha, {rotulo: "Open fixed sheet", props: {title: "Report sent", scroll: false},
        filhos: (fechar) => h(Stack, null, h(Text, {tone: "muted"}, "We will email you when it is ready."),
          h(Button, {onPress: fechar}, "Done"))}),
    },
  ],
};
