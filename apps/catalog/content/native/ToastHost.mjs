// O ToastHost do nativo no site (bloco 1, o 5-A — 23/10/2026): o hospedeiro da pilha de avisos. O React Native não tem
// portal, então ele é um `View` à vista em volta do app; aqui, em volta de uma "tela" pequena, com os botões que chamam
// o `useToast()` — os avisos sobem no pé dela quando a página está viva.
import {createElement as h} from "react";
import {SafeAreaInsetsContext} from "react-native-safe-area-context";
import {Button, ToastHost, useToast} from "../../../../packages/native/dist/index.js";

// A pilha lê a folga do sistema (`useSafeAreaInsets`), que pede um provedor de área segura — no app, o `expo-router` e
// o `react-navigation` já põem o `SafeAreaProvider` na raiz. Aqui a folga vai DIRETO no contexto, em zero: o
// `SafeAreaProvider` do navegador (react-native-safe-area-context 5.9.1, `NativeSafeAreaProvider.web.js`) mede a caixa
// contra a janela e dá folga de baixo a toda caixa que nasce abaixo da dobra — medido aqui: 209 a mais numa barra
// de baixo mais abaixo na página.
const SEM_FOLGA = {top: 0, right: 0, bottom: 0, left: 0};
const fila = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};

const Tela = ({altura = 300, children}) => h("div", {style: {width: "min(30rem, 100%)"}},
  h(SafeAreaInsetsContext.Provider, {value: SEM_FOLGA}, h("div", {style: {display: "flex", flexDirection: "column", position: "relative", height: altura}}, children)));

// Os botões que pedem os avisos — de dentro do hospedeiro, como qualquer tela do app.
function Botoes({lista}) {
  const toast = useToast();
  return h("div", {style: fila}, ...lista.map(([rotulo, aviso]) =>
    h(Button, {key: rotulo, appearance: "outline", size: "sm", onPress: () => toast.add(aviso)}, rotulo)));
}

const TIPOS = [
  ["Info", {title: "Sync started", type: "info"}],
  ["Success", {title: "Report saved", description: "Everyone on the team can see it.", type: "success"}],
  ["Warning", {title: "Storage almost full", type: "warning"}],
  ["Danger", {title: "Could not send", description: "Check the connection and try again.", type: "danger"}],
];

// O aviso com ação fica até a pessoa fechar: `duration: 0`.
function ComAcao() {
  const toast = useToast();
  const apagar = () => {
    const id = toast.add({title: "Report deleted", duration: 0,
      action: h(Button, {size: "sm", appearance: "ghost", onPress: () => toast.close(id)}, "Undo")});
  };
  return h(Button, {appearance: "outline", size: "sm", onPress: apagar}, "Delete report");
}

export default {
  install: 'import {ToastHost, useToast} from "@aurea-uds/native";',
  description: "Hosts the toast stack and its state; useToast() needs one above it and throws without it. React Native has no portal, so the host is an explicit View with flex: 1 that the app puts near the root, inside the AureaProvider.",
  api: {
    children: "The app. Toasts stack at the bottom of this View, over it.",
    max: "How many toasts fit at once; past that, the oldest goes. Defaults to 3.",
    duration: "How long a toast stays when it does not say, in ms. Defaults to 5000. A toast with duration 0 never closes by itself — the one with an action needs it.",
    offset: "How far up the stack goes, in dp. Use it above a BottomNav, or the toast covers the tab the person was about to touch.",
    style: "Style for the host View.",
    testID: "Test id of the host; the stack gets `<testID>-pilha`.",
  },
  examples: [
    {
      title: "Usage",
      description: "Each button calls useToast().add; the toast rises at the bottom of the host and goes after five seconds. danger is announced at once; the others, politely.",
      code: `<AureaProvider>
  <ToastHost>
    <App />
  </ToastHost>
</AureaProvider>

// in any screen inside it
const toast = useToast();
<Button onPress={() => toast.add({title: "Report saved", type: "success"})}>Save</Button>`,
      render: () => h(Tela, null, h(ToastHost, null, h(Botoes, {lista: TIPOS}))),
    },
    {
      title: "Stack and duration",
      description: "max={2} keeps the two newest; duration sets how long each stays.",
      code: `<ToastHost max={2} duration={3000}>
  <App />
</ToastHost>`,
      render: () => h(Tela, null, h(ToastHost, {max: 2, duration: 3000}, h(Botoes, {lista: TIPOS}))),
    },
    {
      title: "Above a bottom bar",
      description: "offset lifts the stack, so it does not sit on the tabs.",
      code: `<ToastHost offset={88}>
  <App />
</ToastHost>`,
      render: () => h(Tela, null, h(ToastHost, {offset: 88}, h(Botoes, {lista: TIPOS.slice(1, 2)}))),
    },
    {
      title: "With an action",
      description: "A toast with a button stays until it is closed: duration 0, or the button runs away from whoever reads slowly.",
      code: `const id = toast.add({
  title: "Report deleted",
  duration: 0,
  action: <Button size="sm" appearance="ghost" onPress={() => { undo(); toast.close(id); }}>Undo</Button>,
});`,
      render: () => h(Tela, null, h(ToastHost, null, h(ComAcao))),
    },
  ],
};
