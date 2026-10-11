"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {useRef, type ReactNode, type ReactElement} from "react";
import {Dialog as BaseDialog} from "@base-ui/react/dialog";
import {Drawer as BaseDrawer} from "@base-ui/react/drawer";
import {AlertDialog as BaseAlertDialog} from "@base-ui/react/alert-dialog";
import {Popover as BasePopover} from "@base-ui/react/popover";
import {Tooltip as BaseTooltip} from "@base-ui/react/tooltip";
import {Menu as BaseMenu} from "@base-ui/react/menu";
import {Menubar as BaseMenubar} from "@base-ui/react/menubar";
import {ContextMenu as BaseContextMenu} from "@base-ui/react/context-menu";
import {PreviewCard as BasePreviewCard} from "@base-ui/react/preview-card";
import {cx, useAureaStrings, usePortalContainer} from "./internal.js";
import {type Responsive} from "./pure.js";
import {useValorResponsivo} from "./responsivo-runtime.js";
import {Icon, type IconName} from "./system.js";
import {Button, CloseButton} from "./actions.js";

// B-03 e C-07 (24/09/2026). `size` é a largura, e os números são decisão do Victor: as quatro da
// referência (320, 384, 448, 512 — `xs` a `lg`), mais `xl` (1024, o token `--breakpoint-lg`) para o
// detalhe largo que um app precisou, e `full`, a tela menos a margem de sempre, com o raio 22.
// ⚠ **O PADRÃO MUDOU:** era 560 até a 0.8.14 e passou a ser o `md` da referência, 448. Toda janela
// que não escolhe tamanho fica 112 px mais estreita.
//
// `dismissible={false}` segura a janela aberta durante uma operação: nem Esc, nem clique fora, e o
// X fica DESATIVADO, não some — sumir mudaria o cabeçalho de lugar no meio da operação. Antes, o
// app passava `onClose={() => {}}`, que faz o mesmo sem dizer isso a ninguém.
//
// A ANATOMIA DA REFERÊNCIA (0.32.0, "o Dialog = o dela", lida no CSS publicado dela): recheio de 24;
// o X (`CloseButton`) solto no canto, a 16 do topo e do fim; o cabeçalho em coluna com o ícone num
// círculo de 40 em cima e o título de 16, peso médio; o corpo de 14/20 na cor esmaecida, e é ELE que
// rola (o cabeçalho e o rodapé ficam); 8 entre o cabeçalho e o corpo, 20 antes do rodapé; o rodapé
// alinhado ao fim, com 8 entre os botões. E `placement="auto"`: no celular a janela senta embaixo
// (onde o polegar alcança), e de 640 para cima fica no meio — o padrão dela. A borda continua (a
// dela é só sombra no claro): é a característica de baixa visão da Aurea, como nas outras janelas.
export type DialogSize="xs"|"sm"|"md"|"lg"|"xl"|"full";
export type DialogPlacement="auto"|"center"|"top"|"bottom";
// O círculo do ícone tem as cores de estado da Aurea (o fundo `*-bg` e a letra `-400`, ADR-0061), e o
// `brand` é o clarinho do alternável ligado com o amarelo de letra. Os nomes são os do `ButtonTone`.
export type DialogIconTone="neutral"|"brand"|"info"|"success"|"warning"|"danger";
function IconeDaJanela({icon,tone}:{icon:IconName;tone:DialogIconTone}){
  return <span className={cx("dialog-icon",`dialog-icon-${tone}`)} aria-hidden="true"><Icon name={icon}/></span>}
export function Dialog({open,title,children,footer,onClose,size="md",dismissible=true,icon,iconTone="neutral",placement="auto"}:{open:boolean;title:ReactNode;children:ReactNode;footer?:ReactNode;onClose:()=>void;size?:DialogSize;dismissible?:boolean;icon?:IconName;iconTone?:DialogIconTone;placement?:DialogPlacement}){
  const portal=usePortalContainer();
  // O X vem PRIMEIRO na ordem do documento, como o gatilho de fechar da referência: o motor foca o
  // primeiro focável ao abrir, e era o X também quando ele morava no fim do cabeçalho (o título não é
  // focável) — a ordem do Tab não muda.
  return <BaseDialog.Root open={open} disablePointerDismissal={!dismissible} onOpenChange={o=>{if(!o&&dismissible)onClose()}}>
    <BaseDialog.Portal container={portal}><BaseDialog.Backdrop className="dialog-backdrop"/>
      <BaseDialog.Popup className={cx("dialog",size!=="md"&&`dialog-${size}`)} data-placement={placement}>
        <BaseDialog.Close render={<CloseButton className="dialog-close" disabled={!dismissible}/>}/>
        <header className="dialog-header">{icon&&<IconeDaJanela icon={icon} tone={iconTone}/>}<BaseDialog.Title render={<h2/>} className="dialog-heading">{title}</BaseDialog.Title></header>
        <div className="dialog-body">{children}</div>{footer&&<footer className="dialog-footer">{footer}</footer>}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  </BaseDialog.Root>}
