// BANCO DO MNT-31 (21/10/2026): a legenda e o minimapa do mapa cobriam os nós dos cantos de baixo. Cada
// caso é o mesmo mapa: o de antes, a legenda que fecha (aberta e fechada), o botão do minimapa junto do
// zoom, e os dois fechados — a L1 e a M2 da bancada, escolha do Victor de 21/10/2026 —, na largura em
// que o Victor lê (640, a 200%).
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/rede-mnt31.spec.ts`.
// O endereço escolhe o tema e a marca: `?claro`, `?aurea` (sem a marca `ember`, que é a do app).
import {StrictMode, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, SegmentedControl, ptBR} from "@aurea-uds/react";
import {DependencyGraph, type DependencyGraphProps} from "@aurea-uds/react/graph";
import "@aurea-uds/core/css";
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";
// A folha do motor SEM camada, o pior caso (ver `rede.tsx`).
import "../../../node_modules/@xyflow/react/dist/base.css";
import {NOS, ARESTAS} from "./rede-dados";

const q = new URLSearchParams(location.search);
document.documentElement.dataset.theme = q.has("claro") ? "light" : "dark";
if (!q.has("aurea")) document.documentElement.dataset.brand = "ember";

type Caso = {id: string; titulo: string; texto: string; props: Partial<DependencyGraphProps>};
const CASOS: Caso[] = [
  {id: "antes", titulo: "Antes", texto: "A legenda e o minimapa sempre abertos, por cima dos nós dos cantos de baixo.",
    props: {legend: true, minimap: true, controls: true}},
  {id: "legenda", titulo: "A legenda que fecha", texto: "O botão “Legenda” fica parado no canto. Aberta, a lista sobe acima dele; fechada, sobra só o botão.",
    props: {legend: true, legendCollapsible: true, minimap: true, controls: true}},
  {id: "legenda-fechada", titulo: "A legenda que fecha, começando fechada", texto: "A mesma, com `defaultLegendOpen={false}`.",
    props: {legend: true, legendCollapsible: true, defaultLegendOpen: false, minimap: true, controls: true}},
  {id: "minimapa", titulo: "O botão do minimapa junto do zoom", texto: "O botão fica com os de aproximar e afastar, em cima. O minimapa fica onde sempre ficou.",
    props: {minimap: true, minimapToggle: true, controls: true}},
  {id: "fechados", titulo: "Os dois, começando fechados", texto: "Os dois cantos de baixo livres.",
    props: {legend: true, legendCollapsible: true, defaultLegendOpen: false, minimap: true, minimapToggle: true, defaultMinimapOpen: false, controls: true}},
];

function Banco() {
  // O tema e a marca também por botão: a bancada publicada como página não recebe o endereço.
  const [tema, setTema] = useState(document.documentElement.dataset.theme ?? "dark");
  const [marca, setMarca] = useState(document.documentElement.dataset.brand ?? "aurea");
  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    if (marca === "ember") document.documentElement.dataset.brand = "ember"; else delete document.documentElement.dataset.brand;
  }, [tema, marca]);
  return <main className="rede5">
    <div className="barra">
      <SegmentedControl label="Tema" value={tema} onChange={setTema} items={[{value: "dark", label: "Escuro"}, {value: "light", label: "Claro"}]}/>
      <SegmentedControl label="Marca" value={marca} onChange={setMarca} items={[{value: "ember", label: "ember"}, {value: "aurea", label: "Aurea"}]}/>
    </div>
    {CASOS.map((c) => <section key={c.id} className="caso" id={c.id} data-caso={c.id}>
      <h2>{c.titulo}</h2>
      <p className="hint">{c.texto}</p>
      <DependencyGraph nodes={NOS} edges={ARESTAS} label={`Mapa: ${c.titulo}`} height="26rem" orientation="vertical" layout="layered"
        rootId="internet" edgeShape="step" groupParallel {...c.props}/>
    </section>)}
  </main>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider strings={ptBR} spriteUrl={sprite}><Banco/></AureaProvider></StrictMode>);
