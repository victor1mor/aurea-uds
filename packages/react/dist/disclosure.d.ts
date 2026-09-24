import { type ReactNode } from "react";
export declare function Accordion({ items }: {
    items: Array<{
        id: string;
        title: ReactNode;
        content: ReactNode;
    }>;
}): import("react").JSX.Element;
export declare function Collapsible({ trigger, children, open, defaultOpen, onOpenChange, disabled, className }: {
    trigger: ReactNode;
    children: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    className?: string;
}): import("react").JSX.Element;
