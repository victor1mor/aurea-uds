// O GRUPO 1 DO SITE B (02/11/2026): o que a página de componente, Releases, Patterns e Blocks repetem. Num bloco, para os
// nomes não vazarem para o `catalog.js`, que é um script só. Cada parte procura o elemento dela antes de agir.
{
  // A ESCOLHA DE UM VALOR: a `SegmentedControl` desenhada no servidor ([data-g1-escolha] em volta dela). O clique e as
  // setas escolhem; só a escolhida entra no Tab, como num grupo de rádios. Quem escuta recebe o evento "g1-escolheu",
  // com o texto da escolhida.
  const marcar = (botao) => {
    const grupo = botao.closest("[role=radiogroup]");
    grupo.querySelectorAll("[role=radio]").forEach((b) => {
      const on = b === botao;
      b.setAttribute("aria-checked", String(on));
      b.classList.toggle("active", on);
      b.toggleAttribute("data-checked", on);
      b.toggleAttribute("data-unchecked", !on);
      b.tabIndex = on ? 0 : -1;
      const radio = b.nextElementSibling;
      if (radio && radio.type === "radio") radio.checked = on;
    });
    grupo.dispatchEvent(new CustomEvent("g1-escolheu", {bubbles: true, detail: {valor: botao.textContent.trim()}}));
  };
  document.querySelectorAll("[data-g1-escolha]").forEach((caixa) => {
    const botoes = [...caixa.querySelectorAll("[role=radio]")];
    if (!botoes.length) return;
    const atual = botoes.find((b) => b.getAttribute("aria-checked") === "true") || botoes[0];
    botoes.forEach((b) => { b.tabIndex = b === atual ? 0 : -1; });
    caixa.addEventListener("click", (e) => {
      const b = e.target.closest("[role=radio]");
      if (b) marcar(b);
    });
    caixa.addEventListener("keydown", (e) => {
      const passo = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key];
      if (!passo) return;
      e.preventDefault();
      const k = botoes.indexOf(document.activeElement);
      const b = botoes[(k + passo + botoes.length) % botoes.length];
      marcar(b);
      b.focus();
    });
  });

  // A TROCA DE PAINEL por uma escolha ([data-g1-paineis]): mostra o filho [data-g1-painel] com o mesmo nome da escolhida
  // (o "Web | Native" da caixa de atualizar).
  document.querySelectorAll("[data-g1-paineis]").forEach((caixa) => {
    caixa.addEventListener("g1-escolheu", (e) => {
      caixa.querySelectorAll("[data-g1-painel]").forEach((p) => { p.hidden = p.dataset.g1Painel !== e.detail.valor; });
    });
  });

  // A LISTA COM BUSCA E "SHOW ALL" ([data-g1-lista]): cada item ([data-g1-item]) leva o texto em que se busca
  // (data-busca); os grupos ([data-g1-grupo]) mostram os primeiros até o "Show all" ([data-g1-mais]); os itens a mais
  // levam [data-mais]. Os grupos a mais ([data-g1-grupo-mais]) esperam o botão [data-g1-mais-grupos]. Sem script, tudo
  // aparece.
  // O FILTRO DA LATERAL (S-01, 05/11/2026 — o Victor: "o item fica marcado e a lista não filtra"): o grupo com
  // [data-g1-filtro] aparece só quando o valor é o escolhido na lateral (o evento "site-filtro" do `_filtro.js`, ou o
  // `#filtro/<valor>` do endereço), já aberto, com todos os itens; "all" mostra todos, como antes.
  const filtroDoEndereco = () => { const m = /^#filtro\/(.+)$/.exec(location.hash); return m ? decodeURIComponent(m[1]) : "all"; };
  document.querySelectorAll("[data-g1-lista]").forEach((lista) => {
    const estado = {q: "", abertos: new Set(), todosOsGrupos: false, filtro: filtroDoEndereco()};
    const busca = lista.querySelector("[data-g1-busca] input, input[data-g1-busca]");
    const grupos = [...lista.querySelectorAll("[data-g1-grupo]")];
    const mostrando = lista.querySelector("[data-g1-mostrando]");
    const vazio = lista.querySelector("[data-g1-vazio]");
    const tituloDoVazio = lista.querySelector("[data-g1-vazio-titulo]");
    const maisGrupos = lista.querySelector("[data-g1-mais-grupos]");
    const fraseDoVazio = lista.dataset.g1Frase || "Nothing called";
    const filtravel = grupos.some((g) => g.hasAttribute("data-g1-filtro"));
    const aplicar = () => {
      const q = estado.q.trim().toLowerCase();
      const f = filtravel && estado.filtro !== "all" ? estado.filtro : null;
      let vistos = 0;
      grupos.forEach((g) => {
        const itens = [...g.querySelectorAll("[data-g1-item]")];
        const acham = itens.filter((c) => !q || (c.dataset.busca || "").includes(q));
        const resumido = !q && !f && !estado.abertos.has(g);
        itens.forEach((c) => { c.hidden = !acham.includes(c) || (resumido && c.hasAttribute("data-mais")); });
        const escondidoPorQuantidade = !q && !f && !estado.todosOsGrupos && g.hasAttribute("data-g1-grupo-mais");
        g.hidden = (f != null && g.dataset.g1Filtro !== f) || acham.length === 0 || escondidoPorQuantidade;
        const mais = g.querySelector("[data-g1-mais]");
        if (mais) {
          const caixa = mais.closest(".g1-mais") || mais;
          caixa.hidden = Boolean(q) || f != null;
          const aberto = estado.abertos.has(g);
          mais.setAttribute("aria-expanded", String(aberto));
          const rotulo = mais.querySelector("span:not([class])") || mais;
          if (!mais.dataset.rotulo) mais.dataset.rotulo = rotulo.textContent;
          rotulo.textContent = aberto ? "Show less" : mais.dataset.rotulo;
        }
        if (!g.hidden) vistos += itens.filter((c) => !c.hidden).length;
      });
      if (mostrando) mostrando.textContent = String(vistos);
      if (vazio) {
        vazio.hidden = vistos > 0;
        if (tituloDoVazio) tituloDoVazio.textContent = fraseDoVazio + " “" + estado.q.trim() + "”";
      }
      if (maisGrupos) { const c = maisGrupos.closest("[data-g1-mais-grupos-caixa]") || maisGrupos; c.hidden = Boolean(q) || f != null || estado.todosOsGrupos; }
    };
    if (filtravel) document.addEventListener("site-filtro", (e) => { estado.filtro = e.detail || "all"; aplicar(); });
    if (busca) busca.addEventListener("input", () => { estado.q = busca.value; aplicar(); });
    lista.querySelectorAll("[data-g1-limpar]").forEach((b) => b.addEventListener("click", () => {
      estado.q = ""; if (busca) { busca.value = ""; busca.focus(); } aplicar();
    }));
    lista.querySelectorAll("[data-g1-mais]").forEach((b) => b.addEventListener("click", () => {
      const g = b.closest("[data-g1-grupo]");
      if (estado.abertos.has(g)) estado.abertos.delete(g); else estado.abertos.add(g);
      aplicar();
    }));
    if (maisGrupos) maisGrupos.addEventListener("click", () => { estado.todosOsGrupos = true; aplicar(); });
    aplicar();
  });
}
