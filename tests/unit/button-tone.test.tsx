import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import {
  AureaProvider, Button, IconButton, buttonSkin,
  type ButtonAppearance, type ButtonTone, type ButtonVariant,
} from "../../packages/react/src/index";

// G-API-01 da ATIVIDADE-2. O defeito: `ButtonVariant` era o produto cartesiano de APARÊNCIA ×
// TOM achatado num enum de treze nomes — e o achatamento vazava até na ordem das palavras
// (`danger-outline` com o tom na frente, `link-danger` com o tom atrás). Consequência prática:
// um tom novo custava quatro nomes escritos à mão, e por isso nenhum tom novo entrou nunca.
//
// O que estes testes cobram não é "existe um prop `tone`". É a MATRIZ: toda célula que os dois
// eixos permitem tem de ser pintada pelo core, ou estar declarada ausente com motivo. Célula
// que o tipo aceita e o CSS não pinta é um botão sem tom, e é exatamente o silêncio que o §9 da
// ordem proíbe.
//
// A fonte do core, não o dist: o dist é cópia gerada, e teste que lê a cópia passa enquanto a
// fonte está errada.
const css = readFileSync("packages/core/src/aurea.css", "utf8");
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

const APARENCIAS = ["solid", "outline", "ghost", "link", "nav"] as const;
const TONS = ["neutral", "brand", "danger", "success", "warning", "info"] as const;

// As treze de sempre e a classe que cada uma SEMPRE emitiu. Esta tabela é escrita à mão de
// propósito: se ela viesse do mesmo dicionário que o `buttonSkin` usa, provaria só que o código
// é consistente consigo mesmo. Aqui ela é o registro de como a Aurea pintava ANTES do eixo novo.
const ANTES: Record<ButtonVariant, string> = {
  primary: "btn btn-primary", secondary: "btn btn-secondary",
  outline: "btn btn-outline", ghost: "btn btn-ghost",
  "primary-outline": "btn btn-primary-outline", "primary-ghost": "btn btn-primary-ghost",
  danger: "btn btn-danger", "danger-outline": "btn btn-danger-outline",
  "danger-ghost": "btn btn-danger-ghost",
  link: "btn btn-link", "link-primary": "btn btn-link-primary", "link-danger": "btn btn-link-danger",
  nav: "btn btn-nav",
};

// ── 1. o eixo novo não pode mexer no que já existe ──────────────────────────
// É esta a trava que garante "nenhuma baseline se mexe": o DOM de cada variante antiga é
// caractere por caractere o mesmo. Se o refactor tivesse trocado `.btn-danger-outline` por
// `.btn-outline.btn-tone-danger` — que pinta igual — este teste pegaria a mudança de DOM antes
// de o Playwright gastar oito minutos para descobrir a mesma coisa em pixel.
test.each(Object.entries(ANTES))("variant=%s emite exatamente a classe de sempre", (v, esperado) => {
  const {container} = wrap(<Button variant={v as ButtonVariant}>x</Button>);
  expect(container.querySelector("button")!.className).toBe(esperado);
});

// E o caminho novo tem de CHEGAR na mesma classe: pedir os dois eixos de uma célula antiga não
// pode produzir um segundo jeito de escrever a mesma coisa.
test("os dois eixos caem na classe antiga quando a célula já existia", () => {
  expect(buttonSkin(undefined, "outline", "danger")).toBe("btn-danger-outline");
  expect(buttonSkin(undefined, "link", "brand")).toBe("btn-link-primary");
  expect(buttonSkin(undefined, "solid", "brand")).toBe("btn-primary");
  expect(buttonSkin(undefined, "solid", "neutral")).toBe("btn-secondary");
});

// `variant` como base e um eixo por cima: é o caminho de migração real, e o que permite
// `<IconButton tone="danger">` sem reescrever o default `ghost` do componente.
test("um eixo sozinho modifica o par do atalho, não o substitui", () => {
  expect(buttonSkin("outline", undefined, "danger")).toBe("btn-danger-outline");
  expect(buttonSkin("danger", "ghost", undefined)).toBe("btn-danger-ghost");
  const {container} = wrap(<IconButton label="apagar" icon="trash-can" tone="danger" />);
  expect(container.querySelector("button")!.className).toContain("btn-danger-ghost");
});

