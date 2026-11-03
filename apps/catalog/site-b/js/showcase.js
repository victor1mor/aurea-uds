// A SHOWCASE DO SITE B (02/11/2026): a ÁREA escolhida na miniatura (clique, ou o mouse por cima) liga só ela e troca o
// painel ao lado; o botão "See it in light" troca o tema pela chave do topo. Sem este script, o painel mostra o topo.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="showcase"]');
  if (!pagina) return;
  let partes = [];
  try { partes = JSON.parse(document.getElementById("sc-partes").textContent); } catch (e) { return; }
  // O Toggle não repassa atributos "data-": a parte sai da classe "sc-area-<parte>".
  const areas = [...pagina.querySelectorAll(".sc-area")];
  const parteDe = a => (a.className.match(/sc-area-([a-z]+)/) || [])[1];
  const campo = nome => pagina.querySelector(`[data-sc-campo="${nome}"]`);
  const escolher = chave => {
    const parte = partes.find(p => p[0] === chave);
    if (!parte) return;
    areas.forEach(a => { const sim = parteDe(a) === chave; a.setAttribute("aria-pressed", sim ? "true" : "false"); a.toggleAttribute("data-pressed", sim); });
    const [, nome, peca, frase, href] = parte;
    if (campo("nome")) campo("nome").textContent = nome;
    if (campo("peca")) campo("peca").textContent = peca;
    if (campo("frase")) campo("frase").textContent = frase;
    if (campo("href")) campo("href").setAttribute("href", href);
  };
  areas.forEach(a => {
    a.addEventListener("click", () => escolher(parteDe(a)));
    a.addEventListener("mouseenter", () => escolher(parteDe(a)));
  });
  escolher("header");
  // O TEMA: pela chave de três posições do topo (que grava a escolha); sem ela, direto no <html>.
  const botao = pagina.querySelector("[data-sc-tema]");
  if (!botao) return;
  const rotulo = () => { botao.textContent = document.documentElement.dataset.theme === "light" ? "See it in dark" : "See it in light"; };
  botao.addEventListener("click", () => {
    const alvo = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    const opcao = [...document.querySelectorAll(".theme-switch-option, .theme-switch [role='radio'], .theme-switch button")]
      .find(b => (b.getAttribute("aria-label") || b.textContent || "").trim().toLowerCase() === alvo);
    if (opcao) opcao.click(); else document.documentElement.dataset.theme = alvo;
  });
  new MutationObserver(rotulo).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
  rotulo();
})();
