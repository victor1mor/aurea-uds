# @aurea-uds/core

A folha de estilo da **Aurea UDS**, mais o pouco de comportamento em JavaScript puro que não
precisa de React.

```bash
pnpm add @aurea-uds/core @aurea-uds/fonts
```

```js
import "@aurea-uds/fonts/css";  // antes do core: ele não embute mais a IBM Plex
import "@aurea-uds/core/css";
import "@aurea-uds/core/js";    // opcional — abas, abrir e fechar e afins, sem React
```

O JavaScript não faz nada sem DOM, então é seguro importá-lo durante a renderização no servidor.

## O que tem aqui

Toda regra de que o sistema precisa, e nada além. Enfeite de documentação e maquete de produto já
moraram aqui; saíram, e uma verificação os mantém fora — uma classe desta folha tem de ser uma que
algum componente de fato produz.

Os valores vêm do `@aurea-uds/tokens`. Um pixel cru de espaço, raio, tamanho de letra, peso ou
altura de linha reprova numa verificação automática, e não numa revisão.

## Tema e densidade

```html
<html data-theme="dark" data-density="comfortable">
```

`data-theme` é `dark` ou `light`; `data-density` é `compact`, `comfortable` ou `spacious`. Os dois
são lidos do elemento raiz, e um controle de um dado tamanho mede o mesmo em toda combinação.

## Licença

Apache-2.0.
