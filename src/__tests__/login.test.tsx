import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaLogin from "@/app/(auth)/login";
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
  usuario: { id: 1, nome: "Ana Souza", email: "ana@teste.com", telefone: null, perfil: "CIDADAO" },
};

const config = { headers: new AxiosHeaders() };
function erroHttp(status: number, data?: unknown) {
  const resposta = { status, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

function preencher(email: string, senha: string) {
  fireEvent.changeText(screen.getByPlaceholderText("exemplo@email.com"), email);
  fireEvent.changeText(screen.getByPlaceholderText("Sua senha"), senha);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TelaLogin (T1)", () => {
  it("entra: POST /api/auth/login com o e-mail normalizado, guarda a sessão e vai para o Início", async () => {
    mockPost.mockResolvedValueOnce({ data: RESPOSTA });

    render(<TelaLogin />, { wrapper });
    preencher("  Ana@Teste.com ", "Teste@123");
    fireEvent.press(screen.getByText("Entrar"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(tabs)"));
    expect(mockPost).toHaveBeenCalledWith("/api/auth/login", {
      email: "ana@teste.com",
      senha: "Teste@123",
    });
    expect(mockEntrar).toHaveBeenCalledWith(RESPOSTA);
  });

  it("401: 'E-mail ou senha incorretos' (MVP-02 §3.4) e continua no login", async () => {
    mockPost.mockRejectedValueOnce(erroHttp(401, { mensagem: "Credenciais inválidas" }));

    render(<TelaLogin />, { wrapper });
    preencher("ana@teste.com", "errada123");
    fireEvent.press(screen.getByText("Entrar"));

    expect(await screen.findByText("E-mail ou senha incorretos")).toBeTruthy();
    expect(mockEntrar).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("sem internet: 'Sem conexão. Tente novamente.'", async () => {
    mockPost.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK", config));

    render(<TelaLogin />, { wrapper });
    preencher("ana@teste.com", "Teste@123");
    fireEvent.press(screen.getByText("Entrar"));

    expect(await screen.findByText("Sem conexão. Tente novamente.")).toBeTruthy();
  });

  it("400 com campos: a mensagem da API aparece no campo", async () => {
    mockPost.mockRejectedValueOnce(
      erroHttp(400, {
        mensagem: "Dados inválidos",
        campos: [{ campo: "email", mensagem: "E-mail inválido na API" }],
      })
    );

    render(<TelaLogin />, { wrapper });
    preencher("ana@teste.com", "Teste@123");
    fireEvent.press(screen.getByText("Entrar"));

    expect(await screen.findByText("E-mail inválido na API")).toBeTruthy();
  });

  it("formulário vazio não chama a API", async () => {
    render(<TelaLogin />, { wrapper });
    fireEvent.press(screen.getByText("Entrar"));

    expect(await screen.findByText("Informe o e-mail")).toBeTruthy();
    expect(screen.getByText("Informe a senha")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("o olho da senha é um botão para o leitor de tela e mostra a senha", () => {
    render(<TelaLogin />, { wrapper });

    fireEvent.press(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeTruthy();
  });

  it("mostra o logo do Antídoto acima do título", () => {
    render(<TelaLogin />, { wrapper });

    expect(screen.getByLabelText("Antídoto")).toBeTruthy();
  });

  it("o SOS abre a triagem, sem precisar de conta (RN-G1)", async () => {
    render(<TelaLogin />, { wrapper });

    fireEvent.press(await screen.findByLabelText("SOS, fui picado"));

    expect(router.push).toHaveBeenCalledWith("/sos/triagem");
  });

  it("'Criar conta' abre o cadastro", () => {
    render(<TelaLogin />, { wrapper });
    fireEvent.press(screen.getByText("Criar conta"));

    expect(router.push).toHaveBeenCalledWith("/cadastro");
  });
});

describe("TelaLogin — vindo do 'Entre para salvar a ocorrência'", () => {
  beforeEach(() => {
    mockParams.mockReturnValue(RETORNO);
  });

  afterEach(() => {
    mockParams.mockReturnValue({});
  });

  it("depois de entrar, volta para o resultado com as mesmas respostas", async () => {
    mockPost.mockResolvedValueOnce({ data: RESPOSTA });

    render(<TelaLogin />, { wrapper });
    expect(
      await screen.findByText("Depois de entrar, você volta para o resultado e salva a ocorrência.")
    ).toBeTruthy();
    // Já está no SOS: o botão SOS do topo sai
    expect(screen.queryByLabelText("SOS, fui picado")).toBeNull();

    preencher("ana@teste.com", "Teste@123");
    fireEvent.press(screen.getByText("Entrar"));

    await waitFor(() =>
      expect(router.dismissTo).toHaveBeenCalledWith({ pathname: "/sos/resultado", params: RETORNO })
    );
  });

  it("'Criar conta' leva as respostas para o cadastro", async () => {
    render(<TelaLogin />, { wrapper });

    fireEvent.press(await screen.findByText("Criar conta"));

    expect(router.push).toHaveBeenCalledWith({ pathname: "/cadastro", params: RETORNO });
  });
});