// ── 2. a matriz inteira, sem amostragem ────────────────────────────────────
// Uma célula está PINTADA quando existe no core alguma regra cujo seletor casa com as classes
// que o React emite E que define a cor do rótulo. `--btn-fg` é o que faz o tom ser um tom: uma
// regra que só mexesse no fundo deixaria o texto na cor neutra.
//
// Esta função foi reescrita DUAS vezes, cada uma porque um controle achou o buraco da anterior.
//
// 1ª: respondia "alguma regra que casa define --btn-fg?". O controle negativo do bloco 3 reprovou
//    na hora — `btn-outline btn-tone-warning` dava VERDADE, porque `.btn-outline` sozinho já
//    define a cor. Ela media a existência de uma cor, não a chegada do TOM.
// 2ª: passou a exigir que ALGUMA regra casada mencionasse o tom. Passou nos 46 testes, e o
//    navegador mostrou que estava errada: `.btn-nav` vinha DEPOIS no arquivo com a mesma
//    especificidade, e `nav`+success saía cinza. Existir a regra não é ganhar a cascata.
//
// A versão de agora simula a cascata para `--btn-fg`: entre as regras que casam, vence a de
// maior especificidade e, no empate, a última do arquivo. O tom só está pintado se quem VENCE
// fala dele. É por isso que o bloco de tom mora no fim das regras de botão no core.
type Regra = {tom: boolean; espec: number; ordem: number; tema: boolean; valor: string};

function regrasDe(classes: string, prop: string): Regra[] {
  const tem = new Set(classes.split(" "));
  const tom = [...tem].find(c => c.startsWith("btn-tone-"));
  // Comentário fora antes de olhar seletor: o próprio validate.py já teve o defeito de ler uma
  // classe de dentro de um comentário CSS, e este teste não vai repeti-lo.
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const achadas: Regra[] = [];
  semComentario.split("}").forEach((bloco, ordem) => {
    const i = bloco.indexOf("{");
    if (i < 0 || !new RegExp(`${prop}\\s*:`).test(bloco.slice(i))) return;
    for (const sel of bloco.slice(0, i).split(",")) {
      if (sel.includes(":hover")) continue;          // repouso; o hover tem teste próprio
      // `:not(.x)` exige a AUSÊNCIA da classe, e contá-la como exigência inverteria o teste.
      const negadas = [...sel.matchAll(/:not\(\.([a-z0-9-]+)\)/g)].map(m => m[1]);
      const exigidas = [...sel.matchAll(/\.([a-z0-9-]+)/g)].map(m => m[1])
        .filter(c => !negadas.includes(c));
      if (!exigidas.every(c => tem.has(c)) || !negadas.every(c => !tem.has(c))) continue;
      // Atributo é condição como qualquer outra, e ignorá-lo foi o terceiro erro desta função:
      // `.btn[aria-pressed="true"]` também define --btn-fg, tem especificidade 2 e vinha depois,
      // então a simulação declarava a matriz inteira despintada por causa de um seletor que não
      // casa com nenhuma célula (a matriz não pressiona botão nenhum). O único atributo que este
      // teste modela é o tema — o resto significa "não casa".
      const attrs = sel.match(/\[[^\]]+\]/g) || [];
      const tema = sel.includes("[data-theme");
      if (attrs.some(a => !a.startsWith("[data-theme"))) continue;
      // especificidade da coluna b: classes + atributos + pseudo-classes (`:not` não conta, o
      // que está DENTRO dele conta — e aqui o de dentro é sempre uma classe ou `:disabled`).
      const espec = exigidas.length + negadas.length + attrs.length
        + (sel.match(/:(?!not\()[a-z-]+/g) || []).length;
      const valor = bloco.slice(i).match(new RegExp(`${prop}\\s*:\\s*([^;}]+)`))?.[1].trim() ?? "";
      achadas.push({tom: !!tom && exigidas.includes(tom), espec, ordem, tema, valor});
    }
  });
  return achadas;
}

