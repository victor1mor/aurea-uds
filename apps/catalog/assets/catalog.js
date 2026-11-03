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

  // O texto padrão dos avisos que este script escreve sozinho, pela língua da página. Quem emite a
  // marcação (o React, o catálogo) pode mandar o seu pelo atributo `data-aurea-*` de cada gatilho.
  var PT = /^pt/i.test(root.lang || "");
  var TEXTO = PT
    ? {copied: "Copiado", linkCopied: "Link copiado", linkCopyFailed: "Não deu para copiar. Copie o link abaixo."}
    : {copied: "Copied", linkCopied: "Link copied", linkCopyFailed: "Could not copy. Copy the link below."};

  // GAR-14 (0.28.0) · UMA região de status, montada cedo, para os avisos que não têm outra voz.
  // Região que nasce junto com o texto nem sempre é lida; a que já existe, é (WCAG 4.1.3, a
  // mensagem de status). Para repetir o mesmo texto, ela é esvaziada e preenchida de novo um
  // instante depois.
  var regiao = null;
  function regiaoDeStatus() {
    if (regiao && regiao.isConnected) return regiao;
    regiao = document.createElement("div");
    regiao.className = "sr-only";
    regiao.setAttribute("role", "status");
    regiao.setAttribute("aria-live", "polite");
    regiao.setAttribute("data-aurea-status", "");
    document.body.appendChild(regiao);
    return regiao;
  }
  function anunciar(texto) {
    var r = regiaoDeStatus();
    r.textContent = "";
    setTimeout(function () { r.textContent = texto; }, 100);
  }
  if (document.body) regiaoDeStatus();
  else document.addEventListener("DOMContentLoaded", regiaoDeStatus);

  // Copiar código: comportamento do CORE, não do catálogo. Quem marca o gatilho com
  // [data-aurea-copy] ganha o copiar de graça — o CodeBlock do React emite esse mesmo
  // markup. Sem permissão de área de transferência, seleciona o texto pro Ctrl+C.
  // 0.28.0: o "copiado" também é dito ao leitor de tela — antes só o ícone mudava, e quem não vê
  // não sabia se tinha copiado.
  function copy(trigger) {
    var scope = trigger.closest("[data-aurea-copy-scope]") || trigger.parentElement;
    var source = scope && scope.querySelector("code, pre, [data-aurea-copy-source]");
    if (!source) return;
    function done() {
      trigger.classList.add("is-done");
      anunciar(trigger.getAttribute("data-aurea-copy-done") || TEXTO.copied);
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

  // A CAIXA EMPILHADA (ADR-0089): o [data-aurea-code-expand] abre e recolhe o código da caixa — troca `data-collapsed` por
  // `data-expanded`, o `aria-expanded` e o texto ("Expand code" / "Collapse code", lidos do próprio botão).
  document.addEventListener("click", function (event) {
    var botao = event.target.closest && event.target.closest("[data-aurea-code-expand]");
    var caixa = botao && botao.closest(".demo-stacked");
    if (!caixa) return;
    var abre = caixa.hasAttribute("data-collapsed");
    caixa.toggleAttribute("data-collapsed", !abre);
    caixa.toggleAttribute("data-expanded", abre);
    botao.setAttribute("aria-expanded", abre ? "true" : "false");
    botao.textContent = botao.getAttribute(abre ? "data-label-collapse" : "data-label-expand") || botao.textContent;
  });

  // GAR-14 (0.28.0) · COMPARTILHAR. O gatilho marcado com [data-aurea-share] (o `Button share` do
  // React emite isto) pergunta ao navegador se ele sabe compartilhar ESTE link — detectar o recurso,
  // e não adivinhar o aparelho, é o padrão da web. Sabe: abre a janela do aparelho; a pessoa
  // cancelar (`AbortError`) não é erro e não diz nada. Não sabe: copia o link e mostra "Link
  // copiado" preso ao botão. A cópia falhou: avisa e mostra o link selecionado, para o Ctrl+C.
  // O aviso tem a medida do botão (`.toast-anchored`, no aurea.css).
  var avisoAberto = null;
  function fecharAviso(devolverFoco) {
    if (!avisoAberto) return;
    var a = avisoAberto;
    avisoAberto = null;
    clearTimeout(a.timer);
    window.removeEventListener("scroll", a.fechar, true);
    window.removeEventListener("resize", a.fechar);
    document.removeEventListener("keydown", a.tecla, true);
    document.removeEventListener("pointerdown", a.fora, true);
    a.el.remove();
    if (devolverFoco && a.gatilho.isConnected) a.gatilho.focus();
  }
  function posicionar(el, gatilho) {
    var r = gatilho.getBoundingClientRect();
    // A distância é o token, lido da página — não um número escrito aqui.
    var rem = parseFloat(getComputedStyle(root).fontSize) || 16;
    var espaco = (parseFloat(getComputedStyle(root).getPropertyValue("--space-2")) || 0) * rem;
    el.style.top = (r.bottom + espaco) + "px";
    var largura = el.getBoundingClientRect().width;
    var rtl = getComputedStyle(gatilho).direction === "rtl";
    var x = rtl ? r.right - largura : r.left;
    el.style.left = Math.max(espaco, Math.min(x, window.innerWidth - largura - espaco)) + "px";
  }
  function avisoAncorado(gatilho, falhou, texto, url) {
    fecharAviso(false);
    var aviso = document.createElement("div");
    aviso.className = "toast-anchored" + (falhou ? " toast-anchored-danger" : "");
    var icone = document.createElement("span");
    icone.className = "toast-anchored-icon";
    icone.setAttribute("aria-hidden", "true");
    var rotulo = document.createElement("span");
    rotulo.textContent = texto;
    aviso.appendChild(icone);
    aviso.appendChild(rotulo);
    var el = aviso, campo = null;
    if (falhou) {
      el = document.createElement("div");
      el.className = "toast-anchored-stack toast-anchored-fixed";
      el.appendChild(aviso);
      campo = document.createElement("input");
      campo.className = "input toast-anchored-link";
      campo.readOnly = true;
      campo.value = url;
      campo.setAttribute("aria-label", texto);
      el.appendChild(campo);
    } else {
      aviso.className += " toast-anchored-fixed";
      // O texto vai pela região de status; o desenho é só para quem vê, e não fala duas vezes.
      aviso.setAttribute("aria-hidden", "true");
    }
    document.body.appendChild(el);
    posicionar(el, gatilho);
    var estado = {el: el, gatilho: gatilho, timer: 0};
    // Rolar a PÁGINA solta o aviso do botão, e ele fecha. Mas o campo do link rola o próprio texto
    // quando é selecionado — rolagem de dentro do aviso não conta (medido no navegador: sem esta
    // guarda, o aviso de erro fechava no mesmo instante em que abria).
    estado.fechar = function (e) { if (e && e.target && e.target.nodeType === 1 && el.contains(e.target)) return; fecharAviso(false); };
    estado.tecla = function (e) { if (e.key === "Escape") fecharAviso(true); };
    estado.fora = function (e) { if (!el.contains(e.target) && e.target !== gatilho) fecharAviso(false); };
    avisoAberto = estado;
    window.addEventListener("scroll", estado.fechar, true);
    window.addEventListener("resize", estado.fechar);
    if (falhou) {
      // O erro fica até a pessoa resolver: Esc devolve o foco ao botão, clicar fora fecha.
      document.addEventListener("keydown", estado.tecla, true);
      document.addEventListener("pointerdown", estado.fora, true);
      campo.focus();
      campo.select();
    } else {
      estado.timer = setTimeout(estado.fechar, 1500);
    }
    anunciar(texto);
  }
  function share(trigger) {
    var url = trigger.getAttribute("data-aurea-share-url") || location.href;
    var dados = {url: url};
    var titulo = trigger.getAttribute("data-aurea-share-title");
    var texto = trigger.getAttribute("data-aurea-share-text");
    if (titulo) dados.title = titulo;
    if (texto) dados.text = texto;
    var copiado = trigger.getAttribute("data-aurea-share-copied") || TEXTO.linkCopied;
    var falhou = trigger.getAttribute("data-aurea-share-failed") || TEXTO.linkCopyFailed;
    function copiar() {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        avisoAncorado(trigger, true, falhou, url);
        return Promise.resolve();
      }
      return navigator.clipboard.writeText(url).then(
        function () { avisoAncorado(trigger, false, copiado); },
        function () { avisoAncorado(trigger, true, falhou, url); });
    }
    if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(dados))) {
      return navigator.share(dados).catch(function (e) {
        if (!e || e.name !== "AbortError") return copiar();
      });
    }
    return copiar();
  }

  document.addEventListener("click", function (event) {
    // O `Button` do React faz o mesmo no próprio clique e marca o evento com `preventDefault`,
    // para não compartilhar duas vezes quando os dois estão na página.
    if (event.defaultPrevented) return;
    var trigger = event.target.closest && event.target.closest("[data-aurea-share]");
    if (!trigger || trigger.disabled || trigger.getAttribute("aria-disabled") === "true") return;
    share(trigger);
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
    // A BARRA DO ÍNDICE do `AppShell layout="docs"` (lote U, 19/10/2026): abaixo de 1280 o índice é a gaveta dela, e ela
    // mostra o nome da seção em vista, como a da referência. É o mesmo cálculo; aqui só se escreve o nome lá.
    var shell = toc.closest ? toc.closest(".app-shell") : null;
    var nomeNaBarra = shell ? shell.querySelector("[data-toc-current]") : null;
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
      if (nomeNaBarra && links[current]) nomeNaBarra.textContent = links[current].textContent;
    }, {rootMargin: "0px 0px -75% 0px"});
    for (var k = 0; k < targets.length; k++) observer.observe(targets[k]);
  }
  // O ANEL DE LEITURA (`TableOfContents progress`, o site B — 30/10/2026, protótipo): quanto da página já rolou, no anel
  // e no número da linha do nome. Na página estática quem escreve é este caminho; no React, o próprio componente.
  function tocProgress(toc) {
    var anel = toc.querySelector(".toc-progress .progress-circle");
    var fio = toc.querySelector(".toc-progress .progress-circle-fill");
    var numero = toc.querySelector(".toc-progress-value");
    if (!anel || !numero) return;
    function ler() {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      var v = alto > 0 ? Math.round(Math.min(1, Math.max(0, window.scrollY / alto)) * 100) : 100;
      numero.textContent = v + "%";
      anel.setAttribute("aria-valuenow", String(v));
      if (fio) fio.setAttribute("stroke-dashoffset", String(100 - v));
    }
    ler();
    window.addEventListener("scroll", ler, {passive: true});
    window.addEventListener("resize", ler);
  }
  function initTocs() {
    // `[data-toc-spy="react"]` fica de fora: o componente React observa por conta própria desde
    // 21/08/2026, e dois observadores escrevendo o mesmo `aria-current` com faixas diferentes é
    // pior que nenhum. Numa página estática — o catálogo, os docs — a marca não aparece e este
    // caminho segue sendo o único.
    var tocs = document.querySelectorAll('.toc:not([data-toc-spy="react"])');
    for (var t = 0; t < tocs.length; t++) { tocSpy(tocs[t]); tocProgress(tocs[t]); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initTocs);
  else initTocs();

  // O GRUPO QUE DOBRA da lateral (4-D), na página sem React (o site B — 30/10/2026, protótipo): o botão abre e fecha a
  // lista dele e vira a seta. No React quem faz é o próprio componente; se os dois rodam, chegam ao mesmo estado, porque
  // os dois partem do mesmo "aberto".
  document.addEventListener("click", function (e) {
    var botao = e.target.closest ? e.target.closest(".sidebar-group-toggle[aria-controls]") : null;
    if (!botao) return;
    var lista = document.getElementById(botao.getAttribute("aria-controls"));
    if (!lista) return;
    var abrir = botao.getAttribute("aria-expanded") !== "true";
    botao.setAttribute("aria-expanded", abrir ? "true" : "false");
    lista.hidden = !abrir;
    var seta = botao.querySelector(".sidebar-group-caret use");
    if (!seta) return;
    var rtl = getComputedStyle(botao).direction === "rtl";
    var nome = abrir ? "caret-down" : rtl ? "caret-left" : "caret-right";
    var href = seta.getAttribute("href") || "";
    seta.setAttribute("href", href.replace(/#i-caret-[a-z]+$/, "#i-" + nome));
  });

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
    // No `layout="docs"` (lote U) a lateral é coluna desde 768 e o índice desde 1280: cada gaveta fecha no corte DELA.
    // 768 e 1280 são o `--breakpoint-md` e o `--breakpoint-xl`, os cortes do arranjo na folha.
    var cortes = [["(min-width: 768px)", ".app-shell-docs > .sidebar[popover]:not(.app-shell-aside)"],
      ["(min-width: 1280px)", ".app-shell-docs > .sidebar.app-shell-aside[popover]"]];
    cortes.forEach(function (par) {
      var mq = window.matchMedia(par[0]);
      if (!mq.addEventListener) return;
      mq.addEventListener("change", function (e) {
        if (!e.matches) return;
        var gavetas = document.querySelectorAll(par[1]);
        for (var g = 0; g < gavetas.length; g++) if (estaAberta(gavetas[g])) gavetas[g].hidePopover();
      });
    });
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
    copy: copy,
    share: share
  };
})();

