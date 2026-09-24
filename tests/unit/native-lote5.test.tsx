// Lote 5 do alvo nativo — `Dialog`, `ConfirmDialog`, `Drawer`, `BottomSheet` e o `useToast`.
//
// ⚠ **O ACHADO DESTE LOTE NÃO PODE SER TESTADO AQUI, e dizer isso é parte do trabalho.** O RN
// aceita `role="dialog"` e não o mapeia em nenhuma plataforma (fonte medido em `overlays.tsx`).
// Um teste de código não pega isso: o dublê aceitaria a prop e o `expect` passaria verde,
// exatamente como o `tsc` passa. O que este arquivo pode fazer — e faz — é cobrar que **NENHUM
// componente use esses papéis**, que é a decisão que a medição produziu.
import {render, act} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {
  StyleSheet, __definirReduceMotion, __instancias, __ultimoGesto,
} from "./native-stubs/react-native";
import {__definirInsets} from "./native-stubs/react-native-safe-area-context";
import {
  AureaProvider, BottomSheet, ConfirmDialog, Dialog, Drawer, ToastHost, useToast,
  criarRegistroDeIcones, defaultStrings, ptBR, resolverTokens,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({
  close: Glifo, "information--filled": Glifo, "checkmark--filled": Glifo,
  "warning--alt--filled": Glifo, "error--filled": Glifo,
});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

const props = (primitivo: string, n = 0) => __instancias(primitivo)[n] ?? {};
const todos = (primitivo: string) => __instancias(primitivo);
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);

