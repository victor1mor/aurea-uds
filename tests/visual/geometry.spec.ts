import {test, expect} from "@playwright/test";
import {readdirSync} from "node:fs";
import {join} from "node:path";

// GEOMETRIA. Compara estilo COMPUTADO, não pixel — independe de plataforma, então vale
// como gate duro no CI Linux, igual ao rtl.spec e ao status.spec.
//
// Existe porque a auditoria integral de 26/07/2026 mediu, no produto, coisas iguais medindo
// diferente e nenhum gate acusando:
//   A1 — `.tab` 32px, `.segmented button` 30px e `.pagination button` 34×34 eram literais,
//        então a densidade não os alcançava: em spacious a aba ficava 8px mais baixa que o
//        campo ao lado. Os 6 screenshots da matriz fotografam as 3 densidades, mas comparam
//        PIXEL contra baseline -win32 — e o gate de pixel está inativo no CI.
//   A2 — `.badge` não tinha `line-height` próprio e media 26px dentro do `.brand` e 22px
//        dentro de um `.btn-nav`, na MESMA barra.
//   A3 — `.chip` embrulhava com rótulo longo e media 26px numa fila de 24px.
//   B3 — `.pagination button` (seletor de elemento) vencia `.btn-sm` por especificidade e
//        forçava 34px no Anterior/Próxima.
//
// Duas metades, de propósito:
//   1. FIXTURE — prova o CORE direto, sem depender do conteúdo de nenhum app.
//   2. VARREDURA — prova a superfície real (todas as páginas), onde o defeito de A2/A3 nasceu
//      da composição, não da regra. Uma regra certa com composição errada ainda desalinha.

const PORT_PATH = "/__geometry";

// Um controle de cada família que precisa medir igual numa mesma fila.
const FIXTURE = `
<div class="cluster" style="padding:24px">
  <button class="btn btn-primary" type="button">Button md</button>
  <button class="btn btn-sm" type="button">sm</button>
  <button class="btn btn-lg" type="button">lg</button>
  <input class="input" value="Field">
  <select class="select"><option>Select</option></select>
  <div class="tabs" role="tablist">
    <button class="tab active" role="tab" type="button">One</button>
    <button class="tab" role="tab" type="button">Two</button>
  </div>
  <div class="segmented">
    <button class="active" type="button">Left</button>
    <button type="button">Right</button>
  </div>
  <nav class="pagination">
    <button class="btn btn-ghost btn-sm" type="button">Prev</button>
    <button class="active" type="button">1</button>
    <button type="button">2</button>
    <button class="btn btn-ghost btn-sm" type="button">Next</button>
  </nav>
  <span class="badge">Text only</span>
  <span class="badge badge-primary"><svg class="icon" aria-hidden="true"></svg>With glyph</span>
  <span class="badge"><i class="status-dot"></i>With dot</span>
  <kbd class="kbd">K</kbd>
</div>`;

const page = (theme: string, density: string) =>
  `<!doctype html><html data-theme="${theme}" data-density="${density}"><head>
     <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
     <link rel="stylesheet" href="/packages/core/dist/aurea.css">
   </head><body>${FIXTURE}</body></html>`;

const h = (v: string) => Math.round(parseFloat(v) * 100) / 100;

