// Toda raiz do React que um teste cria tem de ser desmontada (06/10/2026).
//
// A CI do pedido #45 reprovou com os 2019 testes verdes e UM erro solto: "ReferenceError: window
// is not defined", jogado pelo agendador do React depois que o `ssr-responsivo.test.tsx` terminou.
// O arquivo criava raízes (`createRoot`, `hydrateRoot`) e nunca as desmontava: quando o ambiente
// do navegador simulado é desmontado no fim do arquivo, o React ainda tem trabalho agendado, e a
// tarefa procura o `window` que não existe mais. Depende do tempo da máquina — passou aqui e no
// `main`, e caiu na CI —, e é por isso que não pode ficar à sorte.
//
// Quem mais tinha o problema: o `custo-responsivo.test.tsx`. Este teste lê os arquivos de teste e
// reprova quem cria raiz sem desmontar. Provado contra o defeito: antes do conserto, reprova
// nomeando os dois.
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

const DIR = __dirname;

test("todo arquivo de teste que cria raiz do React a desmonta", () => {
  const semDesmontar = readdirSync(DIR)
    .filter((f) => /\.test\.tsx?$/.test(f) && f !== "raizes-desmontadas.test.tsx")
    .filter((f) => {
      const fonte = readFileSync(join(DIR, f), "utf8");
      return /\b(createRoot|hydrateRoot)\(/.test(fonte) && !/\.unmount\(\)/.test(fonte);
    });
  expect(semDesmontar).toEqual([]);
});
