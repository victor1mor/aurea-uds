import { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type Orientation, type Responsive } from "./pure.js";
import { type HeaderVariant, type SidebarVariant, type SidebarItem } from "./navigation.js";
export declare function AppShell({ brand, navigation, navItems, currentNavId, navLabel, topbar, topbarVariant, topbarDivider, sidebarVariant, sidebarCollapsed, sidebarCollapsible, defaultSidebarCollapsed, onSidebarCollapsedChange, contentVariant, aside, asideLabel, children, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    brand: ReactNode;
    navigation?: ReactNode;
    navItems?: SidebarItem[];
    currentNavId?: string;
    navLabel?: string;
    topbar?: ReactNode;
    topbarVariant?: Exclude<HeaderVariant, "pill">;
    topbarDivider?: boolean;
    sidebarVariant?: SidebarVariant;
    /** 0.32.0 (DOC-01): a coluna da DIREITA — o "Nesta página" de uma documentação (um `TableOfContents`).
     *  Mora numa `Sidebar placement="right"` do mesmo desenho da da esquerda. De 1280 para cima é a
     *  terceira coluna; abaixo, desce para depois do conteúdo. */
    aside?: ReactNode;
    /** O nome da coluna da direita para o leitor de tela. Padrão: a frase `tocLabel` ("On this page"). */
    asideLabel?: string;
    /** A lateral em trilha de ícones. Controlado: quem passa decide (e o `onSidebarCollapsedChange` avisa). */
    sidebarCollapsed?: boolean;
    /** AN-01: o botão de recolher na junção do menu com o conteúdo, e a trilha sozinha entre 1024 e 1279 de largura. */
    sidebarCollapsible?: boolean;
    /** AN-01: começa recolhida, sem controlar. A escolha vale até a janela cruzar 1280. */
    defaultSidebarCollapsed?: boolean;
    /** AN-01: avisa cada troca — pelo botão, ou pela largura cruzando 1280. Guardar a preferência é do app. */
    onSidebarCollapsedChange?: (collapsed: boolean) => void;
    contentVariant?: "surface" | "plain";
}): import("react").JSX.Element;
export type SeparatorSpacing = "none" | "tight" | "normal" | "loose";
export declare function Separator({ orientation, spacing, className, ...props }: HTMLAttributes<HTMLHRElement> & RefAttributes<HTMLHRElement> & {
    orientation?: Responsive<Orientation>;
    spacing?: SeparatorSpacing;
}): import("react").JSX.Element;
