"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {useRef, forwardRef, cloneElement, type ButtonHTMLAttributes, type HTMLAttributes, type ReactElement, type RefAttributes} from "react";
import {classesResponsivas, ehResponsivo, peleDoEixo, soOValor, valorBase, type Orientation, type Responsive} from "./pure.js";
import {useValorResponsivo} from "./responsivo-runtime.js";
import {Toolbar as BaseToolbar} from "@base-ui/react/toolbar";
import {Toggle as BaseToggle} from "@base-ui/react/toggle";
import {ToggleGroup as BaseToggleGroup} from "@base-ui/react/toggle-group";
import {cx, useAureaStrings} from "./internal.js";
import {Kbd} from "./markup.js";
import {Icon, type IconName} from "./system.js";

// A ordem do nome segue a FAMÍLIA, e a inconsistência é herdada: em `outline`/`ghost` o tom vem
// primeiro (`danger-outline`, `primary-outline`); em `link` vem depois (`link-danger`), porque ali
// `link` é a base e o tom modifica. Que este enum seja o produto cartesiano de dois eixos
// achatados num só é o achado `G-API-01`, e a partir daqui ele é ATALHO, não a API: os treze
// nomes continuam valendo, continuam saindo com a mesma classe e continuam desenhando o mesmo
// pixel — quem quiser os dois eixos usa `appearance` + `tone`.
export type ButtonVariant="primary"|"secondary"|"outline"|"ghost"|"primary-outline"|"primary-ghost"|"danger"|"danger-outline"|"danger-ghost"|"link"|"link-primary"|"link-danger"|"nav";
// APARÊNCIA: quanto peso a caixa tem. `nav` é aparência própria (item de navegação, cor
// esmaecida em repouso), não um tom — por isso mora aqui e não ali.
export type ButtonAppearance="solid"|"outline"|"ghost"|"link"|"nav";
// TOM: o que a cor SIGNIFICA. Os cinco tons semânticos mais o neutro, e TODOS funcionam em
// TODAS as aparências — inclusive preenchido. `warning` entrou em 21/08/2026, quando o token de
// aviso deixou de resolver para a cor da marca no tema escuro (`G-TOKEN-02`).
export type ButtonTone="neutral"|"brand"|"danger"|"success"|"warning"|"info";
export type ComponentSize="xs"|"sm"|"md"|"lg"|"xl";

// O dicionário que desachata o enum. É a ÚNICA fonte da correspondência: o gate do
// `validate.py` lê daqui para provar que todo par ou tem regra no core ou está declarado
// ausente com motivo, e a ficha do registry declara os mesmos dois eixos.
const EIXOS:Record<ButtonVariant,readonly [ButtonAppearance,ButtonTone]>={
  primary:["solid","brand"],secondary:["solid","neutral"],
  outline:["outline","neutral"],ghost:["ghost","neutral"],
  "primary-outline":["outline","brand"],"primary-ghost":["ghost","brand"],
  danger:["solid","danger"],"danger-outline":["outline","danger"],"danger-ghost":["ghost","danger"],
  link:["link","neutral"],"link-primary":["link","brand"],"link-danger":["link","danger"],
  nav:["nav","neutral"]};
// caminho de volta: par → nome antigo. Existir aqui significa "o core já pinta esta célula com
// uma classe própria", e é o que garante que NENHUMA baseline se mexe: `appearance="outline"`
// + `tone="danger"` emite `.btn-danger-outline`, o mesmo DOM de sempre.
const CLASSE_ANTIGA=new Map<string,ButtonVariant>(
  (Object.entries(EIXOS) as [ButtonVariant,readonly [ButtonAppearance,ButtonTone]][])
    .map(([v,[a,t]])=>[`${a}/${t}`,v] as const));
/** Resolve os dois eixos (ou o atalho) na classe que o core pinta. Exportada porque o teste
 *  cobra a matriz inteira, e porque quem monta um botão à mão precisa da mesma conta.
 *
 *  Não há degradação: toda célula dos dois eixos tem regra própria no core. A versão de
 *  21/08 rebaixava `solid` de success/info para `outline` porque faltava o par de token — o
 *  Victor recusou a degradação silenciosa e mandou consertar a infraestrutura, que é o que
 *  `--success`/`--success-foreground` e os irmãos são. `outline` voltou a ser só uma aparência
 *  que se pede, nunca o que sobra quando a nossa paleta não dá conta. */
