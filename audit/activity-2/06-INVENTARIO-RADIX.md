# Inventário do §9 — `radix-ui/primitives`

> Segunda das nove, e escolhida logo depois da `base-ui` de propósito: são a mesma família de
> coisa, então a comparação entre elas responde uma pergunta que a Aurea precisa ter respondida —
> **a aposta na Base UI deixa buracos?**
>
> ```bash
> node audit/activity-2/inventory-radix.mjs   # escreve INVENTORY-RADIX.json
> ```
>
> `radix-ui/primitives @ f7ecd5a` · MIT · medido em 21/08/2026.

## 1. A resposta: a aposta é sólida, e as três "faltas" óbvias não são faltas

Comparando primitive a primitive, fora utilitários internos dos dois lados:

| | |
|---|---|
| Primitives comparáveis na `base-ui` | 37 |
| Primitives comparáveis na `radix` | 32 |
| **Na `base-ui` e não na `radix`** | **13** |
| Na `radix` e não na `base-ui` | 8 |

**A `base-ui` tem 13 que a `radix` não tem:** `autocomplete`, `combobox`, `drawer`, `field`,
`fieldset`, `input`, `meter`, `number-field`, `otp-field`, `preview-card`, `checkbox-group`,
`radio`, `button`. Vários são exatamente o que uma biblioteca de aplicação precisa e a `radix`
deixa para quem consome.

Dos 8 do outro lado, **quatro são o mesmo componente com outro nome**, e a Aurea já usa o
equivalente — conferido nos imports do pacote React:

| `radix` | `base-ui` | A Aurea já importa |
|---|---|---|
| `dropdown-menu` | `menu` | `@base-ui/react/menu` |
| `hover-card` | `preview-card` | `@base-ui/react/preview-card` |
| `one-time-password-field` | `otp-field` | `@base-ui/react/otp-field` |
| `radix-ui` | — | é o meta-pacote, não um primitive |

**Sobram quatro faltas de verdade:** `aspect-ratio`, `label`, `accessible-icon` e
`password-toggle-field`.

- `aspect-ratio` e `label` **já estavam na fila** como `G-CAP-05` e `G-CAP-12`, achados pela
  triagem por nome. Dois métodos independentes apontando o mesmo gap é a melhor confirmação que
  havia disponível.
- `accessible-icon` é um utilitário de três linhas (envolve um glifo com rótulo fora da tela). Na
  Aurea o `IconButton` **exige** `label`, então a garantia existe por contrato de API em vez de
  por componente. `N/A`.
- `password-toggle-field` **é gap novo**, e a §2 conta como ele apareceu.

## 2. O gap que a triagem por nome perdeu — e por quê

A `radix` chama de `password-toggle-field`; o Shark UI chama de `password-input`. São a mesma
capacidade: um campo de senha com o botão de mostrar/ocultar, e o anúncio correto ao leitor de
tela quando o valor fica visível.

Como os dois nomes não casavam, a evidência ficou **dividida em duas linhas de uma referência
cada** — e as duas caíram abaixo do corte de "duas ou mais referências" que eu usei para
verificar candidatos. A capacidade existe em duas das nove e a triagem a mostrou como duas
capacidades de uma.

Foi a comparação por **família de primitives** que a encontrou. É o limite conhecido de casar por
nome, escrito no [`04-TRIAGEM.md`](04-TRIAGEM.md) §4, agora com um caso concreto: **os dois
métodos não são redundantes.** O sinônimo entrou no `crossref.mjs`. → `G-CAP-22`.

Medido: a Aurea não tem nada de senha. Nem componente, nem classe no core, nem exemplo.

## 3. A fidelidade deste inventário é menor, e isso é um achado — §184

A `base-ui` declara os próprios estados em 148 enums **com JSDoc por membro**; um extrator lê tudo
sem inferir nada. A `radix` escreve o estado inline no JSX:

```jsx
data-state={context.open ? 'open' : 'closed'}
```

Sem enum, sem documentação por membro, com o valor saindo de um ternário. Dá para extrair o nome
do atributo e os literais; a **descrição não existe na fonte** e sai `INCONCLUSIVO` em vez de
inventada.

O resultado aparece nos números: **18 atributos de estado distintos** extraídos da `radix`, contra
**68** da `base-ui`. A diferença não é toda de cobertura — é de **declaração**.

Não é crítica à `radix`, que é de 2020, quando declarar estado legível por máquina não era
costume. É informação para a Aurea, que está decidindo agora como declara o dela, e que hoje tem
o `api-surface.json` para API e **nada equivalente para estado** (o `G-STATE-01`).

## 4. O resto do que foi medido

| | |
|---|---|
| Primitives | 59 (32 comparáveis, o resto é utilitário interno) |
| Com anatomia composta | 26 |
| Com par controlado / não-controlado | 20 |
| Com teclado no próprio fonte | 16 |
| Com `asChild` | 19 |

**`asChild` é a diferença de composição entre as duas**, e vale registrar porque a Aurea vai
encarar essa escolha: a `radix` funde a peça no filho (`asChild`); a `base-ui` substitui o
elemento renderizado (`render`). Os dois resolvem "quero que este botão seja um `<a>`", por
caminhos diferentes. A Aurea hoje não expõe nenhum dos dois — quem quer trocar o elemento não
tem como.

## 5. O que este inventário ainda não deu

- `OBSERVACOES` vazio nos 59, pela mesma razão do inventário da `base-ui`: é leitura, não
  extração.
- A comparação foi de **presença de primitive**. Comparar o que cada um FAZ — o `Select` da
  `radix` contra o da `base-ui`, campo a campo — é a matriz do §13 e continua por fazer.
