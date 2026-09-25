// B-02 na WEB · `Text`, `Heading`, `Paragraph` e `Code`, no molde do HeroUI 3.2.6. O que se prova
// aqui é o ELEMENTO e a CLASSE: o elemento é o que o leitor de tela entende (h1…h6, p, code), e a
// classe é o papel. O efeito das classes (tamanho, cor, fundo) é medido no navegador, no
// `skin.spec.ts`, porque o jsdom não calcula CSS.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {Code, Heading, Paragraph, Text} from "../../packages/react/src/index.js";

const el = (ui: React.ReactElement) => render(ui).container.firstElementChild as HTMLElement;

describe("B-02 · web · Text", () => {
  it("é um span no papel body por padrão", () => {
    const e = el(<Text>corpo</Text>);
    expect(e.tagName).toBe("SPAN");
    expect(e.className).toBe("typography typography-body");
  });
  it("type troca só o papel, não o elemento — um h2 visual não é título", () => {
    const e = el(<Text type="h2">x</Text>);
    expect(e.tagName).toBe("SPAN");
    expect(e.classList.contains("typography-h2")).toBe(true);
  });
  it("cor, peso, alinhamento, corte e a classe de quem usa", () => {
    const e = el(<Text color="muted" weight="bold" align="center" truncate className="minha" id="t">x</Text>);
    for (const c of ["typography-muted", "typography-weight-bold", "typography-align-center", "typography-truncate", "minha"]) {
      expect(e.classList.contains(c), c).toBe(true);
    }
    expect(e.id).toBe("t");
  });
  it("cor normal não põe classe", () => {
    expect(el(<Text color="default">x</Text>).classList.contains("typography-muted")).toBe(false);
  });
});

describe("B-02 · web · Heading, Paragraph e Code", () => {
  it("Heading: o nível é o elemento e o papel, e começa no h1", () => {
    expect(el(<Heading>x</Heading>).tagName).toBe("H1");
    const e = el(<Heading level={3}>x</Heading>);
    expect(e.tagName).toBe("H3");
    expect(e.classList.contains("typography-h3")).toBe(true);
  });
  it("Paragraph: um p, nos três tamanhos", () => {
    expect(el(<Paragraph>x</Paragraph>).className).toBe("typography typography-body");
    const e = el(<Paragraph size="sm">x</Paragraph>);
    expect(e.tagName).toBe("P");
    expect(e.classList.contains("typography-body-sm")).toBe(true);
    expect(el(<Paragraph size="xs">x</Paragraph>).classList.contains("typography-body-xs")).toBe(true);
  });
  it("Code: um code no papel code", () => {
    const e = el(<Code>npm i</Code>);
    expect(e.tagName).toBe("CODE");
    expect(e.className).toBe("typography typography-code");
  });
  it("o ref chega no elemento", () => {
    const r = React.createRef<HTMLHeadingElement>();
    render(<Heading level={2} ref={r}>x</Heading>);
    expect(r.current?.tagName).toBe("H2");
  });
});
