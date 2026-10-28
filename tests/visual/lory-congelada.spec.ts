import {test, expect, type Page} from "@playwright/test";
import {readFileSync, writeFileSync, existsSync} from "node:fs";

// A `lory` CONGELADA (ADR-0083, 26/10/2026). A paleta da 1.0 não vale nela — o Victor: a lory fica 100% como é hoje, e
// vai só mudar de nome (Aurea Ember, no passo C). Os tokens dela foram congelados na fonte, e toda regra nova leva a
// exclusão dela. Este teste prova no navegador: no banco da paleta (`apps/keyboard-probe/paleta.html`, as peças que a
// paleta toca), com `data-brand="lory"`, nos dois temas, a cor de CADA elemento — letra, fundo, borda, contorno, sombra,
// sublinhado, e o `::before`/`::after` — é a mesma da 0.44.0.
//
// A referência (`lory-0.44.0.json`) foi gravada com a folha da 0.44.0 no lugar da de hoje, pelo MESMO código abaixo:
//   LORY_GRAVAR=<caminho do aurea.css da 0.44.0> npx playwright test tests/visual/lory-congelada.spec.ts --project=chromium
// Só cor e enfeite entram na comparação, não medida: um lote que mude o espaço de uma peça não mexe aqui.
// A exceção: o desenho da LINHA DO TEMPO (os `::before`), que o conserto de 27/10/2026 refez em todas as marcas — o defeito
// era geral (o Victor). A cor da linha da lory é provada no `paleta-passo-a.spec.ts`.
// Provado contra o defeito (27/10/2026): sem o congelamento dos tokens da lory, reprova (a tinta e a letra do aviso); sem
// a exclusão nas regras novas, reprova (o link, o campo, o botão ligado, a linha do tempo).
const APP = "/apps/keyboard-probe/out/paleta.html";
const REF = "tests/visual/lory-0.44.0.json";
const GRAVAR = process.env.LORY_GRAVAR;

const PROPS = ["color", "background-color", "background-image", "border-top-color", "border-right-color", "border-bottom-color",
  "border-left-color", "outline-color", "box-shadow", "text-decoration-line", "text-decoration-color",
  "text-decoration-thickness", "text-underline-offset", "fill", "stroke", "opacity"];
const PSEUDO = ["content", "background-color", "background-image", "box-shadow", "border-top-color", "color"];

type Foto = Record<string, Record<string, string>>;

async function fotografar(p: Page, tema: string, marca = "lory"): Promise<Foto> {
  if (GRAVAR) {
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

// O NOME NOVO (passo C, 28/10/2026): a `lory` passou a se chamar Aurea Ember (`ember`), e o nome antigo vale por uma versão.
// Os dois nomes têm de sair com as MESMAS cores da 0.44.0 — só o nome mudou. Provado contra o defeito: com a marca renomeada
// nos tokens e o core ainda escrevendo só `lory`, a `ember` reprova (as regras novas da paleta a alcançam).
for (const marca of ["lory", "ember"]) for (const tema of ["light", "dark"]) {
  test(`a ${marca} no ${tema === "light" ? "claro" : "escuro"} sai com as cores da 0.44.0`, async ({page: p}, info) => {
    test.skip(info.project.name !== "chromium", "a referência foi gravada no Chromium");
    test.skip(Boolean(GRAVAR) && marca !== "lory", "a referência se grava com o nome de quando ela foi gravada");
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
    // A ÚNICA MUDANÇA PERMITIDA (passo C, 28/10/2026, o Victor: "Brancos, como as outras"): no escuro, as marcas dos
    // controles — a bolinha do Switch, a alça do Slider, o visto e o ponto do Radio — saíam no quase preto do fundo dela
    // (`oklch(0.16 0.02 250)`) e passaram ao branco, como nas outras marcas e na referência. Medido: 9 propriedades, em 4
    // peças, só no escuro.
    const marcaDoControle = (antes: string, depois: string) => tema === "dark" && antes === "oklch(0.16 0.02 250)" && depois === "oklch(1 0 0)";
    let permitidas = 0;
    for (const [chave, linha] of Object.entries(ref)) {
      const hoje = agora[chave];
      if (!hoje) { diferencas.push(`${chave}: sumiu`); continue; }
      for (const [prop, valor] of Object.entries(linha)) {
        if (hoje[prop] === valor) continue;
        if (marcaDoControle(valor, hoje[prop])) { permitidas++; continue; }
        diferencas.push(`${chave} ${prop}: ${valor} → ${hoje[prop]}`);
      }
    }
    expect(diferencas.slice(0, 40), `${diferencas.length} diferenças`).toEqual([]);
    if (tema === "dark") expect(permitidas, "as marcas brancas do escuro estão lá").toBe(9);
    expect(Object.keys(agora).length, "o banco tem as mesmas peças").toBe(Object.keys(ref).length);
  });
}
