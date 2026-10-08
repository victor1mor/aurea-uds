"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type HTMLAttributes, type RefAttributes, type ReactNode} from "react";
import {cx, useAureaStrings, useReorder} from "./internal.js";
import {Icon} from "./system.js";
// GAR-12 e GAR-13 (08/10/2026): a TABELA DE COMPARAÇÃO é esta `Table` com quatro chaves a mais, e
// não uma peça nova (regra do Victor: peça nova entra como variação; e *"uma chave para cada
// coisa"*, escolha dele). A referência principal só tem o cabeçalho preso, feito à mão dentro de
// uma caixa de altura fixa; o resto veio do mercado, escolhido pelo Victor:
//   • `stickyHeader` — o MESMO nome e o mesmo mecanismo do `DataGrid`: a caixa da tabela ganha
//     teto (`--table-max-h`) e rola por dentro, e o cabeçalho gruda no topo DELA. Não gruda no
//     topo da página: a caixa rola de lado, e um elemento grudento só gruda no contêiner de
//     rolagem mais próximo.
//   • `stickyFirstColumn` — a primeira coluna (o nome de cada linha) fica parada ao rolar de lado.
//   • `fit` — sem o mínimo de 720: é o que deixa a comparação de DOIS itens caber num celular de
//     360 sem rolar de lado (a escolha do Victor para o celular; quais dois, o site decide).
//   • `differencesOnly` — o "Só diferenças": esconde as linhas que o site marcou como iguais
//     (`<tr data-same>`). O botão que liga é do site.
// O resto é HTML, com pele da Aurea: a faixa de grupo é `<th scope="rowgroup" colSpan>`, o nome
// da linha é `<th scope="row">`, e o melhor valor é `<td data-best>` (negrito; o selo "Melhor",
// em texto, é um `Badge` que o site põe na célula — cor sozinha não basta, WCAG 1.4.1).
export interface TableProps extends HTMLAttributes<HTMLTableElement>, RefAttributes<HTMLTableElement>{
  /** Um `<caption>` de verdade; se for texto, vira também o nome da região que rola. */
  caption?:ReactNode;
  /** GAR-13: o cabeçalho fica preso no topo da caixa da tabela, que ganha teto (`--table-max-h`, 60vh) e rola por dentro. */
  stickyHeader?:boolean;
  /** GAR-12: a primeira coluna fica parada ao rolar de lado. */
  stickyFirstColumn?:boolean;
  /** GAR-12: a tabela cabe na largura da caixa, sem o mínimo de 720 — a comparação de dois itens no celular. */
  fit?:boolean;
  /** GAR-12: esconde as linhas marcadas como iguais (`<tr data-same>`) — o "Só diferenças". */
  differencesOnly?:boolean;
}
export function Table({caption,stickyHeader,stickyFirstColumn,fit,differencesOnly,children,className,...props}:TableProps){const s=useAureaStrings();return <div className={cx("table-region",stickyHeader&&"table-sticky-header",stickyFirstColumn&&"table-sticky-first")} role="region" aria-label={typeof caption==="string"?caption:s.tableLabel} tabIndex={0}><table className={cx("table",fit&&"table-fit",differencesOnly&&"table-differences-only",className)} {...props}>{caption&&<caption>{caption}</caption>}{children}</table></div>}

// A `Prose` MORAVA AQUI e foi para o `markup.tsx` no item O1. O comentario dela dizia, em
// 15/08/2026: "e exatamente o caso que o item O1 do plano vai medir: quem e de cliente so por
// causa da vizinhanca". Foi medido, e era: uma <div> custando 123,5 KB ao consumidor.

