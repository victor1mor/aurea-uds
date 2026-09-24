# `G-AXIS-06` — o custo do resolvedor de runtime, medido

**22/08/2026** · o Victor pediu as duas coisas ao mesmo tempo: *"não quero medo abstrato de
`ResizeObserver` — meça"* e *"não construa uma megainfraestrutura especulativa sem medição"*. Este
documento é a medição, e ela mudou o código duas vezes.

---

## 1. Bundle — na grandeza que o consumidor paga

A lição do documento anterior (`19-ORIENTACAO-CUSTO.md`) aplicada de novo: bytes crus respondem à
pergunta errada.

```text
packages/react/dist/responsivo-runtime.js + escala.js

    cru      13.314 B
    gzip      5.126 B
    brotli    4.621 B
```

**4,6 KB brotli** é o preço de recuperar cinco capacidades com visual, ARIA, teclado e geometria
sincronizados. E ele só é pago por quem importa um componente comportamental: o módulo é separado
e nada em `pure.tsx` o alcança.

---

## 2. Runtime — o que a página realmente cria

Medido na página de prova, com **20 instâncias** de componente comportamental em **2 contêineres**:

```text
matchMedia criadas                   7   (uma por ponto da escala, para a página inteira)
ouvintes de matchMedia               7   (não 7 por componente — ver §3)
ResizeObserver do resolvedor         1   (singleton de módulo)
elementos observados                 2   (um por CONTÊINER)
callbacks numa travessia             3
```

> **Armadilha de instrumento, registrada.** A primeira medição contou **11** `ResizeObserver` na
> página e eu quase registrei isso como custo do resolvedor. São da **Base UI**, que usa observer
> para posicionar popup. A tentativa de separá-los por pilha de chamada devolveu **zero** para os
> nossos — em bundle minificado não há nome de função na pilha. A separação que funciona é por
> **escala**, e virou teste: crescer o número de componentes não pode crescer o número de
> observadores. É a única propriedade que distingue "compartilhado" de "por instância", e ela é
> verificável sem depender de nome de função.

---

## 3. O que a medição mudou no código

**Ouvintes de `matchMedia` eram lineares no número de componentes.** `useSyncExternalStore` chama
`subscribe` uma vez por instância, e a primeira versão registrava sete ouvintes ali dentro — sete
por componente. Dez componentes davam setenta. Corrigido com um conjunto de interessados por cima
de **um** ouvinte real por ponto: sete para sempre.

**O observer já nascia compartilhado**, e o teste de escala existe para que continue: se alguém
trocar o singleton por um observer local, o custo volta a ser linear em silêncio.

Nenhuma das duas é infraestrutura especulativa — as duas são a forma mais simples que não
multiplica objetos, e as duas têm número atrás.

---

## 4. O que custa ZERO

```text
valor simples   →  nem matchMedia, nem ResizeObserver, nem estado
```

Há teste cobrando isso (`ssr-responsivo.test.tsx`): quem não usa valor responsivo não paga nada
por ele. É a mesma promessa aditiva do `G-AXIS-04`, agora com um custo real do outro lado dela.

---

## 5. Onde o custo cresce, e por quê

| grandeza | cresce com | mínimo possível? |
|---|---|---|
| `ResizeObserver` | nada — é um só | sim |
| elementos observados | número de **contêineres** | sim: não há como saber a largura de dois elementos observando um |
| ouvintes de `matchMedia` | nada — são sete | sim |
| renderizações | uma por componente **por travessia** | sim: o valor mudou, o componente tem de re-renderizar |

---

## 6. O que fica de fora desta medição

- **Não medi CPU nem tempo de frame.** Com um observer e sete ouvintes para a aplicação inteira, o
  custo é dominado pelas re-renderizações do React, que são as mesmas de qualquer mudança de
  estado. Medir isso pediria um cenário com centenas de instâncias comportamentais numa mesma
  travessia, que não é cenário real hoje — e a regra da casa é não construir contra ameaça
  imaginada.
- **Não medi o custo em ambiente sem as APIs.** Lá o resolvedor não assina nada e o valor fica no
  base; o custo é o mesmo do valor simples, que é zero.
