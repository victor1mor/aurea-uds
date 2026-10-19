// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// GAR-06 (07/10/2026): o rodapé de site é a `Section` com `variant="footer"`.
// GAR-21 (19/10/2026): a abertura de página é a `Section` com `variant="hero"`.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {FOTO} from "../_starters.mjs";
// DUAS colunas, e não três (13/10/2026): na coluna de conteúdo do site novo a prévia tem 766 de largura, a
// grade das colunas pede 8rem cada, e a terceira descia para uma segunda linha — o rodapé passava 14px
// da caixa (o `catalog-sweep` pegou). Quem cede é o exemplo, não a caixa (ADR-0002).
const COLUNAS = [
  {title: "Product", items: [{id: "pricing", label: "Pricing", href: "#"}, {id: "changelog", label: "Changelog", href: "#"}]},
  {title: "Company", items: [{id: "about", label: "About", href: "#"}, {id: "contact", label: "Contact", href: "#"}]},
];
// A abertura, nas três formas do pedido (GAR-21). Na prévia, a faixa tem a largura da coluna do site: o título segue a
// largura da FAIXA, e não a da janela, então aqui ele aparece no tamanho de uma faixa estreita. A página inteira, larga,
// está no Início do site, que usa a mesma peça.
// `embed` + `tituloProprio` (19/10/2026), como os padrões do AppShell: a abertura traz o <h1> do DOCUMENTO, e dentro da
// página do padrão ela fazia dois h1; e a imagem, que desce na faixa estreita, passava 468 da caixa. A varredura do
// catálogo pegou os dois. Em documento próprio, o h1 é o da página, e a prévia rola dentro da moldura dela.
export default [
  {
    variant: "Hero",
    embed: true,
    tituloProprio: true,
    name: "The page opening, text beside the proof",
    description: "variant=\"hero\" is the opening of a page: an eyebrow, the title (the page's h1), a line of text, the buttons, and the image beside it. The title grows with the width of the band, not of the window — 36, then 60 from 768 and 72 from 1024 — and the image sits beside the text from 1024; below that, it goes under. The image takes the width of its column: size it in the app.",
    uses: ["Section", "Badge", "Button", "Image"],
    code: `<Section
  variant="hero"
  eyebrow={<Badge tone="primary" emphasis="flat">New in 2.0</Badge>}
  title="Plan the week in one screen"
  description="Tasks, people and dates side by side, on the web and on the phone."
  actions={<>
    <Button variant="primary" href="/start">Get started</Button>
    <Button variant="outline" href="/tour">Take the tour</Button>
  </>}
  media={<Image src="/week.png" alt="The app's week view" ratio="4/3" />}
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Section, {variant: "hero", spacing: "sm",
      eyebrow: h(A.Badge, {tone: "primary", emphasis: "flat"}, "New in 2.0"),
      title: "Plan the week in one screen",
      description: "Tasks, people and dates side by side, on the web and on the phone.",
      actions: [h(A.Button, {key: "a", variant: "primary", href: "#"}, "Get started"),
        h(A.Button, {key: "b", variant: "outline", href: "#"}, "Take the tour")],
      media: h(A.Image, {src: FOTO, alt: "The app's week view", ratio: "4/3"})})),
  },
  {
    variant: "Hero",
    embed: true,
    tituloProprio: true,
    name: "The page opening, centred",
    description: "align=\"center\" puts everything on the middle line, with the image (if any) under the text. What comes inside the Section goes after the buttons: a short note, a link.",
    uses: ["Section", "Badge", "Button"],
    code: `<Section
  variant="hero"
  align="center"
  eyebrow={<Badge tone="primary" emphasis="flat">Version 2.0 is out</Badge>}
  title="One design system. Web and native."
  description="The same look on both sides, made for people who see little."
  actions={<>
    <Button variant="primary" href="/start">Get started</Button>
    <Button variant="outline" href="/components">View components</Button>
  </>}
>
  <Link href="/github">Open source on GitHub</Link>
</Section>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Section, {variant: "hero", align: "center", spacing: "sm",
      eyebrow: h(A.Badge, {tone: "primary", emphasis: "flat"}, "Version 2.0 is out"),
      title: "One design system. Web and native.",
      description: "The same look on both sides, made for people who see little.",
      actions: [h(A.Button, {key: "a", variant: "primary", href: "#"}, "Get started"),
        h(A.Button, {key: "b", variant: "outline", href: "#"}, "View components")]},
      h(A.Link, {href: "#"}, "Open source on GitHub"))),
  },
  {
    variant: "Hero",
    embed: true,
    tituloProprio: true,
    name: "The page opening with an e-mail field",
    description: "actions takes anything: here, the e-mail field with its button, inside a form. The field keeps its name for the screen reader (aria-label), because the placeholder is not a label.",
    uses: ["Section", "InputGroup", "Input", "Button"],
    code: `<Section
  variant="hero"
  title="Get the monthly notes"
  description="One e-mail a month with what changed. No spam."
  actions={
    <form onSubmit={subscribe}>
      <InputGroup>
        <Input type="email" name="email" autoComplete="email" aria-label="E-mail address" placeholder="you@example.com" required />
        <InputGroupAddon side="end" layout="inline">
          <Button type="submit" variant="primary" size="sm">Subscribe</Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  }
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Section, {variant: "hero", spacing: "sm",
      title: "Get the monthly notes",
      description: "One e-mail a month with what changed. No spam.",
      actions: h("form", {action: "#"}, h(A.InputGroup, null,
        h(A.Input, {type: "email", name: "email", autoComplete: "email", "aria-label": "E-mail address", placeholder: "you@example.com", required: true}),
        h(A.InputGroupAddon, {side: "end", layout: "inline"}, h(A.Button, {type: "submit", variant: "primary", size: "sm"}, "Subscribe"))))})),
  },
  {
    variant: "Footer",
    name: "The website footer, dark on a light page",
    description: "variant=\"footer\" turns the band into the footer: brand, link columns and the legal line, already inside a Container. It keeps the band's theme, so a dark footer on a light page is theme=\"dark\". On a phone everything stacks.",
    uses: ["Section"],
    code: `<Section
  variant="footer"
  theme="dark"
  spacing="sm"
  brand={<strong>Acme</strong>}
  links={columns}
  legal="© 2026 Acme. All rights reserved."
  navLabel="Footer"
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Section, {variant: "footer", theme: "dark", spacing: "sm",
      brand: h("strong", null, "Acme"), links: COLUNAS, legal: "© 2026 Acme. All rights reserved."})),
  },
];
