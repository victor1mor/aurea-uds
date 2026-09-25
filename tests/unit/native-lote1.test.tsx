// Lote 1 do NATIVE.md — os primeiros componentes do alvo nativo.
//
// Os dublês de `react-native` e `react-native-svg` estão no alias do `vitest.config.ts`, pela
// razão que o `native-stubs/` documenta: `react-native` é Flow e nenhum transform o lê. O que se
// exercita aqui é o componente de verdade — a árvore que ele produz, com as props que ele calcula.
//
// **O que estes testes NÃO fazem é desenhar**, e por isso o app `apps/native-smoke/` continua
// existindo. Ele provou o Lote 0 num Android; o Lote 1 herda a fundação provada e acrescenta a
// própria pergunta visual, que é do aparelho.
import {render, screen, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";

import {
  AureaProvider, Button, Card, Cluster, Grid, Icon, IconButton, IconRegistryProvider, Screen,
  Stack, Text, criarFolha, criarRegistroDeIcones, resolverTokens, useAureaTheme, useAureaTokens,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");

const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider>{children}</AureaProvider>;

// As props com que um primitivo da plataforma foi chamado — é o que se quer verificar aqui.
// Ver o cabeçalho de `native-stubs/react-native.ts`.
const props = (primitivo: string, n = 0) => __instancias(primitivo)[n] ?? {};
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);

describe("criarFolha — a lição que o aparelho ensinou", () => {
  // DEFEITO: recriar a folha a cada render. O smoke test do Lote 0 mediu 182 ms na troca de tema
  // com o app fazendo exatamente isso de propósito, e a ADR-0037 registrou que os componentes do
  // Lote 1 "não têm essa desculpa". Sem memo, este teste devolve objetos diferentes.
  it("devolve a MESMA folha para o mesmo par (tema, densidade)", () => {
    const folha = criarFolha(() => ({caixa: {flexDirection: "row" as const}}));
    const a = folha(resolverTokens("dark", "comfortable"));
    const b = folha(resolverTokens("dark", "comfortable"));
    expect(a).toBe(b);
  });

  // E o outro lado do mesmo defeito: memoizar DEMAIS, devolvendo a folha do tema errado.
  it("devolve folhas DIFERENTES quando o par muda", () => {
    const folha = criarFolha((t) => ({caixa: {backgroundColor: t.color.background}}));
    expect(folha(resolverTokens("dark", "comfortable")))
      .not.toBe(folha(resolverTokens("light", "comfortable")));
    expect(folha(resolverTokens("dark", "comfortable")))
      .not.toBe(folha(resolverTokens("dark", "compact")));
  });
});

describe("Text — a primitiva que a web não precisou ter", () => {
  // DEFEITO SILENCIOSO, e é o que a ADR-0039 existe para impedir: escolher o peso por
  // `fontWeight`. No IBM Plex o SemiBold é FAMÍLIA própria — `fontWeight:"600"` devolveria o
  // Regular sintetizado, e a tela pareceria quase certa.
  it("escolhe o peso por fontFamily, e NUNCA emite fontWeight", () => {
    const mapa = {
      ui: {"400": "Ui-Regular", "500": "Ui-Medium", "600": "Ui-SemiBold", "700": "Ui-Bold",
           "400i": "Ui-Italic"},
      editorial: {"500": "Ed-Medium"}, code: {"400": "Co-Regular"},
    };
    render(
      <AureaProvider fontFamilies={mapa}>
        <Text weight={600}>peso</Text>
      </AureaProvider>);
    const s = estilo("Text");
    expect(s.fontFamily).toBe("Ui-SemiBold");
    expect(s).not.toHaveProperty("fontWeight");
  });

  // DEFEITO: emitir `lineHeight` como MÚLTIPLO. No CSS `line-height:1.5` é razão; no RN é dp.
  // Passar 1.5 daria uma linha de 1,5 pixel e o texto sairia sobreposto.
  it("lineHeight sai em dp — a razão do token multiplicada pelo tamanho", () => {
    render(<Envolve><Text size="lg" leading="relaxed">x</Text></Envolve>);
    const s = estilo("Text");
    expect(s.fontSize).toBe(tokens.size.textLg);
    expect(s.lineHeight).toBe(tokens.size.textLg * tokens.size.leadingRelaxed);
    expect(s.lineHeight).toBeGreaterThan(10);   // se saísse a razão crua, seria ~1.7
  });

  // DEFEITO: emitir `letterSpacing` como razão. Mesma classe do anterior, e a Etapa 2 já tinha
  // registrado a impedância — o token é razão de `em` DE PROPÓSITO.
  it("tracking multiplica o fontSize", () => {
    render(<Envolve><Text size="xs" tracking="widest">x</Text></Envolve>);
    const s = estilo("Text");
    expect(s.letterSpacing).toBe(tokens.size.textSm * tokens.tracking.trackingWidest);
  });

  // DEFEITO: inclinar o desenho reto em vez de usar o itálico DESENHADO.
  it("italic usa a fonte itálica, não fontStyle", () => {
    const mapa = {ui: {"400": "Ui-Regular", "400i": "Ui-Italic"}, editorial: {}, code: {}};
    render(<AureaProvider fontFamilies={mapa}><Text italic>x</Text></AureaProvider>);
    const s = estilo("Text");
    expect(s.fontFamily).toBe("Ui-Italic");
    expect(s).not.toHaveProperty("fontStyle");
  });
});

describe("layout", () => {
  // DEFEITO: acrescentar prop de espaçamento. A ficha do Stack na web diz por quê — "um primitivo
  // de layout que aceita qualquer espaçamento é como um sistema deixa de ter espaçamento".
  it("Stack e Cluster usam o gap do token, e não expõem prop para mudá-lo", () => {
    const {unmount} = render(<Envolve><Stack><Text>a</Text></Stack></Envolve>);
    expect(estilo("View").gap).toBe(tokens.size.space4);
    unmount();
    render(<Envolve><Cluster><Text>a</Text></Cluster></Envolve>);
    const c = estilo("View", 1);
    expect(c.gap).toBe(tokens.size.space3);
    expect(c.flexWrap).toBe("wrap");   // a fila de chips NUNCA rola de lado
  });

  // DEFEITO: o Card perder o raio 22 — identidade declarada INTOCÁVEL no CLAUDE.md.
  it("Card usa o raio de card e a cor de superfície do tema", () => {
    render(<Envolve><Card><Text>a</Text></Card></Envolve>);
    const s = estilo("View");
    expect(s.borderRadius).toBe(22);
    expect(s.backgroundColor).toBe(tokens.color.card);
  });

  // DEFEITO: `raised` sem sombra. O `boxShadow` do RN 0.76+ foi assumido 1:1 pela Etapa 2 e
  // provado em aparelho no smoke do Lote 0 — se ele sumir daqui, some da tela.
  it("Card raised leva boxShadow com o token de sombra", () => {
    render(<Envolve><Card variant="raised"><Text>a</Text></Card></Envolve>);
    expect(estilo("View").boxShadow).toEqual([tokens.shadow.shadowLg]);
  });

  // DEFEITO: o Grid deixar a coluna estourar o contêiner. A web resolveu isso com
  // `min(--grid-min, 100%)` na Fase 11; sem o par aqui, texto grande empurra a coluna para fora.
  it("Grid envolve cada filho com largura mínima e teto de 100%", () => {
    render(<Envolve><Grid><Text>a</Text></Grid></Envolve>);
    const celula = estilo("View", 1);   // [0] é o contêiner; [1] é a célula que envolve o filho
    expect(celula.flexBasis).toBe(240);
    expect(celula.maxWidth).toBe("100%");
  });
});

const ICONES = criarRegistroDeIcones({
  add: ({size, color}: {size?: number; color?: string}) =>
    React.createElement("Svg", {testID: "glifo", width: size, fill: color}),
});

describe("Icon — o registro que o app monta", () => {
  // DEFEITO: importar os 2571 aqui dentro. A cláusula 4 da ADR-0038 é explícita, e a 1 explica o
  // custo: o tree-shaking do Metro é experimental, então um mapa embutido chegaria inteiro no app.
  it("o módulo NÃO importa ícone nenhum", async () => {
    const fs = await import("node:fs");
    const fonte = fs.readFileSync(process.cwd() + "/packages/native/src/icon.tsx", "utf8");
    // ⚠ COMENTÁRIO NÃO É CÓDIGO, e esta linha existe porque o teste reprovou sem ela — pelo
    // EXEMPLO DE USO no cabeçalho do arquivo, não por um import de verdade. É exatamente a
    // lição que o check 23 do validador já tinha aprendido em 06/08/2026 ("o check 23 lia o
    // fonte inteiro e reprovou o comentário que explicava"), reaparecendo do lado do nativo.
    const codigo = fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    // E ANCORADO NA DECLARAÇÃO, não em qualquer menção: a mensagem de aviso do `Icon` cita o
    // caminho `@aurea-uds/native/icons/<nome>` dentro de uma STRING, para ensinar quem errou o
    // nome. Um teste que procurasse a menção reprovaria a própria ajuda que o componente dá —
    // a mesma armadilha do comentário, um degrau adiante.
    const imports = codigo.match(/^\s*import[^;]+;/gm) ?? [];
    expect(imports.filter((i) => /icons/.test(i))).toEqual([]);
    // e a prova de que a varredura não ficou cega: o import que EXISTE continua sendo visto.
    expect(imports.some((i) => /"react-native"/.test(i))).toBe(true);
  });

  // DEFEITO: desenhar um losango de erro para nome ausente — pareceria glifo de verdade e
  // passaria por revisão.
  it("nome fora do registro não desenha nada, e avisa em DEV", () => {
    const quieto = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Envolve><Icon name="nao-existe" icons={ICONES} /></Envolve>);
    expect(quieto).toHaveBeenCalledWith(expect.stringContaining("nao-existe"));
    quieto.mockRestore();
  });

  // DEFEITO: o ícone decorativo ser anunciado pelo leitor de tela junto com o texto ao lado —
  // a mesma coisa dita duas vezes.
  it("sem label é decorativo; com label vira imagem anunciada", () => {
    const {unmount} = render(<Envolve><Icon name="add" icons={ICONES} /></Envolve>);
    expect(props("View").importantForAccessibility).toBe("no-hide-descendants");
    expect(props("View").accessibilityLabel).toBeUndefined();
    unmount();
    render(<Envolve><Icon name="add" icons={ICONES} label="Adicionar" /></Envolve>);
    expect(props("View", 1).accessibilityLabel).toBe("Adicionar");
    expect(props("View", 1).accessibilityRole).toBe("image");
  });
});

