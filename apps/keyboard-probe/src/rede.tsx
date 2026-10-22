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
import {DependencyGraph, type DependencyGraphApi} from "@aurea-uds/react/graph";
import "@aurea-uds/core/css";
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";

// A folha ESTRUTURAL do motor importada SEM camada — o jeito mais comum (é o que o exemplo de
// instalação do catálogo mostra), e o pior caso: regra sem camada ganha da Aurea, que mora em
// `@layer aurea`. A pele do mapa tem de valer mesmo assim; é o que o teste da espessura prova.
import "../../../node_modules/@xyflow/react/dist/base.css";

import {NOS, ARESTAS, CAMINHO} from "./rede-dados";

const q = new URLSearchParams(location.search);
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
      // `?so-escolha`: só o `onSelect`, como o app de topologia (pedido 16, 19/10/2026). Com o `onNodeHover`, o motor já dava
      // ponteiro ao nó, e por isso este banco não pegava o clique que não chegava.
      {...(q.has("so-escolha") ? {} : {onNodeHover: (id: string | null) => anotar(`hover:${id}`), onNodeContextMenu: (id: string) => anotar(`menu:${id}`),
        onEdgeSelect: (id: string) => anotar(`aresta:${id}`)})}
      apiRef={(a) => { api.current = a; window.__mapa = a; }} />
  </main>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider strings={ptBR} spriteUrl={sprite}><Banco/></AureaProvider></StrictMode>);
