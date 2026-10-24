// O ScrollShadow do nativo no site (bloco 1, o grupo 1 — 23/10/2026): "tem mais para lá". A Aurea não tem degradê:
// no lugar da sombra da referência, um FIO de 1 na ponta onde há conteúdo escondido, e só lá. O fio se mede pela
// rolagem: na imagem parada da página ele ainda não existe, e aparece quando a peça acende — role cada lista para ver.
import {createElement as h} from "react";
import {ScrollView} from "react-native";
import {Badge, ScrollShadow, Text, useAureaTokens} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))", gap: "var(--space-4)", width: "100%"};
const DIAS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Next Monday", "Next Tuesday"];
// A lista e a fila medem pelos tokens: a altura da janela é a do `space24` (96), e mostra três linhas de nove.
// ⚠ O ScrollShadow entrega ao filho os avisos de rolagem (`onScroll`, `onLayout`, `onContentSizeChange`): os dois
// repassam tudo o que recebem ao ScrollView, senão o fio nunca saberia que a lista rolou.
function Lista({nome, ...avisos}) {
  const t = useAureaTokens();
  return h(ScrollView, {...avisos, focusable: true, style: {height: t.size.space24}},
    ...DIAS.map((d) => h(Text, {key: d, style: {paddingVertical: t.size.space1}}, `${nome} · ${d}`)));
}
function Fila({nome, ...avisos}) {
  const t = useAureaTokens();
  return h(ScrollView, {...avisos, horizontal: true, focusable: true, contentContainerStyle: {gap: t.size.space3, paddingVertical: t.size.space1}},
    ...DIAS.map((d) => h(Badge, {key: d}, `${nome} · ${d}`)));
}
const vertical = (nome) => h(Lista, {nome});
const horizontal = (nome) => h(Fila, {nome, horizontal: true});
const LISTA = `  <ScrollView style={{height: t.size.space24}}>
    {days.map((d) => <Text key={d} style={{paddingVertical: t.size.space1}}>{d}</Text>)}
  </ScrollView>`;
const FILA = `  <ScrollView horizontal contentContainerStyle={{gap: t.size.space3, paddingVertical: t.size.space1}}>
    {days.map((d) => <Badge key={d}>{d}</Badge>)}
  </ScrollView>`;

export default {
  install: 'import {ScrollShadow} from "@aurea-uds/native";',
  description: "Tells that there is more to scroll: a line at the end where content is hidden, and only there — at the top of the list no line above, at the bottom none below. Aurea has no gradients, so the reference's fade becomes a 1-wide line. By default the list sits on an Aurea surface, with the card's 22 corner.",
  api: {
    children: "Required. The scroller — a ScrollView, a FlatList — as one element. It keeps the scroll, layout and size handlers the app already gave it.",
    orientation: "Which axis it watches. Without it, it follows the scroller's horizontal.",
    visibility: "At which end the line may appear: auto and both are the two ends; top or left only the start; bottom or right only the end; none neither.",
    isEnabled: "false removes the lines.",
    variant: "surface (the default) puts the list on a card surface; plain has no box, for a list already inside a card — the line then stops 22 short of each side.",
    style: "Added to the outer box.",
    testID: "The id for tests; the two lines get the same id with -start and -end.",
  },
  examples: [
    {
      title: "Usage",
      code: `const t = useAureaTokens();
<ScrollShadow>
${LISTA}
</ScrollShadow>`,
      render: () => h("div", {style: {width: "min(20rem, 100%)"}}, h(ScrollShadow, null, vertical("Shift"))),
    },
    cada({titulo: "Visibility", descricao: "Which end may show the line. left and right are the same ends as top and bottom, on a row that scrolls sideways.",
      valores: ["auto", "top", "bottom", "both", "none", "left", "right"], estilo: grade,
      codigo: v => v === "left" || v === "right"
        ? `<ScrollShadow visibility="${v}" orientation="horizontal">\n${FILA}\n</ScrollShadow>`
        : `<ScrollShadow visibility="${v}">\n${LISTA}\n</ScrollShadow>`,
      peca: v => h(ScrollShadow, v === "left" || v === "right" ? {visibility: v, orientation: "horizontal"} : {visibility: v},
        v === "left" || v === "right" ? horizontal(v) : vertical(v))}),
    cada({titulo: "Orientation", descricao: "vertical watches the top and the bottom; horizontal, the left and the right.",
      valores: ["vertical", "horizontal"], estilo: grade,
      codigo: v => `<ScrollShadow orientation="${v}">\n${v === "horizontal" ? FILA : LISTA}\n</ScrollShadow>`,
      peca: v => h(ScrollShadow, {orientation: v}, v === "horizontal" ? horizontal(v) : vertical(v))}),
    cada({titulo: "Variants", descricao: "surface is the list on a card; plain has no box, for a list that already lives in one.",
      valores: ["surface", "plain"], estilo: grade,
      codigo: v => `<ScrollShadow variant="${v}">\n${LISTA}\n</ScrollShadow>`,
      peca: v => h(ScrollShadow, {variant: v}, vertical(v))}),
    {
      title: "Without the lines",
      description: "isEnabled={false} keeps the box and takes the lines away.",
      code: `<ScrollShadow isEnabled={false}>
${LISTA}
</ScrollShadow>`,
      render: () => h("div", {style: {width: "min(20rem, 100%)"}}, h(ScrollShadow, {isEnabled: false}, vertical("Off"))),
    },
  ],
};
