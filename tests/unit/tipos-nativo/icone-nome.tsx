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
    <Icon name="plus" />
    <Icon name="caret-down" />
    <Icon name="marca-da-sonda" />
    <IconButton name="x" label="Fechar" />
  </>
);

export const maus = (
  <>
    {/* @ts-expect-error — dois traços era o jeito do Carbon; no Phosphor é `caret-down` (ADR-0053) */}
    <Icon name="caret--down" />
    {/* @ts-expect-error — o nome antigo do Carbon reprova: agora é `plus` */}
    <Icon name="add" />
    {/* @ts-expect-error — nome que não existe nem foi declarado pelo app */}
    <IconButton name="adicionar" label="Adicionar" />
  </>
);

// @ts-expect-error — chave do registro com erro de digitação também reprova
export const registroMau = criarRegistroDeIcones({"chevron-down": Marca});

// A forma cheia entra no registro com o sufixo `-fill`, como o arquivo (ADR-0053)…
export const registroCheio = criarRegistroDeIcones({house: Marca, "house-fill": Marca});
// @ts-expect-error — …e só nome do Phosphor tem forma cheia: o nome próprio do app não tem
export const registroCheioMau = criarRegistroDeIcones({"marca-da-sonda-fill": Marca});
