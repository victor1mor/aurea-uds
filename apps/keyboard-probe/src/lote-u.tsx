// BANCO DO LOTE U (19/10/2026): o aviso de cookies (GAR-19), a abertura de página (GAR-21 e GAR-22) e o Chip (GAR-20),
// montados com o código de verdade, numa página inteira — a abertura precisa da largura da janela, e o aviso, do alto
// da página. Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/aviso-de-cookies.spec.ts`.
// O endereço escolhe: `?pt` (as frases em português), `?tema=light`, `?guardado` (volta com uma escolha já guardada).
import {StrictMode, useState} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, Badge, Banner, Button, Chip, Cluster, Container, Image, Input, InputGroup, InputGroupAddon, Link, Section,
  ptBR, type ConsentAction, type ConsentChoice} from "@aurea-uds/react";
import "@aurea-uds/core/css";
// A fonte da Aurea, pelo caminho do pacote no repositório: este banco é olhado na bancada, e sem ela o título sai na
// fonte do sistema (o pacote de fontes não é dependência do banco).
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";

const q = new URLSearchParams(location.search);
if (q.get("tema") === "light") document.documentElement.dataset.theme = "light";
const pt = q.has("pt");
if (pt) document.documentElement.lang = "pt-BR";

const CATEGORIAS = pt ? [
  {id: "necessarios", label: "Necessários", description: "Fazem o site funcionar: o login, o carrinho, a sua escolha de cookies.", required: true},
  {id: "medicao", label: "Medição", description: "Contam as visitas, sem dizer quem você é, para melhorar o site."},
  {id: "marketing", label: "Marketing", description: "Mostram anúncios do que você viu aqui em outros sites."},
] : [
  {id: "necessary", label: "Necessary", description: "They make the site work: sign-in, the cart, your cookie choice.", required: true},
  {id: "analytics", label: "Analytics", description: "They count visits, without saying who you are, to improve the site."},
  {id: "marketing", label: "Marketing", description: "They show ads for what you saw here on other sites."},
];

// A "foto", como a do catálogo: SVG em data URI, sem rede.
const FOTO = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
  + '<rect width="300" height="200" fill="#3f3f46"/>'
  + '<circle cx="150" cy="100" r="54" fill="#eab308"/></svg>');

declare global { interface Window { __consent: {choice: ConsentChoice; action: ConsentAction}[] } }
window.__consent = [];

function Pagina() {
  // O app guarda a escolha e deixa de mostrar o aviso; o link do rodapé mostra de novo, com a escolha guardada.
  const [guardado, setGuardado] = useState<ConsentChoice | undefined>(q.has("guardado")
    ? Object.fromEntries(CATEGORIAS.map((c, n) => [c.id, n !== 2])) : undefined);
  const [mostrar, setMostrar] = useState(!q.has("guardado"));
  return <>
    {mostrar && <Banner variant="consent" categories={CATEGORIAS} value={guardado} onDismiss={() => setMostrar(false)}
      onConsent={(choice, action) => { window.__consent.push({choice, action}); setGuardado(choice); }}>
      <p>{pt
        ? <>Usamos cookies necessários para o site funcionar e, se você deixar, outros para medir as visitas e mostrar anúncios. <Link href="#privacidade">Política de privacidade</Link>.</>
        : <>We use necessary cookies to make this site work and, if you allow it, others to measure visits and show ads. <Link href="#privacy">Privacy policy</Link>.</>}</p>
    </Banner>}
    <a className="skip-link" href="#conteudo">{pt ? "Pular para o conteúdo" : "Skip to content"}</a>
    <main id="conteudo">
      <Section variant="hero" eyebrow={<Badge tone="primary" emphasis="flat">New in 2.0</Badge>}
        title="Plan the week in one screen" description="Tasks, people and dates side by side, on the web and on the phone."
        actions={<><Button variant="primary" href="#start">Get started</Button><Button variant="outline" href="#tour">Take the tour</Button></>}
        media={<Image src={FOTO} alt="The app's week view" ratio="4/3"/>}/>
      <Section variant="hero" align="center" surface="card"
        eyebrow={<Badge tone="primary" emphasis="flat">Version 2.0 is out</Badge>}
        title={<>One design system.<br/>Web and native, one look.</>}
        description="The same look on both sides, made for people who see little."
        actions={<><Button variant="primary" href="#start">Get started</Button><Button variant="outline" href="#components">View components</Button></>}>
        <Link href="#github">Open source on GitHub</Link>
      </Section>
      <Section variant="hero" title="Get the monthly notes" description="One e-mail a month with what changed. No spam."
        actions={<form onSubmit={(e) => e.preventDefault()}><InputGroup>
          <Input type="email" name="email" autoComplete="email" aria-label="E-mail address" placeholder="you@example.com" required/>
          <InputGroupAddon side="end" layout="inline"><Button type="submit" variant="primary" size="sm">Subscribe</Button></InputGroupAddon>
        </InputGroup></form>}/>
      <Section spacing="sm" aria-label="Chip">
        <Container><Cluster id="chips">
          <Chip tone="success">Paid</Chip><Badge tone="success">Paid</Badge>
          <Chip tone="primary" emphasis="solid">New</Chip><Badge tone="primary" emphasis="solid">New</Badge>
          <Chip tone="blue">Design</Chip><Badge tone="blue">Design</Badge>
        </Cluster></Container>
      </Section>
    </main>
    <Section variant="footer" spacing="sm" legal="© 2026 Acme"
      links={[{title: pt ? "Ajuda" : "Help", items: [{id: "cookies", label: pt ? "Preferências de cookies" : "Cookie settings", href: "#cookies"}]}]}>
      {/* O jeito direto de mudar a escolha (o guia da ANPD): o mesmo aviso, de novo, com o que está guardado. */}
      <Button id="mudar" variant="secondary" size="sm" onClick={() => setMostrar(true)}>{pt ? "Mudar cookies" : "Change cookies"}</Button>
    </Section>
    <output id="escolha">{guardado ? JSON.stringify(guardado) : ""}</output>
  </>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider strings={pt ? ptBR : undefined} spriteUrl={sprite}><Pagina/></AureaProvider></StrictMode>);
