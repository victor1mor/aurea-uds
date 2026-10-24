// O BottomNav do nativo no site (bloco 1, o 5-A — 23/10/2026): a barra de baixo do `@aurea-uds/native` rodando pelo
// `react-native-web`, cada uma numa "tela" pequena, porque a `floating` sai do fluxo e encosta no pé de quem a contém.
// Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h, useState} from "react";
import {SafeAreaInsetsContext} from "react-native-safe-area-context";
import {BottomNav} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

// A barra lê a folga do sistema (`useSafeAreaInsets`), que pede um provedor de área segura — no app, o `expo-router` e
// o `react-navigation` já põem o `SafeAreaProvider` na raiz. Aqui a folga vai DIRETO no contexto, em zero: o
// `SafeAreaProvider` do navegador (react-native-safe-area-context 5.9.1, `NativeSafeAreaProvider.web.js`) mede a caixa
// contra a janela e dá folga de baixo a toda caixa que nasce abaixo da dobra — medido aqui: 209 a mais na terceira
// barra da página, que subia para cima das outras.
const SEM_FOLGA = {top: 0, right: 0, bottom: 0, left: 0};
const coluna = {display: "grid", gap: "var(--space-4)", width: "100%"};

const ITENS = [
  {id: "home", label: "Home", icon: "house"},
  {id: "alerts", label: "Alerts", icon: "bell", badge: 3},
  {id: "saved", label: "Saved", icon: "heart"},
  {id: "profile", label: "Profile", icon: "user"},
];
const ITENS_CODIGO = `const items: AureaNavItem[] = [
  {id: "home", label: "Home", icon: "house", onPress: () => go("home")},
  {id: "alerts", label: "Alerts", icon: "bell", badge: 3, onPress: () => go("alerts")},
  {id: "saved", label: "Saved", icon: "heart", onPress: () => go("saved")},
  {id: "profile", label: "Profile", icon: "user", onPress: () => go("profile")},
];`;

// Uma tela de 120 com a barra no pé; o toque troca a aba, como o navegador do app faria.
function Tela({nome = "Main menu", ...props}) {
  const [aba, setAba] = useState("home");
  const items = ITENS.map((it) => ({...it, onPress: () => setAba(it.id)}));
  return h("div", {style: {width: "min(26rem, 100%)"}},
    h(SafeAreaInsetsContext.Provider, {value: SEM_FOLGA}, h("div", {style: {display: "flex", flexDirection: "column", position: "relative", height: 120, justifyContent: "flex-end"}},
      h(BottomNav, {label: nome, current: aba, items, ...props}))));
}

export default {
  install: 'import {BottomNav} from "@aurea-uds/native";',
  api: {
    items: "The tabs, as data: {id, label, icon?, badge?, onPress?, disabled?}. A number badge becomes a counter, true becomes a dot. The bar draws; your navigator changes the screen in onPress.",
    current: "The id of the tab you are on. It is announced as selected and painted by the indicator.",
    variant: "Where the bar sits: floating is a pill over the screen, out of the flow, with the system's bottom gap kept outside it; edge lies against the bottom edge and stays in the flow.",
    indicator: "The shape that marks the current tab; the meaning never changes with the shape. Every indicator except expand keeps every label visible, and no measure depends on which tab is current, so the bar never moves.",
    label: "The bar's name for the screen reader. Defaults to the phrase in the strings table.",
  },
  examples: [
    {
      title: "Usage",
      description: "Pass it as the tabBar of your navigator. It needs the SafeAreaProvider that expo-router and react-navigation already render at the root.",
      code: `${ITENS_CODIGO}\n\n<BottomNav label="Main menu" current={tab} items={items} />`,
      render: () => h(Tela),
    },
    cada({titulo: "Variants", descricao: "floating flies over the screen as a pill; edge lies against the bottom edge, in the flow. In the browser, react-native-web keeps the floating bar's shadow under the edge one.",
      valores: ["floating", "edge"], estilo: coluna,
      codigo: v => `<BottomNav variant="${v}" current={tab} items={items} />`,
      peca: v => h(Tela, {variant: v, nome: `Main menu, ${v}`})}),
    cada({titulo: "Indicators", descricao: "The shape of the current tab. expand shows only icons and grows the current tab into a capsule with its name; the others keep their names for the screen reader.",
      valores: ["none", "subtle", "pill", "circle", "circle-raised", "circle-outline", "circle-bold", "capsule", "expand"], estilo: coluna,
      codigo: v => `<BottomNav indicator="${v}" current={tab} items={items} />`,
      peca: v => h(Tela, {indicator: v, nome: `Main menu, ${v}`})}),
    cada({titulo: "Width", descricao: "full spans the screen minus the margin; content sizes the pill to its tabs and centres it. Only on floating: edge stays full width.",
      valores: ["full", "content"], estilo: coluna,
      codigo: v => `<BottomNav width="${v}" indicator="pill" current={tab} items={items} />`,
      peca: v => h(Tela, {width: v, indicator: "pill", nome: `Main menu, ${v}`})}),
  ],
};