for (const theme of ["dark", "light"] as const) {
  for (const density of ["compact", "comfortable", "spacious"] as const) {
    test(`geometria · ${theme} · ${density}`, async ({page: p, baseURL}) => {
      const url = `${baseURL}${PORT_PATH}`;
      await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8", body: page(theme, density)}));
      await p.goto(url, {waitUntil: "networkidle"});
      await p.evaluate(() => document.fonts.ready);

      const m = await p.evaluate(() => {
        const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
        const alturas = (s: string) => [...document.querySelectorAll(s)]
          .map(e => Math.round(parseFloat(getComputedStyle(e).height) * 100) / 100);
        // Resolve o token em PIXELS em vez de ler a string: os tokens de geometria migraram
        // de px para rem na Fase 5 (T5.4) e um gate que compara `parseFloat("2.25rem")` com
        // 36 acusa defeito que não existe. Medir em px sobrevive a troca de unidade.
        const emPx = (token: string) => {
          const sonda = document.createElement("div");
          sonda.style.cssText = `position:absolute;visibility:hidden;height:var(${token})`;
          document.body.append(sonda);
          const v = getComputedStyle(sonda).height;
          sonda.remove();
          return v;
        };
        return {
          tokens: {md: emPx("--control-h-md"), sm: emPx("--control-h-sm"), lg: emPx("--control-h-lg")},
          btn: cs(".btn-primary").height,
          btnSm: cs(".btn-sm").height,
          btnLg: cs(".btn-lg").height,
          input: cs(".input").height,
          select: cs(".select").height,
          tabs: cs(".tabs").height,
          segmented: cs(".segmented").height,
          pageBtn: alturas(".pagination button:not(.btn)"),
          paginationBtn: alturas(".pagination .btn"),
          badges: alturas(".badge"),
        };
      });

      const md = h(m.tokens.md), sm = h(m.tokens.sm), lg = h(m.tokens.lg);

      // 1. Tudo que é "controle de tamanho md" mede o token md. A cápsula de abas e a de
      //    segmented contam como o controle — é a caixa que encosta no campo ao lado.
      for (const [nome, valor] of Object.entries({
        btn: m.btn, input: m.input, select: m.select, tabs: m.tabs, segmented: m.segmented,
      })) {
        expect(h(valor), `${nome} deveria medir --control-h-md (${md}px) em ${density}`).toBe(md);
      }
      expect(h(m.btnSm), `.btn-sm deveria medir --control-h-sm (${sm}px)`).toBe(sm);
      expect(h(m.btnLg), `.btn-lg deveria medir --control-h-lg (${lg}px)`).toBe(lg);

      // 2. O quadrado de número de página é um controle md quadrado, e o Anterior/Próxima
      //    continua sendo um .btn-sm — o seletor de elemento não pode vencê-lo (B3).
      expect(new Set(m.pageBtn), "todo número de página mede o mesmo").toEqual(new Set([md]));
      expect(new Set(m.paginationBtn), "Anterior/Próxima seguem .btn-sm, não o número").toEqual(new Set([sm]));

      // 3. Badge com texto, com glifo e com ponto medem o MESMO (A2).
      expect(new Set(m.badges), "badge mede igual com texto, com glifo e com ponto").toEqual(
        new Set([m.badges[0]]));
    });
  }
}

// ── varredura: a regra certa pode desalinhar por composição ────────────────────────────
// Roda sobre o catálogo GERADO, que é a superfície dogfooded do produto. `apps/docs` fica
// fora de propósito: é o catálogo escrito à mão, com `style` inline que sobrepõe o sistema
// (um botão de 20px dentro de um badge, por exemplo) e está para ser aposentado — achados
// A6/A8. Quando ele sair, esta varredura já cobre o que sobra.
const DIR = join(process.cwd(), "apps/catalog");
const PAGES = readdirSync(DIR).filter(f => f.endsWith(".html")).sort();

// Classes cuja altura é um contrato: numa mesma página, uma só.
// `.badge` sem modificador: desde 17/08/2026 ele tem escala (xs/sm/md/lg) e uma forma
// sobreposta com medida propria. O contrato que esta trava protege continua inteiro — dois
// badges do MESMO tamanho na mesma pagina tem de medir igual —, e o que saiu do seletor foi
// so o que declara outro tamanho POR CLASSE. Sobrescrita contextual continua reprovando, e
// foi exatamente assim que ela pegou a do contador da barra inferior.
const UNICA = [".badge:not(.badge-xs):not(.badge-sm):not(.badge-lg):not(.badge-overlay)", ".chip", ".tabs", ".segmented", ".tab", ".segmented button",
               ".kbd", ".pagination button:not(.btn)"];