// ── SortableList (PLANO-1.0, item L3) ────────────────────────────────────────────────────────
// A TRAVA É DE ACESSIBILIDADE, NÃO DE MOTOR — está escrita no próprio item, e o precedente é o
// I8: arrastar precisa de alternativa sem arrastar. Por isso o caminho por TECLADO não é um
// extra deste componente; é a razão pela qual ele pode existir.
//
// SEM DEPENDÊNCIA NOVA, e a alternativa foi medida: a lista de uma das referências é feita sobre uma
// biblioteca de arrastar e soltar de terceiro, e o quadro kanban de lá é o mesmo
// motor. Trazer essa biblioteca resolveria isto e obrigaria TODO consumidor a baixá-la — e o
// `BUILDING.md` §3.3 manda parar e chamar o Victor antes de somar dependência. Aqui não fez
// falta: o protocolo de teclado é uma máquina de três estados, e o ponteiro é PointerEvent.
//
// PONTEIRO E NÃO DRAG-AND-DROP DO HTML5, e a razão é medida, não estética: o DnD nativo NÃO
// dispara em toque nenhum — um consumidor no celular ficaria sem reordenar. `setPointerCapture`
// cobre mouse, toque e caneta com o mesmo código, e é o que `touch-action:none` na alça
// completa.
//
// O TECLADO segue a convenção que o mercado consolidou (é a das bibliotecas de arrastar e soltar, e a que os guias de
// arrasto acessível descrevem): Espaço pega, setas movem, Espaço solta, Esc devolve ao lugar de
// onde saiu. Cada passo é ANUNCIADO numa região viva — sem isso quem não vê a lista move o item
// e não recebe confirmação nenhuma, que é o defeito que a reprovação de um design system público descreve no item
// L6 (sair de um erro fica difícil por falta de retorno).
//
// A LISTA É CONTROLADA: `items` e `onReorder(de, para)`. O componente não guarda ordem — quem
// guarda é o consumidor, como no `selected` da `Gallery` e no `value` das `Tabs`. Mover no
// teclado e mover no ponteiro chamam o MESMO `onReorder`, então não há dois caminhos de dado.
export interface SortableItem{id:string;label:ReactNode}
export interface SortableListProps extends Omit<HTMLAttributes<HTMLUListElement>,"onReorder">,RefAttributes<HTMLUListElement>{items:SortableItem[];onReorder:(from:number,to:number)=>void;label?:string}
// O protocolo de teclado e de ponteiro saiu daqui para o `useReorder` do `internal` no item N1,
// quando o `BlockEditor` virou o segundo dono dele. A DOM abaixo não mudou uma vírgula na
// extração — é o que o gate de pixel e o `skin.spec` continuam medindo.
export function SortableList({items,onReorder,label,className,...props}:SortableListProps){
  const s=useAureaStrings();
  const bid=React.useId();
  const r=useReorder<HTMLUListElement>({count:items.length,order:items,onReorder,
    rowSelector:".sortable-item",handleSelector:".sortable-handle"});
  return <>
    <ul ref={r.ref} className={cx("sortable-list",className)} aria-label={label??s.sortableLabel} {...props}>
      {items.map((it,i)=>{
        const lid=`${bid}l${i}`,hid=`${bid}h${i}`;
        return <li key={it.id} className="sortable-item" data-grabbed={r.pego===i||undefined}>
          {/* `aria-labelledby` aponta para a própria alça E para o rótulo da linha: sai
              "Reordenar, Segundo item, botão" sem obrigar o consumidor a mandar o texto duas
              vezes. O rótulo é ReactNode — extrair string dele seria adivinhar. */}
          <button type="button" id={hid} className="sortable-handle" aria-labelledby={`${hid} ${lid}`}
            aria-describedby={`${bid}ajuda`} aria-pressed={r.pego===i}
            onKeyDown={e=>r.teclado(e,i)} onPointerDown={e=>r.ponteiroBaixo(e,i)}
            onPointerMove={r.ponteiroMove} onPointerUp={r.ponteiroSolta} onPointerCancel={r.ponteiroSolta}>
            <Icon name="dots-six"/><span className="sr-only">{s.sortableHandle}</span>
          </button>
          <span id={lid} className="sortable-label">{it.label}</span>
        </li>;
      })}
    </ul>
    <span id={`${bid}ajuda`} className="sr-only">{s.sortableHelp}</span>
    {/* A região viva é `polite` e não `assertive`: mover item não é emergência, e interromper a
        leitura a cada seta seria pior que não anunciar. */}
    <div role="status" aria-live="polite" className="sr-only">{r.aviso}</div>
  </>;
}
