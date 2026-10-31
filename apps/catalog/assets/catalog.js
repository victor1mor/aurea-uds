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