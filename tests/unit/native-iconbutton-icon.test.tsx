// A D2 da auditoria externa (decisão do Victor, 06/11/2026: mesmo nome de prop nos dois alvos): o `IconButton` do nativo
// aceita `icon`, o nome da web, além do `name` que já usava. Provado contra o defeito: com o `actions.tsx` de antes, o
// `icon` não chegava ao desenho (o glifo não era montado).
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {AureaProvider, IconButton, criarRegistroDeIcones} from "../../packages/native/src/index.js";

const visto: string[] = [];
const Glifo = ({nome}: {nome: string}) => { visto.push(nome); return null; };
const ICONES = criarRegistroDeIcones({"gear": () => <Glifo nome="gear"/>, "bell": () => <Glifo nome="bell"/>});
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider icons={ICONES}>{children}</AureaProvider>;

describe("IconButton do nativo: icon e name", () => {
  it("icon desenha o glifo, como na web", () => {
    visto.length = 0;
    render(<Envolve><IconButton icon="gear" label="Settings"/></Envolve>);
    expect(visto).toContain("gear");
  });
  it("name continua valendo", () => {
    visto.length = 0;
    render(<Envolve><IconButton name="bell" label="Notifications"/></Envolve>);
    expect(visto).toContain("bell");
  });
});
