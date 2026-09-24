import React from "react";
import { type ErrorCorrection } from "qr";
import { type Responsive } from "./pure.js";
export type QRCodeSize = "sm" | "md" | "lg";
export interface QRCodeProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
    value: string;
    size?: Responsive<QRCodeSize>;
    ecc?: ErrorCorrection;
    quietZone?: number;
    label?: string;
}
export declare function QRCode({ value, size, ecc, quietZone, label, className, ...props }: QRCodeProps): React.JSX.Element;
