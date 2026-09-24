# @aurea-uds/icons

O sprite de ícones de onde a **Aurea UDS** desenha. Os glifos são os
[Carbon Icons](https://carbondesignsystem.com/elements/icons/library/) da IBM; este pacote só os
junta num único sprite SVG.

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
<svg class="icon" aria-hidden="true"><use href="/aurea-icons.svg#i-search"></use></svg>
```

O id do símbolo é `i-` seguido do nome do Carbon exatamente como o Carbon escreve, com os dois
traços: `chevron--down` vira `#i-chevron--down`.

## Licença

Apache-2.0 para este pacote. Os glifos são Carbon Icons, também Apache-2.0 — a atribuição que a
licença da IBM exige vai no [`NOTICE`](./NOTICE), que faz parte dos arquivos publicados.
