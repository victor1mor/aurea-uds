import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — a MÍDIA: `Image` e `Gallery`.
//
// Lote 7 do `NATIVE.md` §8, terceira das três lacunas medidas pelo consumidor — e a que ele
// classificou como acabamento. A frase dele é exata: *"O `PhotoInput` entra foto. Nada mostra
// foto."* Conferido: o `sistema.tsx:184-225` devolve `AureaPhoto {uri, width, height}` e o único
// componente do pacote que desenha um bitmap é o `Avatar` (`display.tsx:279-297`), que é outro
// papel — um retrato redondo do tamanho de um controle, com iniciais por trás.
//
// ── A RESPOSTA "USA O `Image` DO RN E NÃO É LACUNA" FOI CONSIDERADA, E RECUSADA ──────────────
// Era uma das três saídas possíveis, e é tentadora porque o RN já tem um `Image`. Ela cai por
// medição, não por gosto: a ficha da web (`packages/contracts/registry/Image.json`) diz que o
// componente é *"uma imagem que RESERVA A CAIXA antes dos bytes chegarem, e CAI PARA UM
// SUBSTITUTO quando eles nunca chegam"*. O `Image` cru do RN não faz nenhuma das duas.
//
// E o custo de não fazê-las já está pago e registrado nesta casa: o `Avatar` foi medido em
// 31/07/2026 com `src` quebrado e **não caía no substituto**. O conserto virou o `useEffect` por
// `source` do `display.tsx:283-284`. Mandar cada tela do app reescrever isso é devolver ao
// consumidor o problema que o design system existe para resolver — e é a terceira vez que esta
// casa corrigiria a mesma coisa em três lugares (a regra do `CLAUDE.md` sobre correção local).
//
// ── O QUE FOI MEDIDO NO CSS, COM A LINHA ─────────────────────────────────────────────────────
//   .image          aurea.css:1434   bloco, 100% de largura, `object-fit:cover`, raio LG, fundo surface-3
//   .image-contain  :1435            `object-fit:contain`, fundo transparente
//   .image-broken   :1436            grade centrada, cor mutedForeground
//   .gallery        :1448            grade auto-fill de `--gallery-min` (8rem), gap space-3
//   .gallery-tile   :1450            grade com gap space-1, padding space-1, raio LG
//   .gallery-tile:not(.is-selected)  :1458   fundo transparente, cor mutedForeground
//   .gallery-caption :1459           textSm
//
// ── TRÊS COISAS DA WEB NÃO ATRAVESSAM, E CADA UMA POR UM MOTIVO DIFERENTE ────────────────────
//   `loading="lazy"`  não existe no RN — a decodificação preguiçosa é do motor de lista, não da
//                     imagem. Quem quer isso usa `FlatList`, que é o que a `Gallery` faz;
//   `ratio="16/9"`    a web aceita a STRING do CSS; o `aspectRatio` do RN é **número**. Aqui as
//                     duas formas entram, e a string é convertida — quem porta uma tela da web
//                     não deveria descobrir isso por um layout de altura zero;
//   `render`          a web troca o elemento pelo `useRender` do Base UI. Aqui é `cloneElement`,
//                     e serve ao mesmo caso real: o consumidor que já usa `expo-image`.
import * as React from "react";
import { Image as ImageRN, Pressable, View, } from "react-native";
import { criarFolha } from "./estilos.js";
import { Icon } from "./icon.js";
import { Grid } from "./layout.js";
import { Dialog } from "./overlays.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens } from "./theme.js";
const folha = criarFolha((t) => ({
    // O fundo NÃO é enfeite: ele é o marcador de carregamento inteiro. A web decidiu isso em
    // prosa (`media-client.tsx`, "O MARCADOR DE CARREGAMENTO NÃO TEM ESTADO") e a razão vale aqui
    // com mais força — um `useState` por imagem numa galeria de trinta fotos é trinta renders a
    // mais numa lista que já rola.
    imagem: {
        width: "100%",
        borderRadius: t.size.radiusLg,
        backgroundColor: t.color.surface3 ?? t.color.muted,
    },
    contain: { backgroundColor: "transparent" },
    quebrada: { alignItems: "center", justifyContent: "center" },
    ladrilho: { gap: t.size.space1, padding: t.size.space1, borderRadius: t.size.radiusLg },
    ladrilhoEscolhido: { backgroundColor: t.color.secondary },
}));
/** `"16/9"`, `"4:3"` ou o número que o RN quer. Devolve `undefined` quando não dá para ler. */
function razao(v) {
    if (v == null)
        return undefined;
    if (typeof v === "number")
        return Number.isFinite(v) && v > 0 ? v : undefined;
    // A web escreve `16/9`; alguém vai escrever `16:9`. As duas entram.
    const partes = v.split(/[/:]/);
    if (partes.length === 2) {
        const a = Number(partes[0]), b = Number(partes[1]);
        if (Number.isFinite(a) && Number.isFinite(b) && b !== 0)
            return a / b;
    }
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}
// Interno de propósito: não sai pelo barril. O consumidor escreve `string` ou `require()` e o
// componente converte — expor o conversor seria superfície pública sem caso de uso.
const fonteDaImagem = (s) => typeof s === "string" ? { uri: s } : s;
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
export function Image({ source, alt, ratio, fit = "cover", fallback, fallbackIcon = "image", render, onError, style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const [quebrou, setQuebrou] = React.useState(false);
    // A `source` nova merece uma tentativa nova — é a mesma linha do `Avatar` (`display.tsx:283`),
    // e sem ela uma URL quebrada deixa um buraco permanente mesmo depois de o app trocar a foto.
    React.useEffect(() => { setQuebrou(false); }, [source]);
    const proporcao = razao(ratio);
    const caixa = [
        s.imagem,
        fit === "contain" && s.contain,
        proporcao != null && { aspectRatio: proporcao },
        style,
    ];
    if (quebrou) {
        return (_jsx(View, { testID: testID, style: [caixa, s.quebrada], accessible: true, accessibilityRole: "image", accessibilityLabel: alt || undefined, children: fallback ?? (fallbackIcon
                ? _jsx(Icon, { name: fallbackIcon, size: "lg", color: t.color.mutedForeground })
                : null) }));
    }
    const comuns = {
        source: fonteDaImagem(source),
        style: caixa,
        onError: () => { setQuebrou(true); onError?.(); },
        // `alt=""` é decorativo explícito: some da árvore em vez de entrar com nome vazio.
        accessible: alt !== "",
        accessibilityRole: alt !== "" ? "image" : undefined,
        accessibilityLabel: alt !== "" ? alt : undefined,
        testID,
    };
    // `cloneElement` e não `useRender`: o idioma do Base UI não existe aqui, e o que o caso real
    // precisa é de um elemento pronto recebendo as nossas props. As props do consumidor vêm
    // primeiro no objeto do elemento e as nossas depois — `source` e `onError` são o contrato
    // deste componente, e deixá-las sobrescrevíveis seria prometer o substituto e não entregá-lo.
    if (render)
        return React.cloneElement(render, comuns);
    // ⚠ O molde é `ImageStyle` e não `ViewStyle`, e a conversão é CONSCIENTE: os dois tipos só
    // divergem em duas coisas — o `overflow` do `ViewStyle` aceita `"scroll"`, que o `ImageStyle`
    // não tem, e o `ImageStyle` soma `resizeMode`/`tintColor`/`overlayColor`. **Nada aqui escreve
    // nenhuma das duas**: a folha põe largura, raio, fundo e proporção, e o `resizeMode` vai como
    // prop, ao lado. A API pública fica em `ViewStyle` de propósito — quem chama pensa em caixa, e
    // fazer o consumidor importar `ImageStyle` para passar um raio seria vazar o primitivo.
    return _jsx(ImageRN, { ...comuns, style: caixa, resizeMode: fit });
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
export function Gallery({ items, label, selected, onSelect, zoom, ratio = 1, minTileWidth = 128, style, testID, }) {
    const s = folha(useAureaTokens());
    const strings = useAureaStrings();
    const [ampliado, setAmpliado] = React.useState(null);
    const interativo = !!onSelect || !!zoom;
    const aberto = items.find((i) => i.id === ampliado) ?? null;
    return (_jsxs(_Fragment, { children: [_jsx(Grid, { testID: testID, minColumnWidth: minTileWidth, accessibilityRole: "list", accessibilityLabel: label ?? strings.galleryLabel, style: style, children: items.map((item) => {
                    const temLegenda = item.caption != null;
                    const miolo = (_jsxs(_Fragment, { children: [_jsx(Image, { source: item.source, alt: temLegenda ? "" : item.alt, ratio: ratio }), temLegenda && (typeof item.caption === "string"
                                ? _jsx(Text, { size: "sm", numberOfLines: 2, children: item.caption })
                                : item.caption)] }));
                    if (!interativo) {
                        return _jsx(View, { style: s.ladrilho, children: miolo }, item.id);
                    }
                    return (_jsx(Pressable, { testID: testID ? `${testID}-${item.id}` : undefined, onPress: () => { onSelect?.(item.id); if (zoom)
                            setAmpliado(item.id); }, accessibilityRole: "imagebutton", 
                        // Com legenda, o nome do ladrilho é a legenda e a imagem já saiu da árvore (o
                        // `alt=""` acima). Sem legenda, o nome é o `alt`.
                        accessibilityLabel: temLegenda && typeof item.caption === "string"
                            ? item.caption : item.alt, accessibilityState: { selected: item.id === selected }, style: [s.ladrilho, item.id === selected && s.ladrilhoEscolhido], children: miolo }, item.id));
                }) }), zoom && (_jsx(Dialog, { open: aberto != null, title: aberto ? (typeof aberto.caption === "string" ? aberto.caption : aberto.alt) : "", onClose: () => setAmpliado(null), testID: testID ? `${testID}-ampliada` : undefined, children: aberto && _jsx(Image, { source: aberto.source, alt: aberto.alt, fit: "contain", ratio: ratio }) }))] }));
}