export function buttonSkin(variant?:ButtonVariant,appearance?:ButtonAppearance,tone?:ButtonTone):string{
  const [a0,t0]=EIXOS[variant??"secondary"];
  const a=appearance??a0, t=tone??t0;
  const antiga=CLASSE_ANTIGA.get(`${a}/${t}`);
  return antiga?`btn-${antiga}`:cx(`btn-${a}`,`btn-tone-${t}`);
}
// href: um botão que NAVEGA é um link, e link é <a>. A pele é a mesma (.btn), a semântica
// não: leitor de tela anuncia link, o meio-clique abre em nova aba, o Enter funciona sem JS.
// Desabilitado + href = <a> SEM href e com aria-disabled: link não tem estado disabled.
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,RefAttributes<HTMLButtonElement>{variant?:ButtonVariant;appearance?:ButtonAppearance;tone?:ButtonTone;size?:Responsive<ComponentSize>;loading?:boolean;leadingIcon?:IconName;trailingIcon?:IconName;href?:string;fullWidth?:boolean;
  /** C-03 (24/09/2026): numa fila (`Cluster`), divide o espaço em partes iguais com os outros botões
   *  que também têm `grow`. O `fullWidth` não serve ali: ele pede a linha inteira. */
  grow?:boolean;
  /** M-01 (25/09/2026): o elemento que o botão desenha no lugar do `<button>`/`<a>` — o link do
   *  roteador do app, por exemplo: `render={<Link href="/relatorios" />}`. O elemento recebe a pele,
   *  o conteúdo (ícones, texto, atalho) e os atributos do botão; o destino é dele. Desativado ou
   *  carregando, o clique é BARRADO também nele, como no link desativado (AUD-0004). */
  render?:ReactElement;
  /** C-13 (24/09/2026): atributos de LINK, que só valem com `href` — sem ele são ignorados. Antes
   *  chegavam ao `<a>` em tempo de execução, mas o tipo não os aceitava, e `target="_blank"` não
   *  compilava. */
  target?:React.HTMLAttributeAnchorTarget;rel?:string;download?:boolean|string;
  /**
   * @deprecated Use `<Toggle>` instead. Pesquisado em 18/08/2026 nas doze referências (MUI,
   * Fluent 2, React Aria, Spectrum, Carbon, Radix/Base UI, shadcn, ReUI, PrimeReact, HeroUI,
   * Cedar, APG): **nenhuma** põe o estado de pressionado no botão comum — todas têm um
   * componente separado, e o nosso é o `Toggle`. Manter os dois é dois caminhos para a mesma
   * coisa, que é o "qual eu uso?" que denuncia recurso duplicado.
   * A diferença de verdade: aqui VOCÊ guarda o estado e isto só pinta e anuncia; o `Toggle`
   * guarda o estado (motor Base UI), devolve `onPressedChange` e cobra nome acessível quando
   * é só ícone.
   * @deprecatedSince 0.4.0 — sai na `1.0`. A Aurea está em `0.x`, onde o semver permite
   * quebrar, e por isso este é o momento mais barato que vai existir.
   */
  pressed?:boolean;kbd?:string}
