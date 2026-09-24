/* Aurea — comportamentos reutilizáveis do core.
 *
 * Seguro em qualquer página: nenhum trecho exige elementos específicos.
 * O script interativo da documentação vive inline em apps/docs/index.html.
 * Overlays (dialog/drawer/command) ganham gestão de foco na fase Primitives.
 */
(function () {
  "use strict";
  // SSR-safe: sem DOM (Node/SSR) o script é no-op em vez de lançar
  // "document is not defined" ao ser importado (auditoria 18/07/2026, MÉDIO 13).
  if (typeof window === "undefined" || typeof document === "undefined") return;
  var root = document.documentElement;

  function activateTab(tab) {
    var list = tab.closest('[role="tablist"]');
    if (!list) return;
    var tabs = list.querySelectorAll('[role="tab"]');
    for (var i = 0; i < tabs.length; i++) {
      var active = tabs[i] === tab;
      tabs[i].classList.toggle("active", active);
      tabs[i].setAttribute("aria-selected", String(active));
      tabs[i].tabIndex = active ? 0 : -1;
      var panel = document.getElementById(tabs[i].getAttribute("aria-controls") || "");
      if (panel && panel.hasAttribute("data-aurea-tabpanel")) panel.hidden = !active;
    }
  }

  document.addEventListener("click", function (event) {
    var tab = event.target.closest && event.target.closest('[role="tab"]');
    if (tab) activateTab(tab);
  });

  document.addEventListener("keydown", function (event) {
    var list = event.target.closest && event.target.closest('[role="tablist"]');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    var next = current;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    activateTab(tabs[next]);
  });

  // Copiar código: comportamento do CORE, não do catálogo. Quem marca o gatilho com
  // [data-aurea-copy] ganha o copiar de graça — o CodeBlock do React emite esse mesmo
  // markup. Sem permissão de área de transferência, seleciona o texto pro Ctrl+C.
  function copy(trigger) {
    var scope = trigger.closest("[data-aurea-copy-scope]") || trigger.parentElement;
    var source = scope && scope.querySelector("code, pre, [data-aurea-copy-source]");
    if (!source) return;
    function done() {
      trigger.classList.add("is-done");
      setTimeout(function () { trigger.classList.remove("is-done"); }, 1500);
    }
    function select() {
      var range = document.createRange();
      range.selectNodeContents(source);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(source.textContent).then(done, select);
    } else select();
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest && event.target.closest("[data-aurea-copy]");
    if (trigger) copy(trigger);
  });

  // TableOfContents: marca sozinho a seção em vista. IntersectionObserver com uma faixa
  // estreita no alto da janela — a seção "atual" é a que cruza essa faixa, não a maior
  // visível, senão o item pisca entre duas ao rolar. Sem observer (browser antigo), o
  // índice continua sendo uma lista de links que funciona.
  function tocSpy(toc) {
    if (!window.IntersectionObserver) return;
    var links = {}, targets = [];
    var anchors = toc.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      var id = anchors[i].getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (!target) continue;
      links[id] = anchors[i];
      targets.push(target);
    }
    if (!targets.length) return;
    var seen = {};
    var observer = new IntersectionObserver(function (entries) {
      // Se o React assumiu este índice depois de nós, saímos. A ordem importa e não é
      // controlável: `initTocs` roda no DOMContentLoaded, e a hidratação pode vir depois. Sem
      // esta linha, os dois observadores escreveriam o mesmo `aria-current` com faixas
      // diferentes, e o item piscaria entre duas seções ao rolar.
      if (toc.getAttribute("data-toc-spy") === "react") { observer.disconnect(); return; }
      for (var i = 0; i < entries.length; i++) seen[entries[i].target.id] = entries[i].isIntersecting;
      // o ÚLTIMO que cruza a faixa, não o primeiro: seção e subseção cruzam juntas e o
      // item específico é o que interessa. Nada cruzando = topo da página = primeiro item.
      var current = targets[0].id;
      for (var j = 0; j < targets.length; j++) if (seen[targets[j].id]) current = targets[j].id;
      for (var id in links) {
        if (id === current) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      }
    }, {rootMargin: "0px 0px -75% 0px"});
    for (var k = 0; k < targets.length; k++) observer.observe(targets[k]);
  }
  function initTocs() {
    // `[data-toc-spy="react"]` fica de fora: o componente React observa por conta própria desde
    // 21/08/2026, e dois observadores escrevendo o mesmo `aria-current` com faixas diferentes é
    // pior que nenhum. Numa página estática — o catálogo, os docs — a marca não aparece e este
    // caminho segue sendo o único.
    var tocs = document.querySelectorAll('.toc:not([data-toc-spy="react"])');
    for (var t = 0; t < tocs.length; t++) tocSpy(tocs[t]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initTocs);
  else initTocs();

  // ── Gaveta de navegação do AppShell: o foco ────────────────────────────────────────────
  // O popover nativo NÃO entrega a mesma gestão de foco nos dois motores, e isto foi MEDIDO no
  // item K1 (09/08/2026), abrindo a gaveta e dando oito Tabs:
  //
  //                        | Chromium              | WebKit
  //   foco ao abrir        | fica no disparador    | vai para o <body>
  //   1º Tab entra na gav. | sim                   | NENHUM dos oito
  //   Escape devolve foco  | sim                   | não
  //
  // No WebKit a gaveta abre, fica visível, e o Tab passeia pelo conteúdo da página sem nunca
  // entrar nela: quem navega por teclado no Safari abre a navegação e não consegue alcançá-la.
  // É WCAG 2.1.1, e é barreira, não incômodo.
  //
  // O `AppShell` dizia, por escrito, que "o navegador entrega a volta do foco". Entregava —
  // num motor só, e ninguém tinha como ver, porque a suíte rodava só no Chromium. É o que o
  // cabeçalho do `shell-nav.spec` já temia: garantia de plataforma que ninguém verifica é
  // garantia que some sem nada ficar vermelho.
  //
  // Então a gaveta passa a mover o foco ela mesma, IGUAL nos três motores — em vez de detectar
  // qual navegador falha, que seria uma lista para manter. O custo está declarado: o shell
  // deixou de ser "sem uma linha de JS nossa". Publicar barreira de teclado custa mais.
  //
  // O `toggle` NÃO borbulha, por isso o listener é de CAPTURA — a fase de captura alcança o
  // alvo mesmo quando o evento não sobe. Trocar `true` por `false` aqui desliga tudo em
  // silêncio, e é por isso que o teste cobre os três motores.
  function focoDaGaveta(event) {
    var gaveta = event.target;
    if (!gaveta || !gaveta.matches || !gaveta.matches(".sidebar[popover]")) return;
    // `!== "closed"` e não `=== "open"`: idêntico em efeito (o ToggleEvent só tem os dois
    // valores), e a razão de ser esta forma está escrita no `layout.tsx`, ao lado da gêmea
    // desta função. As duas ficam iguais para ninguém ler uma e "corrigir" a outra.
    if (event.newState !== "closed") {
      // O foco vai para o PRIMEIRO FOCÁVEL de dentro, e não para a gaveta. A primeira versão
      // focava a gaveta — o leitor de tela anunciaria a região antes da lista — e ela reprovou
      // no WebKit: focar o contêiner funciona, mas o Tab a partir DELE salta para FORA do
      // popover (medido, com rastro de focusin/focusout). Ou seja, o WebKit não entra no
      // conteúdo do popover pela tabulação nem quando o foco já está no elemento dele.
      // Focando um item de dentro, o Tab seguinte anda na ordem do documento, dentro da lista.
      // Nada se perde no anúncio: o leitor de tela nomeia a região ao entrar nela.
      var primeiro = gaveta.querySelector(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
      if (primeiro) primeiro.focus();
      else { gaveta.tabIndex = -1; gaveta.focus(); }  // gaveta vazia: ao menos não fica órfão
    } else if (!document.activeElement || document.activeElement === document.body ||
               gaveta.contains(document.activeElement)) {
      // Só devolve se o foco ficou órfão — ao fechar, o conteúdo some e o activeElement cai no
      // <body>. Se a pessoa já moveu o foco para outro lugar, puxá-lo de volta seria roubo.
      var invoker = gaveta.id && document.querySelector('[popovertarget="' + gaveta.id + '"]');
      if (invoker) invoker.focus();
    }
  }
  document.addEventListener("toggle", focoDaGaveta, true);

  // ── Gaveta de navegação: o FECHAMENTO (A-06 e A-07, 23/09/2026) ─────────────────────────
  // A gaveta abria por popover e nada a fechava por código — só Escape e clique fora. Faltavam os
  // dois gatilhos que o uso real dispara primeiro, e os dois têm gêmeo no `@aurea-uds/react`
  // (`Sidebar` e `AppShell`): este runtime serve a página sem React, aquele serve quem instala só
  // o pacote de componentes. Rodar os dois é inofensivo — o segundo encontra a gaveta já fechada.
  //
  // 1. Escolher um item fecha. A página mudou por baixo; a gaveta na frente dela esconde a mudança.
  function estaAberta(gaveta) {
    try { return gaveta.matches(":popover-open"); } catch (_) { return false; }  // motor sem popover
  }
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || !event.target || !event.target.closest) return;
    var alvo = event.target.closest("a[href], .sidebar-item");
    var gaveta = alvo && alvo.closest(".sidebar[popover]");
    if (gaveta && estaAberta(gaveta)) gaveta.hidePopover();
  });
  // 2. Subir para o desktop fecha. O top layer é estado do DOM, e nenhuma media query tira um
  // elemento de lá: sem isto a gaveta ficava flutuando, sem véu, e o botão que a fecharia sumia.
  // 1024 é o `--breakpoint-lg`, o mesmo corte do `@media (max-width:1023px)` acima; o
  // `consumidores-lote1.test` reprova se os dois divergirem.
  if (typeof window.matchMedia === "function") {
    var desktop = window.matchMedia("(min-width: 1024px)");
    var aoSubir = function (e) {
      if (!e.matches) return;
      var abertas = document.querySelectorAll(".sidebar[popover]");
      for (var g = 0; g < abertas.length; g++) if (estaAberta(abertas[g])) abertas[g].hidePopover();
    };
    if (desktop.addEventListener) desktop.addEventListener("change", aoSubir);
  }

  function toastStack() {
    var stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }

  function showToast(title, message) {
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    var body = document.createElement("div");
    var strong = document.createElement("strong");
    strong.textContent = title;
    body.appendChild(strong);
    if (message) {
      var text = document.createElement("div");
      text.className = "muted";
      text.textContent = message;
      body.appendChild(text);
    }
    var close = document.createElement("button");
    close.type = "button";
    close.className = "btn btn-ghost btn-icon btn-sm";
    close.setAttribute("aria-label", "Dispensar notificação");
    close.textContent = "×";
    toast.appendChild(body);
    toast.appendChild(close);

    var timer;
    function remove() { clearTimeout(timer); toast.remove(); }
    function schedule() { clearTimeout(timer); timer = setTimeout(remove, 4800); }
    close.addEventListener("click", remove);
    toast.addEventListener("mouseenter", function () { clearTimeout(timer); });
    toast.addEventListener("mouseleave", schedule);
    toast.addEventListener("focusin", function () { clearTimeout(timer); });
    toast.addEventListener("focusout", function (event) {
      if (!toast.contains(event.relatedTarget)) schedule();
    });
    toastStack().appendChild(toast);
    schedule();
    return toast;
  }

  window.Aurea = {
    setTheme: function (theme) { root.dataset.theme = theme; },
    setDensity: function (density) { root.dataset.density = density; },
    toggleTheme: function () {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    },
    showToast: showToast,
    copy: copy
  };
})();

