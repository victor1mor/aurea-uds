// INVENTÁRIO DA CAMADA DE DOCUMENTAÇÃO — §11 da ATIVIDADE-2.
//
// POR QUE ELA EXISTE, separada do inventário de código. O §11 diz que a documentação "traz o que o
// código não mostra", e a primeira página lida provou isso em dez minutos: a shadcn DOCUMENTA o
// mesmo defeito de ordem de foco que a Aurea acabou de corrigir estruturalmente, e resolve por
// convenção que o autor precisa lembrar —
//
//   "For proper focus management, InputGroupAddon should always be placed after
//    InputGroupInput or InputGroupTextarea in the DOM. Use the align prop to VISUALLY
//    position the addon."
//
// Isso não está em prop nenhuma, em nenhum `.d.ts`, em nenhuma classe. Só na prosa. Um inventário
// que só lê código concluiria que as duas bibliotecas têm a mesma capacidade.
//
// O QUE ELE EXTRAI, e o que ele NÃO extrai. Ele cobre a parte MECÂNICA: quais páginas existem,
// que seções cada uma tem, árvore de composição, tabelas de prop e de teclado, e as frases que
// falam de acessibilidade, foco, teclado, ARIA, responsividade e toque. A leitura humana continua
// obrigatória — o Victor foi explícito: "não reduza a fonte ao que o extrator consegue medir".
// A saída deste script é insumo para essa leitura, não substituto dela.
//
// O CONTROLE (regra do 04-PROTOCOLO-IA.md §1b). Cada fonte tem pelo menos uma resposta CONHECIDA,
// vinda do inventário de código que já existe. Se o extrator não a encontrar, ele FALHA em vez de
// devolver um número menor em silêncio — que é como os cinco defeitos anteriores nasceram.
//
// Rodar:  node audit/activity-2/inventory-docs.mjs [fonte]
// Escreve: audit/activity-2/INVENTORY-DOCS-<FONTE>.json

import fs from "node:fs";
import path from "node:path";

const AQUI = import.meta.dirname;
const CACHE = "/tmp/docs-cache";

const FONTES = {
  shadcn: {
    nome: "shadcn/ui",
    indice: "https://ui.shadcn.com/docs/components",
    padraoPagina: /\/docs\/components\/([a-z0-9-]+)/g,
    url: (slug) => `https://ui.shadcn.com/docs/components/${slug}`,
    // CONTROLE: a página do input-group TEM de trazer a frase de gestão de foco e a árvore de
    // composição. As duas foram lidas a olho em 22/08/2026, e as duas são exatamente o tipo de
    // coisa que só a documentação diz.
    controle: {
      slug: "input-group",
      contem: ["For proper focus management", "InputGroupAddon", "align"],
      secoes: ["Composition", "Align"],
    },
  },
  mui: {
    nome: "MUI Material",
    indice: "https://mui.com/material-ui/all-components/",
    padraoPagina: /\/material-ui\/react-([a-z0-9-]+)\//g,
    url: (slug) => `https://mui.com/material-ui/react-${slug}/`,
    // CONTROLE: o inventário de CÓDIGO já mediu que o Button da MUI tem `variant:
    // text|contained|outlined`. A documentação tem de dizer o mesmo — se não disser, ou o
    // extrator está lendo a página errada, ou a página não carregou o conteúdo.
    controle: {slug: "button", contem: ["contained", "outlined", "variant"], secoes: []},
  },
  untitled: {
    nome: "Untitled UI (web)",
    indice: "https://www.untitledui.com/react/components",
    padraoPagina: /\/react\/components\/([a-z0-9-]+)/g,
    url: (slug) => `https://www.untitledui.com/react/components/${slug}`,
    // Esta fonte estava registrada como PENDING porque o pacote npm é só a CLI e os componentes
    // não são publicados. A conclusão certa era "não entra pelo método das outras" — e não "não
    // dá para inventariar": a web publica 79 componentes.
    controle: {slug: "buttons", contem: ["Button"], secoes: []},
  },
  "21st": {
    nome: "21st.dev",
    indice: "https://21st.dev/community/components",
    padraoPagina: /\/s\/([a-z0-9-]+)/g,
    url: (slug) => `https://21st.dev/s/${slug}`,
    // Diretório de comunidade: o que se inventaria é o CATÁLOGO, não uma biblioteca. A licença é
    // item a item (§192), então nada daqui entra na Aurea sem a checagem individual.
    controle: {slug: "button", contem: ["button"], secoes: []},
  },
  reui: {
    nome: "ReUI",
    indice: "https://reui.io/docs",
    // O PADRÃO REAL é `/docs/components/base/<slug>`, e não `/docs/<slug>` — a família vem no
    // caminho. Foi por isso que a primeira varredura devolveu 0 casamentos e a fonte ficou
    // PENDENTE: o extrator estava apontado para um padrão que não existe. Ele FALHOU em vez de
    // devolver zero em silêncio, que é exatamente o que a regra do §1b pede.
    padraoPagina: /\/docs\/components\/base\/([a-z0-9-]+)/g,
    url: (slug) => `https://reui.io/docs/components/base/${slug}`,
    // CONTROLE: o inventário de CÓDIGO já mediu a descrição do Alert, palavra por palavra. Se a
    // documentação não a trouxer, o extrator está lendo outra coisa.
    controle: {slug: "alert", contem: ["callout", "attention"], secoes: []},
  },
  shark: {
    nome: "Shark UI",
    indice: "https://shark.vini.one/docs/components",
    padraoPagina: /\/docs\/components\/([a-z0-9-]+)/g,
    url: (slug) => `https://shark.vini.one/docs/components/${slug}`,
    // CONTROLE: o código mediu que o Button do Shark publica os estados de dado `size`, `slot`,
    // `state` e `variant`. A documentação tem de falar de pelo menos variante e tamanho.
    controle: {slug: "button", contem: ["variant", "size"], secoes: []},
  },
};

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));

