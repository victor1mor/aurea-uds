// VITRINE do alvo nativo — gera uma PÁGINA a partir do código real, para haver prova visual.
//
// Pedido do Victor em 12/09/2026: *"quero prova visual"*. Ele está certo e a cobrança é justa —
// até aqui toda a evidência do Lote 7 foi saída de terminal, e número em texto não mostra se a
// coisa está feia.
//
// ⚠ **O QUE ISTO É, E O QUE NÃO É — leia antes de olhar a imagem.**
//
//   É   · os OBJETOS DE ESTILO que o código real calculou a partir dos tokens reais: cor, raio,
//         altura, borda, espaçamento, peso. Nada aqui é desenhado à mão.
//   NÃO é · o aparelho. O layout é feito pelo flexbox do NAVEGADOR, não pelo Yoga do React
//         Native. Os dois concordam na esmagadora maioria dos casos e podem divergir em casos de
//         borda. Vale como prova de VALOR ("esta borda é `focusStrong`?", "este raio é 22?"),
//         nunca como prova de layout final.
//   NÃO é · substituto do `apps/native-smoke/`, que roda no Android de verdade.
//
// A tipografia é a IBM Plex servida dos `.woff2` do próprio repositório — no aparelho quem serve
// são os `.ttf` do `@aurea-uds/fonts/native`. Mesma família, arquivo diferente.
import {render, act} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {writeFileSync, mkdirSync, readFileSync} from "node:fs";
import {resolve, dirname} from "node:path";
import {createRequire} from "node:module";
import {__definirVitrine} from "./native-stubs/react-native";

import {
  AureaProvider, Combobox, Field, Gallery, Image, Input, NumberField, SearchField, Select,
  Textarea, Card, Text as AureaText, criarRegistroDeIcones, ptBR,
} from "../../packages/native/src/index.js";

// 🔴 OS GLIFOS SÃO CARBON DE VERDADE — e a primeira vitrine os desenhava como QUADRADOS CINZA.
//
// O efeito era pior do que "feio": o `+` e o `−` saíam **idênticos**, a lupa, o `x` e a seta
// também. Carbon Icons é identidade declarada INTOCÁVEL no `CLAUDE.md`, e a imagem que deveria
// prová-la não mostrava nenhum.
//
// O desenho sai do MESMO lugar que o `build-icons-native.mjs` usa — `@carbon/icons/svg/32/` —,
// então é o mesmo caminho do glifo que vai para o aparelho. O que muda é só o destino: aqui
// vira `<svg>` do DOM, lá vira `react-native-svg`.
// © IBM Corp., Apache-2.0 — o mesmo crédito que o `NOTICE` do pacote já carrega.
const svgDoCarbon = (nome: string): string => {
  const dir = dirname(createRequire(import.meta.url).resolve("@carbon/icons/package.json"));
  const bruto = readFileSync(resolve(dir, "svg", "32", `${nome}.svg`), "utf-8");
  // Só o miolo: o `<svg>` de fora é reescrito com o tamanho e a cor que o componente pediu.
  return bruto.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
};

const glifoDe = (nome: string) => {
  const miolo = svgDoCarbon(nome);
  const Glifo = ({size, color}: {size?: number; color?: string}) =>
    React.createElement("span", {
      style: {display: "inline-flex", width: size ?? 16, height: size ?? 16,
              color: color ?? "currentColor", flex: "none"},
      dangerouslySetInnerHTML: {
        __html: `<svg viewBox="0 0 32 32" width="${size ?? 16}" height="${size ?? 16}" ` +
                `fill="currentColor" aria-hidden="true">${miolo}</svg>`,
      },
    });
  return Glifo;
};

const ICONES = criarRegistroDeIcones({
  "chevron--down": glifoDe("chevron--down"), search: glifoDe("search"),
  close: glifoDe("close"), add: glifoDe("add"), subtract: glifoDe("subtract"),
  image: glifoDe("image"),
});

// Conteúdo de demonstração, em `data:` — sem rede e sem arquivo no repositório. Formas chapadas
// de propósito: **gradiente é proibido na Aurea desde a Fase 0**, e mesmo sendo conteúdo e não
// desenho, não vou pôr um na imagem que prova o design system.
const svgFoto = (fundo: string, marca: string) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">` +
    `<rect width="120" height="90" fill="${fundo}"/>` +
    `<circle cx="34" cy="30" r="13" fill="${marca}"/>` +
    `<path d="M0 90 L42 44 L74 74 L96 56 L120 90 Z" fill="${marca}" opacity="0.55"/></svg>`);
