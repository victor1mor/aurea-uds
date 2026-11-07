# A LOGO DA AUREA (06/11/2026): gera `apps/catalog/assets/logo/` a partir das peças decididas pelo Victor.
# - A estrela 2E (21/10/2026), as duas pequenas (sem brilho até 24, com brilho de 32 para cima) e as estrelinhas E2 da
#   festa: copiadas dos arquivos escolhidos (`--origem`, a pasta `escolhidos` do Victor, fora do repositório).
# - O NOME em Sora ExtraBold (a "B", 06/11/2026): tirado da própria fonte (`packages/fonts/files-native/sora-800-normal.ttf`),
#   com o espaçamento entre pares dela (GPOS) — o GitHub não carrega fonte dentro de imagem, então o nome vai em desenho.
# - O README: a festa E2 com o nome, numa versão para o fundo claro e outra para o escuro.
# - A estrela de quatro pétalas, a marca de antes (o Victor, 13/10/2026: "não a perca"): guardada, fora de uso.
# Rodar da raiz: python scripts/gerar-logo.py --origem "<pasta escolhidos>"
import argparse, os, shutil
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "apps", "catalog", "assets", "logo")
FONTE = os.path.join(RAIZ, "packages", "fonts", "files-native", "sora-800-normal.ttf")


def kerning(font):
    pares, classes = {}, []
    if "GPOS" not in font:
        return lambda a, b: 0
    for lk in font["GPOS"].table.LookupList.Lookup:
        for st in lk.SubTable:
            if lk.LookupType == 9:
                st = st.ExtSubTable
            if getattr(st, "LookupType", lk.LookupType) != 2:
                continue
            if st.Format == 1:
                for g1, ps in zip(st.Coverage.glyphs, st.PairSet):
                    for pr in ps.PairValueRecord:
                        pares.setdefault((g1, pr.SecondGlyph), getattr(pr.Value1, "XAdvance", 0) or 0)
            elif st.Format == 2:
                classes.append(st)

    def kern(a, b):
        if (a, b) in pares:
            return pares[(a, b)]
        for st in classes:
            if a in st.Coverage.glyphs:
                v = getattr(st.Class1Record[st.ClassDef1.classDefs.get(a, 0)].Class2Record[st.ClassDef2.classDefs.get(b, 0)].Value1, "XAdvance", 0) or 0
                if v:
                    return v
        return 0
    return kern


def nome(texto="Aurea"):
    f = TTFont(FONTE)
    gs, cmap, hmtx, kern = f.getGlyphSet(), f.getBestCmap(), f["hmtx"], kerning(f)
    x, partes, xmin, xmax, ymin, ymax = 0, [], 1e9, -1e9, 1e9, -1e9
    glifos = [cmap[ord(c)] for c in texto]
    for i, g in enumerate(glifos):
        pen, bp = SVGPathPen(gs), BoundsPen(gs)
        gs[g].draw(pen); gs[g].draw(bp)
        if bp.bounds:
            xmin, xmax = min(xmin, x + bp.bounds[0]), max(xmax, x + bp.bounds[2])
            ymin, ymax = min(ymin, bp.bounds[1]), max(ymax, bp.bounds[3])
        partes.append(f'<path transform="translate({x} 0)" d="{pen.getCommands()}"/>')
        x += hmtx[g][0] + (kern(g, glifos[i + 1]) if i + 1 < len(glifos) else 0)
    w, h = xmax - xmin, ymax - ymin
    return f'<g transform="translate({-xmin} {ymax}) scale(1 -1)">{"".join(partes)}</g>', w, h


def corpo_svg(caminho):
    t = open(caminho, encoding="utf-8").read()
    i, j = t.index(">", t.index("<svg")) + 1, t.rindex("</svg>")
    vb = t[t.index('viewBox="') + 9:].split('"', 1)[0]
    return t[i:j], [float(v) for v in vb.split()]


def principal():
    ap = argparse.ArgumentParser()
    ap.add_argument("--origem", required=True)
    a = ap.parse_args()
    os.makedirs(SAIDA, exist_ok=True)
    for f in ("estrela-2e.svg", "estrela-2e-pequena-de-32.svg", "estrela-2e-pequena-ate-24.svg", "festa-e2.svg"):
        shutil.copyfile(os.path.join(a.origem, f), os.path.join(SAIDA, f))
    g, w, h = nome()
    open(os.path.join(SAIDA, "nome-aurea.svg"), "w", encoding="utf-8", newline="\n").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" fill="currentColor" role="img" aria-label="Aurea">{g}</svg>\n')
    # o README: a festa à esquerda, o nome à direita, centrado na altura da estrela
    festa, (fx, fy, fw, fh) = corpo_svg(os.path.join(SAIDA, "festa-e2.svg"))
    alt_nome = fh * 0.42
    esc = alt_nome / h
    vao = fw * 0.06
    total_w = fw + vao + w * esc
    for tema, cor in (("claro", "#09090b"), ("escuro", "#fafafa")):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w:.1f} {fh:.1f}" role="img" aria-label="Aurea">'
               f'<g transform="translate({-fx} {-fy})">{festa}</g>'
               f'<g transform="translate({fw + vao:.1f} {(fh - alt_nome) / 2:.1f}) scale({esc:.5f})" fill="{cor}">{g}</g></svg>\n')
        open(os.path.join(SAIDA, f"aurea-readme-{tema}.svg"), "w", encoding="utf-8", newline="\n").write(svg)
    # a marca de antes, guardada
    D = "M510 80 A420 420 0 0 1 920 490 C770 475 645 405 585 315 C535 240 510 150 510 80 Z"
    open(os.path.join(SAIDA, "antiga-quatro-petalas.svg"), "w", encoding="utf-8", newline="\n").write(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" role="img" aria-label="Aurea (a marca de antes)">'
        + "".join(f'<path d="{D}" fill="#f0b100" transform="rotate({r} 500 500)"/>' for r in (0, 90, 180, 270)) + "</svg>\n")
    print("logo:", sorted(os.listdir(SAIDA)))


if __name__ == "__main__":
    principal()