// type="button" por default: o default do HTML é submit, e um "Cancelar"/"Remover"
// dentro de <form> dispararia a ação principal (auditoria 18/07/2026, ALTO 1).
// Quem quer submeter passa type="submit" explícito (como o MessageComposer faz).
export const Button=forwardRef<HTMLButtonElement,ButtonProps>(function Button({variant,appearance,tone,size="md",loading,leadingIcon,trailingIcon,className,children,disabled,type="button",href,fullWidth,grow,target,rel,download,pressed,kbd,onClick,onClickCapture,"aria-disabled":ariaDisabled,render,...props},ref){
// G-AXIS-04 — `size` aceita valor simples, responsivo por viewport ou adaptativo por container.
// SOMATIVO por construção: valor simples continua emitindo `btn-sm`, byte por byte a mesma classe
// de antes, e por isso nenhuma baseline se mexe. Só o valor responsivo entra pela camada genérica
// (`size-*` + `vp-*:`/`ct-*:`), que existe uma vez no core para todo o sistema.
// Quem decide é o CSS: nada aqui observa largura, e o HTML do servidor já sai correto.
const responsivo=ehResponsivo(size);
const base=valorBase(size)??"md";
const cls=cx("btn",buttonSkin(variant,appearance,tone),
  responsivo?classesResponsivas("size",size):(base!=="md"&&`btn-${base}`),
  fullWidth&&"btn-block",grow&&"btn-grow",className);
// kbd dentro do botão: mostra o atalho E o anuncia (aria-keyshortcuts), senão é enfeite.
const inner=<>{loading&&<span className="spinner"/>}{leadingIcon&&<Icon name={leadingIcon}/>}<span>{children}</span>{kbd&&<Kbd>{kbd}</Kbd>}{trailingIcon&&<Icon name={trailingIcon}/>}</>;
// INERTE ≠ DESABILITADO, e a diferença é medida (M4, 13/08/2026): `disabled` tira o botão da
// ordem de foco, então quem navega por teclado nunca alcança a explicação de POR QUE não dá — e
// "não dá porque você não tem permissão" é justamente o caso em que a explicação é tudo. O
// embrulho de <span> que o MUI documenta resolve o ponteiro e não resolve o teclado (span nasce
// com tabIndex -1, medido). Com `aria-disabled` o botão continua focável e anunciado como
// desabilitado, e é ESTE componente que tem de barrar a ativação — o atributo é só semântica.
// Mesmo remendo do AUD-0004, que já barrava o link desabilitado; aqui ele alcança o <button>.
const inerte=ariaDisabled===true||ariaDisabled==="true";
const off=disabled||loading;
const shared={"aria-keyshortcuts":kbd||undefined,"aria-busy":loading||undefined};
// AUD-0004 (12/08/2026): o ramo de LINK desabilitado tirava o `href` e punha `aria-disabled`, e
// deixava o `onClick` passar intacto — então um link "desabilitado" continuava executando a ação
// ao ser clicado, e o `loading` também. Não há `disabled` em `<a>`: quem tem de barrar a ativação
// é este componente. O ramo de `<button>` nunca teve o defeito, porque `disabled` no elemento
// nativo já barra o evento — por isso a correção mora só aqui.
// Os dois handlers de click saem de `props`: no React, onClickCapture roda antes do onClick e
// também precisa ser barrado. `stopPropagation` evita o handler de bolha em um ancestral.
const bloqueia=(e:React.MouseEvent<HTMLAnchorElement>)=>{e.preventDefault();e.stopPropagation()};
const eventos=(off||inerte)?{onClick:bloqueia,onClickCapture:bloqueia}:{onClick:onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>,onClickCapture:onClickCapture as unknown as React.MouseEventHandler<HTMLAnchorElement>};
// M-01: com `render`, o elemento de quem chama é o botão. Os atributos dele vêm por cima dos nossos
// (como no `fundirRender`), a classe soma, o conteúdo é o do botão — e, desativado ou carregando,
// o bloqueio vem POR ÚLTIMO: nenhum `onClick` do elemento passa.
if(render){const dele=(render.props??{}) as Record<string,unknown>;return cloneElement(render as ReactElement<Record<string,unknown>>,{ref,...shared,...props,...dele,className:cx(cls,dele.className as string|undefined),...((off||inerte)?{"aria-disabled":true,onClick:bloqueia,onClickCapture:bloqueia}:{onClick:dele.onClick??onClick,onClickCapture:dele.onClickCapture??onClickCapture}),children:inner})}
if(href!==undefined)return <a ref={ref as unknown as React.Ref<HTMLAnchorElement>} className={cls} target={target} rel={rel} download={download} {...shared} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>&RefAttributes<HTMLAnchorElement>)} {...(off?{"aria-disabled":true}:{href})} {...eventos}>{inner}</a>;
return <button ref={ref} type={type} className={cls} disabled={off} aria-disabled={inerte||undefined} aria-pressed={pressed} {...shared} {...(inerte?{onClick:bloqueia as unknown as React.MouseEventHandler<HTMLButtonElement>,onClickCapture:bloqueia as unknown as React.MouseEventHandler<HTMLButtonElement>}:{onClick,onClickCapture})} {...props}>{inner}</button>});

