import { jsx as _jsx } from "react/jsx-runtime";
import { View } from "react-native";
import { canto, acentoDoTom, comOpacidade, fundoDoTom } from "./estilos.js";
import { Icon } from "./icon.js";
import { useAureaTokens } from "./theme.js";
export function IconeEmMoldura({ icon, moldura, glifo, tone = "neutral", sobre }) {
    const t = useAureaTokens();
    const fundo = tone === "neutral" ? t.color.muted
        : tone === "primary" ? comOpacidade(t.color.primary, 0.1)
            : fundoDoTom(t, tone);
    const cor = tone === "neutral" ? t.color.mutedForeground : acentoDoTom(t, tone);
    const redondo = { width: moldura, height: moldura, ...canto(t.size.radiusFull), flexGrow: 0, flexShrink: 0 };
    const circulo = (_jsx(View, { style: [redondo, { alignItems: "center", justifyContent: "center", backgroundColor: fundo }], children: _jsx(Icon, { name: icon, size: glifo, color: cor }) }));
    return sobre == null ? circulo : (_jsx(View, { style: [redondo, { backgroundColor: sobre }], children: circulo }));
}
