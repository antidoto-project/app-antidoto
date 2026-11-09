import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError } from "axios";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Alert, type AlertButton } from "react-native";

import { api } from "@/api/api";
import TelaAvistamentos from "@/app/(tabs)/avistamentos";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { Avistamento } from "@/types/avistamento.types";

// Só o HTTP é simulado: service, hooks e componentes rodam de verdade
jest.mock("@/api/api", () => ({ api: { get: jest.fn(), delete: jest.fn() } }));

const mockGet = api.get as jest.Mock;
const mockDelete = api.delete as jest.Mock;

const ESCORPIAO: Avistamento = {
  id: 7,
  tipoAnimal: "ESCORPIAO",
  local: "QUINTAL",
  latitude: -23.55,
  longitude: -46.63,
  dataHora: "2026-11-09T22:30:00.000Z",
  observacao: "Perto do ralo",
  criadoEm: "2026-11-09T22:31:00.000Z",
  atualizadoEm: null,
};

/** Resposta paginada do contrato (PaginaAvistamento). */
function pagina(conteudo: Avistamento[]) {
  return {
    data: { conteudo, pagina: 0, tamanho: 50, totalElementos: conteudo.length, totalPaginas: 1 },
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

/** Simula o toque num botão do Alert.alert (o "Excluir" da confirmação). */
function tocarNoAlerta(alerta: jest.SpyInstance, texto: string) {
  const botoes = alerta.mock.calls[0][2] as AlertButton[];
  botoes.find((botao) => botao.text === texto)?.onPress?.();
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("TelaAvistamentos (T7)", () => {
  it("lista os meus avistamentos com animal, local, data e observação", async () => {
    mockGet.mockResolvedValue(pagina([ESCORPIAO]));

    render(<TelaAvistamentos />, { wrapper });

    expect(await screen.findByText("Escorpião")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/avistamentos/meus", {
      params: { pagina: 0, tamanho: 50 },
    });
    expect(screen.getByText("Quintal · 09/11/2026 19:30")).toBeTruthy();
    expect(screen.getByText("Perto do ralo")).toBeTruthy();
  });

  it("vazio: 'Você ainda não registrou avistamentos'", async () => {
    mockGet.mockResolvedValue(pagina([]));

    render(<TelaAvistamentos />, { wrapper });

    expect(await screen.findByText("Você ainda não registrou avistamentos")).toBeTruthy();
  });

  it("erro: mensagem e 'Tentar novamente' busca de novo", async () => {
    mockGet.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
    mockGet.mockResolvedValueOnce(pagina([ESCORPIAO]));

    render(<TelaAvistamentos />, { wrapper });
    fireEvent.press(await screen.findByText("Tentar novamente"));

    expect(await screen.findByText("Escorpião")).toBeTruthy();
  });

  it("excluir pede confirmação, chama o DELETE e atualiza a lista", async () => {
    const alerta = jest.spyOn(Alert, "alert");
    mockGet.mockResolvedValueOnce(pagina([ESCORPIAO]));
    mockGet.mockResolvedValueOnce(pagina([]));
    mockDelete.mockResolvedValue({ status: 204 });

    render(<TelaAvistamentos />, { wrapper });
    fireEvent.press(
      await screen.findByLabelText("Excluir avistamento: Escorpião, 09/11/2026 19:30")
    );

    expect(alerta).toHaveBeenCalledWith(
      "Excluir avistamento",
      expect.stringContaining("Escorpião em 09/11/2026 19:30"),
      expect.any(Array)
    );
    expect(mockDelete).not.toHaveBeenCalled();

    tocarNoAlerta(alerta, "Excluir");

    expect(await screen.findByText("Você ainda não registrou avistamentos")).toBeTruthy();
    expect(mockDelete).toHaveBeenCalledWith("/api/avistamentos/7");
  });

  it("'Cancelar' na confirmação não exclui", async () => {
    const alerta = jest.spyOn(Alert, "alert");
    mockGet.mockResolvedValue(pagina([ESCORPIAO]));

    render(<TelaAvistamentos />, { wrapper });
    fireEvent.press(
      await screen.findByLabelText("Excluir avistamento: Escorpião, 09/11/2026 19:30")
    );
    tocarNoAlerta(alerta, "Cancelar");

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("erro ao excluir: avisa com a mensagem da API", async () => {
    const alerta = jest.spyOn(Alert, "alert");
    mockGet.mockResolvedValue(pagina([ESCORPIAO]));
    mockDelete.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

    render(<TelaAvistamentos />, { wrapper });
    fireEvent.press(
      await screen.findByLabelText("Excluir avistamento: Escorpião, 09/11/2026 19:30")
    );
    tocarNoAlerta(alerta, "Excluir");

    await waitFor(() =>
      expect(alerta).toHaveBeenLastCalledWith(
        "Não deu para excluir",
        "Sem conexão. Tente novamente."
      )
    );
  });

  it("tocar no avistamento abre a edição; o rodapé abre o novo", async () => {
    mockGet.mockResolvedValue(pagina([ESCORPIAO]));

    render(<TelaAvistamentos />, { wrapper });
    fireEvent.press(
      await screen.findByLabelText("Editar avistamento: Escorpião, 09/11/2026 19:30")
    );
    fireEvent.press(screen.getByText("Registrar avistamento"));

    expect((router.push as jest.Mock).mock.calls).toEqual([
      [{ pathname: "/avistamentos/[id]", params: { id: "7" } }],
      ["/avistamentos/novo"],
    ]);
  });
});
