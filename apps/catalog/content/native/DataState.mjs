// O DataState do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo: as três caras
// que tomam o lugar do conteúdo e os sete estados universais, que o acompanham.
import {createElement as h, useState} from "react";
import {Button, DataList, DataState, Skeleton, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const ITENS = [{term: "Balance", value: "$ 1,240.00"}, {term: "Updated", value: "09:42"}];
const conteudo = () => h(DataList, {items: ITENS, layout: "inline"});
const coluna = {display: "grid", gap: "var(--space-4)", width: "min(28rem, 100%)"};
const UNIVERSAIS = ["waiting_user", "waiting_approval", "waiting_dependency", "offline", "stale", "partial", "degraded"];

// A barreira de erro, tocada: o botão faz o conteúdo quebrar ao desenhar, e a região mostra a cara de erro com
// "Try again". Só quebra no toque — a página não suja o console sozinha.
function Fragil({quebrar}) {
  if (quebrar) throw new Error("The balance service answered garbage.");
  return conteudo();
}
function Barreira() {
  const [quebrar, setQuebrar] = useState(false);
  const [pegos, setPegos] = useState(0);
  return h(Stack, {align: "start"},
    h("div", {style: {width: "min(28rem, 100%)"}},
      h(DataState, {catchErrors: true, onCatch: () => { setPegos(n => n + 1); setQuebrar(false); }},
        h(Fragil, {quebrar}))),
    h(Button, {size: "sm", appearance: "outline", onPress: () => setQuebrar(true)}, "Break the content"),
    h(Text, {size: "xs", tone: "muted"}, `Errors caught: ${pegos}`));
}

export default {
  install: 'import {DataState} from "@aurea-uds/native";',
  api: {
    emptyIcon: "The glyph of the empty face, passed to EmptyState. Register it in the provider's icons.",
    catchErrors: "Catches an error while drawing the content and shows the error face in its place, with a \"Try again\" button that draws the content again. The rest of the screen stays.",
  },
  examples: [
    {
      title: "Usage",
      description: "One region, four faces. Pass a function as children when the content is expensive: it is not built while a face hides it.",
      code: `<DataState state={loading ? "loading" : undefined}>
  {() => <DataList items={items} />}
</DataState>`,
      render: () => h("div", {style: {width: "min(28rem, 100%)"}}, h(DataState, null, conteudo)),
    },
    cada({titulo: "Faces that replace", descricao: "loading, error and empty take the content's place.",
      valores: ["loading", "error", "empty"], estilo: coluna,
      codigo: v => `<DataState state="${v}">{content}</DataState>`,
      peca: v => h(DataState, {state: v}, conteudo)}),
    cada({titulo: "States that accompany", descricao: "The seven universal states keep the content and put an alert above it: the data is there, with a caveat. Hiding it would trade partial information for none.",
      valores: UNIVERSAIS, estilo: coluna,
      codigo: v => `<DataState state="${v}">{content}</DataState>`,
      peca: v => h(DataState, {state: v}, conteudo)}),
    {
      title: "Your words",
      description: "message replaces the built-in sentence — only you know what actually failed. emptyTitle, emptyIcon and action dress the empty face.",
      code: `<DataState state="error" message="The billing service is down. Try again in a minute.">
  {content}
</DataState>
<DataState state="empty" emptyTitle="No invoices" emptyIcon="folder"
  message="Invoices you send show up here."
  action={<Button size="sm">New invoice</Button>}>
  {content}
</DataState>`,
      render: () => h("div", {style: coluna},
        h(DataState, {state: "error", message: "The billing service is down. Try again in a minute."}, conteudo),
        h(DataState, {state: "empty", emptyTitle: "No invoices", emptyIcon: "folder",
          message: "Invoices you send show up here.", action: h(Button, {size: "sm"}, "New invoice")}, conteudo)),
    },
    {
      title: "The shape of what is coming",
      description: "skeleton replaces the default bar of the loading face: mirror the real layout.",
      code: `<DataState state="loading" skeleton={
  <Stack>
    <Skeleton height={20} />
    <Skeleton height={20} />
  </Stack>
}>
  {content}
</DataState>`,
      render: () => h("div", {style: {width: "min(28rem, 100%)"}},
        h(DataState, {state: "loading", skeleton: h(Stack, null, h(Skeleton, {height: 20}), h(Skeleton, {height: 20}))}, conteudo)),
    },
    {
      title: "Catching errors",
      description: "With catchErrors, an error inside the region becomes its error face, and onCatch receives it for your error log. The button breaks the content on purpose.",
      code: `<DataState catchErrors onCatch={(error, info) => log(error, info)}>
  {() => <Balance />}
</DataState>`,
      render: () => h(Barreira),
    },
  ],
};
