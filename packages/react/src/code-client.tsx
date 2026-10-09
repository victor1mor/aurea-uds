"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import {cx, useAureaStrings} from "./internal.js";
import {Icon} from "./system.js";

// copyable: o gatilho é marcado com data-aurea-copy e o COMPORTAMENTO mora no aurea.js do
// core (uma implementação para React e para HTML puro). O onClick daqui atende quem só
// carrega o pacote React; ele para a propagação pro core não copiar duas vezes.
export function CodeBlock({children,language="text",copyable,className}:{children:string;language?:string;copyable?:boolean;className?:string}){
const s=useAureaStrings();
// tabIndex no <pre>: `.code-block` é `overflow:auto` por construção, então é REGIÃO ROLÁVEL
// e não tem nada focável dentro — quem navega por teclado não alcança o código que passa da
// largura. É a regra `scrollable-region-focusable` do axe, e o mesmo defeito que o painel de
// demo do catálogo já tinha corrigido em 30/07/2026 no lado dele; aqui, na biblioteca, ele
// seguia aberto e só não aparecia porque nenhuma linha era comprida o bastante. Quem o achou
// foi o `catalog-sweep` em 10/08/2026, quando o bloco do I1 fez a linha de import crescer.
const pre=<pre className={cx("code-block",!copyable&&className)} data-language={language} tabIndex={0}><code>{children}</code></pre>;
if(!copyable)return pre;
// 0.28.0: o "copiado" é dito ao leitor de tela. Com o `aurea.js` na página, é ele quem diz (pelo
// texto do `data-aurea-copy-done`, na língua do app); sem ele, a região de status daqui.
const [copiado,setCopiado]=React.useState(false);
const onCopy=(e:React.MouseEvent<HTMLButtonElement>)=>{e.stopPropagation();const vanilla=(window as any).Aurea;
  if(vanilla?.copy){vanilla.copy(e.currentTarget);return}
  // Sem área de transferência (ou sem promessa), não há o que avisar — e não pode quebrar o clique.
  const copia=navigator.clipboard?.writeText(children);if(typeof copia?.then!=="function")return;
  void copia.then(()=>{setCopiado(true);setTimeout(()=>setCopiado(false),1500)},()=>{})};
return <div className={cx("code-block-wrap",className)} data-aurea-copy-scope>
<span className="sr-only" role="status" aria-live="polite">{copiado?s.copied:""}</span>
<button type="button" className={cx("btn btn-icon btn-ghost copy-code",copiado&&"is-done")} data-aurea-copy data-aurea-copy-done={s.copied} aria-label={s.copyCode} onClick={onCopy}>
<Icon name="copy" size="sm" className="c-copy"/><Icon name="check" size="sm" className="c-done"/></button>
{pre}</div>
}

// A pele do log é de TRÊS colunas — hora, nível, texto — e o componente emitia DUAS. Medido no
// item E13 (07/08/2026), com só o core: o texto caía na coluna do NÍVEL, 72px de largura, e a
// prop `level` não pintava nada, porque o core estiliza `.log-level.error` (um elemento) e o
// componente escrevia `log-error` (no container). Gate nenhum via: o check 18 só enxerga classe
// LITERAL, e `log-${level}` é template; o check 15 dava a classe por produzível pelo mesmo
// motivo, via prefixo. É o achado A6 outra vez — a regra do core servia a `apps/docs/index.html`,
// escrito à mão com as três partes, e a biblioteca pagava a conta.
// A célula do nível é SEMPRE renderizada, mesmo vazia: sem ela a linha sem `level` volta a ter
// dois filhos e o texto volta para a coluna estreita.
