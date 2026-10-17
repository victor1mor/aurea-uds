"""A TRAVA DO SITE — rascunho de 16/10/2026 (o Victor: "B, pode, próximo lote").

O site (aureauds.dev) é feito SÓ com a Aurea. O check 45 do validador já barra importação e recurso de fora; esta trava
barra o que o site constrói por conta própria, no molde da trava do app consumidor:

  1. o CSS do site só estiliza as PRÓPRIAS classes — nada por dentro de uma peça da Aurea (o "sujeito" de cada seletor,
     a parte da direita, não pode ser classe do core);
  2. cor só por token (nada de #hex, rgb(), oklch(), color-mix() com cor escrita);
  3. medida só por token (nada de px, rem ou em escrito direto, fora da condição de um @media);
  4. controle feito à mão no código do site (button, input, select, textarea, details, dialog, form) só com motivo
     declarado em SEM_PECA — a marcação HTML que o core documenta e o aurea.js anima sem React;
  5. (só relatório, por enquanto) objeto de estilo com propriedade visual no código do site.

Roda sozinho (`python scripts/trava_do_site.py`, rápido, para o gancho do Claude). AINDA NÃO é chamado pelo validador
nem pela CI (17/10/2026): o site de hoje tem reprovações a resolver, e elas são o trabalho do próximo lote — cada uma
vira uma variação na Aurea. Quando chegar a zero, ela entra no validador e no gancho.
Afrouxar uma regra exige decisão do Victor registrada.
"""
import re
import sys
from pathlib import Path

RAIZ = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
GERADOR = RAIZ / "scripts/build-catalog.mjs"
CORE = RAIZ / "packages/core/src/aurea.css"
VIVO = RAIZ / "apps/catalog/live"

# Controle feito à mão que fica, com o motivo — ausência declarada, não silenciosa.
SEM_PECA = {
    # chave: o trecho de código (para casar com a linha), valor: o motivo
}


def sem_comentario_css(t):
    # Troca o comentário por espaços e GUARDA as quebras de linha: o número da linha do achado tem de ser o do arquivo.
    return re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), t, flags=re.S)


def css_do_site():
    fonte = GERADOR.read_text(encoding="utf-8")
    i = fonte.index("const chrome = `") + len("const chrome = `")
    j = fonte.index("`;", i)
    inicio_linha = fonte[:i].count("\n") + 1
    return fonte[i:j], inicio_linha


def classes_do_core():
    css = sem_comentario_css(CORE.read_text(encoding="utf-8"))
    return set(re.findall(r"\.(-?[_a-zA-Z][\w-]*)", re.sub(r"\{[^{}]*\}", "{}", css)))


def regras(css):
    """(seletor, corpo, linha) de cada regra, entrando nos @media/@supports."""
    out = []
    pos = 0
    texto = sem_comentario_css(css)
    pilha = []
    seletor_ini = 0
    for k, ch in enumerate(texto):
        if ch == "{":
            cab = texto[seletor_ini:k].strip()
            pilha.append((cab, k))
            seletor_ini = k + 1
        elif ch == "}":
            if pilha:
                cab, abre = pilha.pop()
                corpo = texto[abre + 1:k]
                if not cab.startswith("@") and "{" not in corpo:
                    out.append((cab, corpo, texto[:abre].count("\n")))
            seletor_ini = k + 1
        elif ch == ";" and not pilha:
            seletor_ini = k + 1
    return out


def sem_parenteses(seletor):
    """Tira as pseudo-classes com parênteses (`:has(…)`, `:not(…)`, `:is(…)`) ANTES de partir o seletor: o `>` de dentro
    de um `:has(> .x)` partia o seletor no lugar errado, e a regra escapava (ampliação de 17/10/2026)."""
    anterior = None
    while anterior != seletor:
        anterior, seletor = seletor, re.sub(r":[a-z-]+\([^()]*\)", "", seletor)
    return seletor


def sujeito(seletor):
    """A parte da direita de um seletor complexo, sem pseudo-classe nem pseudo-elemento."""
    partes = re.split(r"\s*[>+~]\s*|\s+", sem_parenteses(seletor).strip())
    s = partes[-1] if partes else ""
    return re.sub(r"::?[a-z-]+", "", s)


def classes_postas_nas_pecas(core):
    """As classes do SITE que aparecem no MESMO elemento de uma classe do core, nas páginas montadas: o site
    restilizando a peça pela classe dele (`.vit-cartao` num `.card`). {classe do site: classe do core}."""
    saida = {}
    for pagina in sorted((RAIZ / "apps/catalog").glob("*.html")):
        for lista in re.findall(r'class="([^"]*)"', pagina.read_text(encoding="utf-8")):
            nomes = lista.split()
            do_core = [c for c in nomes if c in core]
            if not do_core:
                continue
            for c in nomes:
                if c not in core:
                    saida.setdefault(c, do_core[0])
    return saida