// ConfirmDialog (M5): a decisão que não se fecha por engano. NÃO é um Dialog com dois botões —
// é `role="alertdialog"`, e a diferença é de comportamento, não de aparência: o Base UI tira do
// AlertDialog.Root as props `modal` e `disablePointerDismissal` (medido no d.ts de 1.6.0), ou
// seja, clicar fora NÃO fecha. Num Dialog comum, clicar fora vira "cancelei" sem a pessoa ter
// decidido — que é exatamente o acidente que este componente existe para impedir.
//
// FOCO NO BOTÃO SEGURO: quem abre um "isto apaga" e aperta Enter por reflexo tem de cancelar,
// não apagar. As quatro referências convergem em cancelar-antes-de-agir na ORDEM visual, e
// nenhuma delas move o foco — este passo saiu de medir o teclado, não de ler.
//
// DUAS coisas garantem, e as duas foram medidas em 13/08/2026, uma de cada vez:
//   • a ORDEM do DOM — o Cancelar vem primeiro, e o motor foca o primeiro focável. Sozinha, ela
//     já faz o teste passar; tirar só o `initialFocus` NÃO reprova.
//   • o `initialFocus`, que é o cinto: com a ordem dos dois botões INVERTIDA ele continua
//     segurando o foco no Cancelar, e é aí que ele prova que não é enfeite. Sem ele e com a
//     ordem invertida, o teste reprova — que é o defeito de verdade, porque inverter a ordem é
//     uma mudança de aparência que alguém faz sem pensar no teclado.
// O teste cobra o EFEITO ("o foco nasce no seguro"), não o mecanismo. É por isso que ele
// sobrevive a trocar um dos dois — e reprova quando os dois somem.
//
// ESCOPO MENOR que a referência (BUILDING.md §5): lá são nove peças compostas
// (raiz, gatilho, conteúdo, cabeçalho, título, descrição, rodapé, cancelar e ação). Aqui é uma prop `open`,
// como no `Dialog` e no `Drawer` — a composição não acrescenta escolha nenhuma num diálogo cujo
// corpo é uma frase e dois botões.
//
// `description` é prop e não `children` porque ela é o nó de `aria-describedby`: o AlertDialog
// só anuncia o que passa pelo `Description`. Como `children`, um consumidor poria um <div> no
// meio e o leitor de tela perderia a frase que diz o que se perde.
//
// 0.32.0: a anatomia do `Dialog` (a da referência), sem o X — a decisão não se fecha por engano. O
// ícone é o círculo de 40 de lá; a cor dele segue o `destructive` quando quem usa não escolhe.
export function ConfirmDialog({open,title,description,confirmLabel,cancelLabel,destructive,onConfirm,onCancel,icon,iconTone,placement="auto"}:{open:boolean;title:ReactNode;description:ReactNode;confirmLabel?:string;cancelLabel?:string;destructive?:boolean;onConfirm:()=>void;onCancel:()=>void;icon?:IconName;iconTone?:DialogIconTone;placement?:DialogPlacement}){
  const s=useAureaStrings();
  const portal=usePortalContainer();
  const seguro=React.useRef<HTMLButtonElement>(null);
  return <BaseAlertDialog.Root open={open} onOpenChange={o=>{if(!o)onCancel()}}>
    <BaseAlertDialog.Portal container={portal}>
      <BaseAlertDialog.Backdrop className="dialog-backdrop"/>
      <BaseAlertDialog.Popup className="dialog dialog-confirm" initialFocus={seguro} data-placement={placement}>
        <header className="dialog-header">{icon&&<IconeDaJanela icon={icon} tone={iconTone??(destructive?"danger":"neutral")}/>}<BaseAlertDialog.Title render={<h2/>} className="dialog-heading">{title}</BaseAlertDialog.Title></header>
        <BaseAlertDialog.Description className="dialog-body">{description}</BaseAlertDialog.Description>
        <footer className="dialog-footer">
          <Button ref={seguro} variant="tertiary" onClick={onCancel}>{cancelLabel??s.confirmCancel}</Button>
          <Button variant={destructive?"danger":"primary"} onClick={onConfirm}>{confirmLabel??s.confirmProceed}</Button>
        </footer>
      </BaseAlertDialog.Popup>
    </BaseAlertDialog.Portal>
  </BaseAlertDialog.Root>;
}
// Drawer (0.32.0): a gaveta da referência nos QUATRO lados (WEB-06, o painel que sobe de baixo, e
// HER-06), no motor de gaveta do Base UI — que já arrasta para fechar, no sentido do lado. A anatomia
// é a do `Dialog` (X no canto, título de 16, corpo que rola, rodapé); a largura das laterais é a dela,
// 320 no celular e 384 de 640 para cima, nunca mais que 85% da tela; a de cima e a de baixo ocupam a
// largura toda e até 85% da altura, com a alça (36 × 4) do lado de dentro. Os cantos são os da Aurea:
// as laterais com o 22 do lado de dentro (a dela é quadrada, e nada na Aurea é), a de baixo e a de
// cima com o 32 da folha (ADR-0058). O padrão continua `right`: o dela é `bottom`, mas trocar o lado
// de quem já usa seria a gaveta abrindo noutro lugar sem aviso.
// `left`/`right` prometem lado FÍSICO no nome (ver o comentário da `.drawer-left` no core).
export type DrawerSide="left"|"right"|"top"|"bottom";
const ARRASTO_DO_LADO:Record<DrawerSide,"left"|"right"|"up"|"down">={left:"left",right:"right",top:"up",bottom:"down"};
export function Drawer({open,title,children,footer,onClose,side="right"}:{open:boolean;title:ReactNode;children:ReactNode;footer?:ReactNode;onClose:()=>void;side?:DrawerSide}){
  const portal=usePortalContainer();
  const alca=<div className="drawer-handle" aria-hidden="true"/>;
  return <BaseDrawer.Root open={open} onOpenChange={o=>{if(!o)onClose()}} swipeDirection={ARRASTO_DO_LADO[side]}>
    <BaseDrawer.Portal container={portal}><BaseDrawer.Backdrop className="drawer-backdrop"/>
      <BaseDrawer.Viewport className="drawer-viewport">
        <BaseDrawer.Popup className={cx("drawer",`drawer-${side}`)}>
          <BaseDrawer.Close render={<CloseButton className="dialog-close"/>}/>
          {side==="bottom"&&alca}
          <header className="dialog-header"><BaseDrawer.Title render={<h2/>} className="dialog-heading">{title}</BaseDrawer.Title></header>
          <BaseDrawer.Content className="dialog-body">{children}</BaseDrawer.Content>
          {footer&&<footer className="dialog-footer">{footer}</footer>}
          {side==="top"&&alca}
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  </BaseDrawer.Root>}

