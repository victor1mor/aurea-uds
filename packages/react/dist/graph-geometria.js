// ── ALINHAR E DISTRIBUIR (MNT-13.3) ─────────────────────────────────────────────────────────
// A regra é a do draw.io e a do Figma: alinha-se pela borda MAIS EXTERNA da seleção (à esquerda,
// a menor; à direita, a maior), e o centro é o meio da caixa que envolve todos.
export function alinhar(caixas, borda) {
    const l = [...caixas.values()];
    const minX = Math.min(...l.map(c => c.x)), maxX = Math.max(...l.map(c => c.x + c.larg));
    const minY = Math.min(...l.map(c => c.y)), maxY = Math.max(...l.map(c => c.y + c.alt));
    const saida = new Map();
    for (const [id, c] of caixas) {
        const x = borda === "left" ? minX : borda === "right" ? maxX - c.larg : borda === "center" ? (minX + maxX - c.larg) / 2 : c.x;
        const y = borda === "top" ? minY : borda === "bottom" ? maxY - c.alt : borda === "middle" ? (minY + maxY - c.alt) / 2 : c.y;
        saida.set(id, { x: Math.round(x), y: Math.round(y) });
    }
    return saida;
}
/**
 * Distribuir mantém as DUAS PONTAS paradas e deixa os vãos iguais entre os do meio. Se os nós já
 * se sobrepõem (o vão daria negativo), o passo igual vai para os CENTROS, como no draw.io.
 */
