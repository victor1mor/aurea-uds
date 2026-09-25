# Aurea

**Aurea Universal Design System** — um design system com duas saídas: a **web** (React e CSS) e o
**mobile** (React Native). A aparência é uma só, e ela não muda de um lado para o outro.

## A identidade

- superfícies flutuantes e independentes;
- cartões, janelas e painéis com raio de 22 px;
- botões de texto, campos, filtros e abas em cápsula;
- o amarelo principal é o mesmo nos temas claro e escuro;
- IBM Plex Sans, Serif e Mono;
- ícones do Carbon;
- três densidades: compacta, confortável e espaçosa;
- nenhum gradiente. Todo valor de cor, raio, letra e espaço sai de um token.

## Instalar

Os pacotes estão no npm público desde 31/07/2026, sob o escopo `@aurea-uds`. **A versão não é
escrita aqui de propósito**: ela mora no [CHANGELOG](CHANGELOG.md) e em cada `package.json`, e o
validador reprova se ela voltar a aparecer neste arquivo. O que um número `0.x` promete está na
[ADR-0014](decisions/0014-primeira-versao-publica-0-1-0.md).

**Para a web:**

```bash
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

Sem React? `@aurea-uds/core` e `@aurea-uds/fonts` bastam: o core traz a folha de estilo e um pouco
de comportamento em JavaScript puro.

O conjunto de ícones de `@aurea-uds/icons` é um arquivo estático: copie `dist/aurea-icons.svg` para
onde o seu app serve arquivos e aponte o `AureaProvider` para ele.

**Para mobile (React Native):** é outro pacote, `@aurea-uds/native`, publicado desde
11/09/2026. A lista de componentes dele **não é a da web com itens a menos**: é outra, com
instalação e dependências próprias. Comece pelo
[`packages/native/README.md`](packages/native/README.md) e não instale os pacotes da web.

## Usar em HTML

Carregue as fontes **antes** do core. HTML puro não entende nome de pacote (`@aurea-uds/...`):
aponte para o arquivo instalado (ajuste o caminho) ou sirva o `dist` por um bundler.

```html
<html data-theme="dark" data-density="comfortable">
  <link rel="stylesheet" href="node_modules/@aurea-uds/fonts/dist/fonts.css">
  <link rel="stylesheet" href="node_modules/@aurea-uds/core/dist/aurea.css">
  <button class="btn btn-primary" type="button">Salvar</button>
</html>
```

Com bundler, prefira os entry points: `import "@aurea-uds/fonts/css"` e `"@aurea-uds/core/css"`.

## Usar em React

Exige React 19 ou mais novo: os componentes recebem `ref` como prop comum, que é comportamento do
React 19.

Envolva a aplicação no `AureaProvider`. Ele entrega as frases padrão, diz aos componentes onde está o
sprite de ícones e monta o que os tooltips e os toasts usam.

```tsx
import { AureaProvider, ptBR } from "@aurea-uds/react";
import "@aurea-uds/fonts/css"; // antes do core
import "@aurea-uds/core/css";

