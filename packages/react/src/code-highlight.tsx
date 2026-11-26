// AS CORES DO CÓDIGO (lote V, 20/10/2026). O Victor, comparando as caixas de código do site com as da referência:
// "não são como dos outros, com numero de linhas laterais e cores". A ficha do `CodeBlock` já prometia código com cores
// de sintaxe, e o código desenhava texto puro.
//
// O MOTOR é o mesmo do `CodeEditor` (decisão do Victor, "A: motor da Aurea"): o `@lezer/highlight`, com os
// analisadores do próprio Lezer. A função `highlightCode` dele colore código PARADO — sem editor, sem espera e sem
// navegador —, então serve ao site, montado no Node, e a quem usa o `CodeBlock` no servidor ou no cliente.
// As CORES são as do `aureaHighlightStyle` do `CodeEditor`, pelos mesmos grupos de etiquetas: o comentário apagado e
// em itálico, a palavra-chave e o nome de tipo em azul, o texto em verde, o número em amarelo, a função em 600. Lá elas
// são estilo de linha (o editor monta no navegador); aqui são CLASSES (`tok-*`), pintadas pelo `aurea.css` com os
// mesmos tokens, porque o HTML parado não carrega estilo calculado.
//
// Módulo próprio, como o `code-editor`: os analisadores são peer OPCIONAL, e quem não usa as cores não os instala
// (o check 19 do `validate.py` cobra que só este arquivo e o do editor importam o `@lezer/`).
import {highlightCode as colorirArvore, tagHighlighter, tags as t} from "@lezer/highlight";
import {parser as js} from "@lezer/javascript";
import {proprio} from "./pure.js";
import {parser as css} from "@lezer/css";
import {parser as html} from "@lezer/html";
import {parser as json} from "@lezer/json";
import {StreamLanguage} from "@codemirror/language";
import {shell} from "@codemirror/legacy-modes/mode/shell";
import type {CodeLine} from "./code-client.js";

// O que os analisadores têm em comum: ler o texto e devolver a árvore. Escrito aqui pelo formato, e não importado do
// `@lezer/common`, que é dependência deles, e não nossa.
type Analisador={parse(code:string):ReturnType<typeof js.parse>};

// As etiquetas do Lezer → as classes que o `aurea.css` pinta. Os grupos são os do `aureaHighlightStyle`.
const destaque=tagHighlighter([
  {tag:[t.comment,t.lineComment,t.blockComment,t.docComment],class:"tok-comment"},
  {tag:[t.keyword,t.controlKeyword,t.moduleKeyword,t.operatorKeyword,t.definitionKeyword,t.modifier,t.self,t.atom,t.bool,t.null,t.typeName,t.className,t.namespace,t.tagName],class:"tok-keyword"},
  {tag:[t.string,t.character,t.docString,t.regexp,t.escape,t.special(t.string)],class:"tok-string"},
  {tag:[t.number,t.integer,t.float,t.unit],class:"tok-number"},
  {tag:[t.propertyName,t.attributeName,t.labelName],class:"tok-property"},
  {tag:t.function(t.variableName),class:"tok-function"},
  {tag:t.invalid,class:"tok-invalid"},
]);

// As línguas que a Aurea colore. Os nomes são os que o `CodeBlock` recebe em `language`; `sh` e `shell` são o bash.
const ANALISADORES:Record<string,Analisador>={
  js,javascript:js,
  jsx:js.configure({dialect:"jsx"}),
  ts:js.configure({dialect:"ts"}),typescript:js.configure({dialect:"ts"}),
  tsx:js.configure({dialect:"jsx ts"}),
  css,html,json,
};
let bash:Analisador|undefined;
// A língua vem de fora (a cerca de um texto em markdown): só vale a que é chave DA tabela — "constructor" devolvia a
// função do `Object.prototype` e derrubava a tela (31/10/2026, a auditoria de segurança).
// O bash vem do modo antigo do CodeMirror (o Lezer não tem gramática de shell); ele só é montado quando pedido.
function analisador(lingua:string):Analisador|undefined{
  const l=lingua.toLowerCase();
  if(l==="bash"||l==="sh"||l==="shell")return bash??=StreamLanguage.define(shell).parser;
  return proprio(ANALISADORES,l);
}

/** As línguas que `highlightCode` colore. Com outra, ele devolve `null` e o `CodeBlock` mostra o texto puro. */
export const highlightLanguages:readonly string[]=["bash","css","html","javascript","js","json","jsx","sh","shell","ts","tsx","typescript"];