export function distribuir(caixas, eixo) {
    const h = eixo === "horizontal";
    const centro = (c) => h ? c.x + c.larg / 2 : c.y + c.alt / 2;
    const l = [...caixas].sort(([, a], [, b]) => centro(a) - centro(b));
    const saida = new Map(l.map(([id, c]) => [id, { x: c.x, y: c.y }]));
    if (l.length < 3)
        return saida;
    const primeira = l[0][1], ultima = l[l.length - 1][1];
    const inicio = h ? primeira.x : primeira.y, fim = h ? ultima.x + ultima.larg : ultima.y + ultima.alt;
    const ocupado = l.reduce((s, [, c]) => s + (h ? c.larg : c.alt), 0);
    const vao = (fim - inicio - ocupado) / (l.length - 1);
    if (vao >= 0) {
        let cursor = inicio;
        for (const [id, c] of l) {
            const p = saida.get(id);
            if (h)
                p.x = Math.round(cursor);
            else
                p.y = Math.round(cursor);
            cursor += (h ? c.larg : c.alt) + vao;
        }
    }
    else {
        const c0 = centro(primeira), passo = (centro(ultima) - c0) / (l.length - 1);
        l.forEach(([id, c], i) => { const p = saida.get(id); if (h)
            p.x = Math.round(c0 + i * passo - c.larg / 2);
        else
            p.y = Math.round(c0 + i * passo - c.alt / 2); });
    }
    return saida;
}
// ── O QUE UM NÓ DOMINA: a subárvore que se recolhe (MNT-16.7) ───────────────────────────────
// Recolher um switch esconde o que SÓ se alcança passando por ele. Numa rede com cabo redundante, a
// árvore "de quem foi achado primeiro" esconderia um switch de acesso que continua ligado pelo outro
// núcleo — e a linha que sobra apontaria para o nada. O certo é o DOMINADOR: X domina Y quando todo
// caminho da raiz até Y passa por X. Algoritmo iterativo de Cooper, Harvey e Kennedy ("A Simple, Fast
// Dominance Algorithm", 2001), sobre o sentido `from → to` das arestas — o mesmo que arruma as camadas.
// As raízes são o `raiz` pedido, os nós sem entrada e, por último, quem sobrou num ciclo sem entrada;
// todas penduradas numa raiz virtual.
export function subarvores(ids, arestas, raiz) {
    const sai = new Map(ids.map(i => [i, []])), entra = new Map(ids.map(i => [i, []]));
    for (const e of arestas)
        if (sai.has(e.from) && sai.has(e.to) && e.from !== e.to) {
            sai.get(e.from).push(e.to);
            entra.get(e.to).push(e.from);
        }
    const VIRTUAL = "\u0000";
    const raizes = [];
    if (raiz && sai.has(raiz))
        raizes.push(raiz);
    for (const i of ids)
        if (i !== raiz && entra.get(i).length === 0)
            raizes.push(i);
    // Pós-ordem a partir da raiz virtual, sem recursão (um mapa de 500 nós em fila não estoura a pilha).
    const ordem = new Map(), posOrdem = [];
    const visitado = new Set([VIRTUAL]);
    const descer = (inicio) => {
        if (visitado.has(inicio))
            return;
        visitado.add(inicio);
        const pilha = [[inicio, 0]];
        while (pilha.length) {
            const topo = pilha[pilha.length - 1], filhos = sai.get(topo[0]);
            if (topo[1] < filhos.length) {
                const f = filhos[topo[1]++];
                if (!visitado.has(f)) {
                    visitado.add(f);
                    pilha.push([f, 0]);
                }
            }
            else {
                pilha.pop();
                ordem.set(topo[0], posOrdem.length);
                posOrdem.push(topo[0]);
            }
        }
    };
    for (const r of raizes)
        descer(r);
    for (const i of ids)
        if (!visitado.has(i)) {
            raizes.push(i);
            descer(i);
        }
    ordem.set(VIRTUAL, posOrdem.length);
    const ehRaiz = new Set(raizes);
    const pred = (i) => ehRaiz.has(i) ? [VIRTUAL, ...entra.get(i)] : entra.get(i);
    const idom = new Map([[VIRTUAL, VIRTUAL]]);
    const cruzar = (a, b) => {
        while (a !== b) {
            while (ordem.get(a) < ordem.get(b))
                a = idom.get(a);
            while (ordem.get(b) < ordem.get(a))
                b = idom.get(b);
        }
        return a;
    };
    const reversa = [...posOrdem].reverse();
    for (let mudou = true; mudou;) {
        mudou = false;
        for (const b of reversa) {
            let novo;
            for (const p of pred(b))
                if (idom.has(p))
                    novo = novo === undefined ? p : cruzar(p, novo);
            if (novo !== undefined && idom.get(b) !== novo) {
                idom.set(b, novo);
                mudou = true;
            }
        }
    }
    const filhos = new Map();
    for (const [n, d] of idom)
        if (n !== VIRTUAL)
            filhos.set(d, [...(filhos.get(d) ?? []), n]);
    const saida = new Map();
    for (const i of ids) {
        const desc = [], fila = [...(filhos.get(i) ?? [])];
        while (fila.length) {
            const n = fila.shift();
            desc.push(n);
            fila.push(...(filhos.get(n) ?? []));
        }
        if (desc.length)
            saida.set(i, desc);
    }
    return saida;
}
// ── O QUE FECHA, E QUEM FICA NO LUGAR (MNT-16.4, 16.6 e 16.7) ───────────────────────────────
// Dois jeitos de esconder: o CONTÊINER fechado (site, andar, rack — o `parentId`) esconde tudo o que
// está dentro dele; o nó com a subárvore recolhida esconde o que ele domina. O escondido não some do
// mapa: as linhas dele passam a sair do REPRESENTANTE — o contêiner fechado mais de fora, ou o nó
// recolhido mais perto da raiz —, que mostra quantos guarda.
export function recolher(ids, pais, dominados, recolhidos, contemFilhos) {
    const porSubarvore = new Map();
    // O de fora primeiro: quem domina outro domina MAIS nós, então a ordem por tamanho já é a de fora para dentro.
    const quem = [...recolhidos].filter(x => !contemFilhos.has(x) && dominados.has(x)).sort((a, b) => dominados.get(b).length - dominados.get(a).length);
    for (const x of quem)
        for (const d of dominados.get(x))
            if (!porSubarvore.has(d) && !porSubarvore.has(x))
                porSubarvore.set(d, x);
    const conteinerFechadoDeFora = (id) => {
        let achado;
        for (let p = pais.get(id), guarda = 0; p && guarda < ids.length; p = pais.get(p), guarda++)
            if (recolhidos.has(p))
                achado = p;
        return achado;
    };
    const rep = new Map(), guardados = new Map();
    for (const id of ids) {
        const r1 = porSubarvore.get(id) ?? id;
        const r2 = conteinerFechadoDeFora(r1) ?? r1;
        rep.set(id, r2);
        if (r2 !== id && !contemFilhos.has(id))
            guardados.set(r2, (guardados.get(r2) ?? 0) + 1);
    }
    return { rep, guardados };
}
/**
 * As linhas depois do fechamento. A que fica inteira dentro de um fechado some; a que saía de um
 * escondido passa a sair do representante; e as que ficaram entre o MESMO par viram UMA linha com o
 * número — a "aresta agregada" do mercado (o padrão aberto de quem fecha grupo). As inteiras ficam
 * como estavam.
 */
