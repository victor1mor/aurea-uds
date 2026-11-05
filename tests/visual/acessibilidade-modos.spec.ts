import {test, expect} from "@playwright/test";
import {esperarTransicoes} from "./esperar-transicoes";

// O ALTO CONTRASTE E O TEXTO GRANDE NO APP INTEIRO (o MNT-30, bloco 3 — ADR-0090, 04/11/2026). O Victor escolheu no esboço
// (o contraste "C", o texto "B") e aprovou na bancada (`apps/keyboard-probe/acessibilidade.html`, "Aprovo"). Aqui se mede,
// na bancada, com as peças de verdade, nos dois temas, na Gold e na Ember (que recebe os dois modos: "Sim, recebe"):
//   · hoje (sem atributo) nada muda: o campo sem contorno, a 36, a letra do corpo a 14;
//   · `data-contrast="high"`: o contorno nos campos, no cartão e nos botões, o link sublinhado, o apoio mais escuro;
//   · `data-text="lg"`: o campo, o `Select` e o botão a 44, e a letra 2 acima.
// Provado contra o defeito (04/11/2026): com o core sem as regras e os tokens do bloco 3, reprova.
const TRANSPARENTE = "rgba(0, 0, 0, 0)";

for (const marca of ["", "ember"]) {
  test(`os dois modos na bancada${marca ? `, na ${marca}` : ""}, nos dois temas`, async ({page: p}) => {
    await p.setViewportSize({width: 1280, height: 900});
    await p.goto(`/apps/keyboard-probe/out/acessibilidade.html${marca ? `?marca=${marca}` : ""}`, {waitUntil: "networkidle"});
    await esperarTransicoes(p);
    for (const tema of ["light", "dark"]) {
      const sec = (nome: string) => p.locator(`section[data-theme="${tema}"] [data-coluna="${nome}"]`);
      const m = async (nome: string) => sec(nome).evaluate((el) => {
        const q = (s: string) => el.querySelector(s) as HTMLElement;
        const cs = (s: string) => getComputedStyle(q(s));
        const alt = (s: string) => Math.round(q(s).getBoundingClientRect().height);
        return {
          campoBorda: cs(".input").borderTopColor, campoAltura: alt(".input"), selectAltura: alt(".select"),
          botaoAltura: alt(".btn-primary"), botaoAro: cs(".btn-primary").boxShadow, cartaoBorda: cs(".card").borderTopColor,
          link: cs("a").textDecorationLine, apoio: getComputedStyle(q(".card p")).color,
          titulo: parseFloat(getComputedStyle(q(".card h1, .card h2, .card h3, .card h4")).fontSize),
          rotulo: parseFloat(getComputedStyle(q(".card label")).fontSize),
        };
      });
      const hoje = await m("Hoje"), contraste = await m("Alto contraste (C)"), texto = await m("Texto grande (B)");
      const juntos = await m("Os dois juntos");
      const onde = `${marca || "gold"} · ${tema}`;
      // Hoje: sem linha nenhuma, o controle a 36.
      expect(hoje.campoBorda, onde).toBe(TRANSPARENTE);
      expect(hoje.cartaoBorda, onde).toBe(TRANSPARENTE);
      expect(hoje.botaoAro, onde).toBe("none");
      expect([hoje.campoAltura, hoje.selectAltura, hoje.botaoAltura], onde).toEqual([36, 36, 36]);
      // O alto contraste: as linhas que só ele acende, o apoio diferente, o link sublinhado; a medida não muda.
      for (const c of [contraste, juntos]) {
        expect(c.campoBorda, onde).not.toBe(TRANSPARENTE);
        expect(c.cartaoBorda, onde).not.toBe(TRANSPARENTE);
        expect(c.botaoAro, onde).toMatch(/inset/);
        expect(c.link, onde).toBe("underline");
        expect(c.apoio, onde).not.toBe(hoje.apoio);
      }
      expect([contraste.campoAltura, contraste.botaoAltura], onde).toEqual([36, 36]);
      // O texto grande: o controle médio a 44 (o alvo de toque), a letra 2 acima; sem linha nova.
      for (const t of [texto, juntos]) {
        expect([t.campoAltura, t.selectAltura, t.botaoAltura], onde).toEqual([44, 44, 44]);
        expect(t.titulo - hoje.titulo, onde).toBe(2);
        expect(t.rotulo - hoje.rotulo, onde).toBe(2);
      }
      expect(texto.campoBorda, onde).toBe(TRANSPARENTE);
    }
  });
}

