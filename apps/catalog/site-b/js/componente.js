// A PÁGINA DE UM COMPONENTE NO SITE B (02/11/2026): o palco de testes, o filtro e o "More" da API, e o "Show all" dos
// tokens. A escolha de um valor (o clique e as setas na `SegmentedControl`) é do `_grupo-1.js`. Só age na página de
// componente (procura o elemento dela antes). Num bloco, para os nomes não vazarem para o `catalog.js`.
{
  const pagina = document.querySelector(".comp-b");
  const rotuloDe = (botao) => botao.querySelector("span:not([class])") || botao;
  if (pagina) {
    // O PALCO DE TESTES: cada forma é um <template> pronto, com o código dela; a escolha monta a chave.
    const palco = pagina.querySelector("[data-comp-palco]");
    const ordemJson = palco && palco.querySelector("[data-comp-ordem]");
    if (palco && ordemJson) {
      let ordem = null;
      try { ordem = JSON.parse(ordemJson.textContent); } catch (err) { ordem = null; }
      const peca = palco.querySelector("[data-comp-peca]");
      const codigo = palco.querySelector(".comp-teste-codigo code");
      const escolhido = (id) => {
        const b = palco.querySelector('[data-comp-escolha="' + id + '"] [role=radio][aria-checked="true"]');
        return b ? b.textContent.trim() : "";
      };
      const ligado = (id) => {
        const caixa = palco.querySelector('[data-comp-estado="' + id + '"]');
        const entrada = caixa && (caixa.matches("input") ? caixa : caixa.querySelector("input"));
        return entrada && entrada.checked ? 1 : 0;
      };
      const trocar = () => {
        if (!ordem) return;
        const chave = [ordem.variant == null ? escolhido("variant") : ordem.variant,
          ordem.size == null ? escolhido("size") : ordem.size, ...ordem.estados.map(ligado)].join("|");
        const forma = [...palco.querySelectorAll("template[data-comp-forma]")].find((t) => t.dataset.compForma === chave);
        if (!forma) return;
        peca.replaceChildren(forma.content.cloneNode(true));
        if (codigo) codigo.textContent = forma.dataset.codigo;
      };
      palco.addEventListener("g1-escolheu", trocar);
      palco.addEventListener("change", (e) => { if (e.target.closest("[data-comp-estado]")) trocar(); });
    }

    // A API: o filtro pelo nome da prop, e o "More" que abre o resto do texto.
    const api = pagina.querySelector("[data-comp-api]");
    if (api) {
      const filtro = api.querySelector("[data-comp-api-filtro]");
      const campo = filtro && (filtro.matches("input") ? filtro : filtro.querySelector("input"));
      const props = [...api.querySelectorAll("[data-comp-prop]")];
      const vazio = api.querySelector("[data-comp-api-vazio]");
      if (campo) campo.addEventListener("input", () => {
        const q = campo.value.trim().toLowerCase();
        let vistas = 0;
        props.forEach((p) => { p.hidden = Boolean(q) && !p.dataset.compProp.includes(q); if (!p.hidden) vistas++; });
        if (vazio) vazio.hidden = vistas > 0;
      });
      api.addEventListener("click", (e) => {
        const botao = e.target.closest("[data-comp-mais]");
        if (!botao) return;
        const cartao = botao.closest("[data-comp-prop]");
        const aberto = !cartao.hasAttribute("data-aberto");
        cartao.toggleAttribute("data-aberto", aberto);
        botao.setAttribute("aria-expanded", String(aberto));
        rotuloDe(botao).textContent = aberto ? "Less" : "More";
      });
    }

    // Os TOKENS: os doze primeiros, e o resto no "Show all".
    pagina.querySelectorAll("[data-comp-tokens]").forEach((botao) => botao.addEventListener("click", () => {
      const aberto = botao.getAttribute("aria-expanded") !== "true";
      botao.closest("dd").querySelectorAll("[data-mais]").forEach((c) => { c.hidden = !aberto; });
      botao.setAttribute("aria-expanded", String(aberto));
      rotuloDe(botao).textContent = aberto ? "Show fewer" : botao.dataset.rotulo;
    }));
  }
}