// `tema` decide qual sub-cascata se olha: no escuro as regras `[data-theme="light"]` não casam.
function vencedora(classes: string, tema: "dark" | "light", prop = "--btn-fg"): Regra | undefined {
  const candidatas = regrasDe(classes, prop).filter(r => tema === "light" || !r.tema);
  return candidatas.sort((a, b) => a.espec - b.espec || a.ordem - b.ordem).at(-1);
}

// Uma célula está pintada quando, NOS DOIS TEMAS, quem ganha a cor do rótulo fala do tom (ou
// quando não há tom a falar, no caso das células que já tinham classe própria).
function pintada(classes: string): boolean {
  const semTom = !classes.split(" ").some(c => c.startsWith("btn-tone-"));
  return (["dark", "light"] as const).every(t => {
    const v = vencedora(classes, t);
    return !!v && (semTom || v.tom);
  });
}

// A matriz não tem célula ausente, e a lista existe VAZIA de propósito: ela é o lugar onde uma
// ausência teria de ser declarada com motivo, e mantê-la à vista é o que impede alguém de
// reintroduzir uma degradação silenciosa sem passar por aqui. Em 21/08/2026 ela tinha duas
// linhas — `solid` de success e de info caíam para `outline` por falta de par de token. O Victor
// recusou: "não considero aceitável uma API anunciar tone=success appearance=solid e entregar
// visualmente um outline por limitação interna nossa". Os pares foram criados (G-TOKEN-01) e a
// lista esvaziou.
const AUSENTES: Record<string, string> = {};

test.each(APARENCIAS.flatMap(a => TONS.map(t => [a, t] as const)))(
  "matriz: %s × %s ou é pintada, ou está declarada ausente", (a, t) => {
    const chave = `${a}/${t}`;
    const classes = `btn ${buttonSkin(undefined, a, t)}`;
    if (AUSENTES[chave]) {
      // Declarada ausente NÃO quer dizer que o botão pode sair sem tom: ele cai na aparência
      // mais próxima do MESMO tom. Perder o preenchimento é o preço; perder o tom seria o bug.
      expect(classes, AUSENTES[chave]).toBe(`btn ${buttonSkin(undefined, "outline", t)}`);
      expect(pintada(classes)).toBe(true);
      return;
    }
    expect(pintada(classes), `${chave} emite '${classes}' e o core não pinta --btn-fg para isso`)
      .toBe(true);
    // E `solid` tem de ser SÓLIDO. Sem isto a matriz aprova a degradação: rebaixar `solid` para
    // `outline` continua produzindo uma célula "pintada", só que com fundo transparente — que é
    // exatamente o defeito que o Victor recusou. Provado: com o rebaixamento de volta, estas
    // asserções reprovam as três células.
    if (a === "solid") {
      for (const tema of ["dark", "light"] as const) {
        const v = vencedora(classes, tema, "--btn-bg");
        expect(v?.valor, `${chave} em ${tema}: o fundo é '${v?.valor}' — solid sem preenchimento`)
          .not.toMatch(/^transparent$/);
      }
    }
  });

// ── 3. o teste contra o próprio defeito ────────────────────────────────────
// O `pintada` é a trava, e trava não provada contra o defeito é decoração. Estas duas asserções
// são o controle negativo: um tom que o core NÃO tem tem de dar falso. Sem isto, um `pintada`
// que devolvesse `true` sempre passaria a matriz inteira em silêncio.
test("o detector de célula pintada reprova um tom que o core não tem", () => {
  expect(pintada("btn btn-outline btn-tone-inexistente")).toBe(false);
  expect(pintada("btn btn-solid btn-tone-inexistente")).toBe(false);
  // e o que ele aprova, aprova pelo motivo certo: `.btn-ghost` sozinho pinta, `.btn` sozinho não
  // (a base declara `--btn-fg` no próprio `.btn`, então o controle usa uma classe inventada).
  expect(pintada("btn-ghost")).toBe(true);
  expect(pintada("btn-nao-existe")).toBe(false);
});

