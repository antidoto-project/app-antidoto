import { QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { router } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaAlterarSenha from "@/app/(app)/alterar-senha";
import { TEMPO_DO_AVISO_MS } from "@/components/ui/ToastSucesso";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";

// Só o HTTP é simulado: service, hook, schema e tela rodam de verdade
jest.mock("@/api/api", () => ({ api: { put: jest.fn() } }));

const mockPut = api.put as jest.Mock;

const config = { headers: new AxiosHeaders() };
function erro400(campo: string, mensagem: string) {
  const data = { status: 400, erro: "Bad Request", mensagem, campos: [{ campo, mensagem }] };
  const resposta = { status: 400, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

function preencher(atual: string, nova: string, repetida: string) {
  fireEvent.changeText(screen.getByPlaceholderText("Sua senha de agora"), atual);
  fireEvent.changeText(screen.getByPlaceholderText("8 ou mais, com letra e número"), nova);
  fireEvent.changeText(screen.getByPlaceholderText("A mesma nova senha"), repetida);
  fireEvent.press(screen.getByText("Salvar nova senha"));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TelaAlterarSenha (PUT /api/usuarios/me/senha)", () => {
  it("confere na tela: a repetida igual e a nova diferente da atual, com a regra do cadastro", async () => {
    render(<TelaAlterarSenha />, { wrapper });

    preencher("Teste123", "curta", "curta");
    expect(await screen.findByText("A senha precisa ter pelo menos 8 caracteres")).toBeTruthy();

    preencher("Teste123", "NovaSenha1", "OutraSenha1");
    expect(await screen.findByText("As senhas não coincidem")).toBeTruthy();

    preencher("Teste123", "Teste123", "Teste123");
    expect(await screen.findByText("A nova senha precisa ser diferente da atual")).toBeTruthy();

    expect(mockPut).not.toHaveBeenCalled();
  });

  it("senha atual errada: a mensagem da API aparece embaixo do campo", async () => {
    mockPut.mockRejectedValue(erro400("senhaAtual", "Senha atual incorreta."));

    render(<TelaAlterarSenha />, { wrapper });
    preencher("Errada123", "NovaSenha1", "NovaSenha1");

    expect(await screen.findByText("Senha atual incorreta.")).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();
  });

  it("deu certo: manda só a atual e a nova, mostra o aviso e volta para o Perfil", async () => {
    jest.useFakeTimers();
    mockPut.mockResolvedValue({ data: undefined });

    render(<TelaAlterarSenha />, { wrapper });
    preencher("Teste123", "NovaSenha1", "NovaSenha1");

    expect(await screen.findByText("Salvo com sucesso!")).toBeTruthy();
    expect(mockPut).toHaveBeenCalledWith("/api/usuarios/me/senha", {
      senhaAtual: "Teste123",
      novaSenha: "NovaSenha1",
    });

    act(() => jest.advanceTimersByTime(TEMPO_DO_AVISO_MS));
    await waitFor(() => expect(router.back).toHaveBeenCalled());
    jest.useRealTimers();
  });
});