export function remapear(arestas, rep) {
    const saida = [];
    const agregada = new Map();
    for (const e of arestas) {
        const de = rep.get(e.from) ?? e.from, para = rep.get(e.to) ?? e.to;
        if (de === para)
            continue;
        if (de === e.from && para === e.to) {
            saida.push({ item: e, de, para, n: 1 });
            continue;
        }
        const k = de < para ? `${de}|${para}` : `${para}|${de}`;
        const ja = agregada.get(k);
        if (ja) {
            ja.n++;
            continue;
        }
        const nova = { item: e, de, para, n: 1 };
        agregada.set(k, nova);
        saida.push(nova);
    }
    return saida;
}
// ── O TRAÇADO (MNT-12.1 e 12.3) ───────────────────────────────────────────────────────────────
/** Tira os pontos repetidos e os do meio de um trecho reto: a ponte e o canto contam os trechos. */
export function simplificar(pontos) {
    const saida = [];
    for (const p of pontos) {
        const u = saida[saida.length - 1];
        if (u && Math.abs(u.x - p.x) < 0.5 && Math.abs(u.y - p.y) < 0.5)
            continue;
        const a = saida[saida.length - 2];
        if (a && u && Math.abs((u.x - a.x) * (p.y - u.y) - (u.y - a.y) * (p.x - u.x)) < 0.5) {
            saida[saida.length - 1] = { x: p.x, y: p.y };
            continue;
        }
        saida.push({ x: p.x, y: p.y });
    }
    return saida;
}
const comprimento = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
/** O ponto no MEIO do comprimento — onde fica o rótulo e a pastilha da linha. */
export function meioDoTracado(pontos) {
    const total = pontos.slice(1).reduce((s, p, i) => s + comprimento(pontos[i], p), 0);
    let falta = total / 2;
    for (let i = 1; i < pontos.length; i++) {
        const d = comprimento(pontos[i - 1], pontos[i]);
        if (d >= falta && d > 0) {
            const t = falta / d;
            return { x: pontos[i - 1].x + (pontos[i].x - pontos[i - 1].x) * t, y: pontos[i - 1].y + (pontos[i].y - pontos[i - 1].y) * t };
        }
        falta -= d;
    }
    return pontos[0] ?? { x: 0, y: 0 };
}
const trechos = (p) => p.slice(1).map((b, i) => ({ a: p[i], b, i }));
const horizontal = (t) => Math.abs(t.a.y - t.b.y) < 0.5 && Math.abs(t.a.x - t.b.x) >= 0.5;
const vertical = (t) => Math.abs(t.a.x - t.b.x) < 0.5 && Math.abs(t.a.y - t.b.y) >= 0.5;
/**
 * AS PONTES (MNT-12.3), na técnica do draw.io: a linha desenhada DEPOIS salta sobre as de antes,
 * só onde um trecho horizontal cruza um vertical — dois trechos no mesmo eixo não se cruzam. O
 * cruzamento perto demais de uma dobra não ganha ponte (o arco bateria no canto). Pontes que se
 * encostam viram uma só, mais larga. A caixa de cada linha filtra os pares antes da conta.
 */
export function pontes(linhas, raio, canto) {
    const caixa = (p) => ({ x0: Math.min(...p.map(q => q.x)), x1: Math.max(...p.map(q => q.x)), y0: Math.min(...p.map(q => q.y)), y1: Math.max(...p.map(q => q.y)) });
    const preparadas = linhas.map(l => ({ id: l.id, t: trechos(l.pontos), c: caixa(l.pontos) }));
    const saida = new Map();
    const margem = raio + canto;
    for (let i = 1; i < preparadas.length; i++) {
        const L = preparadas[i];
        const porTrecho = new Map();
        for (let j = 0; j < i; j++) {
            const M = preparadas[j];
            if (M.c.x1 < L.c.x0 || M.c.x0 > L.c.x1 || M.c.y1 < L.c.y0 || M.c.y0 > L.c.y1)
                continue;
            for (const s of L.t) {
                const sh = horizontal(s), sv = vertical(s);
                if (!sh && !sv)
                    continue;
                for (const t of M.t) {
                    if (sh ? !vertical(t) : !horizontal(t))
                        continue;
                    // O cruzamento: o x do vertical com o y do horizontal.
                    const cx = sh ? t.a.x : s.a.x, cy = sh ? s.a.y : t.a.y;
                    const [s0, s1] = sh ? [Math.min(s.a.x, s.b.x), Math.max(s.a.x, s.b.x)] : [Math.min(s.a.y, s.b.y), Math.max(s.a.y, s.b.y)];
                    const [t0, t1] = sh ? [Math.min(t.a.y, t.b.y), Math.max(t.a.y, t.b.y)] : [Math.min(t.a.x, t.b.x), Math.max(t.a.x, t.b.x)];
                    const naL = sh ? cx : cy, naM = sh ? cy : cx;
                    if (naL <= s0 + margem || naL >= s1 - margem || naM <= t0 + 0.5 || naM >= t1 - 0.5)
                        continue;
                    porTrecho.set(s.i, [...(porTrecho.get(s.i) ?? []), naL]);
                }
            }
        }
        if (!porTrecho.size)
            continue;
        const m = new Map();
        for (const [k, cs] of porTrecho) {
            const ord = [...cs].sort((a, b) => a - b), juntas = [];
            for (const c of ord) {
                const u = juntas[juntas.length - 1];
                if (u && c - raio <= u.ate)
                    u.ate = c + raio;
                else
                    juntas.push({ de: c - raio, ate: c + raio });
            }
            m.set(k, juntas);
        }
        saida.set(L.id, m);
    }
    return saida;
}
/**
 * O `d` do SVG: a linha pelos pontos, com o canto arredondado (o `--radius-sm` da casa, ou menos se
 * o trecho for curto) e o salto de cada ponte — meia elipse, por cima no trecho deitado e à direita
 * no de pé, seja qual for o sentido do trecho.
 */
