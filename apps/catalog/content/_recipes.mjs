// RECEITAS — preview e código de cada arquétipo (ADR-0001, Fase 7, achado I2).
//
// As 23 páginas de receita eram texto renderizado de Markdown: nenhum preview, nenhum código,
// nada que um consumidor pudesse copiar. Era o pior sintoma do achado I2 e a razão principal da
// ADR-0001. O texto (Composition / Capabilities / Invariants / States) continua vindo de
// `patterns/<id>.md`, que é a fonte validada pelo check 9; o que entra aqui é o par
// preview + código.
//
// O QUE O PREVIEW MOSTRA, declarado: o CENTRO do arquétipo montado com componentes de verdade —
// a superfície que o consumidor copia primeiro —, não uma tela inteira em miniatura. Uma receita
// é a composição de 2 a 5 patterns de arquitetura; o preview mostra o pattern central e o texto
// da página diz como os outros se encaixam. Onde o centro não é renderizável em página estática
// (um mapa, um canvas, um grafo de nós), o preview mostra a superfície ESPELHO que a própria
// receita exige — é invariante dela, não substituto: "toda seleção no mapa espelha uma lista".
//
// `uses` alimenta os chips da seção Uses e o import do Installation — os dois saem daqui, então
// não podem divergir do que o preview realmente usa.
import {createElement as h} from "react";
import * as A from "../../../packages/react/dist/index.js";
// AS RECEITAS REABERTAS (S-11, 05/11/2026): cada uma num arquivo próprio em `content/recipes/`, como tela de produto com as
// peças especializadas e interação de verdade. A caixa cresce desde a ADR-0081, então nada aqui é cortado para caber. As
// que ainda não foram reabertas continuam abaixo, como eram.
import agentAi from "./recipes/agent_ai.mjs";
import saasAdmin from "./recipes/saas_admin.mjs";
import dashboardBi from "./recipes/dashboard_bi.mjs";
import projectCrmErp from "./recipes/project_crm_erp.mjs";
import commerceFinance from "./recipes/commerce_finance.mjs";
import bookingCalendar from "./recipes/booking_calendar.mjs";
import supportService from "./recipes/support_service.mjs";
import regulatedRecords from "./recipes/regulated_records.mjs";
import workflowAutomation from "./recipes/workflow_automation.mjs";
import developerTools from "./recipes/developer_tools.mjs";
import observabilityOps from "./recipes/observability_ops.mjs";
import iotControl from "./recipes/iot_control.mjs";
import mapsLogistics from "./recipes/maps_logistics.mjs";
import fileCloud from "./recipes/file_cloud.mjs";
import publicSite from "./recipes/public_site.mjs";
import docsCms from "./recipes/docs_cms.mjs";
import catalogGallery from "./recipes/catalog_gallery.mjs";
import mediaStreaming from "./recipes/media_streaming.mjs";
import education from "./recipes/education.mjs";
import creativeWorkspace from "./recipes/creative_workspace.mjs";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};
const between = {...row, justifyContent: "space-between"};
const stack = {display: "grid", gap: "var(--space-3)"};
const wide = {width: "min(38rem,100%)"};
// A caixa de demonstração tem altura FIXA (ADR-0002) e o vão útil dela é **354px**, medido a
// 1440×761 — onde o `clamp` bate no piso. Três peças do core têm altura própria e estouravam esse
// vão sozinhas: `.log-stream` gastava 240px para mostrar três linhas e `.media-player` 464px por
// causa do `aspect-ratio`. As válvulas abaixo são as do core (`--log-h` e `--media-h`/`--media-ar`),
// com o valor que a receita precisa — quem sabe quanta altura tem é a página.
// 7rem, e ele NÃO encolhe. Encolher foi tentado em 29/08/2026, quando o `Alert` voltou a
// desenhar o glifo da variante e a receita passou a estourar a caixa em 8px — e o axe reprovou
// na hora: com 6,5rem o fluxo passa a ROLAR, e região que rola sem receber foco é
// `scrollable-region-focusable`, que é um controle removido, não um ajuste de altura. Os 8px
// saem do respiro entre as faixas, abaixo.
// 5.5rem cabe DUAS linhas de log mais o respiro. Eram três em 7rem até a 0.8.8, cuja escala de
// letra fez a receita passar 16px da caixa de demonstração.
const logCurto = {"--log-h": "5.5rem"};
// `--space-2` só nesta receita: são duas folgas, e 4px em cada uma paga os 8px do glifo do
// Alert sem tirar nada da amostra nem fazer nada rolar.
const stackApertado = {display: "grid", gap: "var(--space-2)"};
const playerCurto = {"--media-h": "9rem", "--media-ar": "auto"};
const narrow = {width: "min(24rem,100%)"};
const muted = {color: "var(--muted-foreground)", fontSize: "var(--text-sm)"};

