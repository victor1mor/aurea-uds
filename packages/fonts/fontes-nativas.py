# Aurea — os .ttf do NATIVO (ADR-0077, 0.40.1), a partir dos arquivos OFICIAIS.
#
# O React Native não lê woff2 nem fonte variável no Android: cada peso é um .ttf estático. Os arquivos de
# `files-native/` não se editam à mão — saem deste script, e qualquer um refaz e confere pelo resumo (sha256) que ele
# imprime. As fontes originais NÃO moram no repositório; o script recebe o caminho de cada uma:
#
#   python packages/fonts/fontes-nativas.py <Inter-4.1.zip> <ibm-plex-mono.zip> <Sora[wght].ttf>
#
# De onde vem cada uma, e o que se faz com ela:
#   - Inter 4.1 — https://github.com/rsms/inter/releases/tag/v4.1, `Inter-4.1.zip`: os .ttf ESTÁTICOS do próprio autor
#     (`extras/ttf/Inter-*.ttf`), SEM mudança. São os de texto (o tamanho óptico 14): no aparelho não há o ajuste
#     automático do navegador, e o título é a Sora.
#   - IBM Plex Mono — https://github.com/IBM/plex/releases/tag/%40ibm%2Fplex-mono%402.5.0, `ibm-plex-mono.zip`: os .ttf da
#     IBM (`fonts/complete/ttf`), SEM mudança — a licença reserva o nome "Plex", e arquivo modificado não pode levá-lo.
#     (O pacote npm `@ibm/plex-mono` não traz .ttf, só woff e woff2.)
#   - Sora — a MESMA fonte variável da web (`google/fonts`, `ofl/sora/Sora[wght].ttf`, commit a926665019d3), instanciada
#     por peso com o `fontTools`: o desenho do nativo é o da web, número por número. A OFL dela não reserva nome. O
#     projeto de origem (`sora-xor/sora-font`) tem .ttf estáticos, mas de outra versão do desenho.
#
# Os .ttf vão COMPLETOS (todos os alfabetos que o autor desenhou), como iam os da Atkinson: no aparelho a fonte é asset
# local do app, não transferência por página, e o texto do usuário pode vir em qualquer alfabeto.
import hashlib
import sys
import zipfile
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

INTER = [("Regular", "inter-400-normal"), ("Italic", "inter-400-italic"), ("Medium", "inter-500-normal"),
         ("SemiBold", "inter-600-normal"), ("Bold", "inter-700-normal"), ("ExtraBold", "inter-800-normal")]
PLEX = [("Regular", "ibm-plex-mono-400-normal"), ("Medium", "ibm-plex-mono-500-normal"), ("SemiBold", "ibm-plex-mono-600-normal")]
SORA = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold"}


def sora(origem: Path, peso: int, estilo: str) -> TTFont:
    """Um peso da Sora variável. A tabela STAT dela não tem o 500 com nome, então o `instancer` não renomeia sozinho:
    os nomes vão aqui, no padrão dos arquivos da IBM e da Inter — a família RIBBI ("Sora" no 400 e no 700, "Sora
    <estilo>" nos outros), o estilo, o nome completo, o PostScript e a família tipográfica (16 e 17)."""
    fonte = instancer.instantiateVariableFont(TTFont(origem), {"wght": peso})
    ribbi = estilo in ("Regular", "Bold")
    nomes = {1: "Sora" if ribbi else f"Sora {estilo}", 2: estilo if ribbi else "Regular", 4: f"Sora {estilo}",
             6: f"Sora-{estilo}", 16: "Sora", 17: estilo}
    for nid, valor in nomes.items():
        fonte["name"].setName(valor, nid, 3, 1, 0x409)
        fonte["name"].setName(valor, nid, 1, 0, 0)
    fonte["name"].removeNames(nameID=25)  # o prefixo de nome de variação: não é mais variável
    fonte["OS/2"].usWeightClass = peso
    fonte["OS/2"].fsSelection = (fonte["OS/2"].fsSelection & ~0b1100001) | (
        0b100000 if estilo == "Bold" else 0b1000000 if estilo == "Regular" else 0)
    fonte["head"].macStyle = 1 if estilo == "Bold" else 0
    # A data da fonte original, e não a de hoje: sem isto o `fontTools` grava a hora em que salvou, e o resumo muda a
    # cada rodada — ninguém conseguiria conferir o arquivo refazendo-o.
    fonte["head"].modified = TTFont(origem)["head"].modified
    fonte.recalcTimestamp = False
    return fonte


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit("uso: python packages/fonts/fontes-nativas.py <Inter-4.1.zip> <ibm-plex-mono.zip> <Sora[wght].ttf>")
    pasta = Path(__file__).resolve().parent / "files-native"
    pasta.mkdir(exist_ok=True)
    inter, plex = zipfile.ZipFile(sys.argv[1]), zipfile.ZipFile(sys.argv[2])
    for estilo, saida in INTER:
        (pasta / f"{saida}.ttf").write_bytes(inter.read(f"extras/ttf/Inter-{estilo}.ttf"))
    for estilo, saida in PLEX:
        (pasta / f"{saida}.ttf").write_bytes(plex.read(f"ibm-plex-mono/fonts/complete/ttf/IBMPlexMono-{estilo}.ttf"))
    for peso, estilo in SORA.items():
        sora(Path(sys.argv[3]), peso, estilo).save(pasta / f"sora-{peso}-normal.ttf")
    for f in sorted(pasta.glob("*.ttf")):
        t = TTFont(f)
        print(f"{f.name}: {t['name'].getDebugName(6)}, peso {t['OS/2'].usWeightClass}, "
              f"sha256 {hashlib.sha256(f.read_bytes()).hexdigest()[:16]}")


if __name__ == "__main__":
    main()
