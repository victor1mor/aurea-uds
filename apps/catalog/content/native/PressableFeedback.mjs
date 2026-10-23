// O PressableFeedback do nativo no site (bloco 1, o grupo 1 — 23/10/2026): o alvo de toque que responde. Por padrão a
// peça inteira encolhe um pouco com o dedo em cima; dentro dele, o realce, a onda e a escala num filho só.
// Toque e segure em cada cartão para ver: na imagem parada nada se mexe.
import {createElement as h, useState} from "react";
import {Card, PressableFeedback, Text, useAureaTokens} from "../../../../packages/native/dist/index.js";

const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "var(--space-3)", width: "100%"};

// Um cartão tocável: a raiz leva o canto do cartão, para o realce e a onda ficarem dentro dele.
function Tocavel({nome, props, partes = () => null, filho}) {
  const t = useAureaTokens();
  const [toques, setToques] = useState(0);
  const conteudo = h(Card, null, h(Text, {weight: 600}, nome), h(Text, {size: "xs", tone: "muted"}, `Pressed ${toques} times`));
  return h(PressableFeedback, {style: {borderRadius: t.size.radiusCard}, accessibilityLabel: nome,
    onPress: () => setToques((n) => n + 1), ...props},
    filho ? filho(conteudo) : conteudo, partes());
}

export default {
  install: 'import {PressableFeedback} from "@aurea-uds/native";',
  description: "A touch target that answers the finger. By default the whole piece shrinks a little while pressed (0.985 on a piece 300 wide, less on a wider one, in 300 ms); inside it, PressableFeedback.Highlight lights a layer, PressableFeedback.Ripple grows a wave from the finger, and PressableFeedback.Scale shrinks one child. It is a button for the screen reader, and one element: what goes inside is content, not another button.",
  api: {
    children: "The content, and the parts: PressableFeedback.Highlight and PressableFeedback.Ripple go after the content, so they draw over it.",
    isDisabled: "Turns the touch off: announced as disabled and dimmed.",
    animation: "true (the default) shrinks the root. false keeps the root still — to put PressableFeedback.Scale on a child. \"disable-all\" also turns off the highlight, the ripple and the inner scale.",
    scale: "The scale while pressed, on a piece 300 wide. 0.985 by default.",
    style: "The root's style. Give it the corner of what is inside, so the highlight and the ripple stay within it.",
  },
  examples: [
    {
      title: "Usage",
      code: `const t = useAureaTokens();
<PressableFeedback onPress={open} accessibilityLabel="Weekly report" style={{borderRadius: t.size.radiusCard}}>
  <Card><Text weight={600}>Weekly report</Text></Card>
  <PressableFeedback.Highlight />
</PressableFeedback>`,
      render: () => h("div", {style: grade}, h(Tocavel, {nome: "Weekly report", partes: () => h(PressableFeedback.Highlight)})),
    },
    {
      title: "Highlight, ripple and scale",
      description: "Three ways to answer: the layer that lights (the iPhone's touch), the wave from the finger (Android's), and the root's scale alone.",
      code: `<PressableFeedback style={{borderRadius: t.size.radiusCard}}>
  <Card>…</Card>
  <PressableFeedback.Highlight />
</PressableFeedback>
<PressableFeedback style={{borderRadius: t.size.radiusCard}}>
  <Card>…</Card>
  <PressableFeedback.Ripple />
</PressableFeedback>
<PressableFeedback style={{borderRadius: t.size.radiusCard}} scale={0.95}>
  <Card>…</Card>
</PressableFeedback>`,
      render: () => h("div", {style: grade},
        h(Tocavel, {nome: "Highlight", partes: () => h(PressableFeedback.Highlight)}),
        h(Tocavel, {nome: "Ripple", partes: () => h(PressableFeedback.Ripple)}),
        h(Tocavel, {nome: "Scale 0.95", props: {scale: 0.95}})),
    },
    {
      title: "Animation",
      description: "animation={false} keeps the root still, so PressableFeedback.Scale can shrink one child; \"disable-all\" turns every part off.",
      code: `<PressableFeedback animation={false} style={{borderRadius: t.size.radiusCard}}>
  <PressableFeedback.Scale><Card>…</Card></PressableFeedback.Scale>
</PressableFeedback>
<PressableFeedback animation="disable-all" style={{borderRadius: t.size.radiusCard}}>
  <Card>…</Card>
  <PressableFeedback.Highlight />
</PressableFeedback>`,
      render: () => h("div", {style: grade},
        h(Tocavel, {nome: "Scale on the child", props: {animation: false}, filho: (c) => h(PressableFeedback.Scale, null, c)}),
        h(Tocavel, {nome: "Everything off", props: {animation: "disable-all"}, partes: () => h(PressableFeedback.Highlight)})),
    },
    {
      title: "Disabled",
      description: "isDisabled turns the touch off, dims the piece and tells the screen reader.",
      code: `<PressableFeedback isDisabled style={{borderRadius: t.size.radiusCard}}>
  <Card>…</Card>
  <PressableFeedback.Highlight />
</PressableFeedback>`,
      render: () => h("div", {style: grade}, h(Tocavel, {nome: "Disabled", props: {isDisabled: true}, partes: () => h(PressableFeedback.Highlight)})),
    },
  ],
};