test.describe("catálogo · geometria de todas as páginas", () => {
  test.describe.configure({timeout: 8 * 60 * 1000});

  for (const theme of ["dark", "light"] as const) {
    test(`altura única por classe, em toda página · tema ${theme}`, async ({page: p}) => {
      await p.setViewportSize({width: 1440, height: 1000});
      const falhas: string[] = [];
      for (const f of PAGES) {
        await p.goto(`/apps/catalog/${f}`);
        if (theme === "light") {
          await p.evaluate(() => { document.documentElement.dataset.theme = "light"; });
          await p.waitForTimeout(60);
        }
        const r = await p.evaluate((sels) => {
          const out: Record<string, number[]> = {};
          for (const s of sels) {
            const els = [...document.querySelectorAll(s)].filter(e => (e as HTMLElement).offsetParent !== null);
            if (els.length < 2) continue;
            const hs = [...new Set(els.map(e => Math.round(parseFloat(getComputedStyle(e).height) * 100) / 100))];
            if (hs.length > 1) out[s] = hs.sort((a, b) => a - b);
          }
          return out;
        }, UNICA);
        for (const [sel, hs] of Object.entries(r)) falhas.push(`${f}: ${sel} → ${hs.join(", ")}px`);
      }
      expect(falhas, `classes com mais de uma altura na mesma página:\n${falhas.join("\n")}`).toEqual([]);
    });
  }
});

// ── contrato de foco (Fase 5, achado M10) ──────────────────────────────────────────────
// O sinal de foco é a principal affordance de quem navega sem mouse, e a auditoria de
// 26/07/2026 achou 3 offsets, 2 cores e duas técnicas concorrendo entre as famílias. O
// contrato agora é: cor única `--focus-strong`, espessura 2px, técnica outline, e só dois
// offsets — +2px para elemento livre, -2px para item dentro de contêiner recortado.
//
// Mede estilo computado com foco REAL de teclado (Tab), porque `.focus()` não dispara
// `:focus-visible` de forma confiável — é o pseudo-classe que a regra usa.
const FOCO = `
<div class="cluster" style="padding:24px">
  <button class="btn btn-primary" type="button">Botão</button>
  <input class="input" value="Campo">
  <select class="select"><option>Seleção</option></select>
  <textarea class="textarea">Texto</textarea>
  <div class="tabs" role="tablist"><button class="tab" role="tab" type="button">Aba</button></div>
  <nav class="pagination"><button type="button">1</button></nav>
</div>`;

const pageFoco = (theme: string) =>
  `<!doctype html><html data-theme="${theme}"><head>
     <link rel="stylesheet" href="/packages/core/dist/aurea.css">
   </head><body>${FOCO}</body></html>`;

for (const theme of ["dark", "light"] as const) {
  test(`foco · uma cor, uma espessura, offsets justificados · ${theme}`, async ({page: p, baseURL}) => {
    const url = `${baseURL}/__foco`;
    await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8", body: pageFoco(theme)}));
    await p.goto(url, {waitUntil: "networkidle"});

    const esperada = await p.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--focus-strong").trim());
    expect(esperada, "--focus-strong não existe").toBeTruthy();

    const vistos: Array<{alvo: string; cor: string; largura: string; offset: string}> = [];
    for (let i = 0; i < 6; i++) {
      await p.keyboard.press("Tab");
      const r = await p.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        return {alvo: el.tagName.toLowerCase() + "." + (el.className || "—"),
          cor: cs.outlineColor, largura: cs.outlineWidth, offset: cs.outlineOffset};
      });
      if (r) vistos.push(r);
    }
    expect(vistos.length, "nenhum elemento recebeu foco de teclado").toBeGreaterThan(3);

    // uma espessura só, e só os dois offsets do contrato
    const larguras = [...new Set(vistos.map(v => v.largura))];
    expect(larguras, `mais de uma espessura de foco: ${JSON.stringify(vistos)}`).toEqual(["2px"]);
    const offsets = [...new Set(vistos.map(v => v.offset))].sort();
    for (const o of offsets) {
      expect(["2px", "-2px"], `offset fora do contrato: ${o} — ${JSON.stringify(vistos)}`).toContain(o);
    }
    // uma cor só, e é a do token
    const cores = [...new Set(vistos.map(v => v.cor))];
    expect(cores.length, `mais de uma cor de foco: ${JSON.stringify(cores)}`).toBe(1);
  });
}

