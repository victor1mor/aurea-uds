// Lote 0 do NATIVE.md — o chão do alvo nativo: tokens resolvidos, provider, ícones, fontes.
//
// Cada bloco aqui existe contra UM defeito concreto, e o defeito está nomeado no comentário.
// A regra do CLAUDE.md é essa: "mudança de comportamento vem com o controle que pega a
// regressão, e o controle tem de ser provado contra o defeito, não só passar no estado atual".
//
// `react-native` é escrito em Flow e não carrega em Node — medido: `Parse failed: Flow is not
// supported`. Os dois módulos de plataforma são trocados por dublês no ALIAS do
// `vitest.config.ts` (a resolução, não o runtime — `vi.mock` chega tarde demais). Não é o teste
// fingindo: o provider não desenha NENHUM elemento de host (ele só monta dois
// `Context.Provider`), e um ícone é `createElement` puro, que produz objeto e não pixel. O que
// precisa de aparelho está declarado como pendência na ADR-0037 e na ADR-0038.
import {render, screen, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {readFileSync, readdirSync} from "node:fs";

// Caminho relativo, e não `@aurea-uds/tokens/native`: o pacote é dependência de
// `packages/native`, não da raiz do workspace, e é da raiz que o vitest roda. O arquivo é o
// mesmo — o subpath do pacote aponta para ele.
import {base, themes, densities} from "../../packages/tokens/dist/aurea.tokens.native.js";
import {
  AureaProvider, useAureaTheme, useAureaTokens, resolverTokens,
} from "../../packages/native/src/index.js";

// `process.cwd()` e não `import.meta.url`: dentro do vitest a URL do módulo vem no esquema
// `/@fs/…` do Vite e o `pathname` sai colado. O vitest roda da raiz do repositório.
const RAIZ = process.cwd() + "/";

describe("tokens nativos — a cascata que o CSS dá de graça e aqui não existe", () => {
  // DEFEITO: inverter a precedência. Se o `base` ganhar da densidade, o app inteiro desenha numa
  // densidade só e nada acusa — os 8 tokens de densidade do `comfortable` são idênticos ao
  // `base`, então em `comfortable` o bug seria INVISÍVEL e só apareceria em compact/spacious.
  it("densidade ganha do base nos 8 nomes que existem nos dois", () => {
    const compartilhados = Object.keys(densities.compact).filter((k) => k in base);
    expect(compartilhados).toHaveLength(8);
    const t = resolverTokens("dark", "compact");
    for (const nome of compartilhados) {
      expect(t.size[nome]).toBe((densities.compact as Record<string, number>)[nome]);
      expect(t.size[nome]).not.toBe((base as Record<string, number>)[nome]);
    }
  });

  // DEFEITO: o mesmo, um degrau acima — `warning400` existe no base E no tema.
  it("tema ganha do base em warning400, e o valor difere entre os dois temas", () => {
    expect("warning400" in base).toBe(true);
    expect("warning400" in themes.dark).toBe(true);
    const escuro = resolverTokens("dark", "comfortable").color.warning400;
    const claro = resolverTokens("light", "comfortable").color.warning400;
    expect(escuro).toBe((themes.dark as Record<string, {hex: string}>).warning400.hex);
    expect(claro).toBe((themes.light as Record<string, {hex: string}>).warning400.hex);
    expect(escuro).not.toBe(claro);
  });

  // DEFEITO: vazar `p3` ou `oklch` para o `style`. O interpretador de cor do RN os RECUSA
  // (ADR-0027, medido nas versões 0.81.5 e 0.87.0) e DESCARTA a cor — em silêncio. Um teste que
  // só olhasse "tem cor" passaria; este olha a FORMA.
  it("toda cor sai em hex, e nenhuma em p3/oklch", () => {
    for (const tema of ["dark", "light"] as const) {
      const t = resolverTokens(tema, "comfortable");
      const cores = Object.entries(t.color);
      expect(cores.length).toBeGreaterThan(70);
      for (const [nome, valor] of cores) {
        expect(valor, nome).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      }
    }
  });

  // DEFEITO: um token que não se encaixa em nenhuma categoria some do tema sem erro. A soma tem
  // de fechar com a fonte, senão o app perde um valor e ninguém vê.
  it("a classificação é total — nada cai fora", () => {
    const t = resolverTokens("dark", "comfortable");
    const cru = {...base, ...themes.dark, ...densities.comfortable};
    const emitidos = new Set([
      ...Object.keys(t.color), ...Object.keys(t.size),
      ...Object.keys(t.shadow), ...Object.keys(t.easing),
      "fontUi", "fontEditorial", "fontCode", "fontHeading", // viram `font`, indexado por papel (o `heading` desde a 0.28.0)
    ]);
    const perdidos = Object.keys(cru).filter((k) => !emitidos.has(k));
    expect(perdidos).toEqual([]);
  });

  // DEFEITO: alguém "melhora" o amarelo. O CLAUDE.md o declara INTOCÁVEL, e o hex é o que a
  // Etapa 1 mediu o navegador pintar — byte a byte o mesmo que a web.
  it("o amarelo da marca é o hex medido, nos dois temas", () => {
    for (const tema of ["dark", "light"] as const) {
      expect(resolverTokens(tema, "comfortable").color.brandYellow).toBe("#f0b100");
    }
  });

  // DEFEITO: emitir `tracking` em dp. Daria certo num tamanho de fonte só, e erraria nos outros.
  it("tracking sai como razão, não como dp", () => {
    const t = resolverTokens("dark", "comfortable");
    for (const v of Object.values(t.tracking)) expect(Math.abs(v)).toBeLessThan(1);
    expect(t.remInDp).toBe(16);
  });
});

function Sonda() {
  const {theme, density, toggleTheme, setDensity} = useAureaTheme();
  const {color, size, font} = useAureaTokens();
  return (
    <div>
      <span data-testid="eixos">{theme}/{density}</span>
      <span data-testid="fundo">{color.background}</span>
      <span data-testid="altura">{size.controlHMd}</span>
      <span data-testid="fonte">{font.ui[600]}</span>
      <button onClick={toggleTheme}>tema</button>
      <button onClick={() => setDensity("compact")}>compacto</button>
    </div>
  );
}

describe("AureaProvider", () => {
  // DEFEITO: um padrão silencioso fora do provider desenharia o app no tema errado sem acusar.
  it("os hooks levantam fora do provider", () => {
    const quieto = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Sonda />)).toThrow(/AureaProvider/);
    quieto.mockRestore();
  });

  // O padrão sai de MEDIÇÃO: `comfortable` é a única densidade cujos 8 tokens batem com o `base`.
  it("sem props, cai em dark/comfortable", () => {
    render(<AureaProvider><Sonda /></AureaProvider>);
    expect(screen.getByTestId("eixos")).toHaveTextContent("dark/comfortable");
  });

  // DEFEITO: trocar o eixo e os VALORES não acompanharem — é o que aconteceria se os tokens
  // fossem resolvidos uma vez, fora do `useMemo` dependente do par.
  it("trocar tema e densidade muda os valores resolvidos", () => {
    render(<AureaProvider><Sonda /></AureaProvider>);
    const fundoEscuro = screen.getByTestId("fundo").textContent;
    const alturaConfortavel = screen.getByTestId("altura").textContent;

    act(() => { screen.getByText("tema").click(); });
    expect(screen.getByTestId("eixos")).toHaveTextContent("light/comfortable");
    expect(screen.getByTestId("fundo").textContent).not.toBe(fundoEscuro);

    act(() => { screen.getByText("compacto").click(); });
    expect(screen.getByTestId("eixos")).toHaveTextContent("light/compact");
    expect(screen.getByTestId("altura").textContent).not.toBe(alturaConfortavel);
  });

  // DEFEITO: o modo controlado escrever no estado interno e brigar com o app.
  it("controlado não muda sozinho, e avisa quem manda", () => {
    const aviso = vi.fn();
    render(
      <AureaProvider theme="light" onThemeChange={aviso}><Sonda /></AureaProvider>);
    act(() => { screen.getByText("tema").click(); });
    expect(screen.getByTestId("eixos")).toHaveTextContent("light/comfortable");
    expect(aviso).toHaveBeenCalledWith("dark");
  });

  // DEFEITO ACHADO EM 03/09/2026 ao escrever o app de smoke test — e é o mais silencioso de todos.
  // O pacote de fontes emitia uma grade PARCIAL, porque era a grade que a IBM Plex desenhava:
  // `editorial` não tinha 400 e `code` não tem 700 (o `code` continua assim na Atkinson). O tipo prometia os quatro pesos para os três
  // papéis, então `font.editorial[400]` compilava e devolvia `undefined` — e `fontFamily:
  // undefined` cai na fonte de sistema SEM LEVANTAR. A tela pareceria certa num peso e errada
  // noutro, que é o defeito mais caro deste alvo: não some e não acusa.
  it("a escala é TOTAL mesmo com mapa parcial, e cai para o peso mais próximo", () => {
    const parcial = {
      ui: {"400": "Ui-Regular", "400i": "Ui-Italic", "700": "Ui-Bold"},
      editorial: {"500": "Ed-Medium", "600": "Ed-SemiBold", "700": "Ed-Bold"}, // sem 400
      code: {"400": "Co-Regular", "500": "Co-Medium", "600": "Co-SemiBold"},   // sem 700
    };
    const t = resolverTokens("dark", "comfortable", parcial);
    for (const papel of ["ui", "editorial", "code"] as const) {
      for (const peso of [400, 500, 600, 700] as const) {
        expect(t.font[papel][peso], `${papel}[${peso}]`).toBeTruthy();
      }
    }
    // Queda para o mais PRÓXIMO, e em empate para o mais leve.
    expect(t.font.editorial[400]).toBe("Ed-Medium"); // 400 não existe -> 500, não 700
    expect(t.font.code[700]).toBe("Co-SemiBold");    // 700 não existe -> 600
    expect(t.font.ui[500]).toBe("Ui-Regular");       // 500 não existe -> 400 (empate 400/700)
    expect(t.font.ui[600]).toBe("Ui-Bold");          // 600 não existe -> 700
    // O itálico existe só no `ui`, e sai por campo próprio em vez de uma chave "400i" solta.
    expect(t.font.ui.italic).toBe("Ui-Italic");
    expect(t.font.editorial.italic).toBeUndefined();
  });

  // E o mapa REAL do pacote de fontes é justamente parcial — este teste liga os dois pacotes,
  // porque o defeito acima só existe quando eles se encontram.
  it("o mapa real de @aurea-uds/fonts/native fecha a grade sem buraco", () => {
    const gerado = readFileSync(RAIZ + "packages/fonts/dist/fonts.native.js", "utf8");
    const bloco = /const FONT_FAMILIES = (\{[\s\S]*?\n\});/.exec(gerado)![1];
    const mapa = JSON.parse(bloco);
    // A grade é parcial na fonte — se um dia deixar de ser, este teste avisa que a normalização
    // pode não ser mais necessária. Desde a ADR-0053 o `editorial` é apelido do `ui` (sem
    // itálico) e passou a ter 400; o `code` continua sem 700.
    expect(Object.keys(mapa.code)).not.toContain("700");
    expect(mapa.editorial).toEqual(Object.fromEntries(
      Object.entries(mapa.ui as Record<string, string>).filter(([k]) => !k.endsWith("i"))));

    const t = resolverTokens("dark", "comfortable", mapa);
    expect(t.font.editorial[400]).toBe("AtkinsonHyperlegibleNext-Regular");
    expect(t.font.code[700]).toBe("AtkinsonHyperlegibleMono-SemiBold");
    expect(t.font.ui[600]).toBe("AtkinsonHyperlegibleNext-SemiBold");
    expect(t.font.ui.italic).toBe("AtkinsonHyperlegibleNext-Italic");
  });

  // DEFEITO SILENCIOSO, e é o pior deste lote: sem o mapa de famílias o texto sai em fonte de
  // sistema para todo peso que não seja Regular/Italic/Bold — porque Medium e SemiBold são
  // FAMÍLIAS PRÓPRIAS no .ttf, medido na tabela `name`. O app parece certo e não é.
  it("sem fontFamilies devolve a família pedida; com o mapa, o nome PostScript", () => {
    const {unmount} = render(<AureaProvider><Sonda /></AureaProvider>);
    expect(screen.getByTestId("fonte")).toHaveTextContent("Atkinson Hyperlegible Next");
    unmount();

    const mapa = {
      ui: {400: "AtkinsonHyperlegibleNext-Regular", 500: "AtkinsonHyperlegibleNext-Medium",
           600: "AtkinsonHyperlegibleNext-SemiBold", 700: "AtkinsonHyperlegibleNext-Bold"},
      editorial: {400: "AtkinsonHyperlegibleNext-Regular", 500: "AtkinsonHyperlegibleNext-Medium",
                  600: "AtkinsonHyperlegibleNext-SemiBold", 700: "AtkinsonHyperlegibleNext-Bold"},
      code: {400: "AtkinsonHyperlegibleMono-Regular", 500: "AtkinsonHyperlegibleMono-Medium",
             600: "AtkinsonHyperlegibleMono-SemiBold", 700: "AtkinsonHyperlegibleMono-Bold"},
    } as const;
    render(<AureaProvider fontFamilies={mapa}><Sonda /></AureaProvider>);
    expect(screen.getByTestId("fonte")).toHaveTextContent("AtkinsonHyperlegibleNext-SemiBold");
  });
});

