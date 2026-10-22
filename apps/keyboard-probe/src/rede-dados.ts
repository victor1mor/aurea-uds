// A rede de exemplo dos bancos do mapa (a da rodada 1, ADR-0064): a forma da do app que pediu.
import type {GraphEdgeItem, GraphNodeItem} from "@aurea-uds/react/graph";

export const NOS: GraphNodeItem[] = [
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
export const ARESTAS: GraphEdgeItem[] = [
  ...Array.from({length: 10}, (_, i) => ({id: `wan${i + 1}`, from: "internet", to: "fw", label: `WAN ${i + 1}`, legend: "Cobre"})),
  {id: "vpn", from: "fw", to: "filial", mark: "lock", legend: "VPN", label: "VPN"},
  {id: "fw-core", from: "fw", to: "core", toPort: "sfp49", targetLabel: "SFP 49", pattern: "double", weight: "thick", legend: "Fibra", label: "10G", status: {label: "Ativo", tone: "success"}},
  {id: "lag-a", from: "core", to: "dist-a", fromPort: "p1", count: 2, weight: "thick", legend: "Agregação (LAG)", sourceLabel: "porta 1"},
  {id: "lag-b", from: "core", to: "dist-b", fromPort: "p2", count: 2, weight: "thick", legend: "Agregação (LAG)", sourceLabel: "porta 2"},
  {id: "core-srv", from: "core", to: "srv", fromPort: "p3", pattern: "double", legend: "Fibra", sourceLabel: "porta 3"},
  {id: "a-1", from: "dist-a", to: "acc-1", fromPort: "p41", legend: "Cobre", sourceLabel: "porta 41"},
  {id: "a-2", from: "dist-a", to: "acc-2", fromPort: "p42", legend: "Cobre", sourceLabel: "porta 42"},
  {id: "b-lldp", from: "dist-b", to: "sem-lldp", pattern: "dashed", legend: "Estimado", status: {label: "Atenção", tone: "warning"}},
  {id: "lldp-3", from: "sem-lldp", to: "acc-3", pattern: "dashed", legend: "Estimado", status: {label: "Atenção", tone: "warning"}},
  {id: "b-ap", from: "dist-b", to: "ap-1", legend: "Cobre"},
  {id: "ap-note", from: "ap-1", to: "note", pattern: "dotted", legend: "Sem fio"},
  {id: "a3-imp", from: "acc-3", to: "imp", legend: "Cobre"},
  // O TIPO da linha é o cabo (`legend`); o ESTADO vem à parte (`status`), com a cor e o × (12/10/2026).
  {id: "a3-cam", from: "acc-3", to: "cam", legend: "Cobre", status: {label: "Caído", tone: "danger", mark: "cross"}},
  {id: "a3-ponto", from: "acc-3", to: "ponto", mark: "dot", legend: "Anotado à mão"},
];
export const CAMINHO = {nodes: ["internet", "fw", "core", "dist-b", "sem-lldp", "acc-3", "cam"], edges: ["wan1", "fw-core", "lag-b", "b-lldp", "lldp-3", "a3-cam"]};
