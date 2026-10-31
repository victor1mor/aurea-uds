"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type ReactNode} from "react";
import {Collapsible as BaseCollapsible} from "@base-ui/react/collapsible";
import {cx} from "./internal.js";
import {soOValor} from "./pure.js";
import {Icon} from "./system.js";

// ACCORDION (0.32.0) — o da referência, com o realce em CÁPSULA (decisão do Victor, 11/10/2026: *"quero
// como o deles as medidas e tudo apenas com uma alteração a seleção é quadrada deles quero nossa como
// capsula"*). Sem caixa em volta; um fio entre os itens (nenhum depois do último); a pergunta com 16 de
// todos os lados, 14 peso médio; a seta de 16 no fim, esmaecida, que vira ao abrir; a resposta 14
// esmaecida, com 16 dos lados e embaixo; o realce do mouse só no fechado. `variant="surface"` põe tudo
// num cartão, com o fio a 94% e o realce no cinza neutro.
// Continua sobre `<details>`: abre sem JavaScript. UM DE CADA VEZ, como o dela por padrão — o HTML faz
// sozinho com o mesmo `name` em todos os `<details>`; `multiple` deixa abrir vários.
export type AccordionVariant="default"|"surface";
export interface AccordionItem{id:string;title:ReactNode;content:ReactNode;
  /** O item que não abre: anunciado como desligado e fora do Tab. */
  disabled?:boolean}
// O SITE B (30/10/2026, protótipo): `indicator="plus"` troca a setinha pelo "+" numa bolinha, que gira e vira o "×"
// amarelo quando abre; `size="lg"` é a linha de 60 com a letra do texto (16), a das perguntas do desenho aprovado.
export function Accordion({items,variant="default",multiple=false,defaultValue,indicator="chevron",size="md",className}:{items:AccordionItem[];variant?:AccordionVariant;
  /** O desenho de abrir: `"chevron"` (o padrão, a setinha) ou `"plus"` (o "+" numa bolinha, que vira "×" quando abre). */
  indicator?:"chevron"|"plus";
  /** A altura da linha: `"md"` (o padrão) ou `"lg"` (60, com a letra do texto). */
  size?:"md"|"lg";
  /** Deixa vários itens abertos ao mesmo tempo. Sem isto, abrir um fecha o outro. */
  multiple?:boolean;
  /** Os itens que começam abertos (o `id` de cada um). */
  defaultValue?:string[];className?:string}){
  const grupo=React.useId();
  return <div className={cx("accordion",variant==="surface"&&"accordion-surface",indicator==="plus"&&"accordion-plus",size==="lg"&&"accordion-lg",className)}>{items.map(i=>
    <details key={i.id} className="accordion-item" name={multiple?undefined:grupo} open={defaultValue?.includes(i.id)||undefined}>
      <summary aria-disabled={i.disabled||undefined} tabIndex={i.disabled?-1:undefined}
        onClick={i.disabled?(e:React.MouseEvent)=>e.preventDefault():undefined}>
        <span className="accordion-title">{i.title}</span><span className="accordion-chevron" aria-hidden="true"/>
      </summary>
      <div className="accordion-content">{i.content}</div>
    </details>)}</div>;
}

// COLLAPSIBLE — uma seção que abre e fecha, com o estado do lado de quem usa.
//
// Não é um Accordion de um item só, e a diferença é o motivo de existir: o `Accordion` é um
// CONJUNTO de seções sobre `<details>` nativo, que abre sem JS e guarda o próprio estado. Aqui a
// aplicação é a dona do estado — um grupo da lateral que lembra se estava aberto, um painel de
// filtros que abre por ação de outro lugar, um "mostrar mais" que fecha ao trocar de página.
// `<details>` controlado é possível e desconfortável; e cinco das nove referências tratam os dois
// como componentes distintos.
//
// A API é a daqui: `trigger` é dado, o conteúdo são os filhos. Não é a API composta da referência
// (Root/Trigger/Panel) — quem quiser compor esse nível usa o motor direto.
export function Collapsible({trigger,children,open,defaultOpen,onOpenChange,disabled,className}:{trigger:ReactNode;children:ReactNode;open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void;disabled?:boolean;className?:string}){
  return <BaseCollapsible.Root open={open} defaultOpen={defaultOpen} onOpenChange={soOValor(onOpenChange)} disabled={disabled} className={cx("collapsible",className)}>
    <BaseCollapsible.Trigger className="collapsible-trigger"><Icon name="caret-down" size="sm" className="collapsible-chevron"/>{trigger}</BaseCollapsible.Trigger>
    <BaseCollapsible.Panel className="collapsible-panel">{children}</BaseCollapsible.Panel>
  </BaseCollapsible.Root>;
}
