// O Dialog do nativo no site (bloco 1, o 5-A — 23/10/2026). A caixa é controlada: cada exemplo tem o botão que a abre,
// e a página parada mostra só o botão — fechada, o `Modal` não desenha nada.
import {createElement as h, Fragment, useState} from "react";
import {FlatList, View} from "react-native";
import {Button, Dialog, Field, Input, Stack, Text} from "../../../../packages/native/dist/index.js";

// Um exemplo = um botão que abre e a caixa com o corpo e o rodapé que o exemplo pede.
function ComBotao({rotulo, titulo, corpo, rodape, scroll}) {
  const [open, setOpen] = useState(false);
  const fechar = () => setOpen(false);
  return h(View, {style: {alignItems: "flex-start"}},
    h(Button, {onPress: () => setOpen(true)}, rotulo),
    h(Dialog, {open, title: titulo, onClose: fechar, scroll,
      footer: rodape ? rodape(fechar) : undefined}, corpo));
}

const termos = Array.from({length: 12}, (_, n) =>
  h(Text, {key: n}, `${n + 1}. The service is provided as is. You keep the rights to what you upload, and you can export it at any time.`));

export default {
  install: 'import {Dialog} from "@aurea-uds/native";',
  api: {
    title: "REQUIRED. The accessible name, drawn as the header: a dialog with no name announces only \"window\".",
    onClose: "Called by Android's back button, by a tap on the backdrop and by the close button — one exit for the three, so the dialog cannot be dismissable one way and not another.",
    scroll: "The body scrolls (a ScrollView), and the title and footer stay put. Turn it off when the content already scrolls on its own — a FlatList, for one.",
    style: "Style of the dialog's surface.",
    testID: "Test id of the Modal; the backdrop gets -fundo.",
  },
  examples: [
    {
      title: "Usage",
      description: "Controlled, always: the dialog asks to close through onClose, and you decide. It opens in a window of its own, so the screen reader stays inside it.",
      code: `const [open, setOpen] = useState(false);

<Button onPress={() => setOpen(true)}>Rename</Button>
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Rename the report"
  footer={<>
    <Button appearance="ghost" onPress={() => setOpen(false)}>Cancel</Button>
    <Button tone="brand" onPress={save}>Save</Button>
  </>}>
  <Field label="Name"><Input defaultValue="Weekly report" /></Field>
</Dialog>`,
      render: () => h(ComBotao, {rotulo: "Rename", titulo: "Rename the report",
        corpo: h(Field, {label: "Name"}, h(Input, {defaultValue: "Weekly report"})),
        // o rodapé já é uma fila, alinhada ao fim: os botões entram soltos, como no código
        rodape: (fechar) => h(Fragment, null,
          h(Button, {appearance: "ghost", onPress: fechar}, "Cancel"),
          h(Button, {tone: "brand", onPress: fechar}, "Save"))}),
    },
    {
      title: "Without a footer",
      description: "Leave footer out and the row is not drawn at all; the close button in the corner is the way out.",
      code: `<Dialog open={open} onClose={() => setOpen(false)} title="What changed">
  <Stack>
    <Text>The report now shows the last 90 days.</Text>
    <Text tone="muted">Older data moved to the archive.</Text>
  </Stack>
</Dialog>`,
      render: () => h(ComBotao, {rotulo: "What changed", titulo: "What changed",
        corpo: h(Stack, null, h(Text, null, "The report now shows the last 90 days."),
          h(Text, {tone: "muted"}, "Older data moved to the archive."))}),
    },
    {
      title: "Long content",
      description: "The body scrolls and the title and footer stay. With scroll={false} the body is a plain view — for content that scrolls itself.",
      code: `<Dialog open={open} onClose={() => setOpen(false)} title="Terms of service"
  footer={<Button tone="brand" onPress={accept}>Accept</Button>}>
  {terms}
</Dialog>

<Dialog open={open} onClose={() => setOpen(false)} title="Members" scroll={false}>
  <FlatList data={members} renderItem={renderMember} />
</Dialog>`,
      render: () => h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-3)"}},
        h(ComBotao, {rotulo: "Terms of service", titulo: "Terms of service", corpo: h(Stack, null, ...termos),
          rodape: (fechar) => h(Button, {tone: "brand", onPress: fechar}, "Accept")}),
        h(ComBotao, {rotulo: "Members", titulo: "Members", scroll: false,
          corpo: h(FlatList, {data: ["Ana Lima", "Bruno Reis", "Carla Dias", "Davi Melo"], keyExtractor: (n) => n,
            renderItem: ({item}) => h(Text, null, item)})})),
    },
  ],
};
