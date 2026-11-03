// A COLORS DO SITE B (02/11/2026): escolher um papel do tema padrão mostra-o grande nos dois temas; a chave do link troca
// o marca-texto pelo sublinhado (`data-link="underline"`) no quadro claro; a chave da plataforma troca o código. Sem este
// script, a página mostra o "--primary" escolhido, o marca-texto e o código da web.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="colors"]');
  if (!pagina) return;
  const grande = pagina.querySelector("[data-co-grande]");
  pagina.addEventListener("click", e => {
    const papel = e.target.closest(".co-papel[data-token]");
    if (!papel || !grande) return;
    pagina.querySelectorAll(".co-papel[data-token]").forEach(b => b.setAttribute("aria-pressed", b === papel ? "true" : "false"));
    grande.querySelector("[data-co-nome]").textContent = papel.dataset.token;
    grande.querySelectorAll("[data-co-tema]").forEach(bloco => {
      const claro = bloco.dataset.coTema === "light";
      bloco.style.background = "var(" + papel.dataset.token + ")";
      bloco.dataset.tinta = claro ? papel.dataset.tintaClaro : papel.dataset.tintaEscuro;
      bloco.querySelector("[data-co-valor]").textContent = claro ? papel.dataset.claro : papel.dataset.escuro;
    });
  });
  pagina.addEventListener("gs-chave", e => {
    if (e.detail.nome === "co-link") {
      pagina.querySelectorAll("[data-co-link]").forEach(q => {
        if (e.detail.valor === "underline") q.dataset.link = "underline"; else delete q.dataset.link;
      });
    } else if (e.detail.nome === "co-plataforma") {
      pagina.querySelectorAll("[data-co-plataforma]").forEach(el => { el.hidden = el.dataset.coPlataforma !== e.detail.valor; });
    }
  });
})();
