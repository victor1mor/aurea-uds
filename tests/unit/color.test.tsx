// 0.32.0, passo 12 · as contas da família de cor (ADR-0069): o texto (hex, rgb, hsl, hsb, com alfa), as conversões,
// os canais nos três espaços com as faixas da referência, a pintura da trilha e da área, e o nome da cor. As contas
// são fórmulas padrão; o teste as amarra em cores de valor conhecido.
import {
  areaBackground, channelRange, colorName, contrastingInk, corToHex, formatChannel, getChannel, hsbToRgb, hslToRgb,
  parseColor, parseHex, pureHue, relativeLuminance, rgbToHsb, rgbToHsl, setChannel, spaceOf, toHex, trackBackground,
  normalizeHex, type Cor,
} from "../../packages/react/src/color";
import {defaultStrings as en, ptBR as pt} from "../../packages/react/src/pure";
const nome = (hex: string, s = en) => colorName(parseHex(hex)!, s);
const cor = (texto: string) => parseColor(texto)!;

describe("color (as contas da família de cor)", () => {
  test("o texto hex: 3, 4, 6 ou 8 dígitos, com ou sem #, qualquer caixa; o resto é null", () => {
    expect(parseHex("#0485F7")).toEqual({r: 4, g: 133, b: 247, a: 1});
    expect(parseHex("0485f7")).toEqual({r: 4, g: 133, b: 247, a: 1});
    expect(parseHex(" #abc ")).toEqual({r: 170, g: 187, b: 204, a: 1});
    expect(parseHex("#0485f780")!.a).toBeCloseTo(128 / 255, 5);
    expect(parseHex("#abc8")!.a).toBeCloseTo(0x88 / 255, 5);
    for (const ruim of ["", "#12", "#12345", "red", "#ggg000", "rgb(1,2,3)", "#0485F7FFF"]) expect(parseHex(ruim)).toBeNull();
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex("nada")).toBeNull();
  });

  test("o hex de saída: 6 dígitos opaca, 8 com transparência", () => {
    expect(toHex({r: 4, g: 133, b: 247})).toBe("#0485f7");
    expect(toHex({r: 4, g: 133, b: 247, a: 1})).toBe("#0485f7");
    expect(toHex({r: 4, g: 133, b: 247, a: 0.5})).toBe("#0485f780");
    expect(corToHex(cor("rgba(255, 0, 0, 0.25)"))).toBe("#ff000040");
  });

  test("as funções do CSS na entrada: rgb, hsl e hsb, com vírgula ou espaço, alfa por , ou /", () => {
    expect(corToHex(cor("rgb(4, 133, 247)"))).toBe("#0485f7");
    expect(corToHex(cor("rgb(4 133 247 / 50%)"))).toBe("#0485f780");
    expect(corToHex(cor("hsl(0, 100%, 50%)"))).toBe("#ff0000");
    expect(corToHex(cor("hsla(120deg, 100%, 25%, 0.5)"))).toBe("#00800080");
    expect(corToHex(cor("hsb(240, 100%, 100%)"))).toBe("#0000ff");
    // O matiz de hsl()/hsb() cinza fica (o hex o perderia).
    expect(cor("hsl(200, 0%, 50%)").h).toBe(200);
    for (const ruim of ["rgb(256, 0, 0)", "hsl(0, 101%, 50%)", "rgb(1,2)", "rgb(a,b,c)", "cor"]) expect(parseColor(ruim)).toBeNull();
  });

  // O defeito do mercado (alerta de 08/09/2026 numa biblioteca de cor): texto malformado e ENORME, lento para recusar.
  test("texto enorme é recusado de cara, sem passar pela expressão", () => {
    for (const enorme of ["#" + "0".repeat(1_000_000), "rgb(" + "1,".repeat(500_000) + ")"]) {
      const t0 = performance.now();
      expect(parseColor(enorme)).toBeNull();
      expect(performance.now() - t0).toBeLessThan(5);
    }
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

  test("as faixas dos canais são as da referência", () => {
    expect(channelRange("hue")).toEqual({min: 0, max: 360, step: 1, page: 15});
    expect(channelRange("lightness")).toEqual({min: 0, max: 100, step: 1, page: 10});
    expect(channelRange("red")).toEqual({min: 0, max: 255, step: 1, page: 17});
    expect(channelRange("alpha")).toEqual({min: 0, max: 1, step: 0.01, page: 0.1});
    expect([spaceOf("lightness"), spaceOf("brightness"), spaceOf("green"), spaceOf("saturation", "hsl"), spaceOf("hue", "rgb")])
      .toEqual(["hsl", "hsb", "rgb", "hsl", "hsb"]);
  });

  test("ler e trocar cada canal, nos três espaços, com o alfa à parte", () => {
    const azul = cor("#0485f7");
    expect(Math.round(getChannel(azul, "hue"))).toBe(208);
    expect(Math.round(getChannel(azul, "saturation", "hsb"))).toBe(98);
    expect(Math.round(getChannel(azul, "saturation", "hsl"))).toBe(97);
    expect(Math.round(getChannel(azul, "lightness"))).toBe(49);
    expect(getChannel(azul, "blue")).toBeCloseTo(247, 0);
    expect(corToHex(setChannel(azul, "red", 255))).toBe("#ff85f7");
    expect(corToHex(setChannel(cor("hsl(0, 100%, 50%)"), "lightness", 25))).toBe("#800000");
    expect(corToHex(setChannel(azul, "alpha", 0.5))).toBe("#0485f780");
    expect(setChannel(azul, "lightness", 200).b).toBe(1); // limitado à faixa: luminosidade 100 = branco
  });

  // O cinza não tem matiz: trocar um canal que leva ao cinza não pode jogar o matiz fora.
  test("no cinza, o matiz e a saturação de antes ficam", () => {
    const azul = cor("#0485f7");
    const cinza = setChannel(azul, "saturation", 0, "hsb");
    expect(cinza.h).toBeCloseTo(azul.h, 5);
    const preto = setChannel(azul, "brightness", 0);
    expect(preto.s).toBeCloseTo(azul.s, 5);
    // Pelo RGB, num passo só: (128, 128, 200) tem matiz 240; pôr o azul em 128 dá o cinza, e o 240 fica.
    const quase = cor("rgb(128, 128, 200)");
    const viaRgb = setChannel(quase, "blue", 128);
    expect(corToHex(viaRgb)).toBe("#808080");
    expect(viaRgb.h).toBeCloseTo(240, 5);
  });

  test("o valor do canal escrito: graus, por cento, número, alfa em por cento", () => {
    expect([formatChannel("hue", 208.4), formatChannel("saturation", 97.6), formatChannel("red", 255), formatChannel("alpha", 0.5)])
      .toEqual(["208°", "98%", "255", "50%"]);
  });

  test("a tinta que contrasta: a conta da WCAG, e não um palpite de cor clara", () => {
    expect(relativeLuminance({r: 255, g: 255, b: 255})).toBeCloseTo(1, 5);
    expect(relativeLuminance({r: 0, g: 0, b: 0})).toBe(0);
    expect(contrastingInk(parseHex("#f0c200")!)).toBe("dark"); // o amarelo da Aurea: luminância ~0,57
    expect(contrastingInk(parseHex("#000080")!)).toBe("light");
    expect(contrastingInk(parseHex("#ff0000")!)).toBe("dark"); // 5,25:1 com preto contra 4,00:1 com branco
  });

  // As paradas começam e terminam na FOLGA da trilha (`--slider-cap`): o pino no mínimo fica sobre a cor do mínimo.
  test("a trilha de cada canal: as pontas certas, as paradas na folga, a luminosidade com o meio", () => {
    const azul = cor("#0485f7");
    const matiz = trackBackground(azul, "hue");
    expect(matiz).toMatch(/^linear-gradient\(to right, #ff0000 calc\(var\(--slider-cap, 0px\) \+ \(100% - 2 \* var\(--slider-cap, 0px\)\) \* 0\),/);
    expect(matiz.match(/#[0-9a-f]{6} calc/g)).toHaveLength(7);
    expect(trackBackground(azul, "red", "rgb", "to left")).toMatch(/^linear-gradient\(to left, #0085f7 .*#ff85f7 /);
    expect(trackBackground(cor("hsl(0, 100%, 50%)"), "lightness").match(/#[0-9a-f]{6} calc/g)!.map((p) => p.slice(0, 7)))
      .toEqual(["#000000", "#ff0000", "#ffffff"]);
    expect(trackBackground(azul, "alpha", "hsb", "to top")).toMatch(/^linear-gradient\(to top, #0485f700 .*#0485f7 /);
    expect(pureHue(240)).toBe("#0000ff");
  });

  test("a área: HSB e HSL em camadas com a cor pura embaixo; RGB em três camadas somadas (screen)", () => {
    const verde = cor("hsb(120, 100%, 100%)");
    expect(areaBackground(verde, "hsb", "saturation", "brightness").background)
      .toBe("linear-gradient(to top, #000, transparent), linear-gradient(to right, #ffffff, transparent), #00ff00");
    expect(areaBackground(verde, "hsb", "saturation", "brightness", true).background).toContain("to left, #ffffff");
    const hsl = areaBackground(verde, "hsl", "saturation", "lightness").background;
    expect(hsl).toBe("linear-gradient(to top, #000, transparent, #fff), linear-gradient(to right, #808080, transparent), #00ff00");
    const rgb = areaBackground(cor("rgb(10, 20, 30)"), "rgb", "red", "green");
    expect(rgb).toEqual({background: "linear-gradient(to right, #000000, #ff0000), linear-gradient(to top, #000000, #00ff00), #00001e", blend: "screen"});
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

  test("a cor de dentro leva o alfa", () => {
    const c: Cor = cor("#0485f780");
    expect(c.a).toBeCloseTo(0.5, 2);
    expect(corToHex({...c, a: 1})).toBe("#0485f7");
  });
});
