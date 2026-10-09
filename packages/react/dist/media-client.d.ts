import React, { type HTMLAttributes, type RefAttributes, type ReactNode } from "react";
export declare function spokenTime(sec: number): string;
export interface MediaPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement> & RefAttributes<HTMLVideoElement>, "title"> {
    kind?: "video" | "audio";
    title?: ReactNode;
    subtitle?: ReactNode;
}
export declare function MediaPlayer({ kind, src, poster, title, subtitle, className, children, onClick, onPlay, onPause, onEnded, onTimeUpdate, onLoadedMetadata, onDurationChange, onProgress, onVolumeChange, ...rest }: MediaPlayerProps): React.JSX.Element;
export interface MediaEmbedProps extends Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, "title" | "src" | "children"> {
    /** Endereço de INCORPORAÇÃO do terceiro (ex.: `https://www.youtube.com/embed/<id>`). */
    src: string;
    /** Nome acessível do vídeo. Obrigatório. */
    title: string;
    /** Imagem da fachada. Com ela, o terceiro só carrega depois do clique. */
    poster?: string;
    /** Proporção da caixa, no formato do CSS. Padrão `16/9`. */
    ratio?: string;
    /** Endereço do vídeo no site de origem: a saída quando a incorporação é bloqueada. */
    href?: string;
    /** Na fachada, tocar ao clicar. Padrão `true`. */
    autoplay?: boolean;
}
export declare function MediaEmbed({ src, title, poster, ratio, href, autoplay, className, style, ...rest }: MediaEmbedProps): React.JSX.Element;
export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "children"> {
    ratio?: string;
    fit?: "cover" | "contain";
    render?: React.ReactElement;
    /** GAR-15 (0.28.0): a captura dentro de uma moldura de celular — GENÉRICA, sem ilha, entalhe nem
     *  botões (as regras de marketing de um fabricante proíbem simular o aparelho dele, e a Aurea não
     *  leva marca de terceiro). Com moldura, `className` e `style` vão para a MOLDURA (tamanho e lugar);
     *  a proporção (`ratio`, padrão 9/19,5) vai para a captura. */
    frame?: "phone";
    /** GAR-15 (0.28.0): a captura do tema escuro. A página em `data-theme="dark"` mostra esta; no claro,
     *  a de `src`. A que não aparece fica `display:none`, fora da árvore de acessibilidade. */
    srcDark?: string;
}
export declare function Image({ ratio, fit, alt, className, style, render, onError, frame, srcDark, ...props }: ImageProps): React.JSX.Element;
export type GalleryItemKind = "image" | "video";
export interface GalleryItem {
    id: string;
    src: string;
    alt: string;
    caption?: ReactNode;
    kind?: GalleryItemKind;
    duration?: number;
}
export interface GalleryProps extends Omit<HTMLAttributes<HTMLUListElement>, "onSelect">, RefAttributes<HTMLUListElement> {
    items: GalleryItem[];
    label?: string;
    selected?: string;
    onSelect?: (id: string) => void;
    zoom?: boolean;
    ratio?: string;
    selectionMode?: "single" | "multiple";
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    hasMore?: boolean;
    loading?: boolean;
    onReachEnd?: () => void;
}
export declare function Gallery({ items, label, selected, onSelect, zoom, ratio, selectionMode, selectedIds, onSelectionChange, hasMore, loading, onReachEnd, className, ...props }: GalleryProps): React.JSX.Element;
export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, "children">, RefAttributes<HTMLDivElement> {
    children?: ReactNode;
    label?: string;
    controls?: boolean;
    indicators?: boolean;
}
export declare function Carousel({ children, label, controls, indicators, className, ...props }: CarouselProps): React.JSX.Element;
