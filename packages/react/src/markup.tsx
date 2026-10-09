// SEM `"use client"`, e a ausência é o ponto deste arquivo — item O1 do PLANO-1.0, decidido na
// [ADR-0026](../../../decisions/0026-marcacao-pura-e-de-servidor.md).
//
// O QUE ESTÁ AQUI: os componentes que não fazem NADA que exija o navegador. Sem hook, sem
// manipulador preso em JSX, sem motor de terceiro. `cx` mais marcação. A medição está em
// `node scripts/measure-boundary.mjs`, e ela é o motivo de o arquivo existir:
//
//   importar `Card` — uma <div> com uma classe — embarcava 9 módulos e 118,5 KB de JavaScript,
//   porque `layout.js` tem a diretiva e num framework de RSC a diretiva contamina o módulo
//   INTEIRO e o fecho transitivo dele. `Prose`, que também é uma <div>, custava 123,5 KB.
//
// A PROVA DE QUE ISSO SE RESOLVE JÁ ESTAVA NO REPOSITÓRIO: o `Accordion` mora no
// `disclosure.tsx`, que nunca teve a diretiva, e importá-lo custa **0,3 KB**. Mesma natureza do
// `Card`, três ordens de grandeza de diferença — e a única distinção era o arquivo em que cada um
// tinha caído na Fase 9.
//
// POR QUE UM MÓDULO NOVO E NÃO UM `.pure` POR CATEGORIA: o precedente é o `Kbd`, e ele já estava
// escrito no `MAP.md`. Ele mora no `internal.tsx` **por dependência** (o `Button` precisa dele) e
// a casa PÚBLICA dele é `/data-display`, que o reexporta. Aqui é a mesma regra em escala: o
// arquivo é onde a coisa mora, a categoria é o que a ficha declara, e as duas não precisam
// coincidir. A taxonomia do registry não muda, e nenhuma ficha muda.
//
// A API NÃO QUEBRA. Cada módulo de categoria reexporta os seus, então
// `@aurea-uds/react/layout` continua entregando `Card`. O que muda é o `index.tsx`: ele exporta
// estes nomes EXPLICITAMENTE daqui, e é isso — e só isso — que faz
// `import {Card} from "@aurea-uds/react"` chegar como componente de SERVIDOR. Sem a linha
// explícita o nome ainda existe, vindo do módulo de categoria, e volta a ser cliente sem que
// nada reprove. O check 35 cobra a linha, e foi provado contra esse defeito exato.
//
// LIMITE DECLARADO: pelo subpath da categoria (`@aurea-uds/react/layout`) o `Card` continua
// vindo de um módulo com a diretiva, porque o `AppShell` mora lá e a diretiva é do ARQUIVO. Quem
// renderiza no servidor por SEO deve importar do barril. Separar cada categoria em duas entradas
// resolveria também esse caminho, e é mudança de fronteira pública — não entra sem o Victor.
//
// PARA QUEM VIER: componente novo só entra aqui se não chamar hook, não prender manipulador e não
// tocar motor. Na dúvida, ele NÃO entra — cliente a mais é lento, servidor a mais é quebrado.
import React, {forwardRef, type HTMLAttributes, type InputHTMLAttributes, type ReactElement,
  type ReactNode, type RefAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes} from "react";
import {cx, fundirRender, peleDoEixo, type Responsive} from "./pure.js";
// TIPO apenas: `import type` some na emissão, então isto não faz o `markup` depender de um
// módulo de cliente. O degrau do campo é o MESMO do botão de propósito (G-FORM-01).
import type {ComponentSize} from "./actions.js";
import type {SidebarItem} from "./navigation-client.js";

// Os três tipos abaixo vieram junto com os componentes que os usam. São uniões de string, então
// não custam runtime nenhum; cada módulo de categoria os reexporta para não mexer em import de
// consumidor.
// GAR-07 (ADR-0060, 09/10/2026): as oito cores de CATEGORIA — marcam grupo, não estado. Nome de
// cor, o padrão de mercado; o amarelo fica de fora porque é da marca. O nativo tem as mesmas oito.
export type BadgeCategory="red"|"orange"|"green"|"teal"|"cyan"|"blue"|"violet"|"pink";
export type BadgeVariant="neutral"|"primary"|"info"|"success"|"warning"|"danger"|"running"|"paused"|"offline"|"review"|BadgeCategory;
export type AvatarSize="sm"|"md"|"lg";
export type HeaderVariant="floating"|"flush"|"pill";
/** @deprecated `Topbar` é o nome antigo do `Header` (07/10/2026). O tipo continua valendo; use `HeaderVariant`. */
export type TopbarVariant=HeaderVariant;

// ── Layout ───────────────────────────────────────────────────────────────────────────────────
// CARTÃO INTERATIVO É ALVO, e alvo tem de ser elemento de verdade. Um cartão-alvo pode ser AÇÃO
// (<button>) ou NAVEGAÇÃO (<a href>), e o componente não pode adivinhar qual: escolher <button>
// sempre quebraria abrir-em-nova-aba num cartão-link, e `tabIndex` numa <div> daria foco sem
// papel, sem tecla e sem nome acessível — verde no gate e inútil para quem usa leitor de tela.
//
// Então quem sabe decide: `render` recebe o ELEMENTO e a Aurea funde a pele nele. É o idioma que
// o DropdownMenu, o Popover e o Combobox já usam com a Base UI, e a união discriminada abaixo
// torna a forma defeituosa IMPOSSÍVEL DE ESCREVER — `<Card variant="interactive">` sem `render`
// não compila. O gate `alvo-clicavel.spec.ts` continua lá para o que o tipo não alcança (HTML
// escrito à mão); o tipo impede o que a API produz.
//
// Isto voltou em 29/08/2026: o merge das duas linhagens ficou com a versão anterior, que era
// sempre uma <div>, e os cinco testes do `card-alvo.test.tsx` foram o que pegou.
// C-05 (24/09/2026): `padding="none"` tira o respiro interno — a imagem que encosta na borda do
// cartão. O raio 22 continua; quem recorta a imagem no raio é o `overflow:hidden` da classe. Só
// `none` entrou: `sm`/`md` não têm caso medido, e um degrau sem uso é superfície para manter.
// A-14 (24/09/2026), da especificação do `Card` aprovada pelo Victor em 22/09: `orientation=
// "horizontal"` é o modo LISTA — a mídia (`Card.Media`) à esquerda, com a largura de miniatura, e
// o conteúdo ao lado. No modo lista de um app a capa ocupava a largura toda (954 × 1.431 px) e cada
// cartão virava um pôster: um por tela. A medida é a do exemplo horizontal da referência (a imagem
// de 96, e o vão de 16), que é o nosso `--space-24`. O padrão continua vertical.
type CardBase=HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{padding?:"normal"|"none";orientation?:"vertical"|"horizontal"};
// Os literais são escritos NOS DOIS RAMOS, sem `Exclude<Alias,…>`: quem lê a assinatura pública
// vê os valores em vez de seguir dois aliases, e o `api-surface` os enxerga sem ginástica.
export type CardProps=CardBase&(
  {variant?:"base"|"raised"|"inset"|"selected"|"danger";render?:ReactElement}|
  {variant:"interactive";render:ReactElement});