describe("IconRegistryProvider", () => {
  // DEFEITO: o registro só funcionar dentro do `AureaProvider`. Ele é contexto PRÓPRIO de
  // propósito — quem já tem um provider de tema no topo do app mas monta os ícones mais abaixo
  // (por rota, por exemplo) precisa poder declará-lo onde faz sentido.
  it("põe o registro em contexto sem depender do AureaProvider", () => {
    render(
      <AureaProvider>
        <IconRegistryProvider registry={ICONES}>
          <Icon name="add" label="Adicionar" />
        </IconRegistryProvider>
      </AureaProvider>);
    expect(props("View").accessibilityLabel).toBe("Adicionar");
  });
});

describe("Button e IconButton", () => {
  // ⚠ O TESTE MAIS IMPORTANTE DESTE ARQUIVO.
  //
  // DEFEITO: o alvo de toque ficar menor que `--target-min`. Medido: três das cinco alturas de
  // controle (26, 30, 36) são menores que os 44 do token. E a saída óbvia — `hitSlop` — está
  // ERRADA: ela não é levada em conta pelo TalkBack, então o leitor de tela ficaria com o alvo
  // pequeno. Aqui o mínimo é `minHeight` no próprio Pressable, que o leitor enxerga.
  it("o alvo tocável nunca é menor que target-min, em nenhum tamanho", () => {
    for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
      const {unmount} = render(<Envolve><Button size={size}>ok</Button></Envolve>);
      const alvo = estilo("Pressable");
      expect(alvo.minHeight, size).toBe(tokens.size.targetMin);
      expect(alvo.minHeight as number, size).toBeGreaterThanOrEqual(44);
      unmount();
    }
  });

  // E o complemento: o DESENHO continua o do token. Se o alvo tivesse sido resolvido esticando a
  // caixa, a identidade visual teria mudado para caber na acessibilidade.
  it("a caixa pintada mantém a altura do token de densidade", () => {
    render(<Envolve><Button size="md">ok</Button></Envolve>);
    const caixa = estilo("View");
    expect(caixa.height).toBe(tokens.size.controlHMd);
    expect(caixa.height).toBe(36);
    expect(caixa.borderRadius).toBe(999);   // pill — identidade INTOCÁVEL
  });

  // DEFEITO: nascer com o atalho `variant` da web e ter dois caminhos para a mesma pintura.
  it("a API é de dois eixos: appearance e tone, sem variant", () => {
    const {unmount} = render(
      <Envolve><Button appearance="solid" tone="brand">ok</Button></Envolve>);
    expect(estilo("View").backgroundColor).toBe(tokens.color.primary);
    unmount();
    render(<Envolve><Button appearance="ghost" tone="danger">x</Button></Envolve>);
    expect(estilo("View", 1).backgroundColor).toBe("transparent");
  });

  it("disabled bloqueia o toque e anuncia o estado", () => {
    render(<Envolve><Button disabled onPress={vi.fn()}>ok</Button></Envolve>);
    expect((props("Pressable").accessibilityState as {disabled: boolean}).disabled).toBe(true);
    expect(props("Pressable").disabled).toBe(true);
  });

  // DEFEITO: um botão só de glifo sem rótulo — mudo para quem não o vê. O tipo torna `label`
  // obrigatório, e este teste prova que ele chega ao leitor de tela.
  it("IconButton leva o rótulo obrigatório para a acessibilidade", () => {
    render(<Envolve><IconButton name="add" label="Adicionar" icons={ICONES} /></Envolve>);
    expect(props("Pressable").accessibilityLabel).toBe("Adicionar");
    expect(props("Pressable").accessibilityRole).toBe("button");
  });

  // O IconButton é REDONDO em todos os tamanhos (ADR-0052, 25/09/2026): quadrado com o raio da
  // cápsula, como o `.btn-icon` do core. Até a 0.10.1 era `radiusMd`/`radiusSm`, e este teste
  // cobrava o contrário — ele reprova no código antigo.
  it.each(["xs", "sm", "md", "lg", "xl"] as const)("IconButton %s é redondo: quadrado com o raio da cápsula", (size) => {
    render(<Envolve><IconButton name="add" label="a" size={size} icons={ICONES} /></Envolve>);
    const caixa = estilo("View");
    expect(caixa.borderRadius).toBe(tokens.size.radiusControl);
    expect(caixa.width).toBe(caixa.height);
  });
});

