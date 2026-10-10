// BANCO DO MAPA DE REDE — a rodada 2 (ADR-0065, 10/10/2026): arrumar à mão, desfazer, contêineres que
// fecham, subárvore que recolhe, nuvem, rotas que desviam, pontes, rótulos que somem e as arrumações
// em árvore e em círculo. A rede de exemplo tem a forma da do app que pediu: um site com andares, um
// depósito com um segmento sem LLDP, Internet e uma filial por VPN.
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/rede2.spec.ts`.
// O endereço liga cada opção: `?leitura` (sem o modo de arrumar), `?arrumacao=tree|radial|simple`,
// `?horizontal`, `?fechado` (o depósito começa fechado), `?trabalhador` (o arrumador fora da tela
// principal, pela receita do Vite; `?trabalhador=publico`, pela receita da pasta pública — o arquivo
// `elk-worker.min.js` copiado ao lado da página), `?posicoes` (o app traz posições guardadas — sem a rota do arrumador),
// `?grande`, `?contraste`, `?visivel` (`visibleOnly`). Os comandos ficam em `window.__mapa2`, e o que o
// mapa avisa, em `window.__eventos2`.
import {StrictMode, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, ptBR} from "@aurea-uds/react";
import {DependencyGraph, type DependencyGraphApi, type GraphEdgeItem, type GraphLayout, type GraphNodeItem} from "@aurea-uds/react/graph";
import "@aurea-uds/core/css";
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";
// A folha do motor SEM camada — o pior caso, como no banco da rodada 1.
import "../../../node_modules/@xyflow/react/dist/base.css";
// A RECEITA DO VITE para o arrumador fora da tela principal (está no README): o `?worker` empacota o
// trabalhador do próprio `elkjs`, e o app entrega a fábrica ao mapa.
import TrabalhadorDoElk from "elkjs/lib/elk-worker.min.js?worker";

const q = new URLSearchParams(location.search);
const NOS: GraphNodeItem[] = [
  {id: "internet", label: "Internet", kind: "Nuvem", icon: "globe", shape: "cloud"},
  {id: "filial", label: "Filial Centro", kind: "Site remoto", icon: "buildings", shape: "cloud"},
  {id: "fw", label: "Firewall", kind: "Firewall", icon: "shield", detail: "10.0.0.1"},
  {id: "matriz", label: "Matriz", kind: "Site", icon: "buildings"},
  {id: "andar1", label: "1º andar", kind: "Andar", parentId: "matriz"},
  {id: "andar2", label: "2º andar", kind: "Andar", parentId: "matriz"},
  {id: "deposito", label: "Depósito", kind: "Andar", parentId: "matriz", collapsed: q.has("fechado")},
  {id: "core", label: "Núcleo", kind: "Switch camada 3", icon: "network", detail: "10.0.1.1", parentId: "matriz",
    ports: [{id: "sfp49", side: "top", label: "SFP 49"}, {id: "p1", side: "bottom"}, {id: "p2", side: "bottom"}, {id: "p3", side: "bottom"}]},
  {id: "srv", label: "Servidores", kind: "Servidor", icon: "hard-drives", detail: "10.0.9.10", parentId: "matriz", pinned: true},
  {id: "acc-1", label: "Acesso 1º andar", kind: "Switch de acesso", icon: "network", parentId: "andar1"},
  {id: "pc-11", label: "Recepção", kind: "Desktop", icon: "desktop-tower", parentId: "andar1"},
  {id: "pc-12", label: "Financeiro", kind: "Desktop", icon: "desktop-tower", parentId: "andar1"},
  {id: "acc-2", label: "Acesso 2º andar", kind: "Switch de acesso", icon: "network", parentId: "andar2"},
  {id: "pc-21", label: "Diretoria", kind: "Notebook", icon: "laptop", parentId: "andar2"},
  {id: "ap-2", label: "AP 2º andar", kind: "Access point", icon: "wifi-high", parentId: "andar2"},
  {id: "sem-lldp", label: "Segmento sem LLDP", kind: "Switch escondido", icon: "question", parentId: "deposito", status: {label: "Estimado", tone: "info"}},
  {id: "acc-3", label: "Acesso depósito", kind: "Switch de acesso", icon: "network", parentId: "deposito"},
  {id: "imp", label: "Impressora fiscal", kind: "Impressora", icon: "printer", parentId: "deposito", status: {label: "Sem credencial", tone: "warning"}},
  {id: "cam", label: "Câmera portão", kind: "Câmera IP", icon: "security-camera", parentId: "deposito", status: {label: "Não alcançável", tone: "danger"}},
];
const ARESTAS: GraphEdgeItem[] = [
  {id: "wan1", from: "internet", to: "fw", label: "WAN 1", priority: 1},
  {id: "wan2", from: "internet", to: "fw", label: "WAN 2"},
  {id: "vpn", from: "fw", to: "filial", mark: "lock", label: "VPN"},
  {id: "fw-core", from: "fw", to: "core", toPort: "sfp49", targetLabel: "SFP 49", pattern: "double", weight: "thick", label: "10G", priority: 2},
  {id: "core-a1", from: "core", to: "acc-1", fromPort: "p1", sourceLabel: "porta 1", weight: "thick", count: 2},
  {id: "core-a2", from: "core", to: "acc-2", fromPort: "p2", sourceLabel: "porta 2"},
  {id: "core-srv", from: "core", to: "srv", fromPort: "p3", sourceLabel: "porta 3", pattern: "double"},
  {id: "core-lldp", from: "core", to: "sem-lldp", pattern: "dashed"},
  {id: "a1-11", from: "acc-1", to: "pc-11"}, {id: "a1-12", from: "acc-1", to: "pc-12"},
  {id: "a2-21", from: "acc-2", to: "pc-21"}, {id: "a2-ap", from: "acc-2", to: "ap-2"},
  {id: "lldp-a3", from: "sem-lldp", to: "acc-3", pattern: "dashed"},
  {id: "a3-imp", from: "acc-3", to: "imp"}, {id: "a3-cam", from: "acc-3", to: "cam", mark: "cross"},
  // O cabo redundante: o 2º andar também chega pelo acesso do 1º — a subárvore do núcleo não pode sumir com ele.
  {id: "a1-a2", from: "acc-1", to: "acc-2", pattern: "dotted", label: "redundante"},
];
// As posições "guardadas pelo app" (`?posicoes`): o desenho de quem arrumou à mão, sem a rota do arrumador.
const GUARDADAS: Record<string, {x: number; y: number}> = {
  internet: {x: 420, y: 0}, filial: {x: 760, y: 120}, fw: {x: 420, y: 120},
  core: {x: 420, y: 330}, srv: {x: 680, y: 330},
  "acc-1": {x: 60, y: 520}, "pc-11": {x: 0, y: 660}, "pc-12": {x: 200, y: 660},
  "acc-2": {x: 470, y: 520}, "pc-21": {x: 420, y: 660}, "ap-2": {x: 620, y: 660},
  "sem-lldp": {x: 900, y: 520}, "acc-3": {x: 900, y: 640}, imp: {x: 820, y: 780}, cam: {x: 1020, y: 780},
};

// A PONTE (MNT-12.3) num mapa pequeno, com o cruzamento garantido: as duas linhas em degrau se cruzam
// uma vez, e a segunda da lista salta sobre a primeira.
const PONTE_NOS: GraphNodeItem[] = [
  {id: "a", label: "Roteador A", kind: "Roteador", icon: "arrows-out-cardinal", x: 0, y: 0},
  {id: "b", label: "Switch B", kind: "Switch", icon: "network", x: 600, y: 300},
  {id: "c", label: "Roteador C", kind: "Roteador", icon: "arrows-out-cardinal", x: 300, y: 0},
  {id: "d", label: "Switch D", kind: "Switch", icon: "network", x: -300, y: 400},
];
const PONTE_ARESTAS: GraphEdgeItem[] = [{id: "ab", from: "a", to: "b"}, {id: "cd", from: "c", to: "d"}];

declare global { interface Window { __mapa2?: DependencyGraphApi | null; __eventos2?: string[]; __arrumacao2?: unknown } }
window.__eventos2 = [];
// As pontas de cada linha, para o teste saber de quem a linha sai e onde chega.
(window as unknown as {__arestas2: GraphEdgeItem[]}).__arestas2 = ARESTAS;

function Banco() {
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [passos, setPassos] = useState(0);
  const api = useRef<DependencyGraphApi>(null);
  const anotar = (e: string) => { window.__eventos2!.push(e); };
  const arrumacao = (q.get("arrumacao") ?? "layered") as GraphLayout;
  const nos = q.has("posicoes") ? NOS.map(n => ({...n, ...GUARDADAS[n.id]})) : NOS;
  return <main className="rede">
    <p className="hint">Banco do mapa de rede — a rodada 2. Arrastar na área vazia faz o laço; Shift soma; a barra arruma.
      Passos guardados: <output data-passos>{passos}</output>.</p>
    <DependencyGraph nodes={nos} edges={ARESTAS} label="Mapa da rede de exemplo" height="46rem"
      orientation={q.has("horizontal") ? "horizontal" : "vertical"} layout={arrumacao} rootId="internet"
      edgeShape="step" groupParallel minimap controls collapsible editable={!q.has("leitura")}
      textSize={q.has("grande") ? "lg" : "md"} highContrast={q.has("contraste")} visibleOnly={q.has("visivel")}
      layoutWorker={q.get("trabalhador") === "publico" ? () => new Worker("./elk-worker.min.js")
        : q.has("trabalhador") ? () => new TrabalhadorDoElk() : undefined}
      selectedId={escolhido} onSelect={setEscolhido}
      onLayoutChange={(l) => { window.__arrumacao2 = l; setPassos(p => p + 1); anotar(`arrumacao:${Object.keys(l.positions).length}:${l.pinned.join(",")}`); }}
      onSelectionChange={(ids) => anotar(`escolha:${ids.join(",")}`)}
      onCollapseChange={(id, fechado) => anotar(`${fechado ? "fechou" : "abriu"}:${id}`)}
      onEdgeSelect={(id) => anotar(`aresta:${id}`)}
      apiRef={(a) => { api.current = a; window.__mapa2 = a; }} />
    <DependencyGraph nodes={PONTE_NOS} edges={PONTE_ARESTAS} label="Duas linhas que se cruzam" height="20rem" className="mapa-ponte"
      orientation="vertical" edgeShape="step" textSize={q.has("grande") ? "lg" : "md"} />
  </main>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider strings={ptBR} spriteUrl={sprite}><Banco/></AureaProvider></StrictMode>);
