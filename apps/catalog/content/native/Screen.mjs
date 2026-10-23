// O Screen do nativo no site (bloco 1, o grupo 1 — 23/10/2026): a casca de uma tela. Aqui cada tela mora numa caixa do
// tamanho de um pedaço de telefone, com sombra para se ver onde ela acaba — no app, a Screen ocupa a tela inteira.
// ⚠ No navegador a `SafeAreaView` da biblioteca LÊ o `SafeAreaProvider` (a versão web dela usa o gancho de inset), e sem
// ele a Screen levanta erro — medido aqui em 23/10/2026. No aparelho ela é uma view nativa e não precisa. Cada caixa leva
// o provedor, com as medidas zeradas para o desenho parado da página sair (sem elas ele só desenha depois de medir).
import {createElement as h, useState} from "react";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Button, Card, Screen, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "var(--space-4)", width: "100%"};
const MEDIDAS = {frame: {x: 0, y: 0, width: 0, height: 0}, insets: {top: 0, right: 0, bottom: 0, left: 0}};
const telefone = (filho, altura = "18rem") => h("div", {style: {display: "flex", flexDirection: "column", height: altura,
  width: "min(20rem, 100%)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "var(--shadow-sm)"}},
  h(SafeAreaProvider, {initialMetrics: MEDIDAS}, filho));

const ITENS = ["Fuel", "Tolls", "Parking", "Lunch", "Hotel", "Taxi", "Train", "Coffee"];
const lista = (titulo) => h(Stack, null, titulo, ...ITENS.map((n) => h(Card, {key: n}, h(Text, null, n))));

// O puxar para atualizar: `refreshing` é do app, e some quando a "busca" volta.
function Atualizavel() {
  const [buscando, setBuscando] = useState(false);
  const atualizar = () => { setBuscando(true); setTimeout(() => setBuscando(false), 1000); };
  return telefone(h(Screen, {scroll: true, onRefresh: atualizar, refreshing: buscando}, lista()));
}

export default {
  install: 'import {Screen} from "@aurea-uds/native";',
  description: "The shell of one screen: it fills, paints the theme's surface, and keeps the content away from the notch and the gesture bar on all four sides. On a phone it needs no SafeAreaProvider above it; in the browser (react-native-web) it does.",
  api: {
    edges: "Which edges take the system inset. All four by default — in landscape the notch is on the left or the right.",
    padded: "16 of padding around the content. On by default; false for a list from edge to edge.",
    scroll: "Wraps the content in a ScrollView. The padding then goes to the content, so the scroll bar stays at the edge.",
    background: "Which surface the screen is: background (the default, the web's body), surface1 or surface2.",
    onRefresh: "Pull to refresh: called when the person drags the top down. Only with scroll — a screen that does not scroll has nothing to pull. The pull is a phone gesture; the browser has none.",
    refreshing: "Shows the refresh indicator. It belongs to the app: the screen cannot guess when the fetch ended.",
    footer: "The fixed footer, outside the scroll and stuck to the bottom, clear of the system area — and above the tab bar inside a BottomNavProvider.",
    children: "The screen's content.",
  },
  examples: [
    {
      title: "Usage",
      description: "In the browser the safe-area view reads a SafeAreaProvider above it — put one at the top of the app (react-navigation already does). On a phone the Screen needs none.",
      code: `<SafeAreaProvider>
  <Screen scroll footer={<Button tone="brand" fullWidth onPress={submit}>Submit report</Button>}>
    <Stack>
      <Text type="h4">Expenses</Text>
${ITENS.map((n) => `      <Card><Text>${n}</Text></Card>`).join("\n")}
    </Stack>
  </Screen>
</SafeAreaProvider>`,
      render: () => telefone(h(Screen, {scroll: true, footer: h(Button, {tone: "brand", fullWidth: true}, "Submit report")},
        lista(h(Text, {key: "t", type: "h4"}, "Expenses"))), "22rem"),
    },
    cada({titulo: "Backgrounds", descricao: "Which surface the screen paints: the page background, or one of the two surfaces above it.",
      valores: ["background", "surface1", "surface2"], estilo: grade,
      codigo: v => `<Screen background="${v}">\n  <Text weight={600}>background ${v}</Text>\n</Screen>`,
      peca: v => telefone(h(Screen, {background: v}, h(Text, {weight: 600}, `background ${v}`)), "9rem")}),
    {
      title: "Edge to edge",
      description: "padded={false} drops the 16 around the content, for a list that runs from edge to edge; edges picks which sides keep the system inset.",
      code: `<Screen padded={false} edges={["top", "bottom"]}>
  <Stack>
    <Card><Text>Fuel</Text></Card>
    <Card><Text>Tolls</Text></Card>
  </Stack>
</Screen>`,
      render: () => telefone(h(Screen, {padded: false, edges: ["top", "bottom"]},
        h(Stack, null, h(Card, null, h(Text, null, "Fuel")), h(Card, null, h(Text, null, "Tolls")))), "12rem"),
    },
    {
      title: "Pull to refresh",
      description: "onRefresh with scroll: on a phone, dragging the top down calls it, and refreshing shows the indicator until the app says it is done. The browser has no pull gesture, so here the list only scrolls.",
      code: `const [refreshing, setRefreshing] = useState(false);
<Screen scroll onRefresh={reload} refreshing={refreshing}>
  <Stack>
${ITENS.map((n) => `    <Card><Text>${n}</Text></Card>`).join("\n")}
  </Stack>
</Screen>`,
      render: () => h(Atualizavel),
    },
  ],
};
