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
}
export declare function Image({ ratio, fit, alt, className, style, render, onError, ...props }: ImageProps): React.JSX.Element;
export interface GalleryItem {
    id: string;
    src: string;
    alt: string;
    caption?: ReactNode;
}
export interface GalleryProps extends Omit<HTMLAttributes<HTMLUListElement>, "onSelect">, RefAttributes<HTMLUListElement> {
    items: GalleryItem[];
    label?: string;
    selected?: string;
    onSelect?: (id: string) => void;
    zoom?: boolean;
    ratio?: string;
}
export declare function Gallery({ items, label, selected, onSelect, zoom, ratio, className, ...props }: GalleryProps): React.JSX.Element;
export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, "children">, RefAttributes<HTMLDivElement> {
    children?: ReactNode;
    label?: string;
    controls?: boolean;
    indicators?: boolean;
}
export declare function Carousel({ children, label, controls, indicators, className, ...props }: CarouselProps): React.JSX.Element;
