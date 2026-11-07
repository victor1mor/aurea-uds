// A D4 da auditoria externa (decisão do Victor, 06/11/2026: "Abrir o primeiro"): o `Accordion` horizontal sem
// `defaultValue` nascia com tudo fechado — o comentário prometia "sempre há um à vista". Agora abre o primeiro item que
// não está desligado; o de pé continua fechado (como o da referência). Provado contra o defeito: com o `disclosure.tsx` de
// antes, o primeiro caso reprova (nenhum aberto).
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {Accordion} from "../../packages/react/src/disclosure.js";

const ITENS = [{id: "a", title: "A", content: "a", disabled: true}, {id: "b", title: "B", content: "b"}, {id: "c", title: "C", content: "c"}];
const abertos = (c: HTMLElement) => [...c.querySelectorAll("details")].filter((d) => d.open).map((d) => d.querySelector(".accordion-title")!.textContent);

describe("Accordion: o horizontal nasce com um à vista", () => {
  it("de lado, sem defaultValue: o primeiro que não está desligado", () => {
    expect(abertos(render(<Accordion orientation="horizontal" items={ITENS}/>).container)).toEqual(["B"]);
  });
  it("de lado, com defaultValue: o que o app pediu", () => {
    expect(abertos(render(<Accordion orientation="horizontal" items={ITENS} defaultValue={["c"]}/>).container)).toEqual(["C"]);
  });
  it("de pé, sem defaultValue: tudo fechado, como a referência", () => {
    expect(abertos(render(<Accordion items={ITENS}/>).container)).toEqual([]);
  });
});
