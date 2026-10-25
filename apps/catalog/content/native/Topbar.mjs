// O Topbar do nativo no site (bloco 1, o 5-A — 23/10/2026): o nome antigo do `Header`, a mesma peça. Os exemplos são os do
// `Header`, com o nome `Topbar` no código e a peça `Topbar` desenhando.
import {Topbar} from "../../../../packages/native/dist/index.js";
import {apiDaBarra, exemplosDaBarra} from "./Header.mjs";

export default {
  install: 'import {Topbar} from "@aurea-uds/native";',
  description: "The old name of Header — the same component, and it still works the same. New code uses Header; the "
    + "AureaTopbar* types keep working too.",
  api: apiDaBarra,
  examples: exemplosDaBarra("Topbar", Topbar),
};
