// A D5 da auditoria externa (decisão do Victor, 06/11/2026: "MediaEmbed só https"): a moldura aceitava qualquer endereço.
// Agora só monta com `https:`, e o link de origem só aparece com `https:`. Provado contra o defeito: com o
// `media-client.tsx` de antes, os casos de `http:` e `javascript:` montavam a moldura e o link.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {MediaEmbed} from "../../packages/react/src/media-client.js";

describe("MediaEmbed: só https", () => {
  it("https: monta a moldura e o link", () => {
    const {container} = render(<MediaEmbed src="https://www.youtube.com/embed/x" href="https://www.youtube.com/watch?v=x" title="Vídeo"/>);
    expect(container.querySelector("iframe")).not.toBeNull();
    expect(container.querySelector(".media-embed-link")).not.toBeNull();
  });
  it("http: e javascript: não montam nada", () => {
    for (const ruim of ["http://exemplo.dev/x", "javascript:alert(1)", "data:text/html,oi"]) {
      const {container} = render(<MediaEmbed src={ruim} href={ruim} title="Vídeo"/>);
      expect(container.querySelector("iframe"), ruim).toBeNull();
      expect(container.querySelector(".media-embed-link"), ruim).toBeNull();
    }
  });
});
