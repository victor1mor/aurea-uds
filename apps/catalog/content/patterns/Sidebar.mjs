// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Navigation",
    name: "The main navigation of an application",
    description: "Collapsing keeps the icons and drops the labels — it narrows the column, it does not hide the navigation. On a narrow screen the AppShell turns the same sidebar into a drawer, so there is one navigation, not two.",
    uses: ["Sidebar"],
    // EMBED, e não render inline, pela mesma razão medida que os exemplos de `content/Sidebar.mjs`
    // já tinham: a `.sidebar` mede `height:calc(100vh - …)`, e `100vh` é o VIEWPORT, não a caixa
    // da prévia. Dentro da página do catálogo ela media 697px numa caixa de 402px, e a prévia
    // passava a exigir rolagem — que é o que a ADR-0002 diz que nenhuma deve. Num documento
    // próprio o `100vh` é a altura do <iframe>, que É a caixa. A varredura pegou isto em
    // 29/08/2026: o padrão veio de uma linhagem onde este gate não existia.
    // `embed` SIM, `layoutProprio` NÃO: o que este padrão precisa do documento próprio é a
    // ALTURA (a `.sidebar` mede `100vh`, e num <iframe> isso é a caixa). Ele não monta landmark
    // nenhum — a prévia passa `role="presentation"` de propósito —, então a moldura tem de
    // continuar dando o <main>. Com `layoutProprio` o embed ficava SEM main, e o axe reprovou
    // com `landmark-one-main` em 29/08/2026.
    embed: true,
    code: `<Sidebar
  label="Main"
  current="runs"
  items={[
    {id: "overview", label: "Overview", icon: "dashboard", href: "#"},
    {id: "runs", label: "Runs", icon: "play", href: "#"},
    {id: "members", label: "Members", icon: "user--multiple", href: "#"},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(260px,100%)"}}, h(A.Sidebar, {
      // `role="presentation"` na PRÉVIA, como o `Sidebar.mjs` de conteúdo rico já fazia: o
      // <aside> é um landmark `complementary`, e dentro do <main> da página do catálogo ele
      // vira complementary aninhado — o axe reprovou em 22/08/2026. Num app de verdade ele é
      // filho do AppShell e o landmark está certo, que é o que o `code` mostra.
      role: "presentation",
      label: "Main", current: "runs", items: [
        {id: "overview", label: "Overview", icon: "dashboard", href: "#"},
        {id: "runs", label: "Runs", icon: "play", href: "#"},
        {id: "members", label: "Members", icon: "user--multiple", href: "#"}]})),
  },
];