export default function App() {
  return <AureaProvider strings={ptBR}><Tela /></AureaProvider>;
}
```

**As frases padrão são em inglês.** Para português, passe `strings={ptBR}`, como acima, ou troque
frases soltas: `<AureaProvider strings={{ close: "Fechar" }}>`.

### Server Components

O entry point principal é um módulo de **servidor**, então importar dele num Server Component
funciona. Os módulos interativos carregam `"use client"` sozinhos, e três ficam no servidor: o
entry point principal, o `Accordion` (só marcação) e as funções de apoio — `cx`, `defaultStrings`,
`ptBR`, `defaultSpriteUrl` —, que por isso podem ser *chamadas* no servidor.

Duas aplicações de prova são construídas a cada verificação — uma num framework com componentes de
servidor, outra num bundler só de cliente —, e o build reprova se uma diretiva faltar ou
aparecer onde não precisa.

### Seis módulos com engine opcional, cada um no seu entry point

`@aurea-uds/react` tem **uma** dependência obrigatória: `@base-ui/react`. Seis módulos precisam de uma
engine mais pesada, e cada uma é declarada como **optional peer dependency**, para o resto da biblioteca
não custar nada:

| Componente | Importe de | Instale junto |
|---|---|---|
| `CodeEditor` | `@aurea-uds/react/code-editor` | `codemirror`, `@codemirror/*`, `@lezer/highlight` |
| `DataGrid` | `@aurea-uds/react/data-grid` | `@tanstack/react-table` |
| `QRCode` | `@aurea-uds/react/qrcode` | `qr` |
| `Calendar` | `@aurea-uds/react/calendar` | `react-day-picker` |
| `Chart`, `ChartLegend`, `ChartTooltip` | `@aurea-uds/react/chart` | `recharts` |
| `DependencyGraph` | `@aurea-uds/react/graph` | `@xyflow/react` |

Eles **não** saem pelo entry point principal: se saíssem, importar um `Button` carregaria uma
dependência que você não instalou, e a importação quebraria.

Todo o resto está no entry point principal e também por categoria (`@aurea-uds/react/actions`,
`/inputs`, `/navigation`, `/overlays`, `/disclosure`, `/feedback`, `/data-display`, `/identity`,
`/media`, `/code`, `/communication`, `/layout`, `/system`, `/agents`) — a mesma divisão do registry.
O pacote é ESM com `sideEffects: false`, então o bundler descarta o que você não importa de
qualquer jeito; os entry points por categoria servem para ler e para adotar por partes.

### Ícones: aponte o provider para o seu sprite

O `Icon` desenha um glifo como `<use href="{spriteUrl}#i-{nome}">`. O padrão é `/aurea-icons.svg`,
que só funciona quando o app é servido na raiz do domínio. **Se não for o seu caso, configure uma
vez no provider**, ou todo ícone de todo componente falha em silêncio:

```tsx
<AureaProvider spriteUrl="/assets/aurea-icons.svg">
```

Copie `node_modules/@aurea-uds/icons/dist/aurea-icons.svg` para esse caminho, ou empacote e passe a
URL resultante. Numa página que embute os ícones como `<symbol>`, passe `spriteUrl=""` para a
referência ficar local — é o que o catálogo faz.

**O nome do ícone é checado pelo TypeScript**: `<Icon name="chevron-down">` (um traço só; o do
Carbon é `chevron--down`) não compila, nem em `leadingIcon`, `icon` ou qualquer prop que recebe
ícone. Quem usa um sprite próprio declara os nomes dele **uma vez**:

```tsx
declare module "@aurea-uds/react" {
  interface AureaIconNames { marca: true }
}
```

### Overlays acessíveis

Prender o foco, fechar com Esc, devolver o foco e travar a rolagem vêm do
[Base UI](https://base-ui.com): `Dialog`, `Drawer`, `Tooltip`, `Popover`, `DropdownMenu`,
`ContextMenu`, `Combobox`, `Tabs` e `useToast()`.

### Tema e densidade

`useAureaTheme()` lê e escreve os dois eixos que a Aurea põe no `<html>`: `data-theme` e
`data-density`. Ele lê o DOM em vez de guardar estado próprio, então segue quem de fato muda o
atributo. `theme` é `null` enquanto não se sabe — no servidor não dá para saber, e fingir o
contrário causa hydration mismatch.

**Ele não guarda nada, de propósito.** Lembrar a preferência é trabalho da aplicação. Para guardar,
seguir o sistema e evitar o piscar na carga, o [`next-themes`](https://github.com/pacocoursey/next-themes)
já faz tudo e escreve `data-theme` no `<html>` — o mesmo atributo que a Aurea lê. O que nenhuma
biblioteca de tema cobre é a **densidade**, que é eixo da Aurea; é para isso que o hook existe.

### RTL

O CSS usa propriedades lógicas no eixo da linha e se espelha sozinho. São dois passos:

```tsx
<html dir="rtl">                        {/* espelha o CSS */}
<AureaProvider direction="rtl">         {/* avisa o Base UI */}
```

O provider não mexe no DOM: pôr `dir` no `<html>` é da aplicação. Não se espelham, de propósito: o
visto do `Checkbox`, o spinner (glifos desenhados com borda) e o
`Drawer side="left"|"right"` (o nome promete um lado físico).

## Ver o catálogo

Construa e abra qualquer página direto do disco — as páginas não precisam de servidor:

```bash
pnpm build
```

Abra `apps/catalog/index.html`. Para servir (porta 8123):

```bash
python -m http.server 8123
```

O parágrafo abaixo é gerado a partir do repositório por `python scripts/validate.py --write-state`
e conferido — editado à mão, a validação reprova. Os números completos estão no
[STATE.md](STATE.md).

<!-- state:begin -->
378 páginas geradas — 130 de componente, 204 de padrão, 15 de bloco, 23 de receita e 6 índices de área — a partir de 121 fichas. Toda página traz o mesmo miolo: breadcrumb, preview, o código que a produz, instalação, procedência e anterior/próximo. 27 componentes têm conteúdo escrito à mão; os outros 103 trazem um starter — o preview real e o código, ainda sem exemplos extras. 121 componentes publicam a tabela de props.
<!-- state:end -->

## Como o repositório se organiza

- `apps/catalog`: o catálogo, **gerado** a partir do registry por `scripts/build-catalog.mjs`;
- `packages/tokens`: os tokens no formato DTCG 2025.10 e o CSS gerado;
- `packages/fonts`: as fontes IBM Plex (WOFF2) e o `fonts.css`;
- `packages/contracts`: o contrato do projeto e o registry (uma ficha por componente);
- `packages/core`: o CSS gerado (tokens e componentes) e o comportamento em JavaScript puro;
- `packages/icons`: o sprite de ícones do Carbon;
- `packages/react`: os componentes React, tipados;
- `packages/native`: os componentes React Native;
- [`decisions/`](decisions/README.md): as decisões registradas (ADRs);
- [`docs/`](docs/): como se constrói, onde mexer, quando algo está pronto e o caminho até a `1.0`.

## Contribuir

Leia o [CONTRIBUTING.md](CONTRIBUTING.md). Para relatar uma falha de segurança, siga o
[SECURITY.md](SECURITY.md) — não abra uma issue pública.

## Licença

Apache 2.0 — veja o [LICENSE](LICENSE) e o [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) (IBM Plex
sob OFL 1.1, Carbon Icons sob Apache 2.0).