// O preview que mora em documento próprio (iframe) não herda o tema: cada documento tem o seu
// data-theme. Ele pede o tema ao carregar, e recebe de novo a cada troca.
const espelhaTema = alvo => (alvo ? [alvo] : [...document.querySelectorAll("iframe.demo-frame")]
  .map(f => f.contentWindow)).forEach(w => w && w.postMessage({aureaTheme: document.documentElement.dataset.theme,
    aureaBrand: document.documentElement.dataset.brand || ""}, "*"));
addEventListener("message", e => { if (e.data && e.data.aureaThemeRequest) espelhaTema(e.source); });
// Quem GRAVA é o catálogo; quem aplica no primeiro quadro é o script inline do <head>. O core só
// troca o atributo — ver o comentário em TEMA_SALVO.
document.addEventListener("click", e => {
  if (e.target.closest("#theme-toggle")) {
    window.Aurea.toggleTheme();
    espelhaTema();
    try { localStorage.setItem("aurea-theme", document.documentElement.dataset.theme); } catch (err) {}
  }
});
// A MARCA troca pelo mesmo caminho do tema: atributo no <html>, gravado, espelhado nos iframes.
// 'change' e não 'click': em 'select' o clique acontece antes de a opção mudar, e o teclado não
// clica — quem escolhe com as setas nunca dispararia o handler.
// Valor vazio = SEM marca, e é assim que a Aurea volta a ser a Aurea: 'delete' do atributo, não
// 'data-brand="aurea"'. Marca padrão não tem nome porque não é marca — é o padrão (ADR-0036).
document.addEventListener("change", e => {
  const alvo = e.target.closest("#brand-select");
  if (!alvo) return;
  if (alvo.value) document.documentElement.dataset.brand = alvo.value;
  else delete document.documentElement.dataset.brand;
  espelhaTema();
  try { localStorage.setItem("aurea-brand", alvo.value); } catch (err) {}
});
// E o seletor tem de MOSTRAR a marca que está valendo quando a página remonta — cada página do
// catálogo é documento novo, e o <select> voltaria para "Aurea" com a página em laranja.
addEventListener("DOMContentLoaded", () => {
  const alvo = document.querySelector("#brand-select");
  if (alvo) alvo.value = document.documentElement.dataset.brand || "";
});

