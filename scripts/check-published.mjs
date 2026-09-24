// Prova que o PACOTE PUBLICADO instala e funciona — não a árvore local.
//
// Por que existe (12/08/2026, pedido do Victor depois do publish da 0.2.0): a `0.1.0` ficou
// DOZE DIAS no npm sem instalar dentro de um componente de servidor, e nenhum gate deste
// repositório podia ver isso. Todos eles medem a árvore: o `check-pack.mjs` confere o que ENTRA
// no tarball, o `validate.py` confere o fonte, e os dois apps de prova de `apps/` instalam do
// WORKSPACE — que é o que os torna cegos para o defeito que atinge quem instala do registro.
//
// O que este script NÃO é: não é o item K4. Um app escrito por nós para satisfazer a condição de
// "consumidor real" é a condição corrigindo a própria prova, e isso está escrito no rodapé do K4
// em PLANO-1.0.md. Isto aqui prova INSTALABILIDADE, que é outra coisa e é medível.
//
// Como funciona, e por que reusa em vez de escrever um terceiro app: `apps/proof-server` e
// `apps/proof-client` já são exatamente as duas provas certas (RSC e empacotador de cliente),
// escritas na Parte A contra o defeito real. Este script copia as duas para fora do repositório,
// troca `workspace:*` pela versão publicada, instala com `npm` do registro e constrói. A única
// diferença entre elas e o consumidor é de onde vêm os pacotes — que é justamente a variável.
//
// Uso:
//   node scripts/check-published.mjs           # a versão que packages/react/package.json declara
//   node scripts/check-published.mjs 0.1.0     # uma versão qualquer — é assim que a prova
//                                              # contra o defeito roda: a 0.1.0 REPROVA
//   node scripts/check-published.mjs --keep    # não apaga a pasta temporária
//
// Não roda no `validate.py` e não roda na CI: precisa de rede e de uma versão já publicada.
// É um controle de DEPOIS do publish.

import {execFileSync} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const keep = args.includes("--keep");
const versao = args.find((a) => !a.startsWith("--"))
  ?? JSON.parse(fs.readFileSync(path.join(root, "packages/react/package.json"), "utf8")).version;

// PROVADO CONTRA O DEFEITO, e a prova precisou de três camadas — 12/08/2026.
//
// Rodar `node scripts/check-published.mjs 0.1.0` reprova, e a primeira leitura da reprovação me
// fez afirmar mais do que eu tinha medido. O que o script reporta é a camada de CIMA, e a 0.1.0
// tem três defeitos empilhados. Descascando uma por uma, fora deste script:
//
//   1. `Export Toggle doesn't exist in target module` — o Toggle nasceu no Lote 1, depois do
//      publish. É o que o script vê, e é defeito de COMPATIBILIDADE, não de fronteira.
//   2. Tirando o Toggle: `TS2882: Cannot find module or type declarations for side-effect import
//      of '@aurea-uds/core/css'` — o subpath sem condição `types`, que reprovava em QUALQUER
//      consumidor TypeScript. Mais `TS2339` em `AureaStrings.loading`. Morre na checagem de tipos.
//   3. Desligando a checagem de tipos: `TypeError: (0 , d.createContext) is not a function`, em
//      "Failed to collect page data for /". **Este é o defeito de RSC** — o barril reexportando
//      contexto do React sem a diretiva, avaliado onde `createContext` não existe.
//
// Então sim: o script pega o defeito que o motivou. Mas o registro é a cadeia, não a frase — cada
// uma das três derruba o build sozinha, e dizer "ele prova RSC" sem descascar as duas primeiras
// seria a mesma imprecisão que o E13 e o I6–I8 já pagaram nesta casa.
//
// Cada app declara o que prova. As asserções são STRINGS do HTML/JS construído, e cada uma nomeia
// o defeito que ela pega — asserção que não nomeia defeito é decoração (lição do I6/I7/I8).
const APPS = [
  {
    dir: "apps/proof-server",
    porque: "componente de SERVIDOR (RSC) — instala, tipa e resolve a fronteira",
    build: "next build",
    saida: "out/index.html",
    exige: [
      ['id="prova"', "a página renderizou no build (se a fronteira quebra, o build morre antes)"],
      ['id="do-servidor"', "o componente de servidor saiu no HTML"],
      ['data-cx="card card-raised"', "cx() foi CHAMADO no servidor — é o pure.tsx sem diretiva"],
      ["Renderizado no servidor", "o Accordion é marcação pura e continua de servidor"],
      ['id="do-cliente"', "o provider de cliente atravessou a fronteira"],
    ],
  },
  {
    dir: "apps/proof-client",
    porque: "empacotador de cliente — mapa `exports`, barril E subpath",
    build: "vite build",
    saida: "out/index.html",
    exige: [
      ['id="root"', "o HTML de entrada saiu"],
      ["assets/", "o empacotador resolveu tudo e emitiu o pacote"],
    ],
    // O subpath só aparece no JS empacotado, não no HTML: o proof-client é uma SPA.
    exigeNoBundle: [
      ["Do subpath", "@aurea-uds/react/disclosure resolveu pelo mapa exports"],
    ],
  },
];

const IGNORAR = new Set(["node_modules", ".next", "out", "dist", ".turbo"]);

function rodar(cmd, cwd) {
  execFileSync(cmd, {cwd, shell: true, stdio: "pipe", encoding: "utf8", timeout: 15 * 60_000});
}

function copiar(de, para) {
  fs.cpSync(de, para, {
    recursive: true,
    filter: (src) => !IGNORAR.has(path.basename(src)),
  });
}