// ── B-09 · as peças que a amostra acima não via (24/09/2026) ─────────────────────────────
// O teste de cima mede seis peças, e as que ficavam de fora fugiam do contrato em silêncio: a
// região de tabela e a `DataGrid` tinham um halo de `--focus` a 38% no lugar da linha, o player
// tinha outra cor e 3px, a alça de redimensionar 1px. Aqui cada uma é medida com foco REAL de
// teclado. A cor esperada é a do `--focus-strong` NO LUGAR da peça, lida por uma sonda irmã: é
// isso que deixa o player redefinir o token (fundo quase preto nos dois temas) sem regra à parte.
// O `check 44` do validate.py lê as regras; este mede o que o navegador desenha.
const FORA_DA_AMOSTRA = `
<div style="padding:24px;display:grid;gap:24px">
  <div class="table-wrap table-region" tabindex="0" role="region" aria-label="Tabela">
    <table class="table"><thead><tr><th>Coluna</th></tr></thead><tbody><tr><td>Valor</td></tr></tbody></table>
  </div>
  <div class="datagrid">
    <div class="table-wrap" tabindex="0" role="region" aria-label="Grade">
      <table class="table"><thead><tr><th>Nome<button class="datagrid-resizer" type="button" aria-label="Largura"></button></th></tr></thead>
      <tbody><tr><td>Valor</td></tr></tbody></table>
    </div>
  </div>
  <div class="media-player"><div class="media-controls">
    <div class="media-seek"><input type="range" aria-label="Posição"></div>
    <button class="btn btn-ghost" type="button">Tocar</button>
  </div></div>
  <div class="tree-item" tabindex="0" role="treeitem" aria-selected="false"><div class="tree-node">Pasta</div></div>
  <div class="notification-item" tabindex="0">Aviso</div>
</div>`;