// O preview que mora em documento próprio (iframe) não herda o tema: cada documento tem o seu
// data-theme. Ele pede o tema ao carregar, e recebe de novo a cada troca.
const espelhaTema = alvo => (alvo ? [alvo] : [...document.querySelectorAll("iframe.demo-frame")]
  .map(f => f.contentWindow)).forEach(w => w && w.postMessage({aureaTheme: document.documentElement.dataset.theme,
    aureaBrand: document.documentElement.dataset.brand || ""}, "*"));
addEventListener("message", e => { if (e.data && e.data.aureaThemeRequest) espelhaTema(e.source); });
// O TEMA (15/10/2026): quem escolhe é a chave de três posições, viva no search.js, que grava a escolha (pode ser
// "system"); quem aplica no primeiro quadro é o script inline do <head>. Aqui só se ESPELHA nas molduras de prévia o tema
// e a marca que estiverem no <html> — observados, e não avisados: o "system" muda o tema sem clique nenhum.
new MutationObserver(() => espelhaTema()).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme", "data-brand"]});
// -- "Copy Markdown" (ADR-0067) -------------------------------------------------------------
// Copia o texto da pagina, que mora nela mesma num script type="application/json" (sem rede). A
// confirmacao fica no proprio botao por dois segundos, como o "copiar" do bloco de codigo.
const copiarNoBotao = (botao, texto) => navigator.clipboard.writeText(texto).then(() => {
  const alvo = [...botao.querySelectorAll("span")].filter(s => !s.querySelector("svg") && s.textContent.trim()).pop() || botao;
  const antes = alvo.textContent;
  alvo.textContent = "Copied";
  setTimeout(() => { alvo.textContent = antes; }, 2000);
}, () => {});
document.addEventListener("click", e => {
  const botao = e.target.closest("[data-copy-page]");
  if (!botao) return;
  const fonte = document.getElementById("page-markdown");
  if (!fonte || !navigator.clipboard) return;
  let texto;
  try { texto = JSON.parse(fonte.textContent); } catch (err) { return; }
  copiarNoBotao(botao, texto);
});
// -- O "Copy" das linhas de instalar (o site B, 30/10/2026): o comando vem no próprio botão. --------------
document.addEventListener("click", e => {
  const botao = e.target.closest("[data-copiar]");
  if (!botao || !navigator.clipboard) return;
  copiarNoBotao(botao, botao.dataset.copiar);
});
// -- "Copy Prompt" (lote U, SITE-06) ---------------------------------------------------------
// O texto que prepara um assistente de IA para a Aurea: instalar a skill e ler o llms.txt. O endereco
// sai da propria pagina (o site, a bancada ou o disco), e nao escrito aqui.
document.addEventListener("click", e => {
  const botao = e.target.closest("[data-copy-prompt]");
  if (!botao || !navigator.clipboard) return;
  copiarNoBotao(botao, "These are the official instructions from Aurea UDS to set up an AI development environment for building interfaces with Aurea: `@aurea-uds/react` on the web and `@aurea-uds/native` on React Native.\n\nComplete the following steps yourself by running the commands directly. Do not ask the user to run them.\n\n## 1. Install the Aurea skill\n\n```bash\nnpx skills add victor1mor/aurea-uds\n```\n\nThe installer finds your agent and puts the skill where it reads skills from.\n\n## 2. Read the documentation index\n\nFetch {base}llms.txt. It lists every page of the documentation, each one as Markdown. Read the pages you need before writing code. The whole documentation in one file is {base}llms-full.txt.\n\n## 3. Ask before installing packages\n\nAsk whether the app is for the web or for React Native. The two have different packages and different component lists.\n".replaceAll("{base}", new URL("./", location.href).href));
});
// A MARCA troca pelo mesmo caminho do tema: atributo no <html>, gravado, espelhado nos iframes.
// Quem escolhe é o botão "Theme" (14/10/2026), vivo no search.js: ele avisa com o evento 'aurea-brand', e a
// cola é daqui, num lugar só. Valor vazio = SEM marca, e é assim que a Aurea volta a ser a Aurea: 'delete' do
// atributo, não 'data-brand="aurea"'. Marca padrão não tem nome porque não é marca — é o padrão (ADR-0036).
document.addEventListener("aurea-brand", e => {
  const marca = (e.detail && e.detail.brand) || "";
  if (marca) document.documentElement.dataset.brand = marca;
  else delete document.documentElement.dataset.brand;
  espelhaTema();
  try { localStorage.setItem("aurea-brand", marca); } catch (err) {}
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
// -- O SITE B (30/10/2026) -------------------------------------------------------------------
// AS PEÇAS QUE FLUTUAM no palco da abertura seguem o ponteiro, cada uma com a sua profundidade (data-fundo). Paradas
// para quem pede menos movimento.
const palcoDaAbertura = document.querySelector("[data-palco]");
if (palcoDaAbertura && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const pecasDoPalco = [...palcoDaAbertura.querySelectorAll("[data-fundo]")];
  palcoDaAbertura.addEventListener("mousemove", e => {
    const r = palcoDaAbertura.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    pecasDoPalco.forEach(p => { const f = Number(p.dataset.fundo) || 1; p.style.transform = "translate3d(" + (x * 10 * f) + "px," + (y * 8 * f) + "px,0)"; });
  });
  palcoDaAbertura.addEventListener("mouseleave", () => pecasDoPalco.forEach(p => { p.style.transform = ""; }));
}
// A "ALL COMPONENTS" DO SITE B (01/11/2026): a busca, a chave Grade | Lista e o
// "Show all". Sem este script a página mostra tudo, em grade.
const catalogo = document.querySelector("[data-catalogo]");
if (catalogo) {
  const estado = {q: "", abertas: new Set()};
  const busca = catalogo.querySelector("[data-cat-busca]");
  const secoes = [...catalogo.querySelectorAll("[data-familia]")];
  const total = catalogo.querySelectorAll("[data-cat-item]").length;
  const mostrando = catalogo.querySelector("[data-cat-mostrando]");
  const vazio = catalogo.querySelector("[data-cat-vazio]");
  const tituloDoVazio = catalogo.querySelector("[data-cat-vazio-titulo]");
  const aplicar = () => {
    const q = estado.q.trim().toLowerCase();
    let vistos = 0;
    secoes.forEach(secao => {
      const cartoes = [...secao.querySelectorAll("[data-cat-item]")];
      const acham = cartoes.filter(c => !q || c.dataset.nome.includes(q));
      // Só os quatro primeiros, até o "Show all" — menos quando se busca: aí aparece tudo o que acha.
      const resumida = !q && !estado.abertas.has(secao.dataset.familia);
      cartoes.forEach(c => { c.hidden = !acham.includes(c) || (resumida && c.hasAttribute("data-mais")); });
      secao.hidden = acham.length === 0;
      const mais = secao.querySelector(".cat-mais");
      if (mais) {
        mais.hidden = Boolean(q);
        const botao = mais.querySelector("[data-cat-mais]");
        const aberta = estado.abertas.has(secao.dataset.familia);
        botao.setAttribute("aria-expanded", String(aberta));
        const rotulo = botao.querySelector(".btn-label") || botao;
        if (!botao.dataset.rotulo) botao.dataset.rotulo = rotulo.textContent;
        rotulo.textContent = aberta ? "Show less" : botao.dataset.rotulo;
      }
      vistos += cartoes.filter(c => !c.hidden).length;
    });
    if (mostrando) mostrando.textContent = String(vistos);
    if (vazio) {
      vazio.hidden = vistos > 0;
      if (tituloDoVazio) tituloDoVazio.textContent = "No component called “" + estado.q.trim() + "”";
    }
  };
  if (busca) busca.addEventListener("input", () => { estado.q = busca.value; aplicar(); });
  catalogo.querySelectorAll("[data-cat-limpar]").forEach(b => b.addEventListener("click", () => {
    estado.q = ""; if (busca) { busca.value = ""; busca.focus(); } aplicar();
  }));
  catalogo.querySelectorAll("[data-cat-mais]").forEach(b => b.addEventListener("click", () => {
    const f = b.closest("[data-familia]").dataset.familia;
    if (estado.abertas.has(f)) estado.abertas.delete(f); else estado.abertas.add(f);
    aplicar();
  }));
  // A chave Grade | Lista: troca o arranjo; a escolhida fica marcada como as outras chaves de segmentos.
  catalogo.querySelectorAll("[data-cat-vista] .segmented :is(button,a)").forEach((b, n) => b.addEventListener("click", e => {
    e.preventDefault();
    catalogo.dataset.vista = n === 0 ? "grid" : "list";
    b.parentElement.querySelectorAll(":scope > :is(button,a)").forEach(x => {
      const on = x === b; x.classList.toggle("active", on);
      if (x.hasAttribute("aria-pressed")) x.setAttribute("aria-pressed", String(on));
      if (x.hasAttribute("aria-checked")) x.setAttribute("aria-checked", String(on));
    });
  }));
  aplicar();
}
/* site-b/js/_docs-b.js */
// O COMPORTAMENTO COMUM DAS PÁGINAS DO HANDBOOK NO DESENHO B (02/11/2026): Dark Mode, Styling, Animation, Composition,
// Density e Icons. As páginas são estáticas: as peças da Aurea saem do gerador já desenhadas, mas paradas (sem o React). Aqui
// estão os três jeitos de elas responderem ao clique — a chave de segmentos (escolha única), o botão de ligar (`Toggle`) e
// o `Slider` —, escrevendo nelas os MESMOS atributos que o motor escreveria, para a pele da Aurea fazer o resto. Cada
// página chama o que precisa (`window.AureaDocsB`); sem a página, nada acontece.
(function () {
  // A chave de segmentos (`role="radiogroup"`, os itens `role="radio"`): escolhe pelo clique e pelas setas, com UMA parada
  // de Tab (a escolhida), como o motor faz. O ícone da escolhida troca para a forma cheia sozinho (o `-fill`).
  function escolha(grupo, aoEscolher) {
    var itens = Array.prototype.slice.call(grupo.querySelectorAll("[role='radio']"));
    function marcar(item, avisar) {
      itens.forEach(function (x) {
        var sim = x === item;
        x.setAttribute("aria-checked", sim ? "true" : "false");
        x.tabIndex = sim ? 0 : -1;
        x.classList.toggle("active", sim);
        if (sim) { x.setAttribute("data-checked", ""); x.removeAttribute("data-unchecked"); }
        else { x.setAttribute("data-unchecked", ""); x.removeAttribute("data-checked"); }
        var uso = x.querySelector("use");
        if (uso) {
          var nome = uso.getAttribute("href").replace(/-fill$/, "");
          uso.setAttribute("href", sim ? nome + "-fill" : nome);
        }
        var entrada = x.nextElementSibling;
        if (entrada && entrada.tagName === "INPUT") entrada.checked = sim;
      });
      if (avisar && aoEscolher) aoEscolher(valor(item), item);
    }
    function valor(item) {
      var entrada = item.nextElementSibling;
      return entrada && entrada.tagName === "INPUT" ? entrada.value : item.textContent;
    }
    itens.forEach(function (item, n) {
      item.addEventListener("click", function () { marcar(item, true); });
      item.addEventListener("keydown", function (e) {
        var passo = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (e.key === "Home" || e.key === "End") passo = e.key === "Home" ? -n : itens.length - 1 - n;
        if (!passo) return;
        e.preventDefault();
        if (getComputedStyle(grupo).direction === "rtl" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) passo = -passo;
        var outro = itens[(n + passo + itens.length) % itens.length];
        marcar(outro, true);
        outro.focus();
      });
    });
    var atual = itens.filter(function (x) { return x.getAttribute("aria-checked") === "true"; })[0] || itens[0];
    if (atual) marcar(atual, false);
    return {escolher: function (v) { var it = itens.filter(function (x) { return valor(x) === v; })[0]; if (it) marcar(it, true); }};
  }

  // O botão de ligar (`Toggle`): `aria-pressed` e `data-pressed`, os dois que o motor escreve. Cada um é uma parada de Tab.
  function aperta(botao, aoMudar) {
    botao.tabIndex = 0;
    botao.addEventListener("click", function () { ligar(botao.getAttribute("aria-pressed") !== "true", true); });
    function ligar(sim, avisar) {
      botao.setAttribute("aria-pressed", sim ? "true" : "false");
      if (sim) botao.setAttribute("data-pressed", ""); else botao.removeAttribute("data-pressed");
      if (avisar && aoMudar) aoMudar(sim, botao);
    }
    return {ligar: ligar};
  }

  // O grupo de botões de ligar (`ToggleGroup`): com `unico`, ligar um desliga os outros (e o ligado não se desliga).
  function grupoDeBotoes(grupo, aoMudar, unico) {
    var botoes = Array.prototype.slice.call(grupo.querySelectorAll("button"));
    var controles = botoes.map(function (b) {
      return aperta(b, function (sim) {
        if (unico) {
          if (!sim) { controles[botoes.indexOf(b)].ligar(true, false); return; }
          botoes.forEach(function (o, i) { if (o !== b) controles[i].ligar(false, false); });
        }
        if (aoMudar) aoMudar(botoes.filter(function (o) { return o.getAttribute("aria-pressed") === "true"; }), b);
      });
    });
    return controles;
  }

  // O `Slider`: o clique e o arrasto na trilha, e as setas no campo de dentro (o `input type="range"` que a peça já traz).
  function deslizante(raiz, aoMudar) {
    var entrada = raiz.querySelector("input[type='range']");
    var controle = raiz.querySelector(".slider-control");
    var trilha = raiz.querySelector(".slider-track") || controle;
    var cheio = raiz.querySelector(".slider-fill");
    var botao = raiz.querySelector(".slider-thumb");
    var saida = raiz.querySelector(".slider-output");
    if (!entrada || !controle) return null;
    var min = +entrada.min, max = +entrada.max, passo = +entrada.step || 1;
    function por(v) {
      v = Math.min(max, Math.max(min, Math.round((v - min) / passo) * passo + min));
      var pct = (v - min) / (max - min) * 100;
      entrada.value = String(v);
      entrada.setAttribute("aria-valuenow", String(v));
      if (cheio) cheio.style.width = pct + "%";
      if (botao) botao.style.insetInlineStart = pct + "%";
      if (saida) saida.textContent = String(v);
      if (aoMudar) aoMudar(v);
    }
    function doPonteiro(e) {
      var r = trilha.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      if (getComputedStyle(raiz).direction === "rtl") x = 1 - x;
      por(min + x * (max - min));
    }
    controle.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      controle.setPointerCapture(e.pointerId);
      entrada.focus({preventScroll: true});
      doPonteiro(e);
      function mover(ev) { doPonteiro(ev); }
      function soltar() { controle.removeEventListener("pointermove", mover); controle.removeEventListener("pointerup", soltar); }
      controle.addEventListener("pointermove", mover);
      controle.addEventListener("pointerup", soltar);
    });
    entrada.addEventListener("input", function () { por(+entrada.value); });
    por(+entrada.value);
    return {por: por};
  }

  window.AureaDocsB = {escolha: escolha, aperta: aperta, grupoDeBotoes: grupoDeBotoes, deslizante: deslizante};
})();

