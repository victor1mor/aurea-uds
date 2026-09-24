import { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
import { type Orientation, type Responsive } from "./pure.js";
import { type TopbarVariant, type SidebarVariant, type SidebarItem } from "./navigation.js";
export declare function AppShell({ brand, navigation, navItems, currentNavId, navLabel, topbar, topbarVariant, topbarDivider, sidebarVariant, sidebarCollapsed, contentVariant, children, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    brand: ReactNode;
    navigation?: ReactNode;
    navItems?: SidebarItem[];
    currentNavId?: string;
    navLabel?: string;
    topbar?: ReactNode;
    topbarVariant?: Exclude<TopbarVariant, "pill">;
    topbarDivider?: boolean;
    sidebarVariant?: SidebarVariant;
    sidebarCollapsed?: boolean;
    contentVariant?: "surface" | "plain";
}): import("react").JSX.Element;
export type SeparatorSpacing = "none" | "tight" | "normal" | "loose";
export declare function Separator({ orientation, spacing, className, ...props }: HTMLAttributes<HTMLHRElement> & RefAttributes<HTMLHRElement> & {
    orientation?: Responsive<Orientation>;
    spacing?: SeparatorSpacing;
}): import("react").JSX.Element;
