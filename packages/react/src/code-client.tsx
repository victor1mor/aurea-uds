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
// DOC-02 (0.32.0): a CAIXA DE EXEMPLO do site da Aurea virou o `preview` do `CodeBlock` — as abas
// Prévia | Código (o controle segmentado ocupando a largura), a prévia no fundo afundado e o código sem
// moldura. É a caixa do site de hoje (decisão do Victor, 06/10/2026: a da Aurea, não a da referência),
// agora no pacote, para o site usar só peças da Aurea. O teclado é o das abas do APG: setas, Home e End.
// Sem o `aurea.js` na página — quem troca a aba é o React.
function CaixaDeExemplo({preview,codigo,className}:{preview:React.ReactNode;codigo:React.ReactNode;className?:string}){
  const s=useAureaStrings();
  const id=React.useId();
  const [aba,setAba]=React.useState<"preview"|"code">("preview");
  const refPrevia=React.useRef<HTMLButtonElement>(null), refCodigo=React.useRef<HTMLButtonElement>(null);
  const ir=(a:"preview"|"code")=>{setAba(a);(a==="preview"?refPrevia:refCodigo).current?.focus()};
  const tecla=(e:React.KeyboardEvent<HTMLButtonElement>)=>{
    if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
    e.preventDefault();
    ir(e.key==="Home"?"preview":e.key==="End"?"code":aba==="preview"?"code":"preview");
  };
  const botao=(a:"preview"|"code",rotulo:string)=><button type="button" role="tab" id={`${id}-${a}`} ref={a==="preview"?refPrevia:refCodigo}
    className={aba===a?"active":undefined} aria-selected={aba===a} aria-controls={`${id}-${a}-panel`} tabIndex={aba===a?0:-1}
    onClick={()=>setAba(a)} onKeyDown={tecla}>{rotulo}</button>;
  return <div className={cx("demo code-preview",className)}>
    <div className="demo-tabs"><div className="segmented" role="tablist">{botao("preview",s.codeBlockPreview)}{botao("code",s.codeBlockCode)}</div></div>
    <div className="demo-panel" data-panel="preview" role="tabpanel" id={`${id}-preview-panel`} aria-labelledby={`${id}-preview`} tabIndex={0} hidden={aba!=="preview"}>{preview}</div>
    <div className="demo-panel demo-code" data-panel="code" role="tabpanel" id={`${id}-code-panel`} aria-labelledby={`${id}-code`} tabIndex={0} hidden={aba!=="code"}>{codigo}</div>
  </div>;
}
/** Uma aba do `CodeBlock` em abas: o nome (o "npm"), o código e, se for outra, a língua dele. */
export interface CodeBlockTab{label:string;code:string;language?:string}
// O CÓDIGO EM ABAS (bloco 1, o 3-A — 23/10/2026): as alternativas do MESMO passo, uma de cada vez — o comando de instalar
// em npm, pnpm, yarn e bun, como na documentação da referência (a fileira em cima, dentro da caixa do código). O estado é
// do React; os painéis levam `data-aurea-tabpanel` para o `aurea.js` do core trocar também na página que não acende (o
// site estático). A tecla para aqui (`stopPropagation`): com os dois na página, a seta andaria duas abas.
function CodigoEmAbas({tabs,language,copyable,highlight,className}:{tabs:CodeBlockTab[];language:string;copyable?:boolean;highlight?:CodeHighlighter;className?:string}){
  const s=useAureaStrings();
  const id=React.useId();
  const [aba,setAba]=React.useState(0);
  const refs=React.useRef<(HTMLButtonElement|null)[]>([]);
  const ir=(i:number)=>{setAba(i);refs.current[i]?.focus()};
  const tecla=(e:React.KeyboardEvent<HTMLButtonElement>)=>{
    const n=tabs.length;
    if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
    e.preventDefault();e.stopPropagation();
    ir(e.key==="Home"?0:e.key==="End"?n-1:e.key==="ArrowRight"?(aba+1)%n:(aba-1+n)%n);
  };
  return <div className={cx("code-tabs",className)}>
    <div className="code-tabs-list" role="tablist" aria-label={s.tabsLabel}>{tabs.map((t,i)=><button key={t.label} type="button" role="tab"
      id={`${id}-${i}`} ref={el=>{refs.current[i]=el}} className={cx("code-tab",aba===i&&"active")} aria-selected={aba===i}
      aria-controls={`${id}-${i}-panel`} tabIndex={aba===i?0:-1} onClick={()=>setAba(i)} onKeyDown={tecla}>{t.label}</button>)}</div>
    {tabs.map((t,i)=><div key={t.label} role="tabpanel" id={`${id}-${i}-panel`} aria-labelledby={`${id}-${i}`} data-aurea-tabpanel=""
      hidden={aba!==i}><CodeBlock language={t.language??language} copyable={copyable} highlight={highlight}>{t.code}</CodeBlock></div>)}
  </div>;
}
/** Um pedaço de uma linha de código, com a classe da cor (`tok-keyword`, `tok-string`…) quando tem cor. */
export interface CodeToken{text:string;className?:string}
/** Uma linha de código: os pedaços, na ordem. */
export type CodeLine=CodeToken[];
/** Quem colore: recebe o código e a língua e devolve as linhas, ou `null` quando não conhece a língua. O da Aurea é o
 *  `highlightCode` de `@aurea-uds/react/code-highlight`. */