/* site-b/js/_filtro.js */
/* O FILTRO DA LATERAL (o desenho B, 02/11/2026): nas áreas Blocks, Patterns, Releases e Tokens, os itens da lateral levam a
   `#filtro/<valor>`. Este script marca o escolhido (`aria-current="true"`) e avisa a página com o evento `site-filtro`
   (`detail` = o valor; "all" sem filtro). Quem mostra e esconde é o script de cada página. Sem script, a página mostra tudo. */
(function () {
  var links = function () { return document.querySelectorAll('.sidebar a[href^="#filtro/"]'); };
  if (!links().length) return;
  function aplicar() {
    var m = /^#filtro\/(.+)$/.exec(location.hash);
    var valor = m ? decodeURIComponent(m[1]) : "all";
    links().forEach(function (a) {
      var sim = a.getAttribute("href") === "#filtro/" + valor;
      if (sim) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      a.classList.toggle("is-selected", sim);
    });
    document.dispatchEvent(new CustomEvent("site-filtro", {detail: valor}));
  }
  window.addEventListener("hashchange", aplicar);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aplicar); else aplicar();
})();

/* O CAMPO DE FILTRAR DA LATERAL (Patterns): vai para baixo de "By component", como o desenho, e esconde os componentes
   cujo nome não tem o que se digitou ("All components" fica sempre). */
(function () {
  var campo = document.querySelector("[data-site-filtro-busca]");
  if (!campo) return;
  var caixa = campo.closest(".site-filtro-busca");
  var primeiro = document.querySelector('.sidebar a[href="#filtro/all"]');
  var grupo = primeiro && primeiro.closest("li");
  var lista = grupo && grupo.parentElement;
  if (caixa && lista && lista.parentElement) lista.parentElement.insertBefore(caixa, lista);
  campo.addEventListener("input", function () {
    var q = campo.value.trim().toLowerCase();
    document.querySelectorAll('.sidebar a[href^="#filtro/"]').forEach(function (a) {
      if (a.getAttribute("href") === "#filtro/all") return;
      var li = a.closest("li") || a;
      li.hidden = !!q && a.textContent.toLowerCase().indexOf(q) < 0;
    });
  });
})();

/* O "ON THIS PAGE" DA LATERAL (o desenho B): a âncora da seção que está na tela fica marcada enquanto a página rola. */
(function () {
  var links = [].slice.call(document.querySelectorAll('.sidebar a[href^="#"]:not([href^="#filtro/"])'));
  var alvos = links.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))); });
  if (!links.length || !alvos.some(Boolean) || !("IntersectionObserver" in window)) return;
  var visiveis = new Set();
  function marcar() {
    var k = alvos.findIndex(function (el) { return el && visiveis.has(el); });
    links.forEach(function (a, i) { if (i === k) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target); });
    marcar();
  }, {rootMargin: "-20% 0px -60% 0px"});
  alvos.forEach(function (el) { if (el) io.observe(el); });
})();

/* site-b/js/_getting-started.js */
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

