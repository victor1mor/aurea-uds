// A QUICK START DO SITE B (02/11/2026): o alvo (Web | React Native) mostra os passos dele; o gerenciador muda o comando
// de instalar; o "Mark as done" pinta o círculo do passo, a parte da barra "Your setup" e as contagens. Sem este script, a
// página mostra a Web com o pnpm, e nada marcado.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="quick-start"]');
  if (!pagina) return;
  const ADD = {pnpm: "pnpm add ", npm: "npm install ", yarn: "yarn add ", bun: "bun add "};
  const PASSOS = {web: ["install", "styles", "provider", "icons", "first", "theme"], native: ["install", "setup", "pickers"]};
  const estado = {alvo: "web", pm: "pnpm", feitos: {web: new Set(), native: new Set()}};
  const aplicar = () => {
    const alvo = estado.alvo, feitos = estado.feitos[alvo], passos = PASSOS[alvo];
    pagina.querySelectorAll("[data-qs-plataforma]").forEach(el => {
      const p = el.dataset.qsPlataforma;
      el.hidden = p !== "both" && p !== alvo;
    });
    pagina.querySelectorAll("[data-qs-setup]").forEach(el => { el.hidden = el.dataset.qsSetup !== alvo; });
    // O comando de instalar, no bloco e na peça que flutua.
    const caixa = pagina.querySelector("[data-qs-instalar]");
    const codigo = caixa && caixa.querySelector("code");
    if (codigo) codigo.textContent = ADD[estado.pm] + caixa.dataset[alvo];
    document.querySelectorAll("[data-qs-comando]").forEach(el => {
      el.textContent = ADD[estado.pm] + (alvo === "web" ? "@aurea-uds/react" : "@aurea-uds/native");
    });
    // Os passos: a caixa, o rótulo ("Mark as done" → "Done") e o círculo do número.
    pagina.querySelectorAll("section[data-gs-sec]").forEach(sec => {
      const caixaDoPasso = sec.querySelector(".qs-feito input");
      if (!caixaDoPasso) return;
      const feito = feitos.has(sec.dataset.gsSec);
      caixaDoPasso.checked = feito;
      const rotulo = caixaDoPasso.closest("label").lastElementChild;
      if (rotulo) rotulo.textContent = feito ? "Done" : "Mark as done";
      const n = sec.querySelector("[data-qs-n]");
      if (n) n.toggleAttribute("data-feito", feito);
    });
    // A barra do alvo: a parte verde quando feita, e o nome dela diz "done" ao leitor de tela.
    const barra = pagina.querySelector(`[data-qs-setup="${alvo}"]`);
    if (barra) {
      barra.querySelectorAll(".step").forEach((parte, i) => {
        const feito = feitos.has(passos[i]);
        parte.classList.toggle("step-done", feito);
        const nome = parte.querySelector(".sr-only");
        if (nome) {
          nome.dataset.nome = nome.dataset.nome || nome.textContent;
          nome.textContent = nome.dataset.nome + (feito ? ", done" : "");
        }
      });
      const conta = barra.querySelector(".stepper-bar-count");
      const n = passos.filter(p => feitos.has(p)).length;
      if (conta) conta.textContent = n + " of " + passos.length + " done";
    }
    document.querySelectorAll("[data-qs-feitos]").forEach(el => { el.textContent = passos.filter(p => feitos.has(p)).length; });
    document.querySelectorAll("[data-qs-total]").forEach(el => { el.textContent = passos.length; });
    if (window.gsIndice) window.gsIndice();
  };
  pagina.addEventListener("change", e => {
    const t = e.target;
    if (t.name === "qs-alvo") { estado.alvo = t.value; aplicar(); }
    else if (t.closest(".qs-feito")) {
      const id = t.closest("section[data-gs-sec]").dataset.gsSec;
      const feitos = estado.feitos[estado.alvo];
      if (t.checked) feitos.add(id); else feitos.delete(id);
      aplicar();
    }
  });

  // O Victor, 02/11/2026: escolher o gerenciador lá em cima não dizia nada — o comando que muda fica embaixo. Agora a página
  // desce até ele (suave, menos com o "reduzir movimento" do sistema). Só no clique: o evento "gs-chave" sai da pessoa.
  const descerAte = el => { if (el) el.scrollIntoView({block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); };
  pagina.addEventListener("gs-chave", e => {
    if (e.detail.nome !== "qs-pm") return;
    estado.pm = e.detail.valor;
    aplicar();
    descerAte(pagina.querySelector('[data-gs-sec="install"]'));
  });
  // Quem chega por um endereço de uma seção do React Native (o "#react-native" da Frameworks) vê o alvo dele.
  const alvoDoEndereco = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!el || !el.closest('[data-qs-plataforma="native"]')) return;
    estado.alvo = "native";
    const radio = pagina.querySelector('input[name="qs-alvo"][value="native"]');
    if (radio) radio.checked = true;
    aplicar();
    el.scrollIntoView();
  };
  aplicar();
  alvoDoEndereco();
  addEventListener("hashchange", alvoDoEndereco);
})();
