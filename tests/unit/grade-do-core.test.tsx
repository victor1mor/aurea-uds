import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import * as A from "../../packages/react/src/index";

// G-CSS-01 — a família que o LogStream escancarou em 21/08/2026.
//
// O core desenha o componente por GRADE de trilhas fixas; o React emite os filhos. Ninguém
// confrontava os dois, e nada quebra quando eles discordam — a peça só cai na trilha errada e
// segue renderizando. Dois defeitos reais estavam abertos há meses por isso:
//
//   `.log-line` declara `86px 72px minmax(0,1fr)` — hora, nível, mensagem. O React emitia DOIS
//   filhos e nenhum nível. Medido no navegador: a mensagem media 72px onde a referência
//   congelada mede 690px, ilegível, e o nível não existia em lugar nenhum. A classe que ele
//   emitia no lugar (`log-warn`) não tem UMA regra no core — e classe sem regra não quebra, some.
//
//   `.alert` declara `auto minmax(0,1fr) auto` — ícone, corpo, ação. O React emitia o título
//   solto, que caía na trilha do ÍCONE e crescia com o próprio texto, e o corpo entrava como
//   item anônimo. Não havia ícone nenhum, embora a referência congelada desenhe um por variante.
//
// Os dois controles abaixo são provados contra esses defeitos: cada `expect` aqui REPROVAVA na
// véspera da correção. O primeiro pega a aridade; o segundo pega a classe órfã, que é o sinal
// que precede a aridade errada quase sempre.

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// As classes que o core REALMENTE pinta. Do fonte, não do dist: o dist é cópia gerada, e um
// teste que lê a cópia passa enquanto a fonte está errada (é a mesma regra do eixos-layout).
const pintadas = new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map(m => m[1]));

/** As trilhas de `grid-template-columns` da primeira regra cujo seletor é exatamente `sel`.
 *  `repeat(auto-*)` devolve null: aí a contagem de filhos não é fixa e não há o que cobrar. */
function trilhasDe(sel: string): number | null {
  for (const bloco of css.split("}")) {
    const i = bloco.indexOf("{");
    if (i < 0 || bloco.slice(0, i).trim() !== sel) continue;
    const g = /grid-template-columns:([^;]+)/.exec(bloco.slice(i + 1));
    if (!g || /auto-fill|auto-fit/.test(g[1])) return null;
    // conta trilhas no topo: `minmax(0,1fr)` e `var(--x)` contam UMA cada
    let profundidade = 0, n = 0, emTrilha = false;
    for (const ch of g[1].trim()) {
      if (ch === "(") profundidade++;
      else if (ch === ")") profundidade--;
      else if (/\s/.test(ch) && profundidade === 0) { emTrilha = false; continue; }
      if (!emTrilha) { n++; emTrilha = true; }
    }
    return n;
  }
  return null;
}

// Um caso por componente cuja RAIZ (ou cuja linha) é uma grade de trilhas fixas no core. A lista
// sai de uma varredura do core por `grid-template-columns` sem `auto-fill`/`auto-fit`, não de
// memória: o que estiver na varredura e faltar aqui é o próximo buraco.
const GRADES: Array<[string, React.ReactElement]> = [
  [".alert", <A.Alert variant="info" title="T"><p>corpo</p></A.Alert>],
  [".banner", <A.Banner variant="info" title="T"><p>corpo</p></A.Banner>],
  [".data-list", <A.DataList items={[{term: "a", value: "b"}]} />],
  [".log-line", <A.LogStream lines={[{time: "1", level: "warn", text: "x"}]} />],
  [".message", <A.MessageList messages={[{id: "1", author: "Analyst", body: "oi"}]} />],
];

test.each(GRADES)("%s: o componente emite tantos itens quantas trilhas o core declara", (sel, ui) => {
  const trilhas = trilhasDe(sel);
  expect(trilhas, `${sel} não é grade de trilhas fixas no core — o caso não deveria estar na lista`)
    .not.toBeNull();
  const {container} = render(<A.AureaProvider>{ui}</A.AureaProvider>);
  const alvo = container.querySelector(sel);
  expect(alvo, `${sel} não saiu no render`).not.toBeNull();
  // filhos ELEMENTO. Texto solto vira item anônimo da grade e é justamente o que escondeu o
  // defeito do Alert: contava como conteúdo e não como filho.
  expect(alvo!.children.length,
    `${sel}: ${alvo!.children.length} itens para ${trilhas} trilhas — algo cai na trilha errada`)
    .toBe(trilhas);
  expect([...alvo!.childNodes].filter(n => n.nodeType === 3 && n.textContent!.trim()).length,
    `${sel}: texto solto dentro da grade vira item anônimo e ninguém controla onde ele cai`)
    .toBe(0);
});