export function Card({variant="base",padding="normal",orientation="vertical",className,render,...props}:CardProps){
return fundirRender(render,{className:cx("card",variant!=="base"&&`card-${variant}`,padding==="none"&&"card-flush",orientation==="horizontal"&&"card-horizontal",className),...props})}
/** A mídia do cartão — a primeira das partes da especificação do `Card` (A-14). No vertical,
 *  primeira filha, ela SANGRA até a borda de cima e dos lados; no horizontal, fica à esquerda com a
 *  largura de miniatura, dentro do respiro, com o raio que sai da conta da casa (ADR-0033: raio do
 *  cartão menos o respiro dele). O que vai dentro — `Image`, vídeo — é do app. */
function CardMedia({className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>){return <div className={cx("card-media",className)} {...props}/>}
Card.Media=CardMedia;
// ── Stack, Cluster e Grid ganham props de layout — B-01, 24/09/2026 ────────────────────────────
// A falta que mais gerou remendo num app: 180 `style={{}}` e 122 `<div>`, quase todos flex + gap.
// Os nomes `align`, `justify` e `wrap` são os MESMOS do `Cluster` nativo (R-09), de propósito.
//
// `gap` tem TRÊS degraus, e não a escala inteira — ADR-0051, decisão do Victor. A ficha do Stack
// dizia "sem prop de espaçamento: um primitivo que aceita qualquer espaçamento é como um sistema
// deixa de ter espaçamento". A regra continua valendo contra QUALQUER espaçamento; o que entrou são
// dois degraus a mais, do `--space-*`, para os dois casos medidos (a nota embaixo de um valor, a
// grade de filtros). Sem a prop, nada muda.
//
// ⚠ **Não aceitam `Responsive` ainda.** A camada responsiva gera uma regra por degrau × ponto da
// escala, e três eixos novos nos três primitivos a multiplicariam sem nenhum caso medido pedindo.
// Valor simples cobre os casos da ficha; o responsivo entra quando houver tela que peça.
export type LayoutGap="tight"|"normal"|"loose";
export type StackAlign="start"|"center"|"end"|"stretch";
export type ClusterAlign="start"|"center"|"end"|"baseline";
export type ClusterJustify="start"|"center"|"end"|"between";
type DivProps=HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>;
export interface StackProps extends DivProps{
  /** `tight` (--space-2), `normal` (o de sempre, --space-4) ou `loose` (--space-6). */
  gap?:LayoutGap;
  /** Eixo cruzado. Padrão `stretch`: os filhos ocupam a largura, como sempre. */
  align?:StackAlign;
}
export function Stack({gap,align,className,...props}:StackProps){return <div className={cx("stack",gap&&gap!=="normal"&&`stack-gap-${gap}`,align&&align!=="stretch"&&`stack-align-${align}`,className)} {...props}/>}
// SEPARATOR — a régua entre coisas. Faltava: a Aurea só tinha `.prose hr` (preso à prosa) e o
// `ToolbarSeparator` (preso ao Toolbar). Uma das referências precisa dela para a variante de seções da
// lateral, e ela serve em todo lugar.
//
// É `<hr>`, e isso é decisão medida em 18/08/2026. O motor que já usamos ENTREGA um `Separator` —
// mas ele é `'use client'`, usa hook (`useRenderElement`) e o que produz são DOIS atributos:
// `role="separator"` e `aria-orientation`. Importá-lo arrastaria este módulo para o lado cliente,
// que é o defeito da ADR-0026 (o `Card` custou 118,5 KB atravessando essa fronteira). Aqui a regra
// "se o motor entrega, não escrevemos" (BUILDING.md passo 2) PERDE para a fronteira — e o registro
// existe para a próxima sessão não "corrigir" isto de volta.
//
// `<hr>` nativo JÁ TEM `role="separator"` implícito, então escrever o papel seria ARIA redundante —
// e o APG avisa que ARIA a mais é pior que ARIA nenhuma. O papel `separator` também tem orientação
// HORIZONTAL por padrão: por isso `aria-orientation` só aparece quando é vertical.
//
// O que NÃO entrou, pelo passo 5: as três tonalidades da referência (`secondary`/`tertiary`) — a Aurea
// tem um `--border` e inventar escala de tom aqui seria copiar o sistema de token dela. E o
// separador COM RÓTULO no meio ("or", uma data numa conversa), que ela monta com
// um contêiner, as linhas e o conteúdo: é outra estrutura (o `<hr>` não carrega texto),
// ninguém pediu ainda, e fica registrado aqui como o próximo degrau se alguém precisar.
// O `Separator` SAIU daqui em 29/08/2026, e a razão é o gate que provou a decisão errada.
// Ele era um <hr> com orientação estática, e o `comportamental.multi-motor.spec.ts` — a prova
// das cinco capacidades que o Victor especificou no G-AXIS-06 — cobra dele `data-orientation`
// e `aria-orientation` RESOLVIDOS por largura de contêiner. Isso é eixo COMPORTAMENTAL: não
// sai de classe CSS, precisa de runtime, e runtime precisa de hook. Um componente que precisa
// de hook é de cliente, e é isso que a ADR-0026 manda — ela separa quem PRECISA do cliente de
// quem só caiu num módulo com a diretiva. Mora no `layout-client.tsx`.
export interface ClusterProps extends DivProps{
  /** `tight` (--space-2), `normal` (o de sempre, --space-3) ou `loose` (--space-6). */
  gap?:LayoutGap;
  /** Eixo cruzado (o vertical). Padrão `center`, como sempre. */
  align?:ClusterAlign;
  /** Eixo principal. `between` espalha o que sobrar: o nome à esquerda, o botão à direita. */
  justify?:ClusterJustify;
  /** Padrão `true`: a fila quebra linha. `false` mantém tudo numa linha só. */
  wrap?:boolean;
}
export function Cluster({gap,align,justify,wrap,className,...props}:ClusterProps){return <div className={cx("cluster",gap&&gap!=="normal"&&`cluster-gap-${gap}`,align&&align!=="center"&&`cluster-align-${align}`,justify&&justify!=="start"&&`cluster-justify-${justify}`,wrap===false&&"cluster-nowrap",className)} {...props}/>}
/**
 * A largura mínima da coluna, por nome — AN-08 (03/10/2026). A referência não tem `Grid`, e nenhum dos
 * quatro números é novo: cada um já mede uma grade ou uma caixa da Aurea (ver `.grid-min-*` no CSS).
 * `md` é o padrão de sempre.
 */
export type GridMin="xs"|"sm"|"md"|"lg";
const GRID_MIN=new Set<string>(["xs","sm","md","lg"]);
export interface GridProps extends DivProps{
  /** `tight` (--space-2), `normal` (o de sempre, --space-4) ou `loose` (--space-6). */
  gap?:LayoutGap;
  /**
   * Largura mínima de cada coluna. Por nome (AN-08): `xs` 8rem, `sm` 12rem, `md` 15rem (o padrão)
   * ou `lg` 20rem. Ou em unidade de CSS (`"10rem"`, `"155px"`) — o `--grid-min` que o CSS sempre
   * leu. Até a 0.17, `"sm"` passava pelo tipo e a grade virava UMA coluna, sem aviso.
   */
  min?:GridMin|(string&{});
  /** Número fixo de colunas, iguais. Com ele, `min` deixa de valer. */
  columns?:number;
}
export function Grid({gap,min,columns,className,style,...props}:GridProps){
  const nome=min!=null&&GRID_MIN.has(min);
  const medida=min!=null&&!nome?min:undefined;
  const vars=medida!=null||columns!=null
    ?{...(medida!=null?{"--grid-min":medida}:{}),...(columns!=null?{"--grid-cols":String(columns)}:{}),...style} as React.CSSProperties
    :style;
  return <div className={cx("grid",gap&&gap!=="normal"&&`grid-gap-${gap}`,nome&&min!=="md"&&`grid-min-${min}`,columns!=null&&"grid-fixed",className)} style={vars} {...props}/>}
/**
 * Quantas colunas da grade o item ocupa — GAR-03 (06/10/2026). Texto, e não número, porque é o
 * valor de um eixo responsivo, como `size` e `orientation`.
 */
export type GridSpan="1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12";
export interface GridItemProps extends DivProps{
  /**
   * Quantas colunas o item ocupa (GAR-03). Com `<Grid columns={12}>` é o "7 de 12" de página de
   * site. Responsivo, mobile-first: `{base: "12", viewport: {md: "7"}}` ocupa a linha inteira no
   * estreito e 7 de 12 a partir do `md`. Sem `span`, uma coluna, como qualquer filho de grade.
   */
  span?:Responsive<GridSpan>;
}
/** O item da grade que sabe quantas colunas ocupa (GAR-03). Mora em `Grid.Item`, como `Card.Media`. */
function GridItem({span,className,...props}:GridItemProps){
  return <div className={cx("grid-item",peleDoEixo("grid-span",span,"","grid-span"),className)} {...props}/>}
Grid.Item=GridItem;

// ── Página de site: Container e Section (GAR-02, GAR-04, GAR-05 — 06/10/2026) ───────────────
// A referência principal não tem nenhum dos dois. Na fila de referências, a primeira que tem o
// container usa largura máxima de 1280px e respiro de 16 que vai a 32 a partir do ponto médio, e outra tem o
// contêiner com largura máxima por ponto da escala. As seções daquela primeira são pagas e não foram
// lidas: o respiro da `Section` é escolha da Aurea, com tokens que já existem (ver o `aurea.css`).
/** A largura máxima do `Container`, pelos nomes da escala de pontos. `xl` (1280) é o padrão. */
export type ContainerSize="sm"|"md"|"lg"|"xl"|"2xl"|"full";
// `HTMLAttributes` + `RefAttributes` escritos aqui, e não o `DivProps`: o `build-api-surface` não
// enxerga as props de quem estende o `DivProps` (o `Grid` sai vazio no `api-surface.json` pelo mesmo
// motivo), e o check 11 confere o `size` da ficha contra o tipo por esse arquivo.
export interface ContainerProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement>{
  /** Até onde o conteúdo cresce: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 (padrão) · `2xl` 1536 · `full` sem teto. */
  size?:ContainerSize;
}
/**
 * A largura de leitura de uma página de SITE: centrada, com teto e o respiro dos lados que cresce
 * com a tela (16 no estreito, 32 a partir do `md`). É o que vai DENTRO de uma `Section`. O painel
 * de aplicativo continua sendo o `AppShell`.
 */
export function Container({size="xl",className,...props}:ContainerProps){
  return <div className={cx("container",size!=="xl"&&`container-${size}`,className)} {...props}/>}
/** O fundo da faixa: o da página (padrão), o de cartão ou o rebaixado. */
export type SectionSurface="background"|"card"|"inset";
/** `base` é a faixa comum; `footer` é o rodapé do site (GAR-06, 07/10/2026). */
export type SectionVariant="base"|"footer";
/** Uma coluna de links do rodapé: o título e os itens. */
export interface SectionFooterGroup{title:ReactNode;items:SidebarItem[]}
/** O respiro de cima e de baixo: `md` (padrão, 64 e 96 a partir do `md`) ou `sm` (32 e 48). */
export type SectionSpacing="sm"|"md";
export interface SectionProps extends HTMLAttributes<HTMLElement>, RefAttributes<HTMLElement>{
  surface?:SectionSurface;
  spacing?:SectionSpacing;
  /**
   * Um tema só para esta faixa (GAR-05): `"dark"` faz uma faixa escura dentro de uma página clara,
   * e o contrário. Fundo, letra e peças de dentro seguem o tema da faixa, e as regras de tema da
   * página não vazam para dentro dela.
   */
  theme?:"light"|"dark";
  /**
   * `footer` faz da faixa o RODAPÉ do site (GAR-06): `<footer>` com a marca, as colunas de links e a
   * linha legal, e o miolo já num `Container`. No celular, tudo empilha.
   */
  variant?:SectionVariant;
  /** Só no `footer`: a marca e uma frase curta, no alto à esquerda. */
  brand?:ReactNode;
  /** Só no `footer`: as colunas de links, cada uma com título. Os itens são `SidebarItem` (`id`, `label`, `href`, `render`). */
  links?:SectionFooterGroup[];
  /** Só no `footer`: a linha de baixo — direitos, termos, privacidade. */
  legal?:ReactNode;
  /** Só no `footer`: até onde o miolo cresce, pela escala do `Container`. Padrão: `xl`. */
  maxWidth?:ContainerSize;
  /** Só no `footer`: o nome da navegação do rodapé para o leitor de tela. Padrão: `"Footer"`. */
  navLabel?:string;
}
/**
 * A faixa de ponta a ponta de uma página de site (GAR-04): `<section>` com fundo e respiro de site.
 * O conteúdo vai dentro de um `Container`. Dê um nome à faixa (`aria-labelledby` no título dela)
 * quando ela for uma região que o leitor de tela deva listar.
 */
// GAR-06 (07/10/2026): o rodapé de site é uma VARIAÇÃO da Section (regra do Victor: peça nova entra
// como variação), porque o rodapé é a última faixa da página: herda o fundo (`surface`), o respiro
// (`spacing`) e o tema próprio (`theme` — rodapé escuro numa página clara). Nenhuma referência da
// fila tem um rodapé aberto; o desenho é da Aurea, com tokens que já existem. Os links de cada
// coluna são `SidebarItem`, a mesma forma dos menus, e o `render` leva o link do roteador.
export function Section({surface="background",spacing="md",theme,variant="base",brand,links,legal,maxWidth="xl",navLabel="Footer",children,className,...props}:SectionProps){
  const pele=cx("section",surface!=="background"&&`section-${surface}`,spacing!=="md"&&`section-spacing-${spacing}`);
  if(variant!=="footer")return <section data-theme={theme} className={cx(pele,className)} {...props}>{children}</section>;
  return <footer data-theme={theme} className={cx(pele,"section-footer",className)} {...props}>
    <div className={cx("container",maxWidth!=="xl"&&`container-${maxWidth}`)}>
      <div className="section-footer-top">
        {brand!=null&&<div className="section-footer-brand">{brand}</div>}
        {links&&links.length>0&&<nav className="section-footer-nav" aria-label={navLabel}>{links.map((g,n)=><div className="section-footer-group" key={n}>
          <h2 className="section-footer-title">{g.title}</h2>
          <ul className="section-footer-links">{g.items.map(it=><li key={it.id}>{it.render
            ?fundirRender(it.render,{className:"section-footer-link",children:it.label},"a")
            :<a className="section-footer-link" href={it.href}>{it.label}</a>}</li>)}</ul>
        </div>)}</nav>}
        {children}
      </div>
      {legal!=null&&<div className="section-footer-legal">{legal}</div>}
    </div>
  </footer>;
}

// ── Data Display ─────────────────────────────────────────────────────────────────────────────
// GAR-09 + MNT-04 (ADR-0060, 09/10/2026). A referência principal não tem KPI no grátis; o modelo é o
// de mercado (alta, baixa, estável). A DIREÇÃO desenha a seta e diz a palavra ao leitor de tela, e
// a cor vem junto, nunca sozinha: sem `direction`, `tone` não pinta nada. `tone` existe para o caso
// em que subir é ruim (custo, erro). `variant="plain"` tira a caixa, para o número dentro de um
// cartão (MNT-04) — como o `panel="plain"` do `Tabs`.
// A seta é a do Phosphor desenhada por MÁSCARA no CSS, como o menu do `Header`: o `Icon` lê o
// sprite por hook, e o KPI é marcação pura, sem JavaScript no navegador (ADR-0026).
export type KPIDirection="up"|"down"|"flat";
export type KPITone="success"|"danger"|"neutral";
export type KPIVariant="card"|"plain";
const TOM_DA_DIRECAO:Record<KPIDirection,KPITone>={up:"success",down:"danger",flat:"neutral"};
const PALAVRA_DA_DIRECAO:Record<KPIDirection,string>={up:"Up",down:"Down",flat:"No change"};
export interface KPIProps extends HTMLAttributes<HTMLDivElement>,RefAttributes<HTMLDivElement>{
  label:ReactNode;
  value:ReactNode;
  /** A mudança, como texto do domínio ("+8% no mês"). */
  trend?:ReactNode;
  /** Para onde foi. Desenha a seta, pinta a tendência e diz a palavra ao leitor de tela. */
  direction?:KPIDirection;
  /** A cor da tendência. Padrão: alta = `success`, baixa = `danger`, estável = `neutral`. */
  tone?:KPITone;
  /** A palavra que o leitor de tela ouve antes da tendência. Padrão em inglês: "Up", "Down", "No change". */
  directionLabel?:string;
  /** `plain` tira a caixa: o número dentro de um cartão que já existe. */
  variant?:KPIVariant;
}
export function KPI({label,value,trend,direction,tone,directionLabel,variant="card",className,...props}:KPIProps){
  const tom=direction?(tone??TOM_DA_DIRECAO[direction]):undefined;
  const miolo=<><span className="muted">{label}</span><strong>{value}</strong>
    {(trend||trend===0||direction)&&<small className={direction?cx("kpi-trend",`kpi-trend-${direction}`,`kpi-tone-${tom}`):undefined}>
      {direction&&<span className="kpi-trend-icon" aria-hidden="true"/>}
      {direction&&<span className="sr-only">{directionLabel??PALAVRA_DA_DIRECAO[direction]}</span>}
      {trend}</small>}</>;
  return variant==="plain"?<div className={cx("kpi",className)} {...props}>{miolo}</div>
    :<Card className={cx("kpi",className)} {...props}>{miolo}</Card>;
}
export function DataList({items}:{items:Array<{term:ReactNode;value:ReactNode}>}){return <dl className="data-list">{items.map((i,n)=><React.Fragment key={n}><dt>{i.term}</dt><dd>{i.value}</dd></React.Fragment>)}</dl>}
export function Timeline({items}:{items:Array<{title:ReactNode;description?:ReactNode;time?:ReactNode}>}){return <ol className="timeline">{items.map((i,n)=><li key={n}><span className="timeline-dot"/><div><strong>{i.title}</strong>{i.description&&<p>{i.description}</p>}{i.time&&<small className="muted">{i.time}</small>}</div></li>)}</ol>}
// Prose (item L5): UMA LINHA, e é para ser mesmo — quem transforma Markdown em elementos é o
// consumidor. A trava do item é no CSS, escopada em `.prose`, e há prova dela no `skin.spec`.
// Segurança, porque é o caminho de uso mais provável: quem entrega HTML de terceiro por
// `dangerouslySetInnerHTML` tem de SANITIZAR antes. A Aurea desenha o texto; ela não pode decidir
// o que é seguro renderizar. Está dito na ficha, em voz alta.
export function Prose({className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>){return <div className={cx("prose",className)} {...props}/>}

// ── Tipografia: Text, Heading, Paragraph e Code — B-02, 25/09/2026 ─────────────────────────────
// No molde da referência (o componente de tipografia e os atalhos `Heading`, `Paragraph`, `Code`),
// por ordem do Victor: a referência sempre primeiro. A forma é a dela — uma LISTA FECHADA de papéis, e não
// tamanhos soltos: quem usa escolhe "título 2", nunca "25px". É a resposta de fundação à ordem de
// 19/09/2026, "existem variações demais". Os números são nossos, todos de token (`aurea.css`,
// bloco TIPOGRAFIA). Como na referência, o `Text` não troca de elemento: é um `<span>`; parágrafo,
// título e código têm peça própria, com o elemento certo para o leitor de tela.
export type TypographyType="body"|"body-sm"|"body-xs"|"code"|"h1"|"h2"|"h3"|"h4"|"h5"|"h6";
export type TypographyColor="default"|"muted";
export type TypographyWeight="normal"|"medium"|"semibold"|"bold"|"extrabold";
export type TypographyAlign="start"|"center"|"end"|"justify";
export type HeadingLevel=1|2|3|4|5|6;
export type ParagraphSize="base"|"sm"|"xs";
interface TypographyBase{align?:TypographyAlign;color?:TypographyColor;weight?:TypographyWeight;truncate?:boolean;
  /** GAR-16 (0.28.0): algarismos da mesma largura — para número que alinha em coluna (preço, ano,
   *  ficha técnica) ou que muda na tela. Desligado por padrão: no texto corrido o "1" estreito é o certo. */
  numeric?:boolean}
const tipografia=(tipo:TypographyType,{align,color,weight,truncate,numeric}:TypographyBase,className?:string)=>
  cx("typography",`typography-${tipo}`,color==="muted"&&"typography-muted",weight&&`typography-weight-${weight}`,align&&`typography-align-${align}`,truncate&&"typography-truncate",numeric&&"typography-numeric",className);
export interface TextProps extends Omit<HTMLAttributes<HTMLSpanElement>,"color">,RefAttributes<HTMLSpanElement>,TypographyBase{type?:TypographyType}
export function Text({type="body",align,color,weight,truncate,numeric,className,...props}:TextProps){return <span className={tipografia(type,{align,color,weight,truncate,numeric},className)} {...props}/>}
export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>,"color">,RefAttributes<HTMLHeadingElement>,TypographyBase{level?:HeadingLevel}
// O nível decide o elemento E o tamanho, como na referência: um `h2` tem a cara de título 2.
export function Heading({level=1,align,color,weight,truncate,numeric,className,...props}:HeadingProps){const Tag=`h${level}` as "h1";return <Tag className={tipografia(`h${level}`,{align,color,weight,truncate,numeric},className)} {...props}/>}
export interface ParagraphProps extends Omit<HTMLAttributes<HTMLParagraphElement>,"color">,RefAttributes<HTMLParagraphElement>,TypographyBase{size?:ParagraphSize}
export function Paragraph({size="base",align,color,weight,truncate,numeric,className,...props}:ParagraphProps){return <p className={tipografia(size==="base"?"body":`body-${size}`,{align,color,weight,truncate,numeric},className)} {...props}/>}
export interface CodeProps extends Omit<HTMLAttributes<HTMLElement>,"color">,RefAttributes<HTMLElement>,TypographyBase{}
export function Code({align,color,weight,truncate,className,...props}:CodeProps){return <code className={tipografia("code",{align,color,weight,truncate},className)} {...props}/>}

// ── Feedback ─────────────────────────────────────────────────────────────────────────────────
// ── BADGE ────────────────────────────────────────────────────────────────────────────────────
// Reescrito em 17/08/2026 lendo, no fonte local, o selo de uma das referências e o
// de outra. O anterior era UMA forma, UM tamanho e seis cores — e o Victor tinha razão: pobre.
//
// AS DUAS PEÇAS QUE AS REFERÊNCIAS CHAMAM PELO MESMO NOME, e que aqui viram UM componente:
//   • o CHIP  — duas das referências e o nosso de antes: metadado curto numa pílula.
//   • o SOBREPOSTO — a segunda dessas duas referências: contador no canto de OUTRA coisa (sino, avatar, item de menu).
// A chave é `anchor`. Sem ela, `children` é o conteúdo do chip — o uso de sempre, intacto. Com
// ela, `children` é o que se decora e o conteúdo vem de `count`/`content`/`dot`.
//
// `leading`/`trailing` são NÓ, não `IconName`, e isto não é preguiça de tipo: o `Icon` mora num
// módulo com `"use client"` (ele lê o sprite por hook), e este arquivo não tem a diretiva de
// propósito — ADR-0026. Um `Badge` que importasse `Icon` voltaria a custar os 118,5 KB que o
// item O1 tirou. Quem passa o glifo é quem já está no cliente.
//
// O QUE NÃO ENTROU, e as duas razões batem: **botão de fechar**. Pela `DIRECTION.md` §3.6, chip
// removível é `Tag`, não `Badge` — e um manipulador em JSX exigiria `"use client"` aqui, que é
// exatamente o que este arquivo existe para não ter. `Tag` não existe na Aurea: é lacuna de
// verdade, achada por esta leitura, e está registrada no REFERENCES.md.
export type BadgeEmphasis="soft"|"solid"|"outline";
export type BadgeSize="xs"|"sm"|"md"|"lg";
export type BadgePlacement="top-end"|"top-start"|"bottom-end"|"bottom-start";
// R-01 (24/09/2026): `content` põe o selo do tamanho do texto DENTRO de uma coluna. O padrão
// segue o recipiente — medido: numa `.stack` o `.badge` estica (300 px numa coluna de 300), porque
// ela não declara `align-items`. O mesmo acontece no nativo; a prop é igual nos dois alvos.
export type BadgeFit="auto"|"content";
// `max` com `+` é o idioma universal do contador (três das referências o usam). Exportada porque quem
// escreve o nome acessível precisa do MESMO texto — "99+ unread" tem de bater com o que se vê.
export function formatBadgeCount(count:number,max=99){return count>max?`${max}+`:String(count)}
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>,RefAttributes<HTMLSpanElement>{
  variant?:BadgeVariant;
  /** `soft` é o tom de sempre; `solid` preenche com o acento; `outline` é só contorno. */
  emphasis?:BadgeEmphasis;
  size?:BadgeSize;
  /** Ponto de estado antes do texto. Sozinho num `anchor`, ele É o badge. */
  dot?:boolean;
  leading?:ReactNode;
  trailing?:ReactNode;
  /** Foto redonda no início — o selo com imagem da referência. */
  image?:string;
  imageAlt?:string;
  /** Conteúdo numérico. Passa por `max` e some em zero, salvo `showZero`. */
  count?:number;
  max?:number;
  showZero?:boolean;
  /** `content`: do tamanho do texto mesmo numa coluna. Padrão `auto`, que segue o recipiente. */
  fit?:BadgeFit;
  /** Liga o modo SOBREPOSTO e escolhe o canto. `children` passa a ser o que se decora. */
  anchor?:BadgePlacement;
  /** `circle` recolhe o canto em 14% — é a sobreposição circular da referência, para avatar redondo. */
  anchorShape?:"square"|"circle";
  /** Esconde sem tirar o filho do lugar. */
  invisible?:boolean;
  /** Conteúdo do badge no modo sobreposto (no modo chip, quem manda é `children`).
   *  Chama-se assim, e não `content`, porque este colide com o atributo HTML de mesmo nome. */
  badgeContent?:ReactNode;
}
export function Badge({variant="neutral",emphasis="soft",size="md",dot,leading,trailing,image,imageAlt,count,max=99,showZero,fit="auto",anchor,anchorShape="square",invisible,badgeContent,children,className,...props}:BadgeProps){
  const numero=count!=null?formatBadgeCount(count,max):undefined;
  const miolo=anchor?(numero??badgeContent):(numero??children);
  // Ponto puro: `dot` sem nada para mostrar. Aí o badge não tem conteúdo, e ganha medida própria.
  const soPonto=!!dot&&miolo==null;
  const chip=<span
    className={cx("badge",variant!=="neutral"&&`badge-${variant}`,emphasis!=="soft"&&`badge-${emphasis}`,
      size!=="md"&&`badge-${size}`,fit==="content"&&!anchor&&"badge-fit",
      anchor&&`badge-overlay badge-at-${anchor}`,anchor&&anchorShape==="circle"&&"badge-on-circle",
      anchor&&soPonto&&"badge-is-dot",className)}
    {...props}>
    {dot&&!soPonto&&<span className="badge-dot"/>}
    {image&&<img className="badge-image" src={image} alt={imageAlt??""}/>}
    {leading}
    {miolo}
    {trailing}
  </span>;
  if(!anchor)return chip;
  // Some em zero por padrão, como na referência: caixa de entrada zerada não merece um "0" no canto.
  const escondido=invisible||(count===0&&!showZero)||(miolo==null&&!dot);
  // `aria-hidden` no contador, e o número vai para o nome de QUEM É DECORADO — regra da própria
  // documentação da referência e das três fontes de acessibilidade lidas em 17/08/2026. Sem isso, o
  // botão do sino é anunciado "sino 8" e ninguém sabe o que é o 8.
  return <span className="badge-anchor">{children}{!escondido&&React.cloneElement(chip,{"aria-hidden":true})}</span>;
}
/** O tom da barra: a mesma lista fechada do `ButtonTone`. Pausado é `neutral`; falha é `danger`. */
export type ProgressTone="brand"|"neutral"|"success"|"warning"|"danger"|"info";
export interface ProgressProps{
  /** 0 a 100; fora disso é grampeado. **Sem `value`, a barra é indeterminada** (AN-07): o total
   *  ainda não se sabe, e um pedaço corre pelo trilho, no lugar de um 0% que parece parado. */
  value?:number;
  /** O nome que o leitor de tela anuncia. Não aparece. */
  label?:string;
  /** O texto de apoio, no alto à direita — a saída de texto da barra de progresso da referência: velocidade, tempo
   *  que falta, bytes. Em texto, vai junto no `aria-valuetext`. */
  detail?:ReactNode;
  tone?:ProgressTone;
  className?:string;
}
// AN-07 (03/10/2026). Tudo novo é acréscimo: com `value` e sem `detail` nem `tone`, a marcação é a
// de antes, mais a classe da caixa de fora. A anatomia é a da barra de progresso da referência: a
// saída no alto à direita, o trilho embaixo, e sem `aria-valuenow` quando não há total.
export function Progress({value,label,detail,tone="brand",className}:ProgressProps){
  const semTotal=value==null||Number.isNaN(value);
  const pct=semTotal?undefined:Math.max(0,Math.min(100,value));
  const temApoio=detail!=null&&detail!==false&&detail!=="";
  // Texto vai no `aria-valuetext`, e o desenho dele sai do leitor de tela para não ser lido duas
  // vezes. Apoio que não é texto (um ícone, um link) fica onde está, para o leitor achar sozinho.
  const emTexto=temApoio&&(typeof detail==="string"||typeof detail==="number")?String(detail):undefined;
  const valuetext=emTexto==null?undefined:pct==null?emTexto:`${pct}%, ${emTexto}`;
  return <div className={cx("progress-field",className)}>
    {temApoio&&<div className="progress-detail" aria-hidden={emTexto!=null||undefined}>{detail}</div>}
    <div className={cx("progress",semTotal&&"progress-indeterminate",tone!=="brand"&&`progress-tone-${tone}`)} role="progressbar"
      aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={valuetext}>
      <span style={pct==null?undefined:{width:`${pct}%`}}/></div>
  </div>}
export function Skeleton({className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>){return <div className={cx("skeleton",className)} aria-hidden="true" {...props}/>}

// ── Identity ─────────────────────────────────────────────────────────────────────────────────
// `React.Children` não é hook — é utilitário de leitura de `children`, e roda no servidor.
export function AvatarGroup({children,max,total,label,size,className}:{children:ReactNode;max?:number;total?:number;label?:string;size?:Responsive<AvatarSize>;className?:string}){
  const itens=React.Children.toArray(children);
  const mostra=max?itens.slice(0,max):itens;
  const resto=(total??itens.length)-mostra.length;
  return <div role="group" aria-label={label} className={cx("avatar-group",className)}>
    {mostra}
    {resto>0&&<span className={cx("avatar","avatar-count",peleDoEixo("avatar",size))} aria-hidden="true">+{resto}</span>}
  </div>}

// ── Code ─────────────────────────────────────────────────────────────────────────────────────
// O NÍVEL É MODIFICADOR DA CÉLULA, não classe na linha. O core pinta `.log-level.warn`, e a
// regra descendente que pintava a partir de uma classe no container (`.log-warn .log-level`)
// saiu do CSS de propósito — o comentário dela dizia, com todas as letras, que servia a um
// arquivo que não existe mais. O merge das duas linhagens ficou com o React da versão antiga
// contra o CSS da nova: `log-warn` era emitido e ninguém o pintava, e `.log-level` saía sem
// modificador nenhum. Os dois testes do `grade-do-core.test.tsx` pegaram os dois lados.
//
// `<time>` fica: é a semântica certa para a hora, e o core casa pela CLASSE, não pela tag.
export function LogStream({lines}:{lines:Array<{time?:string;level?:string;text:string}>}){return <div className="log-stream" role="log" aria-live="polite">{lines.map((l,n)=><div key={n} className="log-line"><time className="log-time">{l.time}</time><span className={cx("log-level",l.level&&l.level.toLowerCase())}>{l.level}</span><span>{l.text}</span></div>)}</div>}

// ── Media ────────────────────────────────────────────────────────────────────────────────────
export function MediaPlayerShell({children,className,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>){return <div className={cx("media-player",className)} {...props}>{children}</div>}

// ── Navigation ───────────────────────────────────────────────────────────────────────────────
// HEADER — o nome era `Topbar` até 07/10/2026. O Victor mandou trocar pelo nome de mercado: no
// catálogo que reúne 38 design systems, "Header" é o de 16; "Topbar"/"Top bar", de 2. O nome
// antigo NÃO sai (regra dele: componente não se exclui) — `Topbar` continua, logo abaixo, como o
// mesmo componente. As classes `.topbar*` também ficam: trocar quebraria quem as usa no CSS.
//
// B-07 (24/09/2026): `divider` põe a linha de baixo na `flush`. Ela é fundo igual ao da página e
// gruda no topo; sem linha, o conteúdo passa por baixo dela e nada diz onde a barra acaba. Só na
// `flush`: a `floating` e a `pill` são caixas com borda própria.
//
// GAR-01 (07/10/2026): o CABEÇALHO DE SITE é este componente com quatro props a mais, e não uma
// peça nova (regra do Victor: peça nova entra como variação). A referência principal tirou o dela
// na versão atual e publicou como montar um; dele vêm a altura (64, o `--topbar-height`), o
// `aria-current="page"` no item atual com a cor de destaque, e o menu do celular abaixo de 768.
//   • `items` é a MESMA lista do `Sidebar` e do `BottomNav` (`SidebarItem`): o app não mantém duas
//     listas do mesmo menu. Daqui só se usam `id`, `label`, `href` e `render`; subitens, ícone e
//     `onClick` ficam de fora — a barra é plana, e marcação pura não prende manipulador.
//   • O MENU DO CELULAR é um POPOVER nativo, sem JavaScript: o botão é o `popovertarget` e o painel
//     é o `<nav popover="auto">`, o mesmo mecanismo da gaveta do `AppShell`. Os links descem num
//     painel logo abaixo da barra. Era um `<details>` na primeira versão do K2; o Victor escolheu o
//     popover (07/10/2026, opção "B") depois da medição nos três motores: com o `<details>` nem o
//     Esc nem o toque fora fechavam o painel; com o popover os dois fecham, o Esc devolve o foco ao
//     botão, e o Tab depois do botão entra no painel (medido também no WebKit 26.5, com o painel
//     aberto pelo teclado — o defeito da ADR-0019 não se repete aqui). O `Header` continua de
//     servidor. Limite declarado: em app com rota no cliente, o painel não fecha sozinho ao trocar
//     de página — dê ao `Header` uma `key` que mude com a rota.
//   • O `id` do painel é FIXO (`aurea-header-menu`), como o da gaveta do `AppShell`: marcação pura
//     não chama `useId` (o check 26 exigiria a diretiva de cliente no arquivo inteiro). Página com
//     dois cabeçalhos de site passa um `menuId` diferente para cada um.
//   • `maxWidth` alinha o miolo da barra com o `Container` da página, pela mesma escala.
export interface HeaderProps extends HTMLAttributes<HTMLElement>, RefAttributes<HTMLElement>{
  /** A pele: `floating` (caixa solta), `flush` (encostada, o fundo da página) ou `pill` (cápsula). */
  variant?:HeaderVariant;
  /** A marca. No `AppShell`, é aqui que entra também o botão que abre a lateral. */
  brand?:ReactNode;
  /** Só na `flush` (B-07): a linha embaixo da barra. */
  divider?:boolean;
  /**
   * Os links do site (GAR-01) — a mesma lista do `Sidebar` e do `BottomNav`. No celular (abaixo
   * de 768) eles saem da barra e entram no painel do botão de menu.
   */
  items?:SidebarItem[];
  /** O `id` do item da página atual: ganha `aria-current="page"` e a cor de destaque. */
  current?:string;
  /** O que fica do lado direito: busca, botão de ação, conta. Fica na barra também no celular. */
  actions?:ReactNode;
  /** Até onde o miolo da barra cresce, pela escala do `Container` (`sm` 640 … `2xl` 1536, `full`). */
  maxWidth?:ContainerSize;
  /** O nome da navegação para o leitor de tela. Padrão: `"Main"`. */
  navLabel?:string;
  /** O nome do botão de menu do celular. Padrão: `"Menu"`. */
  menuLabel?:string;
  /** O `id` do painel do celular. Padrão: `"aurea-header-menu"`. Troque só se a página tiver dois cabeçalhos de site. */
  menuId?:string;
}
// O item da barra e o do painel são o MESMO elemento com a mesma pele: o atual é o atual nos dois.
function linksDoHeader(items:SidebarItem[],current:string|undefined){
  return <ul className="topbar-links">{items.map(it=>{
    const p={className:"topbar-link","aria-current":it.id===current?"page" as const:undefined,children:it.label};
    return <li key={it.id}>{it.render?fundirRender(it.render,p,"a"):<a href={it.href} {...p}/>}</li>;
  })}</ul>;
}
export function Header({variant="floating",divider,brand,items,current,actions,maxWidth,navLabel="Main",menuLabel="Menu",menuId="aurea-header-menu",children,className,...props}:HeaderProps){
  const site=!!items&&items.length>0;
  const miolo=<>
    {brand!=null&&<div className="brand">{brand}</div>}
    {site&&<nav className="topbar-nav" aria-label={navLabel}>{linksDoHeader(items!,current)}</nav>}
    {children}
    {actions!=null&&<div className="topbar-actions">{actions}</div>}
    {site&&<>
      <button type="button" className="btn btn-ghost btn-icon topbar-menu-toggle" popoverTarget={menuId} aria-label={menuLabel}><span className="topbar-menu-icon" aria-hidden="true"/></button>
      <nav id={menuId} popover="auto" className="topbar-menu-panel" aria-label={navLabel}>{linksDoHeader(items!,current)}</nav>
    </>}
  </>;
  return <header className={cx("topbar",`topbar-${variant}`,divider&&variant==="flush"&&"topbar-divider",site&&"topbar-site",maxWidth&&"topbar-contained",className)} {...props}>
    {maxWidth?<div className={cx("container",maxWidth!=="xl"&&`container-${maxWidth}`,"topbar-inner")}>{miolo}</div>:miolo}
  </header>;
}
/** @deprecated `Topbar` é o nome antigo do `Header` (07/10/2026). Continua funcionando, igual; use `Header`. */
export function Topbar(props:HeaderProps){return <Header {...props}/>}

// ── System / interno ─────────────────────────────────────────────────────────────────────────
// Kbd — representação de tecla/atalho. <kbd> é o elemento HTML certo; a pele é nossa. Ele já
// morava fora da casa dele (no `internal.tsx`, por causa do `Button`); agora mora aqui, pelo
// mesmo motivo elevado a regra.
export function Kbd({children,className,...props}:HTMLAttributes<HTMLElement>&RefAttributes<HTMLElement>){return <kbd className={cx("kbd",className)} {...props}>{children}</kbd>}

// ── Inputs ───────────────────────────────────────────────────────────────────────────────────
// Os seis controles abaixo NÃO prendem manipulador nenhum: quem escuta `onChange` é o consumidor,
// e por isso eles são marcação. O `Field`, o `Input` e o `Combobox` ficaram no `inputs.tsx` —
// aqueles chamam hook de verdade.
// O `Select` SAIU DAQUI em 24/09/2026 e mora no `inputs-client.tsx`. Ele era o `<select>` nativo,
// e a lista que o nativo abre é do sistema operacional — CSS de autor não a alcança. O Victor mandou
// trocar: "tudo deve ser padrão aurea". Pele própria na lista exige motor, e motor exige cliente.
// O textarea não tem `size` no HTML (tem rows/cols), então aqui não há nada a tirar.
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>,RefAttributes<HTMLTextAreaElement>{size?:Responsive<FieldSize>}
export const Textarea=forwardRef<HTMLTextAreaElement,TextareaProps>(function Textarea({className,size,...props},ref){return <textarea ref={ref} className={cx("textarea",peleDoEixo("textarea",size),className)} {...props}/>});
// `size` nos três marcáveis pela mesma razão do campo: uma linha de formulário com um campo `sm`
// e um checkbox de tamanho fixo ao lado desalinha. O degrau vai na MARCA, não no rótulo.
export function Checkbox({label,labelHidden,description,size,className,...props}:Omit<InputHTMLAttributes<HTMLInputElement>,"size">&RefAttributes<HTMLInputElement>&{label:ReactNode;labelHidden?:boolean;description?:ReactNode;size?:Responsive<FieldSize>}){return <label className={cx("checkbox",labelHidden&&"checkbox-bare",className)}><input type="checkbox" {...props}/><span className={cx("control-mark",peleDoEixo("control-mark",size))}/><span className={labelHidden?"sr-only":undefined}><strong>{label}</strong>{description&&<><br/><span className="muted">{description}</span></>}</span></label>}
export function Radio({label,size,className,...props}:Omit<InputHTMLAttributes<HTMLInputElement>,"size">&RefAttributes<HTMLInputElement>&{label:ReactNode;size?:Responsive<FieldSize>}){return <label className={cx("radio",className)}><input type="radio" {...props}/><span className={cx("control-mark",peleDoEixo("control-mark",size))}/>{label}</label>}
export function Switch({label,size,className,...props}:Omit<InputHTMLAttributes<HTMLInputElement>,"size">&RefAttributes<HTMLInputElement>&{label:ReactNode;size?:Responsive<FieldSize>}){return <label className={cx("switch",className)}><input type="checkbox" role="switch" {...props}/><span className={cx("switch-track",peleDoEixo("switch-track",size))}/><span>{label}</span></label>}
// `orientation` no `<input type=range>` NATIVO — a vertical não exige trocar de motor, e isso foi
// medido nos três navegadores. Sem `aria-orientation`: o papel `slider` é implícito do elemento e
// o navegador já anuncia a orientação a partir do writing-mode; pôr o atributo à mão criaria uma
// segunda fonte de verdade que pode divergir do que o CSS fez.
export type RangeOrientation="horizontal"|"vertical";
export function Range({orientation,className,...props}:InputHTMLAttributes<HTMLInputElement>&RefAttributes<HTMLInputElement>&{orientation?:Responsive<RangeOrientation>}){return <input className={cx("range",peleDoEixo("range",orientation,"horizontal","range"),className)} type="range" {...props}/>}

// ── PORTADO da linhagem da ATIVIDADE-2 no merge de 28/08/2026 ────────────────────────────────
// Estes cinco não existiam em lugar nenhum da `main`. Entram no `markup` e não no `-client`
// porque nenhum deles usa hook: são marcação e `cx`, então chegam como componente de SERVIDOR,
// que é o ganho do item O1.

// TAMANHO DE CAMPO (G-FORM-01). Três degraus, que é onde as referências convergem: uma
// dá sm/md/lg ao input e ao select, outra dá small/medium ao campo base. Não são os cinco do
// botão — campo com xs não cabe texto digitável, e xl é caixa de busca de página inteira, que é
// composição e não tamanho. `Extract` em vez de união solta para o degrau ser O MESMO do botão:
// um `sm` de campo e um `sm` de botão ao lado têm de medir igual (§23 e §132 da ATIVIDADE-2).
export type FieldSize=Extract<ComponentSize,"sm"|"md"|"lg">;
// `md` é a classe base — não existe `.input-md`, como não existe `.btn-md`. O prefixo é escrito
// literal em cada chamada (`input-${size}`, e não `${base}-${size}`) porque é assim que o check 15
// enxerga uma classe montada em tempo de execução; com prefixo dinâmico ele para de proteger a
// fronteira do core justamente nas classes novas.

// RÓTULO avulso. O `Field` já traz o dele, e é o caminho normal; este existe para quem monta o
// próprio campo — uma linha de tabela editável, um filtro que não é um `Field`. Sem ele, quem sai
// do `Field` escreve um `<label>` cru e perde a pele.
export function Label({htmlFor,className,children,...props}:HTMLAttributes<HTMLLabelElement>&RefAttributes<HTMLLabelElement>&{htmlFor?:string}){return <label htmlFor={htmlFor} className={cx("label",className)} {...props}>{children}</label>}

// `orientation` (G-AXIS-01): a linha do formulário de configurações — rótulo à esquerda,
// controle à direita — só saía da Aurea com CSS ad hoc. Uma das referências tem um terceiro valor,
// `responsive`, que NÃO entrou aqui e a ausência é medida: lá ele depende de uma container query
// com contêiner NOMEADO, declarado por um componente de grupo de campos que a Aurea
// não tem. Um elemento não consulta o próprio tamanho, então `responsive` sem esse componente
// seria media query de viewport — que responde a pergunta errada, porque quem aperta o campo é o
// cartão em volta dele, não a janela. Fica em `G-AXIS-02`.

// DOIS EIXOS INDEPENDENTES, e a separação é o coração da ADR-0048.
//
//   side    ESTRUTURAL   — o adorno pertence antes ou depois do controle. Decide o DOM, decide a
//                          ordem de foco, e por isso NÃO é responsivo: trocar `start`/`end` por
//                          largura mudaria a sequência lógica, que é outra coisa.
//   layout  VISUAL       — ao lado ou em faixa própria. É geometria pura, e é o que responde a
//                          espaço: `inline ↔ block` não mexe em ordem nenhuma.
//
// Substituiu o `align` de quatro valores em 22/08/2026 (quebra registrada no CHANGELOG). A
// migração é mecânica: `inline-start` → `side="start" layout="inline"`, e assim por diante.
export type AddonSide="start"|"end";
export type AddonLayout="inline"|"block";

function ladoDoAdorno(no:ReactNode):"start"|"end"|null{
  if(!React.isValidElement(no))return null;
  const p=no.props as {side?:AddonSide};
  return no.type===InputGroupAddon?(p.side??"start"):null;
}

// A-08 (24/09/2026): `width` tira o grupo dos 100% — `"20rem"` para uma medida, `"auto"` para o
// tamanho do conteúdo. Sem ela, 100% como sempre. Com ela, o grupo também deixa de crescer numa
// fila (`flex:none`): o `flex:1` que as barras dão a ele desfaria a medida pedida.
export function InputGroup({className,children,width,style,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{width?:string}){
const filhos=React.Children.toArray(children);
const inicio=filhos.filter(f=>ladoDoAdorno(f)==="start");
const fim=filhos.filter(f=>ladoDoAdorno(f)==="end");
const meio=filhos.filter(f=>ladoDoAdorno(f)===null);
return <div className={cx("input-group",className)} style={width!=null?{inlineSize:width,flex:"none",...style}:style} {...props}>{[...inicio,...meio,...fim]}</div>}

// `layout` é responsivo, e a triagem que o autorizou está no `G-AXIS-07`: com o adorno em linha,
// a 200px de caixa sobram 48% da largura para o campo; com ele em faixa, 99%. Não é preferência
// de desenho — é o campo deixar de caber.
//
// `padrao: ""` porque as duas geometrias têm regra própria: um `inline` que não emitisse classe
// ficaria sem o recuo, que mora na regra composta `.…-inline.…-start`.
export function InputGroupAddon({side="start",layout="inline",className,children,...props}:HTMLAttributes<HTMLSpanElement>&RefAttributes<HTMLSpanElement>&{side?:AddonSide;layout?:Responsive<AddonLayout>}){
return <span className={cx("input-group-addon",`input-group-addon-${side}`,peleDoEixo("input-group-addon",layout,"","input-group-addon"),className)} {...props}>{children}</span>}

// PORTADO no merge de 28/08/2026: não existia na `main`, e a pele (`.aspect-ratio`) veio junto
// no core. Marcação pura — uma linha de CSS —, então é servidor.
// PROPORÇÃO FIXA. Quatro referências têm. Hoje é uma linha de CSS — `aspect-ratio` é suportado em
// todo navegador que a Aurea alcança —, e ainda assim é componente: sem ele cada consumidor
// escreve o `padding-top: 56.25%` de 2015, ou esquece o `min-width: 0` que impede a caixa de
// estourar dentro de um grid.
export function AspectRatio({ratio=1,className,style,...props}:HTMLAttributes<HTMLDivElement>&RefAttributes<HTMLDivElement>&{ratio?:number}){return <div className={cx("aspect-ratio",className)} style={{aspectRatio:ratio,...style}} {...props}/>}