export type CodeHighlighter=(code:string,language:string)=>CodeLine[]|null;
// lineNumbers e highlight (lote V, 20/10/2026): as linhas viram um <span class="code-line"> cada, com o "\n" entre
// elas — o texto do bloco continua IGUAL ao código (copiar com o mouse traz o mesmo texto), e o número é desenhado pelo
// CSS, sem entrar no texto nem no leitor de tela. Sem as duas, a marcação é a de antes, sem mudar nada.
// O "\n" do fim (o código que termina em quebra de linha) não vira uma linha numerada e vazia: ele sai depois da última.
function linhasDoCodigo(codigo:string,language:string,highlight?:CodeHighlighter):CodeLine[]{
  const linhas=highlight?.(codigo,language)??codigo.split("\n").map(l=>l===""?[]:[{text:l}]);
  return codigo.endsWith("\n")&&linhas.length>1&&linhas[linhas.length-1]!.length===0?linhas.slice(0,-1):linhas;
}
export function CodeBlock({children,language="text",copyable,preview,lineNumbers,highlight,tabs,className}:{children?:string;language?:string;copyable?:boolean;
  /** A prévia viva do código: com ela, o bloco vira a caixa de exemplo, com as abas Prévia | Código. */
  preview?:React.ReactNode;
  /** Mostra o número de cada linha à esquerda. O número não entra no texto copiado nem é lido pelo leitor de tela. */
  lineNumbers?:boolean;
  /** Colore o código. Passe o `highlightCode` de `@aurea-uds/react/code-highlight` (os analisadores são peer opcional). */
  highlight?:CodeHighlighter;
  /** As alternativas do mesmo passo, em abas (o comando de instalar em npm, pnpm, yarn e bun): a fileira em cima, dentro
   *  da caixa, e um código por aba. Com `tabs`, o `children` não é lido. */
  tabs?:CodeBlockTab[];
  className?:string}){
if(tabs&&tabs.length>0)return <CodigoEmAbas tabs={tabs} language={language} copyable={copyable} highlight={highlight} className={className}/>;
if(preview!==undefined)return <CaixaDeExemplo preview={preview} className={className}
  codigo={<CodeBlock language={language} copyable={copyable} lineNumbers={lineNumbers} highlight={highlight}>{children}</CodeBlock>}/>;
const s=useAureaStrings();
// tabIndex no <pre>: `.code-block` é `overflow:auto` por construção, então é REGIÃO ROLÁVEL
// e não tem nada focável dentro — quem navega por teclado não alcança o código que passa da
// largura. É a regra `scrollable-region-focusable` do axe, e o mesmo defeito que o painel de
// demo do catálogo já tinha corrigido em 30/07/2026 no lado dele; aqui, na biblioteca, ele
// seguia aberto e só não aparecia porque nenhuma linha era comprida o bastante. Quem o achou
// foi o `catalog-sweep` em 10/08/2026, quando o bloco do I1 fez a linha de import crescer.
children??="";
const linhas=lineNumbers||highlight?linhasDoCodigo(children,language,highlight):null;
const colorido=linhas!=null&&highlight!=null&&linhas.some(l=>l.some(p=>p.className));
// Os algarismos da última linha: a coluna do número tem a largura deles (99 → 2, 100 → 3).
const digitos=lineNumbers&&linhas?{"--code-line-digits":String(linhas.length).length} as React.CSSProperties:undefined;
const pre=<pre className={cx("code-block",lineNumbers&&"code-block-numbered",colorido&&"code-block-highlighted",!copyable&&className)} style={digitos} data-language={language} tabIndex={0}><code>{linhas
  ?<>{linhas.map((l,i)=><React.Fragment key={i}><span className="code-line">{l.map((p,j)=>p.className?<span key={j} className={p.className}>{p.text}</span>:p.text)}</span>{i<linhas.length-1?"\n":null}</React.Fragment>)}{children.endsWith("\n")?"\n":null}</>
  :children}</code></pre>;
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