const FOTO = svgFoto("#3b4252", "#f0b100");
const FOTO2 = svgFoto("#2e3440", "#8fb9c9");

type Tema = "dark" | "light";
const Palco = ({tema, children}: {tema: Tema; children: React.ReactNode}) => (
  <AureaProvider theme={tema} density="comfortable" icons={ICONES} strings={ptBR}>
    {children}
  </AureaProvider>
);

const pranchas: Array<{titulo: string; nota: string; html: Record<Tema, string>}> = [];

/** Desenha o mesmo conteúdo nos dois temas e guarda o HTML de cada um. */
async function prancha(
  titulo: string, nota: string,
  conteudo: (tema: Tema) => React.ReactElement,
  depois?: (tela: ReturnType<typeof render>) => Promise<void>,
) {
  const html = {} as Record<Tema, string>;
  for (const tema of ["dark", "light"] as Tema[]) {
    __definirVitrine(true);
    const tela = render(<Palco tema={tema}>{conteudo(tema)}</Palco>);
    if (depois) await depois(tela);
    html[tema] = tela.container.innerHTML;
    tela.unmount();
  }
  pranchas.push({titulo, nota, html});
}

// O foco não é um estado que o dublê sabe simular sozinho: quem o liga é o `onFocus` do
// `TextInput`. A vitrine o dispara de propósito, porque o estado de foco É o achado do dia.
const focar = (tela: ReturnType<typeof render>, id: string) => act(async () => {
  const no = tela.container.querySelector(`[data-testid="${id}"]`);
  const alvo = (no as unknown as {__reactProps?: unknown}) && no;
  void alvo;
  // O dublê não expõe handler no DOM; o caminho é o mesmo dos outros testes — as props ficam no
  // registro. Aqui a vitrine usa o atalho de re-renderizar com o estado já ligado, abaixo.
});
void focar;

