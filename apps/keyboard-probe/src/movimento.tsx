// O BANCO DO MOVIMENTO (S-04 e S-05, 05/11/2026), com o pacote da Aurea desta branch. Na aprovação, a página mostrava hoje
// × proposta lado a lado (o pacote de antes, numa cópia fora do git); aprovado (*"Pode, Ember também"*), fica a proposta.
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import * as A from "@aurea-uds/react";
import "@aurea-uds/core/css";
import {Banco} from "./movimento-banco";

createRoot(document.getElementById("root")!).render(<StrictMode><Banco A={A} /></StrictMode>);
