// O `Header` liga o `onClick` do item (06/11/2026): o mesmo `SidebarItem` que a `Sidebar` usa, e o `Header` o jogava fora —
// a ficha dizia "onClick is ignored". Agora o clique no link da barra (e no do menu do celular, que é o mesmo item) chega
// ao app, como na `Sidebar`. Provado contra o defeito: com o `markup.tsx` de antes, o aviso não é chamado.
import {render, fireEvent} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {Header} from "../../packages/react/src/markup.js";

describe("Header: o onClick do item chega ao app", () => {
  it("o clique no link da barra chama o onClick do item", () => {
    const aviso = vi.fn();
    const {container} = render(<Header items={[{id: "a", label: "Home", href: "#"}, {id: "b", label: "Docs", href: "#", onClick: aviso}]} current="a"/>);
    const docs = [...container.querySelectorAll(".topbar-nav a")].find((a) => a.textContent === "Docs")!;
    fireEvent.click(docs);
    expect(aviso).toHaveBeenCalledTimes(1);
  });
});
