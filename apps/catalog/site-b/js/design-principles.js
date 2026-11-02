// A DESIGN PRINCIPLES DO SITE B (02/11/2026): os painéis das regras. O anel de foco pintado no "Save" (01), a linha contra
// o fundo (04), a linha do botão montada nas duas chaves (07) e a plataforma das regras 08 e 09 (as duas chaves andam
// juntas). Sem este script, os painéis mostram o estado de partida do desenho.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="design-principles"]');
  if (!pagina) return;
  // 01: o botão de ligar pinta o anel no "Save".
  const ligar = pagina.querySelector(".dp-ligar");
  const salvar = pagina.querySelector("[data-dp-salvar]");
  if (ligar && salvar) ligar.addEventListener("click", () => {
    const ligado = ligar.getAttribute("aria-pressed") !== "true";
    ligar.setAttribute("aria-pressed", ligado ? "true" : "false");
    ligar.toggleAttribute("data-pressed", ligado);
    salvar.classList.toggle("dp-foco-ligado", ligado);
    ligar.textContent = ligado ? "Hide the focus ring" : "Show the focus ring";
  });
  const saida = nome => pagina.querySelector(`[data-dp-saida="${nome}"]`);
  pagina.addEventListener("gs-chave", e => {
    const {nome, valor} = e.detail;
    // 04: a caixa com a linha ou a de fundo.
    if (nome === "dp-linha") pagina.querySelectorAll("[data-dp-linha]").forEach(el => {
      if (el.dataset.dpLinha === valor) el.removeAttribute("hidden"); else el.setAttribute("hidden", "");
    });
    // 07: a linha do botão.
    if (nome === "dp-aparencia" && saida("aparencia")) saida("aparencia").textContent = valor;
    if (nome === "dp-tom" && saida("tom")) saida("tom").textContent = valor;
    // 08 e 09: a plataforma, nas duas chaves e em tudo o que é de uma só.
    if (nome === "dp-plataforma") {
      if (window.gsEscolher) window.gsEscolher("dp-plataforma", valor);
      pagina.querySelectorAll("[data-dp-web]").forEach(el => { el.hidden = valor !== "web"; });
      pagina.querySelectorAll("[data-dp-native]").forEach(el => { el.hidden = valor !== "native"; });
    }
  });
})();
