"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import {type ReactNode} from "react";
import {Collapsible as BaseCollapsible} from "@base-ui/react/collapsible";
import {cx} from "./internal.js";
import {soOValor} from "./pure.js";
import {Icon} from "./system.js";

export function Accordion({items}:{items:Array<{id:string;title:ReactNode;content:ReactNode}>}){return <div className="accordion">{items.map(i=><details key={i.id}><summary>{i.title}</summary><div className="accordion-content">{i.content}</div></details>)}</div>}

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
    <BaseCollapsible.Trigger className="collapsible-trigger"><Icon name="chevron--down" size="sm" className="collapsible-chevron"/>{trigger}</BaseCollapsible.Trigger>
    <BaseCollapsible.Panel className="collapsible-panel">{children}</BaseCollapsible.Panel>
  </BaseCollapsible.Root>;
}