describe("o provider continua sendo o chão", () => {
  function Sonda() {
    const {theme, toggleTheme} = useAureaTheme();
    const {color} = useAureaTokens();
    return (
      <>
        <Text>{theme}</Text>
        <Text>{color.background}</Text>
        <Text onPress={toggleTheme}>trocar</Text>
      </>
    );
  }

  it("trocar o tema muda os valores que os componentes leem", () => {
    render(<Envolve><Sonda /></Envolve>);
    const antes = props("Text", 1).children;
    act(() => { (props("Text", 2).onPress as () => void)(); });
    expect(props("Text", 3).children).toBe("light");
    expect(props("Text", 4).children).not.toBe(antes);
  });
});

describe("Screen — o único do lote que precisou de dependência nova", () => {
  // DEFEITO: uma tela transparente que não preenche. Sem `flex:1` ela colapsa na altura do
  // conteúdo, e sem `backgroundColor` o app mostra o fundo do host — que no Android é branco,
  // então o tema escuro sairia com moldura clara.
  it("preenche e pinta com o fundo do tema", () => {
    render(<Envolve><Screen><Text>oi</Text></Screen></Envolve>);
    const s = estilo("SafeAreaView");
    expect(s.flex).toBe(1);
    expect(s.backgroundColor).toBe(tokens.color.background);
  });

  // DEFEITO: proteger só o topo. Em PAISAGEM o entalhe fica à esquerda ou à direita, e a barra
  // de gestos do Android mora embaixo — uma tela só com `top` quebra ao girar o aparelho.
  it("pede AS QUATRO bordas por padrão", () => {
    render(<Envolve><Screen /></Envolve>);
    expect(props("SafeAreaView").edges).toEqual(["top", "right", "bottom", "left"]);
  });

  it("respeita a lista de bordas que a tela pedir", () => {
    render(<Envolve><Screen edges={["top"]} /></Envolve>);
    expect(props("SafeAreaView").edges).toEqual(["top"]);
  });

  it("sem scroll, o respiro é da raiz", () => {
    render(<Envolve><Screen /></Envolve>);
    expect(estilo("SafeAreaView").padding).toBe(tokens.size.space4);
    expect(__instancias("ScrollView")).toHaveLength(0);
  });

  // DEFEITO REAL, e é a razão de o `scroll` não ser só um `<ScrollView>` em volta: padding no
  // PRÓPRIO `ScrollView` recorta a área rolável — a barra de rolagem entra para dentro e o
  // conteúdo some sob a borda. O lugar certo é o `contentContainerStyle`.
  it("com scroll, o respiro SAI da raiz e vai para o contentContainerStyle", () => {
    render(<Envolve><Screen scroll><Text>oi</Text></Screen></Envolve>);
    expect(estilo("SafeAreaView").padding).toBeUndefined();
    expect(StyleSheet.flatten(props("ScrollView").style).padding).toBeUndefined();
    expect(StyleSheet.flatten(props("ScrollView").contentContainerStyle).padding)
      .toBe(tokens.size.space4);
  });

  // DEFEITO: sem `flexGrow`, conteúdo curto ocupa só a própria altura e nada consegue se
  // centralizar na tela — o `EmptyState` do Lote 2 nasceria grudado no topo.
  it("com scroll, o conteúdo cresce até a altura da tela", () => {
    render(<Envolve><Screen scroll><Text>oi</Text></Screen></Envolve>);
    expect(StyleSheet.flatten(props("ScrollView").contentContainerStyle).flexGrow).toBe(1);
  });

  // DEFEITO do RN, conhecido e chato: com o teclado aberto, o primeiro toque num botão só fecha
  // o teclado. O Lote 4 é todo formulário — a tela é o lugar de absorver isso uma vez.
  it("com scroll, um toque basta com o teclado aberto", () => {
    render(<Envolve><Screen scroll /></Envolve>);
    expect(props("ScrollView").keyboardShouldPersistTaps).toBe("handled");
  });

  it("sem respiro quando a tela pede lista de borda a borda", () => {
    render(<Envolve><Screen scroll padded={false} /></Envolve>);
    expect(estilo("SafeAreaView").padding).toBeUndefined();
    expect(StyleSheet.flatten(props("ScrollView").contentContainerStyle).padding).toBeUndefined();
  });

  // DEFEITO: mandar o `...rest` para o `ScrollView` quando há scroll. `testID`, rótulo e papel de
  // acessibilidade são da TELA — quem os recebe tem de ser o mesmo nó com e sem `scroll`.
  it("as props da tela ficam na raiz, com scroll ou sem", () => {
    render(<Envolve><Screen scroll testID="tela" accessibilityLabel="Painel" /></Envolve>);
    expect(props("SafeAreaView").testID).toBe("tela");
    expect(props("SafeAreaView").accessibilityLabel).toBe("Painel");
    expect(props("ScrollView").testID).toBeUndefined();
  });

  // DEFEITO: hex cravado no lugar do token. Sairia certo num tema e errado no outro.
  it("o fundo muda com o tema", () => {
    render(<Envolve><Screen background="surface2" /></Envolve>);
    expect(estilo("SafeAreaView").backgroundColor).toBe(tokens.color.surface2);
    expect(resolverTokens("light", "comfortable").color.surface2)
      .not.toBe(tokens.color.surface2);
  });
});
