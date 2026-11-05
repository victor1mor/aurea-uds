// RECEITAS — a caixa e o código de cada arquétipo (ADR-0001, Fase 7, achado I2; reabertas no S-11, 05/11/2026).
//
// O texto de cada receita (Composition / Capabilities / Invariants / States) continua vindo de `patterns/<id>.md`, a fonte
// validada pelo check 9; o que mora aqui é o par caixa + código.
//
// Desde 05/11/2026 cada receita é uma TELA DE PRODUTO num arquivo próprio em `content/recipes/<id>.mjs`, na linguagem dos
// blocos v2 do Victor (a `Tela` de `recipes/_tela.mjs`: o cabeçalho com a trilha, o id, o título e o estado; o corpo; a
// coluna de propriedades; o rodapé; e a divisão entre eles), com as peças especializadas da Aurea e interação de verdade.
// Antes, as 23 eram cortadas para caber na caixa de altura fixa de 354 (ADR-0002); a ADR-0081 trocou pela caixa que cresce,
// e as medidas de corte (`logCurto`, `playerCurto`…) saíram com elas.
//
// `uses` alimenta os cartões de "Built with." e o import da página — os dois saem daqui, então não podem divergir do que a
// tela usa. `prerender` (a receita com `Chart`) pede ao gerador o desenho pronto, porque o motor do gráfico só desenha
// depois de montar. As receitas usam peças de motor (a `DataGrid`, o `Chart`, o mapa, o editor): elas acendem só com o
// `live-motores.js` (`live/main.tsx` as deixa de fora).
//
// As chaves ficam com dois espaços de recuo e `id: {` — é como o `validate.py` (`_chaves_mjs`) confere que toda receita do
// contrato tem caixa.
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
import messagingSocial from "./recipes/messaging_social.mjs";
import personalProductivity from "./recipes/personal_productivity.mjs";
import mobilePwa from "./recipes/mobile_pwa.mjs";

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
  messaging_social: {...messagingSocial},
  commerce_finance: {...commerceFinance},
  booking_calendar: {...bookingCalendar},
  maps_logistics: {...mapsLogistics},
  iot_control: {...iotControl},
  agent_ai: {...agentAi},
  project_crm_erp: {...projectCrmErp},
  education: {...education},
  personal_productivity: {...personalProductivity},
  mobile_pwa: {...mobilePwa},
  support_service: {...supportService},
  regulated_records: {...regulatedRecords},
  creative_workspace: {...creativeWorkspace},
  observability_ops: {...observabilityOps},
};