/* site-b/js/_grupo-1.js */
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
  document.querySelectorAll("[data-g1-lista]").forEach((lista) => {
    const estado = {q: "", abertos: new Set(), todosOsGrupos: false};
    const busca = lista.querySelector("[data-g1-busca] input, input[data-g1-busca]");
    const grupos = [...lista.querySelectorAll("[data-g1-grupo]")];
    const mostrando = lista.querySelector("[data-g1-mostrando]");
    const vazio = lista.querySelector("[data-g1-vazio]");
    const tituloDoVazio = lista.querySelector("[data-g1-vazio-titulo]");
    const maisGrupos = lista.querySelector("[data-g1-mais-grupos]");
    const fraseDoVazio = lista.dataset.g1Frase || "Nothing called";
    const aplicar = () => {
      const q = estado.q.trim().toLowerCase();
      let vistos = 0;
      grupos.forEach((g) => {
        const itens = [...g.querySelectorAll("[data-g1-item]")];
        const acham = itens.filter((c) => !q || (c.dataset.busca || "").includes(q));
        const resumido = !q && !estado.abertos.has(g);
        itens.forEach((c) => { c.hidden = !acham.includes(c) || (resumido && c.hasAttribute("data-mais")); });
        const escondidoPorQuantidade = !q && !estado.todosOsGrupos && g.hasAttribute("data-g1-grupo-mais");
        g.hidden = acham.length === 0 || escondidoPorQuantidade;
        const mais = g.querySelector("[data-g1-mais]");
        if (mais) {
          const caixa = mais.closest(".g1-mais") || mais;
          caixa.hidden = Boolean(q);
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
      if (maisGrupos) { const c = maisGrupos.closest("[data-g1-mais-grupos-caixa]") || maisGrupos; c.hidden = Boolean(q) || estado.todosOsGrupos; }
    };
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

/* site-b/js/accessibility.js */
// A PÁGINA "Accessibility" DO SITE B (02/11/2026, o grupo 5): o campo que fica inválido (o anel muda de cor), a área de
// toque de 44 pintada, e o texto a 200% numa JANELA PRÓPRIA — um `iframe` com a folha do site, em que a régua muda o
// tamanho da letra da RAIZ (as peças medem em `rem`, como a varredura de 200% mede). A régua é a `Slider` da Aurea, sem
// React nesta página: o campo de faixa dela recebe o teclado, e o arrastar é daqui. Só age na página que tem a régua.
(function () {
  var reflow = document.querySelector("[data-acc-reflow]");
  if (!reflow) return;

  // O CAMPO INVÁLIDO.
  var botaoInvalido = document.querySelector("[data-acc-invalido]");
  var campo = document.querySelector("[data-acc-campo]");
  if (botaoInvalido && campo) botaoInvalido.addEventListener("click", function () {
    var ligado = botaoInvalido.getAttribute("aria-pressed") !== "true";
    botaoInvalido.setAttribute("aria-pressed", ligado ? "true" : "false");
    botaoInvalido.textContent = ligado ? "Make it valid" : "Make the field invalid";
    if (ligado) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid");
    campo.value = ligado ? "not-an-email" : "you@company.com";
  });

  // A ÁREA DE TOQUE.
  var toque = document.querySelector("[data-acc-toque]");
  var botaoArea = document.querySelector("[data-acc-area]");
  if (toque && botaoArea) botaoArea.addEventListener("click", function () {
    var ligado = botaoArea.getAttribute("aria-pressed") !== "true";
    botaoArea.setAttribute("aria-pressed", ligado ? "true" : "false");
    botaoArea.textContent = ligado ? "Hide the 44px hit area" : "Show the 44px hit area";
    toque.setAttribute("data-mostrar", ligado ? "true" : "false");
  });

  // A JANELA PRÓPRIA.
  var lugar = reflow.querySelector("[data-acc-janela]");
  var numero = reflow.querySelector("[data-acc-tamanho]");
  var faixa = reflow.querySelector('input[type="range"]');
  var trilho = reflow.querySelector(".slider-control");
  var cheio = reflow.querySelector(".slider-fill");
  var bolinha = reflow.querySelector(".slider-thumb");
  if (!lugar || !faixa) return;
  var raiz = document.documentElement;
  var janela = document.createElement("iframe");
  janela.title = "The card at the chosen text size";
  var folha = new URL("./assets/catalog.css", location.href).href;
  janela.srcdoc = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<link rel="stylesheet" href="' + folha + '"><style>html,body{margin:0;background:transparent}body{padding:var(--space-1)}</style></head><body>'
    + lugar.innerHTML + "</body></html>";
  var pct = 100;
  function doc() { try { return janela.contentDocument; } catch (e) { return null; } }
  function espelhar() {
    var d = doc();
    if (!d || !d.documentElement) return;
    ["data-theme", "data-brand", "data-density"].forEach(function (a) {
      var v = raiz.getAttribute(a);
      if (v == null) d.documentElement.removeAttribute(a); else d.documentElement.setAttribute(a, v);
    });
    d.documentElement.style.fontSize = pct + "%";
    janela.style.height = "0px";
    janela.style.height = d.documentElement.scrollHeight + "px";
  }
  janela.addEventListener("load", espelhar);
  lugar.replaceChildren(janela);
  new MutationObserver(espelhar).observe(raiz, {attributes: true, attributeFilter: ["data-theme", "data-brand", "data-density"]});
  window.addEventListener("resize", espelhar);

  function mudar(valor) {
    var min = Number(faixa.min) || 100, max = Number(faixa.max) || 200, passo = Number(faixa.step) || 10;
    valor = Math.min(max, Math.max(min, Math.round(valor / passo) * passo));
    pct = valor;
    faixa.value = String(valor);
    faixa.setAttribute("aria-valuenow", String(valor));
    faixa.setAttribute("aria-valuetext", valor + "%");
    var parte = ((valor - min) / (max - min)) * 100;
    if (cheio) cheio.style.width = parte + "%";
    if (bolinha) bolinha.style.insetInlineStart = parte + "%";
    if (numero) numero.textContent = valor + "%";
    espelhar();
  }
  faixa.setAttribute("aria-valuetext", "100%");
  faixa.addEventListener("input", function () { mudar(Number(faixa.value)); });
  // O arrastar no trilho (sem React, o motor da régua não está aqui): a posição vira o valor, e o teclado fica no campo.
  if (trilho) {
    var arrastando = false;
    var porPonto = function (x) {
      var r = trilho.getBoundingClientRect();
      var parte = (x - r.left) / r.width;
      if (getComputedStyle(trilho).direction === "rtl") parte = 1 - parte;
      mudar(Number(faixa.min) + parte * (Number(faixa.max) - Number(faixa.min)));
    };
    trilho.addEventListener("pointerdown", function (e) {
      arrastando = true;
      trilho.setPointerCapture(e.pointerId);
      faixa.focus({preventScroll: true});
      porPonto(e.clientX);
      e.preventDefault();
    });
    trilho.addEventListener("pointermove", function (e) { if (arrastando) porPonto(e.clientX); });
    trilho.addEventListener("pointerup", function () { arrastando = false; });
    trilho.addEventListener("pointercancel", function () { arrastando = false; });
  }
})();

/* site-b/js/agent-skills.js */
// A PÁGINA "Agent Skills" DO SITE B (02/11/2026, o grupo 5): o cartão escolhido troca o comando do bloco (o "Copy" copia
// o que está escrito). Só age na página que tem os cartões.
(function () {
  var onde = document.querySelector("[data-skills-onde]");
  var caixa = document.querySelector("[data-skills-comando]");
  if (!onde || !caixa) return;
  onde.addEventListener("change", function (e) {
    if (!e.target || e.target.type !== "radio") return;
    var codigo = caixa.querySelector("pre code");
    if (codigo) codigo.textContent = caixa.getAttribute(e.target.value === "user" ? "data-usuario" : "data-projeto");
  });
})();

/* site-b/js/agents-md.js */
// A PÁGINA "AGENTS.md" DO SITE B (02/11/2026, o grupo 5): as duas perguntas montam o comando (o "Copy" copia o que está
// escrito) e a pasta antes e depois dele. Só age na página que tem o comando.
(function () {
  var caixa = document.querySelector("[data-agents-comando]");
  if (!caixa) return;
  var modo = document.querySelector('[data-g5-chave="agents-modo"]');
  var nome = document.querySelector('[data-g5-chave="agents-nome"]');
  var antes = document.querySelector("[data-agents-antes]");
  var depois = document.querySelector("[data-agents-depois]");
  var estado = {modo: "new", nome: "AGENTS.md"};

  function linha(texto, nota, nova) {
    var li = document.createElement("li");
    if (nova) li.className = "agents-pasta-nova";
    var code = document.createElement("code");
    code.textContent = texto;
    li.appendChild(code);
    if (nota) { var s = document.createElement("small"); s.textContent = nota; li.appendChild(s); }
    return li;
  }
  function desenhar() {
    var somar = estado.modo === "append";
    var codigo = caixa.querySelector("pre code");
    if (codigo) codigo.textContent = caixa.getAttribute("data-base") + (somar ? " >> " : " -o ") + estado.nome;
    antes.replaceChildren.apply(antes, somar ? [linha("package.json"), linha(estado.nome, "your rules")] : [linha("package.json"), linha("src/")]);
    depois.replaceChildren.apply(depois, somar
      ? [linha("package.json"), linha(estado.nome, "your rules + the Aurea rules at the end", true)]
      : [linha("package.json"), linha("src/"), linha(estado.nome, "new · the Aurea rules", true)]);
  }
  function chave(grupo, campo) {
    if (!grupo) return;
    grupo.addEventListener("click", function (e) {
      var botao = e.target.closest("button[data-valor]");
      if (!botao) return;
      grupo.querySelectorAll("button[data-valor]").forEach(function (b) {
        var sim = b === botao;
        b.classList.toggle("active", sim);
        b.setAttribute("aria-pressed", sim ? "true" : "false");
      });
      estado[campo] = botao.getAttribute("data-valor");
      desenhar();
    });
  }
  chave(modo, "modo");
  chave(nome, "nome");
})();

/* site-b/js/animation.js */
// ANIMATION (site B): os botões que abrem e fecham as janelas presas nos palcos, o "Play" de cada token e a corrida das
// duas curvas. As janelas são as da Aurea; aqui só se escrevem os atributos que o motor escreveria — `data-starting-style`
// no primeiro quadro da entrada e `data-ending-style` na saída —, e a transição do `aurea.css` faz o movimento.
(function () {
  if (!document.querySelector(".animation-galeria")) return;
  var PARTES = {dialog: ".dialog-backdrop, .dialog", drawer: ".drawer", popover: ".popover", toast: ".toast"};

  function abrir(el) {
    el.removeAttribute("data-ending-style");
    el.removeAttribute("data-fechada");
    el.setAttribute("data-starting-style", "");
    el.getBoundingClientRect();
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.removeAttribute("data-starting-style"); }); });
  }
  function fechar(el) {
    el.setAttribute("data-ending-style", "");
    var feito = false;
    function fim() {
      if (feito || !el.hasAttribute("data-ending-style")) return;
      feito = true;
      el.setAttribute("data-fechada", "");
      el.removeAttribute("data-ending-style");
    }
    el.addEventListener("transitionend", fim, {once: true});
    setTimeout(fim, 600);
  }

  document.querySelectorAll("[data-abre]").forEach(function (botao) {
    var cartao = botao.closest(".animation-movimento");
    var mini = cartao && cartao.querySelector(".animation-mini");
    if (!mini) return;
    var partes = mini.querySelectorAll(PARTES[botao.getAttribute("data-abre")]);
    var rotulo = botao.querySelector("span") || botao;
    botao.addEventListener("click", function () {
      var abre = !botao.hasAttribute("data-aberta");
      botao.toggleAttribute("data-aberta", abre);
      rotulo.textContent = abre ? "Close" : "Open";
      partes.forEach(abre ? abrir : fechar);
    });
  });

  // O "Play" de cada token e a corrida: a bolinha vai até a outra ponta (e volta no clique seguinte).
  function correr(bolas) { bolas.forEach(function (b) { b.toggleAttribute("data-ligada"); }); }
  document.querySelectorAll(".animation-play").forEach(function (botao) {
    botao.addEventListener("click", function () { correr([botao.closest("tr").querySelector(".animation-bola")]); });
  });
  var corrida = document.querySelector(".animation-corrida");
  var correrBotao = corrida && corrida.querySelector(".animation-correr");
  if (correrBotao) correrBotao.addEventListener("click", function () { correr(corrida.querySelectorAll(".animation-bola")); });
})();

// "SIMULATE REDUCE MOTION": o On para o movimento da página (a regra `.animation-parado`, em `site-b/css/animation.css`),
// como o "reduzir movimento" do sistema; o Off devolve. A frase da ponta diz o que acontece.
(function () {
  var faixa = document.querySelector(".animation-simula");
  if (!faixa) return;
  var corpo = faixa.parentElement, frase = faixa.querySelector("[data-an-reduz-frase]");
  faixa.addEventListener("click", function (e) {
    var b = e.target.closest("[data-an-reduz]");
    if (!b) return;
    var parado = b.getAttribute("data-an-reduz") === "on";
    corpo.classList.toggle("animation-parado", parado);
    faixa.querySelectorAll("[data-an-reduz]").forEach(function (x) {
      var sim = x === b;
      x.classList.toggle("active", sim);
      x.setAttribute("aria-pressed", sim ? "true" : "false");
    });
    frase.textContent = parado ? "the motion below stops" : "the motion below plays";
  });
})();

/* site-b/js/blocks.js */
// "BLOCKS" NO SITE B (02/11/2026): o "Preview" abre o bloco no lugar, numa linha inteira (um de cada vez); o "×" fecha e
// devolve o foco ao "Preview"; o "Next block" abre o próximo. A busca e os grupos são do `_grupo-1.js`. Só age na página
// dos blocos.
{
  const pagina = document.querySelector(".blk-b");
  if (pagina) {
    const botaoDe = (slug) => pagina.querySelector('[data-blk="' + slug + '"] [data-blk-abrir]');
    const painelDe = (slug) => pagina.querySelector('[data-blk-painel="' + slug + '"]');
    const fechar = (painel, devolver) => {
      if (!painel || painel.hidden) return;
      painel.hidden = true;
      const slug = painel.dataset.blkPainel;
      const botao = botaoDe(slug);
      if (botao) {
        botao.setAttribute("aria-expanded", "false");
        botao.closest("[data-blk]").removeAttribute("data-aberto");
        if (devolver) botao.focus();
      }
    };
    const abrir = (slug) => {
      pagina.querySelectorAll("[data-blk-painel]:not([hidden])").forEach((p) => fechar(p, false));
      const painel = painelDe(slug), botao = botaoDe(slug);
      if (!painel || !botao) return;
      // O grupo e o cartão podem estar escondidos pela busca: abrir mostra os dois.
      const grupo = painel.closest("[data-g1-grupo]");
      if (grupo) grupo.hidden = false;
      botao.closest("[data-blk]").hidden = false;
      painel.hidden = false;
      botao.setAttribute("aria-expanded", "true");
      botao.closest("[data-blk]").setAttribute("data-aberto", "");
      painel.scrollIntoView({block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
      const titulo = painel.querySelector("h3");
      if (titulo) { titulo.tabIndex = -1; titulo.focus({preventScroll: true}); }
    };
    pagina.addEventListener("click", (e) => {
      const abre = e.target.closest("[data-blk-abrir]");
      if (abre) {
        const slug = abre.closest("[data-blk]").dataset.blk;
        if (abre.getAttribute("aria-expanded") === "true") fechar(painelDe(slug), true); else abrir(slug);
        return;
      }
      const fecha = e.target.closest("[data-blk-fechar]");
      if (fecha) { fechar(fecha.closest("[data-blk-painel]"), true); return; }
      const proximo = e.target.closest("[data-blk-proximo]");
      if (proximo) abrir(proximo.dataset.blkProximo);
    });
    pagina.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const painel = e.target.closest && e.target.closest("[data-blk-painel]");
      if (painel) fechar(painel, true);
    });
  }
}

// O FILTRO DA LATERAL (o desenho B, 02/11/2026): "By area" mostra só os blocos da área escolhida; "Every area" mostra todos.
// A contagem de cada grupo diz quantos aparecem ("1 of 7"); o grupo que fica vazio some.
document.addEventListener("site-filtro", (e) => {
  const pagina = document.querySelector(".blk-b");
  if (!pagina) return;
  const valor = e.detail;
  pagina.querySelectorAll("[data-blk]").forEach((c) => { c.hidden = valor !== "all" && c.dataset.area !== valor; });
  pagina.querySelectorAll(".blk-grupo").forEach((g) => {
    const cartoes = g.querySelectorAll("[data-blk]");
    const vistos = [...cartoes].filter((c) => !c.hidden).length;
    const conta = g.querySelector("[data-blk-conta]");
    if (conta) conta.textContent = vistos + " of " + cartoes.length;
    g.hidden = vistos === 0;
  });
});

/* site-b/js/colors.js */
// A COLORS DO SITE B (02/11/2026): escolher um papel do tema padrão mostra-o grande nos dois temas; a chave do link troca
// o marca-texto pelo sublinhado (`data-link="underline"`) no quadro claro; a chave da plataforma troca o código. Sem este
// script, a página mostra o "--primary" escolhido, o marca-texto e o código da web.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="colors"]');
  if (!pagina) return;
  const grande = pagina.querySelector("[data-co-grande]");
  pagina.addEventListener("click", e => {
    const papel = e.target.closest(".co-papel[data-token]");
    if (!papel || !grande) return;
    pagina.querySelectorAll(".co-papel[data-token]").forEach(b => b.setAttribute("aria-pressed", b === papel ? "true" : "false"));
    grande.querySelector("[data-co-nome]").textContent = papel.dataset.token;
    grande.querySelectorAll("[data-co-tema]").forEach(bloco => {
      const claro = bloco.dataset.coTema === "light";
      bloco.style.background = "var(" + papel.dataset.token + ")";
      bloco.dataset.tinta = claro ? papel.dataset.tintaClaro : papel.dataset.tintaEscuro;
      bloco.querySelector("[data-co-valor]").textContent = claro ? papel.dataset.claro : papel.dataset.escuro;
    });
  });
  pagina.addEventListener("gs-chave", e => {
    if (e.detail.nome === "co-link") {
      pagina.querySelectorAll("[data-co-link]").forEach(q => {
        if (e.detail.valor === "underline") q.dataset.link = "underline"; else delete q.dataset.link;
      });
    } else if (e.detail.nome === "co-plataforma") {
      pagina.querySelectorAll("[data-co-plataforma]").forEach(el => { el.hidden = el.dataset.coPlataforma !== e.detail.valor; });
    }
  });
})();

