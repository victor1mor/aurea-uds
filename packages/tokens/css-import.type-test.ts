// Prova a autorreferência pública, não o caminho relativo: sem `types` em `exports["./css"]`,
// o TypeScript reprova este side-effect import com TS2882.
import "@aurea-uds/tokens/css";
