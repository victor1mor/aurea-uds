// O Toast do nativo no site (bloco 1, o 5-A — 23/10/2026). Quem cria aviso é o `useToast`, e quem desenha a pilha é o
// `ToastHost` — o React Native não tem portal, então o hospedeiro é explícito (`toast.tsx`). O primeiro exemplo monta o
// hospedeiro de verdade, dentro do `SafeAreaProvider` que ele lê; os outros desenham o `Toast` sozinho, para mostrar cada
// forma. O aviso entra com uma animação que começa transparente: na página parada ele só aparece quando a parte viva acende.
import {createElement as h} from "react";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Button, Cluster, Toast, ToastHost, useToast} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const nada = () => {};
const coluna = {display: "grid", gap: "var(--space-3)", width: "min(24rem, 100%)"};
// O app real recebe a medida do aparelho; aqui, na caixa do site, a borda segura é zero.
const SEM_BORDA = {frame: {x: 0, y: 0, width: 0, height: 0}, insets: {top: 0, right: 0, bottom: 0, left: 0}};

function Botoes() {
  const toast = useToast();
  return h(Cluster, null,
    h(Button, {tone: "brand", onPress: () => toast.add({type: "success", title: "Changes saved"})}, "Save"),
    h(Button, {appearance: "outline", onPress: () => toast.add({type: "danger", title: "Upload failed",
      description: "The file is over 20 MB."})}, "Upload"),
    h(Button, {appearance: "ghost", onPress: () => {
      const id = toast.add({type: "info", title: "Message archived", duration: 0,
        action: h(Button, {size: "sm", appearance: "ghost", onPress: () => toast.close(id)}, "Undo")});
    }}, "Archive"));
}

export default {
  install: 'import {ToastHost, useToast} from "@aurea-uds/native";',
  description: "A notice that comes and goes on its own: saved, failed, archived. Create it with useToast() under a "
    + "ToastHost; the host draws the stack at the bottom of the screen and Toast is each notice in it.",
  api: {
    toast: "The notice: {id, title, description?, type?, duration?, action?, icon?}. type is info (the default), success, warning or danger — danger is announced at once, the others politely. duration 0 never closes on its own, and a notice with an action needs it. icon={false} draws no glyph.",
    onClose: "Called by the X. The host passes the function that takes this notice off the stack.",
  },
  examples: [
    {
      title: "Usage",
      description: "Put one ToastHost high in the app, inside the AureaProvider; it wraps the app in a view with flex: 1, the price of having no portal. Then any screen calls useToast().add(…). A notice leaves after 5 seconds; with duration 0 it waits.",
      code: `// Once, around the app:
<SafeAreaProvider>
  <AureaProvider fontFamilies={FONT_FAMILIES} icons={ICONS}>
    <ToastHost>
      <App />
    </ToastHost>
  </AureaProvider>
</SafeAreaProvider>

// Anywhere below it:
const toast = useToast();

<Button tone="brand" onPress={() => toast.add({type: "success", title: "Changes saved"})}>Save</Button>
<Button appearance="outline" onPress={() => toast.add({type: "danger", title: "Upload failed",
  description: "The file is over 20 MB."})}>Upload</Button>
<Button appearance="ghost" onPress={() => {
  const id = toast.add({type: "info", title: "Message archived", duration: 0,
    action: <Button size="sm" appearance="ghost" onPress={() => toast.close(id)}>Undo</Button>});
}}>Archive</Button>`,
      render: () => h("div", {style: {width: "min(36rem, 100%)", height: "18rem", display: "flex"}},
        h(SafeAreaProvider, {initialMetrics: SEM_BORDA},
          h(ToastHost, null, h(Botoes)))),
    },
    cada({titulo: "Types", descricao: "The colour of the type goes in the glyph and the title; the surface stays the popover's.",
      valores: ["info", "success", "warning", "danger"], estilo: coluna,
      codigo: v => `toast.add({type: "${v}", title: "type ${v}", description: "What happened, in a line."})`,
      peca: v => h(Toast, {toast: {id: v, type: v, title: `type ${v}`, description: "What happened, in a line."}, onClose: nada})}),
    {
      title: "Action and glyph",
      description: "action puts a short button in the notice — give it duration 0, so it does not run away from a slow reader. icon swaps the glyph, or removes it with false.",
      code: `toast.add({title: "Message archived", duration: 0,
  action: <Button size="sm" appearance="ghost" onPress={undo}>Undo</Button>})
toast.add({title: "New comment", icon: "chat-circle"})
toast.add({title: "Copied", icon: false})`,
      render: () => h("div", {style: coluna},
        h(Toast, {toast: {id: "a", title: "Message archived", duration: 0,
          action: h(Button, {size: "sm", appearance: "ghost"}, "Undo")}, onClose: nada}),
        h(Toast, {toast: {id: "b", title: "New comment", icon: "chat-circle"}, onClose: nada}),
        h(Toast, {toast: {id: "c", title: "Copied", icon: false}, onClose: nada})),
    },
  ],
};
