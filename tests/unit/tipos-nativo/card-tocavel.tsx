// A SONDA DE TIPO DO `Card` tocável — R-04, 24/09/2026. Não é teste do vitest: é compilada pelo
// `tsc` (`native-consumidores-lote4.test.tsx` a chama). Cada `@ts-expect-error` é uma regra que mora
// no TIPO, e o `tsc` REPROVA se a linha de baixo compilar — é o que prova que a regra existe.
// Nenhum `tsconfig` do repositório lê `tests/`, então sem esta sonda um `@ts-expect-error` num
// teste é enfeite: passaria com a regra quebrada.
import {Button, Card} from "../../../packages/native/src/index.js";

export const bons = (
  <>
    <Card />
    <Card variant="interactive" />
    <Card onPress={() => {}} accessibilityLabel="Relatório de março" />
    <Card variant="selected" onPress={() => {}} accessibilityLabel="x" disabled />
    <Card variant="brand" action={<Button>Ok</Button>} />
  </>
);

export const maus = (
  <>
    {/* @ts-expect-error — com `onPress`, sem nome para o leitor de tela não compila */}
    <Card onPress={() => {}} />
    {/* @ts-expect-error — o `brand` exige `action`, que é botão DENTRO do cartão: botão dentro de botão */}
    <Card variant="brand" action={<Button>Ok</Button>} onPress={() => {}} accessibilityLabel="x" />
    {/* @ts-expect-error — `disabled` só existe no cartão tocável */}
    <Card disabled />
  </>
);
