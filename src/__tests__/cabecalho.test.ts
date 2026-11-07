import { opcoesCabecalhoNativo } from "@/utils/cabecalho";

// O tailwind.config.js é CommonJS (o NativeWind lê com require)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const configTailwind = require("../../tailwind.config.js");
const cores = configTailwind.theme.extend.colors;

// A barra nativa do Stack (seta de voltar do cadastro) tem que ter as cores da
// tela nos dois temas — o className não chega nela
describe("opcoesCabecalhoNativo", () => {
  it("no tema claro usa o fundo creme (bg-fundo) e o texto grafite (text-texto)", () => {
    const opcoes = opcoesCabecalhoNativo(false);

    expect(opcoes.headerStyle.backgroundColor).toBe(cores.fundo);
    expect(opcoes.headerTintColor).toBe(cores.texto);
    expect(opcoes.headerShadowVisible).toBe(false);
  });

  it("no tema escuro usa dark:bg-fundo-escuro e dark:text-texto-escuro", () => {
    const opcoes = opcoesCabecalhoNativo(true);

    expect(opcoes.headerStyle.backgroundColor).toBe(cores["fundo-escuro"]);
    expect(opcoes.headerTintColor).toBe(cores["texto-escuro"]);
  });
});
