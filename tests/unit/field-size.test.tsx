import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import {
  AureaProvider, Checkbox, Combobox, Input, Radio, SearchField, Select, Switch, Textarea,
} from "../../packages/react/src/index";

// G-FORM-01 da ATIVIDADE-2. O defeito: cinco fichas do registry anunciavam `sizes: sm/md/lg` e
// a capacidade não existia em lugar nenhum — nem prop, nem classe. `.input,.textarea,.select`
// fixavam --control-h-md.
//
// Estes testes existem para pegar a volta do defeito, e foram rodados contra ele: com a
// implementação revertida, 8 dos 10 falham. Os outros dois guardam o inverso — que ninguém crie
// um `.input-md` concorrente, e que as regras novas não ganhem px cru — e por isso exigem
// primeiro que as regras EXISTAM: teste que passa a vazio não é trava, é decoração.
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);
// A FONTE do core, não o dist: o dist é cópia gerada, e um teste que lê a cópia passa
// enquanto a fonte está errada. O vitest roda da raiz do workspace.
const css = readFileSync("packages/core/src/aurea.css", "utf8");

// A regra do sistema: `md` é a classe base. Não existe `.btn-md` e não pode existir `.input-md`
// — senão passam a existir dois jeitos de escrever o tamanho padrão, e um deles fica sem pele.
test("md não emite classe: é o estado base, como no botão", () => {
  const {container} = wrap(<><Input aria-label="a" size="md" /><Input aria-label="b" /></>);
  const [comSize, semSize] = [...container.querySelectorAll("input")];
  expect(comSize.className).toBe("input");
  expect(semSize.className).toBe("input");
  expect(css).not.toContain(".input-md");
});

test.each([
  ["Input", (s: "sm" | "lg") => <Input aria-label="x" size={s} />, "input", "input"],
  // Desde 24/09/2026 o `Select` é o do Base UI com a pele da casa: o nó focal é um <button>.
  ["Select", (s: "sm" | "lg") => <Select aria-label="x" size={s} />, "button", "select"],
  ["Textarea", (s: "sm" | "lg") => <Textarea aria-label="x" size={s} />, "textarea", "textarea"],
  // SearchField não tem classe própria: ele repassa o degrau ao Input de dentro, e é o
  // `.input-wrap:not(.input-wrap-end) .input-sm` do core que reposiciona o texto em relação ao
  // glifo. O `:not` existe porque o PasswordField usa o mesmo invólucro com a ação no FIM, e ali
  // não há glifo à esquerda para o texto desviar.
  ["SearchField", (s: "sm" | "lg") => <SearchField aria-label="x" size={s} />, "input", "input"],
  ["Combobox", (s: "sm" | "lg") => <Combobox label="x" items={[]} size={s} />, "input", "input"],
] as const)("%s: sm e lg viram classe, e a classe é a do sistema", (_nome, ui, tag, base) => {
  for (const size of ["sm", "lg"] as const) {
    const {container} = wrap(ui(size));
    const el = container.querySelector(`.${base}-${size}`);
    expect(el, `${_nome} size="${size}" não emitiu .${base}-${size}`).not.toBeNull();
    expect(el!.classList.contains(base)).toBe(true); // o modificador acompanha a base, não a substitui
    // A classe tem de pousar no CONTROLE, não num invólucro. No SearchField e no Combobox há um
    // <div> em volta, e foi lá que a primeira versão quase pôs a classe — o CSS de altura não
    // teria efeito nenhum sobre o campo.
    expect(el!.tagName.toLowerCase()).toBe(tag);
  }
});

// O ponto do §23 e do §132 da ATIVIDADE-2: um `sm` de campo e um `sm` de botão lado a lado têm
// de MEDIR igual. Se alguém der ao campo uma altura própria — um 30px cru, um --space-* — a
// linha do formulário desalinha em uma das três densidades, que foi exatamente o achado A1 de
// 26/07/2026 no SegmentedControl. Este teste amarra os dois ao mesmo token.
test.each([["sm"], ["lg"]] as const)("o degrau %s do campo é o MESMO token do botão", (size) => {
  // TODAS as regras que mencionam o seletor, não a primeira. A versão anterior pegava a primeira
  // e passou a reprovar quando o `.input-wrap-end` do PasswordField acrescentou uma segunda regra
  // com `.input-sm` — que só ajusta padding. A pergunta é "ALGUMA regra define a altura pelo
  // token do sistema?", e é isso que se mede agora.
  const corpos = (sel: string) =>
    [...css.matchAll(new RegExp(`(?:^|[,}])[^{}]*\\${sel}\\b[^{]*\\{([^}]*)\\}`, "gm"))].map((m) => m[1]);
  const defineAltura = (sel: string) =>
    corpos(sel).some((c) => c.includes(`--control-h-${size}`));
  expect(corpos(`.btn-${size}`).length, `.btn-${size} não existe`).toBeGreaterThan(0);
  expect(defineAltura(`.btn-${size}`), `.btn-${size} sem --control-h-${size}`).toBe(true);
  expect(defineAltura(`.input-${size}`), `.input-${size} sem --control-h-${size}`).toBe(true);
});

