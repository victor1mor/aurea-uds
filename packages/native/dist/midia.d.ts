import * as React from "react";
import { type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";
import { type IconName } from "./icon.js";
/** URL ou `require()` de um asset local — as duas formas do `Image` do RN, como no `Avatar`. */
export type AureaImageSource = ImageSourcePropType | string;
export interface ImageProps {
    source: AureaImageSource;
    /**
     * O nome acessível. **É o `alt` da web, e é obrigatório pelo mesmo motivo que o `label` do
     * `IconButton`:** uma foto sem texto alternativo não diz nada a quem não a vê. Decorativa de
     * verdade se escreve `alt=""` — explícito, como manda a WAI.
     */
    alt: string;
    /** `16/9`, `"16/9"`, `"16:9"` ou `1.777…`. Sem ela, a imagem ocupa a altura que o `style` der. */
    ratio?: number | string;
    fit?: "cover" | "contain";
    /** O que aparece no lugar quando o bitmap não vem. Sem ele, o glifo `image` sobre a caixa reservada. */
    fallback?: React.ReactNode;
    /** O glifo do substituto. Registre-o, ou passe `false`. */
    fallbackIcon?: IconName | false;
    /**
     * Desenha OUTRO componente de imagem com a nossa pele — é o caso do consumidor que já usa
     * `expo-image` por cache de disco.
     *
     *     <Image render={<ExpoImage contentFit="cover" transition={150} />} source={u} alt="…" />
     *
     * Recebe `source`, `style`, `onError` e o nome acessível. **`fit` NÃO é traduzido para ele** —
     * `resizeMode` é do `Image` do RN, e o `expo-image` chama a mesma coisa de `contentFit`; quem
     * passa o elemento escreve a prop dele.
     */
    render?: React.ReactElement;
    onError?: () => void;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * A foto, com a caixa reservada e um substituto quando ela não vem.
 *
 * ```tsx
 * <Image source={foto.uri} alt="Frente do item" ratio="4/3" />
 * ```
 *
 * ⚠ **A caixa nasce reservada e pintada** com a mesma superfície do `Skeleton` — sem `ratio`, o
 * layout salta quando o bitmap chega, e num telefone esse salto acontece com o dedo já a caminho
 * do botão.
 *
 * ⚠ **O substituto continua sendo a imagem para quem usa leitor de tela**, com o mesmo `alt`.
 * Trocar o bitmap por uma caixa muda o que se vê, não o que a foto É — e o `role="image"` mapeia
 * nos dois sistemas (`ReactAccessibilityDelegate.kt:461`, `RCTConversions.h:96`).
 */
export declare function Image({ source, alt, ratio, fit, fallback, fallbackIcon, render, onError, style, testID, }: ImageProps): React.JSX.Element;
export interface AureaGalleryItem {
    id: string;
    source: AureaImageSource;
    alt: string;
    caption?: React.ReactNode;
}
export interface GalleryProps {
    items: AureaGalleryItem[];
    /** O nome da grade para o leitor de tela. Sem ele, a frase `galleryLabel` do provider. */
    label?: string;
    /** O `id` escolhido. **A galeria não guarda escolha** — é constante do app, como na web. */
    selected?: string;
    onSelect?: (id: string) => void;
    /** Tocar abre a foto grande no `Dialog` que já existe. */
    zoom?: boolean;
    /** Proporção dos ladrilhos. Padrão **1** (quadrado), como o `ratio="1/1"` da web. */
    ratio?: number | string;
    /**
     * Largura mínima de cada ladrilho, em dp. O `--gallery-min` da web é `8rem` — e `1rem = 16dp`,
     * medido, então **128**.
     */
    minTileWidth?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * A grade de fotos, e a foto grande quando se toca.
 *
 * ```tsx
 * <Gallery items={fotos} zoom selected={atual} onSelect={setAtual} />
 * ```
 *
 * ⚠ **Ampliar é DIÁLOGO, e diálogo já existe.** É a trava que a web escreveu no item L2 e ela
 * atravessa inteira: a foto grande abre no `Dialog` do Lote 5, com o confinamento de foco que o
 * `Modal` do RN dá pelo sistema e a saída pelo botão VOLTAR do Android. Uma segunda superfície
 * flutuante aqui seria uma segunda linguagem.
 *
 * ⚠ **Legenda visível torna a miniatura decorativa**, e quem exigiu isso na web foi o axe, não a
 * teoria: com `alt` e legenda dizendo a mesma coisa, o leitor de tela anuncia duas vezes seguidas.
 * Aqui a tradução é outra (não há `alt=""` no RN) mas a regra é a mesma — **com legenda, quem
 * carrega o nome é o LADRILHO, e a imagem sai da árvore**. O `alt` não se perde: ele continua
 * nomeando a foto ampliada, que é onde não há legenda ao lado.
 *
 * ⚠ **Sem `onSelect` e sem `zoom` os ladrilhos não são alvos.** Um `Pressable` que não faz nada é
 * um alvo que engana quem navega por leitor de tela — mesma decisão da web, mesma razão.
 */
export declare function Gallery({ items, label, selected, onSelect, zoom, ratio, minTileWidth, style, testID, }: GalleryProps): React.JSX.Element;