for (const theme of ["dark", "light"] as const) {
  test(`foco · B-09 · a linha do token também fora da amostra · ${theme}`, async ({page: p, baseURL}) => {
    const url = `${baseURL}/__foco-b09`;
    await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html data-theme="${theme}"><head>
        <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
        <body>${FORA_DA_AMOSTRA}</body></html>`}));
    await p.goto(url, {waitUntil: "networkidle"});

    const vistos: Array<Record<string, string>> = [];
    for (let i = 0; i < 12; i++) {
      await p.keyboard.press("Tab");
      const r = await p.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el || el === document.body) return null;
        // no item de árvore a linha é do filho `.tree-node` (a regra é `.tree-item:focus-visible > .tree-node`)
        const alvo = el.classList.contains("tree-item") ? el.querySelector<HTMLElement>(".tree-node")! : el;
        const cs = getComputedStyle(alvo);
        // a cor que o token vale AQUI: uma sonda no mesmo pai pinta `color: var(--focus-strong)`
        const sonda = document.createElement("span");
        sonda.style.color = "var(--focus-strong)";
        alvo.parentElement!.appendChild(sonda);
        const esperada = getComputedStyle(sonda).color;
        sonda.style.color = "var(--primary)";
        const primaria = getComputedStyle(sonda).color;
        sonda.remove();
        const raiz = getComputedStyle(document.documentElement);
        return {alvo: el.tagName.toLowerCase() + "." + (el.className || "—"),
          estilo: cs.outlineStyle, largura: cs.outlineWidth, offset: cs.outlineOffset,
          cor: cs.outlineColor, esperada, primaria, sombra: cs.boxShadow,
          token: raiz.getPropertyValue("--focus-width").trim(),
          afastamento: raiz.getPropertyValue("--focus-offset").trim()};
      });
      if (r) vistos.push(r);
    }
    const nomes = vistos.map(v => v.alvo).join(" · ");
    for (const alvo of ["table-region", "datagrid-resizer", "tree-item", "notification-item"]) {
      expect(nomes, `${alvo} não recebeu foco de teclado`).toContain(alvo);
    }
    expect(vistos.some(v => v.alvo === "input.—"), "o controle de posição do player não recebeu foco").toBe(true);

    for (const v of vistos) {
      const quem = JSON.stringify(v);
      expect(v.estilo, `linha de foco ausente: ${quem}`).toBe("solid");
      expect(v.largura, `espessura fora do token: ${quem}`).toBe(v.token);
      expect([v.afastamento, `-${v.afastamento}`], `afastamento fora do contrato: ${quem}`).toContain(v.offset);
      expect(v.cor, `cor fora do --focus-strong do lugar: ${quem}`).toBe(v.esperada);
      expect(v.sombra, `sombra no lugar da linha: ${quem}`).toBe("none");
    }
    // o player redefine o token: dentro dele o foco é o amarelo, nos DOIS temas
    for (const v of vistos.filter(v => v.alvo === "input.—" || v.alvo.startsWith("button.btn"))) {
      expect(v.cor, `no player o foco é --primary: ${JSON.stringify(v)}`).toBe(v.primaria);
    }
  });
}

// ── ADR-0052 · o botão só de ícone é REDONDO (25/09/2026) ──────────────────────────────────
// Redondo = quadrado (largura igual à altura) com raio de pelo menos metade do lado. Os CINCO
// tamanhos: o `btn-xl` escapou da primeira passada desta mudança, e só a lista inteira o pega. As duas
// metades importam: raio 999 num botão mais largo que alto dá pílula, não círculo — foi o que a
// medição achou no `.media-control` (38×36, pelo recheio lateral) antes de ele perder o recheio.
// Mede nas três densidades, porque a altura do botão muda com elas.
for (const density of ["compact", "comfortable", "spacious"] as const) {
  test(`botão só de ícone é redondo · ${density}`, async ({page: p, baseURL}) => {
    const url = `${baseURL}/__icone-redondo`;
    const ic = `<svg class="icon" aria-hidden="true" viewBox="0 0 32 32"></svg>`;
    await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html data-theme="dark" data-density="${density}"><head>
        <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>
        ${["btn-xs", "btn-sm", "", "btn-lg", "btn-xl"].map(t =>
          `<button class="btn btn-ghost btn-icon ${t}" type="button" aria-label="x">${ic}</button>`).join("")}
        <div class="media-player"><div class="media-controls"><div class="media-control-row"><div class="media-control-group">
          <button class="media-control" type="button" aria-label="Tocar">${ic}</button>
        </div></div></div></div></body></html>`}));
    await p.goto(url, {waitUntil: "networkidle"});
    const botoes = await p.$$eval("button", bs => bs.map(b => {
      const c = b.getBoundingClientRect();
      return {quem: b.className, w: c.width, h: c.height, raio: parseFloat(getComputedStyle(b).borderTopLeftRadius)};
    }));
    expect(botoes.length).toBe(6);
    for (const b of botoes) {
      expect(b.w, `não é quadrado: ${JSON.stringify(b)}`).toBe(b.h);
      expect(b.raio, `raio menor que metade do lado: ${JSON.stringify(b)}`).toBeGreaterThanOrEqual(b.h / 2);
    }
  });
}
