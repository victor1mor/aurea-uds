# @aurea-uds/react

Os componentes React do **Aurea Universal Design System**.

```bash
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

## Uso

Carregue as fontes **antes** da folha de estilo — o core não embute mais a IBM Plex.

```js
import "@aurea-uds/fonts/css";
import "@aurea-uds/core/css";
import {AureaProvider, Button, ptBR} from "@aurea-uds/react";

export default () => (
  <AureaProvider spriteUrl="/aurea-icons.svg" strings={ptBR}>
    <Button variant="primary">Enviar</Button>
  </AureaProvider>
);
```

`spriteUrl` aponta para o arquivo do `@aurea-uds/icons` — copie-o para onde o seu app serve
arquivos estáticos. É configuração, então mora no provider, e não em cada componente que desenha
um ícone. As frases padrão são em inglês; `strings={ptBR}` as troca pelas em português.

## Importar por categoria

O entry point principal funciona, mas cada categoria é também um entry point próprio, para você levar uma
parte do sistema sem o resto:

```js
import {Button} from "@aurea-uds/react/actions";
```

Seis módulos trazem uma engine opcional e por isso ficam **fora do entry point principal** — importar um
`Button` nunca pode puxar uma dependência que você não instalou:

| Importe | Exige que você instale |
|---|---|
| `@aurea-uds/react/code-editor` | `codemirror` e os pacotes `@codemirror/*` |
| `@aurea-uds/react/data-grid` | `@tanstack/react-table` |
| `@aurea-uds/react/qrcode` | `qr` |
| `@aurea-uds/react/calendar` | `react-day-picker` |
| `@aurea-uds/react/chart` | `recharts` |
| `@aurea-uds/react/graph` | `@xyflow/react` |

## Hooks

Quatro são públicos, e eles são a parte da API que **não tem página no catálogo** — o catálogo
documenta componentes, e hook não é componente. Enquanto isso não mudar, é aqui que eles estão
escritos.

```js
import {AureaProvider, useToast} from "@aurea-uds/react";

function BotaoSalvar() {
  const toast = useToast();                                  // dentro do AureaProvider
  return <Button onClick={() => toast.add({
    title: "Salvo",
    description: "Dois arquivos enviados.",
    type: "success",                                         // info | success | warning | danger
  })}>Salvar</Button>;
}
```

A pilha se desenha sozinha: o `AureaProvider` já monta o viewport dos toasts, então não há
`<Toaster/>` para posicionar nem um segundo provider para instalar.

| Hook | O que entrega |
|---|---|
| `useToast()` | `add({title, description, type})`, mais `close(id)` e a lista viva. A fila é a do Base UI |
| `useAureaTheme()` | lê e muda **os dois** eixos no `<html>`: `theme` (`dark`/`light`) e `density`. `theme` é `null` no servidor — não desenhe o que depende do tema até ele deixar de ser |
| `useAureaStrings()` | o dicionário de frases, somado ao que você passou ao provider |
| `useSpriteUrl()` | de onde o sprite de ícones está sendo carregado |

## Requisitos

React 19 ou mais novo. No React 19 `ref` é prop comum, e os tipos dependem disso.

## Licença

Apache-2.0.
