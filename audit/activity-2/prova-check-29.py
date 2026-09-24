"""A PROVA do check 29 contra os defeitos que ele diz pegar.

Um gate que só foi visto passando não foi provado — é a terceira das três regras que a auditoria
pagou caro para aprender (`CLAUDE.md`): *"mudança de comportamento vem com o controle que pega a
regressão, e o controle tem de ser provado contra o defeito, não só passar no estado atual"*.

Este script extrai o bloco do check 29 de `scripts/validate.py` — o código de verdade, não uma
cópia — e o roda contra pares `MATRIX-ESTADO.json` / `MATRIX.json` corrompidos de propósito, um
defeito por vez. Cada caso afirma o que o check TEM de dizer.

O primeiro caso é o controle negativo: os arquivos reais, intactos, sem erro nenhum. Sem ele o
script passaria com um check que reprova tudo.

    python audit/activity-2/prova-check-29.py
"""
import json
import pathlib
import shutil
import sys
import tempfile

RAIZ = pathlib.Path(__file__).resolve().parents[2]
REAL = RAIZ / "audit/activity-2"

fonte = (RAIZ / "scripts/validate.py").read_text(encoding="utf-8")
# A fronteira do bloco é o INÍCIO DO CHECK SEGUINTE, não o `print` final. Medido em 27/08/2026:
# quando o check 30 entrou, o corte no `print` passou a arrastá-lo junto, e o check 30 rodava
# contra um `root` temporário sem registry — todos os nomes da lista de dívida pareciam "já
# medidos" e o CONTROLE NEGATIVO reprovava. A prova falhou alto em vez de passar errado, que é o
# que se quer dela; mas a fronteira tinha de acompanhar.
try:
    ini = fonte.index("# ── 29. o estado de LEITURA")
    fim = fonte.index("# ── 30. ", ini)
except ValueError:
    sys.exit("não achei o bloco do check 29 em scripts/validate.py — ele foi renomeado, movido, "
             "ou o check 30 deixou de vir logo depois dele. Esta prova precisa acompanhar em vez "
             "de sumir em silêncio")
BLOCO = compile(fonte[ini:fim], "check29", "exec")


def rodar(mexer_estado=None, mexer_matriz=None):
    """Roda o check contra uma cópia dos arquivos reais, com os defeitos aplicados."""
    tmp = pathlib.Path(tempfile.mkdtemp())
    (tmp / "audit/activity-2").mkdir(parents=True)
    est = json.loads((REAL / "MATRIX-ESTADO.json").read_text(encoding="utf-8"))
    mat = json.loads((REAL / "MATRIX.json").read_text(encoding="utf-8"))
    if mexer_estado:
        mexer_estado(est)
    if mexer_matriz:
        mexer_matriz(mat)
    (tmp / "audit/activity-2/MATRIX-ESTADO.json").write_text(json.dumps(est), encoding="utf-8")
    (tmp / "audit/activity-2/MATRIX.json").write_text(json.dumps(mat), encoding="utf-8")
    ns = {"root": tmp, "errors": [], "json": json}
    exec(BLOCO, ns)
    shutil.rmtree(tmp)
    return ns["errors"]


def _veredito(m, capacidade, eixo, valor):
    for linha in m["linhas"]:
        if linha["capacidade"] == capacidade:
            linha["comparacao"][eixo]["veredito"] = valor


CASOS = [
    ("controle negativo: os arquivos reais, intactos", None, None, False),
    ("ÓRFÃ: estado à mão para célula que a matriz não produz",
     lambda e: e["celulas"].update({"nao-existe·nao-existe":
                                    {"estado": "CONFIRMED", "porque": "x", "em": "2026-08-27"}}),
     None, True),
    ("FORA DE SINCRONIA: o estado foi editado e matrix.mjs não rodou",
     lambda e: e["celulas"]["input·orientacao"].update({"estado": "AUREA_SUPERA"}), None, True),
    ("DESATUALIZADA: o veredito de máquina mudou por baixo da leitura",
     None, lambda m: _veredito(m, "input", "orientacao", "AUREA_COBRE"), True),
    ("VOCABULÁRIO: estado fora dos oito valores fechados",
     lambda e: e["celulas"]["input·orientacao"].update({"estado": "TALVEZ"}), None, True),
    ("SEM RAZÃO: leitura sem `porque`",
     lambda e: e["celulas"]["input·orientacao"].pop("porque"), None, True),
    ("MATRIZ VELHA: célula diz vir do arquivo e não está mais lá",
     lambda e: e["celulas"].pop("drawer·aparencia"), None, True),
]

falhou = False
for nome, me, mm, espera_erro in CASOS:
    errs = rodar(me, mm)
    ok = bool(errs) == espera_erro
    falhou |= not ok
    print(f"{'OK    ' if ok else 'FALHOU'}  {nome}")
    if errs:
        print(f"          → {errs[0][:160]}")
    elif espera_erro:
        print("          → o check NÃO reclamou, e tinha de reclamar")

print("\nPROVA DO CHECK 29:", "OK" if not falhou else "FALHOU")
sys.exit(1 if falhou else 0)