/* site-b/js/componente.js */
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

/* site-b/js/composition.js */
// COMPOSITION (site B): as partes do cartão, a área do `AppShell` e a categoria de importar.
(function () {
  var D = window.AureaDocsB;
  var montador = document.querySelector(".composition-montador");
  if (!D || !montador) return;

  // As partes: cada `Toggle` liga ou desliga uma parte do cartão de verdade, e o código ao lado acompanha.
  var cartao = montador.querySelector(".composition-cartao");
  var codigo = montador.querySelector(".composition-codigo code");
  // As partes são caixas de marcar (o `Checkbox variant="pill"`): cada uma liga ou desliga a parte dela.
  function partes() {
    var on = {};
    // O atributo vai na própria caixa (o `input` do `Checkbox`).
    montador.querySelectorAll("input[data-composition-parte]").forEach(function (caixa) {
      on[caixa.getAttribute("data-composition-parte")] = caixa.checked;
    });
    return on;
  }
  function montar() {
    var c = partes();
    var cabeca = c.header && (c.title || c.desc);
    var mostra = {media: c.media, header: cabeca, title: c.title, desc: c.desc, content: c.content, footer: c.footer};
    mostra.none = !c.media && !cabeca && !c.content && !c.footer;
    var CLASSE = {media: ".card-media", header: ".card-header", title: ".card-title", desc: ".card-description", content: ".card-content",
      footer: ".card-footer", none: ".composition-vazio"};
    Object.keys(mostra).forEach(function (k) {
      var el = cartao.querySelector(CLASSE[k]);
      if (el) el.hidden = !mostra[k];
    });
    var l = ["<Card>"];
    if (c.media) l.push("  <Card.Media>…</Card.Media>");
    if (cabeca) {
      l.push("  <Card.Header>");
      if (c.title) l.push("    <Card.Title>Weekly report</Card.Title>");
      if (c.desc) l.push("    <Card.Description>Sent every Monday at 9:00.</Card.Description>");
      l.push("  </Card.Header>");
    }
    if (c.content) l.push("  <Card.Content>12 people receive it.</Card.Content>");
    if (c.footer) l.push("  <Card.Footer>", "    <Button variant=\"primary\">Edit</Button>", "    <Button>Pause</Button>", "  </Card.Footer>");
    l.push("</Card>");
    if (codigo) codigo.textContent = l.join("\n");
  }
  montador.addEventListener("change", function (e) { if (e.target.closest("[data-composition-parte]")) montar(); });
  montar();

  // As áreas do `AppShell`: uma escolhida por vez; o painel diz o nome e para que serve.
  var moldura = document.querySelector(".composition-moldura");
  var nome = document.querySelector(".composition-info-nome");
  var frase = document.querySelector(".composition-info-frase");
  if (moldura) D.grupoDeBotoes(moldura, function (ligados) {
    var area = ligados[0] && ligados[0].textContent;
    var texto = area && document.querySelector(".composition-info [data-area='" + area + "']");
    if (area && nome) nome.textContent = area;
    if (texto && frase) frase.textContent = texto.textContent;
  }, true);

  // As categorias: uma por vez; o código mostra a linha de importar dela.
  var categorias = document.querySelector(".composition-categorias .toggle-group");
  var importar = document.querySelector(".composition-importar code");
  var EXEMPLO = {actions: "{Button, IconButton}", inputs: "{Input, Select}"};
  if (categorias && importar) D.grupoDeBotoes(categorias, function (ligados) {
    var c = ligados[0] && ligados[0].textContent;
    if (c) importar.textContent = "import " + (EXEMPLO[c] || "{/* … */}") + " from \"@aurea-uds/react/" + c + "\";";
  }, true);
})();

/* site-b/js/dark-mode.js */
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

// "SIMULATE THE COMPUTER": finge a escolha clara ou escura do computador. A preferência é a guardada pelo site ("light",
// "dark" ou "system"; sem nada guardado, "system"). Só com "system" a tela segue o que se finge; a linha ao lado diz a
// preferência e o tema que está na tela.
(function () {
  var faixa = document.querySelector(".dark-mode-simula");
  if (!faixa) return;
  var raiz = document.documentElement;
  var pref = faixa.querySelector("[data-dm-pref]"), tela = faixa.querySelector("[data-dm-tela]");
  var computador = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  function preferencia() {
    var t = null;
    try { t = localStorage.getItem("aurea-theme"); } catch (e) { /* sem armazenamento */ }
    return t === "light" || t === "dark" ? t : "system";
  }
  function desenhar() {
    faixa.querySelectorAll("[data-dm-simula]").forEach(function (b) {
      var sim = b.getAttribute("data-dm-simula") === computador;
      b.classList.toggle("active", sim);
      b.setAttribute("aria-pressed", sim ? "true" : "false");
    });
    pref.textContent = '"' + preferencia() + '"';
    tela.textContent = '"' + (raiz.getAttribute("data-theme") || computador) + '"';
  }
  faixa.addEventListener("click", function (e) {
    var b = e.target.closest("[data-dm-simula]");
    if (!b) return;
    computador = b.getAttribute("data-dm-simula");
    if (preferencia() === "system") raiz.setAttribute("data-theme", computador);
    desenhar();
  });
  new MutationObserver(desenhar).observe(raiz, {attributes: true, attributeFilter: ["data-theme"]});
  window.addEventListener("storage", desenhar);
  desenhar();
})();

