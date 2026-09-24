import {fireEvent, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {AureaProvider, Avatar, AvatarGroup, Stepper} from "../../packages/react/src/index";

// Lote 2 do BUILDING.md. Além dos dois componentes novos, aqui ficam as regressões dos TRÊS
// defeitos que a medição do Avatar achou em 31/07/2026 — dois deles são de CSS e vivem no
// skin.spec; o de comportamento (imagem que falha) é este arquivo.

const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

describe("Avatar", () => {
  // O DEFEITO: o fallback só aparecia quando não havia `src`. Com `src` quebrado, o que se via
  // era o ícone de imagem quebrada do navegador e o texto do `alt` solto na tela.
  // A correção é `onError`, e não o `avatar` do Base UI: aquele só monta o <img> depois que a
  // imagem carrega, e o nosso catálogo é HTML estático — a foto nunca chegaria a aparecer.
  test("imagem que falha cai no fallback, e não no ícone quebrado do navegador", () => {
    const {container} = wrap(<Avatar src="/nao-existe.png" alt="Victor Moreira" fallback="VM" />);
    const img = container.querySelector("img")!;
    expect(img).toBeInTheDocument();          // continua no HTML servido
    fireEvent.error(img);                      // o navegador desiste da imagem
    expect(screen.getByText("VM")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  test("trocar o src dá uma nova chance à imagem", () => {
    const {container, rerender} = render(
      <AureaProvider><Avatar src="/a.png" alt="A" fallback="VM" /></AureaProvider>);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    rerender(<AureaProvider><Avatar src="/b.png" alt="B" fallback="VM" /></AureaProvider>);
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  test("sem src, o fallback aparece", () => {
    wrap(<Avatar fallback="VM" />);
    expect(screen.getByText("VM")).toBeInTheDocument();
  });

  // B5 do PLANO-1.0 (06/08/2026). O DEFEITO era o que ensinou o check 23: `size` como número
  // virava `style` inline, e o inline vence o CSS — os 36px que o core declarava morriam, e
  // quem quisesse outro tamanho escrevia pixel cru, que a densidade nunca alcança.
  test("tamanho é escala de token: classe, nunca style inline", () => {
    const {container} = wrap(<>
      <Avatar fallback="A" /><Avatar fallback="B" size="sm" /><Avatar fallback="C" size="lg" />
    </>);
    const [md, sm, lg] = [...container.querySelectorAll(".avatar")];
    expect(md.className, "md é o default e não emite classe").toBe("avatar");
    expect(sm).toHaveClass("avatar-sm");
    expect(lg).toHaveClass("avatar-lg");
    for (const el of [md, sm, lg]) {
      expect(el.getAttribute("style"), "dimensão em style inline é o defeito").toBeNull();
    }
  });
});

describe("AvatarGroup", () => {
  test("max corta a lista e o excedente vira UMA contagem", () => {
    const {container} = wrap(
      <AvatarGroup max={2} label="Reviewers">
        <Avatar fallback="A" /><Avatar fallback="B" /><Avatar fallback="C" /><Avatar fallback="D" />
      </AvatarGroup>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("C")).toBeNull();
    expect(container.querySelector(".avatar-count")).toHaveTextContent("+2");
  });

  test("total diz o número real quando só veio uma página de avatares", () => {
    const {container} = wrap(
      <AvatarGroup max={2} total={40} label="Reviewers">
        <Avatar fallback="A" /><Avatar fallback="B" /><Avatar fallback="C" />
      </AvatarGroup>);
    expect(container.querySelector(".avatar-count")).toHaveTextContent("+38");
  });

  test("sem excedente não inventa contagem", () => {
    const {container} = wrap(
      <AvatarGroup label="Reviewers"><Avatar fallback="A" /><Avatar fallback="B" /></AvatarGroup>);
    expect(container.querySelector(".avatar-count")).toBeNull();
  });

  test("a bolha de contagem acompanha a escala dos avatares (B5)", () => {
    const {container} = wrap(
      <AvatarGroup max={1} total={5} label="Reviewers" size="sm">
        <Avatar fallback="A" size="sm" /><Avatar fallback="B" size="sm" />
      </AvatarGroup>);
    const contagem = container.querySelector(".avatar-count")!;
    expect(contagem).toHaveClass("avatar-sm");
    expect(contagem.getAttribute("style")).toBeNull();
  });

  test("é um grupo com nome — uma fila de retratos anônima não diz de quem é", async () => {
    const {container} = wrap(
      <AvatarGroup label="Reviewers"><Avatar fallback="A" /></AvatarGroup>);
    expect(screen.getByRole("group", {name: "Reviewers"})).toBeInTheDocument();
    const {violations} = await axe(container);
    expect(violations.map(v => v.id)).toEqual([]);
  });
});

describe("Stepper", () => {
  const etapas = [
    {label: "Configure", state: "done" as const},
    {label: "Permissions", state: "active" as const},
    {label: "Validation", state: "error" as const},
    {label: "Publish"},
  ];

  test("a etapa atual é anunciada como current, e só ela", () => {
    const {container} = wrap(<Stepper items={etapas} label="Publishing" />);
    const atuais = container.querySelectorAll('[aria-current="step"]');
    expect(atuais).toHaveLength(1);
    expect(atuais[0]).toHaveTextContent("Permissions");
  });

  test("a numeração vem da POSIÇÃO — nunca sai de sincronia com a lista", () => {
    const {container} = wrap(<Stepper items={etapas} />);
    const pontos = [...container.querySelectorAll(".step-dot")];
    // 1 e 3 mostram glifo (done, error); 2 e 4 mostram o número da posição.
    expect(pontos[1]).toHaveTextContent("2");
    expect(pontos[3]).toHaveTextContent("4");
  });

  test("erro é um estado próprio — reprovar não é progredir", () => {
    const {container} = wrap(<Stepper items={etapas} />);
    expect(container.querySelectorAll(".step-error")).toHaveLength(1);
  });

  test("etapa com onClick vira botão de verdade e responde ao teclado", async () => {
    const cliques: string[] = [];
    wrap(<Stepper items={[{label: "Configure", onClick: () => cliques.push("c")}]} />);
    const b = screen.getByRole("button", {name: /Configure/});
    b.focus();
    await userEvent.keyboard("{Enter}");
    expect(cliques).toEqual(["c"]);
  });

  test("sem onClick a etapa NÃO é interativa — nada de botão que não faz nada", () => {
    wrap(<Stepper items={[{label: "Configure"}]} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("a lista tem nome, e o default vem do provider", () => {
    wrap(<Stepper items={etapas} />);
    expect(screen.getByRole("list", {name: "Steps"})).toBeInTheDocument();
  });
});
