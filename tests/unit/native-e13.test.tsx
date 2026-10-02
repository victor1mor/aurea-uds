// E13 (02/10/2026) · a Aurea ligava `useNativeDriver: true` SEMPRE, em oito pontos de cinco arquivos.
// No navegador não existe o motor nativo de animação, e o React Native Web avisa no console
// *"`useNativeDriver` is not supported"* a cada `true` que recebe (0.21.3,
// `NativeAnimatedHelper.js:429`). O pedido: `useNativeDriver: Platform.OS !== "web"`.
//
// Duas travas, porque duas coisas podem voltar:
//   1. o que cada peça MANDA para o `Animated.timing`, no aparelho e no navegador;
//   2. o `useNativeDriver: true` escrito à mão de novo, numa peça nova que esta lista não conhece.
//
// Provado contra o defeito: com o código de antes, as sete peças do navegador mandam `true` e a
// trava do código-fonte acha os oito pontos.
import {render, act} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {readFileSync, readdirSync} from "node:fs";
import {resolve} from "node:path";
import {
  __configsDeAnimacao, __definirPlataforma, __limpar, __ultimoGesto,
} from "./native-stubs/react-native";
import {
  AureaProvider, BottomSheet, Combobox, Drawer, Skeleton, Spinner, Switch, Toast,
  criarRegistroDeIcones,
} from "../../packages/native/src/index.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({
  "x": Glifo, "info": Glifo, "caret-down": Glifo, "magnifying-glass": Glifo,
});
// O `useReduceMotion` responde numa microtarefa; antes disso nenhuma peça anima.
const assentar = async () => { await act(async () => { await Promise.resolve(); }); };
type Soltar = (e: unknown, g: {dy: number; vy: number}) => void;
const soltarNoMeio = () => act(() => {
  (__ultimoGesto()!.onPanResponderRelease as Soltar)({}, {dy: 30, vy: 0});
});

// Cada caso desenha a peça e, se for preciso, faz o gesto que dispara a animação.
const casos: Array<[string, React.ReactElement, (() => void)?]> = [
  ["Spinner", <Spinner />],
  ["Skeleton", <Skeleton width={80} height={12} />],
  ["Switch", <Switch checked={false} onChange={() => {}} label="Wi-Fi" />],
  ["Drawer, ao abrir", <Drawer open title="Filtros" onClose={() => {}} />],
  ["BottomSheet, ao soltar no meio", <BottomSheet open onClose={() => {}} />, soltarNoMeio],
  ["Combobox, ao soltar a folha no meio", <Combobox items={[]} />, soltarNoMeio],
  ["Toast, ao entrar", <Toast toast={{id: "a", title: "Salvo"}} onClose={() => {}} />],
];

describe("E13 · o motor nativo de animação só no aparelho", () => {
  for (const [nome, arvore, gesto] of casos) {
    for (const plataforma of ["android", "ios", "web"] as const) {
      const esperado = plataforma !== "web";
      it(`${nome} · ${plataforma} → useNativeDriver: ${esperado}`, async () => {
        __limpar();
        __definirPlataforma(plataforma);
        render(<AureaProvider icons={ICONES}>{arvore}</AureaProvider>);
        await assentar();
        gesto?.();
        const configs = __configsDeAnimacao();
        // Sem animação pedida, o teste passaria calado — e não provaria nada.
        expect(configs.length).toBeGreaterThan(0);
        for (const c of configs) expect(c.useNativeDriver).toBe(esperado);
      });
    }
  }
});

describe("E13 · ninguém escreve `useNativeDriver` à mão", () => {
  it("todo `useNativeDriver` do pacote nativo é `driverNativo()`", () => {
    const pasta = resolve(__dirname, "../../packages/native/src");
    const achados: string[] = [];
    let total = 0;
    for (const arq of readdirSync(pasta).filter((f) => /\.tsx?$/.test(f))) {
      const linhas = readFileSync(resolve(pasta, arq), "utf-8").split("\n");
      linhas.forEach((linha, i) => {
        // Só código: a linha de comentário que CITA a chave não conta.
        if (/^\s*(\/\/|\*)/.test(linha)) return;
        for (const m of linha.matchAll(/useNativeDriver\s*:\s*([^,}]+)/g)) {
          total++;
          if (m[1].trim() !== "driverNativo()") achados.push(`${arq}:${i + 1} → ${m[1].trim()}`);
        }
      });
    }
    expect(total).toBeGreaterThan(0);
    expect(achados).toEqual([]);
  });
});
