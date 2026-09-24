import {render, screen, act} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AppShell, AureaProvider, Button, useDensity, useTheme,
} from "../../packages/react/src/index";

// G-CAP-24 e o eixo que ninguém tinha notado que faltava.
//
// O runtime vanilla (`window.Aurea`) expunha `setTheme`, `toggleTheme` e `setDensity` desde
// sempre. O pacote React não expunha NENHUM dos três — e ninguém tinha reparado na densidade,
// que o `CLAUDE.md` chama de identidade do sistema. O resultado medido em 21/08/2026: o catálogo
// e os docs resolviam tema cada um por conta própria, já divergindo em marcação e em ARIA, e
// quem instalava só `@aurea-uds/react` não tinha como trocar nem tema nem densidade.
//
// O que se cobra aqui é o CONTRATO. Um hook que devolve um valor passa em qualquer teste; o que
// tem de ser provado é que o valor CHEGA ao `<html>`, que o markup existente é ADOTADO em vez
// de sobrescrito, e que o modo controlado obedece a quem manda.

function Sonda() {
  const {theme, toggleTheme} = useTheme();
  const {density, setDensity} = useDensity();
  return <>
    <p data-testid="tema">{theme ?? "—"}</p>
    <p data-testid="densidade">{density ?? "—"}</p>
    <Button onClick={toggleTheme}>Alternar</Button>
    <Button onClick={() => setDensity("compact")}>Compactar</Button>
  </>;
}
const raiz = () => document.documentElement;
beforeEach(() => { delete raiz().dataset.theme; delete raiz().dataset.density; });

// ── o valor chega ao documento ─────────────────────────────────────────────
// É o teste que separa "o hook devolve algo" de "a página mudou". Sem isto, um provider que
// guardasse o tema só em estado passaria — e nada na tela mudaria, porque quem pinta é o
// atributo no `<html>`.
test("o tema semeado chega ao <html>", () => {
  render(<AureaProvider defaultTheme="light"><Sonda /></AureaProvider>);
  expect(raiz().dataset.theme).toBe("light");
  expect(screen.getByTestId("tema").textContent).toBe("light");
});

test("a densidade semeada chega ao <html>", () => {
  render(<AureaProvider defaultDensity="spacious"><Sonda /></AureaProvider>);
  expect(raiz().dataset.density).toBe("spacious");
  expect(screen.getByTestId("densidade").textContent).toBe("spacious");
});

// ── e o markup existente é ADOTADO, não atropelado ─────────────────────────
// Esta é a trava que protege a razão de o atributo estar no markup: ele existe para não haver
// piscada de tema no carregamento. Um provider que impusesse o próprio default na primeira
// pintura reintroduziria exatamente a piscada que o atributo evita.
test("sem semente, o provider adota o que o documento já traz", () => {
  raiz().dataset.theme = "light";
  raiz().dataset.density = "compact";
  render(<AureaProvider><Sonda /></AureaProvider>);
  expect(screen.getByTestId("tema").textContent, "sobrescrever o markup causaria piscada").toBe("light");
  expect(screen.getByTestId("densidade").textContent).toBe("compact");
  expect(raiz().dataset.theme).toBe("light");
});

// ── a inversão é do provider, não do consumidor ────────────────────────────
// `toggleTheme` existe porque é o gesto real: um botão de tema não escolhe entre dois valores,
// ele inverte o atual. Deixar a inversão para quem consome foi como o catálogo e os docs
// acabaram com duas implementações divergentes da mesma conta.
test("toggleTheme inverte, e o <html> acompanha", async () => {
  const user = userEvent.setup();
  render(<AureaProvider defaultTheme="dark"><Sonda /></AureaProvider>);
  await user.click(screen.getByRole("button", {name: "Alternar"}));
  expect(raiz().dataset.theme).toBe("light");
  await user.click(screen.getByRole("button", {name: "Alternar"}));
  expect(raiz().dataset.theme).toBe("dark");
});

test("setDensity troca a densidade no documento", async () => {
  const user = userEvent.setup();
  render(<AureaProvider defaultDensity="comfortable"><Sonda /></AureaProvider>);
  await user.click(screen.getByRole("button", {name: "Compactar"}));
  expect(raiz().dataset.density).toBe("compact");
});

// ── controlado: quem manda é quem passa a prop ─────────────────────────────
test("em modo controlado o hook não muda sozinho, e avisa quem manda", async () => {
  const user = userEvent.setup();
  const avisos: string[] = [];
  render(<AureaProvider theme="dark" onThemeChange={t => avisos.push(t)}><Sonda /></AureaProvider>);
  await user.click(screen.getByRole("button", {name: "Alternar"}));
  expect(screen.getByTestId("tema").textContent, "controlado não pode mudar por conta própria").toBe("dark");
  expect(avisos, "mas tem de avisar o dono do estado").toEqual(["light"]);
});

// ── fora do provider, no-op em vez de explosão ─────────────────────────────
// Um componente isolado num teste, ou renderizado antes do provider subir, não deve morrer.
test("fora do AureaProvider os hooks devolvem indefinido e não lançam", () => {
  expect(() => render(<Sonda />)).not.toThrow();
  expect(screen.getByTestId("tema").textContent).toBe("—");
});

// ── G-A11Y-03: o link de pular ─────────────────────────────────────────────
// WCAG 2.2 SC 2.4.1 (Bypass Blocks), nível A. Medido em 21/08/2026: existia só no
// `apps/docs/index.html`, escrito à mão — o core não tinha, o AppShell não tinha, e as 200
// páginas do catálogo não tinham. A página de demonstração era acessível e o componente que o
// consumidor instala não era.
test("AppShell entrega o link de pular como PRIMEIRO tabulável, e ele aponta para o <main>", () => {
  const {container} = render(
    <AureaProvider><AppShell brand="Aurea" navigation={<a href="#a">Um</a>}>conteúdo</AppShell></AureaProvider>);
  const link = container.querySelector("a.skip-link") as HTMLAnchorElement;
  expect(link, "sem link não há como pular a navegação").not.toBeNull();

  // Primeiro tabulável: o critério não é "existe um link", é "dá para chegar nele antes da
  // navegação". Um link correto no fim do documento não bypassa nada.
  const tabulaveis = [...container.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')];
  expect(tabulaveis[0], "o link tem de vir antes do menu e da navegação").toBe(link);

  // E o alvo tem de existir DE VERDADE: href para id inexistente é o defeito clássico aqui.
  const alvo = container.querySelector(link.getAttribute("href")!);
  expect(alvo, `o href ${link.getAttribute("href")} não aponta para nenhum elemento`).not.toBeNull();
  expect(alvo!.tagName).toBe("MAIN");
  // `tabIndex=-1` no alvo: sem ele o navegador move o foco para o <main> em alguns motores e
  // não em outros, e o leitor de tela continua lendo do topo.
  expect(alvo!.getAttribute("tabindex")).toBe("-1");
});

test("o rótulo do link vem do dicionário, e traduz", () => {
  render(<AureaProvider strings={{skipToContent: "Pular"}}>
    <AppShell brand="A" navigation={<span />}>x</AppShell></AureaProvider>);
  expect(screen.getByRole("link", {name: "Pular"})).toBeTruthy();
});
