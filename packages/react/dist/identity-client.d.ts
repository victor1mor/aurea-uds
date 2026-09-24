import { type Responsive } from "./pure.js";
import React, { type ReactNode } from "react";
import type { AvatarSize } from "./markup.js";
export declare function Avatar({ src, alt, fallback, size, className }: {
    src?: string;
    alt?: string;
    fallback?: ReactNode;
    size?: Responsive<AvatarSize>;
    className?: string;
}): React.JSX.Element;
