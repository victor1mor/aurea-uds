// A PÁGINA DE UM PADRÃO NO SITE B (02/11/2026). Sem desenho próprio: segue a lista (`patterns-*`) e a página de
// componente — o palco com o caminho até este padrão e os selos; Usage com o import e a caixa de hoje (viva, com o
// Code); os componentes que ele usa em cartões; e o anterior e o próximo. Parte do `site.patternPage` (a mesma caixa, o
// mesmo texto do "Copy Markdown").
import {itemDoGrupo} from "./_grupo-1.mjs";

const TOM = {primary: "primary", danger: "danger", destructive: "danger", success: "success", info: "info", warning: "warning"};

export default function pattern(site, p, i) {
  const {h, A, slug} = site;
  // A trilha leva de volta (o lote 118, 27/11/2026): "Patterns" à lista inteira, e o componente à lista já filtrada nele.
  const trilha = [h("a", {className: "intro-trilha-link", href: "./patterns.html"}, "Patterns"),
    h("a", {className: "intro-trilha-link", href: `./patterns.html#filtro/${slug(p.component)}`}, p.component)];
  return itemDoGrupo(site, {
    base: site.patternPage(p, i), area: "patterns", arquivo: `${p.slug}.html`,
    trilha, titulo: p.name, lede: p.description,
    selos: [h(A.Badge, {key: "v", size: "lg", tone: TOM[String(p.variant).toLowerCase()] || "neutral"}, p.variant),
      h(A.Badge, {key: "c", size: "lg", className: "g1-selo-mono"}, p.component)],
    caminho: [p.component, p.variant, p.name],
    usa: [p.component, ...(p.uses || [])],
    tituloDoUso: "Copy it whole.",
  });
}
