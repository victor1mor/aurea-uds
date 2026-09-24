// Inventário das referências locais — §9, §10 e §12 da ATIVIDADE-2.
//
// O §10 proíbe amostragem: "analisei os mais importantes" e "os restantes seguem o mesmo padrão"
// são frases banidas. Então isto não lê nada por amostra — ENUMERA a superfície pública de cada
// referência a partir da fonte de verdade DELA, que é diferente em cada projeto:
//
//   base-ui        packages/react/src/<primitive>/          — uma pasta por primitive
//   radix          packages/react/<primitive>/              — idem
//   shadcn/ui      apps/v4/registry.json                    — 411 itens já tipados por eles
//   untitled-ui    components/{base,application,...}/<x>/   — pasta por família
//   kibo           packages/<componente>/                   — pacote por componente
//   reui           registry-reui/bases/base/{components,reui}/
//   media-chrome   src/js/media-*.ts                        — um custom element por arquivo
//   mui            packages/mui-material/src/<Componente>/
//   shark-ui       registry/manifest/<x>.ts + registry/react/{components,blocks,templates,hooks}
//
// Achar a fonte certa foi metade do trabalho e é o §11 na prática: o `components/ui` do ReUI tem
// 28 arquivos e o `components/` do Shark tem 20, mas os dois são o CHROME DO SITE de documentação
// — a biblioteca mora noutro lugar. Tomar o índice pelo produto teria subestimado as duas em mais
// de três vezes.
//
// Rodar:  node audit/activity-2/inventory.mjs
// Escreve: audit/activity-2/INVENTORY.json  (commitado: é registro de observação externa em
//          commits fixados, e a `Referencia/` não existe num contêiner limpo)

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const REF = path.join(ROOT, "Referencia");

const existe = (p) => fs.existsSync(p);
const dirs = (p) => existe(p) ? fs.readdirSync(p, {withFileTypes: true})
  .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !d.name.startsWith("_"))
  .map((d) => d.name).sort() : [];
const files = (p, re) => existe(p) ? fs.readdirSync(p).filter((f) => re.test(f)).sort() : [];

/** kebab-case minúsculo, para o mesmo conceito casar entre projetos que o escrevem diferente.
 *
 *  A segunda substituição existe por causa de ACRÔNIMO: só a primeira regra transformava
 *  `OTPField` em `otpfield` e `QRCode` em `qrcode`, que então não casavam com o `input-otp` do
 *  shadcn nem com o `qr-code` do Kibo — e a Aurea aparecia como se não tivesse os dois. Falso
 *  ausente é pior que ausente: entra na fila e alguém constrói o que já existe. */
const chave = (nome) => nome
  .replace(/\.(tsx?|jsx?|mdx)$/, "")
  .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")   // OTPField -> OTP-Field
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")      // dataGrid -> data-Grid
  .replace(/[\s_]+/g, "-")
  .toLowerCase();

const fontes = {};

// ── base-ui ────────────────────────────────────────────────────────────────
{
  const base = path.join(REF, "base-ui-master/base-ui-master/packages/react/src");
  fontes["base-ui"] = {
    projeto: "mui/base-ui",
    papel: "o motor que a Aurea JÁ usa — comportamento, teclado, ARIA",
    fonteDeVerdade: "packages/react/src/<primitive>/",
    itens: dirs(base).map((d) => ({
      nome: d, chave: chave(d), tipo: "primitive",
      // as PEÇAS de um primitive headless são a anatomia dele, e é isso que interessa aqui
      partes: files(path.join(base, d), /^[A-Z].*\.tsx$/).map((f) => f.replace(/\.tsx$/, "")),
    })),
  };
}

// ── radix ──────────────────────────────────────────────────────────────────
{
  const base = path.join(REF, "radix-primitives-main/radix-primitives-main/packages/react");
  fontes.radix = {
    projeto: "radix-ui/primitives",
    papel: "a origem do headless que o ecossistema copiou",
    fonteDeVerdade: "packages/react/<primitive>/",
    itens: dirs(base).map((d) => ({nome: d, chave: chave(d), tipo: "primitive"})),
  };
}

