// A SONDA DE TIPO da R-11 (02/10/2026): o ícone é o NOME de um glifo ou o próprio DESENHO, como no
// HeroUI (lá nenhuma peça recebe nome de ícone; o app põe o componente dele). Compilada pelo `tsc`
// de verdade (o `icone-nome.test.tsx` compila a pasta inteira). Sem `declare module` aqui: é o
// caminho que a trava do app permite.
//
// Provado contra o defeito: com `IconProps.name` de volta em `IconName`, as linhas de `bons`
// reprovam com "Type '…' is not assignable to type 'IconName'".
import {
  Alert, BottomNav, EmptyState, Icon, IconButton, NumberField, RadioGroup, criarGlifo,
} from "../../../packages/native/src/index.js";
import Plus from "../../../packages/native/icons/plus.js";

const Logo = criarGlifo({viewBox: "0 0 64 64", circles: [{cx: 32, cy: 32, r: 30}]});

export const bons = (
  <>
    <Icon name={Logo} size="xl" />
    <Icon name={Plus} />
    <Icon name="plus" />
    <IconButton name={Logo} label="Início" />
    <BottomNav current="a" items={[{id: "a", label: "Início", icon: Logo}, {id: "b", label: "Busca", icon: "magnifying-glass"}]} />
    <EmptyState title="Nada aqui" icon={Logo} />
    <Alert title="Pronto" icon={Logo} />
    <NumberField icons={{increment: Logo, decrement: "minus"}} />
    <RadioGroup value="a"><RadioGroup.Item value="a" label="Loja" icon={Logo} /></RadioGroup>
  </>
);

export const maus = (
  <>
    {/* @ts-expect-error — nome que não existe continua reprovando */}
    <Icon name="logo-do-app" />
    {/* @ts-expect-error — texto solto não é desenho */}
    <BottomNav current="a" items={[{id: "a", label: "Início", icon: "inicio-do-app"}]} />
    {/* @ts-expect-error — um elemento JSX não é o componente: passa-se `Logo`, não `<Logo />` */}
    <Icon name={<Logo />} />
  </>
);
