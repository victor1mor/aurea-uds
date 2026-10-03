import { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type Orientation, type Responsive } from "./pure.js";
import { type TopbarVariant, type SidebarVariant, type SidebarItem } from "./navigation.js";
export declare function AppShell({ brand, navigation, navItems, currentNavId, navLabel, topbar, topbarVariant, topbarDivider, sidebarVariant, sidebarCollapsed, sidebarCollapsible, defaultSidebarCollapsed, onSidebarCollapsedChange, contentVariant, children, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    brand: ReactNode;
    navigation?: ReactNode;
    navItems?: SidebarItem[];
    currentNavId?: string;
    navLabel?: string;
    topbar?: ReactNode;
    topbarVariant?: Exclude<TopbarVariant, "pill">;
    topbarDivider?: boolean;
    sidebarVariant?: SidebarVariant;
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