// AccessGate (M4): a ação que o usuário não pode fazer. A Aurea NÃO decide permissão — quem
// decide é o consumidor, e `allowed` é a resposta dele já pronta. O que este componente carrega é
// a ESCOLHA que se erra sem pensar: sumir ou aparecer inerte com o motivo.
//
// Isto entrou depois de PESQUISAR, não de olhar a pasta — e a correção é do Victor, em
// 13/08/2026. Nenhuma das cinco referências locais tem portão, e eu tratei isso como veredito;
// não é. O padrão existe e tem nome no mercado: o componente de "pode" de uma biblioteca de
// permissões, os ganchos de acesso de um framework de painel administrativo, e o portão por recurso que
// os guias de painel administrativo de 2026 repetem. O que as referências locais não têm é
// AUTORIZAÇÃO — e elas não têm porque não são a camada de UI única de ninguém. A Aurea é.
//
// A divisão que a pesquisa deixou clara, e que é o valor deste componente:
//   • a biblioteca de permissões só ESCONDE (renderização condicional, o nó sai do DOM);
//   • o framework de painel deixa escolher esconder OU desabilitar.
// Esconder some com a informação de que a ação existe; desabilitar sem motivo é pior ainda,
// porque diz "não dá" e não diz por quê. Por isso `mode="disable"` EXIGE `reason` no tipo.
//
// `aria-disabled` e não `disabled`, pelo que foi medido no M4: `disabled` tira o controle da
// ordem de foco, e aí o motivo não é lido por quem usa teclado.
//
// NÃO É SEGURANÇA, e a ficha repete isso: esconder botão não impede ninguém de chamar a API.
// Quem barra é o servidor. Isto é interface — serve para não oferecer o que vai ser negado.
export type AccessGateProps={allowed:boolean;children:ReactElement}&(
  {mode?:"hide";fallback?:ReactNode;reason?:never}|{mode:"disable";reason:ReactNode;fallback?:never});