/* site-b/js/density.js */
// DENSITY (site B): a chave das três densidades muda o `data-density` do cartão de peças, as medidas ao lado (lidas dos
// tokens, em px, como a página está agora), a coluna acesa da tabela e o atributo do palco. E o botão de cada densidade
// no toque diz a altura que tem aqui.
(function () {
  var D = window.AureaDocsB;
  var previa = document.querySelector(".density-previa");
  if (!D || !previa) return;
  var px = function (el, token) {
    var t = document.createElement("div");
    t.style.blockSize = "var(" + token + ")";
    t.style.position = "absolute";
    t.style.visibility = "hidden";
    el.appendChild(t);
    var v = Math.round(t.getBoundingClientRect().height);
    t.remove();
    return v;
  };
  function medir() {
    document.querySelectorAll(".density-medidas [data-token]").forEach(function (dd) {
      dd.textContent = px(previa, dd.getAttribute("data-token")) + "px";
    });
  }
  var chave = document.querySelector(".density-chave .segmented");
  if (chave) D.escolha(chave, function (d) {
    previa.setAttribute("data-density", d);
    var tabela = document.querySelector(".density-tokens");
    if (tabela) tabela.setAttribute("data-coluna", d);
    var atributo = document.querySelector(".density-atributo");
    if (atributo) atributo.textContent = "data-density=\"" + d + "\"";
    medir();
  });
  medir();
  // A altura do botão de verdade em cada densidade, nesta tela (no toque, a peça sobe para 44).
  document.querySelectorAll(".density-toque").forEach(function (c) {
    var botao = c.querySelector(".btn");
    var lugar = c.querySelector("[data-altura]");
    if (botao && lugar) lugar.textContent = Math.round(botao.getBoundingClientRect().height) + "px here";
  });
})();

/* site-b/js/design-principles.js */
// A DESIGN PRINCIPLES DO SITE B (02/11/2026): os painéis das regras. O anel de foco pintado no "Save" (01), a linha contra
// o fundo (04), a linha do botão montada nas duas chaves (07) e a plataforma das regras 08 e 09 (as duas chaves andam
// juntas). Sem este script, os painéis mostram o estado de partida do desenho.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="design-principles"]');
  if (!pagina) return;
  // 01: o botão de ligar pinta o anel no "Save".
  const ligar = pagina.querySelector(".dp-ligar");
  const salvar = pagina.querySelector("[data-dp-salvar]");
  if (ligar && salvar) ligar.addEventListener("click", () => {
    const ligado = ligar.getAttribute("aria-pressed") !== "true";
    ligar.setAttribute("aria-pressed", ligado ? "true" : "false");
    ligar.toggleAttribute("data-pressed", ligado);
    salvar.classList.toggle("dp-foco-ligado", ligado);
    ligar.textContent = ligado ? "Hide the focus ring" : "Show the focus ring";
  });
  const saida = nome => pagina.querySelector(`[data-dp-saida="${nome}"]`);
  pagina.addEventListener("gs-chave", e => {
    const {nome, valor} = e.detail;
    // 04: a caixa com a linha ou a de fundo.
    if (nome === "dp-linha") pagina.querySelectorAll("[data-dp-linha]").forEach(el => {
      if (el.dataset.dpLinha === valor) el.removeAttribute("hidden"); else el.setAttribute("hidden", "");
    });
    // 07: a linha do botão.
    if (nome === "dp-aparencia" && saida("aparencia")) saida("aparencia").textContent = valor;
    if (nome === "dp-tom" && saida("tom")) saida("tom").textContent = valor;
    // 08 e 09: a plataforma, nas duas chaves e em tudo o que é de uma só.
    if (nome === "dp-plataforma") {
      if (window.gsEscolher) window.gsEscolher("dp-plataforma", valor);
      pagina.querySelectorAll("[data-dp-web]").forEach(el => { el.hidden = valor !== "web"; });
      pagina.querySelectorAll("[data-dp-native]").forEach(el => { el.hidden = valor !== "native"; });
    }
  });
})();

/* site-b/js/frameworks.js */
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

  // O Victor, 02/11/2026: escolher o gerenciador lá em cima não dizia nada — o comando que muda fica embaixo. Agora a página
  // desce até ele (suave, menos com o "reduzir movimento" do sistema). Só no clique: o evento "gs-chave" sai da pessoa.
  const descerAte = el => { if (el) el.scrollIntoView({block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); };
  pagina.addEventListener("gs-chave", e => {
    if (e.detail.nome !== "fw-pm") return;
    estado.pm = e.detail.valor;
    aplicar();
    // o primeiro comando de instalar do framework escolhido (a caixa inteira, com o "Terminal")
    const cmd = pagina.querySelector("[data-fw-painel]:not([hidden]) [data-fw-instalar]");
    descerAte(cmd);
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

/* site-b/js/hooks.js */
// A PÁGINA "HOOKS" DO SITE B: o "Try it" de cada hook. O aviso e o tema passam pela ponte do site (o evento `site-hook`,
// no `live/site.tsx`), que chama o `useToast` e o `useAureaTheme` de verdade; a lateral, o dicionário e o sprite são
// demonstrações paradas que este arquivo troca. Só age na página dela (o `[data-hooks]`).
(function () {
  var raiz = document.querySelector("[data-hooks]");
  if (!raiz) return;
  var ponte = function (d) { document.dispatchEvent(new CustomEvent("site-hook", {detail: d})); };
  var q = function (s) { return raiz.querySelector(s); };
  var AVISOS = {
    success: {title: "Saved", description: "Two files uploaded.", type: "success"},
    info: {title: "Heads up", description: "A new version is available.", type: "info"},
    warning: {title: "Almost full", description: "You have used 90% of the space.", type: "warning"},
    danger: {title: "Could not save", description: "The connection dropped. Try again.", type: "danger"}
  };
  var marcar = function (botoes, escolhido) {
    botoes.forEach(function (b) { var on = b === escolhido; b.setAttribute("aria-pressed", on ? "true" : "false"); b.classList.toggle("active", on); });
  };

  // A lateral da demonstração: as duas formas (aberta e recolhida) são a `Sidebar` de verdade; o botão troca uma pela outra.
  var recolhida = false;
  var lateral = function (fechar) {
    recolhida = fechar;
    q('[data-hk-lateral="aberta"]').hidden = recolhida;
    q('[data-hk-lateral="fechada"]').hidden = !recolhida;
    q("[data-hk-lateral-estado]").textContent = "sidebar.collapsed   // " + recolhida + "\nsidebar.collapsible // \"icon\"";
  };

  // O tema e a densidade: lidos do <html>, que é quem o `useAureaTheme` escreve.
  var estadoDoTema = function () {
    var alvo = q("[data-hk-tema-estado]");
    if (!alvo) return;
    var html = document.documentElement;
    alvo.textContent = "theme   // \"" + (html.dataset.theme || "dark") + "\"\ndensity // \"" + (html.dataset.density || "comfortable") + "\"";
    var botoes = Array.prototype.slice.call(raiz.querySelectorAll("[data-hk-densidade]"));
    marcar(botoes, botoes.find(function (b) { return b.dataset.hkDensidade === (html.dataset.density || "comfortable"); }));
  };
  new MutationObserver(estadoDoTema).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme", "data-density"]});
  estadoDoTema();

  raiz.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.hkAviso) {
      if (b.dataset.hkAviso === "promise") ponte({promise: {loading: "Uploading…", success: "Uploaded", error: "Upload failed"}});
      else ponte({toast: AVISOS[b.dataset.hkAviso]});
    } else if (b.hasAttribute("data-hk-lateral-foco")) lateral(true);
    else if (b.hasAttribute("data-hk-lateral-alterna")) lateral(!recolhida);
    else if (b.hasAttribute("data-hk-tema")) ponte({toggleTheme: true});
    else if (b.dataset.hkDensidade) ponte({density: b.dataset.hkDensidade});
    else if (b.dataset.hkSprite) {
      marcar(Array.prototype.slice.call(raiz.querySelectorAll("[data-hk-sprite]")), b);
      var u = b.dataset.hkSprite;
      q("[data-hk-sprite-uso]").textContent = "<Icon name=\"plus\"/> draws\n<use href=\"" + u + "#plus\"/>";
      q("[data-hk-sprite-valor]").textContent = "useSpriteUrl()  // \"" + u + "\"";
    }
  });

  // O dicionário: a frase escrita no campo é a que a lista vazia diz.
  var frase = q("[data-hk-frase]");
  if (frase) frase.addEventListener("input", function () {
    var t = frase.value || "No results";
    q("[data-hk-frase-mostra]").textContent = t;
    q("[data-hk-frase-codigo]").textContent = "<AureaProvider strings={{comboboxEmpty: " + JSON.stringify(t) + "}}>";
  });
})();

/* site-b/js/icons.js */
// ICONS (site B): a mesa de experimentar — o nome (um ladrilho por vez), o peso e o tamanho trocam o desenho grande, o
// `Icon` no tamanho de verdade e a linha de código — e a chave "Home / Alerts / Settings" (a escolhida fica cheia sozinha).
(function () {
  var D = window.AureaDocsB;
  var mesa = document.querySelector(".icons-mesa");
  if (!D || !mesa) return;
  var PX = {sm: 16, md: 20, lg: 24, xl: 32};
  var estado = {nome: "house", peso: "regular", tamanho: "md"};
  var grande = mesa.querySelector(".icons-grande use");
  var real = mesa.querySelector(".icons-real .icon");
  var px = mesa.querySelector(".icons-px");
  var linha = mesa.querySelector(".icons-linha code");
  function desenhar() {
    var id = "#i-" + estado.nome + (estado.peso === "fill" ? "-fill" : "");
    if (grande) grande.setAttribute("href", id);
    if (real) {
      real.querySelector("use").setAttribute("href", id);
      real.setAttribute("class", "icon" + (estado.tamanho === "md" ? "" : " icon-" + estado.tamanho));
    }
    if (px) px.textContent = PX[estado.tamanho] + "px";
    if (linha) linha.textContent = "<Icon name=\"" + estado.nome + "\"" + (estado.peso === "fill" ? " weight=\"fill\"" : "") +
      " size=\"" + estado.tamanho + "\" />";
  }
  D.grupoDeBotoes(mesa.querySelector(".icons-grade"), function (ligados) {
    if (ligados[0]) { estado.nome = ligados[0].querySelector(".icons-ladrilho-dentro > span").textContent; desenhar(); }
  }, true);
  var chaves = mesa.querySelectorAll(".icons-escolhas .segmented");
  if (chaves[0]) D.escolha(chaves[0], function (v) { estado.peso = v; desenhar(); });
  if (chaves[1]) D.escolha(chaves[1], function (v) { estado.tamanho = v; desenhar(); });
  var abas = document.querySelector(".icons-abas .segmented");
  if (abas) D.escolha(abas);
})();

