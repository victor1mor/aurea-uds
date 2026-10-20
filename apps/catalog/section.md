# Section

An edge-to-edge band of a website page, with its own surface, site spacing and, optionally, its own theme. variant="footer" makes it the site's footer.

## Usage

```tsx
import {Section} from "@aurea-uds/react";
```

```tsx
<Section theme="dark" aria-labelledby="t-app">
  <Container>
    <Grid columns={12}>
      <Grid.Item span={{base: "12", viewport: {md: "7"}}}>
        <Heading id="t-app" level={2}>O app no seu bolso</Heading>
      </Grid.Item>
      <Grid.Item span={{base: "12", viewport: {md: "5"}}}>
        <Button tone="brand">Baixar</Button>
      </Grid.Item>
    </Grid>
  </Container>
</Section>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `surface` | `"background" \| "card" \| "inset"` | "background" | The band's background: the page's (the default), a card surface, or the recessed inset surface. |
| `spacing` | `"sm" \| "md"` | "md" | The space above and below: md is --space-16 (64) and --space-24 (96) from the md breakpoint up; sm is half of that. Aurea's choice from existing tokens: none of the references had a section to read. |
| `theme` | `"light" \| "dark"` | — | A theme for this band only: theme="dark" makes a dark band inside a light page, and the other way round. The background, the text and every piece inside follow the band's theme, and the page's light-theme rules do not leak into it. |
| `variant` | `"base" \| "footer"` | "base" | footer makes the band the website's footer: a <footer> with the brand, the link columns and the legal line, its content already in a Container. Surface, spacing and theme keep working — a dark footer on a light page is theme="dark". On a phone everything stacks in one column. |
| `brand` | `ReactNode` | — | Footer only: the brand and a short line, top left. |
| `links` | `SectionFooterGroup[]` | — | Footer only: the link columns, each { title, items }. The items are SidebarItem (id, label, href, render), the same shape as the menus. From 768px the columns share the width, each at least 8rem. |
| `legal` | `ReactNode` | — | Footer only: the bottom line — rights, terms, privacy — under a hairline. |
| `layout` | `"columns" \| "inline"` | "columns" | Only on footer: columns is the large site footer; inline is ONE centred line, as the reference's home page footer — the legal sentence, the links (without the column titles) and the children (social icons). The brand does not go in. |
| `maxWidth` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "docs" \| "full"` | "xl" | Footer only: how far the content grows, on the Container's scale. |
| `navLabel` | `string` | "Footer" | Footer only: the footer navigation's name for screen readers. Pass it in the page's language. |
| `children` | `ReactNode` | — | The band's content, usually inside a Container. |
| `className` | `string` | — | Extra classes on the <section>. |
