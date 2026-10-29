// E19 (achado do app, 28/10/2026): a ficha dizia que o tom `link` era "o amarelo feito para texto", e que o `primary`
// "quase some no claro". Era verdade até a 0.44.0; desde a paleta da 1.0 (ADR-0083), no claro o amarelo nunca é letra:
// o `link` é a cor do texto com o marca-texto (no escuro, o amarelo sublinhado), e o `primary` é o destaque sem marca.
// A frase velha levou o app a pôr `tone="link"` em texto que não se toca — e sublinhado e marca-texto dizem "toque aqui".
// As quatro fichas que têm o `tone` (Text, Heading, Paragraph, Code) dizem agora para que serve cada um. Com o texto de
// antes, as quatro reprovam.
import {readFileSync} from "node:fs";
import {describe, expect, it} from "vitest";

const tom = (nome: string): string => {
  const ficha = JSON.parse(readFileSync(`packages/contracts/registry/${nome}.json`, "utf8"));
  return ficha.props.find((p: {name: string}) => p.name === "tone").description;
};

describe("E19 · a ficha diz para que serve o tom link", () => {
  it.each(["Text", "Heading", "Paragraph", "Code"])("%s", (nome) => {
    const d = tom(nome);
    expect(d).not.toMatch(/yellow made for text|nearly disappears/);
    expect(d).toMatch(/link is for a real link only/);
    expect(d).toMatch(/emphasis that is not a link, use primary/);
  });
});
