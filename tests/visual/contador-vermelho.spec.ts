import {test, expect} from "@playwright/test";

// O CONTADOR E O PONTO DA BARRA DE BAIXO SÃO VERMELHOS, como no nativo (o Victor, 28/10/2026, comparando a bancada com a
// página do nativo: "Vermelho, igual"; "Vermelho sempre"; "Vermelho, como no nativo"). Medido no banco dos estilos (a
// barra em cápsula, o formato que inverte o selo do item atual), nos dois temas:
// - o contador vermelho (`<Badge variant="danger">`) fica vermelho também no item atual — a peça só inverte o selo da cor
//   da marca, que sumiria na cápsula;
// - o ponto vazio é o `--destructive`, menos na barra inteira da marca (`bar-*`), onde ele é a tinta (o vermelho no amarelo
//   não chega a 3:1).
// Provado contra o defeito (28/10/2026): com o CSS de antes, o contador do item atual saía na tinta (rgb(24, 24, 27)) e o
// ponto no amarelo, e reprova.
for (const tema of ["light", "dark"] as const) {
  test(`o contador e o ponto são vermelhos (${tema === "light" ? "claro" : "escuro"})`, async ({page: p}) => {
    await p.goto(`/apps/keyboard-probe/out/estilos.html?tema=${tema}`, {waitUntil: "networkidle"});
    await p.addStyleTag({content: "*,*::before,*::after{transition:none!important}"});
    const r = await p.evaluate(() => {
      const vermelho = (() => { const s = document.createElement("span"); s.style.background = "var(--destructive)"; document.body.append(s);
        const c = getComputedStyle(s).backgroundColor; s.remove(); return c; })();
      return {vermelho, forma: document.querySelector(".bottom-nav")!.className,
        linhas: [...document.querySelectorAll<HTMLElement>('[data-prova^="bn-"]')].map((c) => ({
          estilo: c.dataset.prova!, barra: c.dataset.prova!.startsWith("bn-bar-"),
          atual: !!c.querySelector(".bottom-nav-item[aria-current] .bottom-nav-badge .badge"),
          selo: getComputedStyle(c.querySelector(".bottom-nav-badge .badge")!).backgroundColor,
          ponto: getComputedStyle(c.querySelector(".bottom-nav-badge:empty")!).backgroundColor}))};
    });
    expect(r.forma, "o banco abre na cápsula").toContain("bottom-nav-ind-capsule");
    expect(r.linhas.length).toBe(13);
    for (const l of r.linhas) {
      expect(l.atual, `${l.estilo}: o contador está no item atual`).toBe(true);
      expect(l.selo, `${l.estilo}: o contador`).toBe(r.vermelho);
      if (l.barra) expect(l.ponto, `${l.estilo}: o ponto na barra da marca`).not.toBe(r.vermelho);
      else expect(l.ponto, `${l.estilo}: o ponto`).toBe(r.vermelho);
    }
  });
}
