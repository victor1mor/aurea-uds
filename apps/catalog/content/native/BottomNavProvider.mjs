// O BottomNavProvider do nativo no site (bloco 1, o 5-A — 23/10/2026): o provedor não desenha nada, então a página mostra
// o que ele faz — a barra conta a própria altura, e quem lê `useBottomNavSpace()` recebe o número.
import {createElement as h, useState} from "react";
import {SafeAreaInsetsContext} from "react-native-safe-area-context";
import {BottomNav, BottomNavProvider, Text, useBottomNavSpace} from "../../../../packages/native/dist/index.js";

// A barra lê a folga do sistema (`useSafeAreaInsets`), que pede um provedor de área segura — no app, o `expo-router` e
// o `react-navigation` já põem o `SafeAreaProvider` na raiz. Aqui a folga vai DIRETO no contexto, em zero: o
// `SafeAreaProvider` do navegador (react-native-safe-area-context 5.9.1, `NativeSafeAreaProvider.web.js`) mede a caixa
// contra a janela e dá folga de baixo a toda caixa que nasce abaixo da dobra — medido aqui: 209 a mais na terceira
// barra da página, que subia para cima das outras.
const SEM_FOLGA = {top: 0, right: 0, bottom: 0, left: 0};
const ITENS = [
  {id: "home", label: "Home", icon: "house"},
  {id: "alerts", label: "Alerts", icon: "bell"},
  {id: "profile", label: "Profile", icon: "user"},
];

// O número que o `Screen scroll` reserva sozinho no fim da rolagem.
function Espaco() {
  const espaco = useBottomNavSpace();
  return h(Text, {size: "sm"}, `Space the bar takes: ${espaco}`);
}

function Tela({variant}) {
  const [aba, setAba] = useState("home");
  return h("div", {style: {width: "min(26rem, 100%)"}},
    h(SafeAreaInsetsContext.Provider, {value: SEM_FOLGA}, h("div", {style: {display: "flex", flexDirection: "column", position: "relative", height: 150, justifyContent: "space-between"}},
      h(BottomNavProvider, null,
        h(Espaco),
        h(BottomNav, {variant, label: `Main menu${variant ? `, ${variant}` : ""}`, current: aba,
          items: ITENS.map((it) => ({...it, onPress: () => setAba(it.id)}))})))));
}

const CODIGO_ESPACO = `function Space() {
  const space = useBottomNavSpace();
  return <Text>Space the bar takes: {space}</Text>;
}`;

export default {
  install: 'import {BottomNavProvider, useBottomNavSpace} from "@aurea-uds/native";',
  description: "Goes around the tab navigator. The floating BottomNav reports its own height to it, Screen with scroll keeps the end of the list clear of the bar, and useBottomNavSpace() gives the number to anything else.",
  api: {
    children: "The tab navigator, with the BottomNav as its tab bar. Outside a provider the space is 0 and nothing changes.",
  },
  examples: [
    {
      title: "Usage",
      description: "The number is the pill, its two margins and the system's bottom gap. It is measured from the drawn bar, so here it appears once the page is live; before that it reads 0.",
      code: `${CODIGO_ESPACO}

<BottomNavProvider>
  <Space />
  <BottomNav current={tab} items={items} />
</BottomNavProvider>`,
      render: () => h(Tela),
    },
    {
      title: "An edge bar takes no space",
      description: "variant=\"edge\" stays in the flow and already shortens the screen, so it reports 0. In the browser, react-native-web keeps the floating bar's shadow under it.",
      code: `<BottomNavProvider>
  <Space />
  <BottomNav variant="edge" current={tab} items={items} />
</BottomNavProvider>`,
      render: () => h(Tela, {variant: "edge"}),
    },
  ],
};
