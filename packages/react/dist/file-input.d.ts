import React, { type ReactNode } from "react";
export interface FileRejection {
    file: File;
    reason: string;
}
export interface UploadContext {
    signal: AbortSignal;
    onProgress: (fraction: number) => void;
    resumeFrom: number;
}
export type UploadFn = (file: File, ctx: UploadContext) => Promise<void | {
    checksum?: string;
}>;
type UploadStatus = "pending" | "uploading" | "paused" | "done" | "error" | "canceled";
export interface FileQueueItem {
    id: string;
    name: string;
    bytes: number;
    status: UploadStatus;
    progress: number;
    restored?: boolean;
    checksum?: string;
    finishedAt?: string;
}
export declare function matchesAccept(file: {
    name: string;
    type: string;
}, accept?: string): boolean;
export declare function formatSize(bytes: number): string;
export declare function FileInput({ accept, maxSize, multiple, onFilesChange, upload, label, hint, id, className, initialQueue, onQueueChange, preview, checksum, "aria-invalid": invalido, "aria-labelledby": rotuladoPor, "aria-describedby": descritoPor }: {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    onFilesChange?: (files: File[]) => void;
    upload?: UploadFn;
    label?: ReactNode;
    hint?: ReactNode;
    id?: string;
    className?: string;
    initialQueue?: FileQueueItem[];
    onQueueChange?: (queue: FileQueueItem[]) => void;
    preview?: boolean;
    checksum?: boolean;
    /** O inválido (0.67.0): a área de soltar fica vermelha como os outros campos e o leitor de tela ouve "inválido". Dentro
     *  de um `Field` com `error`, chega sozinho. Arquivo recusado continua deixando a área vermelha, com ou sem ele. */
    "aria-invalid"?: boolean | "true" | "false";
    /** A ligação ao rótulo e à frase de fora (0.68.0): dentro de um `Field`, chega sozinha. O rótulo SOMA ao texto da área ("Proof of address Drag files here…"). */
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}): React.JSX.Element;
export {};