// Reprovar sem NOMEAR a causa é o defeito que o E13 registrou: a asserção tem de dizer o que
// quebrou, senão a próxima sessão herda um vermelho sem diagnóstico. A primeira versão desta
// função devolvia UMA linha, e na prova contra a 0.1.0 ela devolveu "Build error occurred" — que
// é o rodapé do Next, não a causa. Agora junta as linhas que carregam diagnóstico e descarta o
// ruído de progresso.
//
// E ela mora ACIMA do laço de propósito: na primeira tentativa estava no fim do arquivo, e
// `const` não sobe como `function` — o laço chamou a função e recebeu
// `ReferenceError: Cannot access 'RUIDO' before initialization`. `node --check` passa nisso, porque
// é erro de EXECUÇÃO e não de sintaxe. Só a prova contra o defeito pegou.
const RUIDO = /^(npm warn|npm notice|▲|✓|Creating|Collecting|Generating|Finalizing|Linting|Checking|Compiled|transforming|rendering|computing|modules transformed|\s*$)/i;
const DIAGNOSTICO = /error|erro|failed|cannot|could not|not found|unsupported|unresolved|TS\d{4}|use client|Module not found|does not provide|is not exported/i;

function causaProvavel(e) {
  const linhas = `${e.stdout ?? ""}\n${e.stderr ?? ""}\n${e.message ?? ""}`
    .split(/\r?\n/)
    // eslint-disable-next-line no-control-regex -- o Next e o Vite colorem a saída
    .map((l) => l.replace(/\[[0-9;]*m/g, "").trim())
    .filter((l) => l && !RUIDO.test(l) && DIAGNOSTICO.test(l));
  const vistas = [...new Set(linhas)].slice(0, 8);
  return vistas.length ? `\n    ${vistas.join("\n    ")}` : (e.message ?? "").split(/\r?\n/)[0];
}

const falhas = [];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aurea-publicado-"));
console.log(`versao sob teste: ${versao}`);
console.log(`pasta temporaria: ${tmp}\n`);

try {
  for (const app of APPS) {
    const nome = path.basename(app.dir);
    const alvo = path.join(tmp, nome);
    console.log(`--- ${nome}: ${app.porque}`);
    copiar(path.join(root, app.dir), alvo);

    // A troca que é o ponto do script inteiro: workspace:* -> a versão publicada.
    const pjPath = path.join(alvo, "package.json");
    const pjTxt = fs.readFileSync(pjPath, "utf8");
    if (!pjTxt.includes('"workspace:*"')) {
      falhas.push(`${nome}: nenhum "workspace:*" no package.json — o script pararia de testar o registro sem avisar`);
      continue;
    }
    fs.writeFileSync(pjPath, pjTxt.replaceAll('"workspace:*"', `"${versao}"`));

    try {
      rodar("npm install --no-audit --no-fund --loglevel=error", alvo);
    } catch (e) {
      falhas.push(`${nome}: a INSTALACAO falhou — ${causaProvavel(e)}`);
      continue;
    }

    // Sem isto o teste pode passar medindo a árvore local: se o pacote instalado for um link para
    // o workspace, ou uma versão diferente da pedida, não há prova nenhuma sobre o registro.
    for (const p of ["@aurea-uds/react", "@aurea-uds/core"]) {
      const dentro = path.join(alvo, "node_modules", ...p.split("/"));
      if (fs.lstatSync(dentro).isSymbolicLink()) {
        falhas.push(`${nome}: ${p} veio como LINK — isso mede o workspace, não o registro`);
        continue;
      }
      const v = JSON.parse(fs.readFileSync(path.join(dentro, "package.json"), "utf8")).version;
      if (v !== versao) falhas.push(`${nome}: ${p} instalou ${v}, pedimos ${versao}`);
    }

    try {
      rodar(`npm exec -- ${app.build}`, alvo);
    } catch (e) {
      falhas.push(`${nome}: o BUILD falhou — ${causaProvavel(e)}`);
      continue;
    }

    const saida = path.join(alvo, app.saida);
    if (!fs.existsSync(saida)) {
      falhas.push(`${nome}: o build passou e ${app.saida} não existe`);
      continue;
    }
    const html = fs.readFileSync(saida, "utf8");
    for (const [agulha, prova] of app.exige) {
      if (!html.includes(agulha)) falhas.push(`${nome}: ${app.saida} sem ${JSON.stringify(agulha)} — ${prova}`);
    }
    for (const [agulha, prova] of app.exigeNoBundle ?? []) {
      const dirAssets = path.join(path.dirname(saida), "assets");
      const bundle = fs.existsSync(dirAssets)
        ? fs.readdirSync(dirAssets).filter((f) => f.endsWith(".js"))
            .map((f) => fs.readFileSync(path.join(dirAssets, f), "utf8")).join("\n")
        : "";
      if (!bundle.includes(agulha)) falhas.push(`${nome}: nenhum bundle contém ${JSON.stringify(agulha)} — ${prova}`);
    }
    console.log(`    ok — instalou do registro, construiu e o HTML prova ${app.exige.length} coisas`);
  }
} finally {
  if (keep) console.log(`\n(--keep) pasta mantida: ${tmp}`);
  else fs.rmSync(tmp, {recursive: true, force: true});
}

if (falhas.length) {
  console.error(`\npublicado: FALHOU na ${versao}`);
  for (const f of falhas) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`\npublicado: OK — a ${versao} instala do npm e funciona nos dois lados da fronteira`);
