import type {Page} from "@playwright/test";
import {ESCALA_DO_RAIO} from "../../scripts/canto-continuo.mjs";

// O RAIO QUE O NAVEGADOR CALCULA DEPOIS DO CANTO CONTÍNUO (HER-01, lote 106, 0.82.0). Onde o `corner-shape` é desenhado
// (o Chromium), o canto que não é cápsula ganha a curva do iPhone e o raio 1,5 × o token (`scripts/canto-continuo.mjs`);
// onde não é (o Firefox e o WebKit), o raio é o do token. A prova que mede o canto de uma superfície compara com isto,
// e não com o número do token escrito à mão — o mesmo teste vale nos três navegadores.
export async function cantoContinuo(p: Page, px: number): Promise<string> {
  const desenha = await p.evaluate(() => CSS.supports("corner-shape: superellipse(2)"));
  return `${desenha ? px * ESCALA_DO_RAIO : px}px`;
}

/** O número que multiplica o raio do token no navegador desta prova: 1,5 onde o canto contínuo é desenhado, 1 onde não. */
export async function escalaDoCanto(p: Page): Promise<number> {
  return (await p.evaluate(() => CSS.supports("corner-shape: superellipse(2)"))) ? ESCALA_DO_RAIO : 1;
}
