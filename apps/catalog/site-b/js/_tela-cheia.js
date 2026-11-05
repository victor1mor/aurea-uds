/* A TELA CHEIA DAS CAIXAS (05/11/2026, o S-11 — a forma B da caixa larga, aprovada pelo Victor: "A e B juntas").
   Toda caixa de exemplo do site ganha o botão "Full width". O clique MOVE o painel da prévia (o mesmo nó, já aceso pela
   parte viva, que o desenha por portal — por isso os cliques continuam) para uma janela que ocupa a tela; "Close", o Esc
   ou o clique fora a devolvem ao lugar, e o foco volta ao botão. Enquanto ela está aberta, a página por trás fica
   `inert`. As caixas que são moldura (`.demo-frame`, uma página dentro da página) ficam de fora: mover a moldura a
   recarregaria. O botão mora no invólucro (`.demo`), fora do painel. Script comum, sem `import`: entra no fim do `assets/catalog.js`. */
(function () {
  var paineis = function () {
    return Array.prototype.filter.call(document.querySelectorAll('.demo > .demo-panel[data-panel="preview"]'), function (p) {
      return !p.querySelector(".demo-frame") && !p.parentElement.querySelector(":scope > .tela-cheia-abrir");
    });
  };
  var icone = function (nome) {
    return '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-' + nome + '"></use></svg>';
  };
  var titulo = function () {
    var h1 = document.querySelector(".page-head h1, main h1");
    return h1 ? h1.textContent.trim() : document.title;
  };

  var janela = null, aberto = null;
  function montarJanela() {
    janela = document.createElement("div");
    janela.className = "tela-cheia";
    janela.hidden = true;
    janela.setAttribute("role", "dialog");
    janela.setAttribute("aria-modal", "true");
    janela.setAttribute("aria-labelledby", "tela-cheia-titulo");
    janela.innerHTML = '<div class="tela-cheia-janela"><div class="tela-cheia-topo">'
      + '<h2 class="tela-cheia-titulo" id="tela-cheia-titulo"></h2>'
      + '<button type="button" class="btn btn-tertiary btn-sm tela-cheia-fechar">' + icone("x") + "Close</button>"
      + '</div><div class="tela-cheia-corpo"></div></div>';
    janela.querySelector(".tela-cheia-fechar").addEventListener("click", fechar);
    janela.addEventListener("keydown", function (e) { if (e.key === "Escape" && !e.defaultPrevented) { e.preventDefault(); fechar(); } });
    janela.addEventListener("mousedown", function (e) { if (e.target === janela) fechar(); });
    document.body.append(janela);
  }

  function abrir(painel, botao) {
    if (!janela) montarJanela();
    var lugar = document.createElement("div");
    lugar.className = "tela-cheia-lugar";
    lugar.style.blockSize = painel.getBoundingClientRect().height + "px";
    painel.before(lugar);
    aberto = {painel: painel, botao: botao, lugar: lugar};
    botao.hidden = true;
    janela.querySelector(".tela-cheia-titulo").textContent = titulo();
    janela.querySelector(".tela-cheia-corpo").append(painel);
    var pagina = document.querySelector(".app-shell");
    if (pagina) pagina.inert = true;
    janela.hidden = false;
    janela.querySelector(".tela-cheia-fechar").focus();
  }

  function fechar() {
    if (!aberto) return;
    var a = aberto;
    aberto = null;
    a.lugar.replaceWith(a.painel);
    janela.hidden = true;
    var pagina = document.querySelector(".app-shell");
    if (pagina) pagina.inert = false;
    a.botao.hidden = false;
    a.botao.focus();
  }

  function ligar() {
    paineis().forEach(function (painel) {
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "btn btn-tertiary btn-sm tela-cheia-abrir";
      botao.innerHTML = icone("arrows-out") + "Full width";
      botao.addEventListener("click", function () { abrir(painel, botao); });
      // No INVÓLUCRO da caixa, e não dentro do painel: a parte viva tira do painel tudo o que era desenho pronto quando
      // acende (`vivo.tsx`), e o botão iria junto.
      painel.before(botao);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ligar);
  else ligar();
})();
