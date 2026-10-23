// O Tabs do nativo no site (bloco 1, o 5-A — 23/10/2026): as abas DENTRO da tela, controladas — cada exemplo guarda a
// aba aberta e responde ao toque. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h, useState} from "react";
import {Tabs, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(28rem, 100%)"};
const larga = {display: "grid", gap: "var(--space-6)", width: "100%"};

const ABAS = [
  {id: "summary", label: "Summary", content: "Revenue rose 12% this month."},
  {id: "details", label: "Details", content: "Every order, by day and by channel."},
  {id: "history", label: "History", content: "The last twelve months."},
];
const ABAS_CODIGO = `const tabs = [
  {id: "summary", label: "Summary", content: <Text>Revenue rose 12% this month.</Text>},
  {id: "details", label: "Details", content: <Text>Every order, by day and by channel.</Text>},
  {id: "history", label: "History", content: <Text>The last twelve months.</Text>},
];`;
const comTexto = (abas) => abas.map((a) => ({...a, content: h(Text, null, a.content)}));

function Abas({abas = ABAS, label = "Report", ...props}) {
  const [aberta, setAberta] = useState(abas[0].id);
  return h(Tabs, {tabs: comTexto(abas), value: aberta, onChange: setAberta, label, ...props});
}

export default {
  install: 'import {Tabs} from "@aurea-uds/native";',
  api: {
    tabs: "Tab and panel together: {id, label, content, disabled?}. Only the open panel is mounted, so a panel's own state (scroll, typed text) is lost when you switch; keep it outside if it matters.",
    onChange: "Called with the id of the tab touched.",
    justify: "Where the row of tabs sits when it fits: start, center or end. When it does not fit, it scrolls sideways.",
    variant: "primary is the capsule, with the open tab on a lifted segment; secondary drops the capsule and marks the open tab with the Aurea selected line.",
  },
  examples: [
    {
      title: "Usage",
      description: "Switches a panel inside this screen. To change screens, the BottomNav.",
      code: `${ABAS_CODIGO}\n\n<Tabs label="Report" tabs={tabs} value={tab} onChange={setTab} />`,
      render: () => h("div", {style: largura}, h(Abas)),
    },
    cada({titulo: "Variants", descricao: "The capsule, or the bare row with the selected line under the open tab.",
      valores: ["primary", "secondary"], estilo: larga,
      codigo: v => `<Tabs variant="${v}" label="Report" tabs={tabs} value={tab} onChange={setTab} />`,
      peca: v => h("div", {style: largura}, h(Abas, {variant: v, label: `Report, ${v}`}))}),
    cada({titulo: "Panels", descricao: "card puts the content in an inset card; plain drops the box, for content that is already a card, a table or a list.",
      valores: ["card", "plain"], estilo: larga,
      codigo: v => `<Tabs panel="${v}" label="Report" tabs={tabs} value={tab} onChange={setTab} />`,
      peca: v => h("div", {style: largura}, h(Abas, {panel: v, label: `Report, ${v}`}))}),
    cada({titulo: "Justify", descricao: "Where the row of tabs sits when it fits.",
      valores: ["start", "center", "end"], estilo: larga,
      codigo: v => `<Tabs justify="${v}" label="Report" tabs={tabs} value={tab} onChange={setTab} />`,
      peca: v => h(Abas, {justify: v, label: `Report, ${v}`})}),
    {
      title: "A tab that does not open",
      description: "disabled on a tab dims it and announces it as disabled.",
      code: `<Tabs label="Report" value={tab} onChange={setTab} tabs={[
  {id: "summary", label: "Summary", content: <Text>Revenue rose 12% this month.</Text>},
  {id: "forecast", label: "Forecast", content: <Text>Available at the end of the month.</Text>, disabled: true},
]} />`,
      render: () => h("div", {style: largura}, h(Abas, {abas: [ABAS[0],
        {id: "forecast", label: "Forecast", content: "Available at the end of the month.", disabled: true}]})),
    },
  ],
};