/**
 * Colore o código para o `CodeBlock` (a prop `highlight`): devolve as linhas, cada uma com os pedaços de texto e a
 * classe da cor. Língua que não está em `highlightLanguages` devolve `null`, e o bloco sai sem cor.
 *
 * ```tsx
 * import {CodeBlock} from "@aurea-uds/react";
 * import {highlightCode} from "@aurea-uds/react/code-highlight";
 * <CodeBlock language="tsx" highlight={highlightCode} lineNumbers>{code}</CodeBlock>
 * ```
 */
export function highlightCode(code:string,language:string):CodeLine[]|null{
  const p=analisador(language);
  if(!p)return null;
  // O TRECHO DE JSX. O exemplo de documentação é um pedaço — várias linhas de JSX soltas, uma embaixo da outra —, e o
  // analisador lê código de verdade: o `<` da segunda linha vira "menor que", e a partir dali as cores trocam de lugar
  // (medido na página do Button, 20/10/2026: só a primeira linha saía certa). Quando a leitura direta tem erro, o
  // trecho é lido de novo dentro de um fragmento (`<>…</>`), fica a leitura com menos erros, e só o trecho original é
  // pintado — o fragmento não aparece.
  let texto=code,arvore=p.parse(code),de=0;
  if(JSX.has(language.toLowerCase())){
    const direto=erros(arvore);
    if(direto>0){
      const embrulhado=`<>${code}</>`,outra=p.parse(embrulhado);
      if(erros(outra)<direto){texto=embrulhado;arvore=outra;de=2}
    }
  }
  const linhas:CodeLine[]=[[]];
  colorirArvore(texto,arvore,destaque,
    (pedaco,classes)=>{linhas[linhas.length-1]!.push(classes?{text:pedaco,className:classes}:{text:pedaco})},
    ()=>{linhas.push([])},de,de+code.length);
  return BASH.has(language.toLowerCase())?comandosDoBash(linhas):linhas;
}
const JSX=new Set(["jsx","tsx"]);
const BASH=new Set(["bash","sh","shell"]);
// O NOME DO COMANDO NO BASH (o item 98, decidido pelo Victor na bancada de 24/11/2026: "Em destaque"). O modo antigo do
// CodeMirror não marca o comando — `pnpm add x` saía inteiro na cor do texto. Como a maioria das referências, a primeira
// palavra de cada comando sai com o destaque de função (`tok-function`): no começo da linha e depois de `|`, `&&`, `||`,
// `;`, `&` e `(` (o `$(…)` também; e a crase). Não é comando: a atribuição antes dele (`FOO=1 node …` destaca o `node`), o `$` do
// prompt e a linha que continua a de cima (a que terminou em barra invertida). A palavra-chave (`if`, `then`) já tem cor e deixa o
// comando seguinte ser o destacado.
// As duas expressões vão como texto (`new RegExp`), e a crase como `\x60`: escritas entre barras, o `(`, o `[` e a crase
// de dentro parecem sem par para quem lê o arquivo (o check 46 do validador).
const SEPARA=new RegExp("[|&;(\\x60]");
const PALAVRA=new RegExp("^([\\s|&;(\\x60]*)([^\\s|&;()\\x60<>]*)");
function comandosDoBash(linhas:CodeLine[]):CodeLine[]{
  let continua=false;
  return linhas.map((linha)=>{
    let espera=!continua,valor=false;
    const nova:CodeLine=[];
    for(const p of linha){
      // O valor da atribuição (`FOO=1`) vem num pedaço com cor própria: depois dele, o comando ainda está por vir.
      if(p.className){nova.push(p);if(valor)valor=false;else if(p.className!=="tok-keyword"&&p.className!=="tok-comment")espera=false;continue}
      valor=false;
      let resto=p.text;
      while(resto){
        if(!espera){
          const i=resto.search(SEPARA);
          if(i<0){nova.push({text:resto});resto="";break}
          nova.push({text:resto.slice(0,i+1)});resto=resto.slice(i+1);espera=true;continue;
        }
        const m=PALAVRA.exec(resto)!;
        if(m[1])nova.push({text:m[1]});
        const palavra=m[2]!;
        resto=resto.slice(m[0].length);
        if(!palavra){if(resto){nova.push({text:resto[0]!});resto=resto.slice(1);espera=false}continue}
        if(palavra==="$"||/^[A-Za-z_]\w*=/.test(palavra)){nova.push({text:palavra});valor=!resto&&palavra.endsWith("=");continue}
        nova.push({text:palavra,className:"tok-function"});espera=false;
      }
    }
    const fim=nova.length?nova[nova.length-1]!:undefined;
    continua=!!fim&&!fim.className&&/\\\s*$/.test(fim.text);
    return nova;
  });
}
// Quantos nós de erro a leitura deixou: é a régua para escolher entre a leitura direta e a do fragmento.
function erros(arvore:ReturnType<typeof js.parse>):number{
  let n=0;
  arvore.iterate({enter:(no)=>{if(no.type.isError)n++}});
  return n;
}