async function baixa(url) {
  fs.mkdirSync(CACHE, {recursive: true});
  const arq = path.join(CACHE, url.replace(/[^a-z0-9]+/gi, "_").slice(-120) + ".html");
  if (fs.existsSync(arq)) return fs.readFileSync(arq, "utf8");
  const r = await fetch(url, {headers: {"user-agent": "aurea-uds-audit/1.0 (inventário §11)"}});
  if (!r.ok) throw new Error(`${r.status} em ${url}`);
  const t = await r.text();
  fs.writeFileSync(arq, t);
  await dorme(400);                       // não martelar o servidor de ninguém
  return t;
}

/** O texto visível da página. `<script>` fora ANTES de tirar as tags: o Next.js embute a página
 *  inteira de novo dentro de `self.__next_f`, e sem isso todo trecho aparece duplicado — o que
 *  faria qualquer contagem valer o dobro. */
function texto(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&#x27;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

/** As seções da página, lidas da ESTRUTURA e não do texto achatado.
 *
 *  A primeira versão procurava `Texto #` no texto sem tags, porque a shadcn põe uma âncora `#`
 *  depois de cada cabeçalho. O controle reprovou na primeira execução: a árvore de composição
 *  termina em `InputGroupText` e o cabeçalho seguinte é `Align`, então saía `InputGroupText
 *  Align` — o conteúdo anterior colado no título. Metade das seções vinha com `View Code` na
 *  frente pelo mesmo motivo.
 *
 *  Texto achatado não tem onde uma coisa termina e a outra começa. `<h2>` tem. */
const secoesDe = (html) => [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
  // o `#` no fim é a ÂNCORA do cabeçalho, não o título. Terceira coisa que o controle pegou.
  .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ").replace(/\s*#\s*$/, "").trim())
  .filter((s) => s.length > 1 && s.length < 60);

/** A árvore de composição em arte ASCII, que é como a shadcn publica a anatomia. */
function composicao(t) {
  const m = /((?:[A-Za-z]+ )?(?:├──|└──|│)[\s\S]{0,600})/.exec(t);
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").slice(0, 400);
}

/** As frases que falam do que o código não mostra. Uma por assunto, com o assunto declarado —
 *  lista de frases sem rótulo vira prosa solta e ninguém consegue comparar depois. */
const ASSUNTOS = {
  foco: /\b(focus management|focus order|focus trap|autofocus|tab order|tabbable)\b/i,
  teclado: /\b(keyboard|arrow keys?|Enter key|Escape key|Tab key|shortcut)\b/i,
  aria: /\b(aria-[a-z]+|screen reader|assistive tech|role=)/i,
  responsivo: /\b(responsive|breakpoint|mobile|viewport|container quer)/i,
  toque: /\b(touch|swipe|drag|pointer|long press)\b/i,
  composicao: /\b(composition|compose|asChild|render prop|slot)\b/i,
  acessibilidade: /\b(accessib|a11y|WCAG|contrast)/i,
};
function achados(t) {
  const frases = t.split(/(?<=[.!?])\s+/).filter((f) => f.length > 30 && f.length < 400);
  const out = {};
  for (const [assunto, rx] of Object.entries(ASSUNTOS)) {
    const casa = frases.filter((f) => rx.test(f));
    if (casa.length) out[assunto] = [...new Set(casa)].slice(0, 6);
  }
  return out;
}

async function inventaria(chave) {
  const f = FONTES[chave];
  if (!f) throw new Error(`fonte desconhecida: ${chave} (conhecidas: ${Object.keys(FONTES)})`);

  const idx = await baixa(f.indice);
  const slugs = [...new Set([...idx.matchAll(f.padraoPagina)].map((m) => m[1]))].sort();

  const paginas = {};
  for (const slug of slugs) {
    let html, t;
    try { html = await baixa(f.url(slug)); t = texto(html); }
    catch (e) { paginas[slug] = {erro: String(e).slice(0, 90)}; continue; }
    paginas[slug] = {
      secoes: secoesDe(html),
      composicao: composicao(t),
      achados: achados(t),
      caracteres: t.length,
    };
  }

  // ── O CONTROLE ──────────────────────────────────────────────────────────────────────────────
  const c = f.controle;
  const alvo = paginas[c.slug];
  const problemas = [];
  if (!alvo || alvo.erro) problemas.push(`a página de controle (${c.slug}) não foi lida`);
  else {
    const bruto = texto(await baixa(f.url(c.slug)));
    for (const frag of c.contem) {
      if (!bruto.includes(frag)) problemas.push(`o controle não achou o trecho conhecido: "${frag}"`);
    }
    for (const s of c.secoes) {
      if (!alvo.secoes.includes(s)) problemas.push(`o controle não achou a seção conhecida: "${s}"`);
    }
  }
  if (problemas.length) {
    throw new Error(`CONTROLE DO EXTRATOR REPROVOU — a saída não é confiável:\n  ` +
      problemas.join("\n  ") + `\n\nA regra do 04-PROTOCOLO-IA.md §1b existe porque cinco ` +
      `extratores já erraram PARA MENOS nesta atividade. Corrija o extrator, não o controle.`);
  }

  const saida = {
    _gerado: new Date().toISOString().slice(0, 10),
    _fonte: f.nome,
    _metodo: "camada de DOCUMENTAÇÃO (§11), lida da web. Complementa o inventário de CÓDIGO — " +
      "não o substitui, e não substitui a leitura humana.",
    _controle: `${c.slug}: ${c.contem.length} trechos + ${c.secoes.length} seções conhecidas`,
    paginas: slugs.length,
    comErro: Object.values(paginas).filter((p) => p.erro).length,
    porPagina: paginas,
  };
  const arq = path.join(AQUI, `INVENTORY-DOCS-${chave.toUpperCase()}.json`);
  fs.writeFileSync(arq, JSON.stringify(saida, null, 1) + "\n");

  const comAchado = Object.entries(paginas).filter(([, p]) => Object.keys(p.achados ?? {}).length);
  console.log(`${f.nome}: ${slugs.length} páginas · ${comAchado.length} com achado de prosa · ` +
    `${saida.comErro} com erro → ${path.relative(process.cwd(), arq)}`);
  const porAssunto = {};
  for (const [, p] of comAchado) for (const a of Object.keys(p.achados)) porAssunto[a] = (porAssunto[a] ?? 0) + 1;
  console.log("  por assunto:", Object.entries(porAssunto).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`).join(" · "));
}

await inventaria(process.argv[2] ?? "shadcn");
