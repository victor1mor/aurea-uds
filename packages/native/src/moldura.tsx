// Aurea nativo — o ícone dentro da moldura redonda. R-15 e R-18, 02/10/2026.
//
// Escolhida pelo Victor na prancha de 02/10/2026 (*"1 c"*): a tela vazia e o histórico do app
// pediam o ícone com um fundo atrás, em vez do glifo solto.
//
// ── DE ONDE VEM CADA NÚMERO ──────────────────────────────────────────────────────────────────
// O HeroUI não tem "ícone em moldura", mas tem a peça redonda com ícone dentro: o `Avatar` do
// HeroUI Native 1.0.10 (`avatar.css:16-29`): `sm` 40, `md` 48, `lg` 64, raio cheio, e a variante
// `soft` pinta o fundo com a cor do tom (`:44-61`). As molduras daqui são essas: 40 no histórico,
// 64 na tela vazia (`space10` e `space16`).
// O glifo vai na METADE da moldura (`iconMd` 20 e `iconXl` 32), a proporção do `Icon Tile` do ReUI
// (`xl` 56/28) — o segundo da fila, que é quem tem a peça. O 32 é o glifo que o `EmptyState` já
// usava; ele só ganhou a moldura.
// A cor é a do `Badge` (`acentoDoTom`/`fundoDoTom`). O `primary` não tem fundo suave em token e
// leva o do `.badge-primary` da web (`aurea.css:1064`): o amarelo a 10%. O `neutral` é o `muted`.
//
// Não sai pela porta da frente: é peça de dentro, do `EmptyState` e da `Timeline`.
import * as React from "react";
import {View} from "react-native";
import {acentoDoTom, comOpacidade, fundoDoTom, type TomDeCor} from "./estilos.js";
import {Icon, type AureaIcon} from "./icon.js";
import {useAureaTokens} from "./theme.js";

export interface IconeEmMolduraProps {
  icon: AureaIcon;
  /** O lado da moldura, em dp — sempre de um token. */
  moldura: number;
  /** O lado do glifo, em dp — sempre de um token. */
  glifo: number;
  tone?: TomDeCor;
  /**
   * A cor de BAIXO, quando há algo atrás. No escuro os fundos suaves são translúcidos (o
   * `successBg` é `oklch(0.42 0.11 150 / 0.36)`), e o trilho da `Timeline` aparecia através da
   * moldura. É o mesmo truque do ponto da linha do tempo: a cor da superfície faz o buraco.
   */
  sobre?: string;
}

export function IconeEmMoldura({icon, moldura, glifo, tone = "neutral", sobre}: IconeEmMolduraProps) {
  const t = useAureaTokens();
  const fundo = tone === "neutral" ? t.color.muted
    : tone === "primary" ? comOpacidade(t.color.primary, 0.1)
    : fundoDoTom(t, tone);
  const cor = tone === "neutral" ? t.color.mutedForeground : acentoDoTom(t, tone);
  const redondo = {width: moldura, height: moldura, borderRadius: t.size.radiusFull, flexGrow: 0, flexShrink: 0};
  const circulo = (
    <View style={[redondo, {alignItems: "center", justifyContent: "center", backgroundColor: fundo}]}>
      <Icon name={icon} size={glifo} color={cor} />
    </View>
  );
  return sobre == null ? circulo : (
    <View style={[redondo, {backgroundColor: sobre}]}>{circulo}</View>
  );
}
