// A PÁGINA DE UM BLOCO NO SITE B (02/11/2026). Sem desenho próprio: segue a lista (`blocks-*`) e a página de componente
// — o palco com o caminho até este bloco e os selos; Usage com o import e a caixa de hoje (viva, com o Code); os
// componentes que ele usa em cartões; e o anterior e o próximo. Parte do `site.blockPage` (a mesma caixa, o mesmo texto do
// "Copy Markdown").
import {itemDoGrupo} from "./_grupo-1.mjs";

export default function block(site, b, i) {
  const {h, A} = site;
  const usa = [...new Set(b.uses || [])];
  return itemDoGrupo(site, {
    base: site.blockPage(b, i), area: "blocks", arquivo: `${b.slug}.html`,
    trilha: ["Blocks", b.category], titulo: b.name, lede: b.description,
    selos: [h(A.Badge, {key: "c", size: "lg"}, b.category),
      h(A.Badge, {key: "n", size: "lg", className: "g1-selo-mono"}, `${usa.length} component${usa.length === 1 ? "" : "s"}`)],
    caminho: ["Component", "Pattern", "Block"],
    usa,
    tituloDoUso: "Drop it in whole.",
  });
}
