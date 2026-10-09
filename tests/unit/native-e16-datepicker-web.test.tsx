// E16 (09/10/2026) · o `DatePicker` do nativo NO NAVEGADOR (`react-native-web`). Achado do app:
// tocar no campo não abria nada. A biblioteca de data não tem versão web — o arquivo genérico dela
// devolve `null` e só avisa no console —, e o `DatePicker` montava ali o seletor do iPhone.
// O conserto: o `<input type="date">` do navegador, invisível e por cima do nosso gatilho. O que se
// prova aqui é o CONTRATO (o campo existe, recebe o toque, devolve a data certa e não mexe no resto);
// o seletor que o navegador abre é dele, e foi visto na bancada do `react-native-web`.
// Provado contra o defeito: na 0.26.0 o navegador não tem campo nenhum (os testes de web reprovam), e
// o toque monta o seletor da biblioteca, que lá não desenha nada.
import {render, fireEvent} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {__definirPlataforma, __instancias} from "./native-stubs/react-native";
import {__aberturas, __limparSeletor} from "./native-stubs/datetimepicker";
import {AureaProvider, Field, criarRegistroDeIcones} from "../../packages/native/src/index.js";
import {DatePicker} from "../../packages/native/src/sistema.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"calendar": Glifo});
const Envolve = ({children, theme = "dark"}: {children: React.ReactNode; theme?: "dark" | "light"}) =>
  <AureaProvider theme={theme} icons={ICONES}>{children}</AureaProvider>;
const campo = (c: HTMLElement) => c.querySelector("input") as HTMLInputElement | null;

const showPicker = vi.fn();
beforeEach(() => {
  __limparSeletor();
  __definirPlataforma("web");
  showPicker.mockReset();
  (HTMLInputElement.prototype as unknown as {showPicker: () => void}).showPicker = showPicker;
});
afterEach(() => {
  __definirPlataforma("android");
  delete (HTMLInputElement.prototype as unknown as {showPicker?: () => void}).showPicker;
});