/* site-b/js/llms-txt.js */
// A PÁGINA "LLMs.txt" DO SITE B (02/11/2026, o grupo 5): o arquivo escolhido mostra o começo dele; a página escolhida
// troca o endereço; o jeito de ler troca a resposta. E os TAMANHOS: a página publicada lê os três arquivos e escreve o
// tamanho de cada um (o do llms-full.txt só existe depois de montadas as páginas). Só age na página que tem os cartões.
(function () {
  var cartoes = document.querySelector("[data-llms-arquivos]");
  if (!cartoes) return;

  function mostrar(atributo, valor) {
    document.querySelectorAll("[" + atributo + "]").forEach(function (el) {
      if (el.tagName === "BUTTON" || el.tagName === "SPAN") return;
      el.hidden = el.getAttribute(atributo) !== valor;
    });
  }
  cartoes.addEventListener("change", function (e) {
    if (e.target && e.target.type === "radio") mostrar("data-llms-espiada", e.target.value);
  });

  // Os botões de ligar (as páginas, o jeito de ler): um ligado por vez.
  function ligar(grupo, botao) {
    grupo.querySelectorAll("button[data-valor]").forEach(function (b) {
      var sim = b === botao;
      b.setAttribute("aria-pressed", sim ? "true" : "false");
      b.classList.toggle("active", sim && grupo.classList.contains("segmented"));
      if (sim) b.setAttribute("data-pressed", ""); else b.removeAttribute("data-pressed");
    });
  }
  var paginas = document.querySelector("[data-llms-paginas]");
  if (paginas) paginas.addEventListener("click", function (e) {
    var botao = e.target.closest("button[data-valor]");
    if (!botao) return;
    ligar(paginas, botao);
    document.querySelectorAll("[data-llms-pagina]").forEach(function (s) { s.textContent = botao.getAttribute("data-valor"); });
  });
  var uso = document.querySelector('[data-g5-chave="llms-uso"]');
  if (uso) uso.addEventListener("click", function (e) {
    var botao = e.target.closest("button[data-valor]");
    if (!botao) return;
    ligar(uso, botao);
    mostrar("data-llms-uso", botao.getAttribute("data-valor"));
  });

  // Os tamanhos, lidos dos arquivos de verdade (KB de 1000 bytes e as linhas, como a montagem conta).
  if (location.protocol === "file:" || !window.fetch) return;
  var nomes = {llms: "llms.txt", full: "llms-full.txt", agents: "aurea-agents.md"};
  Object.keys(nomes).forEach(function (chave) {
    fetch(new URL("./" + nomes[chave], location.href).href).then(function (r) { return r.ok ? r.text() : null; }).then(function (texto) {
      if (texto == null) return;
      var bytes = new TextEncoder().encode(texto).length, k = bytes / 1000;
      var linhas = texto.replace(/\n$/, "").split("\n").length;
      var rotulo = (k < 10 ? k.toFixed(1) : Math.round(k)) + " KB · " + linhas.toLocaleString("en-US") + " lines";
      document.querySelectorAll('[data-llms-tamanho="' + chave + '"]').forEach(function (el) { el.textContent = rotulo; });
    }, function () {});
  });
})();

/* site-b/js/quick-start.js */
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

