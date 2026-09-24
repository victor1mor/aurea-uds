import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AureaProvider, MediaEmbed, ptBR} from "../../packages/react/src/index";

// N-10 (24/09/2026). Um app incorporava o trailer com <iframe> nu, porque a Aurea não tinha peça
// para vídeo de terceiro, e a trava do app recusa <iframe> sem peça da casa. Cada `expect` abaixo
// cobra uma coisa que, antes, ficava a cargo do consumidor.

const YT = "https://www.youtube.com/embed/abc123";
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("N-10 · MediaEmbed: vídeo de terceiro na moldura da Aurea", () => {
  test("sem poster: o <iframe> nasce com nome, carregamento preguiçoso e a política de origem do YouTube", () => {
    wrap(<MediaEmbed src={YT} title="Trailer oficial" />);
    const frame = screen.getByTitle("Trailer oficial");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", YT);
    expect(frame).toHaveAttribute("loading", "lazy");
    // Lido nos termos do YouTube em 24/09/2026: o player exige o cabeçalho Referer.
    expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(frame.getAttribute("allow")).toContain("fullscreen");
  });

  test("a proporção é reservada antes de qualquer coisa carregar (16/9 por padrão, trocável)", () => {
    const {container, rerender} = wrap(<MediaEmbed src={YT} title="T" />);
    const caixa = () => container.querySelector(".media-embed-frame") as HTMLElement;
    expect(caixa().style.aspectRatio).toBe("16/9");
    rerender(<AureaProvider><MediaEmbed src={YT} title="T" ratio="4/3" /></AureaProvider>);
    expect(caixa().style.aspectRatio).toBe("4/3");
  });

  test("com poster: NADA do terceiro carrega até o clique — só a fachada, que é um botão com nome", () => {
    const {container} = wrap(<MediaEmbed src={YT} title="Trailer oficial" poster="/capa.jpg" />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("button", {name: "Play: Trailer oficial"})).toBeInTheDocument();
  });

  test("o clique troca a fachada pelo <iframe>, pede para tocar e leva o foco junto", async () => {
    wrap(<MediaEmbed src={YT + "?rel=0"} title="Trailer oficial" poster="/capa.jpg" />);
    await userEvent.setup().click(screen.getByRole("button", {name: "Play: Trailer oficial"}));
    const frame = screen.getByTitle("Trailer oficial");
    const url = new URL(frame.getAttribute("src")!);
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("rel")).toBe("0");   // o que o consumidor mandou continua lá
    expect(frame).toHaveFocus();
  });

  test("autoplay={false}: o clique carrega o vídeo sem mandar tocar", async () => {
    wrap(<MediaEmbed src={YT} title="T" poster="/capa.jpg" autoplay={false} />);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(screen.getByTitle("T")).toHaveAttribute("src", YT);
  });

  test("href é a saída quando o dono bloqueia a incorporação — link visível, em nova aba, na língua do app", () => {
    render(<AureaProvider strings={ptBR}><MediaEmbed src={YT} title="T" href="https://youtu.be/abc123" /></AureaProvider>);
    const link = screen.getByRole("link", {name: "Abrir o vídeo no site de origem"});
    expect(link).toHaveAttribute("href", "https://youtu.be/abc123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  test("as props do consumidor vencem os padrões", () => {
    wrap(<MediaEmbed src={YT} title="T" loading="eager" allow="fullscreen" />);
    const frame = screen.getByTitle("T");
    expect(frame).toHaveAttribute("loading", "eager");
    expect(frame).toHaveAttribute("allow", "fullscreen");
  });
});
