/* O "FULL WIDTH" DAS CAIXAS (05/11/2026, o S-11 — a forma B da caixa larga; o Victor: "não quero flutuante … só quero
   que ele cresça na própria página"). Toda caixa de exemplo de uma página que não é larga ganha o botão "Full width". O
   clique põe a página no arranjo largo (`g1-largo` + `data-pagina-larga` no conteúdo, o mesmo das receitas: sem o índice
   da direita e sem o teto de largura) e traz a caixa de volta à vista; o botão vira "Normal width" e desfaz. Um botão só
   vale pela página inteira: todos trocam juntos. O botão mora no invólucro (`.demo`), fora do painel — a parte viva tira
   do painel tudo o que era desenho pronto quando acende. Script comum, sem `import`: entra no fim do `assets/catalog.js`.
   AS MOLDURAS TAMBÉM (06/11/2026, ADR-0093): elas ficavam de fora, e 87 exemplos de 25 páginas (a Sidebar, o BottomNav, o
   AppShell, as peças de cor) saíam sem o botão — o Victor achou na Sidebar. A moldura cresce com a página como qualquer
   caixa. */
(function () {
  var raiz = function () { return document.querySelector(".site-shell > .content > *"); };
  // O sprite da página só leva os ícones que o HTML de alguma página usa: sem o símbolo, o botão sai só com o texto.
  var icone = function (nome) {
    return document.getElementById("i-" + nome)
      ? '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-' + nome + '"></use></svg>' : "";
  };
  var botoes = [];
  var desenhar = function (largo) {
    botoes.forEach(function (b) {
      b.innerHTML = icone(largo ? "arrows-in-simple" : "arrows-out") + (largo ? "Normal width" : "Full width");
    });
  };
  function trocar(botao) {
    var r = raiz();
    if (!r) return;
    var largo = !r.hasAttribute("data-pagina-larga-ligada");
    r.classList.toggle("g1-largo", largo);
    r.toggleAttribute("data-pagina-larga", largo);
    r.toggleAttribute("data-pagina-larga-ligada", largo);
    desenhar(largo);
    var caixa = botao.closest(".demo");
    if (caixa) caixa.scrollIntoView({block: "nearest"});
    botao.focus();
  }
  function ligar() {
    var r = raiz();
    // A página que já nasce larga (as receitas, as listas) não precisa do botão.
    if (!r || r.hasAttribute("data-pagina-larga") || r.classList.contains("g1-largo")) return;
    Array.prototype.forEach.call(document.querySelectorAll('.demo > .demo-panel[data-panel="preview"]'), function (painel) {
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "btn btn-tertiary btn-sm tela-cheia-abrir";
      botao.addEventListener("click", function () { trocar(botao); });
      painel.before(botao);
      botoes.push(botao);
    });
    desenhar(false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ligar);
  else ligar();
})();
