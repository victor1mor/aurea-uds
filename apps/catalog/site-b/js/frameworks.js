// A FRAMEWORKS DO SITE B (02/11/2026): o cartão escolhido mostra os passos do framework dele; o gerenciador muda os
// comandos de instalar. Sem este script, a página mostra o Next.js com o pnpm.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="frameworks"]');
  if (!pagina) return;
  const ADD = {pnpm: "pnpm add ", npm: "npm install ", yarn: "yarn add ", bun: "bun add "};
  const ARQUIVO = {next: "app/layout.tsx", vite: "src/main.tsx", html: "index.html", rn: "@aurea-uds/native"};
  const estado = {fw: "next", pm: "pnpm"};
  const aplicar = () => {
    pagina.querySelectorAll("[data-fw-painel]").forEach(p => { p.hidden = p.dataset.fwPainel !== estado.fw; });
    pagina.querySelectorAll("[data-fw-instalar]").forEach(c => {
      const codigo = c.querySelector("code");
      if (codigo) codigo.textContent = ADD[estado.pm] + c.dataset.fwInstalar;
    });
    document.querySelectorAll("[data-fw-arquivo]").forEach(el => { el.textContent = ARQUIVO[estado.fw]; });
    if (window.gsIndice) window.gsIndice();
  };
  const escolher = fw => {
    estado.fw = fw;
    const radio = pagina.querySelector(`input[name="fw-qual"][value="${fw}"]`);
    if (radio) radio.checked = true;
    aplicar();
  };
  pagina.addEventListener("change", e => { if (e.target.name === "fw-qual") escolher(e.target.value); });
  pagina.addEventListener("gs-chave", e => {
    if (e.detail.nome !== "fw-pm") return;
    estado.pm = e.detail.valor;
    aplicar();
  });
  // Quem chega pelo endereço de um passo (#vite-2, #plain-html…) vê o framework dele.
  const doEndereco = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const painel = el && el.closest("[data-fw-painel]");
    if (!painel || !painel.hidden) return;
    escolher(painel.dataset.fwPainel);
    el.scrollIntoView();
  };
  aplicar();
  doEndereco();
  addEventListener("hashchange", doEndereco);
})();
