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
export declare function FileInput({ accept, maxSize, multiple, onFilesChange, upload, label, hint, id, className, initialQueue, onQueueChange, preview, checksum }: {
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
}): React.JSX.Element;
export {};