export function tracado(pontos, canto, saltos, raio = 0) {
    const p = pontos;
    if (p.length < 2)
        return "";
    const dir = (a, b) => { const d = comprimento(a, b) || 1; return { x: (b.x - a.x) / d, y: (b.y - a.y) / d }; };
    const r = (k) => k <= 0 || k >= p.length - 1 ? 0 : Math.min(canto, comprimento(p[k - 1], p[k]) / 2, comprimento(p[k], p[k + 1]) / 2);
    const n = (v) => Math.round(v * 100) / 100;
    let d = `M${n(p[0].x)},${n(p[0].y)}`;
    for (let k = 0; k < p.length - 1; k++) {
        const a = p[k], b = p[k + 1], u = dir(a, b);
        const fimX = b.x - u.x * r(k + 1), fimY = b.y - u.y * r(k + 1);
        const t = { a, b, i: k };
        const lista = saltos?.get(k);
        if (lista && (horizontal(t) || vertical(t))) {
            const h = horizontal(t), sentido = h ? Math.sign(b.x - a.x) : Math.sign(b.y - a.y);
            const ord = [...lista].sort((x, y) => sentido * (x.de - y.de));
            for (const s of ord) {
                const [ini, fim] = sentido > 0 ? [s.de, s.ate] : [s.ate, s.de];
                const meia = (s.ate - s.de) / 2;
                d += h ? ` L${n(ini)},${n(a.y)} A${n(meia)},${n(raio)} 0 0 ${sentido > 0 ? 1 : 0} ${n(fim)},${n(a.y)}`
                    : ` L${n(a.x)},${n(ini)} A${n(raio)},${n(meia)} 0 0 ${sentido > 0 ? 1 : 0} ${n(a.x)},${n(fim)}`;
            }
        }
        d += ` L${n(fimX)},${n(fimY)}`;
        if (k + 1 < p.length - 1 && r(k + 1) > 0) {
            const v = dir(b, p[k + 2]);
            d += ` Q${n(b.x)},${n(b.y)} ${n(b.x + v.x * r(k + 1))},${n(b.y + v.y * r(k + 1))}`;
        }
    }
    return d;
}
/** De que lado do nó a linha sai (ou entra), lido do primeiro (ou último) trecho. */
export function ladoDoTrecho(de, para, saindo) {
    const dx = para.x - de.x, dy = para.y - de.y;
    if (Math.abs(dy) >= Math.abs(dx))
        return saindo ? (dy > 0 ? "bottom" : "top") : (dy > 0 ? "top" : "bottom");
    return saindo ? (dx > 0 ? "right" : "left") : (dx > 0 ? "left" : "right");
}
// ── A ROTA AINDA VALE? (MNT-12.1) ─────────────────────────────────────────────────────────────
/** O trecho atravessa o MIOLO da caixa (encostar na borda não conta — é assim que a linha chega). */
export function trechoCruza(a, b, c) {
    const x0 = c.x + 1, x1 = c.x + c.larg - 1, y0 = c.y + 1, y1 = c.y + c.alt - 1;
    if (x1 <= x0 || y1 <= y0)
        return false;
    // Liang–Barsky: recorta o segmento contra o retângulo; sobra pedaço, cruzou.
    let t0 = 0, t1 = 1;
    const dx = b.x - a.x, dy = b.y - a.y;
    for (const [p, q] of [[-dx, a.x - x0], [dx, x1 - a.x], [-dy, a.y - y0], [dy, y1 - a.y]]) {
        if (p === 0) {
            if (q < 0)
                return false;
            continue;
        }
        const t = q / p;
        if (p < 0) {
            if (t > t1)
                return false;
            if (t > t0)
                t0 = t;
        }
        else {
            if (t < t0)
                return false;
            if (t < t1)
                t1 = t;
        }
    }
    return t1 > t0;
}
export const rotaCruza = (pontos, caixas) => {
    for (const c of caixas)
        for (let i = 1; i < pontos.length; i++)
            if (trechoCruza(pontos[i - 1], pontos[i], c))
                return true;
    return false;
};
/** Onde a reta entre os dois centros sai da caixa: a ponta da linha "flutuante" (arrumação radial). */
export function bordaNaDirecao(c, para) {
    const cx = c.x + c.larg / 2, cy = c.y + c.alt / 2, dx = para.x - cx, dy = para.y - cy;
    if (!dx && !dy)
        return { x: cx, y: cy };
    const t = Math.min(dx ? (c.larg / 2) / Math.abs(dx) : Infinity, dy ? (c.alt / 2) / Math.abs(dy) : Infinity);
    return { x: cx + dx * t, y: cy + dy * t };
}
// ── OS RÓTULOS QUE SOMEM (MNT-12.5) ─────────────────────────────────────────────────────────
const encostam = (a, b) => a.x < b.x + b.larg && b.x < a.x + a.larg && a.y < b.y + b.alt && b.y < a.y + a.alt;
/**
 * Nenhum rótulo cobre outro rótulo nem um nó. Não há biblioteca livre que POSICIONE sem sobrepor;
 * o que as bibliotecas abertas fazem é ESCONDER por prioridade: o de prioridade maior fica, e no empate fica
 * o que veio antes na lista do app. Devolve os que somem.
 */
