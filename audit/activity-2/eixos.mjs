// A LEITURA DE EIXO — os dois lados, um módulo só.
//
// Era código solto dentro de `matrix.mjs`, e o que o tirou de lá foi um DEFEITO que ninguém
// enxergava ali: um `else` pendurado.
//
//     if (dic) for (const [p, v] of Object.entries(dic)) if (…) bruto[p] = v;
//     else { … lê os campos PLANOS … }
//
// O `else` pendura no `if` INTERNO do `for`, não no `if (dic)`. Efeito: quando `dic` é nulo, o
// `if (dic)` guarda o `for` inteiro — que contém o `else` — e **nada roda**. Os campos planos
// nunca eram lidos.
//
// Medido em 27/08/2026, ao ler as células `SO_AUREA`: a `untitled-ui` declara
// `TAMANHOS: ["lg","md","sm"]` no `select`, e a matriz dizia que só a Aurea tinha escala de
// tamanho ali. **17 itens das quatro fontes ricas perdiam 19 eixos**, e o erro era para MENOS —
// a direção que faz a Aurea parecer melhor do que foi medida. Oito células mudaram ao corrigir:
// quatro `SO_AUREA` que não eram, e quatro inferioridades que não apareciam (`tabs`,
// `pagination`, `table` e `empty-state`, todas em `tamanho`).
//
// O que achou o defeito foi uma célula IMPLAUSÍVEL — sete referências, e nenhuma com escala de
// tamanho no `select`? É a mesma pergunta que achou as outras armadilhas desta auditoria.
//
// CONTROLE: `tests/unit/eixos.test.tsx`, fixture com entrada conhecida → resultado conhecido,
// incluindo a forma exata que o `else` pendurado engolia. §1b do protocolo.

export const CHAVE = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
  .replace(/[\s_]+/g, "-").replace(/^-|-$/g, "");

// ── o mapa de apelidos de EIXO ────────────────────────────────────────────────
// Conferido à mão, prop a prop, olhando o que cada uma controla nos dois lados. É a peça em que
// a matriz se apoia inteira, e por isso é curta: casar eixo demais inventa paridade, que é o
// erro que o §15 descreve. Cada linha é uma afirmação de que as duas props controlam a mesma
// dimensão do desenho.
const EIXO_CANON = {
  // aparência: preenchido / contorno / fantasma / link
  variant: "aparencia", appearance: "aparencia", kind: "aparencia", type: "aparencia",
  // tom semântico: marca, perigo, sucesso…
  color: "tom", tone: "tom", colorScheme: "tom", severity: "tom", status: "tom", intent: "tom",
  // escala
  size: "tamanho", scale: "tamanho", density: "densidade",
  orientation: "orientacao", direction: "orientacao",
  radius: "raio", shape: "raio",
  position: "posicao", side: "posicao", placement: "posicao", anchor: "posicao", align: "posicao",
};
export const eixoCanon = (p) => EIXO_CANON[p] ?? EIXO_CANON[CHAVE(p)] ?? null;

/** Os eixos de um item, já em `{tipoDeEixo: [valores]}`. Onde a fonte declara os eixos como
 *  dicionário por prop (mui, shadcn) isso é direto; onde só há listas soltas, `VARIANTES` é o
 *  eixo de aparência e `TAMANHOS` o de tamanho, que é o que essas fontes querem dizer. */
