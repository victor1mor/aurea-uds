// "BLOCKS" NO SITE B (02/11/2026): o "Preview" abre o bloco no lugar, numa linha inteira (um de cada vez); o "×" fecha e
// devolve o foco ao "Preview"; o "Next block" abre o próximo. A busca e os grupos são do `_grupo-1.js`. Só age na página
// dos blocos.
{
  const pagina = document.querySelector(".blk-b");
  if (pagina) {
    const botaoDe = (slug) => pagina.querySelector('[data-blk="' + slug + '"] [data-blk-abrir]');
    const painelDe = (slug) => pagina.querySelector('[data-blk-painel="' + slug + '"]');
    const fechar = (painel, devolver) => {
      if (!painel || painel.hidden) return;
      painel.hidden = true;
      const slug = painel.dataset.blkPainel;
      const botao = botaoDe(slug);
      if (botao) {
        botao.setAttribute("aria-expanded", "false");
        botao.closest("[data-blk]").removeAttribute("data-aberto");
        if (devolver) botao.focus();
      }
    };
    const abrir = (slug) => {
      pagina.querySelectorAll("[data-blk-painel]:not([hidden])").forEach((p) => fechar(p, false));
      const painel = painelDe(slug), botao = botaoDe(slug);
      if (!painel || !botao) return;
      // O grupo e o cartão podem estar escondidos pela busca: abrir mostra os dois.
      const grupo = painel.closest("[data-g1-grupo]");
      if (grupo) grupo.hidden = false;
      botao.closest("[data-blk]").hidden = false;
      painel.hidden = false;
      botao.setAttribute("aria-expanded", "true");
      botao.closest("[data-blk]").setAttribute("data-aberto", "");
      painel.scrollIntoView({block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
      const titulo = painel.querySelector("h3");
      if (titulo) { titulo.tabIndex = -1; titulo.focus({preventScroll: true}); }
    };
    pagina.addEventListener("click", (e) => {
      const abre = e.target.closest("[data-blk-abrir]");
      if (abre) {
        const slug = abre.closest("[data-blk]").dataset.blk;
        if (abre.getAttribute("aria-expanded") === "true") fechar(painelDe(slug), true); else abrir(slug);
        return;
      }
      const fecha = e.target.closest("[data-blk-fechar]");
      if (fecha) { fechar(fecha.closest("[data-blk-painel]"), true); return; }
      const proximo = e.target.closest("[data-blk-proximo]");
      if (proximo) abrir(proximo.dataset.blkProximo);
    });
    pagina.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const painel = e.target.closest && e.target.closest("[data-blk-painel]");
      if (painel) fechar(painel, true);
    });
  }
}
