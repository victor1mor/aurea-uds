// A SONDA DE TIPO do nome de ícone no nativo — A-04, 24/09/2026. Compilada pelo `tsc` de
// verdade (`icone-nome.test.ts` a chama), porque nenhum `tsconfig` do repositório lê `tests/`.
// Cada `@ts-expect-error` é uma regra do TIPO: o `tsc` reprova se a linha de baixo compilar.
import {Icon, IconButton, criarGlifo, criarRegistroDeIcones} from "../../../packages/native/src/index.js";

// O caminho de quem tem glifo próprio: declara o nome uma vez, pela porta da frente do pacote.
declare module "../../../packages/native/src/index.js" {
  interface AureaIconNames { "marca-da-sonda": true }
}

const Marca = criarGlifo({paths: ["M0 0h32v32H0z"]});

export const registro = criarRegistroDeIcones({"marca-da-sonda": Marca});

export const bons = (
  <>
    <Icon name="add" />
    <Icon name="chevron--down" />
    <Icon name="marca-da-sonda" />
    <IconButton name="close" label="Fechar" />
  </>
);

export const maus = (
  <>
    {/* @ts-expect-error — um traço só: o nome do Carbon é `chevron--down` */}
    <Icon name="chevron-down" />
    {/* @ts-expect-error — nome que não existe nem foi declarado pelo app */}
    <IconButton name="adicionar" label="Adicionar" />
  </>
);

// @ts-expect-error — chave do registro com erro de digitação também reprova
export const registroMau = criarRegistroDeIcones({"chevron-down": Marca});
