import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError } from "axios";
import { router } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaPerfil from "@/app/(tabs)/perfil";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";

jest.mock("@/api/api", () => ({ api: { get: jest.fn() } }));

const mockSair = jest.fn().mockResolvedValue(undefined);
jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({ sessao: { token: "token-da-ana" }, sair: mockSair }),
}));

const mockGet = api.get as jest.Mock;

const ANA = {
  id: 1,
  nome: "Ana Souza",
  email: "ana@teste.com",
  telefone: "11999990000",
  perfil: "CIDADAO",
  criadoEm: "2026-11-07T12:00:00Z",
};

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
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

  it("erro ao carregar: mensagem e 'Tentar novamente' busca de novo", async () => {
    mockGet.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
    mockGet.mockResolvedValueOnce({ data: ANA });

    render(<TelaPerfil />, { wrapper });

    expect(await screen.findByText("Sem conexão. Tente novamente.")).toBeTruthy();
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
});
