import { type Responsive } from "./pure.js";
import React, { type ReactNode } from "react";
import type { AvatarSize } from "./markup.js";
export type AvatarTone = "neutral" | "brand" | "danger" | "success" | "warning" | "info";
export declare function Avatar({ src, alt, fallback, size, tone, emphasis, className }: {
    src?: string;
    alt?: string;
    fallback?: ReactNode;
    size?: Responsive<AvatarSize>;
    /** A cor da letra ou do ícone de reserva: o que ele significa. */
    tone?: AvatarTone;
    /** `soft`: sem a moldura, com o fundo clarinho do tom. */
    emphasis?: "default" | "soft";
    className?: string;
}): React.JSX.Element;