// A célula do meio do log é a que o defeito comeu: sem ela a mensagem herda a trilha do nível.
test("o LogStream emite hora, nível e mensagem — sempre as três células", () => {
  const {container} = render(<A.AureaProvider><A.LogStream lines={[
    {time: "14:32:04", level: "warn", text: "approval required"},
    {text: "sem hora e sem nível"}]} /></A.AureaProvider>);
  const linhas = [...container.querySelectorAll(".log-line")];
  expect(linhas).toHaveLength(2);
  for (const l of linhas) expect(l.children).toHaveLength(3);
  expect(linhas[0].querySelector(".log-time")!.textContent).toBe("14:32:04");
  // o nível é TEXTO, não só uma classe: quem lê o log precisa vê-lo, e quem ouve precisa ouvi-lo
  expect(linhas[0].querySelector(".log-level")!.textContent).toBe("warn");
  expect(linhas[0].querySelector(".log-level")!.className).toBe("log-level warn");
  // e a linha sem nível mantém as células, senão a mensagem escorrega de trilha
  expect(linhas[1].querySelector(".log-level")!.textContent).toBe("");
  expect(linhas[1].lastElementChild!.textContent).toBe("sem hora e sem nível");
});

// O Alert desenha o glifo da variante como a referência congelada faz. Sem isto, cor é o único
// sinal do tipo de aviso — e cor sozinha reprova WCAG 1.4.1.
test.each(["info", "success", "warning", "danger"] as const)(
  "Alert %s desenha o glifo da variante na trilha do ícone", variant => {
    const {container} = render(
      <A.AureaProvider><A.Alert variant={variant} title="T">corpo</A.Alert></A.AureaProvider>);
    const alerta = container.querySelector(".alert")!;
    expect(alerta.firstElementChild!.classList.contains("icon"),
      "o primeiro item tem de ser o ícone: é a trilha 1 da grade").toBe(true);
    expect(alerta.querySelector(".alert > div > strong"),
      "título e corpo vão JUNTOS na trilha 2").not.toBeNull();
  });

test("o ícone do Alert é escolhido pela variante e o consumidor pode trocá-lo", () => {
  const glifo = (ui: React.ReactElement) => {
    const {container} = render(<A.AureaProvider>{ui}</A.AureaProvider>);
    // o href traz o caminho do sprite na frente; o que se cobra é o GLIFO
    return container.querySelector(".alert > .icon use")!.getAttribute("href")!.replace(/^.*#/, "#");
  };
  expect(glifo(<A.Alert variant="danger">x</A.Alert>)).toBe("#i-error--filled");
  expect(glifo(<A.Alert variant="success">x</A.Alert>)).toBe("#i-checkmark--filled");
  expect(glifo(<A.Alert variant="warning" icon="idea">x</A.Alert>)).toBe("#i-idea");
});

// A classe órfã é o sintoma que precede quase toda aridade errada: o componente marca o estado
// numa classe, ninguém pinta, e o desenho fica sem o sinal. `log-warn` viveu meses assim.
test("nenhuma classe emitida pelo React fica sem regra no core", () => {
  const {container} = render(<A.AureaProvider>
    <A.Alert variant="warning" title="T">corpo</A.Alert>
    <A.Banner variant="danger" title="T" icon="warning" onDismiss={() => {}}>corpo</A.Banner>
    <A.LogStream lines={[{time: "1", level: "info", text: "a"}, {time: "2", level: "warn", text: "b"},
      {time: "3", level: "error", text: "c"}]} />
    <A.DataList items={[{term: "a", value: "b"}]} />
    <A.Status variant="success">ok</A.Status>
    <A.Badge variant="danger">x</A.Badge>
  </A.AureaProvider>);

  // classes do catálogo/documentação não entram aqui: o que se mede é o que o PACOTE emite.
  const emitidas = new Set<string>();
  for (const el of container.querySelectorAll("*")) {
    const raw = el.getAttribute("class");
    if (raw) for (const c of raw.split(/\s+/)) if (c) emitidas.add(c);
  }
  const orfas = [...emitidas].filter(c => !pintadas.has(c)).sort();
  expect(orfas, `classe emitida e não pintada pelo core: ${orfas.join(", ")}`).toEqual([]);
});
