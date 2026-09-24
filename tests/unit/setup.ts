import "@testing-library/jest-dom/vitest";
import {cleanup} from "@testing-library/react";
import {afterEach, beforeEach} from "vitest";

// O jsdom não tem ResizeObserver, e o `@xyflow/react` chama um no efeito de montagem — sem
// isto o DependencyGraph nem monta (`ReferenceError`, medido em 09/08/2026). É o mesmo calço
// que o `build-catalog.mjs` já põe no prerender, pela mesma razão.
//
// A medida devolvida é FIXA e não zero: com 0×0 o motor conclui que não há espaço e não
// posiciona nada — foi assim que o prerender do Chart mediu 153 bytes na Fase do Lote 3.
// Isto não substitui a medição de verdade: o que depende de tamanho real se mede no
// navegador, no `skin.spec` e no `geometry.spec`.
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    constructor(private cb: ResizeObserverCallback) {}
    observe(alvo: Element) {
      this.cb([{contentRect: {width: 640, height: 320}, target: alvo} as ResizeObserverEntry], this);
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// GATE — o Base UI reclama no console e ninguém ouvia (11/08/2026).
//
// O motor valida no DOM MONTADO: `useButton` compara a tag que saiu do `render` com o que o
// componente declara em `nativeButton`, e discordância vira `console.error("Base UI: …")`. A
// validação mora dentro de um `useEffect`, então `renderToStaticMarkup` NÃO a executa — medido.
// Consequência: o defeito atinge quem INSTALA a biblioteca e é invisível para o catálogo, que é
// HTML estático sem hidratação. Por isso o `catalog-sweep`, que cobra console limpo, nunca o viu.
//
// A trava é aqui e não num teste próprio porque o `@testing-library/react` monta no CLIENTE:
// pendurada no setup, cada um dos testes vira detector, e a cobertura sai de graça nos 92
// componentes em vez de num palco escrito à mão. Provada contra o defeito: tirar o `nativeButton`
// do `SegmentedControl` (`inputs.tsx`) reprova.
//
// LIMITE DECLARADO: o `error()` do motor guarda as mensagens já emitidas num `Set` de módulo e
// não repete a mesma duas vezes. O vitest isola por ARQUIVO, então o `Set` nasce limpo a cada
// arquivo — mas dentro de um mesmo arquivo, dois componentes com o MESMO defeito acusam só o
// primeiro. O gate reprova de qualquer jeito; o inventário completo é que sai incompleto.
const gritosDoMotor: string[] = [];
const erroOriginal = console.error;
console.error = (...args: unknown[]) => {
  const mensagem = args.map(String).join(" ");
  if (mensagem.includes("Base UI:")) gritosDoMotor.push(mensagem);
  erroOriginal(...args);
};

beforeEach(() => {
  gritosDoMotor.length = 0;
});

afterEach(() => {
  cleanup();
  if (gritosDoMotor.length > 0) {
    const acusados = gritosDoMotor.join("\n\n");
    gritosDoMotor.length = 0;
    throw new Error(`o Base UI reprovou a montagem no cliente — ${acusados}`);
  }
});

// Os dublês do alvo nativo guardam as props de cada instância para o teste inspecionar
// (ver `native-stubs/react-native.ts`). Sem esta limpeza, uma instância de um teste vaza no
// seguinte — e o segundo passaria lendo o primeiro, que é a pior forma de um teste passar.
import {__limpar} from "./native-stubs/react-native";
import {__definirInsets} from "./native-stubs/react-native-safe-area-context";
beforeEach(() => { __limpar(); __definirInsets({}); });

// `__DEV__` é global do React Native e não existe no vitest. Os componentes do alvo nativo o
// consultam para avisar em desenvolvimento (o `Icon` com nome fora do registro, por exemplo), e
// sem ele o aviso vira `ReferenceError` — o teste falharia por causa do ambiente, não do código.
(globalThis as {__DEV__?: boolean}).__DEV__ = true;
