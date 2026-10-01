# @aurea-uds/icons

O sprite de ícones de onde a **Aurea UDS** desenha. Os glifos são os
[Phosphor Icons](https://phosphoricons.com), nos pesos **Regular** e **Fill**; este pacote só os
junta num único sprite SVG. Até a `0.12.4` eram os Carbon Icons da IBM (ADR-0053).

```bash
pnpm add @aurea-uds/icons
```

Copie `dist/aurea-icons.svg` para onde o seu app serve arquivos estáticos e diga ao provider onde
ele está:

```jsx
<AureaProvider spriteUrl="/aurea-icons.svg">
```

Marcação fora do React aponta direto para o símbolo:

```html
<svg class="icon" aria-hidden="true"><use href="/aurea-icons.svg#i-magnifying-glass"></use></svg>
```

O id do símbolo é `i-` seguido do nome do Phosphor exatamente como o Phosphor escreve:
`caret-down` vira `#i-caret-down`. A forma cheia tem o sufixo `-fill`: `#i-caret-down-fill`. No
React, é `<Icon name="caret-down" weight="fill" />`; a Aurea usa a cheia no item escolhido (aba
ativa, item atual do menu) e nos avisos.

Os logotipos de marca do Phosphor (`apple-logo` e os outros 78 com `-logo` no nome) **não
entram**: marca registrada de terceiro não cabe numa biblioteca Apache-2.0.

## Vindo do Carbon

Os nomes mudaram todos. A tabela `carbon-para-phosphor.json` traz os 260 nomes do Carbon que a
Aurea e os apps conhecidos usavam, com o nome do Phosphor que os substitui:

```js
import tabela from "@aurea-uds/icons/carbon-para-phosphor.json" with {type: "json"};
tabela["chevron--down"]; // "caret-down"
```

Os ícones `*--filled` do Carbon viram o mesmo nome em `weight="fill"`.

## Licença

Apache-2.0 para este pacote. Os glifos são Phosphor Icons, sob a licença MIT — o aviso de
copyright e de permissão que ela exige vai no [`NOTICE`](./NOTICE), que faz parte dos arquivos
publicados.
