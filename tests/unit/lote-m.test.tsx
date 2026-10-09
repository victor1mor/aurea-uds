// Lote M (0.28.0) · os três pedidos do site, na WEB:
//   GAR-14: o `Button share` — detectar o recurso; `AbortError` não diz nada; sem o recurso, copiar e
//           avisar "Link copiado" PRESO ao botão; a cópia falhou, avisar e mostrar o link. O mesmo no
//           `aurea.js`, para o HTML puro. E o "copiado" do bloco de código, que era mudo.
//   GAR-15: o `Image frame="phone"` e a captura do escuro (`srcDark`);
//   GAR-16: `--font-heading`, o peso 800 (`extrabold`), `numeric` na tipografia e a tabela inteira
//           com algarismos da mesma largura.
// O aviso com a MEDIDA do botão se mede no navegador (`tests/visual/compartilhar.spec.ts`).
// Provado contra o defeito: na 0.27.0 o `Button` não tem `share` (a prop cai no `<button>` como
// atributo solto e o clique não faz nada), o `Image` não tem moldura, a tipografia não tem
// `numeric` nem `extrabold`, e o CSS não tem nenhuma das regras abaixo — os testes reprovam.
import {act, fireEvent, render, waitFor} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {afterEach, beforeAll, beforeEach, describe, expect, test, vi} from "vitest";
import {AureaProvider, Button, CodeBlock, Heading, IconButton, Image, Paragraph, Text, ptBR} from "../../packages/react/src/index";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const tokens = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
const fontes = readFileSync("packages/fonts/dist/fonts.css", "utf8");
/** O corpo da regra cujo seletor é EXATAMENTE este (no começo da regra, não dentro de uma lista). */
const regra = (seletor: string) => {
  const esc = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : "";
};

// ── o navegador de mentira ───────────────────────────────────────────────────────────────────────
const nav = navigator as unknown as Record<string, unknown>;
const escrever = vi.fn<(t: string) => Promise<void>>();
function semCompartilhar() {
  delete nav.share;
  delete nav.canShare;
}
function comCompartilhar(share: (d: ShareData) => Promise<void>) {
  Object.defineProperty(navigator, "share", {value: vi.fn(share), configurable: true, writable: true});
  Object.defineProperty(navigator, "canShare", {value: vi.fn(() => true), configurable: true, writable: true});
}
beforeEach(() => {
  escrever.mockReset();
  escrever.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {value: {writeText: escrever}, configurable: true});
  semCompartilhar();
});
afterEach(() => { delete (window as unknown as {Aurea?: unknown}).Aurea; });

const LINK = "https://exemplo.com.br/noticias/moto-do-ano";