describe("vitrine do alvo nativo", () => {
  it("gera a página com o código real", async () => {
    // ── 1 · O ACHADO DO DIA, lado a lado ─────────────────────────────────────────────────────
    // Esquerda: como o `NumberField` saiu na `0.8.0` publicada — sem foco nenhum.
    // Direita: com foco, depois do conserto que a HeroUI obrigou.
    await prancha(
      "NumberField — o defeito que a HeroUI achou",
      "À esquerda, em repouso: a borda é `borderStrong`. À direita, com foco: `focusStrong`. " +
      "Na 0.8.0 publicada as DUAS eram iguais — este campo era o único do pacote sem foco.",
      () => (
        <Card>
          <AureaText size="sm" tone="muted">repouso</AureaText>
          <Field label="Valor">
            <NumberField value={1234.5} format={{style: "currency", currency: "BRL"}}
                         locale="pt-BR" fullWidth testID="nf-a" />
          </Field>
          <AureaText size="sm" tone="muted">com foco</AureaText>
          <Field label="Valor">
            <NumberField value={1234.5} format={{style: "currency", currency: "BRL"}}
                         locale="pt-BR" fullWidth testID="nf-b" />
          </Field>
        </Card>
      ),
      async (tela) => {
        // Liga o foco do SEGUNDO campo. O handler vive nas props do dublê; o registro guarda a
        // instância, e chamar `onFocus` re-renderiza com o estado ligado — que é o que a imagem
        // precisa mostrar.
        const {__instancias} = await import("./native-stubs/react-native");
        // ⚠ `nf-b-campo`, e não `nf-b`: o `testID` da raiz é do GRUPO; o do `TextInput` leva o
        // sufixo `-campo`. A primeira versão desta linha filtrou pela raiz, não achou nada, e a
        // prancha saiu SEM o foco que ela existe para mostrar — a vitrine mentindo sobre o
        // conserto que ela estava provando.
        const campo = __instancias("TextInput").filter((p) => p.testID === "nf-b-campo").at(-1);
        await act(async () => { (campo?.onFocus as (() => void) | undefined)?.(); });
        void tela;
      });

    // ── 2 · A consistência entre os três campos ──────────────────────────────────────────────
    await prancha(
      "Os três campos de texto, todos com foco",
      "Input, SearchField e NumberField. O token é o MESMO nos três (`focusStrong`), mas quem " +
      "CARREGA a borda não é: no SearchField é o grupo (lupa + campo + limpar na mesma caixa), " +
      "nos outros dois é o próprio campo.",
      () => (
        <Card>
          <Field label="Placa"><Input value="ABC1D23" testID="in" /></Field>
          <AureaText size="sm" tone="muted">busca</AureaText>
          <SearchField value="arroz" testID="sf" />
          <Field label="Litros">
            <NumberField value={12.4} format={{maximumFractionDigits: 1}} locale="pt-BR"
                         min={0} testID="nf-c" />
          </Field>
        </Card>
      ),
      async () => {
        const {__instancias} = await import("./native-stubs/react-native");
        for (const id of ["in", "sf-campo", "nf-c-campo"]) {
          const c = __instancias("TextInput").filter((p) => p.testID === id).at(-1);
          await act(async () => { (c?.onFocus as (() => void) | undefined)?.(); });
        }
      });

    // ── 3 · Combobox × Select — a diferença que motivou o lote ───────────────────────────────
    await prancha(
      "Combobox e Select — o gatilho é o mesmo, o que abre não é",
      "Os dois FECHADOS, que é como aparecem no formulário: mesma altura, mesma borda, a mesma " +
      "seta. A diferença está no que abre, e ela é a prancha seguinte. " +
      "⚠ A primeira vitrine mostrava as duas folhas ABERTAS aqui, com `visible={false}` — o " +
      "dublê desenhava o Modal sempre. Era tela que não existe.",
      () => (
        <Card>
          <Field label="Unidade (Select — lista fixa)">
            <Select items={[{value: "kg", label: "Quilograma"}]} value="kg" />
          </Field>
          <Field label="Item (Combobox — catálogo remoto)">
            <Combobox
              items={[{value: "1", label: "Açúcar refinado"}]}
              value={{value: "1", label: "Açúcar refinado"}}
              placeholder="Buscar item" testID="cb" />
          </Field>
        </Card>
      ));

    // ── 4 · A folha do Combobox, aberta ──────────────────────────────────────────────────────
    await prancha(
      "A folha do Combobox, ABERTA — e ela é aberta de verdade",
      "O puxador no topo (arrastar para baixo fecha — é a única saída por gesto no iOS), o campo " +
      "de busca com a lupa, e a lista. O item escolhido leva fundo e peso 600. É `FlatList`, não " +
      "`ScrollView`: é o que faz milhares de linhas rolarem.",
      () => (
        <Combobox
          items={[
            {value: "1", label: "Açúcar refinado"},
            {value: "2", label: "Açúcar cristal"},
            {value: "3", label: "Açúcar mascavo"},
            {value: "4", label: "Adoçante"},
          ]}
          value={{value: "2", label: "Açúcar cristal"}}
          searchPlaceholder="Buscar" testID="cbf" />
      ),
      async () => {
        // ABRE de verdade, tocando no gatilho — em vez de contar com o dublê desenhando um
        // Modal fechado. A folha que aparece na imagem é a folha que a pessoa veria.
        const {__instancias} = await import("./native-stubs/react-native");
        const gatilho = __instancias("Pressable").filter((p) => p.testID === "cbf").at(-1);
        await act(async () => { (gatilho?.onPress as (() => void) | undefined)?.(); });
      });

    // ── 4b · O abraço, que é o outro conserto ────────────────────────────────────────────────
    await prancha(
      "NumberField — abraça por padrão, estica quando se pede",
      "Em cima o padrão: o grupo ABRAÇA e o campo tem `--space-16` (64dp), que é o " +
      "`.number-field-input` do nosso CSS. Embaixo, `fullWidth` — que é o que moeda formatada " +
      "precisa, porque `R$ 1.234,50` não cabe em 64dp nem aqui nem na web. " +
      "⚠ Antes de 12/09 só existia o de baixo, e sem prop: o campo esticava sempre e os botões " +
      "ficavam jogados nas pontas.",
      () => (
        <Card>
          <AureaText size="sm" tone="muted">padrão — contador</AureaText>
          <Field label="Quantidade"><NumberField value={3} min={0} testID="nf-hug" /></Field>
          <AureaText size="sm" tone="muted">fullWidth — moeda</AureaText>
          <Field label="Valor">
            <NumberField value={1234.5} format={{style: "currency", currency: "BRL"}}
                         locale="pt-BR" fullWidth testID="nf-wide" />
          </Field>
        </Card>
      ));

    // ── 5 · Imagem e galeria ─────────────────────────────────────────────────────────────────
    // 🔴 A PRIMEIRA VERSÃO DESTA PRANCHA NÃO PROVAVA NADA: sem rede, todas as caixas saíam
    // cinzas e vazias, e eu legendei como se fosse prova de "exibir imagem". Agora os bytes
    // entram por `data:` — então o que se vê é a foto DESENHADA pelo componente —, e a última
    // fica QUEBRADA de propósito, para o substituto aparecer.
    await prancha(
      "Image e Gallery — com bytes de verdade, e um substituto",
      "A foto do topo e as duas primeiras miniaturas carregam. A terceira está quebrada de " +
      "propósito: ela cai no substituto, que mantém a caixa reservada, o raio e o glifo " +
      "`image` do Carbon — e continua sendo a imagem para quem usa leitor de tela, com o mesmo " +
      "texto alternativo. A do meio está escolhida (`selected`), e leva a cápsula da casa.",
      () => (
        <Card>
          <Image source={FOTO} alt="Frente do item" ratio="4/3" testID="im" />
          <AureaText size="sm" tone="muted">galeria — a terceira está quebrada</AureaText>
          <Gallery
            items={[
              {id: "a", source: FOTO, alt: "Frente"},
              {id: "b", source: FOTO2, alt: "Verso"},
              {id: "c", source: "quebrada.jpg", alt: "Lateral"},
            ]}
            selected="b" onSelect={() => {}} minTileWidth={92} testID="g" />
        </Card>
      ),
      async () => {
        // Dispara o erro da TERCEIRA, que é a que não tem bytes. É o mesmo caminho do aparelho:
        // o `onError` do `Image` do RN.
        const {__instancias} = await import("./native-stubs/react-native");
        const quebrada = __instancias("Image").filter(
          (i) => typeof i.source === "object" && i.source != null &&
                 (i.source as {uri?: string}).uri === "quebrada.jpg").at(-1);
        await act(async () => { (quebrada?.onError as (() => void) | undefined)?.(); });
      });

    // ── A página ─────────────────────────────────────────────────────────────────────────────
    const raiz = resolve(__dirname, "../../tmp-vitrine");
    mkdirSync(raiz, {recursive: true});
    const fontes = resolve(__dirname, "../../packages/fonts/files");

    const corpo = pranchas.map((p) => `
  <section class="prancha">
    <h2>${p.titulo}</h2>
    <p class="nota">${p.nota}</p>
    <div class="dupla">
      <figure><figcaption>dark</figcaption>
        <div class="palco escuro">${p.html.dark}</div></figure>
      <figure><figcaption>light</figcaption>
        <div class="palco claro">${p.html.light}</div></figure>
    </div>
  </section>`).join("\n");

    writeFileSync(resolve(raiz, "index.html"), `<!doctype html>
<meta charset="utf-8">
<title>Vitrine — alvo nativo, Lote 7</title>
<style>
  @font-face { font-family:"IBM Plex Sans"; font-weight:400;
    src:url("file://${fontes}/ibm-plex-sans-400-normal.woff2") format("woff2"); }
  @font-face { font-family:"IBM Plex Sans"; font-weight:500;
    src:url("file://${fontes}/ibm-plex-sans-500-normal.woff2") format("woff2"); }
  @font-face { font-family:"IBM Plex Sans"; font-weight:600;
    src:url("file://${fontes}/ibm-plex-sans-600-normal.woff2") format("woff2"); }
  * { box-sizing:border-box; }
  body { margin:0; padding:32px; background:#16171a; color:#e8e8ea;
         font:14px/1.5 "IBM Plex Sans", system-ui, sans-serif; }
  h1 { font-size:22px; margin:0 0 6px; }
  .aviso { max-width:980px; margin:0 0 28px; padding:14px 16px; border-radius:12px;
           background:#2a2418; border:1px solid #6b5a1f; color:#e8d9a8; font-size:13px; }
  .aviso b { color:#f0b100; }
  .prancha { margin:0 0 34px; }
  h2 { font-size:16px; margin:0 0 4px; }
  .nota { margin:0 0 14px; color:#9a9aa2; font-size:13px; max-width:980px; }
  .dupla { display:flex; gap:18px; flex-wrap:wrap; }
  figure { margin:0; }
  figcaption { font-size:11px; letter-spacing:.08em; text-transform:uppercase;
               color:#8a8a92; margin-bottom:6px; }
  .palco { width:360px; padding:16px; border-radius:14px;
           display:flex; flex-direction:column; align-items:stretch; }
  .escuro { background:#16171a; border:1px solid #2e2f33; }
  .claro  { background:#ffffff; border:1px solid #e3e3e6; }
  .palco [data-rn] { min-width:0; }
</style>
<h1>Vitrine do alvo nativo — Lote 7</h1>
<div class="aviso">
  <b>O que esta página é:</b> os objetos de estilo que o código de
  <code>packages/native/src/</code> calculou a partir dos tokens reais — cor, raio, altura,
  borda, espaçamento, peso. Nada aqui foi desenhado à mão.<br><br>
  <b>O que ela NÃO é:</b> o aparelho. O layout é do flexbox do <b>navegador</b>, não do Yoga do
  React&nbsp;Native. Os glifos são Carbon de verdade, lidos de
  <code>@carbon/icons/svg/32/</code> — o mesmo arquivo que gera o do aparelho —, mas desenhados
  aqui como <code>&lt;svg&gt;</code> do DOM, não pelo <code>react-native-svg</code>. Vale como
  prova de <b>valor</b> — "esta borda é <code>focusStrong</code>?", "este raio
  é 22?" —, nunca como prova de layout final. O aparelho continua sendo o
  <code>apps/native-smoke/</code>, e ele <b>não rodou para este lote</b>.
</div>
${corpo}
`, "utf-8");

    expect(pranchas.length).toBe(6);
  });

  // ── O GATE QUE A IMAGEM DE 12/09/2026 COBROU ──────────────────────────────────────────────
  //
  // O Victor olhou a prancha do `NumberField` e disse: *"os numero não estão centralizado
  // 'assimetria' eles estão muito pra cima"*. **A acusação estava certa sobre a IMAGEM e errada
  // sobre o componente** — e as duas metades precisam de prova, não de opinião:
  //
  //   • no APARELHO o texto centraliza, medido no fonte do `react-native@0.87.1`:
  //     `ReactTextInputManager.kt:574-587` (Android → `Gravity.CENTER_VERTICAL`) e
  //     `RCTUITextField.mm:224-227` (iOS → `super textRectForBounds:`, que já centraliza);
  //   • na VITRINE não centralizava, porque o dublê tratava `textAlignVertical` como
  //     intraduzível e o descartava — e um `div` de flex em coluna com altura fixa empurra o
  //     texto para o topo.
  //
  // Este teste é o controle da conversão, e ele é PROVADO CONTRA O DEFEITO: devolvendo
  // `"textAlignVertical"` ao conjunto `SO_DO_RN` do dublê, as quatro asserções caem.
  it("traduz o alinhamento vertical do texto nos QUATRO campos do pacote", () => {
    const alinhamentoDe = (no: Element | null) =>
      (no as HTMLElement | null)?.style.justifyContent;

    __definirVitrine(true);
    const tela = render(
      <Palco tema="dark">
        <NumberField testID="g-num" value="3" onChangeValue={() => {}} label="n" />
        <Input testID="g-inp" value="a" onChangeText={() => {}} label="i" />
        <SearchField testID="g-bus" value="a" onChangeText={() => {}} label="b" />
        <Textarea testID="g-txt" value="a" onChangeText={() => {}} label="t" />
      </Palco>,
    );
    const q = (id: string) => tela.container.querySelector(`[data-testid="${id}"]`);

    // Os três de uma linha centralizam.
    expect(alinhamentoDe(q("g-num-campo"))).toBe("center");
    expect(alinhamentoDe(q("g-inp"))).toBe("center");
    expect(alinhamentoDe(q("g-bus-campo"))).toBe("center");
    // O `Textarea` é o contrário de propósito (`inputs.tsx:372`): texto de várias linhas começa
    // no TOPO. Se a tradução fosse "centralize tudo", este é o campo que ela estragaria.
    expect(alinhamentoDe(q("g-txt"))).toBe("flex-start");

    tela.unmount();
  });
});
