// DARK MODE (site B): o `ThemeToggle` redondo do cartão "light-dark", vivo. A página é estática; a peça sai parada do
// gerador (lá o tema ainda não existe, e ela nasce com a lua). Aqui ela mostra para onde VAI — a lua escura no claro, o sol
// amarelo no escuro — e, ao clicar, troca o tema pela chave de três posições do site (a parte viva do topo), que é quem
// grava a escolha: a página e o topo nunca discordam.
(function () {
  var lugar = document.querySelector(".dark-mode-alterna");
  if (!lugar) return;
  var botao = lugar.querySelector("button");
  var uso = botao && botao.querySelector("use");
  if (!botao || !uso) return;
  var raiz = document.documentElement;
  function desenhar() {
    var escuro = raiz.getAttribute("data-theme") === "dark";
    botao.classList.toggle("theme-toggle-sun", escuro);
    botao.classList.toggle("theme-toggle-moon", !escuro);
    botao.setAttribute("aria-label", escuro ? "Switch to light theme" : "Switch to dark theme");
    uso.setAttribute("href", escuro ? "#i-sun-fill" : "#i-moon-fill");
  }
  botao.addEventListener("click", function () {
    var vai = raiz.getAttribute("data-theme") === "dark" ? "light" : "dark";
    // A chave viva do site (o topo, ou a do cartão ao lado): a mesma escolha, gravada pelo provedor do site.
    var opcao = document.querySelector("[data-site-theme-switch] input[value='" + vai + "']");
    if (opcao) { opcao.click(); return; }
    // Sem a parte viva (a rede caiu): o atributo e a escolha guardada, como o script do <head> lê.
    raiz.setAttribute("data-theme", vai);
    try { localStorage.setItem("aurea-theme", vai); } catch (e) { /* sem armazenamento: vale até recarregar */ }
  });
  new MutationObserver(desenhar).observe(raiz, {attributes: true, attributeFilter: ["data-theme"]});
  desenhar();
})();
