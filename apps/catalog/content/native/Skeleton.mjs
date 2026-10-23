// O Skeleton do nativo no site (bloco 1, o 5-A — 23/10/2026): a caixa que pulsa enquanto o dado não chega, rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h, useState} from "react";
import {Button, Card, Skeleton, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(22rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-4)", width: "min(22rem, 100%)"};

// O esqueleto de um cartão: o retrato redondo e duas linhas.
const esqueletoDeCartao = (props = {}) => h(Card, null, h(Stack, null,
  h(Skeleton, {width: 48, height: 48, radius: 24, ...props}),
  h(Skeleton, {width: "80%", ...props}),
  h(Skeleton, {width: "50%", ...props})));

// O conteúdo que chega: o botão troca o `isLoading`.
function Carregando() {
  const [carregando, setCarregando] = useState(true);
  return h("div", {style: {...largura, display: "grid", gap: "var(--space-3)"}},
    h(Card, null, h(Stack, null,
      h(Skeleton, {isLoading: carregando, width: "70%", height: 24}, h(Text, {weight: 600, size: "lg"}, "Ada Lovelace")),
      h(Skeleton, {isLoading: carregando, width: "90%"}, h(Text, {tone: "muted"}, "Analyst, joined in 2024")))),
    h("div", null, h(Button, {appearance: "outline", onPress: () => setCarregando((v) => !v)}, carregando ? "Load" : "Reset")));
}

export default {
  install: 'import {Skeleton} from "@aurea-uds/native";',
  api: {
    width: "Width in dp or as a percentage (\"60%\"). Defaults to the full width.",
    height: "Height in dp. Defaults to 16, one line of text.",
    radius: "The corner, in dp. Without it, the corner of the skin.",
    style: "Style for the box, after width, height and radius.",
    isLoading: "With false, the box goes and the children come in, fading. Defaults to true, or to the SkeletonGroup's.",
    children: "The content that replaces the box when isLoading is false.",
    testID: "Test id of the box.",
  },
  examples: [
    {
      title: "Usage",
      description: "Hidden from the screen reader: three \"boxes\" announced while the screen loads help no one.",
      code: `<Card>
  <Stack>
    <Skeleton width={48} height={48} radius={24} />
    <Skeleton width="80%" />
    <Skeleton width="50%" />
  </Stack>
</Card>`,
      render: () => h("div", {style: largura}, esqueletoDeCartao()),
    },
    cada({titulo: "Animation", descricao: "pulse, or none. With reduced motion requested by the system, it never pulses.",
      valores: ["pulse", "none"], estilo: coluna,
      codigo: v => `<Skeleton animation="${v}" width="80%" />`,
      peca: v => h(Skeleton, {animation: v, width: "80%"})}),
    {
      title: "The content arrives",
      description: "isLoading={false} takes the box away and brings the children in.",
      code: `<Skeleton isLoading={loading} width="70%" height={24}>
  <Text weight={600} size="lg">Ada Lovelace</Text>
</Skeleton>
<Skeleton isLoading={loading} width="90%">
  <Text tone="muted">Analyst, joined in 2024</Text>
</Skeleton>`,
      render: () => h(Carregando),
    },
  ],
};
