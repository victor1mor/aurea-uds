# ADR-0035 — Sidebar responsivo sem inventar recursos

- **Data:** 20/08/2026
- **Estado:** aceita · aplicada
- **Autoria:** decisão explícita do Victor: `PODE IMPLEMENTAR SIDEBAR RESPONSIVO`
- **Emenda:** somente a geometria da [ADR-0003](0003-gaveta-de-navegacao-sem-javascript.md)
- **Preserva:** [ADR-0034](0034-ter-a-variante-nao-e-usar-a-variante.md) — `floating` continua padrão e `flush` continua opt-in

## Contexto medido

As capturas do catálogo aberto por `file://` mostravam quatro defeitos diferentes:

1. o painel flutuante perdia 32px para as próprias margens: 264px viravam 232px e o trilho de
   68px virava 36px;
2. a regra móvel global atingia a `Sidebar` standalone dentro do iframe, mudava sua altura para
   `auto` e deixava só 126px de painel numa moldura de 720px;
3. em 900px e 1023px o `AppShell` ainda mantinha a coluna fixa, embora a referência fornecida
   passe a lateral para gaveta no breakpoint `lg`;
4. o Tooltip tinha duas travas: o ID do filho divergia do ID registrado pelo Base UI e o catálogo
   aberto direto do disco não hidratava, porque Chromium bloqueia `type="module"` em `file://`.

As demos ainda tinham botões sem ação. A primeira tentativa de correção trocou-os por fragmentos
inexistentes (`#inbox`, `#threads`, `#archive`); o controle aceitou e foi corrigido antes desta ADR.

## Alternativas rejeitadas

**Manter 767px.** Rejeitada: preserva justamente a faixa em que as capturas quebram e diverge do
corte `lg` da referência.

**Diminuir margem, ícone ou padding para caber na trilha de 68px.** Rejeitada: trata o sintoma e
faz o painel consumir o tamanho que o token promete. A trilha é que deve reservar painel + margem.

**Criar prop, componente de drawer ou dependência.** Rejeitada: o `AppShell` já possui o popover
nativo, o controle de foco e todas as variantes necessárias.

**Exigir servidor para abrir o catálogo.** Rejeitada: contradiz o README e o fluxo real usado pelo
Victor. O runtime precisa funcionar no arquivo entregue.

**Usar links fictícios para parecer navegação.** Rejeitada: demonstração não pode anunciar um
recurso que o projeto não possui.

## Decisão

- A `Sidebar` continua `floating` por padrão. `flush` continua sendo exceção explícita.
- O tamanho do painel é o token: 264px aberto e 68px recolhido. No `AppShell`, a trilha floating
  soma as duas margens de 16px; a trilha flush usa o token cru.
- Abaixo de `lg` — até 1023px — a lateral do `AppShell` vira a gaveta nativa já existente. Em
  1024px ela volta a ser coluna sticky. A gaveta tem no máximo 296px e nunca ultrapassa
  `100vw − 2rem`.
- A regra responsiva pertence a `.app-shell > .sidebar[popover]`; uma `Sidebar` standalone não é
  transformada em bloco curto pelo viewport do iframe.
- O Tooltip repassa ao primitive o ID que já existe no trigger, sem prop pública nova.
- O catálogo hidrata por um IIFE clássico eager em `assets/live.js`, autocontido e limitado pelo
  build a 520kB. Os 45 chunks antigos, agora sem consumidor, são removidos.
- Todas as demos apontam para páginas que existem no próprio catálogo. Não entram controles,
  destinos ou componentes novos.

## Como isso é obrigado

- `tests/visual/sidebar-responsive.spec.ts`: 1023/900 viram gaveta; standalone mantém altura;
  quatro combinações preservam os tokens; Tooltip funciona por HTTP e `file://`; todos os links
  respondem como recursos reais.
- `tests/visual/shell-nav.spec.ts`: 1024px fixa a fronteira desktop e os três motores continuam
  cobrindo abertura, foco e Escape.
- `tests/unit/overlays.test.tsx`: filho com ID explícito mantém o Tooltip aberto por foco.
- `tests/visual/skin.spec.ts`: mede o filho direto real do shell, não uma fixture aninhada mais fácil.

## Consequências

Entre 768px e 1023px a lateral agora ocupa uma gaveta em vez de comprimir conteúdo; essa é a
mudança deliberada que emenda a ADR-0003. O catálogo aberto direto do disco passa a carregar um
arquivo de aproximadamente 512kB em vez de módulos repartidos. Esse custo é explícito e tem teto:
se ultrapassar 520kB, a saída é gerar IIFEs clássicos por componente, não aumentar o limite.

Nenhuma API pública foi criada e nenhuma página da Aurea passou a usar `flush`.