export function rotulosQueSomem(rotulos, obstaculos) {
    const ordem = rotulos.map((r, i) => ({ ...r, i })).sort((a, b) => b.prioridade - a.prioridade || a.i - b.i);
    const ficam = [], somem = new Set();
    for (const r of ordem) {
        if (obstaculos.some(o => encostam(r.caixa, o)) || ficam.some(f => encostam(r.caixa, f)))
            somem.add(r.id);
        else
            ficam.push(r.caixa);
    }
    return somem;
}
// ── A NUVEM (MNT-16.5) ────────────────────────────────────────────────────────────────────────
// Internet, nuvem pública, site remoto: o contorno de nuvem, como no mercado. É um desenho de FUNDO
// (SVG atrás do texto) e não um recorte da caixa: o `clip-path` cortaria também o anel de foco.
// Os gomos são arcos entre pontos ESPAÇADOS POR COMPRIMENTO numa elipse recuada — espaçados por
// ângulo, eles se amontoariam nas pontas de uma elipse larga. O recuo é o tamanho do gomo (~0,13 da
// altura): a nuvem enche a caixa e o gomo encosta na borda. Com 0,18, a nuvem ficava encolhida e o
// ícone do nó, na borda da caixa, saía para fora dela (o Victor viu na bancada, 10/10/2026).
export function contornoDeNuvem(larg, alt) {
    const recuo = alt * 0.13, rx = larg / 2 - recuo, ry = alt / 2 - recuo, cx = larg / 2, cy = alt / 2;
    if (rx <= 0 || ry <= 0)
        return "";
    const AMOSTRAS = 240, amostra = [], acumulado = [0];
    for (let i = 0; i <= AMOSTRAS; i++) {
        const t = (i / AMOSTRAS) * 2 * Math.PI;
        amostra.push({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) });
    }
    for (let i = 1; i < amostra.length; i++)
        acumulado.push(acumulado[i - 1] + comprimento(amostra[i - 1], amostra[i]));
    const total = acumulado[acumulado.length - 1];
    const gomos = Math.max(8, Math.min(24, Math.round(total / (alt * 0.5))));
    const passo = total / gomos, pontos = [];
    for (let k = 0, j = 0; k < gomos; k++) {
        const alvo = k * passo;
        while (j < acumulado.length - 1 && acumulado[j + 1] < alvo)
            j++;
        pontos.push(amostra[j]);
    }
    const n = (v) => Math.round(v * 100) / 100;
    let d = `M${n(pontos[0].x)},${n(pontos[0].y)}`;
    for (let k = 0; k < gomos; k++) {
        const a = pontos[k], b = pontos[(k + 1) % gomos], raio = comprimento(a, b) * 0.62;
        d += ` A${n(raio)},${n(raio)} 0 0 1 ${n(b.x)},${n(b.y)}`;
    }
    return d + " Z";
}
