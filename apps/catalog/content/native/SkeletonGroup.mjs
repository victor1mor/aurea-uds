// O SkeletonGroup do nativo no site (bloco 1, o grupo 1 — 23/10/2026): um comando para vários esqueletos. O
// `isLoading` e a `animation` descem para todo `SkeletonGroup.Item` de dentro, e o pulso é um só: sobem e descem juntos.
import {createElement as h, useState} from "react";
import {Avatar, Button, Card, Cluster, SkeletonGroup, Stack, Text, useAureaTokens} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)", justifyItems: "start"};
const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "var(--space-4)", width: "100%"};

// O cartão de uma pessoa: cada pedaço tem o seu esqueleto, do tamanho do que ele esconde.
function Pessoa({carregando, animacao}) {
  const t = useAureaTokens();
  return h(Card, {style: {alignSelf: "stretch"}}, h(SkeletonGroup, {isLoading: carregando, animation: animacao},
    h(Cluster, null,
      h(SkeletonGroup.Item, {width: t.size.space12, height: t.size.space12, radius: t.size.radiusFull}, h(Avatar, {fallback: "AS"})),
      h(Stack, {style: {flex: 1}},
        h(SkeletonGroup.Item, {width: "70%"}, h(Text, {weight: 600}, "Ana Souza")),
        h(SkeletonGroup.Item, {width: "40%"}, h(Text, {size: "xs", tone: "muted"}, "Analyst"))))));
}

// O botão troca o carregando pelo conteúdo, nos dois sentidos.
function Alternavel() {
  const [carregando, setCarregando] = useState(true);
  return h("div", {style: largura},
    h(Pessoa, {carregando}),
    h(Button, {appearance: "outline", onPress: () => setCarregando((c) => !c)}, carregando ? "Show the content" : "Load again"));
}

// O grupo feito só de esqueletos: com `isSkeletonOnly`, ele some inteiro quando acaba de carregar.
function SoEsqueletos() {
  const t = useAureaTokens();
  const [carregando, setCarregando] = useState(true);
  return h("div", {style: largura},
    h(Text, {weight: 600}, "Recent activity"),
    h(SkeletonGroup, {isLoading: carregando, isSkeletonOnly: true, style: {alignSelf: "stretch", gap: t.size.space3}},
      h(SkeletonGroup.Item, null), h(SkeletonGroup.Item, {width: "80%"}), h(SkeletonGroup.Item, {width: "60%"})),
    h(Button, {appearance: "outline", onPress: () => setCarregando((c) => !c)}, carregando ? "Finish loading" : "Load again"));
}

const CODIGO_PESSOA = (props) => `<SkeletonGroup${props}>
  <Cluster>
    <SkeletonGroup.Item width={t.size.space12} height={t.size.space12} radius={t.size.radiusFull}>
      <Avatar fallback="AS" />
    </SkeletonGroup.Item>
    <Stack style={{flex: 1}}>
      <SkeletonGroup.Item width="70%"><Text weight={600}>Ana Souza</Text></SkeletonGroup.Item>
      <SkeletonGroup.Item width="40%"><Text size="xs" tone="muted">Analyst</Text></SkeletonGroup.Item>
    </Stack>
  </Cluster>
</SkeletonGroup>`;

export default {
  install: 'import {SkeletonGroup} from "@aurea-uds/native";',
  description: "One switch for several skeletons. isLoading and animation go down to every SkeletonGroup.Item inside, at any depth, and the pulse is one: the boxes rise and fall together instead of each in its own time. SkeletonGroup.Item is the Skeleton itself — with isLoading off it shows its children.",
  api: {
    children: "The layout, with SkeletonGroup.Item (width, height, radius) where the content will be; each item wraps the content it stands for.",
    isLoading: "false swaps every skeleton inside for its content. true by default. An item's own isLoading wins.",
    isSkeletonOnly: "Hides the whole group when isLoading is false — for a group made only of skeletons, whose boxes would sit empty. false by default.",
    animation: "pulse (the default) or none, for every skeleton inside. An item's own animation wins.",
    style: "Added to the group's box.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [loading, setLoading] = useState(true);
${CODIGO_PESSOA(" isLoading={loading}")}`,
      render: () => h(Alternavel),
    },
    cada({titulo: "Animation", descricao: "pulse breathes, all boxes together; none keeps them still.",
      valores: ["pulse", "none"], estilo: grade,
      codigo: v => CODIGO_PESSOA(` animation="${v}"`),
      peca: v => h(Pessoa, {carregando: true, animacao: v})}),
    {
      title: "Only skeletons",
      description: "isSkeletonOnly hides the whole group when loading ends, instead of leaving empty boxes behind.",
      code: `<SkeletonGroup isLoading={loading} isSkeletonOnly style={{gap: t.size.space3}}>
  <SkeletonGroup.Item />
  <SkeletonGroup.Item width="80%" />
  <SkeletonGroup.Item width="60%" />
</SkeletonGroup>`,
      render: () => h(SoEsqueletos),
    },
  ],
};
