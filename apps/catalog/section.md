# Section

An edge-to-edge band of a website page, with its own surface, site spacing and, optionally, its own theme. variant="footer" makes it the site's footer; variant="hero" makes it the page opening.

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

## Examples

### Surfaces

The band's background: the page's (the default), a card surface, or the recessed inset one.

```tsx
<Section spacing="sm" surface="background"><Container>surface background</Container></Section>
<Section spacing="sm" surface="card"><Container>surface card</Container></Section>
<Section spacing="sm" surface="inset"><Container>surface inset</Container></Section>
```

### A theme for the band

The band takes its own theme, whatever the page's: a dark band in a light page, or the other way round.

```tsx
<Section spacing="sm" theme="light"><Container>theme light</Container></Section>
<Section spacing="sm" theme="dark"><Container>theme dark</Container></Section>
```

### Footer widths

On the footer, how far the content grows, on the Container's scale. inline is the one-line footer.

```tsx
<Section variant="footer" layout="inline" legal="© 2026 Acme" maxWidth="sm" />
<Section variant="footer" layout="inline" legal="© 2026 Acme" maxWidth="md" />
<Section variant="footer" layout="inline" legal="© 2026 Acme" maxWidth="lg" />
<Section variant="footer" layout="inline" legal="© 2026 Acme" maxWidth="xl" />
<Section variant="footer" layout="inline" legal="© 2026 Acme" maxWidth="2xl" />
<Section variant="footer" layout="inline" legal="© 2026 Acme" maxWidth="docs" />
<Section variant="footer" layout="inline" legal="© 2026 Acme" maxWidth="full" />
```

### An opening further down

On the hero, the title is the page's h1 by default; titleAs="h2" when the band opens a section further down the page.

```tsx
<Section variant="hero" spacing="sm" title="Reports, ready by nine" description="Every team gets its numbers before the first meeting." titleAs="h2" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `surface` | `"background" \| "card" \| "inset"` | "background" | The band's background: the page's (the default), a card surface, or the recessed inset surface. |
| `spacing` | `"sm" \| "md"` | "md" | The space above and below: md is --space-16 (64) and --space-24 (96) from the md breakpoint up; sm is half of that. Aurea's choice from existing tokens: none of the references had a section to read. |
| `theme` | `"light" \| "dark"` | — | A theme for this band only: theme="dark" makes a dark band inside a light page, and the other way round. The background, the text and every piece inside follow the band's theme, and the page's light-theme rules do not leak into it. |
| `variant` | `"base" \| "footer" \| "hero"` | "base" | footer makes the band the website's footer: a <footer> with the brand, the link columns and the legal line, its content already in a Container. Surface, spacing and theme keep working — a dark footer on a light page is theme="dark". On a phone everything stacks in one column. `hero` is the opening of a page: eyebrow, title, text, buttons or an e-mail field, and an image beside them; on a phone, everything stacks. |
| `brand` | `ReactNode` | — | Footer only: the brand and a short line, top left. |
| `links` | `SectionFooterGroup[]` | — | Footer only: the link columns, each { title, items }. The items are SidebarItem (id, label, href, render), the same shape as the menus. From 768px the columns share the width, each at least 8rem. |
| `legal` | `ReactNode` | — | Footer only: the bottom line — rights, terms, privacy — under a hairline. |
| `layout` | `"columns" \| "inline"` | "columns" | Only on footer: columns is the large site footer; inline is ONE centred line, as the reference's home page footer — the legal sentence, the links (without the column titles) and the children (social icons). The brand does not go in. |
| `maxWidth` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "docs" \| "full"` | "xl" | Footer only: how far the content grows, on the Container's scale. |
| `navLabel` | `string` | "Footer" | Footer only: the footer navigation's name for screen readers. Pass it in the page's language. |
| `title` | `ReactNode` | — | Only on hero: the title of the opening, the page's h1. It grows with the width of the BAND, not of the window: --text-4xl (36), --text-6xl (60) from 768 and --text-7xl (72) from 1024. On the other variants a string here is still the HTML title attribute. |
| `titleAs` | `"h1" \| "h2"` | "h1" | Only on hero: the tag of the title. The opening is the start of the page, so h1; h2 when the band opens a section further down. |
| `eyebrow` | `ReactNode` | — | Only on hero: the line above the title — a badge, a short phrase, a link to what changed. 8 above the title, 16 from 1024. |
| `description` | `ReactNode` | — | Only on hero: the text under the title, glued to it. 16/24, and 18/28 from 768, at most 672 wide. |
| `actions` | `ReactNode` | — | Only on hero: the buttons, or a form with the e-mail field and its button (the form grows up to 480). 16 under the text. |
| `media` | `ReactNode` | — | Only on hero: the image, or the piece that proves what the text says. With align="start" it sits beside the text from 1024 and under it before that. It takes the width of its column: size a phone frame in the app. |
| `align` | `"start" \| "center"` | "start" | Only on hero: start puts the text on the left and the image beside it; center puts everything on the middle line, with the image under the text. What comes as children goes after the buttons. |
| `children` | `ReactNode` | — | The band's content, usually inside a Container. |
| `className` | `string` | — | Extra classes on the <section>. |