/* site-b/js/recipes.js */
// A PÁGINA "RECIPES" DO SITE B: escolher a receita (os padrões dela acendem), filtrar a lista, ligar um padrão (a lista marca
// quem o usa) e copiar a lista de padrões. Só age na página dela (o `[data-receitas]`). Os dados vêm do `#rec-dados`.
(function () {
  var raiz = document.querySelector("[data-receitas]");
  var fonte = document.getElementById("rec-dados");
  if (!raiz || !fonte) return;
  var dados = JSON.parse(fonte.textContent);
  var R = dados.receitas;
  var atual = R.find(function (r) { return raiz.querySelector('[data-rec-item="' + r.id + '"][aria-pressed="true"]'); }) || R[0];
  var padrao = "";
  var q = function (s) { return raiz.querySelector(s); };
  var todos = function (s) { return Array.prototype.slice.call(raiz.querySelectorAll(s)); };
  var anuncio = q("[data-rec-anuncio]");

  // Uma etiqueta do mesmo jeito das que o gerador desenhou (copiada da primeira, para a pele ser a mesma).
  function etiquetas(lugar, textos) {
    var molde = lugar.firstElementChild;
    if (!molde) return;
    lugar.replaceChildren.apply(lugar, textos.map(function (t) { var e = molde.cloneNode(false); e.textContent = t; return e; }));
  }

  function desenhar() {
    q("[data-rec-pos]").textContent = "Recipe " + (R.indexOf(atual) + 1) + " of " + R.length;
    q("[data-rec-nome]").textContent = atual.nome;
    q("[data-rec-texto]").textContent = atual.texto;
    etiquetas(q("[data-rec-foco]"), atual.foco);
    etiquetas(q("[data-rec-usa]"), atual.padroes);
    q("[data-rec-conta]").textContent = atual.padroes.length;
    q("[data-rec-conta-palavra]").textContent = atual.padroes.length === 1 ? "pattern to compose" : "patterns to compose";
    q("[data-rec-abrir]").setAttribute("href", atual.href);
    q("[data-rec-copiar]").textContent = "Copy the list";
    todos("[data-rec-item]").forEach(function (b) {
      var r = R.find(function (x) { return x.id === b.dataset.recItem; });
      var usa = !!padrao && r.padroes.indexOf(padrao) >= 0;
      b.setAttribute("aria-pressed", r.id === atual.id ? "true" : "false");
      b.toggleAttribute("data-apagado", !!padrao && !usa);
      b.querySelector(".rec-item-conta").hidden = usa;
      b.querySelector(".rec-item-usa").hidden = !usa;
    });
    todos("[data-rec-padrao]").forEach(function (c) {
      var nome = c.dataset.recPadrao, usado = atual.padroes.indexOf(nome) >= 0, ligado = padrao === nome;
      c.classList.toggle("card-selected", usado);
      c.setAttribute("aria-pressed", ligado ? "true" : "false");
      c.querySelector(".rec-padrao-usado").hidden = !usado || ligado;
      c.querySelector(".rec-padrao-filtro").hidden = !ligado;
    });
    var noGrupo = function (lista) { return atual.padroes.filter(function (x) { return lista.indexOf(x) >= 0; }).length + " in this recipe"; };
    q('[data-rec-no-grupo="app"]').textContent = noGrupo(dados.app);
    q('[data-rec-no-grupo="op"]').textContent = noGrupo(dados.op);
    var faixa = q("[data-rec-faixa]");
    faixa.hidden = !padrao;
    if (padrao) {
      var n = R.filter(function (r) { return r.padroes.indexOf(padrao) >= 0; }).length;
      q("[data-rec-faixa-texto]").textContent = padrao + " is used by " + n + (n === 1 ? " recipe" : " recipes") + " — marked in the list.";
    }
  }

  raiz.addEventListener("click", function (e) {
    var item = e.target.closest("[data-rec-item]");
    if (item) {
      atual = R.find(function (r) { return r.id === item.dataset.recItem; }) || atual;
      desenhar();
      if (anuncio) anuncio.textContent = atual.nome + ": " + atual.padroes.length + " patterns, " + atual.padroes.join(", ") + ".";
      return;
    }
    var cartao = e.target.closest("[data-rec-padrao]");
    if (cartao) {
      padrao = padrao === cartao.dataset.recPadrao ? "" : cartao.dataset.recPadrao;
      desenhar();
      return;
    }
    if (e.target.closest("[data-rec-limpar]")) { padrao = ""; desenhar(); return; }
    var copiar = e.target.closest("[data-rec-copiar]");
    if (copiar) {
      var texto = atual.nome + ": " + atual.padroes.join(", ");
      var feito = function () {
        copiar.textContent = "Copied";
        setTimeout(function () { copiar.textContent = "Copy the list"; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(texto).then(feito, function () {});
    }
  });

  // O filtro da lista: pelo nome, pelo que a receita cobre e pelo texto; o Esc limpa.
  var campo = q("[data-rec-filtro]");
  var campoInput = campo && (campo.matches("input") ? campo : campo.querySelector("input"));
  if (campoInput) {
    var filtrar = function () {
      var t = campoInput.value.trim().toLowerCase(), vistos = 0;
      todos("[data-rec-item]").forEach(function (b) {
        var r = R.find(function (x) { return x.id === b.dataset.recItem; });
        var mostra = !t || (r.nome + " " + r.foco.join(" ") + " " + r.texto).toLowerCase().indexOf(t) >= 0;
        b.hidden = !mostra;
        if (mostra) vistos++;
      });
      q("[data-rec-nada]").hidden = vistos > 0;
    };
    campoInput.addEventListener("input", filtrar);
    campoInput.addEventListener("keydown", function (e) { if (e.key === "Escape") { campoInput.value = ""; filtrar(); } });
  }
})();

/* site-b/js/roadmap.js */
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

/* site-b/js/rtl.js */
// A PÁGINA "RTL" DO SITE B (02/11/2026, o grupo 5): a chave ltr | rtl troca o `dir` da caixa que espelha. Só age na
// página que tem a caixa.
(function () {
  var caixa = document.querySelector("[data-rtl-caixa]");
  var chave = document.querySelector('[data-g5-chave="rtl-sentido"]');
  if (!caixa || !chave) return;
  var nome = document.querySelector("[data-rtl-sentido]");
  chave.addEventListener("click", function (e) {
    var botao = e.target.closest("button[data-valor]");
    if (!botao) return;
    var sentido = botao.getAttribute("data-valor");
    chave.querySelectorAll("button[data-valor]").forEach(function (b) {
      var ligado = b === botao;
      b.classList.toggle("active", ligado);
      b.setAttribute("aria-pressed", ligado ? "true" : "false");
    });
    caixa.setAttribute("dir", sentido);
    if (nome) nome.textContent = sentido;
  });
})();

/* site-b/js/showcase.js */
// A SHOWCASE DO SITE B (02/11/2026): a ÁREA escolhida na miniatura (clique, ou o mouse por cima) liga só ela e troca o
// painel ao lado; o botão "See it in light" troca o tema pela chave do topo. Sem este script, o painel mostra o topo.
(() => {
  const pagina = document.querySelector('[data-gs-pagina="showcase"]');
  if (!pagina) return;
  let partes = [];
  try { partes = JSON.parse(document.getElementById("sc-partes").textContent); } catch (e) { return; }
  // O Toggle não repassa atributos "data-": a parte sai da classe "sc-area-<parte>".
  const areas = [...pagina.querySelectorAll(".sc-area")];
  const parteDe = a => (a.className.match(/sc-area-([a-z]+)/) || [])[1];
  const campo = nome => pagina.querySelector(`[data-sc-campo="${nome}"]`);
  const escolher = chave => {
    const parte = partes.find(p => p[0] === chave);
    if (!parte) return;
    areas.forEach(a => { const sim = parteDe(a) === chave; a.setAttribute("aria-pressed", sim ? "true" : "false"); a.toggleAttribute("data-pressed", sim); });
    const [, nome, peca, frase, href] = parte;
    if (campo("nome")) campo("nome").textContent = nome;
    if (campo("peca")) campo("peca").textContent = peca;
    if (campo("frase")) campo("frase").textContent = frase;
    if (campo("href")) campo("href").setAttribute("href", href);
  };
  areas.forEach(a => {
    a.addEventListener("click", () => escolher(parteDe(a)));
    a.addEventListener("mouseenter", () => escolher(parteDe(a)));
  });
  escolher("header");
  // O TEMA: pela chave de três posições do topo (que grava a escolha); sem ela, direto no <html>.
  const botao = pagina.querySelector("[data-sc-tema]");
  if (!botao) return;
  const rotulo = () => { botao.textContent = document.documentElement.dataset.theme === "light" ? "See it in dark" : "See it in light"; };
  botao.addEventListener("click", () => {
    const alvo = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    const opcao = [...document.querySelectorAll(".theme-switch-option, .theme-switch [role='radio'], .theme-switch button")]
      .find(b => (b.getAttribute("aria-label") || b.textContent || "").trim().toLowerCase() === alvo);
    if (opcao) opcao.click(); else document.documentElement.dataset.theme = alvo;
  });
  new MutationObserver(rotulo).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
  rotulo();
})();

/* site-b/js/styling.js */
// STYLING (site B): a chave das camadas, o `Toggle` "Autosave" e a régua da largura.
(function () {
  var D = window.AureaDocsB;
  if (!D || !document.querySelector(".styling-camadas")) return;

  // "Does your app use layers too?": "No" mostra a regra solta; "Yes", a ordem das camadas.
  var chave = document.querySelector(".styling-camadas .segmented");
  var voce = document.querySelector(".styling-voce");
  if (chave) D.escolha(chave, function (v) {
    document.querySelectorAll("[data-camadas]").forEach(function (p) { p.hidden = p.getAttribute("data-camadas") !== v; });
    if (voce) voce.textContent = v === "yes" ? "@layer app (declared after aurea)" : "your CSS, outside any layer";
  });

  // O `Toggle`: a marcação ao lado mostra o `data-pressed` quando ele está ligado.
  var estado = document.querySelector(".styling-estado");
  var botao = estado && estado.querySelector(".toggle");
  var atributo = estado && estado.querySelector(".styling-atributo");
  if (botao && atributo) D.aperta(botao, function (sim) { atributo.textContent = sim ? " data-pressed" : ""; });

  // A régua: a largura escolhida acende os degraus até ela, e o botão fica "lg" do `md` (768) para cima.
  var regua = document.querySelector(".styling-regua");
  if (!regua) return;
  var largura = regua.querySelector(".styling-largura");
  var degraus = regua.querySelectorAll(".styling-degrau-vw");
  var salvar = regua.querySelector(".styling-salvar .btn");
  var explica = regua.querySelector(".styling-explica");
  var deslizante = regua.querySelector(".slider");
  if (deslizante) D.deslizante(deslizante, function (v) {
    largura.textContent = v + "px";
    degraus.forEach(function (d) {
      var sim = v >= +d.getAttribute("data-px");
      d.classList.toggle("badge-primary", sim);
      d.classList.toggle("badge-solid", sim);
    });
    var grande = v >= 768;
    if (salvar) { salvar.classList.toggle("btn-lg", grande); salvar.classList.toggle("btn-sm", !grande); }
    if (explica) explica.textContent = grande ? "md applies (768px or wider) → size \"lg\"" : "below md → base, size \"sm\"";
  });
})();

/* site-b/js/theming.js */
// A THEMING DO SITE B (02/11/2026): o laboratório põe os três atributos na prévia (tema, densidade e marca) e escreve a
// linha do html; os botões de marca do laboratório e os cartões das marcas são a mesma escolha. Sem este script, a prévia
// fica no claro, confortável, na Aurea Gold (como o desenho).
(() => {
  const pagina = document.querySelector('[data-gs-pagina="theming"]');
  if (!pagina) return;
  const previa = pagina.querySelector("[data-th-previa]");
  const estado = {tema: "light", densidade: "comfortable", marca: "gold"};
  // A altura do controle em cada densidade (o --control-h-md de cada uma), como a barra da prévia do desenho.
  const ALTURA = {compact: 32, comfortable: 36, spacious: 40};
  const nomeDa = id => "Aurea " + id.charAt(0).toUpperCase() + id.slice(1);
  const aplicar = () => {
    if (!previa) return;
    previa.dataset.theme = estado.tema;
    previa.dataset.density = estado.densidade;
    if (estado.marca === "gold") delete previa.dataset.brand; else previa.dataset.brand = estado.marca;
    previa.querySelector("[data-th-rotulo]").textContent = nomeDa(estado.marca) + " · " + estado.tema;
    previa.querySelector("[data-th-dens]").textContent = estado.densidade + " · control " + ALTURA[estado.densidade] + "px";
    const nota = previa.querySelector("[data-th-ember]");
    if (nota) nota.hidden = estado.marca !== "ember";
    const marca = estado.marca === "gold" ? "" : ' data-brand="' + estado.marca + '"';
    const linha = "<html" + marca + ' data-theme="' + estado.tema + '" data-density="' + estado.densidade + '">';
    pagina.querySelectorAll("[data-th-linha]").forEach(el => { el.textContent = linha; });
    pagina.querySelectorAll("[data-th-copiar]").forEach(el => { el.dataset.copiar = linha; });
    document.querySelectorAll("[data-th-curto]").forEach(el => {
      el.textContent = estado.marca === "gold" ? 'data-theme="' + estado.tema + '"' : 'data-brand="' + estado.marca + '"';
    });
    pagina.querySelectorAll("[data-th-marca]").forEach(b => {
      const sim = b.dataset.thMarca === estado.marca;
      b.setAttribute("aria-pressed", sim ? "true" : "false");
      b.toggleAttribute("data-pressed", sim);
    });
    const radio = pagina.querySelector('input[name="th-marca"][value="' + estado.marca + '"]');
    if (radio && !radio.checked) radio.checked = true;
  };
  pagina.addEventListener("gs-chave", e => {
    if (e.detail.nome === "th-tema") estado.tema = e.detail.valor;
    else if (e.detail.nome === "th-densidade") estado.densidade = e.detail.valor;
    else return;
    aplicar();
  });
  pagina.addEventListener("click", e => {
    const botao = e.target.closest("[data-th-marca]");
    if (!botao) return;
    estado.marca = botao.dataset.thMarca;
    aplicar();
  });
  pagina.addEventListener("change", e => {
    if (e.target.name !== "th-marca") return;
    estado.marca = e.target.value;
    aplicar();
  });
  aplicar();
})();

/* site-b/js/tokens.js */
// A PÁGINA "TOKENS" DO SITE B: o valor de cada token lido do CSS na hora (no tema de "Values for"), copiar ao apertar, achar
// pelo nome, a densidade das alturas e o "Play" do movimento. Só age na página dela (o `[data-tokens]`).
(function () {
  var raiz = document.querySelector("[data-tokens]");
  if (!raiz) return;
  var escopo = raiz.querySelector("[data-tk-escopo]");
  var estado = raiz.querySelector("[data-tk-estado]");
  var todos = function (s, de) { return Array.prototype.slice.call((de || raiz).querySelectorAll(s)); };

  // O valor: o que o CSS resolve para a variável, no elemento (o tema e a densidade do escopo valem).
  function valores() {
    todos("[data-tk-valor]").forEach(function (v) {
      var nome = v.dataset.tkValor;
      var css = getComputedStyle(v).getPropertyValue("--" + nome).trim();
      v.textContent = css.replace(/\s+/g, " ");
    });
  }

  // "Values for": o tema das amostras, sem trocar o da página. Abre no tema da página.
  function tema(t) {
    escopo.setAttribute("data-theme", t);
    todos("[data-tk-tema]").forEach(function (b) { var on = b.dataset.tkTema === t; b.setAttribute("aria-pressed", on ? "true" : "false"); b.classList.toggle("active", on); });
    valores();
  }
  // Até alguém escolher, as amostras seguem o tema da página (e a troca dele).
  var escolhido = false;
  var daPagina = function () { return document.documentElement.dataset.theme === "light" ? "light" : "dark"; };
  tema(daPagina());
  new MutationObserver(function () { if (!escolhido) tema(daPagina()); })
    .observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});

  raiz.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || !raiz.contains(b)) return;
    if (b.dataset.tkTema) { escolhido = true; tema(b.dataset.tkTema); return; }
    if (b.dataset.tkDensidade) {
      raiz.querySelector("[data-tk-densidade-escopo]").setAttribute("data-density", b.dataset.tkDensidade);
      todos("[data-tk-densidade]").forEach(function (x) { var on = x === b; x.setAttribute("aria-pressed", on ? "true" : "false"); x.classList.toggle("active", on); });
      valores();
      return;
    }
    if (b.dataset.tkPlay) {
      var bola = raiz.querySelector('[data-tk-mov="' + b.dataset.tkPlay + '"]');
      var nome = b.dataset.tkPlay;
      var ehTempo = nome.indexOf("duration") === 0;
      bola.style.transition = "none";
      bola.classList.remove("tk-bola-fim");
      void bola.offsetWidth;
      bola.style.transition = "inset-inline-start " + (ehTempo ? "var(--" + nome + ")" : "var(--duration-slow)") + " " + (ehTempo ? "var(--ease-standard)" : "var(--" + nome + ")");
      bola.classList.add("tk-bola-fim");
      return;
    }
    if (b.hasAttribute("data-tk-limpar")) { var campo = busca(); if (campo) { campo.value = ""; achar(); campo.focus(); } return; }
    var texto = b.dataset.tk ? "var(--" + b.dataset.tk + ")" : b.dataset.tkCopia;
    if (!texto) return;
    var feito = function () { estado.textContent = "Copied " + texto; };
    if (navigator.clipboard) navigator.clipboard.writeText(texto).then(feito, function () { estado.textContent = texto; });
    else estado.textContent = texto;
  });

  // Achar pelo nome: some o que não casa, e a parte que ficou vazia; nada casou, o vazio com o "Clear the search".
  function busca() { var c = raiz.querySelector("[data-tk-busca]"); return c && (c.matches("input") ? c : c.querySelector("input")); }
  function achar() {
    var t = (busca().value || "").trim().toLowerCase(), achados = 0;
    var itens = todos("[data-tk], [data-tk-copia]").filter(function (el) { return !el.closest(".tk-ferramentas"); });
    itens.forEach(function (el) {
      var nome = (el.dataset.tk || el.dataset.tkCopia || "") + " " + el.textContent;
      var mostra = !t || nome.toLowerCase().indexOf(t) >= 0;
      var alvo = el.closest(".tk-mov") || el;
      alvo.hidden = !mostra;
      if (mostra) achados++;
    });
    todos("[data-tk-sec]").forEach(function (s) {
      s.hidden = !!t && !todos("[data-tk], [data-tk-copia]", s).some(function (el) { return !(el.closest(".tk-mov") || el).hidden; });
    });
    var vazio = raiz.querySelector("[data-tk-vazio]");
    vazio.hidden = achados > 0;
    if (!achados) raiz.querySelector("[data-tk-vazio-titulo]").textContent = "No token called “" + t + "”";
    estado.textContent = t ? achados + (achados === 1 ? " token" : " tokens") + " match “" + t + "”." : "Press any token to copy it.";
  }
  var campo = busca();
  if (campo) {
    campo.addEventListener("input", achar);
    campo.addEventListener("keydown", function (e) { if (e.key === "Escape") { campo.value = ""; achar(); } });
  }
})();
