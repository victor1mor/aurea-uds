import React, { type ReactNode } from "react";
import { type IconName } from "./system.js";
import { type BadgeVariant } from "./feedback.js";
export interface ChatMessage {
    id: string;
    body: ReactNode;
    author?: ReactNode;
    time?: ReactNode;
    avatar?: {
        src?: string;
        fallback?: ReactNode;
    };
    status?: {
        label: ReactNode;
        variant?: BadgeVariant;
    };
}
export declare function MessageList({ messages, label, className }: {
    messages: ChatMessage[];
    label?: string;
    className?: string;
}): React.JSX.Element;
export declare function MessageComposer({ onSend, placeholder, label, icon, sendLabel, disabled, className }: {
    onSend: (text: string) => void;
    placeholder?: string;
    label?: string;
    icon?: IconName;
    sendLabel?: string;
    disabled?: boolean;
    className?: string;
}): React.JSX.Element;