export function AccessGate({allowed,children,...resto}:AccessGateProps){
  if(allowed)return children;
  if(resto.mode==="disable")return <Tooltip content={resto.reason}>
    {React.cloneElement(children as ReactElement<Record<string,unknown>>,{"aria-disabled":true})}
  </Tooltip>;
  return <>{resto.fallback??null}</>;
}

export type OverlaySide="top"|"right"|"bottom"|"left";
// `role="tooltip"` + `aria-describedby` no disparador é o que faz a dica EXISTIR para leitor
// de tela. Medido em 30/07/2026: sem isso, o popup saía sem role e sem id, e o disparador sem
// aria-describedby — quem navega por leitor de tela ouvia só o rótulo do botão e nunca o
// conteúdo da dica. Era tooltip visual, não acessível (padrão APG Tooltip).
// O id aponta para um elemento que só existe quando aberto; referência pendente é ignorada
// pela tecnologia assistiva, então não precisa acompanhar o estado.
//
// 0.32.0, a dica e o popover da referência:
//   • A SETA (`arrow`), desligada por padrão como lá. O desenho é nosso (uma curva de 12 × 6, sem a
//     ponta afiada); ela tem o fundo da janela e a linha da borda, então a borda dá a volta nela.
//     A dica com seta se afasta 8 do gatilho (`--space-2`: os 6 da seta e 2 de folga); sem
//     seta, 4 (`--space-1`) — a referência usa 7 e 3, que não são da nossa escala. O popover fica
//     sempre a 8, com ou sem seta, como o dela.
//   • O ATRASO da dica é o dela: 1,5 s para abrir e 0,5 s para fechar (o motor abre em 0,6 s e
//     fecha na hora). Pelo teclado ela abre já, e depois da primeira as vizinhas abrem sem esperar
//     — é o grupo do `Tooltip.Provider` do `AureaProvider`.
//   • O GATILHO FOCÁVEL (C-11): a dica em cima de um texto só abria pelo teclado se o app pusesse
//     `tabIndex`. A referência resolve no gatilho, que sai focável como botão; aqui também — o que
//     não é focável sozinho (um `<span>`, um selo) ganha `tabIndex=0` e `role="button"`. Na
//     marcação, quando o filho é uma tag; e, quando é um componente, no nó de verdade, depois de
//     montado, porque só o DOM sabe o que o componente desenhou.
const ATRASO_DA_DICA=1500, ATRASO_PARA_FECHAR_A_DICA=500;
function Seta(){return <svg viewBox="0 0 12 12" aria-hidden="true"><path className="overlay-arrow-fill" d="M0 0Q6 12 12 0Z"/><path className="overlay-arrow-line" d="M0 0Q6 12 12 0" fill="none"/></svg>}
const FOCAVEIS_POR_NATUREZA=new Set(["button","input","select","textarea","summary","iframe","audio","video"]);
function focavelNaMarcacao(el:ReactElement):boolean|undefined{
  if(typeof el.type!=="string")return undefined;
  const p=el.props as {tabIndex?:number;href?:string};
  if(p.tabIndex!==undefined)return true;
  if(el.type==="a"||el.type==="area")return p.href!==undefined;
  return FOCAVEIS_POR_NATUREZA.has(el.type);
}
function garantirFoco(no:HTMLElement|null){
  if(!no||no.tabIndex>=0||no.hasAttribute("tabindex"))return;
  no.tabIndex=0;
  if(!no.hasAttribute("role"))no.setAttribute("role","button");
}
export function Tooltip({children,content,side="top",arrow=false,delay=ATRASO_DA_DICA,closeDelay=ATRASO_PARA_FECHAR_A_DICA}:{children:ReactElement;content:ReactNode;side?:OverlaySide;arrow?:boolean;delay?:number;closeDelay?:number}){
  const id=React.useId();const triggerId=(children.props as {id?:string}).id;const portal=usePortalContainer();
  const foco=focavelNaMarcacao(children)===false?{tabIndex:0,role:"button"}:{};
  return <BaseTooltip.Root><BaseTooltip.Trigger ref={garantirFoco} id={triggerId} render={children} aria-describedby={id} delay={delay} closeDelay={closeDelay} {...foco}/><BaseTooltip.Portal container={portal}><BaseTooltip.Positioner side={side} sideOffset={arrow?8:4}><BaseTooltip.Popup id={id} role="tooltip" className="tooltip">{arrow&&<BaseTooltip.Arrow className="overlay-arrow"><Seta/></BaseTooltip.Arrow>}{content}</BaseTooltip.Popup></BaseTooltip.Positioner></BaseTooltip.Portal></BaseTooltip.Root>}
