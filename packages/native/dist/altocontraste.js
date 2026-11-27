// Aurea nativo — o alto contraste do Windows no navegador (lote 110, 26/11/2026).
//
// No celular não existe esse modo. No navegador (`react-native-web`), existe: o Windows troca toda cor pelas poucas que
// a pessoa escolheu, e o que a peça só mostrava com FUNDO (a caixa marcada, a chave ligada, a aba escolhida) some — o
// fundo vira a cor da tela. A conferência WEB-48 (`tests/visual/cores-forcadas-e-movimento.spec.ts`) achou 34 casos.
//
// A regra é a mesma da web (o `aurea.css`, aprovada pelo Victor na bancada, 26/11/2026): o marcado e o escolhido no
// DESTAQUE do sistema (`Highlight`), o que fica em cima dele na cor sobre o destaque (`HighlightText`); a caixa de marcar,
// como a da web, com o visto na cor do texto. O React Native não tem folha em cascata nem conhece as cores do sistema
// (o `react-native-web` descarta `Highlight` como cor), então a peça leva uma MARCA só do navegador (`dataSet`, que vira
// `data-aurea-*` no HTML e o aparelho ignora) e a regra mora numa folha pequena, só dentro do `@media (forced-colors)`. O
// `!important` é porque o `react-native-web` escreve a cor de cada peça no `style` dela.
//
// A folha entra no `<head>` uma vez só, quantas peças forem, quando a peça monta no navegador. Não é o `<style>` com
// `precedence` do `DatePicker` (`sistema.tsx`): escrita assim, nas páginas montadas no servidor e acesas depois, a folha
// sumia ao acender, e a regra não chegava (medido em 26/11/2026 — na página do `Switch` a folha sumia, na do `Label` não).
import * as React from "react";
import { Platform } from "react-native";
const REGRA = "@media (forced-colors:active){"
    // O recheio da marca ligada (o rádio, a chave) e a peça escolhida (a aba, a etiqueta): no destaque.
    + "[data-aurea-hc=ligada],[data-aurea-hc=escolhida]{forced-color-adjust:none;background-color:Highlight!important}"
    // A bolinha da chave e o ponto do rádio: na cor do texto; em cima do destaque, na cor sobre ele.
    + "[data-aurea-hc=miolo]{forced-color-adjust:none;background-color:CanvasText!important}"
    + "[data-aurea-hc=ligada] [data-aurea-hc=miolo]{background-color:HighlightText!important}"
    // O visto da caixa de marcar: na cor do texto, como na web (lá a caixa não enche).
    + "[data-aurea-hc=caixa] path{stroke:CanvasText!important}"
    // Dentro da escolhida, toda letra e todo ícone na cor sobre o destaque.
    + "[data-aurea-hc=escolhida] *{color:HighlightText!important}"
    + "[data-aurea-hc=escolhida] [fill]:not([fill=none]){fill:HighlightText!important}"
    + "[data-aurea-hc=escolhida] [stroke]:not([stroke=none]){stroke:HighlightText!important}"
    + "}";
/** A marca do alto contraste, só no navegador. No aparelho, nada (o `dataSet` não existe lá). */
export function marcaHC(tipo) {
    if (Platform.OS !== "web")
        return {};
    return { dataSet: { aureaHc: tipo } };
}
const ID = "aurea-alto-contraste";
/** A folha da regra, só no navegador: a peça que leva a marca chama este gancho, e a folha entra no `<head>` uma vez. */
export function useRegraDoAltoContraste() {
    React.useInsertionEffect(() => {
        if (Platform.OS !== "web")
            return;
        const doc = globalThis.document;
        if (!doc || doc.getElementById(ID))
            return;
        const folha = doc.createElement("style");
        folha.id = ID;
        folha.textContent = REGRA;
        doc.head.append(folha);
    }, []);
}
