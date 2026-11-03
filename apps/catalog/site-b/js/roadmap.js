// A ROADMAP DO SITE B (02/11/2026): cada etapa do caminho («Before 1.0») escolhe o que o quadro de baixo explica;
// Previous e Next andam pelas seis, em roda. Sem este script, o quadro mostra a primeira.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="roadmap"]');
  if (!pagina) return;
  const etapas = [...pagina.querySelectorAll(".stepper-path .step")];
  const textos = [...pagina.querySelectorAll("[data-rm-texto]")];
  const numero = pagina.querySelector("[data-rm-numero]");
  if (!etapas.length || etapas.length !== textos.length) return;
  let atual = 0;
  const escolher = n => {
    atual = (n + etapas.length) % etapas.length;
    etapas.forEach((e, i) => {
      const sim = i === atual;
      e.classList.toggle("step-active", sim);
      if (sim) e.setAttribute("aria-current", "step"); else e.removeAttribute("aria-current");
    });
    textos.forEach((t, i) => { t.hidden = i !== atual; });
    if (numero) numero.textContent = String(atual + 1).padStart(2, "0");
  };
  pagina.addEventListener("click", e => {
    const gatilho = e.target.closest(".stepper-path .step .step-trigger");
    if (gatilho) { escolher(etapas.indexOf(gatilho.closest(".step"))); return; }
    const ir = e.target.closest("[data-rm-ir]");
    if (ir) escolher(atual + Number(ir.dataset.rmIr));
  });
})();
