// BANCO DO PASSO 10 (0.32.0) — os pedidos do app de rede, MNT-21 a MNT-26. Como os outros bancos, este
// não afirma nada: monta. Quem afirma é `tests/visual/rede3.spec.ts`.
//
// MNT-23: a árvore funda com rótulo longo, em três arranjos de página comuns, cada um numa caixa de
// largura fixa (360). Se a árvore empurra, a caixa transborda.
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, Badge, NavList, Select, Text, TreeView, ptBR, type TreeNode} from "@aurea-uds/react";
import "@aurea-uds/core/css";
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";

const ROTULO = "switch-acesso-andar-07-rack-b-porta-48-uplink-para-o-nucleo-do-predio-administrativo";
// Seis níveis, todos abertos: o rótulo longo no fundo.
function funda(n: number, prefixo = "n"): TreeNode {
  return n === 0
    ? {id: `${prefixo}-folha`, label: ROTULO}
    : {id: `${prefixo}-${n}`, label: `Nível ${7 - n}`, children: [funda(n - 1, prefixo)]};
}
const ids = (prefixo: string) => Array.from({length: 6}, (_, i) => `${prefixo}-${i + 1}`);
const arvore = (prefixo: string) =>
  <TreeView label={`Árvore ${prefixo}`} items={[funda(6, prefixo)]} defaultExpandedIds={ids(prefixo)} />;

function Banco() {
  return (
    <main className="rede3">
      <h1>Passo 10 · o mapa de rede</h1>
      <section className="caso" data-caso="bloco">
        <h2>MNT-23 · num bloco comum</h2>
        <div className="moldura" data-moldura>{arvore("bloco")}</div>
      </section>
      <section className="caso" data-caso="grade">
        <h2>MNT-23 · na coluna 1fr de uma grade</h2>
        <div className="moldura" data-moldura><div className="grade-1fr">{arvore("grade")}<div className="hint">outra coluna</div></div></div>
      </section>
      <section className="caso" data-caso="embrulhada">
        <h2>MNT-23 · dentro de um div (como num cartão), na coluna 1fr</h2>
        <div className="moldura" data-moldura><div className="grade-1fr"><div>{arvore("emb")}</div><div className="hint">outra coluna</div></div></div>
      </section>
      <section className="caso" data-caso="ajustada" data-ajusta>
        <h2>MNT-23 · num painel que se ajusta ao conteúdo: o rótulo aparece inteiro</h2>
        <div className="moldura ajusta" data-moldura>{arvore("aj")}</div>
      </section>
      <section className="caso" data-caso="flex">
        <h2>MNT-23 · num filho flex:1 de uma fila</h2>
        <div className="moldura" data-moldura><div className="fila-flex">{arvore("flex")}<div className="hint">vizinho</div></div></div>
      </section>
      {/* "Quem mais tem esse problema?": as outras peças que cortam o texto com reticências, na mesma
          coluna 1fr que fazia a árvore empurrar. */}
      <section className="caso" data-caso="navlist">
        <h2>Quem mais · NavList na coluna 1fr</h2>
        <div className="moldura" data-moldura><div className="grade-1fr">
          <NavList items={[{id: "a", label: ROTULO, description: ROTULO, value: "48"}]} /><div className="hint">outra coluna</div>
        </div></div>
      </section>
      <section className="caso" data-caso="navlist-ajustada" data-ajusta>
        <h2>Quem mais · NavList num painel que se ajusta: o rótulo aparece inteiro</h2>
        <div className="moldura ajusta" data-moldura><NavList items={[{id: "a", label: ROTULO, value: "48"}]} /></div>
      </section>
      <section className="caso" data-caso="select">
        <h2>Quem mais · Select na coluna 1fr</h2>
        <div className="moldura" data-moldura><div className="grade-1fr">
          <Select aria-label="Equipamento" defaultValue="a" items={[{value: "a", label: ROTULO}]} /><div className="hint">outra coluna</div>
        </div></div>
      </section>
      <section className="caso" data-caso="texto">
        <h2>Quem mais · Text truncate na coluna 1fr</h2>
        <div className="moldura" data-moldura><div className="grade-1fr">
          <Text truncate>{ROTULO}</Text><div className="hint">outra coluna</div>
        </div></div>
      </section>
      <section className="caso" data-caso="selo">
        <h2>Quem mais · Badge na coluna 1fr</h2>
        <div className="moldura" data-moldura><div className="grade-1fr">
          <div><Badge>{ROTULO}</Badge></div><div className="hint">outra coluna</div>
        </div></div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider strings={ptBR} spriteUrl={sprite}><Banco /></AureaProvider></StrictMode>,
);
