import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — o `FileInput`: escolher um arquivo do aparelho. R-21, 02/10/2026.
//
// Pedido do app: mandar um documento (PDF) ao servidor dele. A trava de importação do app proíbe
// o `expo-document-picker` nas telas, então a peça tem de ser da Aurea, no molde do `PhotoInput`.
// Proposta aprovada pelo Victor em 02/10/2026 (*"3 sim"*).
//
// ── AS REFERÊNCIAS ───────────────────────────────────────────────────────────────────────────
//   uma      não tem: nem o pacote do nativo dela, nem o da web — medido nos pacotes.
//   outra    tem: tipos aceitos, tamanho máximo, número máximo de arquivos, vários de uma vez e
//            o aviso de mudança. Daqui vêm `accept` e `maxSize`, que são também os nomes
//            do `FileInput` da web. O limite é `max`, e não o nome que ela usa: é o nome do `PhotoInput`,
//            o irmão que mora ao lado.
//   web      o `FileInput` do `@aurea-uds/react`: as frases (`fileTooLarge`, `fileWrongType`,
//            `fileRemove`) e a conta do tamanho (`formatSize`) são as de lá.
//
// ── A DEPENDÊNCIA ────────────────────────────────────────────────────────────────────────────
//   expo-document-picker   MIT · ~57.0.1 fixado pelo Expo SDK 57 · peer OPCIONAL, `>=12`
// O formato de `getDocumentAsync` que este arquivo usa (`canceled`, `assets`, `multiple`, `type`
// como texto ou lista) é o mesmo da 12.0.1 à 57.0.3 — medido nos `types.d.ts` das duas.
//
// ── ⚠ UM CAMINHO SÓ DELE: `@aurea-uds/native/system/file` ─────────────────────────────────────
// Não no `/system` junto do `DatePicker` e do `PhotoInput`, e é a mesma razão da ADR-0038: o
// Metro resolve todo `import` do arquivo que o app importa. Se o `FileInput` morasse no
// `sistema.tsx`, **todo app que usa o `DatePicker` teria de instalar o `expo-document-picker`**,
// ou a montagem falharia — o README do pacote já descreve esse defeito. Caminho próprio, e só
// quem escolhe arquivo instala.
//
// ── O QUE A PEÇA NÃO FAZ ─────────────────────────────────────────────────────────────────────
// Não lê o arquivo e não envia nada: devolve o endereço local (`uri`), o nome, o tamanho e o
// tipo. Quem envia é o app, e quem confere o conteúdo é o servidor dele.
import * as React from "react";
import { Pressable, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { IconButton } from "./actions.js";
import { canto, criarFolha, estadoAcessivel } from "./estilos.js";
import { Icon } from "./icon.js";
import { alturaDoTamanho, respiroDoTamanho, useCampo } from "./inputs.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens } from "./theme.js";
const folha = criarFolha((t) => ({
    pilha: { gap: t.size.space2 },
    // O gatilho e a linha do arquivo têm a pele do campo: mesma borda, mesmo fundo, cápsula.
    caixa: {
        flexDirection: "row", alignItems: "center", gap: t.size.space2,
        width: "100%", minWidth: 0, borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
        ...canto(t.size.radiusControl), backgroundColor: t.color.fieldBg,
    },
    invalido: { borderColor: t.color.danger400 ?? t.color.destructive },
    desabilitado: { opacity: t.size.opacityDisabled },
    nomeETamanho: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: t.size.space2 },
    nome: { flexShrink: 1 },
}));
/** O tamanho para ler: a mesma conta do `formatSize` da web (`file-input.tsx`). */
export function formatarTamanho(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    const unidades = ["KB", "MB", "GB"];
    let n = bytes / 1024, i = 0;
    while (n >= 1024 && i < unidades.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n < 10 ? n.toFixed(1) : Math.round(n)} ${unidades[i]}`;
}
/** O arquivo bate com o `accept`? Sem `accept`, ou sem tipo informado, a resposta é sim. */
export function aceitaTipo(mimeType, accept) {
    if (accept == null || !mimeType)
        return true;
    const tipo = mimeType.toLowerCase();
    return (Array.isArray(accept) ? accept : [accept]).some((padrao) => {
        const p = padrao.trim().toLowerCase();
        if (p === "*/*" || p === tipo)
            return true;
        return p.endsWith("/*") && tipo.startsWith(p.slice(0, -1));
    });
}
/**
 * Escolher arquivo do aparelho.
 *
 * | a pergunta | o que ficou |
 * |---|---|
 * | a pessoa **cancelou** o seletor? | nada muda: nem a lista, nem o aviso |
 * | o arquivo passa do **`maxSize`**? | é recusado, e o aviso aparece embaixo, em vermelho |
 * | o tipo não bate com o **`accept`**? | idem — o seletor do sistema filtra, a peça confere |
 * | o tamanho **não veio**? | aceito: não há o que medir, e o servidor confere |
 * | **quantos** cabem? | `max`, padrão 1; no limite o gatilho some, como no `PhotoInput` |
 * | **nome comprido**? | corta no MEIO (`relat…2026.pdf`), para a extensão continuar à vista |
 *
 * Para o leitor de tela: o gatilho é um botão com o nome do `Field` e o texto dele; cada
 * arquivo lê *"nome, tamanho"*; o X lê *"Remover nome"*; o aviso de recusa é anunciado.
 */
export function FileInput({ value = [], onChange, accept, max = 1, maxSize, disabled, addIcon = "paperclip", fileIcon = "file-text", removeIcon = "x", style, testID, }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    const campo = useCampo();
    const tam = campo?.size ?? "md";
    const inativo = disabled ?? campo?.disabled;
    const [recusados, setRecusados] = React.useState([]);
    const cheio = value.length >= max;
    const medida = { height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam) };
    const escolher = React.useCallback(async () => {
        const r = await DocumentPicker.getDocumentAsync({
            ...(accept != null ? { type: accept } : {}),
            multiple: max - value.length > 1,
        });
        // Cancelar não muda nada — nem apaga o aviso de uma recusa anterior.
        if (r.canceled || !r.assets?.length)
            return;
        const aceitos = [];
        const fora = [];
        for (const a of r.assets) {
            if (!aceitaTipo(a.mimeType, accept)) {
                fora.push({ nome: a.name, motivo: "tipo" });
                continue;
            }
            if (maxSize != null && a.size != null && a.size > maxSize) {
                fora.push({ nome: a.name, motivo: "tamanho" });
                continue;
            }
            aceitos.push({ uri: a.uri, name: a.name, size: a.size, mimeType: a.mimeType });
        }
        setRecusados(fora);
        const cabem = aceitos.slice(0, max - value.length);
        if (cabem.length)
            onChange?.([...value, ...cabem]);
    }, [accept, max, maxSize, value, onChange]);
    return (_jsxs(View, { testID: testID, style: [s.pilha, style], children: [value.map((arquivo, n) => {
                const tamanho = arquivo.size != null ? formatarTamanho(arquivo.size) : null;
                return (_jsxs(View, { style: [s.caixa, medida, { paddingRight: 0 }], children: [_jsxs(View, { style: s.nomeETamanho, accessible: true, accessibilityLabel: tamanho ? `${arquivo.name}, ${tamanho}` : arquivo.name, children: [fileIcon && _jsx(Icon, { name: fileIcon, size: "sm", color: t.color.subtleForeground }), _jsx(Text, { size: "sm", numberOfLines: 1, ellipsizeMode: "middle", style: s.nome, children: arquivo.name }), tamanho && _jsx(Text, { size: "xs", tone: "muted", children: tamanho })] }), _jsx(IconButton, { appearance: "ghost", size: "sm", name: removeIcon, label: `${strings.fileRemove} ${arquivo.name}`, disabled: inativo, onPress: () => onChange?.(value.filter((_, i) => i !== n)) })] }, `${arquivo.uri}-${n}`));
            }), !cheio && (_jsxs(Pressable, { onPress: inativo ? undefined : escolher, disabled: inativo, accessibilityRole: "button", accessibilityLabel: campo?.label ? `${campo.label}, ${strings.fileChoose}` : strings.fileChoose, accessibilityHint: campo?.hint, ...estadoAcessivel({ disabled: !!inativo }), style: [s.caixa, medida, (campo?.invalido || recusados.length > 0) && s.invalido,
                    inativo && s.desabilitado], children: [addIcon && _jsx(Icon, { name: addIcon, size: "sm", color: t.color.mutedForeground }), _jsx(Text, { size: tam === "sm" ? "xs" : tam === "lg" ? "base" : "md", tone: "muted", numberOfLines: 1, children: strings.fileChoose })] })), recusados.length > 0 && (_jsx(View, { accessibilityLiveRegion: "polite", children: recusados.map((r, n) => (_jsx(Text, { size: "xs", tone: "danger", children: `${r.motivo === "tamanho" ? strings.fileTooLarge : strings.fileWrongType}: ${r.nome}` }, n))) }))] }));
}
