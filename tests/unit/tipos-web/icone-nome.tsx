// A SONDA DE TIPO do nome de ícone na web — A-04, 24/09/2026. Compilada pelo `tsc` de verdade
// (`icone-nome.test.ts` a chama), porque nenhum `tsconfig` do repositório lê `tests/`.
// Cada `@ts-expect-error` é uma regra do TIPO: o `tsc` reprova se a linha de baixo compilar.
import {Button, EmptyState, Icon, IconButton} from "../../../packages/react/src/index.js";

// O caminho de quem tem sprite próprio: declara o nome uma vez, pela porta da frente do pacote.
declare module "../../../packages/react/src/index.js" {
  interface AureaIconNames { "marca-da-sonda": true }
}

export const bons = (
  <>
    <Icon name="add" />
    <Icon name="chevron--down" />
    <Icon name="marca-da-sonda" spriteUrl="/meu-sprite.svg" />
    <IconButton icon="close" label="Fechar" />
    <Button leadingIcon="add">Novo</Button>
    <EmptyState icon="document--blank" title="Nada aqui" />
  </>
);

export const maus = (
  <>
    {/* @ts-expect-error — um traço só: o nome do Carbon é `chevron--down` */}
    <Icon name="chevron-down" />
    {/* @ts-expect-error — nome que não existe nem foi declarado pelo app */}
    <IconButton icon="adicionar" label="Adicionar" />
    {/* @ts-expect-error — a checagem vale em toda prop que recebe ícone, não só no `Icon` */}
    <Button leadingIcon="plus">Novo</Button>
  </>
);