export function Popover({trigger,title,children,side="bottom",arrow=false}:{trigger:ReactElement;title?:ReactNode;children:ReactNode;side?:OverlaySide;arrow?:boolean}){const portal=usePortalContainer();return <BasePopover.Root><BasePopover.Trigger render={trigger}/><BasePopover.Portal container={portal}><BasePopover.Positioner side={side} sideOffset={8}><BasePopover.Popup className="popover">{arrow&&<BasePopover.Arrow className="overlay-arrow"><Seta/></BasePopover.Arrow>}{title&&<BasePopover.Title render={<strong/>} className="popover-title">{title}</BasePopover.Title>}{children}</BasePopover.Popup></BasePopover.Positioner></BasePopover.Portal></BasePopover.Root>}
// HoverCard (Lote 1 do BUILDING.md). Não é Tooltip nem Popover, e a diferença é de propósito,
// não de aparência: a Tooltip é um RÓTULO curto (`role="tooltip"`, some ao mover o mouse); o
// Popover abre por CLIQUE e pode conter foco; este é uma PRÉVIA rica que aparece ao repousar o
// ponteiro sobre um link e cujo conteúdo é alcançável — o cartão de perfil ao passar sobre um
// nome. As três referências que o têm chamam de cartão de sobrevoo ou de prévia e concordam nisso.
// Superfície reusa `.popover` de propósito: é a mesma camada flutuante do sistema, e dar a ela
// um segundo nome criaria duas peles para a mesma coisa.
// Por depender de repouso do ponteiro, NÃO serve para informação essencial — quem navega só por
// teclado ou toque não abre um hover card. Conteúdo obrigatório vai em Popover.
export function HoverCard({trigger,children,side="bottom"}:{trigger:ReactElement;children:ReactNode;side?:OverlaySide}){const portal=usePortalContainer();return <BasePreviewCard.Root><BasePreviewCard.Trigger render={trigger}/><BasePreviewCard.Portal container={portal}><BasePreviewCard.Positioner side={side} sideOffset={8}><BasePreviewCard.Popup className="popover hover-card">{children}</BasePreviewCard.Popup></BasePreviewCard.Positioner></BasePreviewCard.Portal></BasePreviewCard.Root>}

// ── O MENU É DADO, e o dado precisava de mais de UMA forma. `G-API-02`. ──────────────────────
//
// Até 28/08/2026 os três menus da Aurea (`DropdownMenu`, `ContextMenu`, `Menubar`) recebiam
// `items: Array<{label, onClick?, disabled?, leadingIcon?} | "separator">`, e essa forma FECHADA
// não expressava nada do que um menu real tem: item que alterna ("Ver → Barra lateral"), opções
// mutuamente exclusivas ("Ordenar por"), submenu, seção rotulada, item que é um link de verdade.
// O Base UI entrega as cinco (`CheckboxItem`, `RadioGroup`/`RadioItem`, `SubmenuRoot`/
// `SubmenuTrigger`, `Group`/`GroupLabel`, `LinkItem`) — o motor entregava e a Aurea não passava
// adiante, que é o padrão que o `G-API-02` nomeia.
//
// A CORREÇÃO NÃO FOI TROCAR A API DE DADOS POR COMPOSIÇÃO, e a escolha tem argumento: um menu É
// uma lista de comandos, e `items` deixa o caso comum trivial e mantém os TRÊS menus idênticos —
// trocar por `children` compound daria mais liberdade e obrigaria a repetir a montagem em cada
// menu. O teto não estava em ser dado; estava em o dado ter **uma forma só**. Então o que mudou é
// que `MenuEntry` virou uma UNIÃO DISCRIMINADA por `kind`, e `kind` é opcional no item de ação —
// a forma antiga continua válida byte por byte, e o compilador cobra o resto.
//
// E vale para os TRÊS menus porque o renderizador é um só. Corrigir só o `DropdownMenu` seria o
// patch local que o CLAUDE.md proíbe: a pergunta "quem mais tem esse problema?" tem resposta
// exata aqui — `ContextMenu` e `Menubar` importam o mesmo `renderMenuItems`.
interface MenuItemBase{label:ReactNode;disabled?:boolean;leadingIcon?:IconName}
/** Item de ação — a forma de sempre. `kind` é opcional para não quebrar quem já usa. */
export interface MenuActionDef extends MenuItemBase{kind?:"item";onClick?:()=>void;
  /** O elemento que MATERIALIZA o item, no idioma `render` da casa (o mesmo do `Card`). Para
   *  navegação prefira `href`, que usa o `LinkItem` do motor. */
  render?:ReactElement}
