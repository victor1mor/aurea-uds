// 0.32.0, passo 12 · as contas da família de cor (ADR-0069): o texto hex, as conversões, a pintura e o nome da
// cor. As contas são fórmulas padrão; o teste as amarra em cores de valor conhecido.
import {
  areaFill, colorName, contrastingInk, relativeLuminance, hsbToRgb, hslToRgb, hueTrackBackground, hueTrackFill, normalizeHex, parseHex, pureHue,
  rgbToHsb, rgbToHsl, toHex,
} from "../../packages/react/src/color";
import {defaultStrings as en, ptBR as pt} from "../../packages/react/src/pure";
const nome = (hex: string, s = en) => colorName(parseHex(hex)!, s);

describe("color (as contas da família de cor)", () => {
  test("o texto hex: 3 ou 6 dígitos, com ou sem #, qualquer caixa; o resto é null", () => {
    expect(parseHex("#0485F7")).toEqual({r: 4, g: 133, b: 247});
    expect(parseHex("0485f7")).toEqual({r: 4, g: 133, b: 247});
    expect(parseHex(" #abc ")).toEqual({r: 170, g: 187, b: 204});
    for (const ruim of ["", "#12", "#12345", "red", "#ggg000", "rgb(1,2,3)", "#0485F7FF"]) expect(parseHex(ruim)).toBeNull();
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex("nada")).toBeNull();
  });

  // O defeito do mercado (alerta de 08/09/2026 numa biblioteca de cor): texto malformado e ENORME, lento para recusar.
  test("texto enorme é recusado de cara, sem passar pela expressão", () => {
    const enorme = "#" + "0".repeat(1_000_000);
    const t0 = performance.now();
    expect(parseHex(enorme)).toBeNull();
    expect(performance.now() - t0).toBeLessThan(5);
  });

  test("as conversões vão e voltam (hsb e hsl), nas cores de valor conhecido", () => {
    expect(rgbToHsb({r: 255, g: 0, b: 0})).toEqual({h: 0, s: 1, b: 1});
    expect(rgbToHsl({r: 0, g: 0, b: 255})).toEqual({h: 240, s: 1, l: 0.5});
    expect(toHex(hsbToRgb({h: 120, s: 1, b: 1}))).toBe("#00ff00");
    expect(toHex(hslToRgb({h: 60, s: 1, l: 0.5}))).toBe("#ffff00");
    for (const hex of ["#0485f7", "#826202", "#1c1b19", "#f0c200", "#7a5c00", "#ffffff", "#000000", "#808080"]) {
      const rgb = parseHex(hex)!;
      expect(toHex(hsbToRgb(rgbToHsb(rgb)))).toBe(hex);
      expect(toHex(hslToRgb(rgbToHsl(rgb)))).toBe(hex);
    }
  });

  test("a tinta que contrasta: a conta da WCAG, e não um palpite de cor clara", () => {
    expect(relativeLuminance({r: 255, g: 255, b: 255})).toBeCloseTo(1, 5);
    expect(relativeLuminance({r: 0, g: 0, b: 0})).toBe(0);
    expect(contrastingInk(parseHex("#f0c200")!)).toBe("dark"); // o amarelo da Aurea: luminância ~0,57
    expect(contrastingInk(parseHex("#000080")!)).toBe("light");
    expect(contrastingInk(parseHex("#ff0000")!)).toBe("dark"); // 5,25:1 com preto contra 4,00:1 com branco
  });

  test("a pintura: a área vai do branco à cor pura e do claro ao preto; a trilha dá a volta inteira", () => {
    expect(areaFill(120)).toBe("linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, #00ff00)");
    expect(areaFill(120, true)).toMatch(/linear-gradient\(to left, #fff, #00ff00\)$/);
    expect(hueTrackFill()).toBe("linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)");
    expect(hueTrackFill("to left")).toMatch(/^linear-gradient\(to left, #ff0000/);
    expect(hueTrackBackground("to top")).toMatch(/^linear-gradient\(to top, .*\) no-repeat content-box border-box #ff0000$/);
    expect(pureHue(240)).toBe("#0000ff");
  });

  test("o nome da cor, em inglês e em português (a ordem das palavras é a da língua)", () => {
    expect(nome("#ff0000")).toBe("vivid red");
    expect(nome("#ff0000", pt)).toBe("vermelho vivo");
    expect(nome("#800000")).toBe("dark red");
    expect(nome("#800000", pt)).toBe("vermelho escuro");
    expect(nome("#0485f7")).toBe("vivid blue");
    expect(nome("#f0c200")).toBe("vivid yellow");
    expect(nome("#ffffff")).toBe("white");
    expect(nome("#000000", pt)).toBe("preto");
    expect(nome("#808080")).toBe("gray");
    expect(nome("#1c1b19")).toBe("very dark gray");
    expect(nome("#8b4513")).toBe("brown");
    expect(nome("#6b8e23", pt)).toBe("verde escuro");
  });

  // O defeito do primeiro desenho (visto antes de rodar): pela saturação do HSL, o rosa pastel saía "vivid pink" —
  // no HSL os tons pastel têm saturação 1. A força ("vivo", "pálido") vem do HSB.
  test("tom pastel é pálido, e não vivo", () => {
    expect(nome("#ffc0cb")).toBe("pale pink");
    expect(nome("#ffc0cb", pt)).toBe("rosa pálido");
    expect(nome("#add8e6")).toBe("pale blue");
  });

  test("a beirada do ciano: o ciano puro e o turquesa são ciano; o azul-céu é azul", () => {
    expect(nome("#00ffff")).toBe("vivid cyan");
    expect(nome("#40e0d0")).toBe("cyan");
    expect(nome("#87ceeb")).toBe("light blue");
  });
});
