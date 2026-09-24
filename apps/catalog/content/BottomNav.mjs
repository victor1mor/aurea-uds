import {createElement as h, useState} from "react";
import {BottomNav, Badge} from "../../../packages/react/dist/index.js";

// Caixa de recorte: a barra é `sticky` e mede a largura do que a contém. Numa demo larga ela
// vira uma fileira esticada e deixa de parecer o que é. A caixa dá a largura de um telefone;
// o código é o uso real. Mesmo motivo da caixa do Sidebar.
const box = {width: "min(22rem,100%)"};

// A DEMO É INTERATIVA, e isso é ORDEM DO VICTOR (20/08/2026): *"quero ver eles dinamicos, nada
// de coisa estatico pois eu não sei se funciona de verdade e não confio em sua palavra"*.
// Marcação morta prova DESENHO; só o clique prova COMPORTAMENTO — foi assim que o Tooltip do
// trilho recolhido viveu quebrado com todos os gates verdes. Está escrito no QUALITY.md §12b.
//
// Os itens da demo são BOTÃO e não link (`onClick` sem `href`), pela razão prática: dentro do
// catálogo um link levaria a página embora no primeiro toque, e a prévia deixaria de existir.
// O `code` ao lado mostra o uso real, que é com `href` — a barra aceita os dois e pinta igual.
const Barra = ({inicial, ...props}) => {
  const [atual, setAtual] = useState(inicial);
  return h("div", {style: box},
    h(BottomNav, {...props, current: atual,
      items: (props.items ?? ITENS).map(it => ({...it, onClick: () => setAtual(it.id)}))}));
};
const demo = (props) => h(Barra, props);

// OS ÍCONES SÃO UMA FAMÍLIA SÓ, e os dois primeiros mudaram por causa dos achados 1 e 2 da
// auditoria de 18/08/2026: `home` se comportava como ícone de "início" genérico num aplicativo
// de veículos, e `meter` lia como velocímetro, não como combustível. `car` e `gas-station` são
// o que a auditoria pede — reconhecível sem ler o texto — e são os mesmos das sete telas que o
// Victor desenhou. `tools` no lugar de `tool-kit` pelo peso óptico: o kit é denso e dominava a
// barra ao lado de um contorno leve como o `user`.
//
// O CONTADOR É OURO, não vermelho (achado 10). Vermelho promete erro ou urgência; três recados
// pendentes são quantidade. As variantes semânticas do Badge continuam todas disponíveis para
// quem tiver de fato um alerta.
const ITENS = [
  {id: "garage", label: "Garage", icon: "car"},
  {id: "fuel", label: "Fuel", icon: "gas-station",
    badge: h(Badge, {size: "xs", variant: "primary", emphasis: "solid"}, "3")},
  {id: "service", label: "Service", icon: "tools"},
  {id: "me", label: "Profile", icon: "user"},
];

const CODIGO_ITENS = `const items = [
  {id: "garage", label: "Garage", icon: "car", href: "/"},
  {id: "fuel", label: "Fuel", icon: "gas-station", href: "/fuel",
    badge: <Badge size="xs" variant="primary" emphasis="solid">3</Badge>},
  {id: "service", label: "Service", icon: "tools", href: "/service"},
  {id: "me", label: "Profile", icon: "user", href: "/me"},
];`;