// ── shadcn/ui ──────────────────────────────────────────────────────────────
{
  const reg = path.join(REF, "ui-main/ui-main/apps/v4/registry.json");
  const itens = existe(reg) ? JSON.parse(fs.readFileSync(reg, "utf8")).items ?? [] : [];
  fontes["shadcn-ui"] = {
    projeto: "shadcn-ui/ui",
    papel: "decomposição em peças, registry, CLI, fronteira servidor/cliente",
    fonteDeVerdade: "apps/v4/registry.json (itens já tipados pelo projeto)",
    itens: itens
      .filter((i) => i.type !== "registry:internal" && i.type !== "registry:style")
      .map((i) => ({
        nome: i.name, chave: chave(i.name),
        tipo: (i.type ?? "").replace("registry:", "") || "?",
        deps: i.dependencies ?? [],
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome)),
  };
}

// ── untitled ui react ──────────────────────────────────────────────────────
{
  const base = path.join(REF, "react-main/react-main/components");
  const itens = [];
  for (const familia of dirs(base)) {
    if (familia === "internal" || familia === "shared-assets") continue;
    for (const d of dirs(path.join(base, familia))) {
      itens.push({nome: d, chave: chave(d), tipo: familia,
                  partes: files(path.join(base, familia, d), /\.tsx$/).map((f) => f.replace(/\.tsx$/, ""))});
    }
  }
  fontes["untitled-ui"] = {
    projeto: "untitleduico/react",
    papel: "escala de tamanhos, proporção, estados esquecidos",
    fonteDeVerdade: "components/<família>/<componente>/",
    itens,
  };
}

// ── kibo ───────────────────────────────────────────────────────────────────
{
  const base = path.join(REF, "kibo-main/kibo-main/packages");
  fontes.kibo = {
    projeto: "haydenbleasel/kibo",
    papel: "anatomia de componente raro — gantt, kanban, editor, dropzone, tree",
    fonteDeVerdade: "packages/<componente>/",
    itens: dirs(base).map((d) => ({nome: d, chave: chave(d), tipo: "component"})),
  };
}

// ── reui ───────────────────────────────────────────────────────────────────
{
  const base = path.join(REF, "reui-main/reui-main/registry-reui/bases/base");
  const itens = [
    ...dirs(path.join(base, "components")).map((d) => ({nome: d, chave: chave(d), tipo: "component"})),
    ...dirs(path.join(base, "reui")).map((d) => ({nome: d, chave: chave(d), tipo: "reui"})),
    ...files(path.join(base, "reui"), /\.tsx$/).map((f) => ({nome: f.replace(/\.tsx$/, ""), chave: chave(f), tipo: "reui"})),
  ];
  fontes.reui = {
    projeto: "keenthemes/reui",
    projetoNota: "o `components/ui/` da raiz é o chrome do site de documentação, não a biblioteca",
    papel: "terceira leitura de anatomia, blocos compostos, data e IA",
    fonteDeVerdade: "registry-reui/bases/base/{components,reui}/",
    itens: itens.sort((a, b) => a.nome.localeCompare(b.nome)),
  };
}

// ── media chrome ───────────────────────────────────────────────────────────
{
  const base = path.join(REF, "media-chrome-main/media-chrome-main/src/js");
  fontes["media-chrome"] = {
    projeto: "muxinc/media-chrome",
    papel: "anatomia de player e de biblioteca de mídia",
    fonteDeVerdade: "src/js/<custom-element>.ts",
    itens: files(base, /^media-.*\.ts$/).map((f) => ({
      nome: f.replace(/\.ts$/, ""), chave: chave(f.replace(/\.ts$/, "")), tipo: "custom-element",
    })),
  };
}

// ── mui ────────────────────────────────────────────────────────────────────
{
  const base = path.join(REF, "material-ui-master/packages/mui-material/src");
  fontes.mui = {
    projeto: "mui/material-ui",
    papel: "catálogo de estados e anatomia madura; a mais completa em cobertura",
    fonteDeVerdade: "packages/mui-material/src/<Componente>/",
    itens: dirs(base).map((d) => ({nome: d, chave: chave(d), tipo: "component"})),
  };
}

// ── shark ui ───────────────────────────────────────────────────────────────
{
  const base = path.join(REF, "shark-ui-main/shark-ui-main/registry");
  const itens = [
    ...files(path.join(base, "manifest"), /\.ts$/).map((f) => ({
      nome: f.replace(/\.ts$/, ""), chave: chave(f), tipo: "component",
    })),
  ];
  for (const grupo of ["blocks", "templates", "hooks"]) {
    for (const d of dirs(path.join(base, "react", grupo))) {
      itens.push({nome: d, chave: chave(d), tipo: grupo.replace(/s$/, "")});
    }
    for (const f of files(path.join(base, "react", grupo), /\.tsx?$/)) {
      itens.push({nome: f.replace(/\.tsx?$/, ""), chave: chave(f), tipo: grupo.replace(/s$/, "")});
    }
  }
  fontes["shark-ui"] = {
    projeto: "sharkui-inc/shark-ui",
    projetoNota: "o `components/` da raiz é o chrome do site de documentação, não a biblioteca",
    papel: "amplitude, construção de design system, componentes raros",
    fonteDeVerdade: "registry/manifest/<x>.ts + registry/react/{blocks,templates,hooks}/",
    itens: itens.sort((a, b) => a.nome.localeCompare(b.nome)),
  };
}

// ── a Aurea, para a comparação existir ─────────────────────────────────────
{
  const reg = path.join(ROOT, "packages/contracts/registry");
  fontes.aurea = {
    projeto: "victor1mor/aurea-uds",
    papel: "nós",
    fonteDeVerdade: "packages/contracts/registry/<Componente>.json (gateado contra o compilador)",
    itens: files(reg, /\.json$/).map((f) => {
      const j = JSON.parse(fs.readFileSync(path.join(reg, f), "utf8"));
      return {nome: j.name, chave: chave(j.name), tipo: (j.category ?? "?").toLowerCase()};
    }),
  };
}

// ── saída ──────────────────────────────────────────────────────────────────
const ausentes = Object.entries(fontes).filter(([, f]) => !f.itens.length).map(([k]) => k);
if (ausentes.length) {
  console.error(`ATENÇÃO — sem itens (a Referencia/ está no lugar?): ${ausentes.join(", ")}`);
}

const out = {
  _gerado: "node audit/activity-2/inventory.mjs — enumerado da fonte de verdade de cada projeto",
  _regra: "Isto é COBERTURA, não amostra (§10). Nenhum item foi escolhido a dedo; a lista é a " +
    "enumeração completa do que cada projeto expõe na fonte declarada em `fonteDeVerdade`.",
  _proveniencia: "Os commits de cada referência estão em audit/activity-2/02-FONTES.md",
  totais: Object.fromEntries(Object.entries(fontes).map(([k, f]) => [k, f.itens.length])),
  fontes,
};

fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY.json"), JSON.stringify(out, null, 2) + "\n");
const linhas = Object.entries(out.totais).sort((a, b) => b[1] - a[1]);
console.log("inventory:");
for (const [k, n] of linhas) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log(`  ${String(linhas.reduce((s, [, n]) => s + n, 0)).padStart(4)}  TOTAL`);