// O textarea é a exceção justificada, e ela precisa estar escrita: a altura dele é conteúdo.
// Se um dia alguém "consertar" isso dando height ao textarea, o campo para de crescer com o
// texto — que é a razão de ele existir.
test("textarea não ganha altura fixa: o que escala é a caixa mínima", () => {
  // A INTENÇÃO é a mesma de sempre; a forma mudou no G-AXIS-04. As duas regras por nome de
  // classe viraram uma que DERIVA do passo (`calc(var(--step-h) * 3)`), e é isso que faz a caixa
  // mínima acompanhar também um degrau vindo da camada responsiva — que duas regras escritas por
  // nome nunca alcançariam. `min-block-size` porque o resto do arquivo é lógico.
  expect(css).toMatch(/\.textarea-sm[^{]*\{[^}]*min-block-size:\s*calc\(var\(--step-h\)/);
  expect(css).not.toMatch(/\.textarea-(sm|lg)[^{]*\{[^}]*[^-]block-size:(?!.*min)/);
  expect(css).not.toMatch(/\.textarea-(sm|lg)[^{]*\{[^}]*[^-]height:(?!.*min)/);
});

// A trava da catraca do check 12 vista de perto: nenhuma das regras novas pode ter px cru.
// O gate conta o arquivo inteiro; aqui a exigência é local, e diz qual regra falhou.
test("as regras de tamanho de campo existem, e nenhuma tem px cru", () => {
  const alvos = [".input-sm", ".input-lg", ".select-sm", ".select-lg", ".textarea-sm", ".textarea-lg"];
  for (const alvo of alvos) {
    const corpos = [...css.matchAll(new RegExp(`^[^\\n{]*\\${alvo}\\b[^{]*\\{([^}]*)\\}`, "gm"))];
    expect(corpos.length, `${alvo} não existe no core`).toBeGreaterThan(0);
    for (const m of corpos) expect(m[1], `${alvo}: ${m[1]}`).not.toMatch(/\d+px/);
  }
});

// ── os controles de seleção: densidade e degrau ────────────────────────────

// Achado ao cruzar a escala de tamanho da Untitled UI com a nossa: ela dá `sm|md` ao checkbox, ao
// radio e ao switch, e a Aurea não dava nada. Medindo o core, o problema era maior que a escala —
// a marca era `18px` CRU e o trilho `42×24px` CRU, então os três **não acompanhavam a densidade**
// enquanto o resto da linha do formulário acompanhava. É o achado A1 outra vez, noutro lugar.
//
// A conta foi escolhida para não mexer em pixel: metade da altura de controle dá exatamente os
// 18px de antes em `comfortable`. O que muda é `compact` e `spacious` passarem a estar certos.
test("a marca de seleção sai do token de altura, e não de um pixel cru", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const corpo = /\.control-mark\s*\{([^}]*)\}/.exec(semComentario)?.[1] ?? "";
  expect(corpo, ".control-mark precisa derivar de --control-h-md").toContain("--control-h-md");
  expect(corpo, "nenhuma medida da marca pode ser px cru").not.toMatch(/(inline|block)-size:\s*\d+px/);
});

// O botão do switch preso em pixel vazaria do trilho em `compact`: 16px de botão mais dois recuos
// de 3px dão 22px, e o trilho compacto tem 20px de altura.
//
// O tamanho vem de UM eixo só, e a segunda asserção guarda exatamente isso. Porcentagem no eixo
// inline de um elemento absoluto resolve contra a LARGURA do contêiner, não contra a altura:
// escrever a mesma conta nos dois eixos deu um botão de 34×16, medido no navegador depois que a
// suíte de captura reprovou duas seções da página de docs. O `aspect-ratio` fecha o quadrado.
test("o botão do switch encolhe com o trilho, por um eixo só", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const corpo = /\.switch-track:after\s*\{([^}]*)\}/.exec(semComentario)?.[1] ?? "";
  expect(corpo).toMatch(/block-size:\s*calc\(100%/);
  expect(corpo, "porcentagem no eixo inline mede a LARGURA do trilho, não a altura")
    .not.toMatch(/inline-size:\s*calc\(100%/);
  expect(corpo).toMatch(/aspect-ratio:\s*1/);
  expect(corpo).not.toMatch(/(inline|block)-size:\s*\d+px/);
});

test.each([
  ["Checkbox", (s: "sm" | "lg") => <Checkbox label="x" size={s} />, "control-mark"],
  ["Radio", (s: "sm" | "lg") => <Radio label="x" size={s} />, "control-mark"],
  ["Switch", (s: "sm" | "lg") => <Switch label="x" size={s} />, "switch-track"],
] as const)("%s: sm e lg viram classe na MARCA, não no rótulo", (_nome, ui, base) => {
  for (const size of ["sm", "lg"] as const) {
    const {container} = wrap(ui(size));
    const marca = container.querySelector(`.${base}-${size}`);
    expect(marca, `${_nome} size="${size}" não emitiu .${base}-${size}`).not.toBeNull();
    expect(marca!.classList.contains(base)).toBe(true);
  }
});