export default {
  description:
    "BottomNav is the bar an application's top-level navigation lives in on a phone. It takes "
    + "the SAME item type as Sidebar, on purpose: one list feeds the sidebar on a desktop and "
    + "the bar on a phone, and two lists of one menu drift apart.",
  install: 'import {BottomNav} from "@aurea-uds/react";',
  features: [
    "TWO AXES, and they do not mix. `variant` says where the bar sits — `edge` against the "
    + "screen, `floating` as a loose pill. `indicator` says what SHAPE marks the current item. "
    + "The meaning never changes with the shape: current is always gold.",
    "Seven indicators: none, subtle, pill, circle, circle-raised, circle-bold, circle-outline. "
    + "Everything else is shared — touch target, icon frame, typography, badge anchoring, safe "
    + "area. That is what makes them variants of one component instead of four components.",
    "Every item keeps its label, in every indicator. Icon-only navigation only works when the "
    + "symbols are unmistakable, and Garage/Fuel/Service are not.",
    "The container is a <nav> landmark and each item is a link — not a tab. A tab swaps a panel "
    + "inside the page; a bottom bar changes page. Giving role=\"tablist\" to a menu makes the "
    + "screen reader promise arrow keys that lead nowhere.",
    "The counter hangs off the icon's top corner and is smaller than it — 16px on a 24px icon, "
    + "the ratio measured in four apps that ship. With no number it is a plain dot: `badge: \"\"`.",
    "The current item is marked with aria-current=\"page\" — the same attribute the screen reader "
    + "announces and the skin paints, so they cannot drift apart.",
    "One list, two chromes: pass your Sidebar `items` straight in. A nested `items` is ignored "
    + "here, because a bottom bar is flat.",
    "It reserves room for the iPhone home indicator with env(safe-area-inset-bottom). That needs "
    + "viewport-fit=cover in YOUR meta viewport; without it the bar just gets its normal spacing.",
    "Positioning is sticky, not fixed: it stays inside its container, so it cannot cover a page "
    + "it does not own, and it falls back to static when there is nothing to scroll.",
    "The four names of 17/08/2026 — flat, surface, pill, dock — still work and map onto the pair. "
    + "They are deprecated, not removed.",
  ],
  examples: [
    {
      title: "Recommended — edge to edge, marked by colour",
      description: "The bar sits against the screen with a hairline above it, and the screen you "
        + "are on is marked by colour alone. Click another destination: it moves.",
      code: `${CODIGO_ITENS}

<BottomNav variant="edge" label="Garage" current={route} items={items} />`,
      embed: true,
      render: () => demo({variant: "edge", label: "Garage", inicial: "fuel"}),
    },
    {
      title: "Floating subtle — a soft container",
      description: "The bar floats, and the current item gets a soft brand-tinted container "
        + "around icon and label. The lightest of the filled indicators.",
      code: `<BottomNav indicator="subtle" label="Garage" current={route} items={items} />`,
      embed: true,
      render: () => demo({indicator: "subtle", label: "Garage subtle", inicial: "fuel"}),
    },
    {
      title: "Floating pill — the same container, fully rounded",
      description: "Identical to subtle except for the radius. Nothing else changes, which is the "
        + "point of separating layout from indicator.",
      code: `<BottomNav indicator="pill" label="Garage" current={route} items={items} />`,
      embed: true,
      render: () => demo({indicator: "pill", label: "Garage pill", inicial: "fuel"}),
    },
    {
      title: "Floating circle — the fill wraps only the icon",
      description: "The label stays below the circle, outside it. This is what WhatsApp does, and "
        + "it is the shape that survives long names.",
      code: `<BottomNav indicator="circle" label="Garage" current={route} items={items} />`,
      embed: true,
      render: () => demo({indicator: "circle", label: "Garage circle", inicial: "fuel"}),
    },
    {
      title: "Floating circle raised — depth instead of colour",
      description: "The circle becomes a surface of its own, lifted off the bar. The only "
        + "indicator that separates by elevation rather than by fill.",
      code: `<BottomNav indicator="circle-raised" label="Garage" current={route} items={items} />`,
      embed: true,
      render: () => demo({indicator: "circle-raised", label: "Garage raised", inicial: "fuel"}),
    },
    {
      title: "Floating circle bold — solid gold",
      description: "The only indicator that fills with the brand colour, so it is the only one "
        + "that flips the whole foreground — icon, label and counter inside the shape.",
      code: `<BottomNav indicator="circle-bold" label="Garage" current={route} items={items} />`,
      embed: true,
      render: () => demo({indicator: "circle-bold", label: "Garage bold", inicial: "fuel"}),
    },
    {
      title: "Floating circle subtle — a ring, no fill",
      description: "An outline around the icon frame. It marks position without adding mass, "
        + "which is what a navigation bar wants.",
      code: `<BottomNav indicator="circle-outline" label="Garage" current={route} items={items} />`,
      embed: true,
      render: () => demo({indicator: "circle-outline", label: "Garage ring", inicial: "fuel"}),
    },
    {
      title: "A dot, when there is no number",
      description:
        "An empty badge is the plain dot that means \"something new\". It has no accessible name — "
        + "there is nothing to read — so put the meaning in the label.",
      code: `<BottomNav
  variant="edge"
  label="Garage"
  current={route}
  items={[
    {id: "garage", label: "Garage", icon: "car", href: "/"},
    {id: "fuel", label: <>Fuel <span className="sr-only">(new)</span></>, icon: "gas-station", href: "/fuel", badge: ""},
  ]}
/>`,
      embed: true,
      render: () => demo({variant: "edge", label: "Garage dot", inicial: "garage", items: [
        {id: "garage", label: "Garage", icon: "car"},
        {id: "fuel", label: h("span", null, "Fuel ", h("span", {className: "sr-only"}, "(new)")),
          icon: "gas-station", badge: ""},
        {id: "service", label: "Service", icon: "tools"},
        {id: "me", label: "Profile", icon: "user"}]}),
    },
    {
      title: "Driven by a router",
      description:
        "An item without href is a <button>. Same skin, same aria-current — what changes is who "
        + "performs the navigation. Three to five destinations is the range this component is "
        + "for; with two, a segmented control usually says it better.",
      code: `<BottomNav
  label="Garage router"
  current={route}
  items={[
    {id: "garage", label: "Garage", icon: "car", onClick: () => go("/")},
    {id: "fuel", label: "Fuel", icon: "gas-station", onClick: () => go("/fuel")},
    {id: "service", label: "Service", icon: "tools", onClick: () => go("/service")},
  ]}
/>`,
      embed: true,
      render: () => demo({label: "Garage router", inicial: "fuel", items: ITENS.slice(0, 3)}),
    },
  ],
};
