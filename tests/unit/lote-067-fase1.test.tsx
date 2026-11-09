// A 0.63.0 — o primeiro lote da Fase 1 do caminho até a 1.0 (09/11/2026): os defeitos que não mudam a aparência da tela
// comum. Cada teste foi rodado contra o código de antes (o `main` em `ac2d55cd`) e reprovou.
import {render, screen, act} from "@testing-library/react";
import {useEffect} from "react";
import {describe, expect, it} from "vitest";
import {AureaProvider, Link, SegmentedControl, useToast} from "../../packages/react/src/index";

describe("S-13 · o `Link external` diz ao leitor de tela que abre noutra aba", () => {
  it("o nome do link leva o aviso, em texto escondido; a seta continua decorativa", () => {
    render(<Link href="https://exemplo.com" external>Docs</Link>);
    const a = screen.getByRole("link");
    // O jsdom não carrega o CSS: a caixa escondida sai em linha, e ele cola as duas partes. No navegador ela é bloco
    // (`position:absolute`) e o espaço entra — quem mede isso é o `link-external-nome.spec.ts`, nos três navegadores.
    expect(a).toHaveAccessibleName(/^Docs ?\(opens in a new tab\)$/);
    expect(a.querySelector(".sr-only")).toHaveTextContent("(opens in a new tab)");
    expect(a.querySelector(".link-external")).toHaveAttribute("aria-hidden", "true");
  });
  it("o app troca a frase pela da língua dele", () => {
    render(<Link href="https://exemplo.com" external externalLabel="(abre em nova aba)">Documentação</Link>);
    expect(screen.getByRole("link")).toHaveAccessibleName(/^Documentação ?\(abre em nova aba\)$/);
  });
  it("o link comum não ganha aviso nenhum", () => {
    render(<Link href="/termos">termos</Link>);
    const a = screen.getByRole("link");
    expect(a).toHaveAccessibleName("termos");
    expect(a.querySelector(".sr-only")).toBeNull();
  });
});

// 2-C (a): cada `AureaProvider` montava a sua região de avisos — com um dentro do outro, a página tinha duas regiões
// "Notifications" (o `landmark-unique` do axe).
const regioes = () => document.querySelectorAll(".toast-stack");

function Avisa({titulo}: {titulo: string}) {
  const t = useToast();
  useEffect(() => { t.add({title: titulo}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

describe("2-C (a) · uma região de avisos só, com um provedor dentro de outro", () => {
  it("dois provedores aninhados: uma região", () => {
    const {unmount} = render(<AureaProvider><AureaProvider><p>miolo</p></AureaProvider></AureaProvider>);
    expect(regioes()).toHaveLength(1);
    unmount();
  });
  it("o aviso pedido dentro do provedor de dentro aparece na região de fora", async () => {
    const {unmount} = render(<AureaProvider><AureaProvider><Avisa titulo="Salvo" /></AureaProvider></AureaProvider>);
    await act(async () => {});
    expect(regioes()).toHaveLength(1);
    expect(regioes()[0]).toHaveTextContent("Salvo");
    unmount();
  });
  it("um provedor sozinho continua com a sua região", () => {
    const {unmount} = render(<AureaProvider><p>miolo</p></AureaProvider>);
    expect(regioes()).toHaveLength(1);
    unmount();
  });
});

describe("o `SegmentedControl` repassa o `className`", () => {
  const itens = [{value: "a", label: "A"}, {value: "b", label: "B"}];
  it("no grupo de escolha", () => {
    const {container} = render(<AureaProvider><SegmentedControl items={itens} value="a" className="minha" /></AureaProvider>);
    const trilho = container.querySelector(".segmented")!;
    expect(trilho).toHaveClass("minha");
    expect(trilho).toHaveClass("segmented");
  });
  it("na navegação (todos com `href`)", () => {
    const links = itens.map((i) => ({...i, href: `/${i.value}`}));
    const {container} = render(<AureaProvider><SegmentedControl items={links} value="a" className="minha" /></AureaProvider>);
    expect(container.querySelector("nav.segmented")).toHaveClass("minha");
  });
});