export default {
  public_site: {...publicSite},
  docs_cms: {...docsCms},
  saas_admin: {...saasAdmin},
  dashboard_bi: {...dashboardBi},
  catalog_gallery: {...catalogGallery},
  media_streaming: {...mediaStreaming},
  workflow_automation: {...workflowAutomation},
  developer_tools: {...developerTools},
  file_cloud: {...fileCloud},
  messaging_social: {
    uses: ["Card", "Status", "MessageList", "MessageComposer"],
    code: `<Card>
  <Status variant="online">Analyst is online</Status>
  <MessageList messages={messages} />
  <MessageComposer placeholder="Message the team…" onSend={send} />
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h(A.Status, {variant: "online"}, "Analyst is online"),
      h(A.MessageList, {messages: [
        {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
        {id: "2", author: "You", time: "09:14", body: "Shipping it.",
          status: {label: "read", variant: "success"}}]}),
      h(A.MessageComposer, {placeholder: "Message the team…", onSend: () => {}})))),
  },
  commerce_finance: {...commerceFinance},
  booking_calendar: {...bookingCalendar},
  maps_logistics: {...mapsLogistics},
  iot_control: {...iotControl},
  agent_ai: {...agentAi},
  project_crm_erp: {...projectCrmErp},
  education: {...education},
  personal_productivity: {
    uses: ["Card", "Banner", "Checkbox", "Button"],
    code: `<Card>
  <Banner variant="info" title="Offline draft saved">
    It syncs when the connection returns. Navigating away keeps it.
  </Banner>
  <Checkbox label="Write the recipe previews" defaultChecked />
  <Checkbox label="Regenerate the 169 pages" />
  <Button variant="ghost" leadingIcon="plus">New task</Button>
</Card>`,
    render: () => h("div", {style: narrow}, h(A.Card, null, h("div", {style: stack},
      h(A.Banner, {variant: "info", title: "Offline draft saved"},
        "It syncs when the connection returns. Navigating away keeps it."),
      h(A.Checkbox, {label: "Write the recipe previews", defaultChecked: true}),
      h(A.Checkbox, {label: "Regenerate the 169 pages"}),
      h(A.Button, {variant: "ghost", leadingIcon: "plus"}, "New task")))),
  },
  mobile_pwa: {
    uses: ["Card", "Banner", "Field", "Input", "Button"],
    code: `// 320px is the target, not the exception: one column, full-width action,
// touch target never under 24px.
<Card>
  <Banner variant="warning" title="Offline">Saved locally, queued to send.</Banner>
  <Field label="Reading"><Input inputMode="numeric" defaultValue="41.2" /></Field>
  <Button variant="primary" fullWidth>Save reading</Button>
</Card>`,
    render: () => h("div", {style: {width: "min(20rem,100%)"}}, h(A.Card, null, h("div", {style: stack},
      h(A.Banner, {variant: "warning", title: "Offline"}, "Saved locally, queued to send."),
      h(A.Field, {label: "Reading"}, h(A.Input, {inputMode: "numeric", defaultValue: "41.2"})),
      h(A.Button, {variant: "primary", fullWidth: true}, "Save reading")))),
  },
  support_service: {...supportService},
  regulated_records: {...regulatedRecords},
  creative_workspace: {...creativeWorkspace},
  observability_ops: {...observabilityOps},
};
