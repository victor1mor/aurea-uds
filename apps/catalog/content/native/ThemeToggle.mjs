// O ThemeToggle do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// Ele troca o tema do `AureaProvider` acima dele. O provedor do site segue o tema da PÁGINA (controlado, sem quem ouça a
// troca), então cada exemplo tem o próprio provedor, como num app: o toque troca o tema da caixa, e só dela.
import {createElement as h, useState} from "react";
import {AureaProvider, Card, Cluster, Text, ThemeToggle, useAureaTheme} from "../../../../packages/native/dist/index.js";
import {FONTES_NO_NAVEGADOR} from "../../nativo/moldura.mjs";

const largura = {width: "min(28rem, 100%)"};

// A caixa com tema próprio: começa no tema da página e, depois do primeiro toque, guarda o seu. Sem `icons`, o provedor
// de dentro deixa valer o registro de ícones do site.
function ComTema({children}) {
  const daPagina = useAureaTheme().theme;
  const [tema, setTema] = useState(null);
  const efetivo = tema ?? daPagina;
  return h("div", {style: largura}, h(AureaProvider, {theme: efetivo, onThemeChange: setTema, fontFamilies: FONTES_NO_NAVEGADOR},
    h(Card, null, h(Cluster, null, children), h(Text, {tone: "muted"}, `This box is ${efetivo}.`))));
}

export default {
  install: 'import {ThemeToggle} from "@aurea-uds/native";',
  api: {
    size: "The IconButton size, on the touch scale. The button is round, like every icon-only button (ADR-0052).",
    pressed: "Inherited from IconButton: announces a toggle state to the screen reader. The toggle's state is the provider's theme, not this prop.",
    leading: "Inherited from Button's type; the icon-only button does not draw it.",
    trailing: "Inherited from Button's type; the icon-only button does not draw it.",
    icons: "A local icon registry, for when there is none in context. The glyphs are moon and sun, in the filled form (moon-fill, sun-fill).",
  },
  examples: [
    {
      title: "Usage",
      code: `const [theme, setTheme] = useState<AureaThemeName>("light");
<AureaProvider theme={theme} onThemeChange={setTheme}>
  <ThemeToggle />
</AureaProvider>`,
      render: () => h(ComTema, null, h(ThemeToggle)),
    },
    {
      title: "Sizes",
      description: "The five IconButton sizes. Here they share one box, so any of them flips it.",
      code: ["xs", "sm", "md", "lg", "xl"].map((v) => `<ThemeToggle size="${v}" />`).join("\n"),
      render: () => h(ComTema, null, ...["xs", "sm", "md", "lg", "xl"].map((v) => h(ThemeToggle, {key: v, size: v}))),
    },
  ],
};