// Toggle (Lote 1 do BUILDING.md). NÃO é o `pressed` do Button: aquele só ANUNCIA o estado e
// quem controla é o consumidor; este é o controle de dois estados de verdade — o Base UI
// mantém o estado, entrega `data-pressed` e o `aria-pressed` correto, e suporta não-controlado.
// A pele reusa o idioma que a Aurea já tem para "isto está selecionado": o mesmo par de tokens
// de `.segmented button.active`. Um toggle solto e um segmento aceso não podem parecer coisas
// diferentes na mesma tela.
// Props declaradas uma a uma, e não `ButtonHTMLAttributes` inteiro: o tipo do Base UI aceita
// `className` e `children` como FUNÇÃO do estado, e espalhar a superfície do <button> em cima
// disso colide. É o mesmo caminho que Dialog, Popover e Combobox já seguem aqui.
// AUD-0003 (12/08/2026): `label` era OPCIONAL e o contrato dizia que ele é obrigatório sem texto
// visível. `<Toggle icon="checkmark"/>` compilava e produzia um `<button>` focável sem `children`,
// sem `aria-label` e sem nome acessível nenhum — operável pelo mouse, inexistente para leitor de
// tela. O tipo passa a cobrar a regra em vez de descrevê-la: ou há `children`, ou há `label`.
interface ToggleBase{pressed?:boolean;defaultPressed?:boolean;onPressedChange?:(pressed:boolean)=>void;/** O que identifica este toggle DENTRO de um ToggleGroup — sem ele o grupo não sabe qual botão
 *  mudou, e a composição fica bonita e morta. Solto, não faz diferença nenhuma. */
value?:string;icon?:IconName;size?:Responsive<Extract<ComponentSize,"sm"|"md"|"lg">>;disabled?:boolean;id?:string;className?:string}
type ToggleChildren=Exclude<React.ReactNode,boolean|null|undefined>;
export type ToggleProps=ToggleBase&({children:ToggleChildren;label?:string}|{children?:never;label:string});
// O ReactNode inclui false/null/undefined, mas nenhum deles nomeia um botão. Estes tipos somem
// do JS emitido e fazem o próprio tsc reprovar a volta do ícone sem rótulo.
type ToggleNameInvariant<T extends true>=T;
type _ToggleBareIconIsRejected=ToggleNameInvariant<(ToggleBase&{icon:IconName}) extends ToggleProps?false:true>;
type _ToggleFalsyChildIsRejected=ToggleNameInvariant<(ToggleBase&{icon:IconName;children:false}) extends ToggleProps?false:true>;
function temConteudoVisivel(children:React.ReactNode):boolean{
const itens=React.Children.toArray(children);
return itens.some(item=>{
  if(typeof item==="string")return item.trim().length>0;
  if(typeof item==="number"||typeof item==="bigint")return true;
  if(!React.isValidElement(item))return false;
  const p=item.props as {children?:React.ReactNode;alt?:unknown;"aria-label"?:unknown;"aria-hidden"?:unknown};
  if(p["aria-hidden"]===true||p["aria-hidden"]==="true")return false;
  if(typeof p["aria-label"]==="string"&&p["aria-label"].trim())return true;
  if(typeof p.alt==="string"&&p.alt.trim())return true;
  // Inspecionar `children` também cobre Fragment e elementos formatadores. Componente arbitrário
  // sem conteúdo inspecionável é tratado de modo conservador: precisa fornecer `label`.
  return temConteudoVisivel(p.children);
});
}
// ESTE é o toggle da Aurea. O `pressed` do `Button` está DEPRECIADO em favor dele (0.4.0,
// sai na 1.0): as doze referências pesquisadas em 18/08/2026 têm componente separado, e
// nenhuma põe o estado no botão comum.
// E a REGRA QUE FALTAVA ESTAR ESCRITA AQUI, do Adobe Spectrum e do APG: **o rótulo não muda
// entre os estados**. Se o texto vira "Mute"/"Unmute" ou "Play"/"Pause", não é toggle — é
// botão de ação, porque quem lê tela ouve o rótulo NOVO e o estado ao mesmo tempo e não sabe
// se o botão descreve o que é ou o que fará.
export function Toggle({pressed,defaultPressed,onPressedChange,value,icon,label,size,disabled,id,className,children}:ToggleProps){
// O tipo barra o consumidor TypeScript; este aviso barra o de JavaScript, que não tem tipo nenhum.
// Sem gate por NODE_ENV de propósito: o `dist` é saída de `tsc`, então `process` não existe no
// navegador e a referência quebraria o render — e um controle sem nome merece aparecer em produção
// também. Segue o idioma do próprio motor, que usa `console.error` para invariante violada.
// O tipo barra false/null/undefined diretos. Runtime ainda precisa cobrir os vazios que o tipo não
// consegue expressar: string em branco, array/Fragment vazio e elemento só decorativo.
const textoVisivel=temConteudoVisivel(children);
const rotuloVisivel=typeof label==="string"&&label.trim().length>0;
if(!textoVisivel&&!rotuloVisivel)console.error("Aurea: <Toggle> sem `children` visível e sem `label` não tem nome acessível — quem usa leitor de tela encontra um botão anônimo. Passe `label` quando o toggle for só ícone.");
return <BaseToggle id={id} value={value} disabled={disabled} pressed={pressed} defaultPressed={defaultPressed} onPressedChange={soOValor(onPressedChange)} aria-label={textoVisivel?undefined:(rotuloVisivel?label:undefined)} className={cx("btn","btn-ghost",size!=="md"&&`btn-${size}`,!textoVisivel&&"btn-icon","toggle",className)}>{icon&&<Icon name={icon}/>}{children}</BaseToggle>}

