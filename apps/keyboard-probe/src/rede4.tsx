// BANCO DO MAPA DE REDE — as FAIXAS do app (MNT-27, 17/10/2026). O app de topologia manda `layer` em cada nó e
// pede que os da mesma faixa saiam na mesma altura: os dois firewalls da "borda", os switches, as estações. Até a
// 0.35.0 o `layer` não tinha efeito (o firewall secundário caía abaixo do núcleo); agora vai como partição do motor.
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/rede-mnt27.spec.ts`.
// O endereço liga cada caso: `?conteiner` (switches e estações dentro da LAN), `?parcial` (`layer` só nos
// firewalls) e `?sem` (nenhum `layer`, o desenho de antes).
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, ptBR} from "@aurea-uds/react";
import {DependencyGraph, type GraphEdgeItem, type GraphNodeItem} from "@aurea-uds/react/graph";
import "@aurea-uds/core/css";
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";
import "../../../node_modules/@xyflow/react/dist/base.css";

const q = new URLSearchParams(location.search);
const conteiner = q.has("conteiner"), parcial = q.has("parcial"), sem = q.has("sem");
const faixa = (id: string, n: number) => sem || (parcial && !id.startsWith("fw")) ? {} : {layer: n};
const naLan = conteiner ? {parentId: "lan"} : {};
const NOS: GraphNodeItem[] = [
  {id: "internet", label: "Internet", kind: "Nuvem", icon: "globe", ...faixa("internet", 0)},
  {id: "fw1", label: "Firewall primário", kind: "Firewall", icon: "shield", ...faixa("fw1", 1)},
  {id: "fw2", label: "Firewall secundário", kind: "Firewall", icon: "shield", ...faixa("fw2", 1)},
  {id: "nucleo", label: "Núcleo", kind: "Switch camada 3", icon: "network", ...faixa("nucleo", 2)},
  ...(conteiner ? [{id: "lan", label: "LAN", kind: "Rede"} as GraphNodeItem] : []),
  {id: "sw1", label: "Switch 1º andar", kind: "Switch", icon: "network", ...faixa("sw1", 3), ...naLan},
  {id: "sw2", label: "Switch 2º andar", kind: "Switch", icon: "network", ...faixa("sw2", 3), ...naLan},
  {id: "est1", label: "Recepção", kind: "Estação", icon: "desktop-tower", ...faixa("est1", 4), ...naLan},
  {id: "est2", label: "Financeiro", kind: "Estação", icon: "desktop-tower", ...faixa("est2", 4), ...naLan},
  {id: "est3", label: "Diretoria", kind: "Estação", icon: "desktop-tower", ...faixa("est3", 4), ...naLan},
  {id: "est4", label: "Servidor de arquivos", kind: "Estação", icon: "desktop-tower", ...faixa("est4", 4), ...naLan},
];
const ARESTAS: GraphEdgeItem[] = [
  {id: "i-1", from: "internet", to: "fw1"}, {id: "i-2", from: "internet", to: "fw2"},
  {id: "f1-n", from: "fw1", to: "nucleo"}, {id: "n-f2", from: "nucleo", to: "fw2"},
  {id: "n-s1", from: "nucleo", to: "sw1"}, {id: "n-s2", from: "nucleo", to: "sw2"},
  {id: "s1-e1", from: "sw1", to: "est1"}, {id: "s1-e2", from: "sw1", to: "est2"},
  {id: "s2-e3", from: "sw2", to: "est3"}, {id: "n-e4", from: "nucleo", to: "est4"},
];

function Banco() {
  return <main className="rede">
    <p className="hint">Banco das faixas do mapa (MNT-27). {conteiner ? "Com a LAN em contêiner." : parcial ? "Com `layer` só nos firewalls." : sem ? "Sem `layer`." : "Com `layer` em todos."}</p>
    <DependencyGraph nodes={NOS} edges={ARESTAS} label="Mapa com faixas" height="44rem" orientation="vertical"
      layout="layered" rootId="internet" controls />
  </main>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider spriteUrl={sprite} strings={ptBR}><Banco /></AureaProvider></StrictMode>,
);
