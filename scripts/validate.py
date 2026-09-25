"""Validação da Aurea.

Quantos checks são NÃO se lê aqui: o número é medido e vive em `manifest.json` (`gates.validate`),
gerado e gateado pelo check 20. Esta linha dizia "26 checks" e o medido era 29 — contagem à mão no
arquivo que existe para acabar com contagem à mão (achado I1, e o mesmo defeito que o AUD-0008
achou espalhado pelos documentos vivos).

O que eles cobrem: nomes privados (repo inteiro), JSONs válidos,
tokens e identidade canônica no CSS do core, ausência de gradientes, escala de
breakpoints, paridade tokens ⟷ core, dist == build do core,
receitas em patterns/ ⟷ contrato, licenças por pacote, fichas
de registry (schema, enums, token existe, cobertura exata), catraca de pixel cru de
espaçamento, estado publicado (STATE.md + bloco do README) == estado medido, variante do
TypeScript == variante da ficha, fronteira do core (classe sem componente React),
maturidade Stable ⟷ teste, fonte de preview por item (modelo de página, ADR-0001),
classe emitida pelo React ⟷ regra no core, fronteira servidor/cliente (a diretiva
"use client" nos módulos que precisam dela, e só neles), `source.react` da ficha
apontando para o arquivo que de fato declara o componente, e as referências próprias em código
dos documentos vivos selecionados não apontando para caminho removido nem escrevendo versão 0.x.y,
a distribuição declarada no contrato igual aos pacotes públicos reais, e todos os lugares públicos
onde a versão mora declarando o mesmo número.
Acrescentado pela linhagem da ATIVIDADE-2: EIXO do TypeScript == eixo da ficha (variante, tamanho
e qualquer união literal em `axes`), estado que o core PINTA ⟷ estado que alguma ficha declara,
paridade entre o que o runtime vanilla (`window.Aurea`) faz e o que o pacote React entrega, o
estado de LEITURA da matriz do §13 (MATRIX-ESTADO.json) ⟷ a matriz gerada (MATRIX.json), e
teclado declarado na ficha ⟷ rastro de medição no navegador (`keyboardNote`).

Flags:
  --write-raw-px-baseline   regrava scripts/raw-px-baseline.json (check 12)
  --write-state             regrava STATE.md e o bloco do README (check 13)
  --write-core-boundary     regrava scripts/core-boundary.json (check 15)
"""
from pathlib import Path
import json
import os
import re
import collections
import sys

root = Path(__file__).resolve().parents[1]
errors = []

# ── 1. nomes privados (endurecido — auditoria 18/07/2026, ALTO 7) ──
# A LISTA NÃO MORA NO REPOSITÓRIO — decisão do Victor, 24/09/2026, antes de abrir o repositório.
# Até essa data ela vivia aqui em base64, que qualquer pessoa decodifica em um segundo. Trocar por
# impressão (hash) também não servia, e isso foi medido: 19 dos 31 nomes têm 6 letras ou menos,
# e um nome curto sai da impressão por tentativa em minutos.
#
# Ela vem, nesta ordem, de:
#   1. a variável de ambiente AUREA_NOMES_PRIVADOS, nomes separados por ";" (ambiente da nuvem, CI);
#   2. o arquivo `.nomes-privados` na raiz, um nome por linha (máquina local; o git o ignora).
#
# 🔴 SEM NENHUM DOS DOIS, O GATE REPROVA. Gate que se desliga sozinho quando falta configuração é
# o defeito que este arquivo mais registra. A única saída é declarar AUREA_SEM_LISTA=1, e a CI só
# faz isso em pedido de junção vindo de fork, porque o GitHub não entrega segredo a fork.
#
# Achado positivo NUNCA imprime o nome: sai "#<índice>", a posição na lista. Caminhos também são
# escaneados. O `legacy-reference.html`, a única exceção que existia, saiu do repositório em
# 24/09/2026: ele carregava os nomes antigos e fica só no repositório privado.
import unicodedata


def _carregar_lista() -> list[str]:
    bruto = os.environ.get("AUREA_NOMES_PRIVADOS", "")
    arquivo = root / ".nomes-privados"
    if not bruto.strip() and arquivo.is_file():
        bruto = arquivo.read_text(encoding="utf-8-sig").replace("\n", ";")
    # Aspas em volta da lista inteira (formato .env) não fazem parte de nome nenhum.
    bruto = bruto.strip().strip("\"'")
    return [n.strip() for n in bruto.split(";") if n.strip()]


PRIVATE = _carregar_lista()
SEM_LISTA = os.environ.get("AUREA_SEM_LISTA") == "1"
if not PRIVATE and not SEM_LISTA:
    errors.append(
        "check 1: a lista de nomes privados não foi encontrada. Defina AUREA_NOMES_PRIVADOS "
        "(nomes separados por ';') ou crie o arquivo .nomes-privados na raiz, um nome por linha. "
        "Sem ela, o gate de nomes privados não roda — e ele não roda calado")
# `Referencia` são as seis referências de construção do BUILDING.md §1: 301 MB de código de
# TERCEIRO, fora do git (.gitignore) e fora do build. O gate existe para proteger o que a Aurea
# publica; varrer código alheio custou 300 s de validação e produziu falso positivo de nome
# privado dentro de um lockfile que não é nosso. Medido em 02/08/2026, ao adotá-las como locais.
SKIP_DIRS = {".git", "node_modules", "test-results", "playwright-report", "blob-report",
             "Referencia"}
# Saída das duas aplicações de prova da fronteira (PLANO-1.0, A3 e A4): bundle de terceiro
# MINIFICADO, fora do git e refeito a cada build. Não é só custo de tempo — o scan de nomes
# privados tem fronteira de palavra, e em JavaScript minificado uma propriedade de três letras
# colada num ponto e num `=` casa com os nomes curtos da lista — o repositório reprovaria por
# causa de código que não é nosso. (Escrever o exemplo aqui já reprovou uma vez: o gate pegou o
# próprio comentário que o explicava, o que é a demonstração de que ele é real.) Por CAMINHO, e
# não por nome de pasta: um `out/` qualquer em outro lugar continua sendo varrido.
SKIP_PATHS = {root / "apps/proof-server/.next", root / "apps/proof-server/out",
              root / "apps/proof-client/out"}
# Worktrees do git (.claude/worktrees/<x>) são cópias detached do repo inteiro —
# incluindo o legacy — e são plumbing transitório, como .git. Pular a subárvore.
WORKTREES = root / ".claude" / "worktrees"
# Binários (imagens, fontes) não carregam nomes em texto legível, e seus bytes
# ~aleatórios colidem por acaso com um nome curto de 3 letras da lista acima. O
# scan de nomes privados é para texto/código; pular binários elimina um falso
# positivo que reaparece toda vez que baselines de screenshot são regeradas.
SKIP_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
             ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm", ".pdf",
             # `.tgz` entrou em 03/09/2026 pela MESMA razão dos de cima, e com o falso positivo
             # já medido: os tarballs que o `apps/native-smoke/preparar.mjs` gera em `vendor/`
             # são fluxo comprimido, e os bytes acusaram um nome curto da lista por acaso.
             ".tgz", ".tar", ".zip", ".gz"}
BASE64_RE = re.compile(r"base64,[A-Za-z0-9+/=]+")
# Invisíveis que esconderiam um nome no meio: zero-width, soft hyphen, BOM, NUL.
INVISIBLE = dict.fromkeys(map(ord, "​‌‍⁠­﻿\x00"))
PATTERNS = [
    # fronteira: sem letra/dígito antes; sem minúscula/dígito depois
    # (maiúscula depois é permitida para pegar camelCase, ex.: xOverrides)
    re.compile(r"(?<![A-Za-zÀ-ÿ0-9])(?i:" + re.escape(name) + r")(?![a-zà-ÿ0-9])")
    for name in PRIVATE
]


# Qualquer LOCKFILE, e não só o do pnpm: o app de smoke test (`apps/native-smoke/`) é instalado
# com `npm`, de propósito — está fora do workspace para ser um consumidor comum —, e o
# `package-lock.json` dele lista os mesmos pacotes de terceiro. Medido em 03/09/2026: sem isto,
# quem rodasse o app e depois o validador reprovaria, e o defeito não seria dele.
# Isto NÃO amplia a janela que o Victor aprovou: ela era "só no lockfile", e este é um lockfile.
LOCKFILES = {"pnpm-lock.yaml", "package-lock.json"}
# ⚠ EXCEÇÃO ESTREITA, aberta em 02/09/2026 com a palavra do Victor, porque a lista é dele.
#
# Instalar o React Native trouxe ao lockfile pacotes PÚBLICOS DE TERCEIRO cujo nome colide com um
# nome da lista — nenhum deles é vazamento, e não há React Native sem eles. Eles chegam em quatro
# formas: `<n>-parser`, `<n>-compiler`, `<n>-estree` e `babel-plugin-syntax-<n>-parser`.
#
# O nome NÃO sai da lista. O que se abre é uma janela do tamanho exato do problema:
#
#   • vale SÓ em lockfile, e em nenhum outro arquivo;
#   • vale SÓ para as quatro formas acima;
#   • o nome SOZINHO, ou em qualquer outra forma, continua reprovando — inclusive ali dentro.
#
# Provado contra o defeito: com o nome solto numa linha do lockfile, o gate reprova. Desde que a
# lista saiu do repositório (24/09/2026), a janela vale para qualquer nome da lista nessas formas,
# e não mais para uma posição fixa, que dependia da ordem de um arquivo que agora mora fora daqui.
TERCEIRO_LOCK_RE = re.compile(
    r"(?:babel-plugin-syntax-)?(?:" + ("|".join(map(re.escape, PRIVATE)) or r"(?!)")
    + r")-(?:parser|compiler|estree)",
    re.IGNORECASE)


def decode_any(raw: bytes) -> str:
    """UTF-8 por padrão; UTF-16 por BOM ou por NULs intercalados (texto UTF-16
    lido como UTF-8-ignore vira p\\x00a\\x00n… e o nome escaparia do regex)."""
    if raw[:2] in (b"\xff\xfe", b"\xfe\xff"):
        return raw.decode("utf-16", errors="ignore")
    if b"\x00" in raw[:4096]:
        try:
            return raw.decode("utf-16", errors="strict")
        except UnicodeDecodeError:
            pass
    return raw.decode("utf-8", errors="ignore")


def scan_text(text: str) -> set[int]:
    """Índices (na lista PRIVATE) achados no texto, já normalizado contra
    NFKC, invisíveis e quebra de linha interna."""
    text = unicodedata.normalize("NFKC", text).translate(INVISIBLE)
    joined = re.sub(r"[\r\n]+", "", text)  # nome quebrado em duas linhas
    found = set()
    for i, pat in enumerate(PATTERNS):
        if pat.search(text) or pat.search(joined):
            found.add(i)
    return found


# AUD-0007 (auditoria SENTINELA, 12/08/2026): isto era `root.rglob("*")` com os filtros aplicados
# DEPOIS, o que significa descer em `node_modules` (e nas 301 MB de `Referencia`) inteirinhos para
# então descartar cada arquivo um por um — cerca de 157 mil entradas, com um `is_file()` e a
# construção de um set de nomes de ancestrais por entrada. Medido nesta máquina antes da poda:
# **74,7 s** de validação total.
#
# `os.walk` deixa PODAR: mutar `dirnames` no lugar impede a descida naquela subárvore. O escopo
# sobre o que NÃO é ignorado continua idêntico — as três regras de exclusão viraram três testes de
# poda, e nenhum arquivo antes varrido deixa de ser varrido.
#
# Uma diferença de comportamento, e ela CORRIGE: a regra antiga olhava o nome de TODOS os
# ancestrais, inclusive acima da raiz do repositório. Um clone dentro de uma pasta chamada
# `node_modules` fazia o gate pular o repositório inteiro e passar verde sem varrer nada. A poda
# começa na raiz, então isso não acontece mais.
# ── carona do check 38: `foreignObject`/`switch` nos 2571 gerados ──────────────────────────
# Esta lista e' PREENCHIDA na varredura abaixo e COBRADA no check 38, la' embaixo, onde mora o
# raciocinio dos icones. A razao de nao ler os arquivos no proprio check 38 e' custo: a varredura
# de nomes privados JA' abre e decodifica todo `.js` do repositorio, entao aqui a checagem e' um
# `in` sobre bytes que ja' estao na memoria — zero I/O novo.
#
# 🔴 POR QUE ELA SAIU DO VITEST — medido em 10-11/09/2026, e o numero e' o argumento:
#
#     as 2571 leituras, isoladas, na maquina do Victor ....  1,84 s
#     o teste que as fazia, rodando o arquivo sozinho .....  1,89 s
#     o MESMO teste dentro do `pnpm test` inteiro ......... 40,71 s
#
# O terceiro numero e' 21x o segundo, e a diferenca e' CONCORRENCIA: o vitest roda 37 arquivos em
# paralelo e os workers disputam o disco. Eram ~63% da duracao da suite gastos em UM teste, e ele
# corria contra um limite de tempo — primeiro o implicito de 5000 ms (que REPROVOU na maquina
# dele), depois um explicito de 60 s cuja margem era 1,5x sobre uma dispersao observada de 20x.
#
# ⚠ A COBERTURA NAO CAIU, e isso e' o que autoriza a mudanca: o `CLAUDE.md` manda rodar o
# `validate.py` apos QUALQUER alteracao, e a ADR-0013 o poe na cadeia de publicacao. O invariante
# passou de um gate obrigatorio para outro gate obrigatorio — e para um que nao tem relogio.
_ICONES_NATIVOS = root / "packages/native/icons"
_icones_maus = []

for dirpath, dirnames, filenames in os.walk(root):
    aqui = Path(dirpath)
    dirnames[:] = [d for d in dirnames
                   if d not in SKIP_DIRS
                   and (aqui / d) != WORKTREES
                   and (aqui / d) not in SKIP_PATHS]
    for nome in filenames:
        path = aqui / nome
        if not path.is_file():  # symlink quebrado aparece em filenames e não se lê
            continue
        rel = path.relative_to(root)
        for i in scan_text(str(rel)):  # o CAMINHO também não pode conter nome
            errors.append(f"{rel}: nome privado #{i} no caminho")
        # O arquivo da lista contém a lista: varrê-lo reprovaria a si mesmo. Caminho EXATO na raiz.
        if path == root / ".nomes-privados" or path.suffix.lower() in SKIP_EXTS:
            continue
        text = BASE64_RE.sub("base64,", decode_any(path.read_bytes()))
        if path.name in LOCKFILES:
            text = TERCEIRO_LOCK_RE.sub("<pacote-de-terceiro>", text)
        for i in scan_text(text):
            errors.append(f"{rel}: nome privado #{i}")
        # A carona descrita acima. `index.js` e `props.js` ficam de fora: o barril e' 2571 linhas
        # de `export`, e o `props` e' tipo — nenhum dos dois e' desenho gerado.
        if (aqui == _ICONES_NATIVOS and path.suffix == ".js"
                and path.name not in ("index.js", "props.js")):
            _achados = [t for t in ("foreignObject", "switch") if t in text]
            if _achados:
                _icones_maus.append(f"{path.stem} ({'+'.join(_achados)})")

# Auto-teste retido: o scan tem de pegar as evasões conhecidas e não dar
# falso positivo. Roda em toda invocação; se falhar, o gate inteiro falha.
_p = PRIVATE[0] if PRIVATE else "sem-lista"
_SELFTEST = [] if not PRIVATE else [
    (_p, True), (_p.upper(), True),
    ("x" + _p, False), (_p + "x", False),           # fronteiras
    (_p[:3] + "​" + _p[3:], True),             # zero-width no meio
    (_p[:3] + "\n" + _p[3:], True),                 # quebra de linha interna
    ("texto inocente", False),
]
for sample, should_hit in _SELFTEST:
    if bool(scan_text(sample)) != should_hit:
        errors.append(f"validate.py: auto-teste do scan falhou ({should_hit=})")
if PRIVATE and 0 not in scan_text(decode_any(("x " + _p + " y").encode("utf-16"))):
    errors.append("validate.py: auto-teste UTF-16 falhou")

