# Aurea — corta as fontes da web a partir dos arquivos OFICIAIS (ADR-0077, 22/10/2026).
#
# Os .woff2 de `files/` não se editam à mão: saem deste script, e qualquer um refaz e confere o
# resultado pelo resumo (sha256) que ele imprime. As fontes originais NÃO moram no repositório —
# o script recebe o caminho de cada uma:
#
#   python packages/fonts/cortar-fontes.py <InterVariable.woff2> <InterVariable-Italic.woff2> <Sora[wght].ttf>
#
# De onde vem cada uma:
#   - Inter 4.1 — https://github.com/rsms/inter/releases/tag/v4.1, `Inter-4.1.zip`, pasta `web/`.
#     A do autor, e não a do Google Fonts: a do Google tira recursos (medido em 22/10/2026).
#   - Sora — https://github.com/google/fonts, `ofl/sora/Sora[wght].ttf`, commit a926665019d3 (o
#     projeto de origem, `sora-xor/sora-font`, não tem versão marcada).
#   - IBM Plex Mono NÃO passa por aqui: a licença dela reserva o nome "Plex", e arquivo modificado não
#     pode levar o nome. Os .woff2 dela são os da própria IBM, sem nenhuma mudança (`@ibm/plex-mono`
#     2.5.0, `fonts/split/woff2/*-Latin1.woff2`) — o README do pacote diz como copiá-los.
#
# O CORTE: os mesmos caracteres que a web servia desde a ADR-0053 (o recorte `latin`), lidos do
# arquivo da fonte anterior que este script recebeu na primeira vez e congelados na lista abaixo — a
# troca de fonte não pode tirar letra de ninguém. A fonte continua VARIÁVEL (um arquivo cobre todos
# os pesos; na Inter, também o tamanho óptico), e todos os recursos de desenho ficam (`tnum`, `kern`,
# `case`…): só sai o que é de outros alfabetos.
import hashlib
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

# Os 218 caracteres do recorte latino (lidos de `atkinson-hyperlegible-next-400-normal.woff2`).
CARACTERES = [
    *range(0x20, 0x7F), *range(0xA0, 0xAD), *range(0xAE, 0xB5), *range(0xB6, 0x100), 0x131,
    *range(0x152, 0x154), 0x2C6, 0x2DA, 0x2DC, 0x304, 0x308, 0x2009, *range(0x2013, 0x2015),
    *range(0x2018, 0x201B), *range(0x201C, 0x201F), *range(0x2020, 0x2023), 0x2026, 0x2030,
    *range(0x2039, 0x203B), 0x2044, 0x20AC, 0x2122, 0x2212, 0x2215,
]

SAIDAS = [
    ("inter", "inter-variable-normal.woff2"),
    ("inter-italico", "inter-variable-italic.woff2"),
    ("sora", "sora-variable-normal.woff2"),
]


def cortar(origem: Path, destino: Path) -> None:
    opcoes = subset.Options()
    opcoes.flavor = "woff2"
    opcoes.layout_features = ["*"]      # todos os recursos de desenho
    opcoes.name_IDs = ["*"]             # os nomes da fonte, inteiros (o crédito mora neles)
    opcoes.name_languages = ["*"]
    opcoes.notdef_outline = True
    opcoes.glyph_names = False
    opcoes.hinting = True
    fonte = subset.load_font(str(origem), opcoes)
    cortador = subset.Subsetter(options=opcoes)
    cortador.populate(unicodes=CARACTERES)
    cortador.subset(fonte)
    subset.save_font(fonte, str(destino), opcoes)


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit("uso: python packages/fonts/cortar-fontes.py <InterVariable.woff2> <InterVariable-Italic.woff2> <Sora[wght].ttf>")
    pasta = Path(__file__).resolve().parent / "files"
    for (nome, saida), origem in zip(SAIDAS, sys.argv[1:]):
        destino = pasta / saida
        cortar(Path(origem), destino)
        f = TTFont(destino)
        eixos = " ".join(f"{a.axisTag} {a.minValue:g}-{a.maxValue:g}" for a in f["fvar"].axes)
        resumo = hashlib.sha256(destino.read_bytes()).hexdigest()[:16]
        print(f"{saida}: {destino.stat().st_size} bytes, {len(f.getBestCmap())} caracteres, eixos {eixos}, sha256 {resumo}")


if __name__ == "__main__":
    main()