describe("E16 · no navegador, o campo de data do navegador por cima do nosso gatilho", () => {
  it("existe um campo de data, e o toque não monta o seletor da biblioteca", () => {
    const {container} = render(<Envolve><DatePicker /></Envolve>);
    const c = campo(container);
    expect(c, "o campo do navegador").not.toBeNull();
    expect(c!.type).toBe("date");
    fireEvent.click(c!);
    expect(__aberturas, "o seletor da biblioteca (que no navegador é nulo)").toHaveLength(0);
  });

  it("o clique abre o seletor do navegador (showPicker), e uma recusa dele não quebra nada", () => {
    const {container} = render(<Envolve><DatePicker /></Envolve>);
    fireEvent.click(campo(container)!);
    expect(showPicker).toHaveBeenCalledTimes(1);
    showPicker.mockImplementation(() => { throw new DOMException("bloqueado", "NotAllowedError"); });
    expect(() => fireEvent.click(campo(container)!)).not.toThrow();
  });

  it("sem showPicker (o Safari do iPhone), o clique não quebra: o toque no campo já abre", () => {
    delete (HTMLInputElement.prototype as unknown as {showPicker?: () => void}).showPicker;
    const {container} = render(<Envolve><DatePicker /></Envolve>);
    expect(() => fireEvent.click(campo(container)!)).not.toThrow();
  });

  it("o campo cobre o gatilho inteiro e é invisível; o gatilho fica só como desenho", () => {
    const {container} = render(<Envolve><DatePicker testID="d" /></Envolve>);
    const s = campo(container)!.style;
    expect([s.position, s.top, s.left, s.width, s.height, s.opacity]).toEqual(["absolute", "0px", "0px", "100%", "100%", "0"]);
    const gatilho = __instancias("Pressable").find((p) => p.testID === "d")!;
    expect(gatilho.onPress, "o toque é do campo, não do gatilho").toBeUndefined();
    expect(gatilho.focusable, "um ponto de Tab só: o campo").toBe(false);
    expect(gatilho.accessibilityRole, "o gatilho não se anuncia como botão").toBeUndefined();
  });

  // Dentro de uma página de outro endereço (moldura), o Chrome recusa o `showPicker()` — medido na
  // bancada: "called from cross-origin iframe". A saída é o ícone do próprio campo esticado sobre
  // ele: o clique é no ícone, e o navegador abre sem pedir licença. Medido na bancada: com a regra,
  // o seletor abre dentro da moldura; sem ela, não. Aqui se cobra que a regra e a marca existam.
  it("a regra do ícone esticado existe e pega o campo (para abrir também dentro de moldura)", () => {
    const {container} = render(<Envolve><DatePicker /></Envolve>);
    expect(campo(container)!.hasAttribute("data-aurea-campo-data")).toBe(true);
    const regra = [...document.querySelectorAll("style")].map((e) => e.textContent ?? "").join("\n");
    expect(regra).toMatch(/input\[data-aurea-campo-data\]::-webkit-calendar-picker-indicator\{[^}]*position:absolute[^}]*width:100%[^}]*height:100%/);
  });

  it("o valor, o mínimo e o máximo vão no formato do campo, no fuso local", () => {
    const {container} = render(<Envolve><DatePicker value={new Date(2026, 8, 8, 14, 30)}
      minimumDate={new Date(2026, 0, 1)} maximumDate={new Date(2026, 11, 31)} /></Envolve>);
    const c = campo(container)!;
    expect(c.value).toBe("2026-09-08");
    expect(c.min).toBe("2026-01-01");
    expect(c.max).toBe("2026-12-31");
  });

  it("escolher uma data chama onChange com ela, mantendo a hora do valor", () => {
    const mudar = vi.fn();
    const {container} = render(<Envolve><DatePicker value={new Date(2026, 8, 8, 14, 30)} onChange={mudar} /></Envolve>);
    fireEvent.change(campo(container)!, {target: {value: "2026-10-05"}});
    expect(mudar).toHaveBeenCalledTimes(1);
    const d: Date = mudar.mock.calls[0][0];
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 9, 5, 14, 30]);
  });

  it("apagar o campo NÃO grava data", () => {
    const mudar = vi.fn();
    const {container} = render(<Envolve><DatePicker value={new Date(2026, 8, 8)} onChange={mudar} /></Envolve>);
    fireEvent.change(campo(container)!, {target: {value: ""}});
    expect(mudar).not.toHaveBeenCalled();
  });

  it("mode=time: campo de hora, e escolher a hora mantém a data", () => {
    const mudar = vi.fn();
    const {container} = render(<Envolve><DatePicker mode="time" value={new Date(2026, 8, 8, 9, 0)} onChange={mudar} /></Envolve>);
    const c = campo(container)!;
    expect(c.type).toBe("time");
    expect(c.value).toBe("09:00");
    fireEvent.change(c, {target: {value: "18:45"}});
    const d: Date = mudar.mock.calls[0][0];
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 8, 8, 18, 45]);
  });

  it("o nome e o erro vêm do Field; inativo desliga o campo; inválido é anunciado", () => {
    const {container} = render(<Envolve><Field label="Validade da CNH" error="Data vencida"><DatePicker /></Field></Envolve>);
    const c = campo(container)!;
    expect(c.getAttribute("aria-label")).toBe("Validade da CNH");
    expect(c.getAttribute("aria-invalid")).toBe("true");
    expect(c.getAttribute("aria-description"), "o erro do Field chega ao leitor de tela").toBe("Data vencida");
    const {container: c2} = render(<Envolve><DatePicker disabled /></Envolve>);
    expect(campo(c2)!.disabled).toBe(true);
  });

  it("o calendário do navegador segue o tema da Aurea", () => {
    const {container} = render(<Envolve theme="light"><DatePicker /></Envolve>);
    expect(campo(container)!.style.colorScheme).toBe("light");
    const {container: c2} = render(<Envolve theme="dark"><DatePicker /></Envolve>);
    expect(campo(c2)!.style.colorScheme).toBe("dark");
  });
});

describe("E16 · fora do navegador, nada muda", () => {
  it("no Android e no iPhone não há campo do navegador, e o toque segue o caminho de antes", () => {
    for (const plataforma of ["android", "ios"] as const) {
      __limparSeletor();
      __definirPlataforma(plataforma);
      const {container} = render(<Envolve><DatePicker testID={plataforma} /></Envolve>);
      expect(campo(container)).toBeNull();
      const gatilho = __instancias("Pressable").filter((p) => p.testID === plataforma).at(-1)!;
      expect(typeof gatilho.onPress).toBe("function");
      expect(gatilho.accessibilityRole).toBe("button");
    }
  });
});
