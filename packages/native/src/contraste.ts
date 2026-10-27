// Aurea nativo — "a pessoa pediu mais contraste?" (ADR-0083, 26/10/2026).
//
// A web pergunta pelo CSS (`@media (prefers-contrast: more)`): o campo ganha o contorno de 3:1 e as marcas brancas dos
// controles voltam à tinta. O React Native não tem folha em cascata, então cada peça pergunta aqui, como o
// `useReduceMotion` faz com o movimento.
//
// A pergunta é de cada sistema, e o nome muda — lido no código do React Native 0.87.1
// (`Libraries/Components/AccessibilityInfo/AccessibilityInfo.js`), em 27/10/2026:
//   · iOS: "Aumentar contraste" — `isDarkerSystemColorsEnabled()` e o evento `darkerSystemColorsChanged`;
//   · Android: "Texto de alto contraste" — `isHighTextContrastEnabled()` e o evento `highTextContrastChanged`;
//   · no navegador (`react-native-web`): a mesma media query da web.
// O pacote aceita o React Native desde a 0.76: se a função não existir na versão do app, a resposta é "não", sem erro.
import * as React from "react";
import {AccessibilityInfo, Platform} from "react-native";

type ConsultaDeContraste = {
  isDarkerSystemColorsEnabled?: () => Promise<boolean>;
  isHighTextContrastEnabled?: () => Promise<boolean>;
};
// O pacote compila sem a biblioteca do navegador: no `react-native-web`, a media query vem do objeto global.
type ConsultaDeMidia = {
  matches: boolean;
  addEventListener?: (tipo: "change", f: (e: {matches: boolean}) => void) => void;
  removeEventListener?: (tipo: "change", f: (e: {matches: boolean}) => void) => void;
};
const midia = () => (globalThis as {matchMedia?: (q: string) => ConsultaDeMidia}).matchMedia;

/**
 * `true` quando a pessoa pediu mais contraste ao sistema. Começa em `false` e muda quando o sistema responde (a pergunta
 * é assíncrona no iOS e no Android): ao contrário do movimento, um quadro sem o contorno não machuca ninguém — o campo
 * já se lê pelo rótulo, como no visual padrão. Muda sozinho se a pessoa ligar a preferência com o app aberto.
 */
export function useMaisContraste(): boolean {
  const [mais, setMais] = React.useState(false);
  React.useEffect(() => {
    if (Platform.OS === "web") {
      // Lida na hora: a media query do navegador pode não existir quando o pacote carrega (a página ainda montando).
      const perguntar = midia();
      const consulta = typeof perguntar === "function" ? perguntar.call(globalThis, "(prefers-contrast: more)") : null;
      if (!consulta) return;
      setMais(consulta.matches);
      const ouvir = (e: {matches: boolean}) => setMais(e.matches);
      consulta.addEventListener?.("change", ouvir);
      return () => consulta.removeEventListener?.("change", ouvir);
    }
    const a11y = AccessibilityInfo as unknown as ConsultaDeContraste;
    const [perguntar, evento] = Platform.OS === "ios"
      ? [a11y.isDarkerSystemColorsEnabled, "darkerSystemColorsChanged"] as const
      : [a11y.isHighTextContrastEnabled, "highTextContrastChanged"] as const;
    if (typeof perguntar !== "function") return;
    let vivo = true;
    perguntar.call(AccessibilityInfo).then((v) => { if (vivo) setMais(v); }, () => {});
    const inscricao = (AccessibilityInfo.addEventListener as (n: string, f: (v: boolean) => void) => {remove?: () => void})(evento, setMais);
    return () => { vivo = false; inscricao?.remove?.(); };
  }, []);
  return mais;
}