describe("ícones nativos — o que o gerador não pode errar em silêncio", () => {
  const dir = RAIZ + "packages/native/icons";
  const nomes = readdirSync(dir)
    .filter((f) => f.endsWith(".js") && f !== "index.js" && f !== "props.js")
    .map((f) => f.replace(/\.js$/, ""));

  // DEFEITO: o gerador fica para trás do sprite da web, e o app nativo pede um ícone que não
  // existe. Uma fonte, dois alvos — os dois têm de listar o mesmo conjunto.
  it("o conjunto de nomes é o MESMO do sprite da web", () => {
    const sprite = readFileSync(RAIZ + "packages/icons/dist/aurea-icons.svg", "utf8");
    const web = [...sprite.matchAll(/<symbol id="i-([^"]+)"/g)].map((m) => m[1]).sort();
    expect(nomes.sort()).toEqual(web);
    expect(web.length).toBeGreaterThan(2500);
  });

  // DEFEITO: o glifo sair PRETO no aparelho. O Phosphor põe `fill="currentColor"` na raiz do SVG
  // e nada nos traços; `currentColor` não existe no React Native. Cada `Path` tem de receber a
  // cor que o `Icon` passa (ADR-0053).
  it("cada traço recebe a cor do Icon", async () => {
    const {default: House} = await import("../../packages/native/icons/house.js");
    const el = House({color: "#f0b100"}) as {props: {children: unknown}};
    const filhos = [el.props.children].flat() as {props: {fill: string}}[];
    expect(filhos.length).toBeGreaterThan(0);
    for (const f of filhos) expect(f.props.fill).toBe("#f0b100");
  });

  // DEFEITO: a forma cheia (o item escolhido, ADR-0053) sair igual à regular, ou não existir.
  // É um arquivo próprio, com o nome do regular mais `-fill`, e o desenho é outro.
  it("a forma cheia é um arquivo próprio, com outro desenho", async () => {
    const {default: House} = await import("../../packages/native/icons/house.js");
    const {default: HouseFill} = await import("../../packages/native/icons/house-fill.js");
    const d = (C: typeof House) =>
      ([(C({}) as {props: {children: unknown}}).props.children].flat() as {props: {d: string}}[])
        .map((p) => p.props.d).join("|");
    expect(HouseFill.name).toBe("HouseFill");
    expect(d(HouseFill)).not.toBe(d(House));
  });

  // 🔴 A VARREDURA DOS 2571 SAIU DESTE ARQUIVO — 11/09/2026, e foi para o `check 38` do
  // `scripts/validate.py`. O invariante (`foreignObject`/`switch` em nenhum gerado) continua
  // cobrado, e por um gate que o `CLAUDE.md` manda rodar apos QUALQUER alteração.
  //
  // O motivo é o custo, medido na máquina do Victor:
  //
  //     as 2571 leituras, isoladas ........................  1,84 s
  //     o teste que as fazia, este arquivo sozinho ........  1,89 s
  //     o MESMO teste dentro do `pnpm test` inteiro ....... 40,71 s
  //
  // 21x, e a diferença é CONCORRÊNCIA: 37 arquivos em paralelo disputando o disco. Eram ~63% da
  // duração da suíte em UM teste — e ele corria contra um relógio, primeiro o implícito de
  // 5000 ms (que REPROVOU lá), depois um explícito de 60 s com margem de 1,5x sobre dispersão
  // observada de 20x.
  //
  // ⚠ E o novo lugar não custa I/O nenhum: a varredura de nomes privados do `validate.py` JÁ
  // abre e decodifica todo `.js` do repositório, então a checagem pegou carona nos bytes que já
  // estavam na memória. Medido: o `validate.py` leva os mesmos ~62 s de antes.
  //
  // ⚠ O que fica AQUI é a checagem ESTRUTURAL de um ícone (acima): ela é rápida, é sobre o
  // formato do elemento React, e é o tipo de coisa que o vitest faz melhor que um script Python.
  // Corpus grande é do validador; comportamento de componente é do teste.

  // DEFEITO: marca registrada de terceiro entrar numa biblioteca Apache-2.0 (CLAUDE.md §5). O
  // Phosphor traz 79 logotipos (`apple-logo`, `google-logo`…); o gerador os deixa de fora.
  it("nenhum logotipo de marca entra", () => {
    expect(nomes.filter((n) => /-logo(-|$)/.test(n))).toEqual([]);
    const barril = readFileSync(`${dir}/index.js`, "utf8");
    expect(barril).not.toContain("-logo");
  });

  // DEFEITO: o barril virar a forma documentada. Ele traz todos os ícones ao grafo do Metro, cujo
  // tree-shaking é experimental — a cláusula 1 da ADR-0038 existe por isso.
  it("o barril avisa que não é a forma documentada", () => {
    const barril = readFileSync(`${dir}/index.js`, "utf8");
    expect(barril).toContain("NÃO É A FORMA DOCUMENTADA");
    expect(barril).toContain("@aurea-uds/native/icons/plus");
  });

  // DEFEITO: o tamanho não escalar, ou o ícone perder o viewBox e sair cortado.
  it("size vira width/height e o viewBox é o do desenho, 256", async () => {
    const {default: Plus} = await import("../../packages/native/icons/plus.js");
    const el = Plus({size: 16}) as {props: {width: number; height: number; viewBox: string}};
    expect(el.props).toMatchObject({width: 16, height: 16, viewBox: "0 0 256 256"});
    expect((Plus({}) as {props: {width: number}}).props.width).toBe(32);
  });
});

