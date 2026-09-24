// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Pages",
    name: "Walking a long result set",
    description: "The current page is announced, not just highlighted. Previous and Next keep their labels for screen readers even when they show only a chevron — a nameless arrow is a dead end.",
    uses: ["Pagination"],
    code: `const [page, setPage] = useState(1);

<Pagination page={page} total={12} onPageChange={setPage} />`,
    render: () => h(A.Pagination, {page: 3, total: 12, onPageChange: () => {}}),
  },
];
