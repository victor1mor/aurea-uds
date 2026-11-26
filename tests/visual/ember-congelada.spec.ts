import {test, expect, type Page} from "@playwright/test";
import {readFileSync, writeFileSync, existsSync} from "node:fs";

// A `ember` CONGELADA (ADR-0083, 26/10/2026). A paleta da 1.0 não vale nela — o Victor: a ember fica 100% como é hoje, e
// vai só mudar de nome (Aurea Ember, no passo C). Os tokens dela foram congelados na fonte, e toda regra nova leva a
// exclusão dela. Este teste prova no navegador: no banco da paleta (`apps/keyboard-probe/paleta.html`, as peças que a
// paleta toca), com `data-brand="ember"`, nos dois temas, a cor de CADA elemento — letra, fundo, borda, contorno, sombra,
// sublinhado, e o `::before`/`::after` — é a mesma da fotografia gravada (abaixo).
//
// A REFERÊNCIA MUDOU (lote 106, 26/11/2026, o Victor: *"Sim, ajustar"*): desde 14/11/2026 a Ember recebe o que cada lote faz,
// e a fotografia da 0.44.0 — com as quatro mudanças aceitas escritas como exceção — tinha ficado velha (7 cores no claro e
// 73 no escuro diferentes, todas de lotes aprovados). A referência agora é a de HOJE, a 0.81.1 (`ember-0.81.1.json`), e as
// exceções saíram: estão dentro dela. Quem faz esta prova reprovar é qualquer cor da Ember que mude sem o Victor ver.
// Quando um lote mudar a Ember de propósito, o Victor aprova olhando a dela, e a fotografia se regrava com a folha de hoje:
//   EMBER_GRAVAR=hoje npx playwright test tests/visual/ember-congelada.spec.ts --project=chromium
// (ou com o caminho de um `aurea.css` antigo, para gravar a fotografia de outra versão.)
// Só cor e enfeite entram na comparação, não medida: um lote que mude o espaço de uma peça não mexe aqui.
// A exceção: o desenho da LINHA DO TEMPO (os `::before`), que o conserto de 27/10/2026 refez em todas as marcas — o defeito
// era geral (o Victor). A cor da linha da ember é provada no `paleta-passo-a.spec.ts`.
const APP = "/apps/keyboard-probe/out/paleta.html";
const REF = "tests/visual/ember-0.81.1.json";
const GRAVAR = process.env.EMBER_GRAVAR;

const PROPS = ["color", "background-color", "background-image", "border-top-color", "border-right-color", "border-bottom-color",
  "border-left-color", "outline-color", "box-shadow", "text-decoration-line", "text-decoration-color",
  "text-decoration-thickness", "text-underline-offset", "fill", "stroke", "opacity"];
const PSEUDO = ["content", "background-color", "background-image", "box-shadow", "border-top-color", "color"];

type Foto = Record<string, Record<string, string>>;

async function fotografar(p: Page, tema: string, marca = "ember"): Promise<Foto> {
  if (GRAVAR && GRAVAR !== "hoje") {
    const antiga = readFileSync(GRAVAR, "utf8");
    await p.route(/\/assets\/aurea-[^/]+\.css$/, (r) => r.fulfill({status: 200, contentType: "text/css", body: antiga}));
  }
  await p.setViewportSize({width: 1280, height: 900});
  await p.goto(`${APP}?marca=${marca}&tema=${tema}`, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  return p.evaluate(({PROPS, PSEUDO}) => {
    const out: Record<string, Record<string, string>> = {};
    const todos = Array.from(document.querySelectorAll("main *"));
    todos.forEach((el, i) => {
      const chave = `${i}:${el.tagName.toLowerCase()}${el.getAttribute("data-prova") ? `[${el.getAttribute("data-prova")}]` : ""}`;
      const cs = getComputedStyle(el);
      const linha: Record<string, string> = {};
      // O que está escondido para o olho (o recorte a zero do motor, como a entrada do `Slider`) não tem cor da Aurea: a
      // dele é a padrão do navegador, que muda do Windows para o Linux (lote 106: o campo de dentro do `Slider` dava
      // `rgb(16, 16, 16)` no Windows e `rgb(157, 150, 142)` na CI). Fica só o nome, para a contagem de peças valer.
      if (cs.clipPath === "inset(50%)") { out[chave] = linha; return; }
      for (const prop of PROPS) linha[prop] = cs.getPropertyValue(prop);
      for (const pseudo of ["::before", "::after"]) {
        if (el.closest(".timeline")) continue;
        const ps = getComputedStyle(el, pseudo);
        if (ps.content && ps.content !== "none" && ps.content !== "normal") {
          for (const prop of PSEUDO) linha[`${pseudo} ${prop}`] = ps.getPropertyValue(prop);
        }
      }
      out[chave] = linha;
    });
    return out;
  }, {PROPS, PSEUDO});
}

for (const marca of ["ember"]) for (const tema of ["light", "dark"]) {
  test(`a ${marca} no ${tema === "light" ? "claro" : "escuro"} sai com as cores gravadas na 0.81.1`, async ({page: p}, info) => {
    test.skip(info.project.name !== "chromium", "a referência foi gravada no Chromium");
    const agora = await fotografar(p, tema, marca);
    expect(Object.keys(agora).length, "o banco tem peças").toBeGreaterThan(200);
    if (GRAVAR) {
      const ref = existsSync(REF) ? JSON.parse(readFileSync(REF, "utf8")) : {};
      ref[tema] = agora;
      writeFileSync(REF, JSON.stringify(ref, null, 0) + "\n");
      return;
    }
    const ref: Foto = JSON.parse(readFileSync(REF, "utf8"))[tema];
    const diferencas: string[] = [];
    for (const [chave, linha] of Object.entries(ref)) {
      const hoje = agora[chave];
      if (!hoje) { diferencas.push(`${chave}: sumiu`); continue; }
      for (const [prop, valor] of Object.entries(linha)) {
        if (hoje[prop] !== valor) diferencas.push(`${chave} ${prop}: ${valor} → ${hoje[prop]}`);
      }
    }
    expect(diferencas.slice(0, 40), `${diferencas.length} diferenças`).toEqual([]);
    expect(Object.keys(agora).length, "o banco tem as mesmas peças").toBe(Object.keys(ref).length);
  });
}
