"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type HTMLAttributes, type RefAttributes, type ReactNode} from "react";
import {cx, useAureaStrings, useReorder} from "./internal.js";
import {Icon} from "./system.js";
export function Table({caption,children,className,...props}:HTMLAttributes<HTMLTableElement>&RefAttributes<HTMLTableElement>&{caption?:ReactNode}){const s=useAureaStrings();return <div className="table-region" role="region" aria-label={typeof caption==="string"?caption:s.tableLabel} tabIndex={0}><table className={cx("table",className)} {...props}>{caption&&<caption>{caption}</caption>}{children}</table></div>}

// A `Prose` MORAVA AQUI e foi para o `markup.tsx` no item O1. O comentario dela dizia, em
// 15/08/2026: "e exatamente o caso que o item O1 do plano vai medir: quem e de cliente so por
// causa da vizinhanca". Foi medido, e era: uma <div> custando 123,5 KB ao consumidor.

// ── SortableList (PLANO-1.0, item L3) ────────────────────────────────────────────────────────
// A TRAVA É DE ACESSIBILIDADE, NÃO DE MOTOR — está escrita no próprio item, e o precedente é o
// I8: arrastar precisa de alternativa sem arrastar. Por isso o caminho por TECLADO não é um
// extra deste componente; é a razão pela qual ele pode existir.
//
// SEM DEPENDÊNCIA NOVA, e a alternativa foi medida: o `list` do `Referencia/kibo-main` é o
// `@dnd-kit/core` (`useDraggable`/`useDroppable`/`DndContext`), e o `kanban` de lá é o mesmo
// motor. Trazer o dnd-kit resolveria isto e obrigaria TODO consumidor a baixá-lo — e o
// `BUILDING.md` §3.3 manda parar e chamar o Victor antes de somar dependência. Aqui não fez
// falta: o protocolo de teclado é uma máquina de três estados, e o ponteiro é PointerEvent.
//
// PONTEIRO E NÃO DRAG-AND-DROP DO HTML5, e a razão é medida, não estética: o DnD nativo NÃO
// dispara em toque nenhum — um consumidor no celular ficaria sem reordenar. `setPointerCapture`
// cobre mouse, toque e caneta com o mesmo código, e é o que `touch-action:none` na alça
// completa.
//
// O TECLADO segue a convenção que o mercado consolidou (é a do dnd-kit, e a que os guias de
// arrasto acessível descrevem): Espaço pega, setas movem, Espaço solta, Esc devolve ao lugar de
// onde saiu. Cada passo é ANUNCIADO numa região viva — sem isso quem não vê a lista move o item
// e não recebe confirmação nenhuma, que é o defeito que a reprovação do USWDS descreve no item
// L6 ("recovering from an error is difficult due to lack of feedback").
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
            <Icon name="drag--horizontal"/><span className="sr-only">{s.sortableHandle}</span>
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
