// AS PÁGINAS DA GETTING STARTED NO DESENHO B (02/11/2026): o que as sete repetem. Só age numa página que tem o
// `[data-gs-pagina]` (o corpo delas, em `site-b/paginas/_getting-started/comum.mjs`).
(() => {
  const corpo = document.querySelector("[data-gs-pagina]");
  if (!corpo) return;
  // A CHAVE DE SEGMENTOS (a pele da SegmentedControl, com botões de ligar): o clique muda o escolhido e avisa a página
  // pelo evento "gs-chave" ({nome, valor}), no próprio grupo (ele sobe até o documento).
  const escolher = (grupo, valor) => {
    grupo.querySelectorAll("[data-valor]").forEach(b => {
      const sim = b.dataset.valor === valor;
      b.classList.toggle("active", sim);
      b.setAttribute("aria-pressed", sim ? "true" : "false");
    });
    grupo.dispatchEvent(new CustomEvent("gs-chave", {bubbles: true, detail: {nome: grupo.dataset.gsChave, valor}}));
  };
  document.addEventListener("click", e => {
    const botao = e.target.closest("[data-gs-chave] [data-valor]");
    if (!botao || !corpo.contains(botao)) return;
    escolher(botao.closest("[data-gs-chave]"), botao.dataset.valor);
  });
  // Mudar a chave por código (uma página que liga duas chaves à mesma escolha).
  window.gsEscolher = (nome, valor) => document.querySelectorAll(`[data-gs-chave="${nome}"]`).forEach(g => {
    const atual = g.querySelector(".active");
    if (!atual || atual.dataset.valor !== valor) escolher(g, valor);
  });
  // O ÍNDICE: a seção escondida (a da outra plataforma, o outro framework) sai também do índice da direita.
  window.gsIndice = () => {
    document.querySelectorAll(".toc a[href^='#']").forEach(a => {
      const alvo = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
      if (!alvo) return;
      const escondida = !!alvo.closest("[hidden]");
      const item = a.closest("li") || a;
      item.hidden = escondida;
    });
  };
  window.gsIndice();
})();
