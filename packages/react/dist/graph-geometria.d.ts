export type Ponto = {
    x: number;
    y: number;
};
/** Retângulo no plano do mapa. `larg`/`alt`, e não `width`/`height`: o check 23 lê o fonte inteiro. */
export type Caixa = {
    x: number;
    y: number;
    larg: number;
    alt: number;
};
export type Borda = "left" | "center" | "right" | "top" | "middle" | "bottom";
export declare function alinhar(caixas: ReadonlyMap<string, Caixa>, borda: Borda): Map<string, Ponto>;
/**
 * Distribuir mantém as DUAS PONTAS paradas e deixa os vãos iguais entre os do meio. Se os nós já
 * se sobrepõem (o vão daria negativo), o passo igual vai para os CENTROS, como no draw.io.
 */
export declare function distribuir(caixas: ReadonlyMap<string, Caixa>, eixo: "horizontal" | "vertical"): Map<string, Ponto>;
export declare function subarvores(ids: readonly string[], arestas: readonly {
    from: string;
    to: string;
}[], raiz?: string): Map<string, string[]>;
export declare function recolher(ids: readonly string[], pais: ReadonlyMap<string, string>, dominados: ReadonlyMap<string, readonly string[]>, recolhidos: ReadonlySet<string>, contemFilhos: ReadonlySet<string>): {
    rep: Map<string, string>;
    guardados: Map<string, number>;
};
/**
 * As linhas depois do fechamento. A que fica inteira dentro de um fechado some; a que saía de um
 * escondido passa a sair do representante; e as que ficaram entre o MESMO par viram UMA linha com o
 * número — a "aresta agregada" do mercado (o padrão aberto de quem fecha grupo). As inteiras ficam
 * como estavam.
 */
export declare function remapear<T extends {
    from: string;
    to: string;
}>(arestas: readonly T[], rep: ReadonlyMap<string, string>): {
    item: T;
    de: string;
    para: string;
    n: number;
}[];
/** Tira os pontos repetidos e os do meio de um trecho reto: a ponte e o canto contam os trechos. */
export declare function simplificar(pontos: readonly Ponto[]): Ponto[];
/** O ponto no MEIO do comprimento — onde fica o rótulo e a pastilha da linha. */
export declare function meioDoTracado(pontos: readonly Ponto[]): Ponto;
/** Uma ponte: o intervalo do trecho, medido no eixo dele, em que a linha salta. */
export type Ponte = {
    de: number;
    ate: number;
};
/**
 * AS PONTES (MNT-12.3), na técnica do draw.io: a linha desenhada DEPOIS salta sobre as de antes,
 * só onde um trecho horizontal cruza um vertical — dois trechos no mesmo eixo não se cruzam. O
 * cruzamento perto demais de uma dobra não ganha ponte (o arco bateria no canto). Pontes que se
 * encostam viram uma só, mais larga. A caixa de cada linha filtra os pares antes da conta.
 */
export declare function pontes(linhas: readonly {
    id: string;
    pontos: readonly Ponto[];
}[], raio: number, canto: number): Map<string, Map<number, Ponte[]>>;
/**
 * O `d` do SVG: a linha pelos pontos, com o canto arredondado (o `--radius-sm` da casa, ou menos se
 * o trecho for curto) e o salto de cada ponte — meia elipse, por cima no trecho deitado e à direita
 * no de pé, seja qual for o sentido do trecho.
 */
export declare function tracado(pontos: readonly Ponto[], canto: number, saltos?: ReadonlyMap<number, readonly Ponte[]>, raio?: number): string;
/** De que lado do nó a linha sai (ou entra), lido do primeiro (ou último) trecho. */
export declare function ladoDoTrecho(de: Ponto, para: Ponto, saindo: boolean): "top" | "right" | "bottom" | "left";
/** O trecho atravessa o MIOLO da caixa (encostar na borda não conta — é assim que a linha chega). */
export declare function trechoCruza(a: Ponto, b: Ponto, c: Caixa): boolean;
export declare const rotaCruza: (pontos: readonly Ponto[], caixas: Iterable<Caixa>) => boolean;
/** Onde a reta entre os dois centros sai da caixa: a ponta da linha "flutuante" (arrumação radial). */
export declare function bordaNaDirecao(c: Caixa, para: Ponto): Ponto;
/**
 * Nenhum rótulo cobre outro rótulo nem um nó. Não há biblioteca livre que POSICIONE sem sobrepor;
 * o que as bibliotecas abertas fazem é ESCONDER por prioridade: o de prioridade maior fica, e no empate fica
 * o que veio antes na lista do app. Devolve os que somem.
 */
export declare function rotulosQueSomem(rotulos: readonly {
    id: string;
    caixa: Caixa;
    prioridade: number;
}[], obstaculos: readonly Caixa[]): Set<string>;
export declare function contornoDeNuvem(larg: number, alt: number): string;