// -- a lateral abre onde voce parou ------------------------------------------------------
// Cada pagina e um documento novo, entao a lateral remontava rolada no topo: escolher um
// componente do fim da lista e ter de descer de novo para pegar o proximo (relatado em
// 13/08/2026, junto com o tema).
//
// Enquadrar o item ATUAL, e nao restaurar o scrollTop guardado. Os dois resolvem o incomodo, e
// este tem menos peca: nao precisa de storage (logo nao depende de file://), e nao tem o modo de
// falha do outro -- chegar por busca, pelo indice ou por link direto deixaria uma posicao
// guardada que nao corresponde ao item aberto.
//
// Aritmetica em vez de scrollIntoView: scrollIntoView rola TODOS os ancestrais roláveis, e o
// documento junto -- a pagina saltaria. Aqui so o scrollTop da lateral se mexe.
//
// O aria-current e escopado a lateral porque a nav de secoes do topo tambem marca o dela.
const enquadrarLateral = () => {
  const lateral = document.querySelector(".sidebar");
  // Abaixo de 768px a lateral vira estatica (nao rola sozinha) e este guarda a desliga: sem ele,
  // mexer no scrollTop de quem nao rola e no-op, mas o calculo ja teria lido rects a toa.
  if (!lateral || lateral.scrollHeight <= lateral.clientHeight) return;
  const atual = lateral.querySelector('[aria-current="page"]');
  if (!atual) return;
  const a = atual.getBoundingClientRect(), l = lateral.getBoundingClientRect();
  // Ja visivel inteiro: nao mexer. Rolar um item que a pessoa ja esta vendo e movimento gratuito.
  if (a.top >= l.top && a.bottom <= l.bottom) return;
  // Centralizado, e nao "o mais perto possivel": o que ele faz em seguida e escolher o VIZINHO,
  // entao precisa ver o que vem antes e depois, nao o item colado na borda.
  lateral.scrollTop += a.top - l.top - (l.height - a.height) / 2;
};
enquadrarLateral();

