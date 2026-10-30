import React, { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type Orientation, type Responsive } from "./pure.js";
import { type IconButtonProps } from "./actions.js";
import { type HeaderVariant, type HeaderTab, type SidebarVariant, type SidebarScrollbar, type SidebarEntry, type SidebarCollapsible, type SidebarIndicator } from "./navigation.js";
declare function AppShellSidebarToggle(props: Omit<IconButtonProps, "icon" | "label" | "onClick" | "variant">): React.JSX.Element;
export declare function AppShell({ brand, navigation, navItems, currentNavId, navLabel, topbar, topbarVariant, topbarDivider, topbarTabs, topbarCurrentTab, topbarTabsLabel, topbarTabsEnd, layout, sidebarVariant, sidebarScrollbar, sidebarFooter, sidebarCollapsed, sidebarCollapsible, sidebarToggle, sidebarShortcut, sidebarIndicator, sidebarPanel, sidebarContrast, defaultSidebarCollapsed, onSidebarCollapsedChange, contentVariant, aside, asideLabel, asideVariant, children, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    brand: ReactNode;
    navigation?: ReactNode;
    navItems?: SidebarEntry[];
    currentNavId?: string;
    navLabel?: string;
    topbar?: ReactNode;
    topbarVariant?: Exclude<HeaderVariant, "pill">;
    topbarDivider?: boolean;
    sidebarVariant?: SidebarVariant;
    /** O arranjo (lote T, 17/10/2026): `"app"` (o padrão, o de sempre) ou `"docs"`, o da documentação da referência — um
     *  bloco CENTRALIZADO de 1400 com a lateral de 220, o texto e o índice de 268 (de 1280 para cima), a barra de cima de 56
     *  com a linha das áreas (`topbarTabs`) embaixo. A lateral fica onde a variante dela mandar (`plain`: sem caixa).
     *  `"sidebar"` (MNT-34, 0.42.0): a lateral até o topo, com a marca (`brand`) no topo dela; a barra de cima só existe se o
     *  app passar `topbar`, e fica só em cima do conteúdo. Com `sidebarVariant` (flutuante ou de canto), as quatro formas da
     *  bancada; sem `layout`, a de sempre. */
    layout?: "app" | "docs" | "sidebar";
    /** O pé fixo da lateral (4-C): a pessoa e o sair (`Sidebar.User`), a lista curta (`Sidebar.Nav`). Só o meio rola. */
    sidebarFooter?: ReactNode;
    /** A segunda linha da barra de cima: as áreas do site, com ícone (o `tabs` do `Header`). */
    topbarTabs?: HeaderTab[];
    /** O `id` da área atual da segunda linha. */
    topbarCurrentTab?: string;
    /** O nome da segunda linha para o leitor de tela. Padrão: `"Sections"`. */
    topbarTabsLabel?: string;
    /** A ponta da linha das áreas (o `tabsEnd` do `Header`): a chave Web | Native da documentação. */
    topbarTabsEnd?: ReactNode;
    /** 0.32.0: a barra de rolagem da lateral da esquerda — o `scrollbar` da `Sidebar`. Padrão `hover` (clara, só com o
     *  ponteiro em cima); `visible` é a barra sempre à vista. */
    sidebarScrollbar?: SidebarScrollbar;
    /** 0.32.0 (DOC-01): a coluna da DIREITA — o "Nesta página" de uma documentação (um `TableOfContents`).
     *  Mora numa `Sidebar placement="right"` do mesmo desenho da da esquerda. De 1280 para cima é a
     *  terceira coluna; abaixo, desce para depois do conteúdo. */
    aside?: ReactNode;
    /** O nome da coluna da direita para o leitor de tela. Padrão: a frase `tocLabel` ("On this page"). */
    asideLabel?: string;
    /** 0.32.0: a variante da coluna da direita. Padrão: a mesma da esquerda (`sidebarVariant`). `plain`
     *  tira a caixa — os itens soltos na página, como no "On this page" da documentação da referência. */
    asideVariant?: SidebarVariant;
    /** A lateral em trilha de ícones. Controlado: quem passa decide (e o `onSidebarCollapsedChange` avisa). */
    sidebarCollapsed?: boolean;
    /** AN-01: o botão de recolher na junção do menu com o conteúdo, e a trilha sozinha entre 1024 e 1279 de largura.
     *  Desde o bloco 2 (4-A), também o JEITO de recolher: `true` ou `"icon"` (a trilha), `"capsule"` (a trilha em cápsula) ou
     *  `"offcanvas"` (a lateral sai da tela). */
    sidebarCollapsible?: boolean | SidebarCollapsible;
    /** 4-B: onde o shell põe o botão de recolher. `"edge"` (o padrão): na junção da lateral com o conteúdo (no
     *  `layout="sidebar"`, no começo da barra do conteúdo). `"none"`: o shell não põe nenhum, e o app põe o `Sidebar.Toggle`
     *  onde quiser — dentro da lateral, ao lado da marca, ou no pé, como linha (`variant="item"`). */
    sidebarToggle?: "edge" | "none";
    /** 4-B: o atalho Ctrl+B (Cmd+B no Mac), que recolhe e abre a lateral (abaixo de 1024, abre e fecha a gaveta). Padrão:
     *  ligado, com `sidebarCollapsible`. Não age quando a pessoa está digitando num campo. */
    sidebarShortcut?: boolean;
    /** 4-H: o desenho do item atual da lateral (o `indicator` da `Sidebar`). */
    sidebarIndicator?: SidebarIndicator;
    /** 4-F e 4-G: a trilha das seções com o painel (o `panel` da `Sidebar`) — os itens do primeiro nível de `navItems` viram
     *  seções. `docked`: o painel ao lado (recolher esconde o painel); `overlay`: o painel abre por cima. */
    sidebarPanel?: "docked" | "overlay";
    /** A lateral de contraste (MNT-36): o `contrast` da `Sidebar` — escura nas duas telas. */
    sidebarContrast?: boolean;
    /** AN-01: começa recolhida, sem controlar. A escolha vale até a janela cruzar 1280. */
    defaultSidebarCollapsed?: boolean;
    /** AN-01: avisa cada troca — pelo botão, ou pela largura cruzando 1280. Guardar a preferência é do app. */
    onSidebarCollapsedChange?: (collapsed: boolean) => void;
    contentVariant?: "surface" | "plain";
}): React.JSX.Element;
export declare namespace AppShell {
    export { AppShellSidebarToggle as SidebarToggle };
}
export type SeparatorSpacing = "none" | "tight" | "normal" | "loose";
export declare function Separator({ orientation, spacing, className, ...props }: HTMLAttributes<HTMLHRElement> & RefAttributes<HTMLHRElement> & {
    orientation?: Responsive<Orientation>;
    spacing?: SeparatorSpacing;
}): React.JSX.Element;
export {};
