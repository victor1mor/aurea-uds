// BANCO DO MAPA DE REDE — a rodada 1 (ADR-0064, 10/10/2026). A arrumação em camadas, as medidas das
// linhas e o teclado só existem no navegador; aqui o `DependencyGraph` roda de verdade, com uma rede de
// exemplo na forma da do app que pediu (10 enlaces entre o firewall e a Internet, agregação, fibra,
// sem fio, VPN, um enlace estimado, um caído e um anotado à mão).
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/rede.spec.ts`.
// O endereço liga cada opção: `?simples` (arrumação simples), `?horizontal`, `?curva`, `?separadas`
// (sem juntar enlaces), `?grande` (texto), `?contraste`, `?caminho`, `?vizinhos`, `?ocultar`,
// `?foco=<id>`. Os comandos do mapa ficam em `window.__mapa`, para o teste.
import {StrictMode, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, ptBR} from "@aurea-uds/react";
import {DependencyGraph, type DependencyGraphApi, type GraphEdgeItem, type GraphNodeItem} from "@aurea-uds/react/graph";
import "@aurea-uds/core/css";
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";

// A folha ESTRUTURAL do motor importada SEM camada — o jeito mais comum (é o que o exemplo de
// instalação do catálogo mostra), e o pior caso: regra sem camada ganha da Aurea, que mora em
// `@layer aurea`. A pele do mapa tem de valer mesmo assim; é o que o teste da espessura prova.
import "../../../node_modules/@xyflow/react/dist/base.css";

const q = new URLSearchParams(location.search);
const NOS: GraphNodeItem[] = [
  {id: "internet", label: "Internet", kind: "Nuvem", icon: "globe"},
  {id: "fw", label: "Firewall", kind: "Firewall", icon: "shield", detail: "10.0.0.1"},
  {id: "filial", label: "Filial Centro", kind: "Site remoto", icon: "cloud"},
  {id: "core", label: "Núcleo", kind: "Switch camada 3", icon: "network", detail: "10.0.1.1",
    ports: [{id: "sfp49", side: "top", label: "SFP 49"}, {id: "p1", side: "bottom"}, {id: "p2", side: "bottom"}, {id: "p3", side: "bottom"}]},
  {id: "dist-a", label: "Distribuição A", kind: "Switch", icon: "network", detail: "10.0.2.1",
    ports: [{id: "p41", side: "bottom"}, {id: "p42", side: "bottom"}]},
  {id: "dist-b", label: "Distribuição B", kind: "Switch", icon: "network", detail: "10.0.3.1"},
  {id: "srv", label: "Servidores", kind: "Servidor", icon: "hard-drives", detail: "10.0.9.10"},
  {id: "acc-1", label: "Acesso 1º andar", kind: "Switch de acesso", icon: "network", count: 20, countLabel: "20 estações"},
  {id: "acc-2", label: "Acesso 2º andar", kind: "Switch de acesso", icon: "network", count: 14, countLabel: "14 estações"},
  {id: "sem-lldp", label: "Segmento sem LLDP", kind: "Switch escondido", icon: "question", status: {label: "Estimado", tone: "info"}},
  {id: "acc-3", label: "Acesso depósito", kind: "Switch de acesso", icon: "network", count: 6, countLabel: "6 estações"},
  {id: "ap-1", label: "AP Recepção", kind: "Access point", icon: "wifi-high"},
  {id: "note", label: "Notebook visitante", kind: "Notebook", icon: "laptop"},
  {id: "imp", label: "Impressora fiscal", kind: "Impressora", icon: "printer", status: {label: "Sem credencial", tone: "warning"}},
  {id: "cam", label: "Câmera portão", kind: "Câmera IP", icon: "security-camera", status: {label: "Não alcançável", tone: "danger"}},
  {id: "ponto", label: "Relógio de ponto", kind: "Controle de acesso", icon: "fingerprint"},
];
const ARESTAS: GraphEdgeItem[] = [
  ...Array.from({length: 10}, (_, i) => ({id: `wan${i + 1}`, from: "internet", to: "fw", label: `WAN ${i + 1}`, legend: "Cobre"})),
  {id: "vpn", from: "fw", to: "filial", mark: "lock", legend: "VPN", label: "VPN"},
  {id: "fw-core", from: "fw", to: "core", toPort: "sfp49", targetLabel: "SFP 49", pattern: "double", weight: "thick", legend: "Fibra", label: "10G"},
  {id: "lag-a", from: "core", to: "dist-a", fromPort: "p1", count: 2, weight: "thick", legend: "Agregação (LAG)", sourceLabel: "porta 1"},
  {id: "lag-b", from: "core", to: "dist-b", fromPort: "p2", count: 2, weight: "thick", legend: "Agregação (LAG)", sourceLabel: "porta 2"},
  {id: "core-srv", from: "core", to: "srv", fromPort: "p3", pattern: "double", legend: "Fibra", sourceLabel: "porta 3"},
  {id: "a-1", from: "dist-a", to: "acc-1", fromPort: "p41", legend: "Cobre", sourceLabel: "porta 41"},
  {id: "a-2", from: "dist-a", to: "acc-2", fromPort: "p42", legend: "Cobre", sourceLabel: "porta 42"},
  {id: "b-lldp", from: "dist-b", to: "sem-lldp", pattern: "dashed", legend: "Estimado"},
  {id: "lldp-3", from: "sem-lldp", to: "acc-3", pattern: "dashed", legend: "Estimado"},
  {id: "b-ap", from: "dist-b", to: "ap-1", legend: "Cobre"},
  {id: "ap-note", from: "ap-1", to: "note", pattern: "dotted", legend: "Sem fio"},
  {id: "a3-imp", from: "acc-3", to: "imp", legend: "Cobre"},
  {id: "a3-cam", from: "acc-3", to: "cam", mark: "cross", legend: "Caído"},
  {id: "a3-ponto", from: "acc-3", to: "ponto", mark: "dot", legend: "Anotado à mão"},
];
const CAMINHO = {nodes: ["internet", "fw", "core", "dist-b", "sem-lldp", "acc-3", "cam"], edges: ["wan1", "fw-core", "lag-b", "b-lldp", "lldp-3", "a3-cam"]};

declare global { interface Window { __mapa?: DependencyGraphApi | null; __eventos?: string[] } }
window.__eventos = [];

function Banco() {
  const [escolhido, setEscolhido] = useState<string | null>(q.get("escolhido"));
  const api = useRef<DependencyGraphApi>(null);
  const anotar = (e: string) => { window.__eventos!.push(e); };
  return <main className="rede">
    <p className="hint">Banco do mapa de rede — a rodada 1. Os comandos ficam em <code>window.__mapa</code>.</p>
    <DependencyGraph nodes={NOS} edges={ARESTAS} label="Mapa da rede de exemplo" height="44rem"
      orientation={q.has("horizontal") ? "horizontal" : "vertical"} layout={q.has("simples") ? "simple" : "layered"} rootId="internet"
      edgeShape={q.has("curva") ? "curve" : "step"} groupParallel={!q.has("separadas")} minimap controls legend
      textSize={q.has("grande") ? "lg" : "md"} highContrast={q.has("contraste")} highlightNeighbors={q.has("vizinhos")}
      highlight={q.has("caminho") ? CAMINHO : null} hiddenIds={q.has("ocultar") ? ["acc-1", "acc-2"] : undefined}
      selectedId={escolhido} onSelect={setEscolhido} focusId={q.get("foco")}
      onNodeHover={(id) => anotar(`hover:${id}`)} onNodeContextMenu={(id) => anotar(`menu:${id}`)} onEdgeSelect={(id) => anotar(`aresta:${id}`)}
      apiRef={(a) => { api.current = a; window.__mapa = a; }} />
  </main>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider strings={ptBR} spriteUrl={sprite}><Banco/></AureaProvider></StrictMode>);