// `warning` não é um tom do botão, e a ausência é MEDIDA: no tema escuro `--warning-400` resolve
// para `var(--brand-yellow)`, que é exatamente `--primary`. Um aviso idêntico ao botão primário
// não avisa. G-TOKEN-02, escalado. Este teste guarda a medição: se algum dia o token de aviso
// deixar de ser a cor da marca, ele falha e o tom pode entrar.
// ── 5. warning nunca mais pode colapsar na cor da marca ────────────────────
// Este teste era o inverso: ele GUARDAVA a medição de que `--warning-400` resolvia para
// `var(--brand-yellow)`, e por isso `warning` não era um tom. O Victor decidiu separar os dois
// ("tokens de marca e tokens semânticos podem coincidir por acaso somente quando isso não
// destrói significado"), então agora ele guarda a separação — e guarda por MEDIÇÃO, não por
// texto: um alias novo, ou um valor que volte a se aproximar da marca, reprova aqui.
test("warning tem identidade própria, e a distância da marca é medida", () => {
  const tokens = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
  expect(tokens, "aviso não pode ser alias de marca").not.toContain("--warning-400:var(--brand-yellow)");
  expect(tokens, "a marca continua intocada").toContain("--brand-yellow:oklch(0.795 0.184 86.047)");
  expect(tokens, "e primary continua sendo a marca").toContain("--primary:var(--brand-yellow)");
  expect(css).toContain(".btn-tone-warning");

  // A distância perceptual, em oklab. O piso de 0.08 é folgado sobre o ~0.02 de um JND e MUITO
  // acima do 0.001 que havia — e fica abaixo dos 0.104/0.119 medidos, para não travar um ajuste
  // fino futuro. O que ele proíbe é o colapso.
  const val = (nome: string, bloco: string) => {
    const b = tokens.slice(tokens.indexOf(bloco));
    return b.slice(0, b.indexOf("}")).match(new RegExp(`--${nome}:oklch\\(([^)]+)\\)`))?.[1];
  };
  const oklab = (s: string) => {
    const [L, C, h] = s.trim().split(/\s+/).map(Number);
    return [L, C * Math.cos(h * Math.PI / 180), C * Math.sin(h * Math.PI / 180)];
  };
  const marca = oklab("0.795 0.184 86.047");
  for (const bloco of ['[data-theme="dark"]', '[data-theme="light"]']) {
    const w = val("warning", bloco);
    expect(w, `${bloco} tem de declarar --warning em oklch`).toBeTruthy();
    const d = Math.hypot(...oklab(w!).map((v, i) => v - marca[i]));
    expect(d, `${bloco}: aviso a ${d.toFixed(3)} da marca — perto demais para significar outra coisa`)
      .toBeGreaterThan(0.08);
  }
});

// E o par de preenchimento existe para TODO tom que a API declara. É o que impede a volta da
// degradação: sem par, `solid` não teria como pintar, e alguém "resolveria" com um fallback.
test.each(["success", "warning", "info"] as const)("%s tem par cor+texto nos dois temas", tom => {
  const tokens = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
  for (const bloco of ['[data-theme="dark"]', '[data-theme="light"]']) {
    const b = tokens.slice(tokens.indexOf(bloco));
    const corpo = b.slice(0, b.indexOf("}"));
    for (const t of [tom, `${tom}-foreground`, `${tom}-hover`]) {
      expect(corpo, `${bloco} sem --${t}`).toContain(`--${t}:`);
    }
  }
  expect(css).toContain(`.btn-solid.btn-tone-${tom}`);
});

// ── 4. o tom chega ao DOM pelas três aparências sem caixa ──────────────────
test.each([
  ["outline", "success", "btn btn-outline btn-tone-success"],
  ["ghost", "info", "btn btn-ghost btn-tone-info"],
  ["link", "success", "btn btn-link btn-tone-success"],
  ["solid", "info", "btn btn-solid btn-tone-info"],
  ["solid", "warning", "btn btn-solid btn-tone-warning"],
] as const)("appearance=%s tone=%s → %s", (a, t, esperado) => {
  const {container} = wrap(
    <Button appearance={a as ButtonAppearance} tone={t as ButtonTone}>x</Button>);
  expect(container.querySelector("button")!.className).toBe(esperado);
});
