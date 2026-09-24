// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Stack",
    name: "Who is on this run",
    description: "Overlapping faces plus a count for the rest. The cutoff exists because a row of twelve avatars stops being information and becomes texture — the number carries what the faces no longer can.",
    uses: ["AvatarGroup", "Avatar"],
    code: `<AvatarGroup max={3} total={9} label="Participants">
  <Avatar fallback="ME" alt="Messenger" />
  <Avatar fallback="AN" alt="Analyst" />
  <Avatar fallback="CU" alt="Curator" />
  <Avatar fallback="WR" alt="Writer" />
</AvatarGroup>`,
    render: () => h(A.AvatarGroup, {max: 3, total: 9, label: "Participants"},
      h(A.Avatar, {fallback: "ME", alt: "Messenger"}), h(A.Avatar, {fallback: "AN", alt: "Analyst"}),
      h(A.Avatar, {fallback: "CU", alt: "Curator"}), h(A.Avatar, {fallback: "WR", alt: "Writer"})),
  },
];