// -- enquadrar o grafo -------------------------------------------------------------------
// O DependencyGraph renderiza inteiro no servidor (no, aresta e um fitView calculado sobre a
// EXTENSAO do layout), mas o servidor nao sabe a largura do painel de demo -- que muda com a
// janela. Sem isto o grafo sai com os primeiros nos dentro e o resto cortado pelo
// overflow:hidden: medido no catalogo, 2 de 5 visiveis numa caixa de 635px.
//
// O enquadramento e uma transformacao de viewport, e e aritmetica -- nao precisa do motor. Isto
// e chrome do CATALOGO, no mesmo lugar onde ja moram as abas e o tema; em aplicacao de verdade
// quem resolve e o fitView do proprio motor, que roda no navegador.
const enquadrarGrafos = () => {
  for (const tela of document.querySelectorAll(".dependency-graph")) {
    const viewport = tela.querySelector(".react-flow__viewport");
    const nos = [...tela.querySelectorAll(".react-flow__node")];
    if (!viewport || !nos.length) continue;
    // A posicao do no esta no transform dele, em coordenada de GRAFO -- ler dali evita medir a
    // tela ja transformada, que devolveria a conta que estamos tentando fazer.
    // DOMMatrix e nao expressao regular, e isto e cicatriz: este bloco e emitido de dentro de
    // um TEMPLATE LITERAL, e la a barra invertida de um d desaparece antes de virar codigo.
    // A primeira versao usava regex, saiu no catalog.js como [d.] e nao casava com nada -- o
    // enquadramento simplesmente nao rodava, sem erro nenhum no console.
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const no of nos) {
      if (!no.style.transform) continue;
      const m = new DOMMatrix(no.style.transform);
      const x = m.m41, y = m.m42;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x + no.offsetWidth); y1 = Math.max(y1, y + no.offsetHeight);
    }
    if (!isFinite(x0)) continue;
    const folga = 24, larg = tela.clientWidth - folga * 2, alt = tela.clientHeight - folga * 2;
    // Nunca AMPLIA: um grafo de dois nos esticado ate encher a caixa vira caricatura.
    const escala = Math.min(larg / (x1 - x0), alt / (y1 - y0), 1);
    const dx = folga + (larg - (x1 - x0) * escala) / 2 - x0 * escala;
    const dy = folga + (alt - (y1 - y0) * escala) / 2 - y0 * escala;
    viewport.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + escala + ")";
  }
};
enquadrarGrafos();
addEventListener("resize", enquadrarGrafos);