/** Item que é um link de verdade: `<a href>`, com o `LinkItem` do motor por trás.
 *  NÃO estende `MenuItemBase`, e a ausência é a informação: **link não tem `disabled`** — o HTML
 *  não desabilita âncora, e o motor não aceita a prop. Um destino indisponível é um item de ação
 *  desabilitado, não um link apagado. */
export interface MenuLinkDef{kind:"link";label:ReactNode;leadingIcon?:IconName;href:string;
  target?:string;rel?:string;
  /** Fechar o menu ao clicar. O padrão do motor é `false` (a navegação desmonta tudo de qualquer
   *  jeito); aqui o padrão é `true`, porque numa aplicação de página única o clique NÃO desmonta
   *  e o menu ficaria aberto por cima da tela nova. */
  closeOnClick?:boolean}
/** Item que ALTERNA. Controlado (`checked`) ou não (`defaultChecked`), como todo par da casa. */
export interface MenuCheckboxDef extends MenuItemBase{kind:"checkbox";checked?:boolean;
  defaultChecked?:boolean;onCheckedChange?:(checked:boolean)=>void}
/** Opções MUTUAMENTE EXCLUSIVAS. O grupo é a unidade — um rádio solto não tem sentido. */
export interface MenuRadioGroupDef{kind:"radiogroup";label?:ReactNode;value?:string;
  defaultValue?:string;onValueChange?:(value:string)=>void;
  items:Array<{value:string;label:ReactNode;disabled?:boolean;leadingIcon?:IconName}>}
/** Submenu. `items` aninha a mesma união — um submenu pode ter submenu. */
export interface MenuSubmenuDef extends MenuItemBase{kind:"submenu";items:MenuEntry[]}
/** Seção ROTULADA. O rótulo é do grupo, não um item: `GroupLabel` não é focável nem clicável. */
export interface MenuGroupDef{kind:"group";label?:ReactNode;items:MenuEntry[]}
export type MenuEntry=MenuActionDef|MenuLinkDef|MenuCheckboxDef|MenuRadioGroupDef|MenuSubmenuDef
  |MenuGroupDef|"separator";
/** @deprecated desde 28/08/2026 — use `MenuEntry`. Mantido porque `MenuActionDef` É a forma
 *  antiga: quem tipava com `MenuItemDef` continua compilando. */
export type MenuItemDef=MenuActionDef;

// A MARCA de um item que alterna fica num slot de largura FIXA, e não condicional: sem ele, um
// menu com um item marcado e outro não desalinharia os rótulos a cada clique — o texto andaria
// para o lado sozinho. É a mesma razão de o `leadingIcon` ter lugar próprio.
const marca=(children:ReactNode)=><span className="menu-mark" aria-hidden="true">{children}</span>;

