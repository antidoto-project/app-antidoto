import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { router } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaPerfil from "@/app/(tabs)/perfil";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";

// Só o HTTP é simulado: schema → react-hook-form → useMutation → service rodam de verdade
jest.mock("@/api/api", () => ({ api: { get: jest.fn(), put: jest.fn() } }));

const mockSair = jest.fn().mockResolvedValue(undefined);
const mockAtualizarPerfil = jest.fn().mockResolvedValue(undefined);
jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({
    sessao: { token: "token-da-ana" },
    sair: mockSair,
    atualizarPerfil: mockAtualizarPerfil,
  }),
}));

const mockGet = api.get as jest.Mock;
const mockPut = api.put as jest.Mock;

const ANA = {
  id: 1,
  nome: "Ana Souza",
  email: "ana@teste.com",
  telefone: "11999990000",
  perfil: "CIDADAO",
  criadoEm: "2026-11-07T12:00:00Z",
};

const config = { headers: new AxiosHeaders() };
function erroHttp(status: number, data?: unknown) {
  const resposta = { status, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

/** Abre o Perfil já carregado e toca no lápis. */
async function abrirEdicao() {
  mockGet.mockResolvedValueOnce({ data: ANA });
  render(<TelaPerfil />, { wrapper });
  fireEvent.press(await screen.findByLabelText("Editar nome e telefone"));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TelaPerfil (T9)", () => {
  it("mostra os dados de GET /api/usuarios/me, com o telefone formatado", async () => {
    mockGet.mockResolvedValueOnce({ data: ANA });

    render(<TelaPerfil />, { wrapper });

    expect(await screen.findByText("Ana Souza")).toBeTruthy();
    expect(screen.getByText("ana@teste.com")).toBeTruthy();
    expect(screen.getByText("(11) 99999-0000")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/usuarios/me");
  });

  it("sem telefone: 'Não informado'", async () => {
    mockGet.mockResolvedValueOnce({ data: { ...ANA, telefone: null } });

    render(<TelaPerfil />, { wrapper });

    expect(await screen.findByText("Não informado")).toBeTruthy();
  });

  it("erro ao carregar: mensagem e 'Tentar novamente' busca de novo (sem o lápis)", async () => {
    mockGet.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
    mockGet.mockResolvedValueOnce({ data: ANA });

    render(<TelaPerfil />, { wrapper });

    expect(await screen.findByText("Sem conexão. Tente novamente.")).toBeTruthy();
    expect(screen.queryByLabelText("Editar nome e telefone")).toBeNull();
    fireEvent.press(screen.getByText("Tentar novamente"));

    expect(await screen.findByText("Ana Souza")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("'Sair da conta' encerra a sessão e volta ao login", async () => {
    mockGet.mockResolvedValueOnce({ data: ANA });

    render(<TelaPerfil />, { wrapper });
    fireEvent.press(await screen.findByText("Sair da conta"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(mockSair).toHaveBeenCalledTimes(1);
  });

  it("'Sobre o App' abre a tela com a versão e o commit", async () => {
    mockGet.mockResolvedValueOnce({ data: ANA });

    render(<TelaPerfil />, { wrapper });
    fireEvent.press(await screen.findByText("Sobre o App"));

    expect(router.push).toHaveBeenCalledWith("/sobre");
  });
});

describe("TelaPerfil — editar nome e telefone (PUT /api/usuarios/me)", () => {
  it("o lápis abre o formulário com o que está salvo; o e-mail só aparece", async () => {
    await abrirEdicao();

    expect(screen.getByText("Editar perfil")).toBeTruthy();
    expect(screen.getByDisplayValue("Ana Souza")).toBeTruthy();
    expect(screen.getByDisplayValue("(11) 99999-0000")).toBeTruthy();
    expect(screen.getByText("O e-mail não pode ser alterado")).toBeTruthy();
    expect(screen.getByText("ana@teste.com")).toBeTruthy();
  });

  it("salva só nome e telefone (dígitos), mostra os dados novos e 'Salvo com sucesso!'", async () => {
    const atualizada = { ...ANA, nome: "Ana Paula", telefone: "21988887777" };
    mockPut.mockResolvedValueOnce({ data: atualizada });
    await abrirEdicao();

    fireEvent.changeText(screen.getByDisplayValue("Ana Souza"), "Ana Paula");
    fireEvent.changeText(screen.getByDisplayValue("(11) 99999-0000"), "21988887777");
    fireEvent.press(screen.getByText("Salvar alterações"));

    expect(await screen.findByText("Salvo com sucesso!")).toBeTruthy();
    expect(mockPut).toHaveBeenCalledWith("/api/usuarios/me", {
      nome: "Ana Paula",
      telefone: "21988887777",
    });
    // Volta para a leitura com o que a API devolveu, e a sessão salva também muda
    expect(screen.getByText("Perfil")).toBeTruthy();
    expect(screen.getByText("Ana Paula")).toBeTruthy();
    expect(screen.getByText("(21) 98888-7777")).toBeTruthy();
    expect(mockAtualizarPerfil).toHaveBeenCalledWith(atualizada);
  });

  it("telefone apagado vai como null (é opcional)", async () => {
    mockPut.mockResolvedValueOnce({ data: { ...ANA, telefone: null } });
    await abrirEdicao();

    fireEvent.changeText(screen.getByDisplayValue("(11) 99999-0000"), "");
    fireEvent.press(screen.getByText("Salvar alterações"));

    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith("/api/usuarios/me", {
        nome: "Ana Souza",
        telefone: null,
      })
    );
    expect(await screen.findByText("Não informado")).toBeTruthy();
  });

  it("nome curto ou telefone incompleto: mostra a regra e não chama a API", async () => {
    await abrirEdicao();

    fireEvent.changeText(screen.getByDisplayValue("Ana Souza"), "A");
    fireEvent.changeText(screen.getByDisplayValue("(11) 99999-0000"), "1199");
    fireEvent.press(screen.getByText("Salvar alterações"));

    expect(await screen.findByText("Informe o nome (pelo menos 2 letras)")).toBeTruthy();
    expect(screen.getByText("Telefone inválido: use o DDD e o número")).toBeTruthy();
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("400 com campos: a mensagem da API vai para o campo e continua editando", async () => {
    mockPut.mockRejectedValueOnce(
      erroHttp(400, {
        mensagem: "Um ou mais campos são inválidos.",
        campos: [{ campo: "telefone", mensagem: "Telefone recusado pela API" }],
      })
    );
    await abrirEdicao();

    fireEvent.press(screen.getByText("Salvar alterações"));

    expect(await screen.findByText("Telefone recusado pela API")).toBeTruthy();
    expect(screen.getByText("Editar perfil")).toBeTruthy();
    expect(mockAtualizarPerfil).not.toHaveBeenCalled();
  });

  it("sem conexão: mensagem geral, sem perder o que foi digitado", async () => {
    mockPut.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK", config));
    await abrirEdicao();

    fireEvent.changeText(screen.getByDisplayValue("Ana Souza"), "Ana Paula");
    fireEvent.press(screen.getByText("Salvar alterações"));

    expect(await screen.findByText("Sem conexão. Tente novamente.")).toBeTruthy();
    expect(screen.getByDisplayValue("Ana Paula")).toBeTruthy();
  });

  it("'Cancelar' desfaz o que foi digitado e volta para a leitura", async () => {
    await abrirEdicao();

    fireEvent.changeText(screen.getByDisplayValue("Ana Souza"), "Outro Nome");
    fireEvent.press(screen.getByText("Cancelar"));

    expect(screen.getByText("Perfil")).toBeTruthy();
    expect(screen.getByText("Ana Souza")).toBeTruthy();
    expect(screen.queryByText("Salvar alterações")).toBeNull();

    fireEvent.press(screen.getByLabelText("Editar nome e telefone"));
    expect(screen.getByDisplayValue("Ana Souza")).toBeTruthy();
    expect(mockPut).not.toHaveBeenCalled();
  });
});