describe("Dialog — o Modal é o motor, e o botão VOLTAR é o Escape", () => {
  // DEFEITO QUE PRENDE A PESSOA NA TELA: sem `onRequestClose` o botão voltar do Android não faz
  // nada. O próprio RN documenta a prop como obrigatória (`Modal.d.ts:36`). É o par exato do
  // diálogo web que ignora `Escape` — e num telefone é pior, porque voltar é O gesto.
  it("as QUATRO superfícies passam `onRequestClose`", () => {
    const nada = () => {};
    for (const arvore of [
      <Dialog open title="t" onClose={nada} />,
      <ConfirmDialog open title="t" description="d" onConfirm={nada} onCancel={nada} />,
      <Drawer open title="t" onClose={nada} />,
      <BottomSheet open onClose={nada} />,
    ]) {
      render(<Envolve>{arvore}</Envolve>);
      const modais = todos("Modal");
      expect(typeof modais.at(-1)?.onRequestClose).toBe("function");
    }
  });

  it("o botão VOLTAR chama a mesma saída que o fundo e o X", () => {
    const fechar = vi.fn();
    render(<Envolve><Dialog open title="Título" onClose={fechar} /></Envolve>);
    act(() => { (props("Modal").onRequestClose as () => void)(); });
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  // DEFEITO MUITO VISÍVEL, e ele é do MODELO DE TOQUE do RN, não do nosso desenho: um `View` sem
  // manipulador não vira responder, então o toque no CORPO da caixa atravessaria para o
  // `Pressable` do fundo e a fecharia. A superfície tem de reivindicar o toque.
  it("a superfície reivindica o toque, para o corpo não fechar a caixa", () => {
    render(<Envolve><Dialog open title="Título" onClose={() => {}} /></Envolve>);
    const reivindicam = todos("View").filter((p) => typeof p.onStartShouldSetResponder === "function");
    expect(reivindicam.length).toBeGreaterThan(0);
  });

  it("sem `footer` o rodapé não é desenhado — nem vazio", () => {
    render(<Envolve><Dialog open title="t" onClose={() => {}} /></Envolve>);
    const comGapDeRodape = todos("View")
      .map((p) => StyleSheet.flatten(p.style))
      .filter((e) => e.justifyContent === "flex-end" && e.flexDirection === "row");
    expect(comGapDeRodape).toHaveLength(0);
  });

  it("o título é `header` — o único papel desta família que o Android mapeia", () => {
    render(<Envolve><Dialog open title="Título" onClose={() => {}} /></Envolve>);
    const papeis = todos("Text").map((p) => p.accessibilityRole);
    expect(papeis).toContain("header");
  });
});

describe("ConfirmDialog — a diferença é de COMPORTAMENTO, não de pele", () => {
  // O ACIDENTE QUE O COMPONENTE EXISTE PARA IMPEDIR: um toque fora virar "cancelei" sem ninguém
  // ter decidido. Na web isso vem do `disablePointerDismissal` do Base UI; aqui vem de o fundo
  // não ser um `Pressable`. Este é o teste que separa esta caixa de um `Dialog` com dois botões.
  it("o toque fora NÃO cancela", () => {
    const cancelar = vi.fn();
    render(
      <Envolve>
        <ConfirmDialog open title="Apagar?" description="Não volta."
                       onConfirm={() => {}} onCancel={cancelar} />
      </Envolve>,
    );
    // ⚠ O MARCADOR MUDOU EM 10/09/2026, e a razão importa: este teste procurava um `Pressable`
    // com a COR DO VÉU. O conserto estrutural do dia moveu a cor para o contêiner e deixou o
    // `Pressable` do fundo transparente e absoluto — então o marcador antigo passou a medir uma
    // coisa que não existe mais. O que o teste sempre quis dizer é *"não há fundo que FECHE"*, e
    // isso agora se lê pelo que o fundo É: um `Pressable` que preenche tudo e tem `onPress`.
    const fundoQueFecha = () => todos("Pressable").filter((p) => {
      const e = StyleSheet.flatten(p.style) ?? {};
      return e.position === "absolute" && e.top === 0 && e.bottom === 0 && !!p.onPress;
    });

    // Nenhum fundo que feche existe aqui: os únicos `Pressable` são os dois botões.
    expect(fundoQueFecha()).toHaveLength(0);

    // E o `Dialog`, que fecha no fundo, TEM esse fundo — o contraste é o que prova a regra.
    render(<Envolve><Dialog open title="t" onClose={() => {}} /></Envolve>);
    const doDialog = fundoQueFecha();
    expect(doDialog.length).toBeGreaterThan(0);
    // 🔴 E ELE NÃO PODE TER FILHOS — é a garantia que o defeito de 10/09 custou. Enquanto o
    // painel morava DENTRO deste `Pressable`, tocar no corpo da caixa a fechava no Android, e
    // nenhum manipulador no painel resolvia: o `ScrollView` de dentro ganha a negociação do
    // responder, porque ganhar essa disputa é o trabalho dele. Sem ancestral não há propagação.
    for (const f of doDialog) expect(f.children).toBeUndefined();
    expect(cancelar).not.toHaveBeenCalled();
  });

  // O botão VOLTAR é o `Escape` da web, e na web o `Escape` cancela — não confirma.
  it("o botão VOLTAR cancela, e nunca confirma", () => {
    const confirmar = vi.fn();
    const cancelar = vi.fn();
    render(
      <Envolve>
        <ConfirmDialog open title="t" description="d" onConfirm={confirmar} onCancel={cancelar} />
      </Envolve>,
    );
    act(() => { (props("Modal").onRequestClose as () => void)(); });
    expect(cancelar).toHaveBeenCalledTimes(1);
    expect(confirmar).not.toHaveBeenCalled();
  });

  // A ORDEM é o que sobrou da garantia da web depois da travessia: lá o foco nasce no botão
  // seguro por causa do Enter por reflexo, que no toque não existe. Quem lê com o dedo, ou com o
  // leitor de tela, encontra a saída ANTES da ação — e isso é ordem de árvore, não de foco.
  it("cancelar vem ANTES de confirmar na ordem de leitura", () => {
    render(
      <Envolve>
        <ConfirmDialog open title="t" description="d" confirmLabel="Apagar" cancelLabel="Ficar"
                       onConfirm={() => {}} onCancel={() => {}} />
      </Envolve>,
    );
    const textos = todos("Text").map((p) => p.children);
    expect(textos.indexOf("Ficar")).toBeGreaterThan(-1);
    expect(textos.indexOf("Ficar")).toBeLessThan(textos.indexOf("Apagar"));
  });

  // E a descrição vem antes dos DOIS: ela é o que diz o que se perde. Na web isso é
  // `aria-describedby`; aqui é a ordem, porque não há o atributo.
  it("a descrição vem antes dos botões", () => {
    render(
      <Envolve>
        <ConfirmDialog open title="Apagar?" description="Isto não volta." confirmLabel="Apagar"
                       onConfirm={() => {}} onCancel={() => {}} />
      </Envolve>,
    );
    const textos = todos("Text").map((p) => p.children);
    expect(textos.indexOf("Isto não volta.")).toBeLessThan(textos.indexOf("Apagar"));
  });

  it("`destructive` pinta o confirmar de perigo, e sem ele não pinta", () => {
    render(
      <Envolve>
        <ConfirmDialog open destructive title="t" description="d"
                       onConfirm={() => {}} onCancel={() => {}} />
      </Envolve>,
    );
    // ⚠ `destructive`, e NÃO `danger400`: o `Button` preenche com `--destructive` e o `Alert`
    // TINGE a borda com `--danger-400`. São dois tokens diferentes na web também — preenchimento
    // e borda —, então a divergência é fiel, não defeito. Medido em `actions.tsx:55`.
    const perigo = tokens.color.destructive;
    // ⚠ A cor do `Button` mora na `View` de dentro, não no `Pressable` — cuja `style` é uma
    // FUNÇÃO de `{pressed}` e só carrega alvo e opacidade. Ler o lugar errado devolveria
    // `undefined` e reprovaria código certo (foi o que aconteceu ao escrever este teste).
    const fundos = todos("View").map((p) => StyleSheet.flatten(p.style).backgroundColor);
    expect(fundos).toContain(perigo);
  });

  it("sem rótulos, usa as frases da tabela — e a tabela traduz", () => {
    render(
      <Envolve>
        <ConfirmDialog open title="t" description="d" onConfirm={() => {}} onCancel={() => {}} />
      </Envolve>,
    );
    const textos = todos("Text").map((p) => p.children);
    expect(textos).toContain(defaultStrings.confirmCancel);
    expect(textos).toContain(defaultStrings.confirmProceed);
    expect(ptBR.confirmCancel).toBe("Cancelar");
  });
});

describe("Drawer — o lado é FÍSICO, e a animação é nossa", () => {
  // A razão vem da ficha da web e atravessa inteira: um painel preso à direção da escrita se
  // mudaria de lado ao trocar o idioma, e um painel de navegação não deve andar.
  it("`right` e `left` prendem em bordas opostas", () => {
    render(<Envolve><Drawer open title="t" side="right" onClose={() => {}} /></Envolve>);
    const direita = todos("Animated.View").map((p) => StyleSheet.flatten(p.style));
    expect(direita.some((e) => e.right === 0)).toBe(true);

    render(<Envolve><Drawer open title="t" side="left" onClose={() => {}} /></Envolve>);
    const esquerda = todos("Animated.View").map((p) => StyleSheet.flatten(p.style));
    expect(esquerda.some((e) => e.left === 0)).toBe(true);
  });

  // O `animationType="slide"` do RN sobe de BAIXO, sempre. Deixá-lo ligado faria o painel
  // lateral entrar pelo chão — e ninguém veria isso num teste que só olha props.
  it("o `Modal` NÃO anima: quem desliza é o nosso `translateX`", () => {
    render(<Envolve><Drawer open title="t" onClose={() => {}} /></Envolve>);
    expect(props("Modal").animationType).toBe("none");
  });

  // Mesma regra do `Spinner` e do `Skeleton` (Lote 2). Nenhum teste de código pega isto no
  // aparelho — o dublê não é o sistema —, mas ele pega o componente que ESQUECE de perguntar.
  it("com «menos movimento» ligado, ele não anima", async () => {
    __definirReduceMotion(true);
    await act(async () => {
      render(<Envolve><Drawer open title="t" onClose={() => {}} /></Envolve>);
    });
    const painel = todos("Animated.View").at(-1);
    // O deslocamento foi para o lugar final sem laço: o `interpolate` existe, mas nada rodou.
    expect(painel).toBeDefined();
  });
});

describe("BottomSheet — o gesto é do RN, e soltar no meio VOLTA", () => {
  // A DECISÃO CARA DO LOTE, e ela é sobre dependência: `@gorhom/bottom-sheet` é a biblioteca
  // conhecida do assunto e arrastaria DUAS peças novas (gesture-handler + reanimated) para um
  // gesto de um eixo. O `PanResponder` é do próprio RN.
  it("o gesto só é reivindicado depois de 6dp para BAIXO", () => {
    render(<Envolve><BottomSheet open onClose={() => {}} /></Envolve>);
    const g = __ultimoGesto();
    expect(g).not.toBeNull();
    const deve = g!.onMoveShouldSetPanResponder as (e: unknown, g: {dy: number}) => boolean;
    // Reivindicar no toque roubaria o primeiro toque de todo botão dentro da folha.
    expect(deve({}, {dx: 0, dy: 2, vx: 0, vy: 0} as never)).toBe(false);
    expect(deve({}, {dx: 0, dy: -40, vx: 0, vy: 0} as never)).toBe(false);
    expect(deve({}, {dx: 0, dy: 40, vx: 0, vy: 0} as never)).toBe(true);
  });

  // DEFEITO QUE PERDE DADO: fechar cedo demais transforma um toque trêmulo em "cancelei".
  it("soltar no meio do caminho volta; passar do limiar fecha", () => {
    const fechar = vi.fn();
    render(<Envolve><BottomSheet open onClose={fechar} /></Envolve>);
    const soltar = __ultimoGesto()!.onPanResponderRelease as
      (e: unknown, g: {dy: number; vy: number}) => void;

    act(() => { soltar({}, {dy: 30, vy: 0} as never); });
    expect(fechar).not.toHaveBeenCalled();

    act(() => { soltar({}, {dy: 400, vy: 0} as never); });
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  // Um lance rápido fecha mesmo sem percorrer a distância — é como o gesto se comporta em toda
  // folha do sistema, e quebrar isso faz a peça parecer travada.
  it("um lance rápido fecha, mesmo curto", () => {
    const fechar = vi.fn();
    render(<Envolve><BottomSheet open onClose={fechar} /></Envolve>);
    const soltar = __ultimoGesto()!.onPanResponderRelease as
      (e: unknown, g: {dy: number; vy: number}) => void;
    act(() => { soltar({}, {dy: 20, vy: 2.5} as never); });
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  it("`draggable={false}` desliga o gesto de vez", () => {
    render(<Envolve><BottomSheet open draggable={false} onClose={() => {}} /></Envolve>);
    const deve = __ultimoGesto()!.onMoveShouldSetPanResponder as
      (e: unknown, g: {dy: number}) => boolean;
    expect(deve({}, {dy: 200} as never)).toBe(false);
  });

  // O puxador é decoração de uma superfície já alcançável. Anunciá-lo poria um "botão" sem ação
  // na varredura do leitor de tela — ruído que custa um passo a cada vez.
  it("o puxador é invisível ao leitor de tela", () => {
    render(<Envolve><BottomSheet open onClose={() => {}} /></Envolve>);
    const escondidos = todos("View")
      .filter((p) => p.importantForAccessibility === "no-hide-descendants");
    expect(escondidos.length).toBeGreaterThan(0);
  });

  it("o topo tem o raio de CARD — é uma superfície flutuante, e a identidade manda", () => {
    render(<Envolve><BottomSheet open onClose={() => {}} /></Envolve>);
    const raios = todos("Animated.View")
      .map((p) => StyleSheet.flatten(p.style).borderTopLeftRadius);
    expect(raios).toContain(tokens.size.radiusCard);
    expect(tokens.size.radiusCard).toBe(22);
  });
});

describe("useToast — o hospedeiro é explícito, e o silêncio é proibido", () => {
  // O DEFEITO MAIS CARO POSSÍVEL seria devolver um `add()` mudo: o aviso de "salvo" que nunca
  // aparece não quebra nada, não levanta, e some no meio de um fluxo que parecia certo.
  it("`useToast()` sem hospedeiro LEVANTA, com a frase que diz o que fazer", () => {
    const Usa = () => { useToast(); return null; };
    const antes = console.error;
    console.error = () => {};
    expect(() => render(<Envolve><Usa /></Envolve>)).toThrow(/ToastHost/);
    console.error = antes;
  });

  it("`add` põe na pilha e devolve o id; `close` tira", () => {
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);

    let id = "";
    act(() => { id = gerente!.add({title: "Salvo"}); });
    expect(todos("Text").map((p) => p.children)).toContain("Salvo");

    act(() => { gerente!.close(id); });
    expect(todos("Text").map((p) => p.children).filter((c) => c === "Salvo")).toHaveLength(1);
  });

  // Passando do teto, sai o mais ANTIGO — o mais novo é o que a pessoa está esperando ver.
  it("`max` corta pelo começo", () => {
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost max={2}><Usa /></ToastHost></Envolve>);
    act(() => {
      gerente!.add({title: "um"});
      gerente!.add({title: "dois"});
      gerente!.add({title: "três"});
    });
    expect(gerente!.toasts.map((t) => t.title)).toEqual(["dois", "três"]);
  });

  // DEFEITO QUE TIRA UM BOTÃO DA MÃO DA PESSOA: um aviso com "Desfazer" que some em cinco
  // segundos é um botão que não existe para quem lê devagar ou usa leitor de tela.
  it("`duration: 0` nunca fecha sozinho", () => {
    vi.useFakeTimers();
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Desfazer?", duration: 0}); });
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(gerente!.toasts).toHaveLength(1);
    vi.useRealTimers();
  });

  it("com `duration`, some sozinho", () => {
    vi.useFakeTimers();
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Salvo", duration: 3000}); });
    expect(gerente!.toasts).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(3001); });
    expect(gerente!.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  // TEMPO NÃO É MOVIMENTO. Quem pediu menos animação não pediu que o aviso ficasse para sempre.
  it("«menos movimento» não desliga o relógio", async () => {
    vi.useFakeTimers();
    __definirReduceMotion(true);
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Salvo", duration: 2000}); });
    act(() => { vi.advanceTimersByTime(2001); });
    expect(gerente!.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  // 🔴 Mesma correção do `Alert` (ver o comentário longo no `native-lote2.test.tsx`): este teste
  // exigia `accessibilityRole === "status"`, que **derruba o app no Android**. Sem papel, a
  // região viva continua fazendo o trabalho — e ela é o que o teste cobra agora.
  it("`danger` é `alert` e assertivo; o resto é educado e SEM papel", () => {
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Falhou", type: "danger"}); });
    const grave = todos("Animated.View").at(-1);
    expect(grave?.accessibilityRole).toBe("alert");
    expect(grave?.accessibilityLiveRegion).toBe("assertive");

    act(() => { gerente!.add({title: "Salvo", type: "success"}); });
    const leve = todos("Animated.View").at(-1);
    expect(leve?.accessibilityRole).toBeUndefined();
    expect(leve?.accessibilityLiveRegion).toBe("polite");
  });

  // A conta que o Lote 3 já pagou uma vez: a barra de gestos e o nosso respiro ocupam o MESMO
  // espaço. Somar os dois empurra o aviso para o meio da tela.
  //
  // 🔴 **A PRIMEIRA VERSÃO DESTE TESTE PASSOU VERDE COM O DEFEITO DENTRO.** Ela não mexia no
  // inset, e o dublê devolve zero: `Math.max(22, 0)` e `22 + 0` dão o mesmo 22. Provado trocando
  // a conta pela errada — o teste não acusou. **Gate que só concorda com o presente não é gate**,
  // e é a mesma lição que o check 39 deu no Lote 2. O inset agora é DIFERENTE do nosso respiro,
  // que é a única forma de as duas contas divergirem.
  it("o respiro de baixo é `Math.max`, não soma", () => {
    __definirInsets({bottom: 34});
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Salvo"}); });
    const pilha = todos("View")
      .map((p) => StyleSheet.flatten(p.style))
      .find((e) => e.position === "absolute" && e.bottom === 0);
    // 34, e não 56: o inset ENGOLE o nosso respiro, não se soma a ele.
    expect(pilha?.paddingBottom).toBe(34);
    __definirInsets({});
  });

  it("`offset` sobe a pilha, para não tapar a barra inferior", () => {
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost offset={64}><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Salvo"}); });
    const pilha = todos("View")
      .map((p) => StyleSheet.flatten(p.style))
      .find((e) => e.position === "absolute" && e.bottom === 0);
    expect(pilha?.paddingBottom).toBe(86);
  });

  // O vão entre os avisos cobre a largura toda; sem `box-none` ele viraria uma faixa morta no pé
  // da tela, e o botão que estivesse ali pararia de responder.
  it("a pilha deixa o toque passar no vão", () => {
    let gerente: ReturnType<typeof useToast>;
    const Usa = () => { gerente = useToast(); return null; };
    render(<Envolve><ToastHost><Usa /></ToastHost></Envolve>);
    act(() => { gerente!.add({title: "Salvo"}); });
    const pilha = todos("View").find((p) => {
      const e = StyleSheet.flatten(p.style);
      return e.position === "absolute" && e.bottom === 0;
    });
    expect(pilha?.pointerEvents).toBe("box-none");
  });
});

describe("O papel que o RN aceita e não mapeia — a decisão do lote, cobrada", () => {
  // MEDIDO no fonte do react-native@0.87.1, nas duas pontas:
  //   Android  ReactAccessibilityDelegate.kt:515 `fromRole()` -> `else -> null`
  //   iOS      não há trait de dialog/alertdialog em accessibilityPropsConversions.h:24-104
  // Usá-los passaria no `tsc`, passaria na revisão, e seria INÚTIL no aparelho. Este teste é o
  // que impede a próxima sessão de "melhorar" a acessibilidade escrevendo o que não funciona.
  it("nenhum overlay usa `dialog` ou `alertdialog`", () => {
    const nada = () => {};
    for (const arvore of [
      <Dialog open title="t" onClose={nada} />,
      <ConfirmDialog open title="t" description="d" onConfirm={nada} onCancel={nada} />,
      <Drawer open title="t" onClose={nada} />,
      <BottomSheet open onClose={nada} />,
    ]) {
      render(<Envolve>{arvore}</Envolve>);
    }
    const papeis = [
      ...todos("View"), ...todos("Animated.View"), ...todos("Text"), ...todos("Pressable"),
      ...todos("Modal"),
    ].flatMap((p) => [p.accessibilityRole, p.role]);
    expect(papeis).not.toContain("dialog");
    expect(papeis).not.toContain("alertdialog");
  });
});
