import React, { type ReactNode } from "react";
import { type IconName } from "./system.js";
import { type BadgeVariant } from "./feedback.js";
export type ChatDirection = "incoming" | "outgoing";
export interface MessageAttachment {
    id: string;
    kind: "image" | "video" | "file";
    src?: string;
    alt?: string;
    name?: string;
    bytes?: number;
    duration?: number;
    href?: string;
}
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
    direction?: ChatDirection;
    attachments?: MessageAttachment[];
    replyTo?: {
        id: string;
        author?: ReactNode;
        body: ReactNode;
    };
    forwardedFrom?: ReactNode;
    edited?: boolean;
    day?: string;
}
export interface MessageListProps {
    messages: ChatMessage[];
    label?: string;
    className?: string;
    hasMoreBefore?: boolean;
    hasMoreAfter?: boolean;
    loadingBefore?: boolean;
    loadingAfter?: boolean;
    onReachStart?: () => void;
    onReachEnd?: () => void;
    onOpenAttachment?: (message: ChatMessage, attachment: MessageAttachment) => void;
}
export declare function MessageList({ messages, label, className, hasMoreBefore, hasMoreAfter, loadingBefore, loadingAfter, onReachStart, onReachEnd, onOpenAttachment }: MessageListProps): React.JSX.Element;
export interface ComposerReply {
    id: string;
    author?: ReactNode;
    body: ReactNode;
}
export interface ComposerEdit {
    id: string;
    body: string;
}
export interface ComposerAttach {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
}
export interface MessageSendDetails {
    files: File[];
    replyToId?: string;
    editingId?: string;
}
export declare function MessageComposer({ onSend, placeholder, label, icon, sendLabel, disabled, className, attach, replyTo, onCancelReply, editing, onCancelEdit }: {
    onSend: (text: string, details?: MessageSendDetails) => void;
    placeholder?: string;
    label?: string;
    icon?: IconName;
    sendLabel?: string;
    disabled?: boolean;
    className?: string;
    attach?: boolean | ComposerAttach;
    replyTo?: ComposerReply | null;
    onCancelReply?: () => void;
    editing?: ComposerEdit | null;
    onCancelEdit?: () => void;
}): React.JSX.Element;