describe("fontes nativas", () => {
  // DEFEITO: o alvo nativo ficar para trás do web. São os MESMOS 9 estilos, em outro formato
  // (ADR-0053: Atkinson Hyperlegible Next em 5, Mono em 3; a IBM Plex tinha 11, com a Serif. O 800
  // da Next entrou na 0.28.0, GAR-16 — eram 8).
  it("9 .ttf, um por .woff2, e todos com nome PostScript distinto", async () => {
    const woff2 = readdirSync(RAIZ + "packages/fonts/files").filter((f) => f.endsWith(".woff2"));
    const ttf = readdirSync(RAIZ + "packages/fonts/files-native").filter((f) => f.endsWith(".ttf"));
    expect(ttf).toHaveLength(9);
    expect(ttf.map((f) => f.replace(/\.ttf$/, "")).sort())
      .toEqual(woff2.map((f) => f.replace(/\.woff2$/, "")).sort());

    const gerado = readFileSync(RAIZ + "packages/fonts/dist/fonts.native.js", "utf8");
    const chaves = [...gerado.matchAll(/^  "([^"]+)": require/gm)].map((m) => m[1]);
    expect(chaves).toHaveLength(9);
    expect(new Set(chaves).size).toBe(9);
    // O nome MEDIDO na tabela `name`, não escrito à mão — se o gerador voltar a inventar, muda.
    expect(chaves).toContain("AtkinsonHyperlegibleNext-SemiBold");
    expect(chaves).toContain("AtkinsonHyperlegibleMono-Regular");
    expect(chaves).toContain("AtkinsonHyperlegibleNext-ExtraBold");
  });
});
