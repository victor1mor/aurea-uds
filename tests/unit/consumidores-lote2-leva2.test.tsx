import {readFileSync} from "node:fs";
import {render, screen} from "@testing-library/react";
import {AppShell, AureaProvider, Card, Field, Input, Topbar} from "../../packages/react/src/index";

// LOTE 2, segunda leva (24/09/2026): B-07, B-10, B-12, A-05 e A-14. Três são acréscimo; a A-05 muda
// a aparência publicada da lateral, por decisão do Victor. Os `expect` do comportamento novo
// REPROVAVAM antes dele.

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const regra = (sel: string) => {
  const i = css.indexOf(sel + " {");
  return i < 0 ? "" : css.slice(i, css.indexOf("}", i));
};
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("B-07 · Topbar divider", () => {
  test("a linha só entra na flush, e sai do token de borda", () => {
    const {container} = wrap(<><Topbar variant="flush" divider/><Topbar variant="floating" divider/><Topbar variant="flush"/></>);
    const [a, b, c] = [...container.querySelectorAll("header")];
    expect(a).toHaveClass("topbar-flush", "topbar-divider");
    expect(b).not.toHaveClass("topbar-divider");
    expect(c).not.toHaveClass("topbar-divider");
    expect(regra(".topbar-divider")).toContain("var(--border-width) solid var(--border)");
  });
});

describe("B-10 e B-07 · AppShell", () => {
  test("contentVariant plain tira a caixa; o padrão continua a caixa", () => {
    const {container, unmount} = wrap(<AppShell brand="A">x</AppShell>);
    expect(container.querySelector("main")).toHaveClass("content");
    expect(container.querySelector("main")).not.toHaveClass("content-plain");
    unmount();
    const r = wrap(<AppShell brand="A" contentVariant="plain" topbarVariant="flush" topbarDivider>x</AppShell>);
    expect(r.container.querySelector("main")).toHaveClass("content", "content-plain");
    expect(r.container.querySelector("header")).toHaveClass("topbar-divider");
    const plain = regra(".content-plain");
    expect(plain).toContain("background:none");
    expect(plain).toContain("border:0");
  });
});

describe("B-12 · Field description", () => {
  test("a frase mora embaixo do controle, e entra na leitura na ordem da tela", () => {
    const {container} = wrap(
      <Field label="Senha" hint="opcional" description="Use pelo menos oito letras e um número." error="Curta demais">
        <Input/>
      </Field>);
    const campo = screen.getByRole("textbox", {name: "Senha"});
    const ids = (campo.getAttribute("aria-describedby") ?? "").split(" ");
    const textos = ids.map((id) => document.getElementById(id)?.textContent);
    expect(textos).toEqual(["opcional", "Use pelo menos oito letras e um número.", "Curta demais"]);
    // embaixo do controle: o nó da descrição vem DEPOIS do campo no DOM
    const desc = container.querySelector(".field-description")!;
    expect(campo.compareDocumentPosition(desc) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test("sem description, o Field de antes", () => {
    const {container} = wrap(<Field label="Nome"><Input/></Field>);
    expect(container.querySelector(".field-description")).toBeNull();
  });
});

describe("A-05 · a lateral marca o item atual com o jeito da casa", () => {
  test("texto na cor da marca da LATERAL e o fio da regra da casa", () => {
    const atual = regra(".sidebar-item[aria-current]");
    expect(atual).toContain("color:var(--sidebar-primary)");
    expect(atual).not.toContain("--sidebar-accent-foreground");
    // o fio não é cópia: a lateral está na lista da regra da casa, junto do .doc-nav
    expect(css).toMatch(/\.doc-nav a\.active::after,\.sidebar-item\[aria-current\]::after \{ content:"";/);
  });

  test("o comentário que dizia 'pílula com traço se contradizem' foi reescrito", () => {
    const fonte = readFileSync("packages/core/src/aurea.css", "utf8");
    expect(fonte).not.toMatch(/o realce de linha desta casa\s+é a PÍLULA/);
  });
});

describe("A-14 · Card deitado com Card.Media", () => {
  test("orientation horizontal põe a mídia à esquerda, com 96 de largura", () => {
    const {container} = wrap(<Card orientation="horizontal"><Card.Media><img alt="" src="x.jpg"/></Card.Media><strong>Relatório</strong></Card>);
    expect(container.querySelector(".card")).toHaveClass("card-horizontal");
    expect(container.querySelector(".card-media")).not.toBeNull();
    expect(regra(".card-horizontal")).toContain("grid-template-columns:var(--space-24) minmax(0,1fr)");
    expect(regra(".card-horizontal")).toContain("column-gap:var(--space-4)");
  });

  test("sem orientation, o cartão de antes", () => {
    const {container} = wrap(<Card>x</Card>);
    expect(container.querySelector(".card")!.className).toBe("card");
  });
});