export interface IconButtonProps extends Omit<ButtonProps,"children">{label:string;icon:IconName}
// default ghost (não secondary): um ícone-ação solto — hambúrguer, tema, fechar — é sem
// caixa por convenção (pedido do Victor: hambúrguer sem borda). Quem quer a caixa passa
// variant. Alinha o React ao HTML dos docs, onde .btn-icon já é transparente.
export const IconButton=forwardRef<HTMLButtonElement,IconButtonProps>(function IconButton({label,icon,variant="ghost",className,...props},ref){return <Button ref={ref} variant={variant} className={cx("btn-icon",className)} aria-label={label} {...props}><Icon name={icon}/></Button>});
// ButtonGroup: agrupamento semântico. Sem roving tabindex — cada botão continua tabulável (use Toolbar para roving).
// `orientation` (G-AXIS-01) muda só o EIXO do layout, não a semântica: `role="group"` não tem
// noção de direção, e por isso — ao contrário do `Toolbar` e do `ToggleGroup`, que navegam por
// seta e precisam saber para que lado a seta anda — aqui não há `aria-orientation`. Anunciar
// orientação num grupo que não navega seria prometer teclado que não existe.
export function ButtonGroup({label,orientation,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{label?:string;orientation?:Responsive<Orientation>}){const s=useAureaStrings();return <div role="group" aria-label={label??s.optionsLabel} className={cx("btn-group",peleDoEixo("btn-group",orientation,"horizontal","btn-group"),className)} {...props}/>}
// Toolbar: roving tabindex (setas navegam, Tab entra/sai) via Base UI.
// G-AXIS-06 — o valor responsivo RESOLVIDO é a única fonte de verdade: ele vai para o motor, o
// motor publica `data-orientation`/`aria-orientation` e ajusta o teclado, e a pele reage ao
// atributo publicado. Nada de o CSS decidir a orientação por breakpoint enquanto o atributo
// diz outra coisa — seriam duas fontes de verdade e uma janela em que visual e comportamento
// divergem. Ver `decisions/0047-css-first-para-apresentacao-runtime-para-semantica.md`.
export function Toolbar({orientation,label,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{orientation?:Responsive<Orientation>;label?:string}){
const s=useAureaStrings();
const ancora=useRef<HTMLDivElement|null>(null);
const resolvida=useValorResponsivo(orientation,"horizontal",ancora);
return <BaseToolbar.Root ref={ancora} orientation={resolvida} aria-label={label??s.toolbarLabel} className={cx("toolbar",className)} {...props}/>}
export function ToolbarGroup({label,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{label?:string}){return <BaseToolbar.Group aria-label={label} className={cx("toolbar-group",className)} {...props}/>}
export function ToolbarSeparator({className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>){return <BaseToolbar.Separator className={cx("toolbar-sep",className)} {...props}/>}
export const ToolbarButton=forwardRef<HTMLButtonElement,ButtonProps>(function ToolbarButton({variant="ghost",...props},ref){return <BaseToolbar.Button ref={ref} disabled={props.disabled} render={<Button variant={variant} {...props}/>}/>});

// TOGGLE GROUP — vários Toggle com estado compartilhado e navegação por seta entre eles.
//
// Não é o SegmentedControl, e confundir os dois constrói a coisa errada com o nome certo: o
// `SegmentedControl` é escolha ÚNICA e obrigatória entre alternativas de uma mesma dimensão
// ("dia / semana / mês") e se parece com uma cápsula; aqui cada botão liga e desliga por conta
// própria, `multiple` permite vários ao mesmo tempo, e zero selecionado é estado legítimo. É a
// barra de formatação de um editor, não um filtro de período.
//
// O motor dá o roving tabindex, o `loopFocus` e o contrato de pressionado; a pele é a do
// `.btn-group`, porque um grupo de botões é o que isto é.
export function ToggleGroup({value,defaultValue,onValueChange,multiple,orientation,disabled,label,className,children}:{value?:string[];defaultValue?:string[];onValueChange?:(value:string[])=>void;multiple?:boolean;orientation?:Responsive<Orientation>;disabled?:boolean;label?:string;className?:string;children:React.ReactNode}){
  const ancora=useRef<HTMLDivElement|null>(null);
  const resolvida=useValorResponsivo(orientation,"horizontal",ancora);
  return <BaseToggleGroup ref={ancora} value={value} defaultValue={defaultValue} onValueChange={soOValor(onValueChange)} multiple={multiple} orientation={resolvida} disabled={disabled} aria-label={label} className={cx("toggle-group",className)}>{children}</BaseToggleGroup>;
}