COR = re.compile(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(")
MEDIDA = re.compile(r"(?<![\w-])\d*\.?\d+(?:px|rem|em)\b")
CONTROLE = re.compile(r"""h\(\s*["'](button|input|select|textarea|details|summary|dialog|form)["']|<(button|input|select|textarea|details|dialog|form)\b""")
# O que é PÔR A PEÇA NO LUGAR, e não mudar a peça: a página pode, na classe dela, posta na peça (ampliação de 17/10/2026).
LUGAR = {"width", "min-width", "max-width", "inline-size", "min-inline-size", "max-inline-size", "height", "block-size",
         "margin", "margin-inline", "margin-block", "margin-inline-start", "margin-inline-end", "margin-block-start",
         "margin-block-end", "grid-row", "grid-column", "grid-area", "order", "justify-self", "align-self", "place-self",
         "flex", "flex-grow", "flex-shrink", "flex-basis", "position", "inset", "inset-inline-start", "inset-inline-end",
         "inset-block-start", "inset-block-end", "z-index", "display"}
ESTILO_VISUAL = re.compile(r"style:\s*\{[^}]*\b(color|background|fontSize|fontWeight|border|width|height|padding|margin|gap)\b")


def auditar():
    erros, avisos = [], []
    core = classes_do_core()
    css, base = css_do_site()
    na_peca = classes_postas_nas_pecas(core)
    for sel, corpo, linha in regras(css):
        for um in sel.split(","):
            s = sujeito(um)
            do_core = [c for c in re.findall(r"\.([\w-]+)", s) if c in core]
            if do_core:
                erros.append(f"1 · build-catalog.mjs:{base + linha} — `{um.strip()}` estiliza por dentro da peça "
                             f"`.{do_core[0]}` da Aurea: a variação que falta se cria NA Aurea")
                continue
            # Ampliação de 17/10/2026, os dois buracos que a classificação dos 45 achou:
            # (a) o seletor termina numa TAG dentro de uma peça (`.demo-tabs .segmented button`);
            classes_no_seletor = [c for c in re.findall(r"\.([\w-]+)", sem_parenteses(um)) if c in core]
            if not re.findall(r"\.([\w-]+)", s) and classes_no_seletor:
                erros.append(f"1 · build-catalog.mjs:{base + linha} — `{um.strip()}` estiliza, pela tag, por dentro da peça "
                             f"`.{classes_no_seletor[-1]}` da Aurea: a variação que falta se cria NA Aurea")
                continue
            # (b) a classe do SITE está no próprio elemento da peça (`.vit-cartao` num `.card`) e muda a peça POR DENTRO.
            # Pôr a peça no lugar (largura, margem, coluna da grade, posição, mostrar ou esconder) é trabalho da página.
            postas = [c for c in re.findall(r"\.([\w-]+)", s) if c in na_peca]
            props = {d.split(":", 1)[0].strip() for d in corpo.split(";") if ":" in d}
            if postas and props - LUGAR:
                erros.append(f"1 · build-catalog.mjs:{base + linha} — `{um.strip()}`: a classe do site `.{postas[0]}` está no "
                             f"elemento da peça `.{na_peca[postas[0]]}` e a restiliza: a variação que falta se cria NA Aurea")
        for m in COR.finditer(corpo):
            erros.append(f"2 · build-catalog.mjs:{base + linha} — cor escrita (`{m.group(0)}…`) em `{sel.strip()[:50]}`: use um token")
        for m in MEDIDA.finditer(corpo):
            erros.append(f"3 · build-catalog.mjs:{base + linha} — medida escrita (`{m.group(0)}`) em `{sel.strip()[:50]}`: use um token")
    fontes = [GERADOR] + sorted(p for p in VIVO.glob("*") if p.suffix in {".tsx", ".mjs", ".ts"})
    for f in fontes:
        for n, l in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if l.lstrip().startswith("//"):
                continue
            m = CONTROLE.search(l)
            if m and not any(chave in l for chave in SEM_PECA):
                erros.append(f"4 · {f.relative_to(RAIZ).as_posix()}:{n} — controle feito à mão (`{(m.group(1) or m.group(2))}`): "
                             "use a peça da Aurea, ou declare o motivo em SEM_PECA")
            if f != GERADOR and ESTILO_VISUAL.search(l):
                avisos.append(f"5 · {f.relative_to(RAIZ).as_posix()}:{n} — estilo escrito no código")
    return erros, avisos


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    erros, avisos = auditar()
    for e in erros:
        print("✗", e)
    for a in avisos:
        print("·", a)
    print(f"\ntrava do site: {len(erros)} reprovação(ões), {len(avisos)} aviso(s)")
    sys.exit(1 if erros else 0)
