// O Header do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. Os exemplos saem de
// uma função com o nome da peça, porque o `Topbar` (o nome antigo, a mesma peça) mostra os mesmos com o nome dele.
import {createElement as h} from "react";
import {ScrollView, View} from "react-native";
import {Cluster, Header, IconButton, Text, useAureaTokens} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largo = {width: "100%"};
const MENSAGENS = Array.from({length: 16}, (_, n) => `Message ${n + 1}: the weekly report is ready`);
// A lista que rola por baixo da barra, com o recuo da tela (o `page` do `inset`), dos tokens.
function Rolagem() {
  const t = useAureaTokens();
  return h(ScrollView, {focusable: true, contentContainerStyle: {paddingHorizontal: t.size.space4, gap: t.size.space2}},
    ...MENSAGENS.map((m) => h(Text, {key: m}, m)));
}
const coluna = {display: "grid", gap: "var(--space-4)", width: "100%"};
const acoes = () => h(Cluster, null,
  h(IconButton, {name: "bell", label: "Notifications"}),
  h(IconButton, {name: "user", label: "Account"}));
const ACOES = `  <Cluster>
    <IconButton name="bell" label="Notifications" />
    <IconButton name="user" label="Account" />
  </Cluster>`;

export const apiDaBarra = {
  variant: "The skin. floating is a detached card with its own margin; flush merges into the background and frames the screen; pill is a centred capsule, as wide as what it holds.",
  inset: "Only on flush: the side padding. bar is 20, the default; page is 16, the Screen's, so the title lines up with the content below; none is for a bar that already sits inside padded content. floating and pill ignore it.",
  brand: "What goes first — the app's name or mark. When the bar is short of room it shrinks (a one-line title ends in an ellipsis); the actions beside it keep their size.",
  children: "Everything beside the brand: actions, a search, the account. The bar does not stick by itself (React Native has no sticky): put it outside the ScrollView, and it stays.",
};

// `nome` vai no código; `Comp` é a peça que desenha (as duas são a mesma).
export const exemplosDaBarra = (nome, Comp) => [
  {
    title: "Usage",
    code: `<${nome} brand={<Text weight={700}>Aurea</Text>}>
${ACOES}
</${nome}>`,
    render: () => h("div", {style: largo}, h(Comp, {brand: h(Text, {weight: 700}, "Aurea")}, acoes())),
  },
  cada({titulo: "Variants", descricao: "floating is the detached card, flush merges into the background, pill is the centred capsule.",
    valores: ["floating", "flush", "pill"], estilo: coluna,
    codigo: v => `<${nome} variant="${v}" brand={<Text weight={700}>Aurea</Text>}>\n${ACOES}\n</${nome}>`,
    // Numa coluna do nativo, como numa tela: é nela que a `pill` se centraliza.
    peca: v => h(View, null, h(Comp, {variant: v, brand: h(Text, {weight: 700}, "Aurea")}, acoes()))}),
  cada({titulo: "Inset", descricao: "The side padding of the flush bar: 20, 16 to line up with the Screen's content, or none.",
    valores: ["bar", "page", "none"], estilo: coluna,
    codigo: v => `<${nome} variant="flush" inset="${v}" brand={<Text weight={700}>inset ${v}</Text>}>\n${ACOES}\n</${nome}>`,
    peca: v => h(Comp, {variant: "flush", inset: v, brand: h(Text, {weight: 700}, `inset ${v}`)}, acoes())}),
  {
    title: "A long title",
    description: "On a narrow screen the brand gives way: a one-line title ends in an ellipsis, and the actions beside it keep "
      + "their size and stay on the screen.",
    code: `<${nome} variant="flush" inset="page"
  brand={<Text weight={700} numberOfLines={1}>Quarterly report for the north region</Text>}>
  <IconButton name="dots-three" label="More options" />
</${nome}>`,
    render: () => h("div", {style: {width: "min(300px,100%)"}},
      h(Comp, {variant: "flush", inset: "page",
        brand: h(Text, {weight: 700, numberOfLines: 1}, "Quarterly report for the north region")},
      h(IconButton, {name: "dots-three", label: "More options"}))),
  },
  {
    title: "Staying on top",
    description: "The bar stays put because the screen puts it outside the ScrollView — the composition React Native has instead of sticky. Scroll the list: the bar does not move.",
    code: `<View style={{flex: 1}}>
  <${nome} variant="flush" inset="page" brand={<Text weight={700}>Inbox</Text>} />
  <ScrollView contentContainerStyle={{paddingHorizontal: t.size.space4, gap: t.size.space2}}>
    {messages.map(m => <Text key={m.id}>{m.subject}</Text>)}
  </ScrollView>
</View>`,
    render: () => h("div", {style: {width: "100%", height: "16rem", display: "flex", flexDirection: "column"}},
      h(View, {style: {flex: 1}},
        h(Comp, {variant: "flush", inset: "page", brand: h(Text, {weight: 700}, "Inbox")}),
        h(Rolagem))),
  },
];

export default {
  install: 'import {Header} from "@aurea-uds/native";',
  api: apiDaBarra,
  examples: exemplosDaBarra("Header", Header),
};
