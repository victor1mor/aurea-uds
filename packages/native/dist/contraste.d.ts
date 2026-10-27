/**
 * `true` quando a pessoa pediu mais contraste ao sistema. Começa em `false` e muda quando o sistema responde (a pergunta
 * é assíncrona no iOS e no Android): ao contrário do movimento, um quadro sem o contorno não machuca ninguém — o campo
 * já se lê pelo rótulo, como no visual padrão. Muda sozinho se a pessoa ligar a preferência com o app aberto.
 */
export declare function useMaisContraste(): boolean;