export function eixosDe(it, esquema) {
  const bruto = {};
  const dic = esquema === "rico"
    ? (it.VARIANTES && !Array.isArray(it.VARIANTES) && typeof it.VARIANTES === "object" ? it.VARIANTES : null)
    : (it.eixos && typeof it.eixos === "object" ? it.eixos : null);
  // AS CHAVES AQUI NÃO SÃO ESTILO. Sem elas o `else` pendura no `if` INTERNO do `for`, e não no
  // `if (dic)` — e o efeito é o pior possível: quando `dic` é nulo, o `if (dic)` guarda o `for`
  // inteiro (que contém o `else`), então NADA roda e os campos planos nunca são lidos.
  //
  // Medido em 27/08/2026, lendo as células `SO_AUREA`: a `untitled-ui` declara
  // `TAMANHOS: ["lg","md","sm"]` no `select` e a matriz dizia que só a Aurea tinha tamanho ali.
  // 17 itens das quatro fontes ricas perdiam 19 eixos assim — e o erro é para MENOS, na direção
  // que faz a Aurea parecer melhor do que foi medida. Achado por uma célula `SO_AUREA` que era
  // implausível: sete referências, e nenhuma com escala de tamanho no `select`?
  if (dic) {
    for (const [p, v] of Object.entries(dic)) if (Array.isArray(v) && v.length) bruto[p] = v;
  } else {
    const va = esquema === "rico" ? it.VARIANTES : it.variantes;
    const ta = esquema === "rico" ? it.TAMANHOS : it.tamanhos;
    if (Array.isArray(va) && va.length) bruto.variant = va;
    if (Array.isArray(ta) && ta.length) bruto.size = ta;
  }
  // ── O EIXO QUE A FONTE TEM E O INVENTÁRIO NÃO ENUMEROU ──────────────────────
  // As fontes ricas guardam a lista de props em `PROPS_RELEVANTES`, e a leitura de eixo nunca
  // olhava para lá: só `VARIANTES`, `TAMANHOS` e `ORIENTACOES`. Efeito medido em 27/08/2026, ao
  // ler as células `SO_AUREA`: `tooltip·posicao` dizia que **só a Aurea** tem lados — e a base-ui
  // declara `side` no `TooltipPositioner`, a mui declara `placement`, a radix declara `align`.
  // Quatro células afirmavam superioridade que a evidência desmente, no documento cujo objetivo
  // inteiro é comparação honesta.
  //
  // O que entra é PRESENÇA, com vocabulário vazio — nunca valores inventados. Uma lista vazia em
  // `porFonte` já basta para o veredito deixar de ser `SO_AUREA` e virar `REQUER_LEITURA`, que é
  // a verdade: a referência tem o eixo, e o inventário não capturou os valores dele.
  //
  // A LISTA É CURTA DE PROPÓSITO, pela mesma razão que o `EIXO_CANON` é: presença de prop é sinal
  // mais fraco que vocabulário declarado, e casar demais inventa paridade. Cada nome aqui é uma
  // prop cujo NOME já fixa a dimensão, sem ambiguidade:
  //
  //   side · placement · align · anchor   posição de sobreposição — vocabulário fechado de lados
  //   orientation · direction             eixo maior/menor
  //
  // FICAM DE FORA, e o motivo é o mesmo em todos: o nome não fixa a dimensão. `type` é
  // `<input type=email>` tanto quanto `type="outline"`; `color` é `color="#fff"` tanto quanto
  // `color="danger"`; `size` é `<input size=40>` (largura em caracteres) tanto quanto `size="lg"`.
  // Onde essas são eixo de verdade, a fonte as declara em `VARIANTES`/`TAMANHOS` e o caminho
  // acima já as pega.
  const POR_PRESENCA = ["side", "placement", "align", "anchor", "orientation", "direction"];
  if (esquema === "rico" && it.PROPS_RELEVANTES && typeof it.PROPS_RELEVANTES === "object") {
    const todas = new Set(Object.values(it.PROPS_RELEVANTES).flat().map(String));
    for (const nome of POR_PRESENCA) {
      const tipo = eixoCanon(nome);
      if (tipo && todas.has(nome) && !bruto[nome]) bruto[nome] = [];
    }
  }

  const or = esquema === "rico" ? it.ORIENTACOES : null;
  if (Array.isArray(or) && or.length) bruto.orientation = or;

  const out = {};
  const naoMapeados = [];
  for (const [p, v] of Object.entries(bruto)) {
    const c = eixoCanon(p);
    if (!c) { naoMapeados.push(p); continue; }
    (out[c] ??= []).push(...v.map(String));
  }
  return {eixos: out, naoMapeados};
}

export function eixosAurea(ficha) {
  const out = {}, naoMapeados = [];
  for (const [p, v] of Object.entries(ficha.axes ?? {})) {
    const c = eixoCanon(p);
    if (!c) { naoMapeados.push(p); continue; }
    (out[c] ??= []).push(...v);
  }
  // `variantProp`/`sizeProp` dizem QUAL prop carrega a escala quando não é a de nome óbvio, e
  // ignorá-los foi um erro medido: sem eles o `Separator`, o `Toolbar` e o `ToggleGroup` — que
  // declaram `variantProp: "orientation"` — entravam como eixo de APARÊNCIA, e a matriz
  // reportava que lhes faltava orientação. Os três têm `orientation` no TypeScript, o check 14
  // já cobra isso, e a ficha nunca mentiu. Quem estava errado era este leitor. 22/08/2026.
  //
  // `variants` é o enum ACHATADO que o `G-API-01` decompôs em eixos; onde a ficha já declara
  // `axes`, ele é atalho e não um eixo à parte — contá-lo duas vezes inflaria a cardinalidade.
  const propVar = ficha.variantProp ?? "variant";
  const propTam = ficha.sizeProp ?? "size";
  if (ficha.variants?.length) {
    const c = eixoCanon(propVar) ?? "aparencia";
    if (!(c === "aparencia" && out.aparencia)) (out[c] ??= []).push(...ficha.variants);
  }
  if (ficha.sizes?.length) (out[eixoCanon(propTam) ?? "tamanho"] ??= []).push(...ficha.sizes);
  return {eixos: out, naoMapeados};
}
