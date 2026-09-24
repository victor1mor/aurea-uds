"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
// SUBPATH PRÓPRIO (ver ./qrcode): é o único componente que precisa do CodeMirror — seis
// pacotes, todos peer OPCIONAIS. Antes, quem instalava a biblioteca para usar um Button
// baixava um editor de código inteiro. Era o achado A5.
import React from "react";
import {EditorView} from "@codemirror/view";
import {EditorState, Compartment, type Extension} from "@codemirror/state";
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language";
import {tags as t} from "@lezer/highlight";
import {basicSetup} from "codemirror";
import {cx, useAureaStrings} from "./internal.js";


// CodeEditor (Fase 5 etapa 3): CodeMirror 6 com tema Aurea via tokens. O MOTOR de
// edição é do CodeMirror (como o vídeo é do browser no MediaPlayer) — o componente
// só monta a EditorView, dá a pele Aurea e liga defaultValue/onChange. Dependência
// nova AUTORIZADA aqui (07/2026: codemirror 6.0.2 / @codemirror/view 6.43.6 /
// @codemirror/state 6.7.1 / @codemirror/language 6.12.4 / @lezer/highlight 1.2.3 —
// tudo MIT, ativamente mantido, versões atuais medidas no pacote instalado).
//
// LINGUAGENS FICAM FORA (regra da etapa): não embutimos nenhuma extensão de
// linguagem — o consumidor passa a dele em `extensions` (ex.: @codemirror/lang-*).
// Assim o peso e a escolha de linguagem são dele, e a lista de deps não incha.
//
// SEM COR HARDCODED FORA DE TOKEN: o tema só referencia var(--*) do core. Uso só
// tokens que VIRAM entre dark/light (foreground, muted-foreground, os semânticos
// success/warning/danger/info-400 que têm override no [data-theme="light"], e
// selection/border/surface). NÃO uso --primary como cor de texto de sintaxe: o
// amarelo é invariável e falha contraste sobre o inset claro. --primary fica só em
// realce de par de brackets/seleção de autocomplete (14% — idioma do tree-node).
// Sem CSS novo no core: a pele vive no EditorView.theme (StyleModule injetado pelo
// próprio CodeMirror), não no stylesheet do core — o core/os baselines não mudam.
// /*@__PURE__*/: as factories rodam no topo do módulo; sem a anotação o bundler
// não prova que são puras e mantém o CodeMirror mesmo em quem importa só o Button
// (auditoria 18/07/2026, ALTO 5). Com a anotação + sideEffects:false, o tema e o
// CodeEditor (e o CodeMirror) somem quando não usados. Split por subpath = decisão do Victor.
export const aureaEditorTheme=/*@__PURE__*/EditorView.theme({
  "&":{backgroundColor:"var(--surface-inset)",color:"var(--foreground)",border:"var(--border-width) solid var(--border)",borderRadius:"var(--radius-lg)",fontSize:"var(--text-xs)"},
  "&.cm-focused":{outline:"2px solid var(--focus-strong)",outlineOffset:"-2px"},
  ".cm-scroller":{fontFamily:"var(--font-code)",lineHeight:"var(--leading-relaxed)",borderRadius:"inherit"},
  ".cm-content":{caretColor:"var(--foreground)",padding:"var(--space-2) 0"},
  ".cm-line":{padding:"0 var(--space-3)"},
  ".cm-cursor, .cm-dropCursor":{borderLeftColor:"var(--foreground)"},
  "&.cm-focused .cm-cursor":{borderLeftColor:"var(--foreground)"},
  ".cm-selectionBackground, ::selection":{backgroundColor:"var(--selection)"},
  "&.cm-focused .cm-selectionBackground":{backgroundColor:"var(--selection)"},
  ".cm-selectionMatch":{backgroundColor:"var(--selection)"},
  ".cm-activeLine":{backgroundColor:"color-mix(in srgb,var(--foreground) 5%,transparent)"},
  ".cm-gutters":{backgroundColor:"var(--surface-inset)",color:"var(--muted-foreground)",border:"none",borderRight:"var(--border-width) solid var(--border)"},
  ".cm-gutterElement":{padding:"0 var(--space-2)"},
  ".cm-activeLineGutter":{backgroundColor:"color-mix(in srgb,var(--foreground) 5%,transparent)",color:"var(--foreground)"},
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket":{backgroundColor:"color-mix(in srgb,var(--foreground) 16%,transparent)",color:"var(--foreground)",outline:"none"},
  ".cm-nonmatchingBracket":{color:"var(--danger-400)"},
  ".cm-searchMatch":{backgroundColor:"color-mix(in srgb,var(--warning-400) 30%,transparent)"},
  ".cm-searchMatch.cm-searchMatch-selected":{backgroundColor:"var(--selection)"},
  ".cm-panels":{backgroundColor:"var(--surface-2)",color:"var(--foreground)"},
  ".cm-panels.cm-panels-top":{borderBottom:"var(--border-width) solid var(--border)"},
  ".cm-panels.cm-panels-bottom":{borderTop:"var(--border-width) solid var(--border)"},
  ".cm-tooltip":{backgroundColor:"var(--popover)",color:"var(--popover-foreground)",border:"var(--border-width) solid var(--border)",borderRadius:"var(--radius-md)"},
  ".cm-tooltip-autocomplete ul li[aria-selected]":{backgroundColor:"color-mix(in srgb,var(--primary) 14%,transparent)",color:"var(--foreground)"},
  ".cm-completionLabel":{color:"var(--foreground)"},
});
// HighlightStyle: tags do @lezer/highlight → tokens. Só cores que viram entre temas.
// A default fallback do basicSetup fica só para tags que não cobrimos (fallback:true).
export const aureaHighlightStyle=/*@__PURE__*/HighlightStyle.define([
  {tag:[t.comment,t.lineComment,t.blockComment,t.docComment],color:"var(--muted-foreground)",fontStyle:"italic"},
  {tag:[t.keyword,t.controlKeyword,t.moduleKeyword,t.operatorKeyword,t.definitionKeyword,t.modifier,t.self,t.atom,t.bool,t.null,t.typeName,t.className,t.namespace,t.tagName],color:"var(--info-400)"},
  {tag:[t.string,t.character,t.docString,t.regexp,t.escape,t.special(t.string)],color:"var(--success-400)"},
  {tag:[t.number,t.integer,t.float,t.unit],color:"var(--warning-400)"},
  {tag:[t.propertyName,t.attributeName,t.labelName],color:"var(--foreground)"},
  {tag:t.function(t.variableName),color:"var(--foreground)",fontWeight:"600"},
  {tag:t.invalid,color:"var(--danger-400)"},
  {tag:[t.link,t.url],color:"var(--info-400)",textDecoration:"underline"},
  {tag:t.heading,fontWeight:"700"},
  {tag:t.strong,fontWeight:"700"},
  {tag:t.emphasis,fontStyle:"italic"},
  {tag:t.strikethrough,textDecoration:"line-through"},
]);
export interface CodeEditorProps{
  /** Conteúdo inicial. Não controlado (precedente MediaPlayer/FileInput): mudanças depois da montagem não recarregam o doc. */
  defaultValue?:string;
  /** Notificado a cada edição com o texto atual. */
  onChange?:(value:string)=>void;
  /** Extensões do consumidor: a extensão de LINGUAGEM (@codemirror/lang-*) e o que mais quiser. Memorize o array para não reconfigurar à toa. */
  extensions?:Extension[];
  readOnly?:boolean;
  /** Nome acessível do editor; default vem da i18n (`codeEditor`). */
  ariaLabel?:string;
  className?:string;
}
export function CodeEditor({defaultValue="",onChange,extensions,readOnly=false,ariaLabel,className}:CodeEditorProps){
  const s=useAureaStrings();
  const host=React.useRef<HTMLDivElement>(null);
  const view=React.useRef<EditorView|null>(null);
  const dyn=React.useRef(new Compartment());
  // onChange por ref: notifica sempre o mais recente sem recriar o listener (logo sem remontar).
  const onChangeRef=React.useRef(onChange);onChangeRef.current=onChange;
  const label=ariaLabel??s.codeEditor;
  // Parte reconfigurável (linguagem/readOnly/rótulo) num Compartment: troca sem
  // remontar o editor — preserva doc, seleção e histórico.
  const dynExt=():Extension=>[
    EditorState.readOnly.of(readOnly),
    EditorView.editable.of(!readOnly),
    EditorView.contentAttributes.of({"aria-label":label}),
    ...(extensions??[]),
  ];
  React.useEffect(()=>{
    const v=new EditorView({parent:host.current!,state:EditorState.create({doc:defaultValue,extensions:[
      basicSetup,
      aureaEditorTheme,
      syntaxHighlighting(aureaHighlightStyle),
      EditorView.updateListener.of(u=>{if(u.docChanged)onChangeRef.current?.(u.state.doc.toString())}),
      dyn.current.of(dynExt()),
    ]})});
    view.current=v;
    return ()=>{v.destroy();view.current=null};
  },[]);// defaultValue só na montagem (não controlado).
  React.useEffect(()=>{view.current?.dispatch({effects:dyn.current.reconfigure(dynExt())})},[readOnly,label,extensions]);
  return <div ref={host} className={cx("code-editor",className)}/>;
}