// ContextMenu.Item/.Separator/.Popup são os MESMOS componentes de Menu.* no Base UI,
// então os itens renderizam igual nos dois menus.
// `portal` viaja como PARÂMETRO e não por hook: este renderizador não é componente, e o
// submenu tem portal PRÓPRIO — sem passá-lo adiante, o menu de primeiro nível respeitaria o
// container configurado pelo provider e o submenu escaparia para o `document.body`. Duas
// camadas do mesmo menu em containers diferentes é o tipo de divergência que só aparece quando
// alguém monta a Aurea dentro de um shadow root ou de um diálogo nativo.
function renderMenuItems(items:MenuEntry[],portal?:HTMLElement|null):ReactNode{return items.map((it,i)=>{
  if(it==="separator")return <BaseMenu.Separator key={i} className="menu-sep"/>;
  const kind=it.kind??"item";
  const dentro=(x:MenuItemBase)=><>{x.leadingIcon&&<Icon name={x.leadingIcon}/>}{x.label}</>;
  switch(kind){
    case "group":{
      const g=it as MenuGroupDef;
      return <BaseMenu.Group key={i}>
        {g.label&&<BaseMenu.GroupLabel className="menu-label">{g.label}</BaseMenu.GroupLabel>}
        {renderMenuItems(g.items,portal)}</BaseMenu.Group>;
    }
    case "radiogroup":{
      const g=it as MenuRadioGroupDef;
      return <BaseMenu.RadioGroup key={i} value={g.value}
        defaultValue={g.defaultValue} onValueChange={v=>g.onValueChange?.(String(v))}>
        {g.label&&<BaseMenu.GroupLabel className="menu-label">{g.label}</BaseMenu.GroupLabel>}
        {g.items.map((r,j)=><BaseMenu.RadioItem key={j} className="menu-item" value={r.value}
          disabled={r.disabled}>
          {/* O PONTO DO RÁDIO É FORMA, NÃO ÍCONE — desenhado em CSS, como o `.control-mark` do
              `Radio` já faz. Pôr um glifo aqui daria duas linguagens para a mesma marca: o rádio
              do formulário com um círculo desenhado e o do menu com um ícone de outra família. */}
          {marca(<BaseMenu.RadioItemIndicator className="menu-ponto"/>)}
          {dentro(r)}</BaseMenu.RadioItem>)}</BaseMenu.RadioGroup>;
    }
    case "submenu":{
      const sm=it as MenuSubmenuDef;
      // O submenu é uma RAIZ própria com gatilho próprio — não é um item que "abre outro menu".
      // É o que dá `aria-haspopup`, a seta para a direita e o fechamento em cascata de graça.
      return <BaseMenu.SubmenuRoot key={i}>
        <BaseMenu.SubmenuTrigger className="menu-item" disabled={sm.disabled}>
          {dentro(sm)}<Icon name="caret-right" size="sm" className="menu-seta"/>
        </BaseMenu.SubmenuTrigger>
        <BaseMenu.Portal container={portal}><BaseMenu.Positioner side="inline-end" sideOffset={4}>
          <BaseMenu.Popup className="menu">{renderMenuItems(sm.items,portal)}</BaseMenu.Popup>
        </BaseMenu.Positioner></BaseMenu.Portal></BaseMenu.SubmenuRoot>;
    }
    case "checkbox":{
      const c=it as MenuCheckboxDef;
      // O motor chama `onCheckedChange` com `(checked, detalhes)`. A Aurea passa SÓ o `checked`,
      // e isso é CONTRATO: o segundo argumento é a forma interna do Base UI, e repassá-lo faria a
      // assinatura pública da Aurea mudar junto com uma versão do motor. Mesma decisão do
      // `onValueChange` do grupo de rádio. O teste pegou: sem o embrulho, o `vi.fn()` recebia um
      // `PointerEvent` de brinde.
      return <BaseMenu.CheckboxItem key={i} className="menu-item" disabled={c.disabled}
        checked={c.checked} defaultChecked={c.defaultChecked}
        onCheckedChange={v=>c.onCheckedChange?.(v)}>
        {marca(<BaseMenu.CheckboxItemIndicator><Icon name="check" size="sm"/></BaseMenu.CheckboxItemIndicator>)}
        {dentro(c)}</BaseMenu.CheckboxItem>;
    }
    case "link":{
      const l=it as MenuLinkDef;
      return <BaseMenu.LinkItem key={i} className="menu-item" href={l.href} target={l.target}
        rel={l.rel} closeOnClick={l.closeOnClick??true}>{dentro(l)}</BaseMenu.LinkItem>;
    }
    default:{
      const a=it as MenuActionDef;
      return <BaseMenu.Item key={i} className="menu-item" disabled={a.disabled}
        onClick={a.onClick} render={a.render}>{dentro(a)}</BaseMenu.Item>;
    }
  }
})}
export function DropdownMenu({trigger,items,side="bottom",label}:{trigger:ReactElement;items:MenuEntry[];side?:OverlaySide;label?:string}){const portal=usePortalContainer();return <BaseMenu.Root><BaseMenu.Trigger render={trigger}/><BaseMenu.Portal container={portal}><BaseMenu.Positioner side={side} sideOffset={6}><BaseMenu.Popup className="menu" aria-label={label}>{renderMenuItems(items,portal)}</BaseMenu.Popup></BaseMenu.Positioner></BaseMenu.Portal></BaseMenu.Root>}
// ContextMenu: abre no botão direito e — por teclado — em Shift+F10 / tecla Menu,
// que o browser só dispara (como evento contextmenu) sobre um elemento FOCADO. Por
// isso o gatilho é focável (tabIndex 0) e tem nome acessível (auditoria 18/07/2026,
// MÉDIO 3); sem isso o teclado não alcança o menu. Consumidor pode sobrescrever
// tabIndex via children se o próprio já for focável.
export function ContextMenu({children,items,label,className}:{children:ReactNode;items:MenuEntry[];label?:string;className?:string}){const portal=usePortalContainer();return <BaseContextMenu.Root><BaseContextMenu.Trigger className={className} tabIndex={0} aria-label={label} aria-haspopup="menu">{children}</BaseContextMenu.Trigger><BaseContextMenu.Portal container={portal}><BaseContextMenu.Positioner><BaseContextMenu.Popup className="menu" aria-label={label}>{renderMenuItems(items,portal)}</BaseContextMenu.Popup></BaseContextMenu.Positioner></BaseContextMenu.Portal></BaseContextMenu.Root>}

