// O IconRegistryProvider do nativo no site (bloco 1, o grupo 1 — 23/10/2026): põe um registro de ícones em contexto.
// Dentro dele vale SÓ o registro dele — ele troca o de cima, não soma. Os glifos são importados pelo caminho fundo,
// um a um, como o app faz (ADR-0038).
import {createElement as h} from "react";
import {Icon, IconButton, IconRegistryProvider, criarGlifo, criarRegistroDeIcones} from "../../../../packages/native/dist/index.js";
import House from "../../../../packages/native/icons/house.js";
import Gear from "../../../../packages/native/icons/gear.js";

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)"};
const ICONES = criarRegistroDeIcones({house: House, gear: Gear});
// A marca do app, desenhada pela Aurea a partir dos dados: um anel (dois círculos, o de dentro vazado).
const ANEL = "M16 2 a14 14 0 1 0 0.01 0 Z M16 9 a7 7 0 1 0 0.01 0 Z";
const Marca = criarGlifo({paths: [{d: ANEL, fillRule: "evenodd"}]});

export default {
  install: 'import {IconRegistryProvider} from "@aurea-uds/native";',
  description: "Puts an icon registry in context, for every Icon and icon prop below it. AureaProvider already does this when it receives icons; this one is for a part of the screen with a registry of its own. Inside, its registry replaces the one above — it does not add to it.",
  api: {
    registry: "Required. The map from name to glyph, made with criarRegistroDeIcones from glyphs imported one by one (@aurea-uds/native/icons/<name>) — never the barrel of all of them, which would bring every icon into the bundle.",
    children: "Required. Everything that draws icons by name.",
  },
  examples: [
    {
      title: "Usage",
      code: `import House from "@aurea-uds/native/icons/house";
import Gear from "@aurea-uds/native/icons/gear";
const icons = criarRegistroDeIcones({house: House, gear: Gear});

<IconRegistryProvider registry={icons}>
  <Icon name="house" label="Home" />
  <IconButton name="gear" label="Settings" />
</IconRegistryProvider>`,
      render: () => h(IconRegistryProvider, {registry: ICONES},
        h("div", {style: linha}, h(Icon, {name: "house", label: "Home"}), h(IconButton, {name: "gear", label: "Settings"}))),
    },
    {
      title: "Your own glyph, by name",
      description: "A drawing made with criarGlifo goes into the registry like any glyph, and is then used by its name.",
      code: `declare module "@aurea-uds/native" {
  interface AureaIconNames { brand: true }
}

const Brand = criarGlifo({paths: [{d: "${ANEL}", fillRule: "evenodd"}]});

<IconRegistryProvider registry={criarRegistroDeIcones({brand: Brand})}>
  <Icon name="brand" size="xl" label="Our brand" />
</IconRegistryProvider>`,
      render: () => h(IconRegistryProvider, {registry: criarRegistroDeIcones({brand: Marca})},
        h("div", {style: linha}, h(Icon, {name: "brand", size: "xl", label: "Our brand"}))),
    },
  ],
};
