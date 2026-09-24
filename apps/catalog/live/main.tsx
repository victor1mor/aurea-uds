// O RUNTIME DO CATÁLOGO — 18/08/2026.
//
// Até aqui toda prévia era HTML morto: `renderToStaticMarkup` no gerador, zero `createRoot` no
// navegador. Medido antes de escrever uma linha: `grep -cE "createRoot|hydrateRoot|ReactDOM"` em
// `apps/catalog/assets/catalog.js` devolvia **0**. Nada clicava, nada abria, e o Victor via isso —
// o `Tooltip` do trilho existe no código, passa no teste, e não aparecia na prévia porque não
// havia JavaScript para abri-lo.
//
// ENXERTO PROGRESSIVO, e a escolha é deliberada: o gerador continua emitindo a marcação completa,
// e este arquivo HIDRATA por cima. Duas razões medidas:
//   • as travas do repositório leem o HTML — o `catalog-sweep` cobra `h1`, hierarquia e axe em
//     TODA página, e o gate de pixel fotografa. Se a prévia passasse a nascer vazia esperando JS,
//     o axe fotografaria uma casca e as capturas viriam em branco;
//   • prévia que só existe com JavaScript quebra para quem chega com a rede ruim. O estático é o
//     piso; o script é o acréscimo.
//
// `hydrateRoot` exige que o servidor tenha usado `renderToString`, e NÃO `renderToStaticMarkup` —
// o segundo não emite os marcadores de hidratação e o React 19 reclama de divergência. O gerador
// foi trocado junto, no `embedPreview`.
import {hydrateRoot} from "react-dom/client";
import {createElement as h} from "react";
import {AureaProvider} from "../../../packages/react/dist/index.js";

const raiz = document.getElementById("root");
const componente = raiz?.dataset.componente;
const indice = Number(raiz?.dataset.indice ?? 0);

if (raiz && componente) {
  // `import.meta.glob` com padrão NEGATIVO, e não um literal de template solto: o glob aberto
  // casava também os arquivos `_` do gerador, e o `_starters.mjs` acrescentava **1,15 MB** que
  // nenhuma prévia pede — peso morto commitado no repositório. Medido no primeiro build.
  // `import: "default"` traz só os objetos de conteúdo. O IIFE precisa deles eager no mesmo
  // arquivo porque `file://` bloqueia módulos repartidos por CORS; em runtime só o exemplo pedido
  // pela moldura é renderizado e hidratado.
  const modulos = import.meta.glob<{examples?: {render?: () => unknown}[]}>(
    ["../content/*.mjs", "!../content/_*.mjs"],
    {import: "default", eager: true},
  );
  const conteudo = modulos[`../content/${componente}.mjs`];
  if (!conteudo) {
    console.error(`Aurea: não há conteúdo de catálogo para ${componente}`);
  } else {
    try {
      const exemplo = conteudo.examples?.[indice];
      if (exemplo?.render) {
        hydrateRoot(raiz, h(AureaProvider, {spriteUrl: ""}, exemplo.render() as never));
      }
    } catch (erro) {
      // Falha de hidratação NÃO pode apagar a prévia: o HTML estático já está na tela e continua
      // valendo. O aviso existe para quem estiver depurando, e nada mais acontece.
      console.error(`Aurea: a prévia de ${componente}[${indice}] não hidratou —`, erro);
    }
  }
}