describe("GAR-14 · o Button compartilha (React)", () => {
  test("a marcação que o aurea.js lê sai com o link e os textos do app", () => {
    const {container} = render(<AureaProvider strings={ptBR}><Button share={{url: LINK, title: "Moto do ano"}}>Compartilhar</Button></AureaProvider>);
    const b = container.querySelector("button")!;
    expect(b).toHaveAttribute("data-aurea-share", "");
    expect(b).toHaveAttribute("data-aurea-share-url", LINK);
    expect(b).toHaveAttribute("data-aurea-share-title", "Moto do ano");
    expect(b).toHaveAttribute("data-aurea-share-copied", "Link copiado");
    expect(b).toHaveAttribute("data-aurea-share-failed", "Não deu para copiar. Copie o link abaixo.");
  });

  test("sem `share`, o botão é o de sempre: nenhuma marca, e o clique é só do app", () => {
    const clique = vi.fn();
    const {container} = render(<AureaProvider><Button onClick={clique}>Salvar</Button></AureaProvider>);
    const b = container.querySelector("button")!;
    expect([...b.attributes].map((a) => a.name).filter((n) => n.startsWith("data-aurea-share"))).toEqual([]);
    fireEvent.click(b);
    expect(clique).toHaveBeenCalledTimes(1);
    expect(escrever).not.toHaveBeenCalled();
  });

  test("o navegador sabe compartilhar: abre a janela do aparelho com o link, e não copia", async () => {
    comCompartilhar(() => Promise.resolve());
    const {container} = render(<AureaProvider><Button share={{url: LINK, title: "Moto do ano", text: "Veja"}}>Compartilhar</Button></AureaProvider>);
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    expect(nav.share).toHaveBeenCalledWith({url: LINK, title: "Moto do ano", text: "Veja"});
    expect(escrever).not.toHaveBeenCalled();
    expect(document.querySelector(".toast-anchored")).toBeNull();
  });

  test("a pessoa cancelou (`AbortError`): nada acontece — nem cópia, nem aviso", async () => {
    comCompartilhar(() => Promise.reject(Object.assign(new Error("cancelou"), {name: "AbortError"})));
    const {container} = render(<AureaProvider><Button share={{url: LINK}}>Compartilhar</Button></AureaProvider>);
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    expect(escrever).not.toHaveBeenCalled();
    expect(document.querySelector(".toast-anchored")).toBeNull();
  });

  test("o navegador não sabe: copia o link e mostra \"Link copiado\" preso ao botão", async () => {
    const {container} = render(<AureaProvider><Button share={{url: LINK}}>Compartilhar</Button></AureaProvider>);
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    expect(escrever).toHaveBeenCalledWith(LINK);
    await waitFor(() => expect(document.querySelector(".toast-anchored")?.textContent).toBe("Link copied"));
    const aviso = document.querySelector(".toast-anchored")!;
    expect(aviso.closest(".toast-anchored-positioner"), "o motor posiciona o aviso").not.toBeNull();
    expect(aviso.querySelector(".toast-anchored-icon")).toHaveAttribute("aria-hidden", "true");
  });

  test("a cópia falhou: aviso de erro, e o link à mostra e selecionado", async () => {
    escrever.mockRejectedValue(new Error("negado"));
    const {container} = render(<AureaProvider><Button share={{url: LINK}}>Compartilhar</Button></AureaProvider>);
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    await waitFor(() => expect(document.querySelector(".toast-anchored-danger")).not.toBeNull());
    const campo = document.querySelector<HTMLInputElement>(".toast-anchored-link")!;
    expect(campo.value).toBe(LINK);
    expect(campo.readOnly).toBe(true);
    expect(document.activeElement).toBe(campo);
  });

  test("o hospedeiro do aviso é uma região viva simples: nem um 2º marco, nem um 2º status", () => {
    render(<AureaProvider><Button share={{url: LINK}}>Compartilhar</Button></AureaProvider>);
    // Achado pelo axe na suíte (landmark-unique): com a região padrão do motor, a página ficava com
    // duas "Notifications". E com `role="status"`, 21 testes que procuram O status da página achavam dois.
    expect(document.querySelectorAll('[role="region"][aria-live]')).toHaveLength(1);
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(0);
    const vivas = [...document.querySelectorAll('[aria-live="polite"]')].filter((e) => !e.hasAttribute("role"));
    expect(vivas).toHaveLength(1);
    expect(vivas[0]).not.toHaveAttribute("aria-label");
  });

  test("o clique do app que cancela (`preventDefault`) impede o compartilhar", async () => {
    const {container} = render(<AureaProvider><Button share={{url: LINK}} onClick={(e) => e.preventDefault()}>Compartilhar</Button></AureaProvider>);
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    expect(escrever).not.toHaveBeenCalled();
  });

  test("o IconButton também compartilha", async () => {
    const {container} = render(<AureaProvider><IconButton icon="share-network" label="Compartilhar link" share={{url: LINK}}/></AureaProvider>);
    await act(async () => { fireEvent.click(container.querySelector("button")!); });
    expect(escrever).toHaveBeenCalledWith(LINK);
  });

  test("fora do AureaProvider, com o aurea.js na página, o aviso é dele", async () => {
    const share = vi.fn();
    (window as unknown as {Aurea: unknown}).Aurea = {share};
    const {container} = render(<Button share={{url: LINK}}>Compartilhar</Button>);
    const b = container.querySelector("button")!;
    await act(async () => { fireEvent.click(b); });
    expect(share).toHaveBeenCalledWith(b);
  });
});