# ── 2. JSONs válidos ───────────────────────────────────────────────
JSONS = [
    "packages/contracts/aurea.contract.json",
    "packages/tokens/src/aurea.tokens.json",
]
parsed = {}
for rel in JSONS:
    try:
        parsed[rel] = json.loads((root / rel).read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{rel}: JSON inválido: {exc}")

# ── 34. contrato de distribuição == pacotes públicos reais ─────────────────
# O contrato é a instrução que um consumidor segue; uma lista de pacotes incompleta faz um
# pacote publicável desaparecer da superfície oficial. AUD-SENTINELA (12/08/2026) encontrou
# `@aurea-uds/fonts` ausente aqui enquanto README, manifest e o próprio package.json o tratavam
# como público. A comparação é por manifest, não por uma sexta lista escrita à mão.
_contrato = parsed.get("packages/contracts/aurea.contract.json")
_public_manifestos = []
_publicos = set()
for _pj in sorted((root / "packages").glob("*/package.json")):
    _pkg = json.loads(_pj.read_text(encoding="utf-8"))
    if _pkg.get("publishConfig", {}).get("access") == "public":
        _public_manifestos.append(_pj)
        if _pkg.get("name"):
            _publicos.add(_pkg["name"])
        else:
            errors.append(f"{_pj.relative_to(root).as_posix()}: pacote público sem campo 'name'")
if not _public_manifestos:
    errors.append("check 34: nenhum pacote público encontrado — a comparação com o contrato não mede nada")
if _contrato is not None:
    _declarados = set(_contrato.get("distribution", {}).get("packages", []))
    _faltam, _sobram = sorted(_publicos - _declarados), sorted(_declarados - _publicos)
    if _faltam or _sobram:
        _detalhe = ([f"faltam: {', '.join(_faltam)}"] if _faltam else []) + \
                   ([f"sobram: {', '.join(_sobram)}"] if _sobram else [])
        errors.append("contrato distribution.packages diverge dos pacotes públicos (" + "; ".join(_detalhe) + ")")

# ── 3. tokens e seletores obrigatórios no CSS do core ──────────────
# Identidade intocável (CLAUDE.md): checar o VALOR canônico, não só o nome do
# token — trocar o amarelo/raios e rebuildar deixaria os gates verdes de outro
# jeito (auditoria 18/07/2026, MÉDIO 7).
css = (root / "packages/core/dist/aurea.css").read_text(encoding="utf-8")
for required in ['[data-theme="dark"]', '[data-theme="light"]',
                 '[data-density="compact"]']:
    if required not in css:
        errors.append(f"core CSS sem {required}")
IDENTITY = {
    "--brand-yellow": "oklch(0.795 0.184 86.047)",
    "--radius-card": "22px",
    "--radius-control": "999px",
}
for token, value in IDENTITY.items():
    if not re.search(re.escape(token) + r"\s*:\s*" + re.escape(value) + r"\s*;", css):
        errors.append(f"core CSS: {token} não é o valor canônico ({value}) — identidade intocável")

# CSS íntegro: comentário aberto e não fechado transforma a regra seguinte em texto
# solto e o browser DESCARTA a regra — silenciosamente. Aconteceu (23/07/2026): comi o
# `.app-shell` inteiro e só as 26 telas de referência acusaram, com falha confusa. Aqui
# o erro sai na hora e apontando o arquivo. CSS não aninha comentário, então contar basta.
# O terceiro era `apps/docs/docs.css`, que saiu na Parte D. Quem ocupou o lugar dele como
# folha de CHROME é a do catálogo gerado — mesma natureza, mesmo risco de comentário aberto.
for rel in ["packages/core/src/aurea.css", "packages/core/dist/aurea.css",
            "apps/catalog/assets/catalog.css"]:
    txt = (root / rel).read_text(encoding="utf-8")
    if txt.count("/*") != txt.count("*/"):
        errors.append(f"{rel}: comentário desbalanceado ({txt.count('/*')} '/*' vs {txt.count('*/')} '*/')")
    if txt.count("{") != txt.count("}"):
        errors.append(f"{rel}: chaves desbalanceadas ({txt.count('{')} '{{' vs {txt.count('}')} '}}')")

# ── 4. sem gradientes (hardRule do contrato) ───────────────────────
# A terceira era `apps/docs/index.html`, que saiu na Parte D. O catálogo é GERADO, então o
# gradiente só poderia entrar por três portas: a folha de chrome, o gerador, ou o conteúdo
# escrito à mão em `apps/catalog/content/`. As três são varridas — varrer as 183 páginas de
# saída seria medir o mesmo defeito depois de ele já ter sido cometido.
_sem_gradiente = ["packages/core/dist/aurea.css", "packages/core/src/aurea.css",
                  "apps/catalog/assets/catalog.css", "scripts/build-catalog.mjs",
                  "scripts/page-model.mjs"]
_sem_gradiente += [str(f.relative_to(root)) for f in sorted((root / "apps/catalog/content").rglob("*.mjs"))]
for rel in _sem_gradiente:
    if "gradient(" in (root / rel).read_text(encoding="utf-8"):
        errors.append(f"{rel}: contém gradient()")

def _sem_comentario(texto):
    """COMENTÁRIO NÃO PRODUZ PIXEL. A contagem por eixo (logo abaixo) já descartava comentário
    desde a Fase 4; a de ESPAÇAMENTO não, e a assimetria cobrou em 02/08/2026: uma frase
    explicando por que `padding:0` fica e de onde vem o 1px do navegador foi contada como um
    valor cru, e o gate reprovou a prosa em vez do CSS. É o mesmo defeito que o check 15 já
    tinha corrigido do lado das classes, e a correção é a mesma."""
    return re.sub(r"^[ \t]*//[^\n]*$", "", re.sub(r"/\*.*?\*/", "", texto, flags=re.S), flags=re.M)


# ── 4b. escala de breakpoints (o "enraizar" da responsividade) ─────
# Antes: 7 larguras na mão (400/640/800/820/821/1100/1366), sem sistema — a barra
# estourava e nada obrigava um plano de tela estreita. Agora a escala é única
# (Tailwind, padrão de mercado 2026 / base do Untitled UI), definida nos tokens.
# @media não lê var(), então o CSS usa o valor literal e ESTE gate garante a escala.
bp_src = (root / "packages/tokens/dist/aurea.tokens.css").read_text(encoding="utf-8")
SCALE = {int(v) for v in re.findall(r"--breakpoint-[a-z0-9]+:\s*(\d+)px", bp_src)}
# Legado CONGELADO: os breakpoints que já existiam no catálogo escrito à mão (.doc-*)
# antes da escala. Não se mexe (mudá-los desloca as 26 telas de referência — mesma
# política dos 239 pixels crus); morrem quando o catálogo virar dogfooded (Fase 3).
# A lista é fixa: o gate garante que ela não CRESCE — breakpoint novo tem de ser da escala.
# VAZIA desde 08/08/2026, e é o fecho do achado M13. Eram seis larguras herdadas do catálogo
# escrito à mão. Quatro (800/820/821/1366) saíram junto com `apps/docs/index.html` na Parte D;
# a de 1100 já não era usada; e a de 400 — a única que servia um COMPONENTE, o MediaPlayer —
# virou `@container`, porque a largura que aperta os controles é a do player e não a da janela.
# Trocá-la por um degrau da escala teria fechado o gate mantendo o defeito.
# E ELA NÃO ESTAVA FECHADA — o merge de 28/08/2026 mostrou que a dívida MUDOU DE LUGAR em vez de
# sair. A de 400 virou `@container (max-width:400px)`, e o gate desta linhagem só olhava `@media`:
# a regra saiu do alcance do gate, não da folha. A outra linhagem já cobrava `@container` na mesma
# conta, e foi juntar as duas para o 400 reaparecer.
# Fica declarado como legado em vez de silenciado, e NÃO foi trocado por 480 (`xs`) por conta
# própria: 400 é limiar VISUAL medido para os controles do player, e mover limiar medido é
# decisão de desenho, não de merge. É a única exceção da lista, e ela só pode cair.
LEGACY_BP = {400}
# `max-width` fecha em breakpoint-1 (639/767/1023…) pra não empatar com o `min-width` do
# mesmo ponto — é a convenção mobile-first. Ambos os lados representam a mesma escala.
VALID_BP = SCALE | {v - 1 for v in SCALE} | LEGACY_BP
core_src = (root / "packages/core/src/aurea.css").read_text(encoding="utf-8")
# DOIS buracos, um de cada linhagem, e este merge fecha os dois de uma vez.
# (a) COMENTÁRIO NÃO É REGRA — o gate lia o fonte inteiro, então a prosa que explica por que um
#     breakpoint saiu (e que precisa citar a forma antiga para explicar) era contada como regra.
#     É a quarta vez que este repositório aprende isto: o check 12 em 02/08/2026, o 23 em 06/08.
# (b) `@container` ENTRA NA MESMA CONTA (G-AXIS-04, 22/08/2026): a camada responsiva usa os dois
#     mensuráveis, e um ponto de container fora da escala escapava de um gate que só via `@media`.
#     Uma escala só para os dois é o que impede `md` de significar duas coisas.
used_bp = {int(v) for cond in re.findall(r"@(?:media|container)([^{]*)\{", _sem_comentario(core_src))
           for v in re.findall(r"(?:max|min)-(?:width|height)\s*:\s*(\d+)px", cond)}
stray_bp = sorted(used_bp - VALID_BP)
if not SCALE:
    errors.append("tokens: escala de breakpoints (--breakpoint-*) não encontrada")
if stray_bp:
    errors.append(f"core CSS: breakpoint(s) fora da escala {sorted(SCALE)}: {stray_bp} "
                  f"(use um token --breakpoint-*; legado congelado é {sorted(LEGACY_BP)})")

# ── 5. paridade: todo token do pacote tokens existe no core ────────
tokens_css = (root / "packages/tokens/dist/aurea.tokens.css").read_text(encoding="utf-8")
DEF_RE = re.compile(r"(--[a-z0-9-]+)\s*:")
missing = sorted(set(DEF_RE.findall(tokens_css)) - set(DEF_RE.findall(css)))
if missing:
    errors.append(f"tokens ausentes no core CSS: {', '.join(missing[:8])}…")

# ── 6. dist == build (core é gerado: tokens CSS + componentes) ─────
# CSS: dist/aurea.css = tokens.css + core, os DOIS dentro de @layer aurea (Fase 6, achado M16).
# Os tokens entram na camada junto: declaração de custom property compete na cascata como
# qualquer outra, e deixá-los fora fazia o override que o core declara em @media perder para o
# valor base. JS ainda é cópia.
expected_css = (
    "@layer aurea{\n"
    + (root / "packages/tokens/dist/aurea.tokens.css").read_text(encoding="utf-8")
    + (root / "packages/core/src/aurea.css").read_text(encoding="utf-8")
    + "}\n"
)
if (root / "packages/core/dist/aurea.css").read_text(encoding="utf-8") != expected_css:
    errors.append("packages/core: dist/aurea.css difere do build (rode scripts/build-core.mjs)")
if (root / "packages/core/dist/aurea.js").read_bytes() != (root / "packages/core/src/aurea.js").read_bytes():
    errors.append("packages/core: dist/aurea.js difere de src/aurea.js")

# ── 7 e 8 SAÍRAM na Parte D do PLANO-1.0 (08/08/2026) ─────────────
# Os dois cobravam `apps/docs/index.html`: o 7 comparava o contrato EMBUTIDO nela com o pacote
# `contracts`, e o 8 comparava o `<style>` dela com o build. Os dois existiam porque aquela
# página duplicava coisa que tinha dono em outro lugar — o contrato e o CSS do core. Com a
# página removida, a duplicação acabou, e gate sobre arquivo que não existe é ruído.
# O que os substitui não é um check novo: é a ausência da cópia. O contrato tem uma fonte só
# (`packages/contracts/aurea.contract.json`), e o CSS do core tem o `dist == build` do check 6.

# ── 9. receitas em patterns/ ⟷ contrato ───────────────────────────
# Cada receita (patterns/<archetype>.md) declara archetype + patterns no
# front matter; ambos têm de bater com applicationPatterns do contrato.
# O índice do README precisa citar os 23 (feitos ou pendentes).
contract = parsed.get("packages/contracts/aurea.contract.json")
if contract:
    archetypes = contract["applicationPatterns"]["archetypes"]
    RECIPE_SECTIONS = ["## Composition", "## Capabilities", "## Invariants", "## States"]
    seen_archetypes = set()
    for md in sorted((root / "patterns").glob("*.md")):
        if md.name == "README.md":
            continue
        rel = md.relative_to(root)
        body = md.read_text(encoding="utf-8")
        m = re.match(r"---\narchetype: (\S+)\npatterns: ([^\n]+)\n---\n", body)
        if not m:
            errors.append(f"{rel}: front matter inválido (archetype/patterns)")
            continue
        arch = m.group(1)
        seen_archetypes.add(arch)
        declared = [p.strip() for p in m.group(2).split(",")]
        if md.stem != arch:
            errors.append(f"{rel}: nome do arquivo difere do archetype '{arch}'")
        if arch not in archetypes:
            errors.append(f"{rel}: archetype '{arch}' não existe no contrato")
        elif declared != archetypes[arch]["patterns"]:
            errors.append(f"{rel}: patterns divergem do contrato "
                          f"(esperado: {', '.join(archetypes[arch]['patterns'])})")
        # as 4 seções do recipeContract, na ordem (auditoria, MÉDIO 7)
        idxs = [body.find("\n" + h) for h in RECIPE_SECTIONS]
        if any(i < 0 for i in idxs):
            falta = [h for h, i in zip(RECIPE_SECTIONS, idxs) if i < 0]
            errors.append(f"{rel}: seções ausentes: {', '.join(falta)}")
        elif idxs != sorted(idxs):
            errors.append(f"{rel}: seções fora de ordem (esperado: {' → '.join(RECIPE_SECTIONS)})")
    # conjunto EXATO: excluir uma receita mantendo o índice do README deixava
    # passar; agora todo archetype do contrato tem de ter seu arquivo, e vice-versa.
    faltando = set(archetypes) - seen_archetypes
    if faltando:
        errors.append(f"patterns/: receitas faltando ({len(faltando)}): {', '.join(sorted(faltando))}")
    sobrando = seen_archetypes - set(archetypes)
    if sobrando:
        errors.append(f"patterns/: receitas sem archetype no contrato: {', '.join(sorted(sobrando))}")
    readme = (root / "patterns/README.md").read_text(encoding="utf-8")
    for arch in archetypes:
        if f"`{arch}`" not in readme:
            errors.append(f"patterns/README.md: índice sem `{arch}`")

# ── 10. licenças nos pacotes (auditoria 18/07/2026, ALTO 6) ────────
# Cada pacote publicável leva a própria LICENSE (npm inclui LICENSE sempre;
# NOTICE precisa estar em "files"). Fontes = OFL com o copyright da IBM;
# ícones = Apache + NOTICE de atribuição Carbon.
for pkg_dir in sorted((root / "packages").iterdir()):
    pj = pkg_dir / "package.json"
    if not pj.is_file():
        continue
    manifest = json.loads(pj.read_text(encoding="utf-8"))
    if "license" not in manifest:
        errors.append(f"{pkg_dir.name}: package.json sem campo license")
    if not (pkg_dir / "LICENSE").is_file():
        errors.append(f"{pkg_dir.name}: sem arquivo LICENSE no pacote")
fonts_lic = (root / "packages/fonts/LICENSE")
if fonts_lic.is_file():
    lic_text = fonts_lic.read_text(encoding="utf-8")
    if "SIL OPEN FONT LICENSE" not in lic_text or "IBM Corp" not in lic_text:
        errors.append("fonts/LICENSE: não é a OFL da IBM Plex")
icons_manifest = json.loads((root / "packages/icons/package.json").read_text(encoding="utf-8"))
if not (root / "packages/icons/NOTICE").is_file():
    errors.append("icons: sem NOTICE de atribuição Carbon")
elif "NOTICE" not in icons_manifest.get("files", []):
    errors.append("icons: NOTICE fora de \"files\" (não entraria no tarball)")

# ── 11. registry: ficha por componente (Fase 1 — exemplar) ─────────
# Cada packages/contracts/registry/<Componente>.json descreve um componente como
# DADO. Nesta etapa (exemplar) validamos as fichas que EXISTEM: schema, enums,
# nome ⟷ arquivo ⟷ componente React real, e que todo token citado exista de fato
# no CSS do core (mata "--font-sans" fictício). ponytail: a cobertura conjunto-
# exato (todos os componentes ⟷ ficha) entra JUNTO com a replicação — com uma só
# ficha ela falharia de propósito; aqui só se prova o que há.
# EIXO DE ESPÉCIE, criado em 21/08/2026 (ATIVIDADE-2, G-DX-01). O registry só modelava
# COMPONENTE, e a biblioteca exporta três hooks públicos — `useToast`, `useAureaStrings`,
# `useSpriteUrl` — que não tinham ficha, página nem exemplo. Não era buraco do toast: era uma
# espécie de superfície que o modelo não previa. O shadcn/ui tipa `registry:hook` desde sempre.
# `kind` é opcional e o padrão é `component`, para as fichas que já existiam não mudarem.
KIND = {"component", "hook"}
MATURITY = {"Draft", "Ready", "Stable", "Universal", "Deprecated"}
PLAT_STATUS = {"stable", "supported", "planned", "n-a"}
# Eixo de camada (DIRECTION.md §1) — nível de abstração, ortogonal à categoria.
LAYER = {"Foundation", "Primitive", "Component", "Composite", "Shell"}
# Taxonomia travada dos 59 (DIRECTION.md §4). Categoria por objetivo do usuário,
# NUNCA "Other" (§2.7). Crescer = adicionar categoria da direção, não catch-all.
# "AI & Agents" entrou em 09/08/2026 (ADR-0017), da macroarea 18 do DIRECTION.md, para
# a camada operacional da Parte H — 16 nomes que o contrato ja declarava em
# componentRules.UniversalDomain e que nao cabiam em nenhuma das 13 por objetivo.
CATEGORY = {"Actions", "Inputs", "Navigation", "Overlays", "Feedback", "Disclosure",
            "Data Display", "Identity", "Layout", "Media", "Code", "Communication",
            "System", "AI & Agents"}
REQUIRED = ["name", "category", "layer", "maturity", "summary", "icon", "platforms",
            "variants", "sizes", "states", "tokens", "a11y", "dependencies",
            "related", "source"]
# O ícone da ficha é o que a lateral do catálogo mostra: tem de existir no sprite E na
# allowlist do contrato (159 glifos Carbon) — senão a nav renderiza um buraco.
ALLOWED_ICONS = set(json.loads((root / "packages/contracts/aurea.contract.json")
                              .read_text(encoding="utf-8"))["iconSystem"]["allowedIcons"])
defined_tokens = set(re.findall(r"(--[a-z0-9-]+)\s*:", css))  # css = core (§3)

# ── 29. token usado e nunca declarado ──────────────────────────────────────
# Nasceu de um defeito REAL, e de dois: em 08/08/2026 o `.file-checksum` (item G4) e o
# `.tool-permission-scope` (item H.c) foram escritos com `var(--font-mono)`. Esse token
# NAO EXISTE — o do sistema e `--font-code`. As duas regras caiam calada­mente na fonte
# de texto, e nenhum gate viu: o check 11 confere os tokens que a FICHA declara, nao os
# que o CSS usa. Quem achou foi uma asseercao de pele do skin.spec, por acidente.
#
# A regra so cobra `var(--x)` SEM fallback: com fallback a ausencia e deliberada — sao as
# valvulas de escape (`--datagrid-max-h`, `--datagrid-detail-w`, `--grid-min`), no idioma
# do `--qr-size`. E duas ficam de fora por serem do MOTOR: o Base UI escreve
# `--anchor-width` e `--available-height` no posicionador, em tempo de execucao.
DO_MOTOR = {"--anchor-width", "--available-height"}
_css_sem_coment = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
_sem_fallback = {m.group(1) for m in re.finditer(r"var\(\s*(--[a-z0-9-]+)\s*\)", _css_sem_coment)}
_orfaos = sorted(_sem_fallback - defined_tokens - DO_MOTOR)
if _orfaos:
    errors.append(f"token usado e nunca declarado: {', '.join(_orfaos)} — sem fallback, "
                  "`var()` de token inexistente cai no valor herdado sem avisar ninguem. "
                  "Se a ausencia for deliberada, escreva o fallback: var(--x, algo).")
# TODOS os fontes do pacote React, não só o index. A Fase 9 quebrou o arquivo único em um
# módulo por categoria; se este gate seguisse lendo `index.tsx` ele veria um barril de
# reexports e passaria a aprovar tudo em silêncio — três checks (11, 14, 15/18) ficariam cegos
# no mesmo commit que os deixou desnecessários de propósito. Um split que apaga o gate é pior
# que o arquivo de 970 linhas.
tsx = "\n".join(fp.read_text(encoding="utf-8")
                for fp in sorted((root / "packages/react/src").glob("*.tsx")))
# CONSTANTE não é componente. `escala.tsx` (gerado) exporta `ESCALA` e `PONTOS_DESC`, e a
# varredura antiga os contava como componentes sem ficha — o que empurraria para a allowlist algo
# que não é exceção, é outra categoria.
#
# A primeira tentativa distinguia pela FORMA DO NOME (SCREAMING_CASE não tem minúscula) e quebrou
# na hora: `KPI` é componente e é todo maiúsculo. O sinal certo não é o nome, é a DECLARAÇÃO —
# `export const X = {` ou `= [` é dado; `export function` e todo o resto é componente.
exported = set(re.findall(r"export function ([A-Z][A-Za-z0-9]*)", tsx)) | {
    m.group(1) for m in re.finditer(r"export const ([A-Z][A-Za-z0-9]*)\s*(?::[^=]+)?=\s*(.)", tsx)
    if m.group(2) not in "{["}
# Hook público é `export const useX = …` ou `export function useX(…)`. Mesma varredura, outro
# formato de nome — e é isto que permite a ficha de hook existir sem afrouxar a de componente.
exported_hooks = set(re.findall(r"export (?:function|const) (use[A-Z][A-Za-z0-9]*)", tsx))
for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
    rel = fp.relative_to(root)
    try:
        f = json.loads(fp.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{rel}: JSON inválido: {exc}")
        continue
    missing = [k for k in REQUIRED if k not in f]
    if missing:
        errors.append(f"{rel}: ficha sem campos: {', '.join(missing)}")
        continue
    if f["name"] != fp.stem:
        errors.append(f"{rel}: name '{f['name']}' difere do arquivo '{fp.stem}'")
    kind = f.get("kind", "component")
    if kind not in KIND:
        errors.append(f"{rel}: kind '{kind}' inválido ({'/'.join(sorted(KIND))})")
    elif kind == "hook":
        if f["name"] not in exported_hooks:
            errors.append(f"{rel}: '{f['name']}' não é hook exportado do pacote react")
    elif f["name"] not in exported:
        errors.append(f"{rel}: '{f['name']}' não é componente exportado do pacote react")
    if f.get("icon") and f["icon"] not in ALLOWED_ICONS:
        errors.append(f"{rel}: icon '{f['icon']}' fora da allowlist do contrato")
    if f["category"] not in CATEGORY:
        errors.append(f"{rel}: category '{f['category']}' fora da taxonomia (ver DIRECTION.md §4)")
    if f["layer"] not in LAYER:
        errors.append(f"{rel}: layer '{f['layer']}' inválida ({'/'.join(sorted(LAYER))})")
    if f["maturity"] not in MATURITY:
        errors.append(f"{rel}: maturity '{f['maturity']}' inválida ({'/'.join(sorted(MATURITY))})")
    if not isinstance(f["platforms"], dict) or not f["platforms"]:
        errors.append(f"{rel}: platforms deve ser objeto não-vazio")
    else:
        for plat, st in f["platforms"].items():
            if st not in PLAT_STATUS:
                errors.append(f"{rel}: platforms.{plat}='{st}' inválido ({'/'.join(sorted(PLAT_STATUS))})")
    for k in ("variants", "sizes", "states", "tokens"):
        if not isinstance(f[k], list):
            errors.append(f"{rel}: {k} deve ser lista")
    for tok in f.get("tokens", []):
        if tok not in defined_tokens:
            errors.append(f"{rel}: token {tok} não existe no CSS do core")
    if not isinstance(f["a11y"], dict) or "role" not in f["a11y"]:
        errors.append(f"{rel}: a11y deve ser objeto com ao menos 'role'")
    # props é opcional (entra por componente, começando pelo exemplar), mas quando existe é
    # contrato de API publicado: sem tipo ou sem descrição a ficha engana quem consome.
    if "props" in f:
        if not isinstance(f["props"], list) or not f["props"]:
            errors.append(f"{rel}: props deve ser lista não-vazia")
        else:
            for pr in f["props"]:
                falta = [k for k in ("name", "type", "description") if not pr.get(k)]
                if falta:
                    errors.append(f"{rel}: prop {pr.get('name', '?')} sem: {', '.join(falta)}")
# cobertura conjunto-exato (replicação concluída): todo componente exportado do
# pacote react tem ficha. O sentido inverso (ficha sem componente) já é pego acima.
fichas = {fp.stem for fp in (root / "packages/contracts/registry").glob("*.json")}
# Nem todo export em PascalCase é componente. Estes dois são os contextos React que o
# `internal.tsx` precisa expor para o `system.tsx` montar o AureaProvider — apareceram com o
# split da Fase 9. Lista explícita e curta, no idioma das outras allowlists deste arquivo:
# ela não cresce sozinha, e crescer exige justificar aqui.
NAO_COMPONENTE = {"StringsContext", "SpriteContext", "PortalContext", "ThemeContext", "DensityContext",
                  # Sentinela "estou dentro de um AureaProvider", 09/09/2026. Contexto interno,
                  # nao componente e nao publico: o `index.tsx` reexporta do `internal.js` por
                  # NOME (nao `export *`) e `./internal` nao esta no `exports` do package.json.
                  "DentroDoProviderContext"}
faltando = exported - fichas - NAO_COMPONENTE
if faltando:
    errors.append(f"registry: {len(faltando)} componente(s) sem ficha: {', '.join(sorted(faltando))}")
# O mesmo para hook: superfície pública sem ficha é superfície que ninguém descobre, e foi
# exatamente o que aconteceu com o toast durante meses.
faltando_hooks = exported_hooks - fichas
if faltando_hooks:
    errors.append(f"registry: {len(faltando_hooks)} hook(s) público(s) sem ficha: "
                  f"{', '.join(sorted(faltando_hooks))}")

# ── 12. catraca de pixel cru de espaçamento ────────────────────────────────
# "Espaçamento novo só com var(--space-*)" era regra de prosa: ninguém media. A auditoria de
# 26/07 mostrou o resultado — 24 linhas novas com px cru entraram sem ninguém notar (e o
# auditor contou 568 porque somou os arquivos GERADOS, que são cópias da mesma fonte).
# Aqui a conta é só na FONTE e contra uma baseline versionada: pode CAIR, nunca SUBIR.
PROP = (r"padding|margin|gap|row-gap|column-gap|rowGap|columnGap"
        r"|inset|inset-inline|inset-block|top|right|bottom|left")
# A fronteira de palavra antes da propriedade evita contar "border-top" e "flex-basis";
# escrita como (?<![a-z-]) porque um \b literal já entrou aqui uma vez como byte 0x08.
RAW_PX = re.compile(r"(?<![a-z-])(?:" + PROP + r")[A-Za-z-]*\s*:\s*[^;{}]*?\d+px", re.I)
RAW_PX_INLINE = re.compile(r"(?<![a-z-])(?:" + PROP + r")[A-Za-z-]*\s*:\s*\"[^\"]*?\d+px", re.I)
# A catraca cobria só ESPAÇAMENTO. A auditoria (achado M1) mostrou o outro lado: o README
# prometia "identidade sempre via token" e o core tinha 17 raios crus, 10 font-size, 15
# font-weight e 5 line-height. Um eixo sem catraca recua no ritmo do descuido — e foi o que
# aconteceu com esses quatro enquanto o de espaçamento se mantinha.
# A contagem é na FONTE e ignora comentário: valor citado em prosa não é valor aplicado.
EIXOS = {
    "raio": r"border-radius\s*:\s*[^;{}]*?\d+px",
    "tamanho de fonte": r"font-size\s*:\s*\d+(?:\.\d+)?px",
    "peso de fonte": r"font-weight\s*:\s*\d",
    "entrelinha": r"line-height\s*:\s*[\d.]+(?![a-z%])",
}


def _sem_comentario(texto):
    """COMENTÁRIO NÃO PRODUZ PIXEL. A contagem por eixo (logo abaixo) já descartava comentário
    desde a Fase 4; a de ESPAÇAMENTO não, e a assimetria cobrou em 02/08/2026: uma frase
    explicando por que `padding:0` fica e de onde vem o 1px do navegador foi contada como um
    valor cru, e o gate reprovou a prosa em vez do CSS. É o mesmo defeito que o check 15 já
    tinha corrigido do lado das classes, e a correção é a mesma."""
    return re.sub(r"^[ \t]*//[^\n]*$", "", re.sub(r"/\*.*?\*/", "", texto, flags=re.S), flags=re.M)


# A camada responsiva é GERADA e COPIA valores das regras estáticas — que já são contadas. Contar
# as cópias faz a catraca subir 24 de uma vez sem que ninguém tenha escrito um pixel novo, e uma
# catraca que dispara sem defeito é uma catraca que se aprende a ignorar.
#
# Excluir não afrouxa nada, e isso importa: o que a camada emite é conferido, corpo a corpo, contra
# a regra estática pelo controle do `build-responsive-layer.mjs` — que FALHA o build na divergência.
# Um pixel cru novo só entra na camada entrando antes na regra estática, onde a catraca o pega.
#
# Eu havia afirmado no gerador que "a camada não introduz pixel cru". Era dedução, não medição: os
# valores são copiados por ponto, e a contagem é de OCORRÊNCIAS.
_MARCA_INI = "/* >>> camada responsiva — GERADA"
_MARCA_FIM = "/* <<< fim da camada responsiva >>> */"


def _sem_camada_gerada(txt):
    """Recorta a região gerada. Tem de rodar ANTES de tirar comentários: os marcadores são,
    eles próprios, comentários CSS — foi o que fez a primeira versão disto não recortar nada."""
    i, j = txt.find(_MARCA_INI), txt.find(_MARCA_FIM)
    return txt[:i] + txt[j:] if i >= 0 and j >= 0 else txt


def raw_px_counts():
    """Contagem por arquivo — usada pelo gate E pela regeneração da baseline, para os dois
    nunca divergirem de expressão."""
    out = {}
    # `scripts/build-docs.mjs` saiu na Parte D junto com a página que ele gerava.
    # `_sem_camada_gerada` recorta a camada responsiva ANTES de contar: ela é gerada, copia os
    # valores por ponto, e sem o recorte a catraca subiria sozinha a cada build.
    for rel_path in ("packages/core/src/aurea.css", "scripts/build-catalog.mjs"):
        out[rel_path] = len(RAW_PX.findall(_sem_comentario(_sem_camada_gerada(
            (root / rel_path).read_text(encoding="utf-8")))))
    out["apps/catalog/content/**/*.mjs"] = sum(
        len(RAW_PX_INLINE.findall(_sem_comentario(fp.read_text(encoding="utf-8"))))
        for fp in (root / "apps/catalog/content").rglob("*.mjs"))
    sem_comentario = re.sub(r"/\*.*?\*/", "", _sem_camada_gerada(core_src), flags=re.S)
    for eixo, rx in EIXOS.items():
        out[f"core: {eixo} cru"] = len(re.findall(rx, sem_comentario))
    return out


baseline_path = root / "scripts/raw-px-baseline.json"
if "--write-raw-px-baseline" in sys.argv:
    doc = json.loads(baseline_path.read_text(encoding="utf-8")) if baseline_path.is_file() else {}
    doc["arquivos"] = raw_px_counts()
    baseline_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("raw-px: baseline regravada —", doc["arquivos"])
    sys.exit(0)
if not baseline_path.is_file():
    errors.append("raw-px: falta scripts/raw-px-baseline.json (a catraca não tem referência)")
else:
    base = json.loads(baseline_path.read_text(encoding="utf-8"))["arquivos"]
    for key, n in raw_px_counts().items():
        esperado = base.get(key)
        if esperado is None:
            errors.append(f"raw-px: {key} não está na baseline")
        elif n > esperado:
            comoResolver = ("Valor de identidade novo vem de token (--radius-*, --text-*, "
                            "--weight-*, --leading-*)" if key.startswith("core: ")
                            else "Espaçamento novo usa var(--space-*)")
            errors.append(
                f"raw-px: {key} tem {n} valores crus (baseline {esperado}). "
                f"{comoResolver}; se a alta for deliberada, mova a baseline junto.")
        elif n < esperado:
            errors.append(
                f"raw-px: {key} caiu para {n} (baseline {esperado}) — ótimo, mas atualize "
                f"scripts/raw-px-baseline.json para travar o ganho.")

# ── 16. "Stable" na ficha exige teste ──────────────────────────────────────
# A auditoria de 26/07/2026 (achados M7 e M8) mediu 59 de 65 fichas declarando
# `maturity: "Stable"`, entre elas 15 sem UMA linha de teste. Maturidade existe para o
# experimental não parecer oficial (AUREA.md §2.8); declarada à mão e sem lastro, ela faz o
# inverso — o incompleto parece pronto. Aqui "Stable" passa a custar algo.
#
# A métrica é a MENÇÃO do nome nos testes unitários: grosseira de propósito, porque grosseira
# e medida vale mais que fina e chutada. Não prova qualidade do teste; prova que existe.
_unit_src = "".join(p.read_text(encoding="utf-8") for p in sorted((root / "tests/unit").glob("*.test.tsx")))
sem_teste = sorted(
    fp.stem for fp in (root / "packages/contracts/registry").glob("*.json")
    if json.loads(fp.read_text(encoding="utf-8")).get("maturity") == "Stable"
    and not re.search(r"(?<![A-Za-z0-9])" + re.escape(fp.stem) + r"(?![A-Za-z0-9])", _unit_src))
if sem_teste:
    errors.append(
        f"maturidade: {len(sem_teste)} ficha(s) dizem 'Stable' e o componente não aparece em "
        f"nenhum teste unitário: {', '.join(sem_teste)}. Ou escreva o teste, ou baixe a "
        f"maturidade para Ready/Draft — 'Stable' sem teste engana quem consome.")

# ── 15. fronteira do core: só entra classe que a biblioteca produz ─────────
# O core é o que TODO consumidor baixa. A auditoria de 26/07/2026 (achado A6) mediu que
# 24,6% dos seus bytes serviam a moldura do catálogo escrito à mão e a mockups de aplicação
# herdados do kit de origem — regra de produto misturada com regra de sistema, e nenhuma
# delas com componente, ficha ou contrato. A Fase 4 moveu isso para apps/docs/docs.css.
# Este gate impede a volta: classe no core tem de ser produzível por um componente React,
# ou estar na allowlist versionada — que pode CAIR, nunca subir (idioma do check 12 e do
# LEGACY_BP do 4b).
#
# Limite declarado: o gate olha CLASSE, não regra. Não percebe regra nova de docs escrita
# com uma classe que já está na lista. A lista some junto com apps/docs/index.html.
BOUNDARY_PATH = root / "scripts/core-boundary.json"
_gen_src = (root / "scripts/build-catalog.mjs").read_text(encoding="utf-8")
_content_src = "\n".join(p.read_text(encoding="utf-8")
                         for p in (root / "apps/catalog/content").rglob("*.mjs"))
# prefixos que o React compõe por template literal: `btn-${variant}`, `badge-${variant}`…
_PREFIX = re.findall(r"`([a-z-]+-)\$\{", tsx)
# O ajudante do G-AXIS-04 monta a classe a partir de um ARGUMENTO (`peleDoEixo("select", size)`),
# então não há template literal com prefixo para o `_PREFIX` achar — e o gate acusou `select-sm`,
# `textarea-lg` e companhia de não terem componente. Elas têm; o detector é que enxerga um formato
# só. Ler o primeiro argumento do ajudante é a mesma correção que a camada responsiva já exigiu:
# ensinar o gate a ver o novo formato, em vez de pôr a classe na allowlist de legado.
# Lista SEPARADA: o `_PREFIX` acima é conferido contra a crase no fonte (`\`btn-$\``), e essas não
# têm crase nenhuma — o nome sai do argumento. Misturá-las na mesma lista as faria falhar naquela
# conferência e o gate continuaria acusando.
_PREFIX_AJUDANTE = [f"{m}-" for m in re.findall(r'peleDoEixo\(\s*"([a-z-]+)"', tsx)]


def _cita(texto, cls):
    return re.search(r"(?<![A-Za-z0-9_-])" + re.escape(cls) + r"(?![A-Za-z0-9_-])", texto) is not None


# COMENTÁRIO NÃO PRODUZ CLASSE. O gate lia o fonte inteiro, então uma palavra solta em
# comentário — "o módulo que define overlay" — bastava para `.overlay` parecer produzida pela
# biblioteca. Apareceu na Fase 9, quando o split trouxe cabeçalhos novos. Mesma correção que o
# lado do CSS já tinha (o check remove comentário antes de contar classe declarada).
# CLASSE MORA EM STRING. O gate lia o fonte inteiro, então uma palavra solta num comentário —
# "o módulo que define overlay" — bastava para `.overlay` parecer produzida pela biblioteca.
# A primeira correção (remover comentários) foi por um caminho pior: `/*` aparece DENTRO do
# código, na string "/*" do matchesAccept, e o recorte comeu 4.750 caracteres reais, incluindo
# o className="dropzone" do FileInput. Escrever um tokenizador de JS para um gate é caro demais.
# Então o corpus deixa de ser "o fonte" e passa a ser "o conteúdo das strings do fonte", que é
# o único lugar onde um nome de classe pode virar classe de verdade. Comentário de linha
# inteira sai antes, porque comentário também tem aspas.
_tsx_codigo = re.sub(r"^[ \t]*//[^\n]*$", "", tsx, flags=re.M)
_tsx_strings = "\n".join(a or b or c for a, b, c in
                         re.findall(r'"([^"\n]*)"|\'([^\'\n]*)\'|`([^`]*)`', _tsx_codigo))


# A CAMADA RESPONSIVA (G-AXIS-04) é produzida por `classesResponsivas()`, que monta o nome com o
# PREFIXO também variável — `${prefixo}-${ponto}:${eixo}-${valor}`. O detector de prefixo dinâmico
# acima só enxerga literal antes do `${`, então ele não vê nenhuma destas 18 classes, e o gate as
# acusava de não ter componente. Elas TÊM: sai do Button, medido no DOM.
#
# A saída não é a allowlist — ela é para legado e só pode CAIR. É ensinar o gate a derivar a forma,
# e derivar da MESMA fonte que o CSS usa: os pontos vêm da escala de `--breakpoint-*`. Assim uma
# regra para um ponto que não existe na escala continua reprovando, que é o que o gate protege.
_PONTOS_ESCALA = set(re.findall(r"--breakpoint-([a-z0-9]+)\s*:", bp_src))
_PASSOS_ESCALA = set(re.findall(r"--control-h-([a-z0-9]+)\s*:", bp_src))
_EIXOS_RESPONSIVOS = {"size"}          # cresce junto com a camada, não antes dela


def _da_camada_responsiva(cls):
    if cls == "container-scope":
        return True                    # o contêiner nomeado, emitido pelo consumidor e pelos docs
    for eixo in _EIXOS_RESPONSIVOS:
        if cls.startswith(f"{eixo}-") and cls[len(eixo) + 1:] in _PASSOS_ESCALA:
            return True
    # o seletor com escape (`.vp-md\:size-lg`) chega aqui já partido no `\`, então sobra o prefixo
    for m in (re.fullmatch(r"(vp|ct)-([a-z0-9]+)", cls),):
        if m and m.group(2) in _PONTOS_ESCALA:
            return True
    return False


def _produzivel_pelo_react(cls):
    return (_cita(_tsx_strings, cls) or _da_camada_responsiva(cls)
            or any(cls.startswith(p) for p in _PREFIX_AJUDANTE)
            or any(cls.startswith(p) and f"`{p}$" in tsx for p in _PREFIX))


def _classes_do_react():
    """Classes LITERAIS que o pacote React escreve no DOM (cx("x") e className="x y")."""
    out = set()
    for m in re.finditer(r'cx\(\s*"([a-z0-9 -]+)"', tsx):
        out.update(m.group(1).split())
    for m in re.finditer(r'className="([a-z0-9 -]+)"', tsx):
        out.update(m.group(1).split())
    return {c for c in out if c}


def core_boundary():
    """As duas direções da fronteira.

    `catalogo`/`composto` — classe declarada no core que a biblioteca NÃO produz (check 15).
    `semRegra` — o inverso: classe que o React EMITE e o core não estiliza (check 18). Achado da
    Fase 7: `.command-overlay`/`.command-palette` não existem em CSS nenhum, então o
    CommandPaletteShell sai sem pele; e `.grid` só parece pronta porque o chrome do catálogo a
    redefine — o componente funciona na nossa documentação e não no consumidor.
    """
    sem_comentario = re.sub(r"/\*.*?\*/", "", core_src, flags=re.S)
    declaradas = set(re.findall(r"\.([a-z][a-z0-9-]*)", sem_comentario))
    fora = [c for c in sorted(declaradas) if not _produzivel_pelo_react(c)]
    catalogo = [c for c in fora if _cita(_gen_src, c) or _cita(_content_src, c)]
    return {"catalogo": catalogo, "composto": [c for c in fora if c not in catalogo],
            "semRegra": sorted(_classes_do_react() - declaradas)}


_fronteira = core_boundary()
if "--write-core-boundary" in sys.argv:
    doc = json.loads(BOUNDARY_PATH.read_text(encoding="utf-8")) if BOUNDARY_PATH.is_file() else {}
    doc.update(_fronteira)
    BOUNDARY_PATH.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    print("core-boundary: allowlist regravada —",
          len(_fronteira["catalogo"]), "do catálogo +", len(_fronteira["composto"]), "de seletor composto")
    sys.exit(0)
if not BOUNDARY_PATH.is_file():
    errors.append("fronteira: falta scripts/core-boundary.json (a allowlist não tem referência)")
else:
    _base = json.loads(BOUNDARY_PATH.read_text(encoding="utf-8"))
    permitido = set(_base.get("catalogo", [])) | set(_base.get("composto", []))
    novas = sorted(set(_fronteira["catalogo"]) | set(_fronteira["composto"]) - permitido)
    novas = [c for c in novas if c not in permitido]
    if novas:
        errors.append(
            f"fronteira do core: {len(novas)} classe(s) sem componente React e fora da allowlist: "
            f"{', '.join(novas[:8])}. O core é o que todo consumidor baixa — chrome de "
            f"documentação vai para apps/docs/docs.css, mockup vai para examples/, e o que for "
            f"sistema ganha componente com ficha.")
    saiu = sorted(permitido - (set(_fronteira["catalogo"]) | set(_fronteira["composto"])))
    if saiu:
        errors.append(f"fronteira do core: {len(saiu)} classe(s) saíram ({', '.join(saiu[:8])}) — "
                      f"ótimo, mas rode 'python scripts/validate.py --write-core-boundary' "
                      f"para travar o ganho.")
    # ── 18. o outro lado: classe que o React emite e o core não estiliza ──
    _sr_base = set(_base.get("semRegra", []))
    _sr_novas = sorted(set(_fronteira["semRegra"]) - _sr_base)
    if _sr_novas:
        errors.append(
            f"pele faltando: {len(_sr_novas)} classe(s) que o React emite não têm regra no core: "
            f"{', '.join(_sr_novas[:8])}. Componente público sem pele renderiza sem identidade — "
            f"escreva a regra (com token) ou justifique na allowlist.")
    _sr_saiu = sorted(_sr_base - set(_fronteira["semRegra"]))
    if _sr_saiu:
        errors.append(f"pele faltando: {len(_sr_saiu)} classe(s) ganharam regra "
                      f"({', '.join(_sr_saiu[:8])}) — ótimo, mas rode "
                      f"'python scripts/validate.py --write-core-boundary' para travar o ganho.")

# ── 17. modelo de página: todo item tem de onde tirar preview e código ─────
# ADR-0001 (30/07/2026) decidiu preview + código como NÚCLEO do modelo, em todo tipo de item.
# Antes dela, 28 páginas de componente não tinham preview nenhum e as 23 receitas não tinham
# preview nem código — o achado I2. O gerador morre se faltar; este check não depende de rodar
# o gerador, e cobra a outra metade: fonte ÚNICA por componente (ter arquivo próprio E starter
# foi como 9 entradas mortas sobreviveram meses dentro do gerador).
CONTENT_DIR = root / "apps/catalog/content"


def _chaves_mjs(path):
    """Chaves de primeiro nível do objeto exportado (2 espaços de recuo, `Nome: {`)."""
    if not path.is_file():
        return None
    return set(re.findall(r"^  ([A-Za-z][A-Za-z0-9_]*): \{", path.read_text(encoding="utf-8"), re.M))


_proprios = {p.stem for p in CONTENT_DIR.glob("*.mjs") if not p.name.startswith("_")}
_starters = _chaves_mjs(CONTENT_DIR / "_starters.mjs")
_recipes = _chaves_mjs(CONTENT_DIR / "_recipes.mjs")
if _starters is None or _recipes is None:
    errors.append("modelo de página: falta apps/catalog/content/_starters.mjs ou _recipes.mjs")
else:
    _sem_fonte = sorted(fichas - _proprios - _starters)
    if _sem_fonte:
        errors.append(f"modelo de página: {len(_sem_fonte)} componente(s) sem preview nem starter: "
                      f"{', '.join(_sem_fonte)}. Preview e código são núcleo (ADR-0001) — escreva "
                      f"a entrada em content/_starters.mjs.")
    _duas_fontes = sorted(_proprios & _starters)
    if _duas_fontes:
        errors.append(f"modelo de página: {len(_duas_fontes)} componente(s) com arquivo de conteúdo "
                      f"E starter: {', '.join(_duas_fontes)}. Uma fonte por componente — remova o starter.")
    _starter_fantasma = sorted(_starters - fichas)
    if _starter_fantasma:
        errors.append(f"modelo de página: starter sem ficha: {', '.join(_starter_fantasma)}")
    if contract:
        _sem_preview = sorted(set(contract["applicationPatterns"]["archetypes"]) - _recipes)
        if _sem_preview:
            errors.append(f"modelo de página: {len(_sem_preview)} receita(s) sem preview em "
                          f"content/_recipes.mjs: {', '.join(_sem_preview)}")

# ── 19. dependência pesada só mora no módulo dela ──────────────────────────
# Fase 9 (achado A5): CodeMirror, @tanstack/react-table e `qr` viraram peer OPCIONAIS, e cada um
# serve UM componente. A fronteira só vale enquanto ninguém importa esses pacotes de um módulo
# leve: bastaria um `import {basicSetup} from "codemirror"` em `inputs.tsx` para quem instala a
# biblioteca só pelo Button voltar a precisar do CodeMirror — e o erro apareceria no consumidor,
# em runtime, com "Cannot find module". Aqui aparece no build.
PESADAS = {"codemirror": "code-editor", "@codemirror/": "code-editor", "@lezer/": "code-editor",
           "@tanstack/react-table": "data-grid", "qr": "qrcode", "recharts": "chart",
           "react-day-picker": "calendar", "@xyflow/react": "graph"}
for fp in sorted((root / "packages/react/src").glob("*.tsx")):
    fonte = fp.read_text(encoding="utf-8")
    for imp in re.findall(r'^import[^"\']*["\']([^"\']+)["\']', fonte, re.M):
        for pacote, dono in PESADAS.items():
            if imp == pacote or (pacote.endswith("/") and imp.startswith(pacote)):
                if fp.stem != dono:
                    errors.append(
                        f"dependência pesada fora de casa: {fp.name} importa '{imp}', que é peer "
                        f"OPCIONAL e só pode ser importado por {dono}.tsx. Quem instala a "
                        f"biblioteca sem esse pacote quebraria ao importar {fp.stem}.")

# ══ LOTE 0 do BUILDING.md — as travas do procedimento de construção ═══════════════════════
# Existem porque a biblioteca foi publicada em 31/07/2026 e construir errado passou a custar
# versão. O `BUILDING.md` é o procedimento; estes quatro checks são a parte dele que uma pessoa
# não precisa lembrar. Escopo: `scripts/built-components.json`, a lista dos componentes
# construídos SOB aquele procedimento. Ela só cresce, e entrar nela é aceitar as quatro.
BUILT_PATH = root / "scripts/built-components.json"
_built_doc = json.loads(BUILT_PATH.read_text(encoding="utf-8")) if BUILT_PATH.is_file() else {}
CONSTRUIDOS = _built_doc.get("componentes", [])
if not BUILT_PATH.is_file():
    errors.append("BUILDING.md: falta scripts/built-components.json — a lista dos componentes "
                  "construídos sob o procedimento não tem referência")

# ── 21. componente novo tem referência externa registrada ──────────────────
# `QUALITY.md` #2 existe desde a Fase 10 e era cobrado "por pessoa" — ou seja, por lembrança.
# A causa raiz de retrabalho medida duas vezes em auditoria é sempre a mesma: componente montado
# de memória. Aqui o registro deixa de ser intenção.
_refs_txt = (root / "docs/REFERENCES.md").read_text(encoding="utf-8")
_sem_ref = [c for c in CONSTRUIDOS if not _cita(_refs_txt, c)]
if _sem_ref:
    errors.append(
        f"referência não registrada: {len(_sem_ref)} componente(s) construído(s) sob o "
        f"BUILDING.md não aparecem no REFERENCES.md: {', '.join(_sem_ref)}. Componente sem "
        f"referência registrada foi construído de memória — é o defeito que o procedimento "
        f"existe para impedir.")

# ── 22. componente novo tem ficha COMPLETA ─────────────────────────────────
# Para os 65 antigos, `props` era opcional e 43 não tinham (achado M8, FECHADO na Parte E do
# PLANO-1.0 em 07/08/2026 — são 76 de 76 agora). Publicar API que a ficha não declara é o que
# produziu o M8.
#
# A REGRA MUDOU no item E12 (07/08/2026), e a razão é a mesma que o `Spinner` já tinha ensinado
# uma vez: **vazio por esquecimento é defeito; vazio porque não existe é a verdade.** A versão
# antiga exigia `states` não-vazio e `a11y.role` não-nulo de todo mundo. Medido antes de mexer:
# o `Stack` é uma `<div>` que empilha e não tem estado nenhum; o `Card` é uma `<div>` e não tem
# papel — e o catálogo JÁ desenha `role: null` como "native semantics", ou seja é valor
# declarado, não lacuna. Obrigar os dois campos faria a ficha inventar contrato, que é a decisão
# do C3 ao contrário: "descrição de enchimento é pior que ausência, porque parece contrato".
#
# Cada campo passou a cobrar a VERDADE, e a verdade é MEDIDA onde dá para medir:
#   • props        — sempre não-vazio. Todo componente recebe alguma coisa, nem que seja className.
#   • states       — vazio só se o componente não EMITE sinal de estado (medido no fonte dele).
#   • tokens       — sempre não-vazio. Ver a nota abaixo: aqui NÃO houve exceção, houve correção.
#   • a11y.role    — nulo só se `a11y.apg` disser por quê (prosa; não há como medir semântica).
#   • a11y.keyboard— vazio só se `a11y.apg` disser por quê. Regra que já existia, do `Spinner`.
#
# `tokens` QUASE ganhou uma exceção, e não ganhar foi o ponto. O `ToolbarGroup` era o único com
# `tokens: []`, e a saída fácil era medir e aceitar o vazio. Mas a medição que eu escrevi para
# isso não funcionava — o slice pega o corpo da função, e a pele do `CodeEditor` mora num
# `export const` separado, então a sub-regra passaria em TODOS e nunca dispararia. Trava que
# nunca dispara é pior que trava nenhuma, porque parece cobertura.
# A causa real do vazio era outra: a pele do `.toolbar-group` era `gap:4px`, pixel cru. `4px` é
# exatamente `--space-1` (0.25rem), então a correção é dar o token — e de quebra o espaçamento
# passa a acompanhar o tamanho de fonte da raiz, que é o que o achado M12 decidiu. O campo
# `tokens` segue obrigatório e sem exceção nenhuma.
#
# As duas medidas leem o fonte SEM COMENTÁRIO, e isso não é zelo: a primeira versão desta medição
# disse que o `Grid` emite `aria-expanded`, e o que havia era o comentário do `AppShell` logo
# abaixo explicando o popover nativo. É o mesmo defeito que o check 23 corrigiu em 06/08 e o
# check 12 em 02/08 — o gate lendo prosa como se fosse código. Terceira vez; por isso mora aqui
# com nome próprio.
#
# LIMITE DECLARADO: a medição de `states` lê o NOSSO fonte, então não vê estado que o MOTOR
# emite. O `Tooltip` passou anos com `states: []` enquanto os outros oito overlays declaravam
# `["open","closed"]`, e quem achou foi a comparação entre fichas, não este gate. Overlay novo
# ainda depende de olho.
_SEM_COMENTARIO_TSX = {}
for _fp in sorted((root / "packages/react/src").glob("*.tsx")):
    _SEM_COMENTARIO_TSX[_fp.name] = re.sub(r"^[ \t]*//[^\n]*$", "",
                                           _fp.read_text(encoding="utf-8"), flags=re.M)

SINAL_DE_ESTADO = re.compile(
    r"aria-(current|expanded|selected|pressed|sort|busy|checked|disabled)"
    r"|data-(selected|read|state|today|open|active)"
    r"|\bdisabled\b"
    r"|[\"`][a-z-]*-(active|done|error|selected|collapsed|current)")


def _corpo_do_componente(nome):
    """O fonte do componente, do `export` dele até o próximo `export` de topo, sem comentário.

    A fatia vai até o próximo EXPORT de propósito, e não até a próxima declaração de topo. Em
    09/08/2026 (item K1) eu tentei encurtá-la — parecia estritamente mais correto, já que
    declaração em coluna zero depois do componente "não é dele". **A prova contra o defeito
    reprovou a ideia:** com a fatia curta, `Sidebar` com `states: []` deixou de ser acusada,
    porque o `aria-current` dela mora num auxiliar NÃO exportado logo abaixo. Componente cuja
    implementação continua num helper é comum aqui, e a fatia longa é o que a alcança.

    O preço da fatia longa é conhecido e mordeu o `Grid` duas vezes: ela engole o que estiver
    escrito entre um export e o seguinte. Na primeira vez (E12) foi um COMENTÁRIO, e a correção
    foi ler o fonte sem comentário — é o que `_SEM_COMENTARIO_TSX` faz. Na segunda (K1) foi um
    auxiliar não exportado cujo seletor tinha `button:not([disabled])`, e o `\\bdisabled\\b`
    acusou o `Grid` de emitir estado. A correção foi mover o auxiliar para ANTES do primeiro
    export do arquivo, que é onde ele não pertence à fatia de ninguém — ver `layout.tsx`.

    Ou seja: quem escreve auxiliar de topo em módulo de componente põe ANTES dos exports. Está
    escrito lá também, ao lado do único caso.
    """
    for texto in _SEM_COMENTARIO_TSX.values():
        m = re.search(r"^export\s+(?:function|const)\s+" + re.escape(nome) + r"\b", texto, re.M)
        if not m:
            continue
        resto = texto[m.start() + 10:]
        prox = re.search(r"^export\s", resto, re.M)
        return resto[:prox.start()] if prox else resto
    return ""


for c in CONSTRUIDOS:
    fp = root / f"packages/contracts/registry/{c}.json"
    if not fp.is_file():
        errors.append(f"ficha ausente: {c} está em built-components.json e não tem ficha")
        continue
    f = json.loads(fp.read_text(encoding="utf-8"))
    vazios = []
    if not f.get("props"):
        vazios.append("props")
    if not f.get("states") and SINAL_DE_ESTADO.search(_corpo_do_componente(c)):
        vazios.append("states (o componente EMITE sinal de estado — aria-*, data-* ou classe)")
    if not f.get("tokens"):
        vazios.append("tokens")
    a11y = f.get("a11y") or {}
    # Papel NULO é legítimo — um Card é uma `<div>` e o catálogo desenha isso como "native
    # semantics". O que não é legítimo é nulo sem ninguém ter pensado. Mesmo idioma do teclado.
    if not a11y.get("role") and not a11y.get("apg"):
        vazios.append("a11y.role (ou a11y.apg explicando que a semântica é nativa)")
    # Teclado VAZIO é legítimo — um Spinner não tem interação. O que não é legítimo é vazio por
    # esquecimento. Então a lista pode ser vazia SE a ausência estiver declarada com a prática
    # adotada no campo `apg`, que é o idioma do critério 3 do QUALITY.md. Só reprova quem
    # deixou as duas em branco, que é exatamente "não pensei no teclado".
    # Descoberto ao construir o Lote 1: a trava nasceu exigindo teclado sempre e reprovou o
    # Spinner com razão nenhuma.
    if not a11y.get("keyboard") and not a11y.get("apg"):
        vazios.append("a11y.keyboard (ou a11y.apg explicando por que não há)")
    if vazios:
        errors.append(
            f"ficha incompleta: {c} foi construído sob o BUILDING.md e não declara "
            f"{', '.join(vazios)}. Componente novo publica contrato completo — o achado M8 foram "
            f"os 43 que não publicaram.")

# ── 30. estado universal DECLARADO é estado universal ACEITO ───────────────────
# PLANO-1.0 Parte J, item J3. Sem isto os sete nomes viram prosa: uma ficha diz "stale" e o
# componente não tem por onde recebê-lo, ou pior — recebe com significado próprio, que é o
# "cada aplicação inventa o seu" que a parte inteira existe para impedir.
#
# A LISTA NÃO É COPIADA. Ela é lida do `pure.tsx`, que é onde a união mora. Escrever os sete
# nomes aqui seria o achado I1 outra vez, e desta vez dentro do gate que cobra honestidade:
# bastaria alguém acrescentar o oitavo estado no TypeScript para esta trava passar a aprovar
# uma ficha incompleta, calada.
#
# E ela vale nos DOIS SENTIDOS, que é o que o E12 ensinou a diferença entre trava e
# concordância com o presente:
#   • ficha declara e o DOM não marca  → reprova (contrato que promete o que não se vê);
#   • fonte aceita a união e a ficha não declara os SETE → reprova (é o M8 em miniatura: a API
#     aceita sete e a ficha publica menos, então o consumidor não tem onde ler os que faltam).
#
# A PRIMEIRA REGRA NASCEU FORTE DEMAIS E O GATE ME DESMENTIU NA PRIMEIRA EXECUÇÃO. Ela exigia
# que quem declarasse um estado universal aceitasse `UniversalState`, e reprovou o
# `HealthMatrix` — que declara `degraded` entre os CINCO valores de saúde dele (operational,
# degraded, down, maintenance, unknown). Perguntado *quem mais tem esse problema*: medido nas 92
# fichas, ele é o ÚNICO. E ele estava certo. Há duas relações diferentes com um estado universal:
#   • CARREGAR o estado (o componente inteiro está nele) — Status, Alert, Banner, EmptyState,
#     DataGrid. Esses recebem a união pela prop `state`.
#   • ENUMERAR a palavra entre valores de domínio — o `degraded` da saúde é o mesmo `degraded`
#     do contrato, mesma palavra e mesmo sentido, que é exatamente a convergência que a Parte J
#     quer. Obrigá-lo à união faria uma célula de saúde poder estar "esperando aprovação".
# O que os dois casos DEVEM ter em comum é o marcador compartilhado no DOM, e é isso que se
# cobra. Corrigir o componente para caber na trava teria sido a trava mandando no sistema.
#
# POR QUE O MARCADOR E A UNIÃO, e nunca o nome do estado: os nomes não aparecem literais no
# fonte — quem escreve `data-state={state}` escreve a VARIÁVEL. Procurar `"stale"` ali é o ponto
# cego de template que este repositório já pagou quatro vezes (`log-${level}` no E13,
# `badge-${variant}` no check 15, o extrator de classe do D1, a prévia do `Chart` no Lote 3).
_us_src = (root / "packages/react/src/pure.tsx").read_text(encoding="utf-8")
_m_us = re.search(r"export const universalStates[^=]*=\s*\[([^\]]*)\]", _us_src)
UNIVERSAIS = set(re.findall(r'"([a-z_]+)"', _m_us.group(1))) if _m_us else set()
if not UNIVERSAIS:
    errors.append(
        "check 30: não achei `universalStates` em packages/react/src/pure.tsx. Esta trava lê a "
        "lista de lá de propósito — sem ela o gate não tem contra o que comparar e passaria a "
        "aprovar qualquer ficha em silêncio, que é pior que não existir.")

for c in CONSTRUIDOS:
    fp = root / f"packages/contracts/registry/{c}.json"
    if not fp.is_file():
        continue
    declarados = UNIVERSAIS & set(json.loads(fp.read_text(encoding="utf-8")).get("states") or [])
    corpo = _corpo_do_componente(c)
    aceita = "UniversalState" in corpo
    if declarados and "data-state" not in corpo:
        errors.append(
            f"estado universal que não chega ao DOM: a ficha de {c} declara "
            f"{', '.join(sorted(declarados))} e o componente não escreve `data-state`. O "
            f"marcador é o que torna o estado alcançável por CSS, por teste e por quem inspeciona "
            f"a página — sem ele a ficha promete uma condição que não se vê.")
    if aceita and declarados != UNIVERSAIS:
        errors.append(
            f"contrato incompleto: {c} aceita `UniversalState` — ou seja, aceita os "
            f"{len(UNIVERSAIS)} — e a ficha declara {len(declarados)}. Falta "
            f"{', '.join(sorted(UNIVERSAIS - declarados))} em `states`. É o M8 em miniatura: "
            f"o que não está na ficha não está prometido.")

# ── 23. prop de DIMENSÃO não é número ──────────────────────────────────────
# Medido no `Avatar` em 31/07/2026: `size?:number` com default 40 virava `style` inline, matava
# os 36px que o CSS declarava e obrigava o consumidor a escrever pixel cru. Dimensão é escala de
# token (`sm`/`md`/`lg`), não número. A allowlist é dívida conhecida e SÓ ENCOLHE — o idioma do
# raw-px-baseline e do core-boundary.
# `maxSize` (bytes) e `pageSize` (linhas) não são dimensão: a fronteira de palavra os exclui.
# COMENTÁRIO NÃO É ASSINATURA, e a lição é emprestada do check 12 — que já tinha exatamente este
# defeito e o corrigiu em 02/08/2026, do lado do CSS. Aqui ele cobrou em 06/08/2026: o comentário
# que EXPLICA por que `Avatar.size` deixou de ser número precisa citar a forma antiga, e o gate
# reprovou a prosa que documenta a correção que ele mesmo pediu. Pergunta obrigatória do
# QUALITY.md #27 — "quem mais tem esse problema?" —, e a resposta era: o outro gate que lê fonte
# procurando por forma, ou seja este. `_sem_comentario` serve os dois porque `//` e `/* */` são
# os mesmos em CSS e em TSX.
DIMENSAO = r"(?<![A-Za-z])(size|width|height|radius|thickness|inset|offset)\??\s*:\s*number"
_dim_permitido = set(_built_doc.get("dimensaoNumerica", []))
_dim_achado = set()
for fp in sorted((root / "packages/react/src").glob("*.tsx")):
    for m in re.finditer(DIMENSAO, _sem_comentario(fp.read_text(encoding="utf-8"))):
        _dim_achado.add(f"{fp.stem}:{m.group(1)}")
_dim_novas = sorted(_dim_achado - _dim_permitido)
if _dim_novas:
    errors.append(
        f"dimensão como número: {len(_dim_novas)} prop(s) — {', '.join(_dim_novas)}. Dimensão "
        f"vem da escala de token, senão o consumidor escreve pixel cru e a densidade não alcança "
        f"o componente. Se for dívida herdada, entra em built-components.json; a lista só cai.")
_dim_saiu = sorted(_dim_permitido - _dim_achado)
if _dim_saiu:
    errors.append(f"dimensão como número: {len(_dim_saiu)} prop(s) saíram ({', '.join(_dim_saiu)}) "
                  f"— ótimo, mas tire de built-components.json para travar o ganho.")

# ── 24. componente novo tem a pele cobrada por EFEITO ──────────────────────
# O check 18 olha NOME: uma regra vazia `.x{}` passa nele. Medido na Fase 11. Quem cobra o efeito
# é o skin.spec, e componente novo tem de entrar lá — senão a pele dele volta a ser intenção.
_skin_path = root / "tests/visual/skin.spec.ts"
_skin_txt = _skin_path.read_text(encoding="utf-8") if _skin_path.is_file() else ""
_sem_skin = [c for c in CONSTRUIDOS if not _cita(_skin_txt, c)]
if _sem_skin:
    errors.append(
        f"pele não medida: {len(_sem_skin)} componente(s) construído(s) sob o BUILDING.md não "
        f"aparecem em tests/visual/skin.spec.ts: {', '.join(_sem_skin)}. O check 18 aprova regra "
        f"vazia; quem prova que a pele faz alguma coisa é aquele teste.")

# ── 25. preview gerado não lê o RELÓGIO ────────────────────────────────────
# Lote 4 (01/08/2026). O catálogo é HTML gerado e COMMITADO, e a CI compara `dist == build`.
# Preview que lê a data do sistema produz um arquivo diferente a cada dia: passa hoje, reprova
# amanhã, e o diff não diz nada a ninguém. Aconteceu com o Calendar — o mês estava congelado, o
# `today` não, e `data-today` caiu numa célula diferente no runner (lá já era dia 2, aqui ainda
# era 1). Quem pegou foi a CI, um commit tarde demais.
# Alcance declarado: `new Date()` sem argumento, `Date.now()` e `$D.now()` dentro do conteúdo do
# catálogo. Data com argumento é literal e é justamente o que se quer. Se um dia o preview
# precisar mesmo do relógio, o certo é receber a data por parâmetro do gerador, não lê-la.
RELOGIO = re.compile(r"new\s+Date\s*\(\s*\)|\bDate\.now\s*\(")
for fp in sorted((root / "apps/catalog/content").rglob("*.mjs")):
    fonte = re.sub(r"^[ \t]*//[^\n]*$", "", fp.read_text(encoding="utf-8"), flags=re.M)
    if RELOGIO.search(fonte):
        errors.append(
            f"preview lê o relógio: {fp.relative_to(root)} usa a data do sistema. O catálogo é "
            f"gerado e commitado, então o arquivo mudaria sozinho todo dia e a CI reprovaria em "
            f"`dist == build`. Use uma data literal.")

# ── 26. fronteira servidor/cliente: a diretiva não some, e não sobra ───────
# Parte A do PLANO-1.0 (06/08/2026). O defeito medido em 02/08: o pacote não tinha NENHUMA
# diretiva `"use client"`, o `internal.tsx` chamava `createContext` e o barril o reexportava.
# Contexto é API só de cliente, então `import {Button} from "@aurea-uds/react"` dentro de um
# componente de servidor quebrava na hora — e quebrava no consumidor, não aqui. Nenhum gate via.
#
# NAS DUAS DIREÇÕES, como o check 14, e cada direção pega um defeito diferente:
#   • falta a diretiva  → o consumidor com componentes de servidor não consegue importar;
#   • sobra a diretiva  → módulo de marcação pura vira cliente e empurra JavaScript para o
#     consumidor sem motivo. No `index.tsx` seria pior: a diretiva ali torna CLIENTE tudo que o
#     barril reexporta, e o ganho da parte inteira sumiria em silêncio, com a CI verde.
#
# O QUE CONTA COMO API DE CLIENTE, e por quê essa lista e não outra:
#   1. chamada de hook (`useX(`) — inclui os nossos, `useAureaStrings` e `useSpriteUrl`;
#   2. `createContext`;
#   3. manipulador de evento em JSX (`onClick={`);
#   4. importação de motor de terceiro que usa estado e NÃO publica a diretiva por conta
#      própria. Este quarto item não estava no enunciado da A2 e entrou porque a medição o
#      exigiu: o `calendar.tsx` não chama hook NENHUM e mesmo assim precisa da diretiva, porque
#      o `react-day-picker` não a publica. Medido em 06/08/2026 com
#      `grep -rl '"use client"' node_modules/<pacote>`: react-day-picker, recharts e
#      @tanstack/react-table não publicam; @base-ui/react publica (e por isso não está na lista).
#      Sem este item a regra literal aprovaria um calendar.tsx sem diretiva — o buraco exato que
#      a pergunta "quem mais tem esse problema?" existe para achar.
MOTOR_SEM_DIRETIVA = {"react-day-picker", "recharts", "@tanstack/react-table"}
HOOK_RE = re.compile(r"(?<![A-Za-z0-9_$])use[A-Z][A-Za-z0-9]*\s*[(<]")
CTX_RE = re.compile(r"(?<![A-Za-z0-9_$])createContext\s*[(<]")
EVT_RE = re.compile(r"(?<![A-Za-z0-9_$])on[A-Z][A-Za-z0-9]*\s*=\s*\{")
DIRETIVA_RE = re.compile(r'^\s*["\']use client["\']\s*;?\s*$')
MARKUP_IMP_RE = re.compile(r'import\s*\{([^}]*)\}\s*from\s*"\./markup\.js"', re.S)
MARKUP_EXP_RE = re.compile(r'export\s*\{([^}]*)\}\s*from\s*"\./markup\.js"', re.S)
EXPORT_SOLTO_RE = re.compile(r"export\s*\{([^}]*)\}\s*;")


def _valores(clausula):
    """Nomes de VALOR de uma cláusula `{...}` — `type X` é apagado na compilação e não contamina."""
    nomes = (n.strip() for n in clausula.split(","))
    return {n.split(" as ")[0].strip() for n in nomes if n and not n.startswith("type ")}


for fp in sorted((root / "packages/react/src").glob("*.tsx")):
    bruto = fp.read_text(encoding="utf-8")
    fonte = _sem_comentario(bruto)
    motores = sorted({imp for imp in re.findall(r'^import[^"\']*["\']([^"\']+)["\']', fonte, re.M)
                      if imp in MOTOR_SEM_DIRETIVA})
    porques = []
    if HOOK_RE.search(fonte):
        porques.append("chama hook")
    if CTX_RE.search(fonte):
        porques.append("chama createContext")
    if EVT_RE.search(fonte):
        porques.append("tem manipulador de evento em JSX")
    if motores:
        porques.append(f"importa {', '.join(motores)} (motor de cliente que não publica a diretiva)")
    # A diretiva tem de ser a PRIMEIRA linha, e não só existir no arquivo: ela é prólogo, e
    # empacotador nenhum a reconhece depois de um `import`. É a posição que Base UI e shadcn/ui
    # usam — a A1 mandou copiar a posição, não o código.
    tem = bool(DIRETIVA_RE.match(bruto.split("\n", 1)[0]))
    if porques and not tem:
        errors.append(
            f"fronteira servidor/cliente: {fp.name} {' e '.join(porques)} e não declara "
            f'"use client" na primeira linha. Um componente de servidor que importar este '
            f"módulo quebra no consumidor (PLANO-1.0 Parte A).")
    if tem and not porques:
        errors.append(
            f'fronteira servidor/cliente: {fp.name} declara "use client" e não usa nenhuma API '
            f"de cliente. Marcação pura vira cliente e empurra JavaScript para o consumidor "
            f"sem motivo — tire a diretiva (PLANO-1.0 Parte A).")
    # ── 26b. a diretiva não CONTAMINA o que é puro ─────────────────────────
    # O limite declarado da ADR-0026, fechado em 16/08/2026. Faltava a terceira direção: um
    # módulo pode ter a diretiva com razão E, na linha seguinte, reexportar `Card` do
    # `markup.js`. Aí o barril entrega `Card` como servidor e `@aurea-uds/react/layout` entrega
    # o MESMO componente como cliente — o consumidor que importa pela categoria paga os 118,5 KB
    # que o item O1 tirou, e nada acusa. O check 35 só olhava o barril.
    #
    # A forma que passa: o módulo da categoria é uma VITRINE sem diretiva, que reexporta o puro
    # do `markup.js` e o resto do irmão `<categoria>-client.tsx`, que fica com a diretiva.
    #
    # `type` não conta: é apagado na compilação e não vira referência de cliente.
    if tem:
        _do_markup = set()
        for _cl in MARKUP_IMP_RE.findall(fonte):
            _do_markup |= _valores(_cl)
        _reexp = {n for _cl in MARKUP_EXP_RE.findall(fonte) for n in _valores(_cl)}
        _reexp |= {n for _cl in EXPORT_SOLTO_RE.findall(fonte) for n in _valores(_cl) & _do_markup}
        if _reexp:
            errors.append(
                f'fronteira servidor/cliente: {fp.name} declara "use client" e reexporta '
                f"{', '.join(sorted(_reexp))} do markup.js — pelo subpath da categoria esses "
                f"componentes chegam como CLIENTE, enquanto pelo barril chegam como servidor. "
                f"Deixe {fp.stem}.tsx como vitrine sem diretiva e mova o código de cliente para "
                f"{fp.stem}-client.tsx (ADR-0026).")

# ── 27. token SEMÂNTICO tem `$description` ─────────────────────────────────
# Achado M15, fechado na Parte C do PLANO-1.0 (07/08/2026). Estava PARCIAL desde a Fase 6: 20
# de 175 nomes descritos. O DTCG existe justamente para carregar significado junto do valor —
# sem descrição ninguém sabe quando usar `--surface-2` em vez de `--surface-3`, e a escolha
# volta a ser gosto. É o primeiro arquivo que um consumidor lê.
#
# ALCANCE: os nomes de `theme` e `density`, que são a camada SEMÂNTICA — a que se escolhe.
# O `base` fica de fora de propósito e não por preguiça: ele são primitivos (`space-4`,
# `text-lg`, `danger-500`), onde o nome já é a descrição e uma frase obrigatória viraria
# enchimento. Descrição de enchimento é pior que ausência, porque parece contrato.
#
# COBRA POR NOME, NÃO POR DECLARAÇÃO, e isso é a parte que importa: `primary` existe no dark e
# no light, `control-h-md` nas três densidades. Exigir a frase em cada declaração seria a MESMA
# prosa em 2 ou 3 lugares, que é o achado I1 esperando para acontecer — dois textos que
# divergem no dia em que alguém edita um. A descrição mora numa declaração só (o `dark`, e o
# `base` para os seis nomes que só o light declara).
TOK_PATH = root / "packages/tokens/src/aurea.tokens.json"
_tok = json.loads(TOK_PATH.read_text(encoding="utf-8"))


def _descritos(doc):
    """Nome do token → tem descrição em ALGUMA declaração."""
    achou = {}
    def anda(no):
        if not isinstance(no, dict):
            return
        for chave, valor in no.items():
            if chave.startswith("$") or not isinstance(valor, dict):
                continue
            if "$value" in valor:
                achou[chave] = achou.get(chave, False) or bool(valor.get("$description"))
            else:
                anda(valor)
    anda(doc)
    return achou


_desc = _descritos(_tok)
_semanticos = set()
for _g in ("theme", "density"):
    for _sub in (_tok.get(_g) or {}).values():
        if isinstance(_sub, dict):
            _semanticos |= {k for k, v in _sub.items()
                            if not k.startswith("$") and isinstance(v, dict) and "$value" in v}
_sem_desc = sorted(n for n in _semanticos if not _desc.get(n))
if _sem_desc:
    errors.append(
        f"token semântico sem descrição: {len(_sem_desc)} de {len(_semanticos)} — "
        f"{', '.join(_sem_desc[:8])}{' …' if len(_sem_desc) > 8 else ''}. O DTCG carrega o "
        f"significado junto do valor; sem ele o consumidor escolhe por gosto (achado M15). "
        f"Basta descrever UMA vez por nome — em theme.dark, ou em base quando o nome nascer lá.")

# ── 28. `source.react` aponta para onde o código REALMENTE está ────────────
# Parte E do PLANO-1.0 (07/08/2026), e não estava no enunciado: quem foi medir a cobertura de
# `props` achou que 58 das 76 fichas mandavam o consumidor para `packages/react/src/index.tsx`.
# Desde a Fase 9 aquilo é o BARRIL — 38 linhas de reexport. O campo que existe para dizer onde
# se lê a implementação apontava, em 76% das fichas, para um arquivo que não a contém.
#
# É o mesmo defeito do M8 um campo ao lado: a ficha é o contrato publicado, e contrato que
# mente sobre onde está o código gasta o tempo de quem instalou. Ninguém viu porque o check 11
# valida o NOME do componente e nunca abriu o caminho declarado.
#
# Cobra as duas metades, senão não pega o defeito que existia: o arquivo tem de existir E
# declarar o componente. Só checar existência aprovaria `index.tsx` de novo — ele existe.
FONTE_RE = re.compile(r"^packages/react/src/([A-Za-z0-9.-]+\.tsx)#([A-Za-z][A-Za-z0-9]*)$")
# `[A-Z]` OU `use…`: o gate nasceu na linhagem da `main`, onde a ficha era sempre de COMPONENTE,
# e por isso só enxergava nome com inicial maiúscula. A outra linhagem publica HOOKS com ficha
# (`useTheme`, `useDensity`, `useValorResponsivo`), e hook começa em minúscula — então no merge
# de 28/08/2026 cada ficha de hook virou "o arquivo não declara isto", com o arquivo declarando.
# Era o gate que não via, não a ficha que mentia.
DECL_RE = re.compile(r"^export\s+(?:function|const|class)\s+((?:[A-Z]|use[A-Z])[A-Za-z0-9]*)", re.M)
_declara = {}
for _fp in sorted((root / "packages/react/src").glob("*.tsx")):
    _declara[_fp.name] = set(DECL_RE.findall(_fp.read_text(encoding="utf-8")))
for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
    f = json.loads(fp.read_text(encoding="utf-8"))
    alvo = (f.get("source") or {}).get("react") or ""
    m = FONTE_RE.match(alvo)
    if not m:
        errors.append(
            f"{f['name']}: source.react '{alvo}' não tem a forma "
            f"packages/react/src/<arquivo>.tsx#<Componente>")
        continue
    arq, simbolo = m.group(1), m.group(2)
    if arq not in _declara:
        errors.append(f"{f['name']}: source.react aponta para {arq}, que não existe")
    elif simbolo not in _declara[arq]:
        real = sorted(a for a, nomes in _declara.items() if simbolo in nomes)
        errors.append(
            f"{f['name']}: source.react aponta para {arq}, que não declara '{simbolo}'"
            + (f" — o código está em {', '.join(real)}" if real else ""))

# ── 35. o barril reexporta o `markup.tsx` EXPLICITAMENTE ───────────────────
# Item O1 do PLANO-1.0 (15/08/2026). Existe para pegar um defeito que não quebra NADA: não dá
# erro de compilação, não some do barril, não reprova teste nenhum. Ele só desfaz o item.
#
# O `markup.tsx` não tem `"use client"` — é dele que os 22 componentes de marcação pura saem
# como componentes de SERVIDOR. Cada módulo de categoria os reexporta, para que
# `@aurea-uds/react/layout` continue entregando `Card`, então o nome chega ao `index.tsx` por
# DOIS caminhos: a linha explícita `from "./markup.js"` e o `export *` da categoria.
#
# A linha explícita é a que vence. Tire um nome dela e o componente continua existindo — vindo
# do módulo COM a diretiva —, e volta a ser referência de cliente: os 118,5 KB que o item O1
# tirou do caminho voltam, em silêncio.
#
# PROVADO CONTRA O DEFEITO (QUALITY.md #29), em 15/08/2026: tirar `Card` da lista reprova aqui,
# e a MESMA remoção deixa `tsc` verde e `A.Card` definido no barril. A primeira versão deste
# comentário dizia que o nome viraria `undefined` por ambiguidade de `export *`; a prova
# mostrou que não — e a explicação foi corrigida para o que foi medido, não o contrário.
_markup = (root / "packages/react/src/markup.tsx")
if _markup.is_file():
    _mk_src = _markup.read_text(encoding="utf-8")
    _mk_exports = set(re.findall(r"^export\s+(?:function|const)\s+([A-Z][A-Za-z0-9]*)", _mk_src, re.M))
    _idx = (root / "packages/react/src/index.tsx").read_text(encoding="utf-8")
    _linha = re.search(r"export\s*\{([^}]*)\}\s*from\s*\"\./markup\.js\";", _idx, re.S)
    if not _linha:
        errors.append(
            "index.tsx não reexporta './markup.js' explicitamente — sem essa linha os 22 voltam "
            "a chegar pelos módulos de categoria, que têm a diretiva, e viram cliente de novo")
    else:
        _listados = set(re.findall(r"\b([A-Z][A-Za-z0-9]*)", _linha.group(1)))
        _faltando = sorted(_mk_exports - _listados)
        if _faltando:
            errors.append(
                "index.tsx: markup.tsx exporta " + ", ".join(_faltando) + " e o barril não os "
                "reexporta explicitamente — eles continuam existindo, mas voltam a vir do módulo "
                "de categoria (que tem \"use client\") e chegam ao consumidor como CLIENTE, "
                "desfazendo o item O1 sem reprovar nada. Acrescente à linha `from \"./markup.js\"`.")
    # A outra metade: o arquivo não pode ganhar a diretiva. Se ganhar, o item O1 desfaz-se
    # inteiro e ninguém percebe — o pacote continua compilando e os testes continuam passando.
    if re.match(r'^\s*"use client"', _mk_src):
        errors.append(
            "markup.tsx tem \"use client\" — o arquivo existe PARA NÃO TER. Componente que "
            "precisa do navegador mora no módulo da categoria dele, não aqui.")

# ── 36. o alvo NATIVO dos tokens não fica para trás ────────────────────────
# Etapa 2 do NATIVE.md (15/08/2026). O `aurea.tokens.native.js` é GERADO, e arquivo gerado que
# ninguém cobra é arquivo que envelhece — é o achado I1 com outra roupa.
#
# Não compara byte a byte com uma reimplementação em Python de propósito: duas implementações da
# mesma transformação seriam duas verdades, e a segunda erraria sozinha. O que se cobra são as
# PROPRIEDADES que a saída tem de ter, e a primeira delas pega o defeito que importa — token novo
# na fonte e ninguém regravou o alvo.
_nat = root / "packages/tokens/dist/aurea.tokens.native.js"
if not _nat.is_file():
    errors.append("packages/tokens/dist/aurea.tokens.native.js não existe — rode 'node scripts/build-tokens.mjs'")
else:
    _txt = _nat.read_text(encoding="utf-8")
    _blocos = {}
    for _m in re.finditer(r"^export const (\w+) = (\{[\s\S]*?\n\});$", _txt, re.M):
        try:
            _blocos[_m.group(1)] = json.loads(_m.group(2))
        except json.JSONDecodeError as e:
            errors.append(f"aurea.tokens.native.js: bloco '{_m.group(1)}' não é JSON válido ({e})")
    _fonte = json.loads((root / "packages/tokens/src/aurea.tokens.json").read_text(encoding="utf-8"))

    def _camel(s):
        return re.sub(r"-([a-z0-9])", lambda m: m.group(1).upper(), s)

    _emitidos = set()
    for _nome, _b in _blocos.items():
        if _nome in ("themes", "densities"):
            for _sub in _b.values():
                _emitidos |= set(_sub)
        else:
            _emitidos |= set(_b)
    _esperados = set()
    for _grupo in ("base",):
        _esperados |= {_camel(k) for k in _fonte[_grupo] if not k.startswith("$")}
    for _fam in ("theme", "density"):
        for _g in _fonte[_fam].values():
            _esperados |= {_camel(k) for k in _g if not k.startswith("$")}
    _faltando = sorted(_esperados - _emitidos)
    if _faltando:
        errors.append("aurea.tokens.native.js está VENCIDO — faltam " + ", ".join(_faltando[:8])
                      + (f" (+{len(_faltando) - 8})" if len(_faltando) > 8 else "")
                      + ". Rode 'node scripts/build-tokens.mjs'.")
    # Alias que sobreviveu significa que o build não resolveu — no CSS `var()` resolve em runtime,
    # aqui não existe runtime que resolva.
    if re.search(r'"\{[a-z0-9-]+\}"', _txt):
        errors.append("aurea.tokens.native.js: sobrou alias `{…}` sem resolver — no alvo nativo não "
                      "há cascata para resolvê-lo depois")
    # A ADR-0027 decidiu que hex sozinho não serve. Cor sem as duas formas é a decisão se perdendo.
    _sem = [k for _n, _b in _blocos.items() for _sub in ([_b] if _n not in ("themes", "densities") else _b.values())
            for k, v in _sub.items() if isinstance(v, dict) and "hex" in v and not v.get("p3")]
    if _sem:
        errors.append("aurea.tokens.native.js: cor(es) sem `p3` — " + ", ".join(sorted(_sem)[:6])
                      + ". A ADR-0027 exige as duas formas, porque hex sozinho degrada 20 cores.")
    if "export const REM_EM_DP = 16;" not in _txt:
        errors.append("aurea.tokens.native.js: REM_EM_DP não é 16 — o multiplicador foi MEDIDO no "
                      "navegador (raiz sem font-size = 16px); mudá-lo exige medir de novo")

# ── 14. variante e TAMANHO declarados no TypeScript == na ficha ────────────
# A auditoria de 26/07/2026 (achado M9) achou `oracle` no tipo `BadgeVariant` e no CSS, mas
# NÃO na ficha do Badge: superfície pública que o contrato não declarava. O check 11 já
# compara NOME de ficha com export do React; nunca comparou o CONTEÚDO da API.
#
# A versão de 26/07 lia o `.tsx` com expressão regular e declarava o próprio limite: "componente
# que usa o tipo de OUTRO sem alias próprio fica fora — medido em 26/07: nenhum caso hoje". Essa
# medição envelheceu. Em 21/08/2026, a Fase Zero da ATIVIDADE-2 mediu de novo e achou o buraco
# ocupado: `IconButton` e `ToolbarButton` herdam `ButtonVariant` por `Omit<ButtonProps,…>` e
# nunca foram conferidos. O `ToolbarButton` declarava uma variante `neutral` que **não existe**
# em `ButtonVariant`, e escondia as outras oito. O `Drawer` declarava `variants: left/right`
# numa prop que se chama `side`.
#
# Agora a fonte não é regex sobre o fonte: é `packages/contracts/api-surface.json`, gerado pelo
# `build-api-surface.mjs` a partir da EMISSÃO do tsc — que resolve herança, `Omit`, `Pick` e
# alias em cadeia porque quem resolveu foi o compilador. A CI já reprova o arquivo desatualizado
# pela trava de árvore suja depois do `pnpm build`, a mesma do `dist == build`.
#
# `variantProp`/`sizeProp` na ficha dizem QUAL prop carrega a escala, quando não é a de nome
# óbvio. É o caso do `Drawer` (`side`), e é informação que a ficha não tinha como dar antes.
API_SURFACE = root / "packages/contracts/api-surface.json"
if not API_SURFACE.is_file():
    errors.append("packages/contracts/api-surface.json não existe — rode 'pnpm build:api-surface'")
else:
    _surface = json.loads(API_SURFACE.read_text(encoding="utf-8"))
    _props_de = {c["name"]: {p["name"]: p for p in c["props"]}
                 for m in _surface["modules"].values() for c in m["components"]}
    for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
        try:
            f = json.loads(fp.read_text(encoding="utf-8"))
        except Exception:
            continue                       # JSON inválido já reprovou no check 11
        _pc = _props_de.get(f.get("name"))
        if _pc is None:
            continue                       # ficha sem componente já reprovou no check 11
        _nomeados = {}
        for campo, padrao, chave in (("variants", "variant", "variantProp"),
                                     ("sizes", "size", "sizeProp")):
            nome_prop = f.get(chave, padrao)
            _nomeados[nome_prop] = campo
            ts = sorted((_pc.get(nome_prop) or {}).get("values") or [])
            ficha = sorted(f.get(campo, []))
            if ficha == ts:
                continue
            so_ts = sorted(set(ts) - set(ficha))
            so_ficha = sorted(set(ficha) - set(ts))
            detalhe = []
            if so_ts:
                detalhe.append(f"só no TypeScript: {', '.join(so_ts)}")
            if so_ficha:
                detalhe.append(f"só na ficha: {', '.join(so_ficha)}")
            if not ts:
                detalhe.append(f"a prop '{nome_prop}' não existe ou não é união literal"
                               f" — se a escala mora em outra prop, declare '{chave}' na ficha")
            errors.append(f"{f['name']}: {campo} divergem entre o tipo e a ficha "
                          f"({'; '.join(detalhe)})")
        # ── e os OUTROS eixos, que até 21/08/2026 ninguém cobrava ──────────────
        # `variants`/`sizes` são dois eixos com nome próprio porque foram os dois primeiros, não
        # porque um componente só tem dois. O eixo `tone` do Button (G-API-01) ia entrar em
        # TypeScript sem lugar nenhum na ficha — o MESMO defeito que este check existe para
        # pegar, escapando por ser um eixo com outro nome. Então a pergunta "quem mais tem esse
        # problema?" foi feita antes de escrever a regra, e a resposta foi OITO: `side` de quatro
        # sobreposições, `direction` do provider, `kind` do MediaPlayer, `titleAs` do EmptyState.
        # Toda união literal de duas ou mais opções é um eixo, e eixo se declara: os dois com
        # nome próprio nos campos deles, o resto em `axes`.
        _axes = f.get("axes") or {}
        if not isinstance(_axes, dict):
            errors.append(f"{f['name']}: 'axes' deve ser objeto {{prop: [valores]}}")
            _axes = {}
        for nome_prop, p in sorted(_pc.items()):
            ts = sorted(p.get("values") or [])
            if len(ts) < 2 or nome_prop in _nomeados:
                continue
            if nome_prop not in _axes:
                errors.append(
                    f"{f['name']}: a prop '{nome_prop}' é união literal "
                    f"({' | '.join(ts)}) e a ficha não declara esse eixo — "
                    f"acrescente 'axes': {{\"{nome_prop}\": [...]}} (ou mova para "
                    f"variants/sizes com variantProp/sizeProp, se for A escala do componente)")
                continue
            if sorted(_axes[nome_prop]) != ts:
                so_ts = sorted(set(ts) - set(_axes[nome_prop]))
                so_ficha = sorted(set(_axes[nome_prop]) - set(ts))
                detalhe = ([f"só no TypeScript: {', '.join(so_ts)}"] if so_ts else []) + \
                          ([f"só na ficha: {', '.join(so_ficha)}"] if so_ficha else [])
                errors.append(f"{f['name']}: axes.{nome_prop} diverge do tipo "
                              f"({'; '.join(detalhe)})")
        for nome_prop in sorted(_axes):
            if nome_prop in _nomeados:
                errors.append(f"{f['name']}: axes.{nome_prop} duplica um eixo com campo "
                              f"próprio — use 'variants'/'sizes'")
            elif nome_prop not in _pc:
                errors.append(f"{f['name']}: axes.{nome_prop} não é prop do componente")
        # ── e o eixo RESPONSIVO: quais props, e COMO cada uma resolve ─────────
        # Fechado o `size` responsivo em 18 componentes (G-AXIS-04), as fichas seguiam dizendo
        # `"sizes": ["sm","md","lg"]` e mais nada — descrevendo uma capacidade a menos do que o
        # componente entrega, que é o defeito do `G-REG-01`.
        #
        # E desde o `G-AXIS-06` (22/08/2026) não basta dizer QUE a prop é responsiva: tem de dizer
        # COMO ela resolve. `visual` é a camada CSS; `behavioral` é resolução em runtime, porque o
        # valor precisa chegar ao motor, ao `aria-*` e ao teclado — e CSS não escreve atributo.
        _resp_ts = sorted(n for n, p in _pc.items()
                          if str(p.get("type") or "").startswith("Responsive<"))
        _resp_ficha = f.get("responsive")
        if _resp_ficha is None:
            _resp_ficha = {}
        elif not isinstance(_resp_ficha, dict):
            errors.append(f"{f['name']}: 'responsive' deve ser objeto {{prop: 'visual'|'behavioral'}}")
            _resp_ficha = {}
        for _p, _modo in sorted(_resp_ficha.items()):
            if _modo not in ("visual", "behavioral"):
                errors.append(f"{f['name']}: responsive.{_p}='{_modo}' inválido (visual/behavioral)")
        if sorted(_resp_ficha) != _resp_ts:
            so_ts = sorted(set(_resp_ts) - set(_resp_ficha))
            so_ficha = sorted(set(_resp_ficha) - set(_resp_ts))
            detalhe = ([f"aceita valor responsivo e a ficha não declara: {', '.join(so_ts)}"]
                       if so_ts else []) + \
                      ([f"a ficha declara e o tipo não aceita: {', '.join(so_ficha)}"]
                       if so_ficha else [])
            errors.append(f"{f['name']}: 'responsive' diverge do tipo ({'; '.join(detalhe)}) — "
                          f"é Responsive<T> no TypeScript que manda, não o que está escrito aqui")

# ── 12c. resolução responsiva: visual == CSS, behavioral == runtime ────────────────────────────
# O gate que transforma o achado do `G-AXIS-06` em regra, para o próximo eixo não repetir a
# discussão. Ele NÃO consulta lista de nomes: deriva a natureza do código.
#
# O sinal de que um eixo é comportamental é o componente entregar o valor a um MOTOR — se o
# `orientation` vai para um `<Base…>`, quem decide teclado e `aria-*` é o motor, e um valor
# responsivo que não chegue lá deixa a interface visualmente numa orientação e semanticamente
# noutra. O segundo sinal é a ARIA MEDIDA (`AUREA-ARIA.json`): componente que emite
# `aria-orientation` não pode ter orientação decidida só por CSS.
_ARQ_ARIA = root / "audit/activity-2/AUREA-ARIA.json"
if API_SURFACE.is_file() and _ARQ_ARIA.is_file():
    _aria_medida = json.loads(_ARQ_ARIA.read_text(encoding="utf-8")).get("componentes", {})
    _fontes_react = {fp.name: fp.read_text(encoding="utf-8")
                     for fp in (root / "packages/react/src").glob("*.tsx")}
    for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
        try:
            _f = json.loads(fp.read_text(encoding="utf-8"))
        except Exception:
            continue
        _modos = _f.get("responsive")
        if not isinstance(_modos, dict) or not _modos:
            continue
        _nome = _f.get("name", "")
        # O CORPO do componente, delimitado pelo PRÓXIMO `export` em coluna zero — não por uma
        # janela de N caracteres. A primeira versão usava janela fixa e invadia o componente
        # seguinte: o `ButtonGroup` foi acusado de entregar valor a um motor porque o `Toolbar`,
        # logo abaixo dele no mesmo arquivo, entrega. Janela é estimativa; isto é delimitação.
        _corpo = ""
        for _src in _fontes_react.values():
            _m = re.search(r"^export (?:function|const|interface) " + re.escape(_nome) + r"\b",
                           _src, re.M)
            if _m:
                _resto = _src[_m.end():]
                _fim = re.search(r"^export ", _resto, re.M)
                _corpo = _src[_m.start():_m.end() + (_fim.start() if _fim else len(_resto))]
                break
        _aria = set((_aria_medida.get(_nome) or {}).get("aria") or [])
        # `[^><]` para a prop ser ATRIBUTO DIRETO do motor: sem isso, um `size={…}` de um
        # `<IconButton>` dentro de `render={…}` era lido como prop do `<BaseCombobox.Clear>`, e o
        # Combobox foi acusado de comportamental. E a seta de função vira `=»` antes da busca,
        # senão um `onValueChange={v=>…}` corta a varredura no `>` e esconde o `orientation={}`
        # que vem logo depois — que é exatamente o caso do Tabs.
        _para_motor = _corpo.replace("=>", "=\u00bb")
        for _prop, _modo in sorted(_modos.items()):
            _ao_motor = re.search(r"<Base[A-Za-z.]*\b[^><]{0,600}?\b" + re.escape(_prop) + r"=\{",
                                  _para_motor, re.S) is not None
            _emite_aria = f"aria-{_prop}" in _aria
            _deve = "behavioral" if (_ao_motor or _emite_aria) else "visual"
            if _modo == "visual" and _deve == "behavioral":
                _porque = ("entrega o valor a um motor" if _ao_motor
                           else f"emite aria-{_prop} (medido em AUREA-ARIA.json)")
                errors.append(
                    f"{_nome}: responsive.{_prop} está como 'visual' e o componente {_porque} — "
                    f"prop responsiva que altera comportamento ou semântica NÃO pode ser resolvida "
                    f"só pela camada CSS (G-AXIS-06 / ADR-0047): resolva em runtime com "
                    f"useValorResponsivo e mande o valor resolvido ao motor")
            if _modo == "behavioral" and "useValorResponsivo" not in _corpo:
                errors.append(
                    f"{_nome}: responsive.{_prop} está como 'behavioral' e o componente não chama "
                    f"useValorResponsivo — a ficha promete resolução em runtime e o código não faz")
            if _modo == "visual" and "useValorResponsivo" in _corpo:
                errors.append(
                    f"{_nome}: responsive.{_prop} está como 'visual' e o componente resolve em "
                    f"runtime — ou a ficha está errada, ou o componente paga um observer que a "
                    f"camada CSS resolveria de graça")


# ── 31. o changelog cobre o que entrou depois do último release ─────────────
# Nasceu no item K3 (11/08/2026), e nasceu de um defeito medido: entre o publish da 0.1.0
# (31/07) e a Parte I (11/08) entraram 27 componentes, 3 subpaths, 3 peers opcionais e 39
# props em componentes que já existiam — e o CHANGELOG.md citava TRÊS quebras e mais nada.
# Nenhum gate olhava, porque nenhum gate lê nota de release. É o achado I1 outra vez: prosa
# sobre o estado, escrita à mão, que ninguém confere.
#
# A regra: componente que existe hoje e NÃO estava na superfície publicada tem de aparecer
# pelo nome no corpo do [Unreleased]. Cita-se onde couber — quebra, adição, correção; o gate
# não opina sobre a seção, só cobra que o consumidor consiga achar o nome.
#
# Por que o corpo do [Unreleased] e não o arquivo inteiro: um nome citado numa versão JÁ
# publicada não documenta a mudança de agora. Sem esse recorte, `Avatar` — que está na seção
# da 0.1.0 — satisfaria o gate para sempre.
CHANGELOG = root / "CHANGELOG.md"
SURFACE = root / "scripts/released-surface.json"
if not CHANGELOG.is_file():
    errors.append("CHANGELOG.md não existe — a ADR-0014 obriga nota de quebra em 0.x")
elif not SURFACE.is_file():
    errors.append("scripts/released-surface.json não existe — o check 31 não tem contra o que comparar")
else:
    _rel = json.loads(SURFACE.read_text(encoding="utf-8"))
    _ch = CHANGELOG.read_text(encoding="utf-8")
    _atual = sorted(fp.stem for fp in (root / "packages/contracts/registry").glob("*.json"))
    _novos = [c for c in _atual if c not in _rel["components"]]
    if "## [Unreleased]" not in _ch:
        errors.append(f"CHANGELOG.md: sem seção '## [Unreleased]', e há {len(_novos)} "
                      f"componentes fora da superfície publicada ({_rel['version']})")
    else:
        _corpo = _ch.split("## [Unreleased]", 1)[1].split("\n## [", 1)[0]
        # `\b` não serve: `Chart` casaria dentro de `ChartLegend` e daria por documentado o
        # que não está. A borda é o que NÃO pode ser parte de um nome de componente.
        _faltando = [c for c in _novos
                     if not re.search(rf"(?<![A-Za-z0-9]){re.escape(c)}(?![A-Za-z0-9])", _corpo)]
        if _faltando:
            errors.append(
                f"CHANGELOG.md: {len(_faltando)} componente(s) entraram depois da "
                f"{_rel['version']} e o [Unreleased] não os cita — "
                f"{', '.join(_faltando)}")
    # a versão que os pacotes carregam tem de ter seção própria, ou ser a que ainda não saiu.
    _v = json.loads((root / "packages/react/package.json").read_text(encoding="utf-8"))["version"]
    if _v != _rel["version"] and f"## [{_v}]" not in _ch:
        errors.append(f"CHANGELOG.md: os pacotes estão em {_v} e não há seção '## [{_v}]' "
                      f"(o último release registrado é {_rel['version']})")

# ── 32. os lugares públicos onde a versão mora dizem o mesmo número ────────
# A POLÍTICA NÃO NASCE AQUI. Ela é da ADR-0014 — "todos os seis pacotes ... versionam JUNTOS, como
# já faziam" —, cuja autoria é do Victor em 31/07/2026. Este check só a OBRIGA, e existir é a
# correção de um defeito DA PRÓPRIA ADR: o "Como isso é obrigado" dela dizia que "divergir entre
# pacotes reprova", e não reprovava. O check 31 lia só `packages/react/package.json` e o manifesto
# aceitava versões independentes, então um pacote podia ficar atrás com todos os gates verdes.
# Outro caso de comentário passando por código — desta vez dentro de uma ADR. A raiz acompanha a
# versão de propósito; o contrato também a declara. Pacote novo com `publishConfig.access=public`
# entra sozinho pela descoberta do check 34.
#
# CUSTO, e ele é CONSEQUÊNCIA da ADR-0014, não decisão nova tomada nesta linha: enquanto a política
# conjunta valer, publicar só um pacote é impossível. Para versionamento independente, muda-se
# primeiro a ADR-0014 e só então este gate.
#
# (Esta cabeça dizia "CUSTO ACEITO por Victor em 12/08/2026". Não houve decisão dele nesse dia: a
# decisão é de 31/07/2026 e está na ADR-0014. Atribuição corrigida em 13/08/2026.)
VERSION_FILES = [root / "package.json", *_public_manifestos,
                 root / "packages/contracts/aurea.contract.json"]
_por_versao = {}
for _fp in VERSION_FILES:
    _rel_path = _fp.relative_to(root).as_posix()
    if not _fp.is_file():
        errors.append(f"{_rel_path} não existe — é um dos arquivos onde a versão mora")
        continue
    _ver = json.loads(_fp.read_text(encoding="utf-8")).get("version")
    if not _ver:
        errors.append(f"{_rel_path}: sem campo 'version' — é um dos arquivos onde a versão mora")
        continue
    _por_versao.setdefault(_ver, []).append(_rel_path)
if len(_por_versao) > 1:
    _detalhe = " · ".join(f"{v} em {', '.join(fs)}" for v, fs in sorted(_por_versao.items()))
    errors.append(f"versão divergente entre os {sum(len(fs) for fs in _por_versao.values())} "
                  f"arquivos que a declaram: {_detalhe} — o CHANGELOG.md afirma que os pacotes "
                  f"versionam juntos")

# ── 33. docs vivos selecionados: referências próprias e versões 0.x.y ──────
# Nasceu no AUD-0008 da auditoria SENTINELA (12/08/2026), e nasceu medido: o `README.md` listava
# `apps/docs/index.html` na estrutura do repositório — removido na Parte D, em 08/08/2026 — e
# anunciava a versão publicada como `0.1.0` quatro dias depois de a `0.2.0` estar no npm. O
# `AUREA.md`, o `BUILDING.md` e o `QUALITY.md` traziam o achado M8 como aberto (fechou em 07/08) e
# uma contagem de checks escrita à mão. Nenhum gate olhava documento vivo.
#
# NUMERO 33 e não 32 de propósito: o 32 nasceu no mesmo dia, em sessão paralela (a trava de versão
# entre os oito arquivos), e reusar o número faria duas travas diferentes com o mesmo nome no
# histórico.
#
# As duas regras são MECÂNICAS — comparam com o disco e com o `package.json`, não com uma lista de
# frases proibidas. Cobrar palavra seria o defeito que o I6–I8 registrou.
#
# ESCOPO, e ele é estreito de propósito. Só os documentos que descrevem COMO AS COISAS SÃO. Ficam
# fora, e cada um por um motivo:
#   • `PLANO-1.0.md` — preserva o enunciado ORIGINAL de cada parte fechada, e esses enunciados citam
#     de propósito o que existia no dia (o §7 fala da página manual que ele mesmo removeu);
#   • `ROADMAP.md` — é história desde 02/08/2026, e o cabeçalho dele diz isso;
#   • `CLAUDE.md` — carrega notas de "era assim, virou aquilo", que é o valor dela;
#   • `audit/`, `decisions/`, `CHANGELOG.md` — registro; reescrevê-los apaga a dívida.
# E dentro dos cinco, uma linha com `~~` (riscado) é menção DELIBERADA a coisa removida: o
# strikethrough é o marcador, e ele é verificável sem adivinhar intenção.
DOCS_VIVOS = ["README.md", "docs/AUREA.md", "docs/BUILDING.md", "docs/QUALITY.md", "docs/MAP.md"]
# O `BUILDING.md` fica fora da regra de CAMINHO, e a razão saiu da primeira execução desta trava:
# ele descreve as dezesseis referências de terceiro pelos caminhos INTERNOS delas —
# `packages/mui-material/src`, `apps/www/app/components`, `packages/web/src/features/agents` —, que
# começam com os mesmos `apps/` e `packages/` que os nossos e nunca vão existir aqui. Distinguir
# "caminho nosso" de "caminho da referência" exige entender a frase em volta, e trava que adivinha
# intenção reprova o que está certo. Ele continua sob a regra de VERSÃO, que não tem essa ambiguidade.
SEM_REGRA_DE_CAMINHO = {"docs/BUILDING.md"}
CAMINHO_RE = re.compile(r"`((?:apps|packages|scripts|tests)/[A-Za-z0-9._/-]+)`")
VERSAO_RE = re.compile(r"\b0\.\d+\.\d+\b")
for _doc in DOCS_VIVOS:
    _fp = root / _doc
    if not _fp.is_file():
        errors.append(f"check 33: {_doc} não existe — a lista de documentos vivos está vencida")
        continue
    for _linha in _fp.read_text(encoding="utf-8").splitlines():
        if "~~" in _linha:  # menção deliberada a coisa removida
            continue
        for _cam in ([] if _doc in SEM_REGRA_DE_CAMINHO else CAMINHO_RE.findall(_linha)):
            _alvo = _cam.split("#")[0].rstrip("/")
            if "*" in _alvo:  # glob é padrão, não caminho
                continue
            if not (root / _alvo).exists():
                errors.append(f"check 33: {_doc} cita `{_alvo}`, que não existe no repositório "
                              f"(risque a linha com ~~ se a menção é deliberadamente histórica)")
        for _v in VERSAO_RE.findall(_linha):
            errors.append(f"check 33: {_doc} escreve a versão {_v} à mão — a versão publicada vive "
                          f"no CHANGELOG.md e nos package.json, e escrita aqui ela vence sozinha")

# ── 13. estado publicado == estado medido ──────────────────────────────────
# A auditoria integral de 26/07/2026 (achado I1) encontrou nove números de estado
# escritos à mão em quatro documentos, TODOS errados: "147 páginas" eram 169,
# "~40 componentes" eram 65, "2 de 65 com conteúdo rico" eram 21. Nada comparava a
# prosa com o repositório — validate.py provava consistência do código, nunca da doc.
# Agora a contagem vive numa função só, que alimenta a GERAÇÃO do STATE.md e do bloco
# do README E este gate: os dois nunca divergem de expressão. Mesma disciplina do
# raw_px_counts (check 12) e do dist == build (checks 6/7/8).
CATALOG = root / "apps/catalog"
# A lista morava AQUI, escrita à mão, e era a segunda verdade do `page-model.mjs` — o modelo de
# página é dado desde a ADR-0001 justamente para ter uma fonte só. Em 16/08/2026 a área de hooks
# entrou no modelo e esta cópia não soube: o `hooks.html` foi contado como página de COMPONENTE, e
# o STATE.md passou a publicar 104 componentes onde há 103. Agora ela é LIDA de lá.
_PAGE_MODEL = (root / "scripts/page-model.mjs").read_text(encoding="utf-8")
_m_area = re.search(r"export const AREA_PAGES = \[(.*?)\];", _PAGE_MODEL, re.S)
if not _m_area:
    sys.exit("validate: não achei AREA_PAGES em scripts/page-model.mjs — a fonte do modelo mudou de forma")
AREA_PAGES = set(re.findall(r'"([^"]+\.html)"', _m_area.group(1)))
STATE_MD = root / "STATE.md"
README_MD = root / "README.md"
MARK_BEGIN = "<!-- state:begin -->"
MARK_END = "<!-- state:end -->"


def project_state():
    """Estado do projeto medido no repositório.

    Determinístico de propósito: sem data e sem hash de commit. O gate compara
    CONTEÚDO, então qualquer valor que mude sozinho quebraria o build amanhã sem
    ninguém ter tocado em nada.
    """
    pages = sorted(p.name for p in CATALOG.glob("*.html"))
    kind = {"component": 0, "pattern": 0, "block": 0, "recipe": 0, "area": 0}
    for p in pages:
        if p in AREA_PAGES:
            kind["area"] += 1
        elif p.startswith("pattern-"):
            kind["pattern"] += 1
        elif p.startswith("block-"):
            kind["block"] += 1
        elif p.startswith("recipe-"):
            kind["recipe"] += 1
        else:
            kind["component"] += 1

    reg = {fp.stem: json.loads(fp.read_text(encoding="utf-8"))
           for fp in sorted((root / "packages/contracts/registry").glob("*.json"))}
    content = CATALOG / "content"
    unit_src = "".join(fp.read_text(encoding="utf-8")
                       for fp in sorted((root / "tests/unit").glob("*.test.tsx")))
    # "citado" e não "testado": a métrica é a menção do nome no arquivo de teste. É
    # grosseira de propósito — grosseira e medida vale mais que precisa e chutada.
    # Idem a contagem de test(): conta CHAMADAS no fonte, não casos executados. Um teste
    # dirigido por tabela faz uma chamada e gera N casos (ref.test.tsx: 1 → 31). O rótulo
    # publicado diz exatamente isso; medir caso executado exigiria rodar o vitest.
    cited = sum(1 for c in reg
                if re.search(r"(?<![A-Za-z0-9])" + re.escape(c) + r"(?![A-Za-z0-9])", unit_src))
    snaps = list((root / "tests/visual").rglob("*.png"))
    # 271 declarações emitidas são 185 NOMES: theme.dark, theme.light e as 3 densidades
    # redeclaram nomes de base. O denominador honesto é o de nomes distintos.
    token_names = set(DEF_RE.findall(tokens_css))
    core_vars = set(re.findall(r"var\((--[a-z0-9-]+)", core_src))

    def com(field):
        return sum(1 for f in reg.values() if f.get(field))

    return {
        # `exported` traz TODO export em PascalCase, e dois deles são os contextos React que o
        # `internal.tsx` expõe para o `system.tsx` — a mesma allowlist NAO_COMPONENTE que o
        # check de ficha já usa acima. Sem subtrair aqui, o STATE.md publicava 78 onde o
        # pacote tem 76 componentes, e as 76 fichas viravam "cobertura de 97%" de mentira.
        # Medido em 21/08/2026 pela extração da emissão do tsc
        # (`node scripts/build-api-surface.mjs`): 76, igual ao conjunto de fichas de componente.
        "componentes": len(exported - NAO_COMPONENTE),
        # `fichas` conta só as de COMPONENTE. Desde que o registry passou a modelar hook
        # (G-DX-01), somar os dois faria o número de fichas crescer sem o de componentes crescer,
        # e a trava logo abaixo — que existe para pegar export em PascalCase que não é componente
        # — reprovaria por um motivo falso.
        "fichas": sum(1 for f in reg.values() if f.get("kind", "component") != "hook"),
        "hooks": sum(1 for f in reg.values() if f.get("kind") == "hook"),
        "paginas_total": len(pages),
        "paginas": kind,
        # `_` no começo não é conteúdo de componente: _starters.mjs e _recipes.mjs são as duas
        # fontes coletivas criadas na Fase 7. Contá-las como "componente com conteúdo próprio"
        # inflaria justamente o número que o achado I1 nasceu para manter honesto.
        "conteudo_rico": len([p for p in content.glob("*.mjs") if not p.name.startswith("_")]),
        "starters": len(_starters or []),
        "receitas_com_preview": len(_recipes or []),
        "patterns_content": len(list((content / "patterns").glob("*.mjs"))),
        "blocks_content": len(list((content / "blocks").glob("*.mjs"))),
        "receitas": sum(1 for p in (root / "patterns").glob("*.md") if p.name != "README.md"),
        "props": com("props"),
        "variants": com("variants"),
        "sizes": com("sizes"),
        "states": com("states"),
        "tokens_ficha": com("tokens"),
        "apg": sum(1 for f in reg.values() if f.get("a11y", {}).get("apg")),
        "maturidade": {m: sum(1 for f in reg.values() if f["maturity"] == m)
                       for m in sorted({f["maturity"] for f in reg.values()})},
        "testes_unit": len(re.findall(r"\b(?:it|test)\(", unit_src)),
        "componentes_citados_no_teste": cited,
        "specs_visuais": len(list((root / "tests/visual").glob("*.spec.ts"))),
        "baselines": len(snaps),
        "baselines_linux": sum(1 for p in snaps if p.name.endswith("-linux.png")),
        # sem comentários: a métrica é "classe DECLARADA", e comentário que cita `.chip`
        # não declara nada. Contar a prosa fazia o número subir a cada comentário novo.
        "classes_core": len(set(re.findall(r"\.([a-z][a-z0-9-]*)",
                                          re.sub(r"/\*.*?\*/", "", core_src, flags=re.S)))),
        "token_declaracoes": len(DEF_RE.findall(tokens_css)),
        "token_nomes": len(token_names),
        "token_usados": len(token_names & core_vars),
        "token_sem_uso": len(token_names - core_vars),
    }


def render_readme_block(s):
    """Bloco de estado do README. Em português desde 24/09/2026 (decisão do Victor: o repositório
    público é todo em português)."""
    p = s["paginas"]
    return (f"\n{s['paginas_total']} páginas geradas — {p['component']} de componente, "
            f"{p['pattern']} de padrão, {p['block']} de bloco, {p['recipe']} de receita e "
            f"{p['area']} índices de área — a partir de {s['fichas']} fichas. "
            f"Toda página traz o mesmo miolo: breadcrumb, preview, o código que a produz, instalação, "
            f"procedência e anterior/próximo. {s['conteudo_rico']} componentes têm conteúdo "
            f"escrito à mão; os outros {s['starters']} trazem um starter — o preview real e "
            f"o código, ainda sem exemplos extras. {s['props']} componentes publicam a tabela de "
            f"props.\n")


def _frase_m8(s):
    """O parágrafo sobre o M8, DERIVADO da medição.

    Nasceu fixo — "é o achado M8, que segue aberto" — e virou mentira no dia em que a Parte E
    fechou a cobertura, dentro de um arquivo cujo cabeçalho diz "GERADO. Não editar à mão".
    É o achado I1 de novo, uma camada abaixo: o NÚMERO era gerado, a FRASE sobre o número não.
    Quem só gera o número ainda deixa a prosa mentir.
    """
    if s["props"] < s["fichas"]:
        return (f"O contrato de API está publicado em {s['props']} de {s['fichas']} fichas: é o "
                f"achado **M8**, que segue aberto.")
    return (f"O contrato de API está publicado nas {s['fichas']}: o achado **M8** fechou na "
            f"Parte E do [`PLANO-1.0.md`](PLANO-1.0.md).")


def render_state_md(s):
    p, m = s["paginas"], s["maturidade"]
    mat = " · ".join(f"{k} {v}" for k, v in m.items())
    return f"""# Estado do projeto — Aurea UDS

<!-- GERADO. Não editar à mão.
     Regravar:  python scripts/validate.py --write-state
     O check 13 do validador falha se este arquivo divergir da contagem real.
     Existe por causa do achado I1 da auditoria de 26/07/2026: nove números de estado
     escritos à mão em quatro documentos, todos errados. -->

Documento canônico do **estado**. `AUREA.md` traz visão e arquitetura; `ROADMAP.md`,
as etapas; aqui ficam os números — e eles são medidos, não escritos.

## Biblioteca

| Métrica | Valor |
|---|---|
| Componentes exportados por `@aurea-uds/react` | {s['componentes']} |
| Fichas de registry | {s['fichas']} |
| Hooks públicos com ficha | {s['hooks']} |
| Maturidade declarada nas fichas | {mat} |
| Receitas de arquétipo (`patterns/*.md`) | {s['receitas']} |
| Classes declaradas no CSS do core | {s['classes_core']} |

## Tokens

| Métrica | Valor |
|---|---|
| Declarações emitidas | {s['token_declaracoes']} |
| Nomes distintos | {s['token_nomes']} |
| Nomes referenciados pelo core | {s['token_usados']} |
| Nomes nunca referenciados pelo core | {s['token_sem_uso']} |

## Catálogo gerado

| Tipo de página | Quantidade |
|---|---|
| Componente | {p['component']} |
| Pattern | {p['pattern']} |
| Block | {p['block']} |
| Recipe | {p['recipe']} |
| Índice de área | {p['area']} |
| **Total** | **{s['paginas_total']}** |

## Cobertura das fichas

| Campo | Fichas que declaram |
|---|---|
| `props` (contrato de API publicado) | {s['props']} de {s['fichas']} |
| `variants` | {s['variants']} de {s['fichas']} |
| `sizes` | {s['sizes']} de {s['fichas']} |
| `states` | {s['states']} de {s['fichas']} |
| `tokens` | {s['tokens_ficha']} de {s['fichas']} |
| `a11y.apg` | {s['apg']} de {s['fichas']} |

## Conteúdo do catálogo

| Origem | Arquivos |
|---|---|
| Componentes com conteúdo próprio | {s['conteudo_rico']} de {s['fichas']} |
| Componentes com starter (preview + código mínimos) | {s['starters']} de {s['fichas']} |
| Patterns com conteúdo | {s['patterns_content']} |
| Blocks com conteúdo | {s['blocks_content']} |
| Receitas com preview | {s['receitas_com_preview']} de {s['receitas']} |

Todo item tem preview e código — é o núcleo do modelo de página decidido na
[ADR-0001](decisions/0001-modelo-de-pagina-do-catalogo.md). Os {s['starters']} componentes de
starter têm o mínimo do modelo e ainda não têm `features` nem `examples`. {_frase_m8(s)}

## Garantias automáticas

| Métrica | Valor |
|---|---|
| Chamadas de `test()` nos testes unitários | {s['testes_unit']} |
| Componentes citados nos testes unitários | {s['componentes_citados_no_teste']} de {s['fichas']} |
| Specs de navegador (Playwright) | {s['specs_visuais']} |
| Baselines de screenshot no repositório | {s['baselines']} |
| Baselines `-linux.png` (o que a CI compara) | {s['baselines_linux']} |

{_frase_gate_pixel(s)}
"""


def _frase_gate_pixel(s):
    """A frase muda com o número, porque o número mudou. Ela dizia 'gate inativo' e ficou
    verdadeira por meses; deixar texto fixo ao lado de contagem gerada é o achado I1 em
    miniatura — a tabela se atualiza e a prosa ao lado mente."""
    if not s["baselines_linux"]:
        return ("`baselines -linux.png` em zero significa **gate de pixel inativo na CI**: o "
                "passo de\nscreenshot emite aviso e não bloqueia. É o follow-up A4 da auditoria "
                "de 18/07/2026.")
    return (f"Com {s['baselines_linux']} baselines `-linux.png` no repositório, o **gate de pixel "
            f"está ATIVO**: o\npasso de screenshot da CI compara e bloqueia. Fechou o follow-up A4 "
            f"da auditoria de\n18/07/2026, aberto desde então. Os `-win32.png` servem à execução "
            f"local nesta máquina e\nnão são comparados pela CI.")


state = project_state()

# A trava que pega a regressão de "componentes" (ATIVIDADE-2, Fase Zero, 21/08/2026).
# O defeito: `project_state` publicava `len(exported)`, e `exported` é TODO export em
# PascalCase — inclusive os dois contextos React que a NAO_COMPONENTE, dez linhas acima do
# check 11, já declara não serem componentes. O STATE.md dizia 78 onde o pacote tem 76.
# Passou despercebido porque o número era GERADO: o check 13 provava que a doc não mentia
# sobre a medição, e ninguém provava que a medição não mentia sobre o pacote.
# O check 11 garante `exported - NAO_COMPONENTE == fichas` como CONJUNTO. Logo os dois
# números publicados têm de ser o mesmo número. Se alguém voltar a contar `len(exported)`,
# isto reprova — e foi provado contra o defeito: com `len(exported)` no lugar, falha com 78≠76.
if state["componentes"] != state["fichas"]:
    errors.append(f"state: 'componentes' ({state['componentes']}) != 'fichas' ({state['fichas']}) — "
                  "o check 11 exige conjuntos iguais, então as contagens não podem divergir; "
                  "provável export em PascalCase que não é componente (ver NAO_COMPONENTE)")

state_md = render_state_md(state)
readme_block = render_readme_block(state)


# ── 20. manifesto do projeto: gerado, nunca escrito ────────────────────────
# Achado M19 pedia "manifesto de projeto legível por máquina". Ele é DERIVADO — package.json de
# cada pacote, o contrato, o registry e a mesma contagem que alimenta o STATE.md. Nada aqui é
# digitado, e é a única forma de ele não virar o `component-inventory.json` do achado M6: 86 KB
# escritos à mão, sem consumidor, que já tinham divergido do contrato quando foram medidos.
#
# CONDIÇÃO DE MORTE, declarada: hoje ele não tem consumidor. Se até a publicação (ADR-0010)
# nenhum aparecer — site, registry público, agente que leia o projeto sem abrir 12 documentos —
# ele deve ser APAGADO, não mantido por educação.
MANIFEST = root / "manifest.json"


def project_manifest(s):
    pkgs = {}
    for pkg_dir in sorted((root / "packages").iterdir()):
        pj = pkg_dir / "package.json"
        if not pj.is_file():
            continue
        m = json.loads(pj.read_text(encoding="utf-8"))
        pkgs[m["name"]] = {
            "version": m["version"],
            "license": m.get("license"),
            "dependencies": sorted(m.get("dependencies", {})),
            "optionalPeers": sorted(k for k, v in m.get("peerDependenciesMeta", {}).items()
                                    if v.get("optional")),
            "entryPoints": sorted(m.get("exports", {})) or ["."],
        }
    reg = sorted(fp.stem for fp in (root / "packages/contracts/registry").glob("*.json"))
    return {
        "_gerado": "python scripts/validate.py --write-manifest — o check 20 falha se divergir",
        "_semConsumidor": ("Nenhum consumidor hoje. Se nenhum aparecer até a publicação "
                           "(decisions/0010), apague este arquivo em vez de mantê-lo por educação "
                           "— é a lição do achado M6."),
        "schemaVersion": "1.0",
        "project": {"name": "Aurea Universal Design System", "short": "Aurea UDS",
                    "npmScope": "@aurea-uds", "license": "Apache-2.0",
                    "thirdParty": [{"name": "IBM Plex", "license": "OFL-1.1"},
                                   {"name": "Carbon Icons", "license": "Apache-2.0"}]},
        "packages": pkgs,
        "components": reg,
        "state": s,
        # contado, não digitado: o número de checks é medido nos próprios cabeçalhos deste
        # arquivo. Escrever "20" aqui seria repetir o achado I1 dentro do manifesto que existe
        # para não repetir o M6.
        "gates": {"validate": len(set(re.findall(r"^\s*# ── (\d+)\w*\.",
                                                 (root / "scripts/validate.py").read_text(encoding="utf-8"),
                                                 re.M))),
                  "playwrightSpecs": s["specs_visuais"]},
    }


manifest_txt = json.dumps(project_manifest(state), indent=2, ensure_ascii=False) + "\n"
if "--write-manifest" in sys.argv:
    MANIFEST.write_text(manifest_txt, encoding="utf-8", newline="\n")
    print("manifest: manifest.json regravado")
    sys.exit(0)
if not MANIFEST.is_file():
    errors.append("manifest.json não existe — rode 'python scripts/validate.py --write-manifest'")
elif MANIFEST.read_text(encoding="utf-8") != manifest_txt:
    errors.append("manifest.json difere do medido — rode 'python scripts/validate.py --write-manifest' "
                  "(manifesto é gerado; editar à mão é o defeito que ele existe para não repetir)")

if "--write-state" in sys.argv:
    # newline="\n" sempre: .gitattributes é eol=lf, e no Windows o write_text padrão
    # gravaria CRLF. A leitura normaliza de qualquer jeito, mas gravar LF evita a
    # dúvida de "é diferença de conteúdo ou de fim de linha?" na primeira vez que
    # este gate reprovar alguém.
    STATE_MD.write_text(state_md, encoding="utf-8", newline="\n")
    readme_txt = README_MD.read_text(encoding="utf-8")
    pat = re.compile(re.escape(MARK_BEGIN) + r".*?" + re.escape(MARK_END), re.S)
    if not pat.search(readme_txt):
        print(f"state: README.md não tem o bloco {MARK_BEGIN} … {MARK_END} — adicione-o primeiro")
        sys.exit(1)
    README_MD.write_text(pat.sub(lambda _: MARK_BEGIN + readme_block + MARK_END, readme_txt),
                         encoding="utf-8", newline="\n")
    print("state: STATE.md e o bloco do README regravados")
    sys.exit(0)

if not STATE_MD.is_file():
    errors.append("STATE.md não existe — rode 'python scripts/validate.py --write-state'")
elif STATE_MD.read_text(encoding="utf-8") != state_md:
    errors.append("STATE.md difere do estado medido no repositório — rode "
                  "'python scripts/validate.py --write-state' (número de estado não se escreve à mão)")
readme_txt = README_MD.read_text(encoding="utf-8")
m = re.search(re.escape(MARK_BEGIN) + r".*?" + re.escape(MARK_END), readme_txt, re.S)
if not m:
    errors.append(f"README.md: sem o bloco de estado {MARK_BEGIN} … {MARK_END}")
elif m.group(0) != MARK_BEGIN + readme_block + MARK_END:
    errors.append("README.md: bloco de estado difere do medido — rode "
                  "'python scripts/validate.py --write-state'")

# ── 27. estado que o core PINTA, alguma ficha DECLARA ──────────────────────
# A ATIVIDADE-2 mediu em 21/08/2026: de 15 atributos `data-*` que o core estilizava, **8 não
# eram declarados por ficha nenhuma** — inclusive `data-highlighted`, que é o item de menu
# apontado pelo TECLADO e que o motor distingue de hover e de foco de propósito. O core pintava
# um estado que o contrato negava existir. Mesma família do achado da ATIVIDADE-2 sobre `sizes`:
# a ficha é escrita à mão e ninguém a confrontava com o que existe de fato.
#
# DOIS VOCABULÁRIOS, E ISSO É DELIBERADO. O `data-*` é do MOTOR (`data-panel-open`); o `states`
# da ficha é a palavra que a documentação usa com quem consome (`open`). Exigir igualdade
# literal corromperia a ficha para agradar o gate. Então o que existe é uma TRADUÇÃO explícita,
# curta, e que não cresce sozinha — cada linha aqui é a afirmação de que os dois nomes são a
# mesma coisa. É o §131 da ordem: estado tem de ser uma linguagem consistente.
TRADUZ_ESTADO = {
    "panel-open": "open",          # Collapsible: o painel é que abre, o gatilho é que anuncia
    "popup-open": "open",          # Menubar, e qualquer gatilho de popup
    "starting-style": "open",      # o ciclo de entrada acontece durante o aberto
    "ending-style": "closed",      # e o de saída, durante o fechado
    "active": "active",
    "read": "read",
}
# Atributo que não é ESTADO de componente, e por isso não se cobra em `states`:
NAO_E_ESTADO = {
    "theme": "é o tema do documento, não estado de componente",
    # Os quatro abaixo entraram com os componentes de agente, no merge de 28/08/2026, e nenhum é
    # ESTADO: são eixos de DADO. A diferença importa e é a mesma do `orientation` logo abaixo —
    # estado é condição em que o componente se encontra (aberto, marcado, inválido); eixo é uma
    # propriedade do que ele mostra. A severidade é do EVENTO, não do EventStream; a operação é
    # da ENTRADA, não do MemoryLedger. Declará-los em `states` faria a ficha prometer estados que
    # o componente não tem, que é o defeito que este gate existe para pegar — invertido.
    "kind": "é o TIPO da mensagem entre agentes (dado), não estado do componente",
    "operation": "é a OPERAÇÃO da entrada de memória (dado), não estado do componente",
    "severity": "é a SEVERIDADE do evento (dado), não estado do componente",
    "state": "é EIXO, e já mora em `axes` das fichas que o têm (DataGrid, DataState, AgentCard…)",
    "orientation": "é EIXO, e eixo é variante: mora em `variants` com `variantProp` "
                   "(o Toolbar e o Separator fazem assim)",
}
_css_sem_comentario = re.sub(r"/\*.*?\*/", "", core_src, flags=re.S)
_pintados = {m for m in re.findall(r"\[data-([a-z-]+)", _css_sem_comentario)}
_declarados = set()
_eixos = set()
for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
    try:
        f = json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        continue
    _declarados.update(f.get("states", []))
    for chave in ("variantProp", "sizeProp"):
        if f.get(chave):
            _eixos.add(f[chave])
for attr in sorted(_pintados):
    if attr in NAO_E_ESTADO or attr in _eixos:
        continue
    if TRADUZ_ESTADO.get(attr, attr) in _declarados:
        continue
    errors.append(
        f"core: pinta [data-{attr}] e ficha nenhuma declara esse estado — "
        f"o contrato nega um estado que a pele desenha. Declare em `states` da ficha do "
        f"componente que o emite, ou traduza em TRADUZ_ESTADO se o nome do motor difere do nosso")

# ── 28. o que o runtime vanilla FAZ, o React também faz ────────────────────
# Quatro achados de 21/08/2026 são a MESMA coisa vista quatro vezes, e todas apareceram por
# acaso — nenhum gate as procurava:
#
#   G-CAP-24  `window.Aurea.toggleTheme` existe em vanilla desde sempre; o React não tinha nada,
#             e catálogo e docs já divergiam em marcação e ARIA resolvendo cada um por conta.
#   (sem nome) `setDensity` idem, e pior: ninguém tinha notado. Densidade é identidade declarada
#             no CLAUDE.md, e quem instalava só o pacote React não podia trocá-la.
#   G-CAP-25  o `tocSpy` do `aurea.js` marca a seção em vista; o `TableOfContents` do React
#             recebe `current` por prop e não observa nada — e a ficha promete que observa.
#   G-A11Y-03 o link de pular existia à mão nos docs e em lugar nenhum do pacote.
#
# O padrão é sempre: **o comportamento existe em vanilla, e o React não o tem.** É isso que este
# check mede. A fonte é o `window.Aurea` — a API pública do runtime — mais as funções que o
# script liga sozinho ao carregar. Cada uma precisa de uma contraparte declarada aqui, com o
# nome do que a implementa no React; ou de uma declaração explícita de que é só-vanilla, com
# motivo. O que NÃO pode é ficar em silêncio, que foi o estado até hoje.
CONTRAPARTE_REACT = {
    # capacidade do runtime  ->  quem a entrega no pacote React
    "setTheme": "useTheme",
    "toggleTheme": "useTheme",
    "setDensity": "useDensity",
    "showToast": "useToast",
    "copy": "CodeBlock",          # o CodeBlock emite o mesmo [data-aurea-copy]
    "activateTab": "Tabs",
    # Fechado em 21/08/2026: o `TableOfContents` observa por conta própria quando ninguém passa
    # `current`, com a MESMA faixa do `tocSpy`. Os dois se coordenam pelo `data-toc-spy="react"`,
    # que sai do efeito — nunca do render, senão as 202 páginas estáticas do catálogo levariam a
    # marca sem ter React vivo para honrá-la.
    "tocSpy": "TableOfContents",
}
_SO_VANILLA = {
    # sem contraparte por decisão, e a decisão fica escrita aqui, não na cabeça de ninguém
}
_runtime = (root / "packages/core/src/aurea.js").read_text(encoding="utf-8")
_m = re.search(r"window\.Aurea\s*=\s*\{(.*?)\n\s*\};", _runtime, re.S)
_publicas = set(re.findall(r"^\s*(\w+)\s*:", _m.group(1), re.M)) if _m else set()
if not _publicas:
    errors.append("check 28: não achei o objeto window.Aurea em packages/core/src/aurea.js — "
                  "se ele mudou de forma, o gate precisa acompanhar em vez de passar vazio")
# `exported` e `exported_hooks` já foram medidos no check 11, a partir dos fontes do React.
_no_react = exported | exported_hooks
for _cap in sorted(_publicas):
    if _cap in _SO_VANILLA:
        continue
    _quem = CONTRAPARTE_REACT.get(_cap, "")
    if _quem is None:
        continue                  # ausência declarada, com cartão de gap aberto
    if not _quem:
        errors.append(f"core: window.Aurea.{_cap} não tem contraparte declarada no React — "
                      f"acrescente em CONTRAPARTE_REACT (ou em _SO_VANILLA, com motivo). "
                      f"Foi assim que tema e densidade ficaram sem equivalente por meses")
    elif _quem not in _no_react:
        errors.append(f"core: window.Aurea.{_cap} aponta para '{_quem}', que o pacote React não "
                      f"exporta — a contraparte foi renomeada ou removida")

# ── 29. o estado de LEITURA da matriz não se descola da matriz ─────────────
# `audit/activity-2/MATRIX.json` é gerado — `node audit/activity-2/matrix.mjs` recalcula o
# veredito de máquina do zero. A única coisa ali que NÃO se recalcula é `estado`: a leitura
# humana de cada célula, escrita à mão em `MATRIX-ESTADO.json`, e sem a qual uma sessão que
# lesse 63 células e acabasse os tokens perderia as 63.
#
# Duas camadas que podem se descolar, e as duas em silêncio:
#
#   ÓRFÃ         estado escrito à mão para uma célula que a matriz não produz mais — capacidade
#                fora do CROSSREF, eixo renomeado, chave digitada errada. A leitura existe no
#                arquivo, e a matriz não a usa.
#   DESATUALIZADA  a matriz foi regerada e o veredito de máquina mudou POR BAIXO de uma leitura
#                já feita (fonte nova na tabela FONTES, extrator corrigido, ficha alterada). A
#                decisão continua exibida como se a evidência dela ainda existisse.
#   FORA DE SINCRONIA  alguém editou `MATRIX-ESTADO.json` e não rodou `matrix.mjs`. O estado
#                versionado diz uma coisa, a matriz versionada mostra outra.
#
# O teste `tests/unit/matriz-estado.test.tsx` prova o MECANISMO contra um fixture. Este check
# prova os ARQUIVOS versionados — que é outro defeito, e o mecanismo certo apontado para um
# arquivo desatualizado passaria naquele teste inteiro.
_dir_m = root / "audit/activity-2"
_arq_estado, _arq_matriz = _dir_m / "MATRIX-ESTADO.json", _dir_m / "MATRIX.json"
if _arq_estado.exists() and _arq_matriz.exists():
    _ESTADOS_LEITURA = {"PENDING", "IN_REVIEW", "CONFIRMED", "EQUIVALENT", "AUREA_SUPERA",
                        "AUREA_INFERIOR", "N/A", "INCONCLUSIVE"}
    _est = json.loads(_arq_estado.read_text(encoding="utf-8")).get("celulas", {})
    _mat = json.loads(_arq_matriz.read_text(encoding="utf-8"))
    # As células da matriz, recontadas AQUI a partir das linhas — não lidas de um campo que o
    # próprio gerador escreveu. Campo resumido concorda consigo mesmo por construção.
    _cels = {}
    for _l in _mat.get("linhas", []):
        for _eixo, _c in (_l.get("comparacao") or {}).items():
            _cels[f"{_l['capacidade']}\u00b7{_eixo}"] = _c
    for _k, _v in sorted(_est.items()):
        if _v.get("estado") not in _ESTADOS_LEITURA:
            errors.append(f"MATRIX-ESTADO.json: `{_k}` tem estado `{_v.get('estado')}`, fora do "
                          f"vocabulário fechado ({' · '.join(sorted(_ESTADOS_LEITURA))})")
            continue
        for _campo in ("porque", "em"):
            if not _v.get(_campo):
                errors.append(f"MATRIX-ESTADO.json: `{_k}` está sem `{_campo}` — estado sem razão "
                              f"e sem data é opinião anônima")
        _c = _cels.get(_k)
        if _c is None:
            errors.append(f"MATRIX-ESTADO.json: `{_k}` é ÓRFÃ — a matriz não produz essa célula. "
                          f"A leitura está no arquivo e a matriz não a usa. Corrija a chave "
                          f"(`<capacidade>\u00b7<eixo>`) ou remova a linha registrando por quê")
            continue
        if _c.get("estado") != _v["estado"]:
            errors.append(f"matriz: `{_k}` está `{_c.get('estado')}` em MATRIX.json e "
                          f"`{_v['estado']}` em MATRIX-ESTADO.json — rode "
                          f"`node audit/activity-2/matrix.mjs` e versione a saída")
        _epoca = _v.get("veredictoNaEpoca")
        if _epoca and _epoca != _c.get("veredito"):
            errors.append(f"matriz: `{_k}` foi lida contra o veredito `{_epoca}` e hoje a máquina "
                          f"diz `{_c.get('veredito')}` — a evidência mudou por baixo da decisão. "
                          f"Releia a célula e atualize `veredictoNaEpoca`, ou o estado")
    # E o caminho inverso: célula da matriz marcada como vinda do arquivo sem estar nele.
    for _k, _c in sorted(_cels.items()):
        if _c.get("_estadoOrigem") == "MATRIX-ESTADO.json" and _k not in _est:
            errors.append(f"matriz: `{_k}` diz vir de MATRIX-ESTADO.json e não está lá — "
                          f"MATRIX.json está velho: rode `node audit/activity-2/matrix.mjs`")

# ── 30. teclado declarado é teclado MEDIDO ─────────────────────────────────
# O `G-A11Y-07` mediu em 27/08/2026 o que estava por trás das fichas que declaravam
# `a11y.keyboard`: **o `DataGrid` prometia `role: "grid"` e as quatro setas, e as quatro eram
# ficção** — nenhum `onKeyDown`, nenhum `tabIndex` em célula, `<table>` puro. A ficha é o contrato
# publicado, e quem a lê para decidir se adota confia nela: prometer acessibilidade que não existe
# é pior que não tê-la.
#
# A pergunta obrigatória do CLAUDE.md — *"quem mais tem esse problema?"* — achou mais SETE fichas
# declarando teclado sem nada atrás. Todas foram medidas (o `apps/keyboard-probe` foi de 8 para 14
# bancos), e a medição achou o esperado: `TreeView`, `ContextMenu` e `Sidebar` entregavam teclas
# que a ficha não declarava.
#
# Este check é o que impede a próxima. `keyboardNote` é o rastro da medição — ele diz QUANDO, COM
# QUE INSTRUMENTO, e o que ficou por confirmar. Sem ele, uma lista de teclas é memória.
#
# A nota pode declarar que a medição NÃO confirmou (o `Chart`, cujo teclado é do Recharts, e o
# `FileInput`, cujas teclas abrem chrome do sistema operacional). O que não pode é o silêncio.
# A DÍVIDA, declarada e com TETO. Em 27/08/2026 eram 29 fichas sem medição; 15 foram medidas na
# mesma sessão (o banco foi de 8 para 26). Estas 14 sobraram, e cada uma tem o motivo de ainda
# não estar medida — todas precisam de montagem que o banco não tem hoje: sobreposição que só
# existe aberta, casca de aplicação inteira, ou motor de terceiro.
#
# A lista é o controle: acrescentar um nome aqui é um diff visível e revisado, e o TETO abaixo
# impede que ela cresça em silêncio. O número só desce. Cartão: G-A11Y-09.
TECLADO_SEM_MEDICAO = {
    "Dialog":              "sobreposição: precisa de banco que a abra e prenda o foco",
    "Drawer":              "idem, e a gaveta ainda tem gesto de arraste a medir",
    "Popover":             "idem — o teclado só existe com o popup aberto",
    "Tooltip":             "idem, e ela abre por foco, o que confunde a foto do probe",
    "HoverCard":           "idem, e abre por ponteiro: precisa de caminho de teclado explícito",
    "Menubar":             "8 teclas declaradas, e o submenu exige um banco com dois níveis",
    "MultiCombobox":       "seleção múltipla muda o teclado; precisa de banco com fichas já escolhidas",
    "AppShell":            "casca de aplicação inteira: o teclado é o do link de pular e o das regiões",
    "CommandPaletteShell": "paleta que abre por atalho global — o banco precisa disparar o atalho",
    "NotificationCenter":  "painel que abre e tem lista dentro; dois níveis de foco",
    "MediaPlayer":         "teclado do media-chrome, motor de terceiro, com estado de reprodução",
    "TableOfContents":     "o teclado é o dos links; medir exige âncoras de verdade na página",
    "ToolbarButton":       "mora dentro do Toolbar, e o banco mede o grupo, não a peça isolada",
    "useToast":            "não é componente: é gancho, e o aviso vive num portal com tempo próprio",
    # As DUAS de 29/08/2026, e o motivo de o teto SUBIR está logo abaixo. As duas são
    # sobreposição, a mesma categoria das cinco primeiras desta lista.
    "CommandPalette":      "paleta: o teclado só existe com ela ABERTA, e o banco precisa abri-la primeiro",
    "ConfirmDialog":       "sobreposição com foco preso — mesmo caso do Dialog, que já está aqui",
}
# O TETO SUBIU UMA VEZ, de 14 para 16, em 29/08/2026, e a regra "só desce" não foi afrouxada:
# ela vale para uma POPULAÇÃO. O merge das duas linhagens juntou um repositório onde este check
# existia com outro onde ele nunca existiu, e trouxe 24 fichas que declaravam teclado sem uma
# medição atrás. Manter o teto em 14 sobre uma população maior não seria rigor — seria uma conta
# que não mede mais o que foi calibrada para medir.
#
# O que se fez com as 24, em vez de subir o teto e seguir: 22 foram MEDIDAS no mesmo dia. O banco
# foi de 26 para 44 seções, e a medição achou o esperado — `BottomNav`, `ToolPermission` e
# `CodeEditor` entregavam teclas que a ficha não declarava, e três cegueiras do PROBE (posição de
# partida no Gallery e no DependencyGraph, rolagem suave no Carousel, protocolo de dois tempos no
# SortableList e no BlockEditor) faziam componente correto sair como sem teclado.
#
# As duas que sobraram são sobreposição, que é a categoria que este banco não alcança hoje — as
# mesmas cinco linhas do topo desta lista. Daí 14 + 2 = 16, e daí em diante só desce outra vez.
_TETO_SEM_MEDICAO = 16      # subiu de 14 em 29/08/2026 (ver acima); daqui em diante só desce

_sem_medicao = []
for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
    try:
        _f = json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        continue
    _teclas = (_f.get("a11y") or {}).get("keyboard") or []
    if not _teclas or (_f.get("a11y") or {}).get("keyboardNote"):
        continue
    _sem_medicao.append(_f.get("name", fp.stem))
    if _f.get("name", fp.stem) not in TECLADO_SEM_MEDICAO:
        errors.append(
            f"{fp.name}: declara {len(_teclas)} tecla(s) em `a11y.keyboard` e não tem "
            f"`a11y.keyboardNote` — teclado sem rastro de medição é memória. Meça em "
            f"`apps/keyboard-probe` + `tests/visual/teclado-motor.spec.ts` e escreva na nota "
            f"quando, com que instrumento, e o que ficou por confirmar. Foi assim que a ficha do "
            f"DataGrid prometeu `role: grid` e quatro setas que não existiam")
if len(_sem_medicao) > _TETO_SEM_MEDICAO:
    errors.append(f"check 30: {len(_sem_medicao)} fichas sem medição de teclado, e o teto é "
                  f"{_TETO_SEM_MEDICAO}. Este número só desce")
# E a lista não pode guardar nome já medido: dívida quitada sai da lista, senão ela vira ficção.
for _n in sorted(set(TECLADO_SEM_MEDICAO) - set(_sem_medicao)):
    errors.append(f"check 30: `{_n}` está em TECLADO_SEM_MEDICAO e já tem medição — tire da "
                  f"lista e baixe o teto. Dívida quitada que fica na lista faz o teto mentir")

# ── 14b. a ficha DECLARA toda prop que a superfície publica ────────────────
# O check 14 compara EIXO (união literal) entre o tipo e a ficha, e é bom nisso. Ele não olha a
# lista `props`, e foi por aí que passou o defeito de 29/08/2026: o merge das duas linhagens
# apagou props inteiras de seis fichas — `activateOnFocus`, `loopFocus` e `orientation` do `Tabs`,
# o `empty` do `Combobox` e do `MultiCombobox` — sem nenhum gate piscar. A perda ficou invisível
# porque uma prop some de DENTRO de uma lista, e a varredura que eu tinha feito comparava nomes
# de CAMPO da ficha, não o conteúdo deles.
#
# A regra é a mesma do check 14, no eixo mais grosso: o que o TypeScript publica, o contrato
# declara. A fonte é a emissão do tsc (`api-surface.json`), não regex sobre o fonte.
#
# A medição que autorizou o gate: quando ele foi escrito havia 82 props publicadas e não
# declaradas em 35 componentes — e CINCO delas não existiam. Eram fragmentos de tipo aninhado
# que o extrator partia ao meio (`y` do `DependencyGraph`, quatro do `bulkActions` do
# `DataGrid`), porque o `>` de uma seta era contado como fechamento e levava a profundidade a
# negativo. Documentá-las teria escrito ficção no contrato publicado. Corrigido o extrator, as 77
# reais foram escritas, e o gate entrou com zero dívida — sem lista de exceção, porque não
# sobrou nenhuma.
#
# Provado contra o defeito: tirando `activateOnFocus` da ficha do `Tabs`, este check reprova.
if API_SURFACE.is_file():
    _surface14b = json.loads(API_SURFACE.read_text(encoding="utf-8"))
    _pub = {c["name"]: [p["name"] for p in c["props"]]
            for m in _surface14b["modules"].values() for c in m["components"]}
    for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
        try:
            _f = json.loads(fp.read_text(encoding="utf-8"))
        except Exception:
            continue
        _publicadas = _pub.get(_f.get("name"))
        if _publicadas is None:
            continue
        # A ficha escreve `value / defaultValue` quando as duas são a mesma ideia, e o nome de
        # prop com hífen aparece entre aspas no TypeScript — as duas formas se normalizam aqui.
        _limpo = lambda n: n.strip().strip('"')
        _declaradas = {_limpo(parte)
                       for p in (_f.get("props") or [])
                       for parte in re.split(r"\s*/\s*", p.get("name", ""))}
        _faltam = sorted(n for n in _publicadas if _limpo(n) not in _declaradas)
        if _faltam:
            errors.append(
                f"{_f['name']}: a superfície publica {len(_faltam)} prop(s) que a ficha não "
                f"declara — {', '.join(_faltam)}. A ficha é o contrato publicado, e prop que só "
                f"existe no TypeScript é capacidade que ninguém acha")

# ── 30b. `a11y.keyboard` é lista de TECLA, não de frase ────────────────────
# Medido em 29/08/2026, ao reconciliar as duas linhagens: o `NavList` trazia TRÊS frases inteiras
# dentro de `a11y.keyboard` — "Tab / Shift+Tab — moves through the rows in document order…" — e o
# `AppShell`, duas. Elas passavam por tudo: o check 30 contava "três teclas declaradas" e cobrava
# a nota, o catálogo desenhava a frase como se fosse um atalho, e o `teclado-motor.spec.ts` nunca
# ia casar uma delas com um `KeyboardEvent.key`, então a ficha jamais poderia ser medida.
#
# Prosa sobre teclado tem lugar: é `a11y.keyboardNote` quando há medição atrás, e `a11y.nota`
# quando é descrição. Dentro da LISTA, o que cabe é o token de `KeyboardEvent.key`, com
# modificadores separados por '+' — que é a forma que o probe pressiona e que o consumidor lê.
#
# Provado contra o defeito: com as três frases de volta no `NavList`, este check reprova.
_TECLA = re.compile(r"^(?:(?:Ctrl|Control|Shift|Alt|Meta|Cmd)\+)*[A-Za-z0-9]+$")
for fp in sorted((root / "packages/contracts/registry").glob("*.json")):
    try:
        _f = json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        continue
    for _k in ((_f.get("a11y") or {}).get("keyboard") or []):
        if not _TECLA.match(_k):
            errors.append(
                f"{fp.name}: `a11y.keyboard` traz {_k[:60]!r}, que não é nome de tecla — a lista "
                f"é de token de KeyboardEvent.key (modificador com '+'). Frase sobre teclado vai "
                f"em `a11y.keyboardNote`, quando há medição atrás, ou em `a11y.nota`. Dentro da "
                f"lista ela conta como tecla declarada e nenhuma medição pode alcançá-la")

# ── 31. contagem publicada é contagem GERADA ───────────────────────────────
# O CLAUDE.md manda não escrever contagem à mão em documento nenhum, e o `STATE.md` já é gerado
# por causa disso. O placar da leitura da matriz não era, e falhou exatamente como previsto: o
# commit que fechou o `G-A11Y-11` mudou uma célula e não mexeu no documento, então
# `25-LEITURA-COMPLETA.md` passou a publicar 128/44 enquanto `MATRIX-ESTADO.json` dizia 129/43.
# Um documento que conta errado não é documento desatualizado; é evidência falsa sobre o estado
# do projeto, e esta auditoria inteira se apoia nesses números.
# Agora o bloco é gerado por `matrix.mjs` e conferido aqui — as duas metades da mesma regra.
_doc_leitura = root / "audit/activity-2/25-LEITURA-COMPLETA.md"
_estado_json = root / "audit/activity-2/MATRIX-ESTADO.json"
if _doc_leitura.exists() and _estado_json.exists():
    _txt = _doc_leitura.read_text(encoding="utf-8")
    _abre = "<!-- PLACAR:INICIO"
    if _abre not in _txt:
        errors.append("check 31: 25-LEITURA-COMPLETA.md perdeu o bloco PLACAR gerado — sem ele a "
                      "contagem volta a ser escrita à mão, que é o defeito que este check existe "
                      "para pegar")
    else:
        _cel = json.loads(_estado_json.read_text(encoding="utf-8")).get("celulas", {})
        _cont = collections.Counter(v.get("estado") for v in _cel.values())
        _bloco = _txt[_txt.index(_abre):_txt.index("<!-- PLACAR:FIM -->")]
        if f"**{len(_cel)} de {len(_cel)} células**" not in _bloco:
            errors.append(f"check 31: o placar publicado não bate com MATRIX-ESTADO.json, que tem "
                          f"{len(_cel)} células. Rode `node audit/activity-2/matrix.mjs`")
        for _e, _n in _cont.items():
            if f"| `{_e}` | **{_n}** |" not in _bloco:
                errors.append(f"check 31: o placar publicado não diz `{_e}` = {_n}, que é o que "
                              f"MATRIX-ESTADO.json tem. Rode `node audit/activity-2/matrix.mjs` — "
                              f"o bloco é GERADO, não se edita à mão")

# ── 37. o alvo NATIVO das fontes não fica para trás do web ─────────────────
# Lote 0 do NATIVE.md (§5.2.1), 02/09/2026. Mesmo desenho do check 36 e pela mesma razão: cobra
# PROPRIEDADES da saída, e não uma reimplementação em Python da leitura da tabela `name` — duas
# implementações da mesma transformação seriam duas verdades, e a segunda erraria sozinha.
#
# O defeito que ele pega é o do achado I1 com outra roupa: um estilo entra no alvo web e ninguém
# regrava o nativo. Aí o app cai na fonte de sistema **num peso só**, que é o tipo de coisa que
# passa despercebida numa tela e destrói a identidade em outra.
_fdir = root / "packages/fonts"
_woff2 = sorted(p.stem for p in (_fdir / "files").glob("*.woff2"))
_ttf = sorted(p.stem for p in (_fdir / "files-native").glob("*.ttf"))
if not _ttf:
    errors.append("check 37: packages/fonts/files-native/ não tem .ttf — o React Native NÃO LÊ "
                  "woff2, e sem eles o IBM Plex não aparece no aparelho (NATIVE.md §5.2.1)")
elif _ttf != _woff2:
    _faltam = sorted(set(_woff2) - set(_ttf))
    _sobram = sorted(set(_ttf) - set(_woff2))
    errors.append("check 37: os dois alvos de fonte divergem — "
                  + (f"sem .ttf: {', '.join(_faltam)}. " if _faltam else "")
                  + (f"sem .woff2: {', '.join(_sobram)}. " if _sobram else "")
                  + "São os MESMOS estilos em dois formatos; um lado a mais é um lado esquecido")
_fnat = _fdir / "dist/fonts.native.js"
if not _fnat.is_file():
    errors.append("check 37: packages/fonts/dist/fonts.native.js não existe — rode "
                  "'node packages/fonts/build-fonts.mjs'")
elif _ttf:
    _txt = _fnat.read_text(encoding="utf-8")
    _refs = re.findall(r'"([^"]+)": require\("\.\./files-native/([^"]+)"\)', _txt)
    if len(_refs) != len(_ttf):
        errors.append(f"check 37: fonts.native.js mapeia {len(_refs)} fontes e há {len(_ttf)} "
                      f".ttf no pacote. Rode 'node packages/fonts/build-fonts.mjs'")
    _ps = [p for p, _ in _refs]
    if len(set(_ps)) != len(_ps):
        errors.append("check 37: fonts.native.js tem nome PostScript repetido — duas fontes "
                      "disputando a mesma chave, e uma some em silêncio")
    for _p, _arq in _refs:
        if not (_fdir / "files-native" / _arq).is_file():
            errors.append(f"check 37: fonts.native.js aponta para files-native/{_arq}, que não "
                          f"existe — o `require` do Metro falharia no app do consumidor")

# ── 38. os ícones do nativo são os MESMOS do sprite da web ─────────────────
# ADR-0038. Uma fonte (`@carbon/icons`), dois alvos — o mesmo desenho da Etapa 2 para os tokens.
# O defeito: o gerador nativo fica para trás, o app pede um ícone que a web tem e ele não existe.
# É `import` de módulo inexistente, ou seja, quebra em runtime no aparelho, não no build daqui.
_idir = root / "packages/native/icons"
_sprite = root / "packages/icons/dist/aurea-icons.svg"
if not _idir.is_dir():
    errors.append("check 38: packages/native/icons/ não existe — rode "
                  "'node packages/native/build-icons-native.mjs'")
elif _sprite.is_file():
    _web = {m.group(1) for m in re.finditer(r'<symbol id="i-([^"]+)"',
                                            _sprite.read_text(encoding="utf-8"))}
    _nat = {p.stem for p in _idir.glob("*.js") if p.stem not in ("index", "props")}
    _so_web, _so_nat = sorted(_web - _nat), sorted(_nat - _web)
    if _so_web or _so_nat:
        errors.append("check 38: os dois alvos de ícone divergem — "
                      + (f"só no sprite: {', '.join(_so_web[:5])} (+{max(0, len(_so_web) - 5)}). "
                         if _so_web else "")
                      + (f"só no nativo: {', '.join(_so_nat[:5])} (+{max(0, len(_so_nat) - 5)}). "
                         if _so_nat else "")
                      + "Rode 'node packages/native/build-icons-native.mjs'")
    # ── conteudo, e nao so' o conjunto de nomes ────────────────────────────────────────────
    # DEFEITO: `<foreignObject>` (placeholder 1x1 do Illustrator, em 10 arquivos do @carbon/icons)
    # atravessar para o react-native-svg, que NAO o desenha; e o `<switch>` que o envolve chegar
    # sem ser desdobrado. Nenhum dos dois quebra o build daqui — o icone sai errado no APARELHO.
    # A ADR-0038 manda o gerador desdobrar o `switch` como o navegador faz, mantendo o `<g>`.
    #
    # A varredura acontece la' em cima, de carona na leitura de nomes privados; aqui e' so' o
    # veredito, porque e' aqui que mora o raciocinio dos icones. Veio do vitest em 11/09/2026 —
    # o comentario do acumulador tem os numeros que motivaram a mudanca.
    #
    # ⚠ A GUARDA DE TOTALIDADE E' OBRIGATORIA e a razao e' historica: a versao vitest deste
    # invariante passava VERDE sobre varredura vazia, porque "nenhum culpado" e "nao olhei nada"
    # sao o mesmo resultado. Aqui o check 38 acima ja' cobra que o conjunto de nomes seja IGUAL
    # ao do sprite (2571), entao uma pasta vazia reprova por lá antes — mas dizer isso por
    # escrito e' mais barato que redescobrir.
    if _icones_maus:
        errors.append(f"check 38: {len(_icones_maus)} icone(s) gerado(s) com foreignObject ou "
                      f"switch — {', '.join(_icones_maus[:5])}"
                      + (f" (+{len(_icones_maus) - 5})" if len(_icones_maus) > 5 else "")
                      + ". O react-native-svg nao desenha `foreignObject`, e o `switch` tem de "
                      + "ser desdobrado mantendo o `<g>` (ADR-0038, clausula 2). Isso sai errado "
                      + "no APARELHO, nao aqui. Rode "
                      + "'node packages/native/build-icons-native.mjs'")
    _sem_tipo = sorted(n for n in _nat if not (_idir / f"{n}.d.ts").is_file())
    if _sem_tipo:
        errors.append(f"check 38: {len(_sem_tipo)} ícone(s) sem .d.ts — {', '.join(_sem_tipo[:5])}. "
                      f"O subpath `./icons/*` declara a condição `types`, e sem o arquivo o "
                      f"consumidor TypeScript reprova")
    _barril = _idir / "index.js"
    if not _barril.is_file():
        errors.append("check 38: packages/native/icons/index.js não existe")
    else:
        _b = _barril.read_text(encoding="utf-8")
        if _b.count("export {default as") != len(_nat):
            errors.append(f"check 38: o barril lista {_b.count('export {default as')} ícones e há "
                          f"{len(_nat)} módulos. Rode o gerador")
        # A cláusula 1 da ADR-0038 é a razão de o pacote existir nesta forma. Se o aviso sumir,
        # alguém vai documentar o barril como forma padrão e devolver 2571 ícones ao app.
        if "NÃO É A FORMA DOCUMENTADA" not in _b:
            errors.append("check 38: o barril perdeu o aviso de que não é a forma documentada. O "
                          "tree-shaking do Metro é experimental — o caminho profundo "
                          "`@aurea-uds/native/icons/<nome>` é o que não depende dele (ADR-0038)")

# ── 39. o pacote nativo não cresce sem a ficha e o teste ───────────────────
# SUBSTITUI o check 39 original, que guardava a fronteira do Lote 0 — *"packages/native/src/ não
# ganha um quarto arquivo"*. Ele cumpriu o que existia para cumprir: reprovou toda vez que foi
# testado, e caiu em 03/09/2026 quando o Victor autorizou o Lote 1. **Tirá-lo era parte do
# trabalho**, e estava escrito na própria mensagem dele.
#
# O que fica no lugar não é mais frouxo — é a mesma pergunta um degrau acima. O risco deixou de
# ser "componente sem autorização" e passou a ser o que o BUILDING.md mede há mais tempo:
# **componente que entra sem contrato e sem teste**. Na web isso é o check 11 (ficha) mais o
# check 16 (teste); aqui o registry ainda não tem ficha nativa, então o gate cobra o que existe:
# todo componente exportado precisa aparecer no teste do alvo nativo.
#
# Provado contra o defeito: um export novo sem menção no teste reprova.
# ⚠ Ele varre TODOS os `tests/unit/native-*.test.tsx`, e não um arquivo fixo. A primeira versão
# apontava só para o `native-lote1`; o Lote 2 (08/09/2026) trouxe arquivo próprio, e um gate
# amarrado a um nome de arquivo teria aprovado dez componentes sem olhar para nenhum deles.
_nsrc = root / "packages/native/src"
# ⚠ O padrão era `native-lote*.test.tsx`, e isso era um BURACO no próprio gate — achado por ele
# mesmo em 09/09/2026, quando o `Chart` (que não é lote nenhum: ele veio pela ADR-0041) ganhou
# `native-chart.test.tsx` e o check reprovou dizendo que `Chart` e `ChartLegend` não tinham teste.
# Tinham; o gate é que não olhava. **Um gate cujo alcance depende da convenção de NOME do arquivo
# fica cego para todo arquivo novo que não a siga** — e o certo é ele reprovar por ausência de
# teste, não por ausência de "lote" no nome.
_ntestes = sorted((root / "tests/unit").glob("native-*.test.tsx"))
if _nsrc.is_dir() and _ntestes:
    _barril = (_nsrc / "index.ts").read_text(encoding="utf-8")
    # Só os VALORES exportados — `export type {…}` é contrato de tipo e não desenha nada.
    #
    # ⚠ DUAS CORREÇÕES DE 08/09/2026, e as duas foram achadas PROVANDO o gate contra o defeito,
    # não lendo o código. O Lote 2 tirou dez componentes do teste, um de cada vez, e o gate
    # continuou verde:
    #
    #  1. `\}\s*from` e não `\} from`. A lista de export do Lote 2 quebra a linha antes do `from`,
    #     e o padrão antigo exigia o espaço único — a linha inteira era invisível para o gate.
    #     **Dez componentes teriam entrado sem controle nenhum.**
    #  2. Cobra TODO nome exportado. A versão antiga filtrava por convenção — inicial maiúscula,
    #     `use…`, `criar…`, `resolver…` — e assim `formatarContagem`, `gravidadeDoEstado`,
    #     `defaultStrings` e `ptBR` saíam do pacote sem nenhum teste os obrigar a existir.
    #     Convenção de nome não é critério; ser público é.
    _exportados = set()
    for _m in re.finditer(r"^export \{([^}]+)\}\s*from", _barril, re.M):
        for _nome in _m.group(1).split(","):
            _nome = _nome.strip().split(" as ")[-1].strip()
            if _nome:
                _exportados.add(_nome)
    # ⚠ E o barril NÃO é a única porta pública. O Lote 4 (08/09/2026) pôs `DatePicker` e
    # `PhotoInput` num caminho próprio — `@aurea-uds/native/system` —, pela mesma razão que os
    # ícones vivem em `./icons/*`: eles arrastam módulo NATIVO, e sair pelo barril traria os dois
    # ao grafo de todo app. **Um gate que só olhasse o `index.ts` deixaria de cobrar exatamente os
    # dois componentes mais arriscados do pacote.**
    #
    # Então a varredura segue o `exports` do `package.json`, que é quem define o que é público.
    # `./icons*` fica de fora porque o **check 38** já o cobre, e são 2571 arquivos gerados.
    _pkg = json.loads((_nsrc.parent / "package.json").read_text(encoding="utf-8"))
    for _chave, _alvo in (_pkg.get("exports") or {}).items():
        if _chave in (".",) or _chave.startswith("./icons"):
            continue
        _js = (_alvo or {}).get("import", "")
        _base = Path(_js).stem
        for _ext in (".tsx", ".ts"):
            _mod = _nsrc / f"{_base}{_ext}"
            if _mod.is_file():
                for _m in re.finditer(r"^export (?:function|const) (\w+)", _mod.read_text(encoding="utf-8"), re.M):
                    _exportados.add(_m.group(1))
                break

    _txt_teste = "\n".join(f.read_text(encoding="utf-8") for f in _ntestes)
    _sem_teste = sorted(n for n in _exportados if n not in _txt_teste)
    if _sem_teste:
        _onde = ", ".join(f.name for f in _ntestes)
        errors.append(f"check 39: {', '.join(_sem_teste)} sai(em) do barril de @aurea-uds/native e "
                      f"não aparece(m) em nenhum de {_onde}. O alvo nativo não tem "
                      f"gate de navegador nem ficha no registry — o teste unitário é o único "
                      f"controle que sobra, e componente sem controle é o achado I1 com outra "
                      f"roupa")

# ── 40. aceite de vulnerabilidade EXPIRA SOZINHO ───────────────────────────
# Ordem do Victor, 02/09/2026, ao aprovar as duas `high` do `image-size`: *"eu só adicionaria uma
# regra: não deixar essa exceção virar dívida esquecida. Assim que sair image-size >= 2.0.3,
# atualizar e remover o aceite."*
#
# Uma intenção não é uma regra — ninguém acorda um dia e vai conferir um `ignoreGhsas` de um mês
# atrás. Então o aceite se cobra sozinho, e a regra é MAIS GERAL do que o caso que a motivou:
#
#   1. **Todo GHSA ignorado precisa de condição de saída registrada aqui.** Acrescentar um ignore
#      sem dizer o que o faz expirar REPROVA. É o que impede a lista de virar um depósito.
#   2. **Quando a condição deixa de valer, o aceite REPROVA** — patch na árvore, ou a dependência
#      que trazia o problema saiu. Nos dois casos a divida acabou e o registro tem de sair junto.
#
# Sem rede: a versão sai do `pnpm-lock.yaml`, que é o que a árvore realmente instala e está
# commitado. O `pnpm audit` fala com o registro; este check fala com o repositório.
_SAIDA = {
    # GHSA -> (pacote, primeira versão CORRIGIDA). Os dois são o mesmo pacote, pelo mesmo caminho:
    # @aurea-uds/native (devDependencies) > react-native > metro > image-size. Medido em
    # 02/09/2026: a última versão PUBLICADA era a 2.0.2, então não havia para onde subir.
    "GHSA-w3rx-r6r6-pgpr": ("image-size", (2, 0, 3)),
    "GHSA-5p2g-fcmc-qvqq": ("image-size", (2, 0, 3)),
}
_ws = root / "pnpm-workspace.yaml"
_lock = root / "pnpm-lock.yaml"
if _ws.is_file() and _lock.is_file():
    _txt_ws = _ws.read_text(encoding="utf-8")
    # Só as linhas de lista sob `ignoreGhsas:`, e nada de comentário — a lista é curta e plana.
    _ign = []
    _dentro = False
    for _l in _txt_ws.splitlines():
        if re.match(r"^\s*ignoreGhsas:\s*$", _l):
            _dentro = True
            continue
        if _dentro:
            _m = re.match(r"^\s*-\s*(GHSA-[\w-]+)\s*$", _l)
            if _m:
                _ign.append(_m.group(1))
            elif _l.strip() and not _l.lstrip().startswith("#"):
                _dentro = False
    _txt_lock = _lock.read_text(encoding="utf-8")
    for _g in _ign:
        if _g not in _SAIDA:
            errors.append(f"check 40: {_g} está em `ignoreGhsas` sem condição de saída registrada "
                          f"no `_SAIDA` do validador. Aceitar uma vulnerabilidade exige dizer o "
                          f"que a faz expirar — senão vira dívida esquecida, que foi exatamente a "
                          f"regra que o Victor pôs junto do primeiro aceite (02/09/2026)")
            continue
        _pkg, _corrigida = _SAIDA[_g]
        _vs = set(re.findall(rf"^  {re.escape(_pkg)}@([0-9]+\.[0-9]+\.[0-9]+)[^:]*:$",
                             _txt_lock, re.M))
        if not _vs:
            errors.append(f"check 40: {_g} segue aceito, mas `{_pkg}` não está mais no "
                          f"pnpm-lock.yaml. A dívida acabou junto com a dependência — tire o "
                          f"aceite de `pnpm-workspace.yaml` e este par do `_SAIDA`")
            continue
        _min = min(tuple(int(x) for x in _v.split(".")) for _v in _vs)
        if _min >= _corrigida:
            errors.append(f"check 40: {_g} segue aceito, mas a árvore já tem "
                          f"`{_pkg}@{'.'.join(map(str, _min))}` e a correção saiu na "
                          f"{'.'.join(map(str, _corrigida))}. **O patch chegou.** Tire o aceite de "
                          f"`pnpm-workspace.yaml` e este par do `_SAIDA` — foi a condição que o "
                          f"Victor pôs ao aprovar")

# ── 41. papel de acessibilidade é papel que o RN TEM ───────────────────────
# Nasceu de um defeito que chegou ao VIDRO em 09/09/2026, e é o pior tipo que este repositório
# produziu até hoje: eu escrevi no `feedback.tsx`, em comentário, *"`alert` e `status` existem os
# dois no `accessibilityRole` do RN — não é adaptação"*, e **nunca medi**. `status` não existe.
# O app do Victor caiu com `Invalid accessibility role value: status` ao abrir o `Alert`.
#
# Por que os 1336 testes passaram por cima: o dublê de `react-native` aceita QUALQUER string em
# `accessibilityRole`. Ele não é o RN — é a nossa ideia do RN, e ela estava errada. Nenhum teste
# unitário pega isto; só o aparelho pega, e o aparelho é o recurso mais caro que temos.
#
# Este gate é a versão barata do aparelho para esta pergunta. Ele não confia em lista escrita à
# mão: LÊ a união `AccessibilityRole` do `ViewAccessibility.d.ts` do react-native instalado e
# cobra toda string literal que o pacote nativo passa em `accessibilityRole`.
#
# ⚠ E ele NÃO cobre o `role` (a lista ARIA), de propósito. `role="dialog"` compila, atravessa o
# Fabric e não mapeia em plataforma nenhuma — é inútil, não é queda; está medido no cabeçalho do
# `overlays.tsx` e no NATIVE.md §7. Um gate que misturasse as duas listas diria "erro" para o que
# só é desperdício, e é assim que gate vira ruído que se aprende a ignorar.
#
# Provado contra o defeito: pondo `accessibilityRole="status"` de volta, ele reprova.
_nrn41 = root / "packages/native/node_modules/react-native"
_nsrc41 = root / "packages/native/src"
_dts41 = _nrn41 / "Libraries/Components/View/ViewAccessibility.d.ts"
# ⚠ QUEM DECIDE A QUEDA É ESTE ARQUIVO, não o `.d.ts`. O `AccessibilityRole.fromValue()`
# (`ReactAccessibilityDelegate.kt:511`) percorre o enum e **lança** `IllegalArgumentException` em
# qualquer string que não esteja nele. O TypeScript é informação; o Kotlin é a sentença.
_kt41 = _nrn41 / "ReactAndroid/src/main/java/com/facebook/react/uimanager/ReactAccessibilityDelegate.kt"
if _nsrc41.is_dir():
    _faltando41 = [f.relative_to(root) for f in (_dts41, _kt41) if not f.is_file()]
    if _faltando41:
        # Sem o react-native instalado não há como MEDIR, e inventar a lista aqui seria repetir
        # exatamente o erro que este check existe para pegar. Então ele diz que não mediu.
        errors.append(f"check 41: não achei {', '.join(f'`{f}`' for f in _faltando41)} — sem o "
                      f"react-native instalado não dá para conferir os papéis de acessibilidade "
                      f"contra a lista real. Rode `pnpm install` antes de confiar neste validador")
    else:
        _m41 = re.search(r"export type AccessibilityRole =\s*(.*?);",
                         _dts41.read_text(encoding="utf-8"), re.S)
        _mk41 = re.search(r"public enum class AccessibilityRole \{(.*?);",
                          _kt41.read_text(encoding="utf-8"), re.S)
        if not _m41 or not _mk41:
            errors.append("check 41: a lista de papéis mudou de forma no react-native e o gate "
                          "não a reconhece mais — no `.d.ts` e/ou no `ReactAccessibilityDelegate."
                          "kt`. **Isso é o gate cego, não o RN errado** — conserte a leitura "
                          "antes de seguir")
        else:
            _ts41 = set(re.findall(r"'([^']+)'", _m41.group(1)))
            _and41 = {_w.strip().lower()
                      for _w in _mk41.group(1).replace("\n", "").split(",") if _w.strip()}
            # 🔴 **AS DUAS LISTAS NÃO SÃO A MESMA, e descobrir isso foi o segundo achado do dia.**
            # Medido em 09/09/2026 no `react-native@0.87.1`: o `.d.ts` tem **40** papéis, o enum do
            # Android tem **39**, e o que sobra no TypeScript é **`tabbar`** — que não existe no
            # enum e portanto **derruba o app exatamente como o `status`**.
            #
            # Um gate que lesse só o `.d.ts` aprovaria `accessibilityRole="tabbar"` e entregaria a
            # mesma tela vermelha. A conta certa é a INTERSEÇÃO: o TypeScript diz o que se pode
            # escrever, o Kotlin diz o que não explode, e só serve o que passa nos dois.
            _validos41 = _ts41 & _and41

            # ⚠ ELE PRECISA IGNORAR COMENTÁRIO, e descobriu isso reprovando o próprio arquivo que
            # o motivou: o `feedback.tsx` DOCUMENTA o defeito escrevendo `accessibilityRole="status"`
            # em prosa, e a primeira versão do gate leu a prosa como código. Um gate que proíbe
            # escrever sobre o erro obriga a apagar a explicação — que é o contrário do que este
            # repositório faz.
            #
            # A varredura é caractere a caractere porque `//` dentro de string (uma URL, por
            # exemplo) não abre comentário, e cortar a linha ali esconderia um papel de verdade
            # que viesse depois.
            def _sem_comentario41(_txt):
                _fora, _i, _n, _bloco, _aspa = [], 0, len(_txt), False, ""
                while _i < _n:
                    _c = _txt[_i]
                    if _bloco:
                        if _txt.startswith("*/", _i):
                            _bloco, _i = False, _i + 2
                            continue
                        _fora.append("\n" if _c == "\n" else " ")
                    elif _aspa:
                        _fora.append(_c)
                        if _c == "\\":
                            _i += 1
                            if _i < _n:
                                _fora.append(_txt[_i])
                        elif _c == _aspa:
                            _aspa = ""
                    elif _txt.startswith("/*", _i):
                        _bloco, _i = True, _i + 2
                        continue
                    elif _txt.startswith("//", _i):
                        while _i < _n and _txt[_i] != "\n":
                            _i += 1
                        continue
                    else:
                        if _c in "\"'`":
                            _aspa = _c
                        _fora.append(_c)
                    _i += 1
                return "".join(_fora)

            # ⚠ E A SEGUNDA VERSÃO DELE ERA CEGA — provado, não suposto. Ela procurava
            # `accessibilityRole="x"`, e **a forma real do defeito não era essa**: o `Alert`
            # escrevia `accessibilityRole={v === "danger" ? "alert" : "status"}`. Com o defeito
            # injetado de volta, o gate passou VERDE. *Escolher a forma que o defeito teve é parte
            # do gate* — a primeira só pegava a forma que eu imaginei depois de já saber a
            # resposta.
            #
            # Agora ele lê o VALOR: literal solto, ou a expressão `{…}` inteira com chaves
            # balanceadas, colhendo toda string dentro dela.
            #
            # ⚠ E isso trouxe um falso positivo que precisou de conserto no mesmo lugar: o
            # `v === "danger"` da própria expressão é uma string, e não é papel nenhum. Literal
            # colado num operador de comparação é OPERANDO, não valor — e sai da conta.
            def _papeis41(_txt):
                _saida, _n = [], len(_txt)
                for _m in re.finditer(r"\baccessibilityRole\b\s*[=:]\s*", _txt):
                    _i = _m.end()
                    if _i >= _n:
                        continue
                    if _txt[_i] in "\"'":
                        _fim = _txt.find(_txt[_i], _i + 1)
                        if _fim > _i:
                            _saida.append((_txt.count("\n", 0, _m.start()) + 1, _txt[_i + 1:_fim]))
                    elif _txt[_i] == "{":
                        _prof, _j = 0, _i
                        while _j < _n:
                            _c = _txt[_j]
                            if _c in "\"'`":
                                _k = _j + 1
                                while _k < _n and _txt[_k] != _c:
                                    _k += 2 if _txt[_k] == "\\" else 1
                                _antes = _txt[max(0, _j - 4):_j].rstrip()
                                _depois = _txt[_k + 1:_k + 5].lstrip()
                                if (_c != "`" and not _antes.endswith(("==", "!="))
                                        and not _depois.startswith(("==", "!="))):
                                    _saida.append((_txt.count("\n", 0, _j) + 1, _txt[_j + 1:_k]))
                                _j = _k
                            elif _c == "{":
                                _prof += 1
                            elif _c == "}":
                                _prof -= 1
                                if _prof == 0:
                                    break
                            _j += 1
                return _saida

            _maus41 = []
            for _f41 in sorted(_nsrc41.rglob("*.tsx")):
                if _f41.parent.name == "icons":
                    continue
                for _n41, _v41 in _papeis41(_sem_comentario41(_f41.read_text(encoding="utf-8"))):
                    if _v41 not in _validos41:
                        _maus41.append(f"{_f41.relative_to(root)}:{_n41} → \"{_v41}\"")
            if _maus41:
                errors.append(f"check 41: {'; '.join(_maus41)} — papel de acessibilidade que "
                              f"NÃO passa nos DOIS lados do react-native instalado: união do "
                              f"TypeScript ({len(_ts41)}) ∩ enum do Android ({len(_and41)}) = "
                              f"{len(_validos41)} papéis servíveis. Isso não é degradação "
                              f"silenciosa: o `fromValue()` do Android LANÇA `Invalid "
                              f"accessibility role value` e a tela cai. ⚠ E olhe se o papel está "
                              f"só na lista do TypeScript — `tabbar` está, e mesmo assim quebra. "
                              f"Se o papel certo não existir, o certo é NÃO passar nenhum — ver o "
                              f"`feedback.tsx`")



# ⚠ ARMADILHA DE MEDIÇÃO, custou dois erros em dez minutos em 17/09/2026, escrevendo o `Tabs`:
# o `ReactAccessibilityDelegate.kt` tem **DOIS** enums de papel, e eles não são o mesmo conjunto.
#   • `Role` (~linha 340) é o da prop `role`, no estilo ARIA — e TEM `TABPANEL`.
#   • `AccessibilityRole` (linha 413) é o da prop `accessibilityRole`, e é o que o `fromValue()`
#     da linha 501 percorre para LANÇAR `Invalid accessibility role value` — e NÃO tem `TABPANEL`.
# Um `grep TABPANEL` no arquivo inteiro acha o primeiro e responde "existe"; a tela cai mesmo
# assim. **Este gate lê o enum CERTO** — é por isso que ele reprovou quando o `grep` disse que
# podia. Conferir à mão sem separar os dois enums dá a resposta errada com confiança.

# ── check 42: o conjunto de pacotes publicáveis é UM, e os três lugares concordam ──────────
# Achado em 10/09/2026, preparando a publicação da `0.7.0`. O `@aurea-uds/native` nasceu no
# Lote 0 e entrou no `check-pack.mjs`, mas o `release.yml` continuou publicando SEIS e a
# ADR-0013 continuou documentando SEIS. Ou seja: o pacote existia, era empacotado, era
# conferido — e não era publicado por nenhum dos dois caminhos escritos.
#
# ⚠ O defeito NÃO é "faltou lembrar". É que a lista de pacotes está escrita à mão em três
# arquivos de linguagens diferentes (Python, JS, YAML) e nada os liga. Cada pacote novo é uma
# chance de os três divergirem, e a divergência é INVISÍVEL até a hora de publicar — que é o
# único momento em que ela não dá para consertar, porque versão publicada é imutável.
#
# A fonte da verdade é o DISCO: `packages/*/package.json` sem `private: true`. Os três lugares
# têm de bater com ela.
_pub42 = sorted(
    d.name for d in (root / "packages").iterdir()
    if (d / "package.json").is_file()
    and not json.loads((d / "package.json").read_text(encoding="utf8")).get("private", False)
)

_cp42 = root / "scripts/check-pack.mjs"
if not _cp42.is_file():
    errors.append("check 42: falta `scripts/check-pack.mjs`")
else:
    _m42 = re.search(r"const PACOTES = \[([^\]]*)\]", _cp42.read_text(encoding="utf8"))
    if not _m42:
        errors.append("check 42: não achei `const PACOTES = [...]` no check-pack.mjs — o gate "
                      "depende dessa forma, e um gate que depende de forma de nome fica cego "
                      "quando ela muda (foi o que aconteceu com os checks 39 e 41)")
    else:
        _lista42 = sorted(re.findall(r'"([^"]+)"', _m42.group(1)))
        if _lista42 != _pub42:
            errors.append(f"check 42: `scripts/check-pack.mjs` empacota {_lista42} e o disco tem "
                          f"{_pub42} publicáveis — o que não está no gate não é conferido antes "
                          f"de publicar, e publicar é definitivo")

_rel42 = root / ".github/workflows/release.yml"
if _rel42.is_file():
    _txt42 = _rel42.read_text(encoding="utf8")
    _loops42 = re.findall(r"for p in ([a-z0-9 _-]+); do", _txt42)
    if not _loops42:
        errors.append("check 42: não achei nenhum `for p in ...; do` no release.yml — se a forma "
                      "do workflow mudou, este gate precisa mudar junto em vez de ficar calado")
    for _i42, _loop42 in enumerate(_loops42):
        _nomes42 = sorted(_loop42.split())
        if _nomes42 != _pub42:
            errors.append(f"check 42: o laço {_i42 + 1} do `release.yml` percorre {_nomes42} e o "
                          f"disco tem {_pub42} publicáveis. Pacote de fora do laço NÃO é "
                          f"publicado pela CI e ninguém percebe — o workflow passa verde")
    # A armadilha medida em 10/09/2026: `npm publish` NÃO traduz o protocolo `workspace:`, e o
    # `native` é o primeiro pacote desta casa com dependência interna. Medido nos dois:
    #     npm  pack -> "@aurea-uds/tokens": "workspace:^"   <- não instala em ninguém
    #     pnpm pack -> "@aurea-uds/tokens": "^0.7.0"        <- correto
    # O `check-pack.mjs` já cobra o TARBALL desde 03/09; o que faltava era cobrar o COMANDO.
    _temws42 = any(
        str(v).startswith("workspace:")
        for _d42 in _pub42
        for _campo42 in ("dependencies", "peerDependencies", "optionalDependencies")
        for v in json.loads((root / "packages" / _d42 / "package.json")
                            .read_text(encoding="utf8")).get(_campo42, {}).values()
    )
    if _temws42 and re.search(r"cd \"?packages/\$p\"?\s*&&\s*npm publish\s*\)", _txt42):
        errors.append("check 42: o `release.yml` publica com `npm publish` de dentro do "
                      "diretório do pacote, e algum pacote tem dependência `workspace:` — o npm "
                      "NÃO traduz esse protocolo e o tarball sai com `workspace:^` literal, que "
                      "quebra a instalação de TODO consumidor. Empacote com `pnpm pack` e "
                      "publique o tarball (`npm publish <arquivo>.tgz`): o pnpm traduz, e o npm "
                      "continua sendo quem envia — 2FA local e OIDC na CI, sem trocar mecanismo")


# ── check 43: peça marcada como ACESSÍVEL não pode ter coisa tocável dentro ────────────────
# Achado em 16/09/2026 pelo consumidor, no `Combobox`: o botão de limpar morava DENTRO do
# `Pressable` do gatilho. Botão dentro de botão.
#
# 🔴 **E ESTE DEFEITO SÓ QUEBRA NO iPHONE — é por isso que ele precisa de gate e não de teste
# em aparelho.** Nenhum aparelho deste projeto rodou iOS, em lote nenhum; o smoke rodou oito
# perguntas no Android em 12/09/2026 e sete passaram COM o defeito dentro, porque no Android
# ele não existe. **Um alvo só nunca responderia esta pergunta.**
#
# A razão está escrita nas duas docs, lidas na fonte em 17/09/2026:
#   React Native, sobre a prop `accessible`:
#       "VoiceOver disallowing nested accessibility elements"
#   Apple, sobre o que é uma peça marcada assim:
#       "An individual view does not contain any other views that need to be accessible"
#       "you need to make sure that the container view itself is not accessible"
#
# E o fonte do RN diz por que o Android não mostra:
#   iOS      RCTViewComponentView.mm:398   accessible -> isAccessibilityElement (vira FOLHA)
#   Android  ReactViewManager.kt:96        accessible -> isFocusable  (filhos continuam na árvore)
#
# ⚠ **`Pressable` conta, e é a metade que pega mais gente:** ele nasce `accessible: true`
# (`Pressable.js:274`), então não precisa da palavra escrita para estar marcado.
#
# ⚠ **O gate se paga no dia em que nasce:** rodado pela primeira vez, achou MAIS DOIS além do
# que o consumidor tinha reportado — o "X" de fechar o `Alert` (publicado desde 08/09/2026, por
# quatro versões) e o `Chart`, onde a moldura apagava as faixas que carregam os VALORES, ou
# seja, apagava o gráfico inteiro para quem não enxerga.
_ALVO43 = root / "packages/native/src"
# `Card` entra porque o `KPI` é um `Card` marcado `accessible` (display.tsx) — a forma do
# defeito não depende do nome da tag, e listar só `View` deixaria essa porta aberta.
_TAGS43 = ("Pressable", "View", "Card")
_TOCAVEL43 = re.compile(r"<(Pressable|IconButton|Button|Touchable\w*)\b")
# `accessible` que NÃO seja `accessible={false}`. A fronteira de palavra é obrigatória: sem ela
# `accessibilityLabel` casaria, e um gate com falso positivo é um gate que alguém desliga.
_ACESSIVEL43 = re.compile(r"\baccessible\b(?!\s*=\s*\{\s*false\s*\})")


def _blocos43(txt, tag):
    """(abertura, corpo, linha) de cada <tag ...>…</tag>, pulando as auto-fechadas.

    Escrito à mão porque o defeito mora na ANINHAGEM, e expressão regular não conta
    profundidade. A primeira versão desta varredura usava `s.find('</tag>')` direto e mentia:
    com dois irmãos `<View>…</View><View>…</View>` ela via o primeiro engolindo o segundo.
    """
    saida = []
    for m in re.finditer(r"<" + tag + r"\b", txt):
        i = m.start()
        # o fim da tag de ABERTURA: o primeiro `>` fora de chaves (props têm `{}` dentro)
        j, prof = i, 0
        while j < len(txt):
            c = txt[j]
            if c == "{":
                prof += 1
            elif c == "}":
                prof -= 1
            elif c == ">" and prof == 0:
                break
            j += 1
        if j >= len(txt) or txt[j - 1] == "/":
            continue                                   # auto-fechada: não tem corpo
        k, n = j + 1, 1
        while k < len(txt) and n > 0:
            a = txt.find("<" + tag, k)
            b = txt.find("</" + tag + ">", k)
            if b < 0:
                break
            if 0 <= a < b:
                e = txt.find(">", a)
                if e > 0 and txt[e - 1] != "/":
                    n += 1
                k = a + 1
            else:
                n -= 1
                k = b + 1
        saida.append((txt[i:j + 1], txt[j + 1:k - len(tag) - 3], txt[:i].count("\n") + 1))
    return saida


if _ALVO43.is_dir():
    _maus43 = []
    for _f43 in sorted(_ALVO43.glob("*.tsx")):
        _txt43 = _f43.read_text(encoding="utf8")
        for _tag43 in _TAGS43:
            for _ab43, _corpo43, _lin43 in _blocos43(_txt43, _tag43):
                if _tag43 == "Pressable":
                    _marcado43 = "accessible={false}" not in _ab43.replace(" ", "")
                else:
                    _marcado43 = _ACESSIVEL43.search(_ab43) is not None
                if not _marcado43:
                    continue
                _dentro43 = sorted({m.group(1) for m in _TOCAVEL43.finditer(_corpo43)})
                if _dentro43:
                    _maus43.append(
                        f"{_f43.relative_to(root)}:{_lin43} — <{_tag43}> marcado como elemento "
                        f"de acessibilidade contém {', '.join('`' + d + '`' for d in _dentro43)}"
                    )
    if _maus43:
        errors.append(
            "check 43: " + "; ".join(_maus43) + ". No iOS a peça de cima vira FOLHA "
            "(`isAccessibilityElement`) e o que está dentro DESAPARECE para o VoiceOver — a doc "
            "do React Native chama isso de \"VoiceOver disallowing nested accessibility "
            "elements\". No Android não aparece, então nenhum teste em aparelho daqui pegaria. "
            "Conserto: o recipiente vira só moldura, e a peça tocável vira IRMÃ do grupo que "
            "é lido — como no `Combobox` (`busca.tsx`), no `Alert` e no `Chart`"
        )


# ── 44. o foco é UMA linha, e ela sai dos tokens ─────────────────────────────────────────────
# B-09, 24/09/2026. O contrato de foco existe desde a Fase 5 (`geometry.spec.ts`: uma cor, 2px,
# linha de contorno, afastamento +2px ou -2px), mas o teste de navegador mede SEIS peças. As que
# ficavam fora da amostra fugiam em silêncio: a `.table-region` e a `DataGrid` tinham um halo de
# `--focus` a 38% no lugar da linha, o player tinha outra cor e 3px de afastamento, a alça de
# redimensionar 1px. Este check lê TODA regra de foco do core, sem amostra.
#
# A regra: dentro de `:focus-visible`/`:focus-within`, a linha é `var(--focus-width) solid` na cor
# `--focus-strong` (ou `CanvasText`, no modo de alto contraste do sistema); o afastamento é
# `var(--focus-offset)` ou, dentro de contêiner recortado, `calc(-1 * var(--focus-width))`; e
# sombra não faz papel de linha. Cor diferente por CONTEXTO se faz redefinindo `--focus-strong`
# no contêiner (é o que o `.media-player` faz), nunca com uma regra de foco à parte.
_CSS44 = root / "packages/core/src/aurea.css"
# `outline:none` numa regra de foco só onde o anel MUDOU de lugar, com o motivo escrito.
_SEM_LINHA44 = {
    ".input-group>.input:focus-visible": "o anel é da moldura (`.input-group:focus-within`)",
    ".input-group>.select:focus-visible": "o anel é da moldura (`.input-group:focus-within`)",
    ".input-group>.textarea:focus-visible": "o anel é da moldura (`.input-group:focus-within`)",
    ".combobox-chip-input:focus-visible": "o anel é da moldura (`.combobox-multi:focus-within`)",
}
_LINHA44 = re.compile(r"^var\(--focus-width\)\s+solid\s+(var\(--focus-strong\)|CanvasText)$")
_OFFSET44 = {"var(--focus-offset)", "calc(-1 * var(--focus-width))"}
if _CSS44.is_file():
    _css44 = re.sub(r"/\*.*?\*/", "", _CSS44.read_text(encoding="utf8"), flags=re.S)
    _maus44 = []
    for _m44 in re.finditer(r"([^{}]+)\{([^{}]*)\}", _css44):
        _sel44 = " ".join(_m44.group(1).split())
        if ":focus-visible" not in _sel44 and ":focus-within" not in _sel44:
            continue
        _decl44 = {}
        for _d44 in _m44.group(2).split(";"):
            if ":" in _d44:
                _k44, _v44 = _d44.split(":", 1)
                _decl44[_k44.strip()] = " ".join(_v44.replace("!important", "").split())
        _partes44 = [p.strip() for p in _sel44.split(",")]
        if "outline" in _decl44:
            _v44 = _decl44["outline"]
            if _v44 == "none":
                _sem44 = [p for p in _partes44 if p.replace(" ", "") not in _SEM_LINHA44]
                if _sem44:
                    _maus44.append(f"`{_sel44}` apaga a linha de foco (`outline:none`) sem motivo registrado")
            elif not _LINHA44.match(_v44):
                _maus44.append(f"`{_sel44}` desenha o foco como `outline:{_v44}`")
        if "outline-offset" in _decl44 and _decl44["outline-offset"] not in _OFFSET44:
            _maus44.append(f"`{_sel44}` afasta o foco com `outline-offset:{_decl44['outline-offset']}`")
        if "box-shadow" in _decl44 and _decl44["box-shadow"] != "none":
            _maus44.append(f"`{_sel44}` usa sombra no lugar da linha de foco")
    if _maus44:
        errors.append(
            "check 44: " + "; ".join(_maus44) + ". O foco é uma linha só: "
            "`outline:var(--focus-width) solid var(--focus-strong)` com `outline-offset:var(--focus-offset)` "
            "(ou `calc(-1 * var(--focus-width))` dentro de contêiner recortado). Cor por contexto "
            "se faz redefinindo `--focus-strong` no contêiner, como o `.media-player`"
        )

if SEM_LISTA and not PRIVATE:
    print("⚠ check 1 PULADO: AUREA_SEM_LISTA=1 e nenhuma lista de nomes privados.")
print("Aurea validation:", "OK" if not errors else "FAILED")
for e in errors:
    print("-", e)
sys.exit(1 if errors else 0)
