import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaCadastro from "@/app/(auth)/cadastro";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";

// Mocka só o HTTP: schema → react-hook-form → useMutation → service rodam de verdade
jest.mock("@/api/api", () => ({ api: { post: jest.fn(), get: jest.fn() } }));

const mockEntrar = jest.fn();
jest.mock("@/context/SessaoContext", () => ({ useSessao: () => ({ entrar: mockEntrar }) }));

const mockPost = api.post as jest.Mock;
const mockParams = useLocalSearchParams as jest.Mock;

const RETORNO = {
  tipoAnimal: "ESCORPIAO",
  faixaEtaria: "CRIANCA",
  sintomas: "DOR_LOCAL",
  horaPicada: "2026-11-09T22:00:00.000Z",
};

const RESPOSTA = {
  token: "token-da-ana",
  tipo: "Bearer",
  expiraEmSegundos: 86400,
  usuario: {
    id: 1,
    nome: "Ana Souza",
    email: "ana@teste.com",
    telefone: "11999990000",
    perfil: "CIDADAO",
  },
};

const config = { headers: new AxiosHeaders() };
function erroHttp(status: number, data?: unknown) {
  const resposta = { status, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

function preencher({
  nome = "Ana Souza",
  email = "Ana@Teste.com",
  telefone = "11999990000",
  senha = "Teste123",
} = {}) {
  fireEvent.changeText(screen.getByPlaceholderText("Seu nome"), nome);
  fireEvent.changeText(screen.getByPlaceholderText("exemplo@email.com"), email);
  fireEvent.changeText(screen.getByPlaceholderText("(11) 99999-0000"), telefone);
  fireEvent.changeText(screen.getByPlaceholderText("8 ou mais, com letra e número"), senha);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TelaCadastro (T2)", () => {
  it("cria a conta com o payload do contrato (telefone só com dígitos) e já entra", async () => {
    mockPost.mockResolvedValueOnce({ data: RESPOSTA });

    render(<TelaCadastro />, { wrapper });
    preencher();
    // A máscara formata enquanto digita
    expect(screen.getByDisplayValue("(11) 99999-0000")).toBeTruthy();
    fireEvent.press(screen.getByText("Criar conta"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(tabs)"));
    expect(mockPost).toHaveBeenCalledWith("/api/auth/cadastro", {
      nome: "Ana Souza",
      email: "ana@teste.com",
      senha: "Teste123",
      telefone: "11999990000",
    });
    expect(mockEntrar).toHaveBeenCalledWith(RESPOSTA);
  });

  it("sem telefone: manda telefone null (é opcional)", async () => {
    mockPost.mockResolvedValueOnce({ data: RESPOSTA });

    render(<TelaCadastro />, { wrapper });
    preencher({ telefone: "" });
    fireEvent.press(screen.getByText("Criar conta"));

    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockPost.mock.calls[0][1].telefone).toBeNull();
  });

  it("senha sem número é bloqueada antes de chamar a API", async () => {
    render(<TelaCadastro />, { wrapper });
    preencher({ senha: "SomenteLetras" });
    fireEvent.press(screen.getByText("Criar conta"));

    expect(await screen.findByText("A senha precisa ter pelo menos um número")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("senha curta e telefone incompleto mostram a regra no campo", async () => {
    render(<TelaCadastro />, { wrapper });
    preencher({ senha: "abc1", telefone: "1199" });
    fireEvent.press(screen.getByText("Criar conta"));

    expect(await screen.findByText("A senha precisa ter pelo menos 8 caracteres")).toBeTruthy();
    expect(screen.getByText("Telefone inválido: use o DDD e o número")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("e-mail já cadastrado (409): mostra a mensagem da API e não entra", async () => {
    mockPost.mockRejectedValueOnce(
      erroHttp(409, { status: 409, mensagem: "E-mail já cadastrado." })
    );

    render(<TelaCadastro />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Criar conta"));

    expect(await screen.findByText("E-mail já cadastrado.")).toBeTruthy();
    expect(mockEntrar).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("400 com campos: cada mensagem da API vai para o seu campo", async () => {
    mockPost.mockRejectedValueOnce(
      erroHttp(400, {
        mensagem: "Um ou mais campos são inválidos.",
        campos: [{ campo: "nome", mensagem: "Nome com caracteres inválidos" }],
      })
    );

    render(<TelaCadastro />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Criar conta"));

    expect(await screen.findByText("Nome com caracteres inválidos")).toBeTruthy();
  });
});

describe("TelaCadastro — vindo do 'Entre para salvar a ocorrência'", () => {
  afterEach(() => {
    mockParams.mockReturnValue({});
  });

  it("depois de criar a conta, volta para o resultado com as mesmas respostas", async () => {
    mockParams.mockReturnValue(RETORNO);
    mockPost.mockResolvedValueOnce({ data: RESPOSTA });

    render(<TelaCadastro />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Criar conta"));

    await waitFor(() =>
      expect(router.dismissTo).toHaveBeenCalledWith({ pathname: "/sos/resultado", params: RETORNO })
    );
  });
});