describe("GAR-14 · o aurea.js compartilha (HTML puro), e o copiar fala", () => {
  beforeAll(() => { new Function(readFileSync("packages/core/src/aurea.js", "utf8"))(); });
  const regiao = () => document.querySelector("[data-aurea-status]");
  const montar = (extra = "") => {
    document.body.innerHTML = `<button type="button" class="btn" data-aurea-share data-aurea-share-url="${LINK}" ${extra}>Compartilhar</button>`;
    return document.querySelector("button")!;
  };

  test("o window.Aurea oferece o `share` (a contraparte do Button)", () => {
    expect(typeof (window as unknown as {Aurea: {share?: unknown}}).Aurea.share).toBe("function");
  });

  test("não sabe compartilhar: copia, mostra o aviso preso ao botão e o diz pela região de status", async () => {
    const b = montar();
    await act(async () => { fireEvent.click(b); });
    expect(escrever).toHaveBeenCalledWith(LINK);
    await waitFor(() => expect(document.querySelector(".toast-anchored.toast-anchored-fixed")?.textContent).toBe("Link copied"));
    await waitFor(() => expect(regiao()?.textContent).toBe("Link copied"));
    expect(regiao()).toHaveAttribute("role", "status");
  });

  test("a cópia falhou: o link selecionado; Esc fecha e devolve o foco ao botão", async () => {
    escrever.mockRejectedValue(new Error("negado"));
    const b = montar('data-aurea-share-failed="Não deu para copiar."');
    await act(async () => { fireEvent.click(b); });
    await waitFor(() => expect(document.querySelector(".toast-anchored-stack .toast-anchored-danger")?.textContent).toBe("Não deu para copiar."));
    const campo = document.querySelector<HTMLInputElement>(".toast-anchored-link")!;
    expect(campo.value).toBe(LINK);
    expect(document.activeElement).toBe(campo);
    fireEvent.keyDown(document, {key: "Escape"});
    expect(document.querySelector(".toast-anchored-stack")).toBeNull();
    expect(document.activeElement).toBe(b);
  });

  test("sabe compartilhar: abre a janela; cancelar não diz nada", async () => {
    comCompartilhar(() => Promise.reject(Object.assign(new Error("cancelou"), {name: "AbortError"})));
    const b = montar('data-aurea-share-title="Moto do ano"');
    await act(async () => { fireEvent.click(b); });
    expect(nav.share).toHaveBeenCalledWith({url: LINK, title: "Moto do ano"});
    expect(escrever).not.toHaveBeenCalled();
  });

  test("clique já atendido pelo React (`defaultPrevented`) não compartilha de novo", async () => {
    const b = montar();
    b.addEventListener("click", (e) => e.preventDefault());
    await act(async () => { fireEvent.click(b); });
    expect(escrever).not.toHaveBeenCalled();
  });

  test("o copiar do bloco de código diz \"copiado\" ao leitor de tela", async () => {
    document.body.innerHTML = '<div data-aurea-copy-scope><button type="button" data-aurea-copy data-aurea-copy-done="Copiado">c</button><pre><code>pnpm add</code></pre></div>';
    await act(async () => { fireEvent.click(document.querySelector("button")!); });
    await waitFor(() => expect(regiao()?.textContent).toBe("Copiado"));
  });

  test("a área de transferência que não devolve promessa não quebra o clique", async () => {
    // Achado pela suíte (erro não tratado, vindo do dublê de um teste antigo): `writeText(...).then`
    // estourava quando `writeText` não devolve promessa. Nos navegadores de hoje ela sempre devolve;
    // um dublê ou um remendo antigo, não. Sem área de transferência nenhuma não quebrava — o `?.`
    // encerra a expressão inteira —, e por isso o teste usa ESTE caso.
    Object.defineProperty(navigator, "clipboard", {value: {writeText: () => undefined}, configurable: true});
    const erros: unknown[] = [];
    const ouvir = (e: ErrorEvent) => { erros.push(e.error); e.preventDefault(); };
    window.addEventListener("error", ouvir);
    try {
      const {container} = render(<CodeBlock copyable>pnpm add</CodeBlock>);
      fireEvent.click(container.querySelector("[data-aurea-copy]")!);
      // O React 19 relança o erro do manipulador num tempo SEGUINTE — olhar na hora deixava o
      // defeito passar (medido: com a linha antiga o teste passava sem esta espera).
      await new Promise((r) => setTimeout(r, 20));
      expect(erros).toEqual([]);
    } finally { window.removeEventListener("error", ouvir); }
  });

  test("o CodeBlock do React manda o texto do \"copiado\" na língua do app", () => {
    const {container} = render(<AureaProvider strings={ptBR}><CodeBlock copyable>pnpm add</CodeBlock></AureaProvider>);
    expect(container.querySelector("[data-aurea-copy]")).toHaveAttribute("data-aurea-copy-done", "Copiado");
    expect(container.querySelector('.sr-only[role="status"]'), "a região de quem não carrega o aurea.js").not.toBeNull();
  });
});

describe("GAR-14 · o aviso tem a medida do botão (CSS)", () => {
  test("o recheio é UMA regra para o botão e o aviso — o .btn não o declara mais sozinho", () => {
    expect(regra(".btn,.toast-anchored")).toContain("padding-inline:var(--step-px,15px)");
    const btn = css.match(/\n\.btn \{ --btn-bg:transparent;[^}]*\}/)![0];
    expect(btn).not.toContain("padding-inline");
  });
  test("altura, letra, peso e cápsula saem das mesmas variáveis do botão", () => {
    const aviso = regra(".toast-anchored");
    expect(aviso).toContain("min-block-size:var(--step-h,var(--control-h-md))");
    expect(aviso).toContain("font-size:var(--step-fs,var(--text-sm))");
    expect(aviso).toContain("font-weight:var(--weight-medium)");
    expect(aviso).toContain("border-radius:var(--radius-control)");
  });
});

