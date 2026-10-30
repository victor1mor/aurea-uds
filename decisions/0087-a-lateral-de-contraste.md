# ADR-0087 — A lateral de contraste: escura nas duas telas

- **Data:** 29/10/2026
- **Estado:** aceita · na branch `claude/mnt-36`, para a `0.50.0` — só na web.
- **Origem:** o MNT-36, de um app da web: a lateral escura no tema claro e, no escuro, mais escura ainda que a página. O
  Victor viu as 13 marcas nos dois temas, na bancada com a lateral de verdade, em três colunas — hoje, a "A" (escura
  neutra) e a "B" (escura na cor da marca) — e escolheu: *"A, escura neutra"* (29/10/2026). No mesmo dia, sobre a Ember:
  *"Ember deve sempre ter a cor original onde foi criado"* — a paleta dela é a única fechada a mudança de cor.

## O que se mediu

- **A referência principal não tem lateral.** A segunda da fila tem, e pinta a lateral pelos tokens `--sidebar*`: não tem
  propriedade de cor, e o `variant` dela é só o arranjo (solta, flutuante, embutida). Na Aurea o `variant` da `Sidebar`
  também é o arranjo (`floating`, `flush`, `plain`) — a cor entra como propriedade à parte, que não briga com ele.
- **A Aurea já tinha o jeito:** o `Card variant="contrast"` (ADR-0063) traz o tema escuro no próprio elemento, e o "está
  num pedaço escuro?" sai do ANCESTRAL, com a guarda do GAR-05. A lateral faz igual.
- **As cores da Ember foram medidas no app onde ela nasceu** (29/10/2026), nos dois temas: o fundo, o fundo do item ao
  passar o mouse, a letra e o texto de apoio. A conta da "A" não chega nelas (o cartão do escuro da Ember é mais claro que
  o medido), então a Ember não faz a conta: tem as cores dela.
- **Na bancada com a peça do pacote**, as 26 combinações (13 marcas × 2 temas) saíram com as MESMAS cores da proposta
  aprovada — o fundo, o item, o item atual e o texto de apoio. A de canto reto saiu com as mesmas cores, canto 0 e
  encostada na borda. Toda letra de dentro passa de 4,5:1; o pior caso é o texto
  de apoio da Ember no escuro, 5,09:1.

## A regra

1. **`Sidebar contrast`** (e `AppShell sidebarContrast`, que repassa à lateral de navegação): a classe `sidebar-contrast`
   e `data-theme="dark"` no próprio `<aside>`. A letra, os ícones, o item atual e tudo de dentro saem do tema escuro DA
   MARCA. Sem a propriedade, nada muda. Vale em todo arranjo: a flutuante, a de CANTO RETO (`variant="flush"`, encostada na
   borda, do alto até embaixo — o arranjo do app que pediu, que o Victor cobrou na bancada: *"não fez o de canto reto
   conforme o sistema que mostrei"*), a trilha e o painel. A sem caixa (`plain`) não pinta fundo; escura, a letra clara
   ficaria sobre a página clara — com `contrast`, ela pinta o fundo da lateral (a flutuante sem a sombra).
2. **Só o fundo segue a página.** Numa página clara, o fundo é o cartão do escuro (`--card` do escuro) e o fundo do item é o
   secundário do escuro. Numa página escura, o fundo é a página do escuro misturada com preto
   (`color-mix(in oklch, var(--background) 55%, black)`), mais escura que a página, e o fundo do item é o cartão do escuro.
3. **A página que conta é a do ANCESTRAL**, com a guarda do GAR-05: uma faixa escura numa página clara conta como escura, e
   uma faixa clara numa página escura, como clara. O atributo da própria lateral não conta.
4. **A Ember tem as cores medidas**, nos tokens `sidebar-contrast`, `sidebar-contrast-accent`, `sidebar-contrast-foreground`
   e `sidebar-contrast-muted`, um valor para cada tema. **Só a Ember os define**; nas outras marcas o token não existe e
   vale a conta. Como a lateral traz o tema escuro por dentro, o token dela seria sempre o do escuro: o core traz o valor da
   PÁGINA com `inherit`.
5. **Sem linha** (ADR-0072): nenhuma borda nova. A lateral se separa da página clara pelo fundo (16:1 na Aurea) e da
   escura por ser mais escura que ela.

## Quem cobra

- `tests/unit/sidebar-contraste.test.tsx` — a classe e o tema na lateral (com e sem painel), o `AppShell` repassando, as
  três regras do CSS e os oito tokens da Ember, só nela.
- `tests/visual/sidebar-contraste.spec.ts` — no navegador, nos três motores: as 13 marcas nos dois temas (o cartão do
  escuro na página clara, mais escura que a página na escura, as cores exatas da Ember e 4,5:1 em toda letra de dentro), a
  de canto reto e a sem caixa com as mesmas cores da flutuante, e a faixa de tema oposto.