// MENUBAR — a fila de menus de aplicação: Arquivo, Editar, Ver.
//
// Não é o `Topbar` nem uma `Toolbar` com `DropdownMenu` dentro, e a diferença não é de aparência:
// num menubar, com um menu ABERTO, a seta lateral e o ponteiro passam para o menu VIZINHO sem
// fechar e reabrir — é um único conjunto, não três gatilhos independentes. Isso é estado
// compartilhado entre os menus, e é o que o motor traz.
//
// A API é a mesma dos outros menus daqui: menu é DADO. O `renderMenuItems` é o mesmo, então um
// item de menubar e um item de menu de contexto nunca divergem de pele nem de comportamento.
// `orientation` é do MOTOR e a Aurea não expunha — a mesma família do `Tabs`, achada pela mesma
// linha da matriz do §13. E aqui ela não é só layout: numa barra VERTICAL o menu não pode abrir
// para baixo, porque abriria em cima do item seguinte da própria barra. Ele abre ao LADO, que é
// o que o padrão de menubar vertical faz e o que a barra de menu de qualquer editor faz.
// `inline-end` e não `right`: em árabe a barra fica à direita e o menu tem de abrir à esquerda
// sozinho — o resto do CSS da Aurea é lógico, e o lado do menu acompanha.
export type MenubarOrientation="horizontal"|"vertical";
// G-AXIS-06 — o valor responsivo RESOLVIDO é a única fonte de verdade: ele vai para o motor, o
// motor publica `data-orientation`/`aria-orientation` e ajusta o teclado, e a pele reage ao
// atributo publicado. Ver `decisions/0047-css-first-para-apresentacao-runtime-para-semantica.md`.
export function Menubar({menus,label,modal,disabled,loopFocus,orientation,className}:{menus:Array<{label:ReactNode;items:MenuEntry[];disabled?:boolean}>;label?:string;modal?:boolean;disabled?:boolean;loopFocus?:boolean;orientation?:Responsive<MenubarOrientation>;className?:string}){
  const portal=usePortalContainer();
  const ancora=useRef<HTMLDivElement|null>(null);
  const resolvida=useValorResponsivo(orientation,"horizontal",ancora);
  const vertical=resolvida==="vertical";
  return <BaseMenubar ref={ancora} modal={modal} disabled={disabled} loopFocus={loopFocus} orientation={resolvida} aria-label={label} className={cx("menubar",className)}>
    {menus.map((m,i)=><BaseMenu.Root key={i} disabled={m.disabled}>
      <BaseMenu.Trigger className="menubar-trigger">{m.label}</BaseMenu.Trigger>
      <BaseMenu.Portal container={portal}><BaseMenu.Positioner side={vertical?"inline-end":"bottom"} align="start" sideOffset={4}>
        <BaseMenu.Popup className="menu">{renderMenuItems(m.items)}</BaseMenu.Popup>
      </BaseMenu.Positioner></BaseMenu.Portal>
    </BaseMenu.Root>)}
  </BaseMenubar>;
}