describe("GAR-15 · a moldura de celular", () => {
  test("frame=\"phone\": a moldura leva a classe e o estilo; a captura, só a proporção", () => {
    const {container} = render(<Image src="/a.png" alt="Tela do app" frame="phone" ratio="9/19.5" className="vitrine" style={{maxWidth: 240}}/>);
    const moldura = container.querySelector(".image-frame.image-frame-phone") as HTMLElement;
    expect(moldura).not.toBeNull();
    expect(moldura).toHaveClass("vitrine");
    expect(moldura.style.maxWidth).toBe("240px");
    const img = moldura.querySelector("img.image")!;
    expect(img).not.toHaveClass("vitrine");
    expect(img).toHaveAttribute("alt", "Tela do app");
    expect((img as HTMLElement).style.aspectRatio).toBe("9/19.5");
  });
  test("srcDark: as duas capturas, cada uma marcada com o seu tema", () => {
    const {container} = render(<Image src="/claro.png" srcDark="/escuro.png" alt="Tela do app" frame="phone"/>);
    const [clara, escura] = [...container.querySelectorAll("img")];
    expect(clara).toHaveClass("image-theme-light");
    expect(clara).toHaveAttribute("src", "/claro.png");
    expect(escura).toHaveClass("image-theme-dark");
    expect(escura).toHaveAttribute("src", "/escuro.png");
    expect(escura).toHaveAttribute("loading", "lazy");
  });
  test("sem frame e sem srcDark, o Image sai como antes", () => {
    const {container} = render(<Image src="/a.png" alt="Foto" ratio="16/9" className="x"/>);
    expect(container.querySelector(".image-frame")).toBeNull();
    const img = container.querySelector("img")!;
    expect(img.className).toBe("image x");
    expect(img.style.aspectRatio).toBe("16/9");
  });
  test("a pele: canto da folha, recheio de token, e o canto de dentro acompanha", () => {
    const m = regra(".image-frame-phone");
    expect(m).toContain("border-radius:var(--radius-sheet)");
    expect(m).toContain("padding:var(--space-2)");
    expect(m).toContain("background:var(--card)");
    expect(regra(".image-frame-phone > .image")).toContain("border-radius:calc(var(--radius-sheet) - var(--space-2))");
  });
  test("a captura escura aparece no tema escuro, e a clara volta numa faixa clara dentro dele", () => {
    const guarda = ':where(:not([data-theme="light"] *),[data-theme="light"] [data-theme="dark"] *)';
    expect(regra(".image-theme-dark")).toContain("display:none");
    expect(regra(`[data-theme="dark"] .image-theme-dark${guarda}`)).toContain("display:block");
    expect(regra(`[data-theme="dark"] .image-theme-light${guarda}`)).toContain("display:none");
  });
});

describe("GAR-16 · títulos e números", () => {
  test("os tokens: a fonte de título e o peso 800", () => {
    expect(tokens).toContain("--font-heading:");
    expect(tokens).toContain("--weight-extrabold:800;");
  });
  test("a fonte 800 é publicada na web", () => {
    expect(fontes).toMatch(/font-weight:800;[^}]*atkinson-hyperlegible-next-800-normal\.woff2/);
  });
  test("os títulos usam a fonte de título, no peso de sempre", () => {
    const t = regra(".typography-h1,.typography-h2,.typography-h3,.typography-h4,.typography-h5,.typography-h6");
    expect(t).toContain("font-family:var(--font-heading)");
    expect(t).toContain("font-weight:var(--weight-semibold)");
  });
  test("numeric e extrabold emitem a classe, nos quatro da tipografia", () => {
    const {container} = render(<><Text numeric weight="extrabold">R$ 41.118,00</Text><Heading level={2} numeric>2026</Heading><Paragraph numeric>11</Paragraph></>);
    const [a, b, c] = [...container.children];
    expect(a).toHaveClass("typography-numeric", "typography-weight-extrabold");
    expect(b).toHaveClass("typography-numeric");
    expect(c).toHaveClass("typography-numeric");
    expect(regra(".typography-numeric")).toContain("font-variant-numeric:tabular-nums");
    expect(regra(".typography-weight-extrabold")).toContain("font-weight:var(--weight-extrabold)");
  });
  test("a tabela inteira e o campo de número têm algarismos da mesma largura", () => {
    expect(regra(".table th,.table td,.table-wrap th,.table-wrap td")).toContain("font-variant-numeric:tabular-nums");
    expect(regra(".number-field-input")).toContain("font-variant-numeric:tabular-nums");
  });
});
