import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";

import {
  classificarErro,
  errosDaApiNoFormulario,
  errosDeCampoDaApi,
  mensagemDaApi,
} from "@/api/erros";

const config = { headers: new AxiosHeaders() };

/** Erro com resposta da API, no formato do schema `Erro` do contrato. */
function erroHttp(status: number, data?: unknown): AxiosError {
  const resposta = { status, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, resposta);
}

describe("mensagemDaApi", () => {
  it("usa a `mensagem` que a API manda", () => {
    const erro = erroHttp(409, {
      status: 409,
      erro: "Conflito",
      mensagem: "E-mail já cadastrado.",
    });

    expect(mensagemDaApi(erro)).toBe("E-mail já cadastrado.");
  });

  it("sem conexão: 'Sem conexão. Tente novamente.' (MVP-02 §5.1)", () => {
    const erro = new AxiosError("Network Error", "ERR_NETWORK", config);

    expect(classificarErro(erro)).toBe("rede");
    expect(mensagemDaApi(erro)).toBe("Sem conexão. Tente novamente.");
  });

  it("tempo esgotado (10 s) tem mensagem própria", () => {
    const erro = new AxiosError("timeout of 10000ms exceeded", "ECONNABORTED", config);

    expect(classificarErro(erro)).toBe("tempo_esgotado");
    expect(mensagemDaApi(erro)).toMatch(/demorou/);
  });

  it("sem `mensagem` no corpo, cai na mensagem padrão do status", () => {
    expect(mensagemDaApi(erroHttp(500, "<html>erro</html>"))).toBe(
      "Erro no servidor. Tente novamente em instantes."
    );
    expect(mensagemDaApi(erroHttp(404, { mensagem: "  " }))).toBe("Não encontrado.");
    expect(mensagemDaApi(erroHttp(401))).toBe("Sua sessão expirou. Faça login novamente.");
  });

  it("um erro que não veio do axios não quebra a tela", () => {
    expect(mensagemDaApi(new Error("qualquer"))).toBe("Algo deu errado. Tente novamente.");
  });
});

describe("errosDeCampoDaApi", () => {
  it("no 400 de validação, devolve campo → mensagem para o setError", () => {
    const erro = erroHttp(400, {
      status: 400,
      erro: "Dados inválidos",
      mensagem: "Um ou mais campos são inválidos.",
      campos: [
        { campo: "email", mensagem: "E-mail inválido" },
        { campo: "senha", mensagem: "A senha precisa de letra e número" },
      ],
    });

    expect(errosDeCampoDaApi(erro)).toEqual({
      email: "E-mail inválido",
      senha: "A senha precisa de letra e número",
    });
  });

  it("duas mensagens para o mesmo campo: fica a primeira", () => {
    const erro = erroHttp(400, {
      campos: [
        { campo: "senha", mensagem: "Mínimo de 8 caracteres" },
        { campo: "senha", mensagem: "Precisa de um número" },
      ],
    });

    expect(errosDeCampoDaApi(erro)).toEqual({ senha: "Mínimo de 8 caracteres" });
  });

  it("fora do 400, ou sem `campos` válidos, devolve vazio", () => {
    expect(
      errosDeCampoDaApi(erroHttp(409, { campos: [{ campo: "email", mensagem: "x" }] }))
    ).toEqual({});
    expect(errosDeCampoDaApi(erroHttp(400, { mensagem: "Dados inválidos" }))).toEqual({});
    expect(errosDeCampoDaApi(erroHttp(400, { campos: [{ campo: 1 }, null] }))).toEqual({});
    expect(errosDeCampoDaApi(new Error("x"))).toEqual({});
  });
});

describe("errosDaApiNoFormulario", () => {
  const CAMPOS = ["nome", "email", "senha"] as const;

  it("400: cada erro vai para o seu campo, sem mensagem geral", () => {
    const erro = erroHttp(400, {
      mensagem: "Um ou mais campos são inválidos.",
      campos: [
        { campo: "email", mensagem: "E-mail inválido" },
        { campo: "senha", mensagem: "Senha fraca" },
      ],
    });

    expect(errosDaApiNoFormulario(erro, CAMPOS)).toEqual({
      porCampo: [
        { campo: "email", mensagem: "E-mail inválido" },
        { campo: "senha", mensagem: "Senha fraca" },
      ],
      geral: null,
    });
  });

  it("400 com um campo que a tela não tem: a mensagem dele vira a geral", () => {
    const erro = erroHttp(400, {
      campos: [
        { campo: "email", mensagem: "E-mail inválido" },
        { campo: "perfil", mensagem: "Perfil inválido" },
      ],
    });

    expect(errosDaApiNoFormulario(erro, CAMPOS)).toEqual({
      porCampo: [{ campo: "email", mensagem: "E-mail inválido" }],
      geral: "Perfil inválido",
    });
  });

  it("409 (e-mail já cadastrado): mensagem geral da API (MVP-02 §5.1)", () => {
    const erro = erroHttp(409, { status: 409, mensagem: "E-mail já cadastrado." });

    expect(errosDaApiNoFormulario(erro, CAMPOS)).toEqual({
      porCampo: [],
      geral: "E-mail já cadastrado.",
    });
  });

  it("sem conexão: mensagem geral padrão", () => {
    const erro = new AxiosError("Network Error", "ERR_NETWORK", config);

    expect(errosDaApiNoFormulario(erro, CAMPOS).geral).toBe("Sem conexão. Tente novamente.");
  });
});
