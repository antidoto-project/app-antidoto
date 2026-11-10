import { QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { Alert, type AlertButton } from "react-native";

import { api } from "@/api/api";
import TelaOcorrencia from "@/app/(app)/ocorrencias/[id]";
import TelaOcorrencias from "@/app/(tabs)/ocorrencias";
import { intervaloDoResumo } from "@/hooks/useOcorrencias";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { Ocorrencia } from "@/types/ocorrencia.types";

// Só o HTTP é simulado: service, hooks (com a consulta a cada 3 s) e telas rodam de verdade
jest.mock("@/api/api", () => ({ api: { get: jest.fn(), delete: jest.fn() } }));

const mockGet = api.get as jest.Mock;
const mockDelete = api.delete as jest.Mock;
const mockParams = useLocalSearchParams as jest.Mock;

const PRONTA: Ocorrencia = {
  id: 10,
  tipoAnimal: "ESCORPIAO",
  faixaEtaria: "ADULTO",
  sintomas: ["DOR_LOCAL"],
  horaPicada: "2026-11-09T22:00:00.000Z",
  latitude: -23.56,
  longitude: -46.65,
  urgencia: "MODERADA",
  motivos: ["Avaliação necessária"],
  ligar192: false,
  unidadeId: 3,
  unidadeNome: "Hospital Exemplo Centro",
  statusResumo: "PRONTO",
  resumo: "Adulto picado por escorpião há 20 min, com dor local.",
  avisoResumo: "Resumo gerado por IA. Não substitui avaliação profissional.",
  aviso: "Procure atendimento médico imediatamente.",
  criadoEm: "2026-11-09T22:20:00.000Z",
};

const config = { headers: new AxiosHeaders() };
function erroHttp(status: number, data?: unknown) {
  const resposta = { status, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

function pagina(conteudo: Ocorrencia[]) {
  return {
    data: { conteudo, pagina: 0, tamanho: 50, totalElementos: conteudo.length, totalPaginas: 1 },
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

/** Posição de um texto na árvore renderizada (para conferir o que vem antes). */
function posicao(texto: string) {
  return JSON.stringify(screen.toJSON()).indexOf(texto);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  mockParams.mockReturnValue({ id: "10" });
});

describe("intervaloDoResumo (MVP-02 §3.2)", () => {
  it("consulta a cada 3 s só enquanto o resumo está PENDENTE", () => {
    expect(intervaloDoResumo({ ...PRONTA, statusResumo: "PENDENTE" })).toBe(3000);
    expect(intervaloDoResumo(PRONTA)).toBe(false);
    expect(intervaloDoResumo({ ...PRONTA, statusResumo: "MODELO_PADRAO" })).toBe(false);
    expect(intervaloDoResumo(undefined)).toBe(false);
  });
});

describe("TelaOcorrencias (T8)", () => {
  it("lista o histórico com animal, urgência, data e unidade; tocar abre o detalhe", async () => {
    mockGet.mockResolvedValue(pagina([PRONTA]));

    render(<TelaOcorrencias />, { wrapper });

    expect(await screen.findByText("Escorpião")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/ocorrencias/minhas", {
      params: { pagina: 0, tamanho: 50 },
    });
    expect(screen.getByLabelText("Urgência Moderada")).toBeTruthy();
    expect(screen.getByText("09/11/2026 19:20 · Hospital Exemplo Centro")).toBeTruthy();
    expect(screen.getByText("Resumo pronto")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ocorrência: Escorpião, 09/11/2026 19:20"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/ocorrencias/[id]",
      params: { id: "10" },
    });
  });

  it("vazio: explica como registrar", async () => {
    mockGet.mockResolvedValue(pagina([]));

    render(<TelaOcorrencias />, { wrapper });

    expect(await screen.findByText("Você ainda não registrou ocorrências")).toBeTruthy();
  });

  it("erro: mensagem e 'Tentar novamente'", async () => {
    mockGet.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
    mockGet.mockResolvedValueOnce(pagina([PRONTA]));

    render(<TelaOcorrencias />, { wrapper });
    fireEvent.press(await screen.findByText("Tentar novamente"));

    expect(await screen.findByText("Escorpião")).toBeTruthy();
  });
});

describe("TelaOcorrencia (T12)", () => {
  it("resumo pronto: cartão para a recepção, aviso da IA (RN-G7) e o aviso fixo (RN-G2)", async () => {
    mockGet.mockResolvedValue({ data: PRONTA });

    render(<TelaOcorrencia />, { wrapper });

    expect(await screen.findByText("Mostre este resumo na recepção")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/ocorrencias/10");
    expect(screen.getByText(PRONTA.resumo!)).toBeTruthy();
    expect(
      screen.getByText("Resumo gerado por IA. Não substitui avaliação profissional.")
    ).toBeTruthy();
    expect(screen.getByText("Procure atendimento médico imediatamente.")).toBeTruthy();
    expect(
      screen.getByText("Registrada em 09/11/2026 19:20 · Unidade: Hospital Exemplo Centro")
    ).toBeTruthy();
  });

  it("PENDENTE: 'Gerando resumo…' e consulta de novo a cada 3 s até ficar pronto", async () => {
    jest.useFakeTimers();
    try {
      mockGet.mockResolvedValueOnce({
        data: { ...PRONTA, statusResumo: "PENDENTE", resumo: null },
      });
      mockGet.mockResolvedValue({ data: PRONTA });

      render(<TelaOcorrencia />, { wrapper });
      expect(await screen.findByText("Gerando resumo para a unidade…")).toBeTruthy();
      expect(mockGet).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      expect(await screen.findByText("Mostre este resumo na recepção")).toBeTruthy();
      expect(mockGet).toHaveBeenCalledTimes(2);

      // Pronto: para de consultar
      await act(async () => {
        jest.advanceTimersByTime(9000);
      });
      expect(mockGet).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it("nunca rebaixa: se a regra do app der mais que o servidor, vale a do app", async () => {
    // Criança picada por escorpião é EMERGENCIA pela RN-U2, mesmo que o servidor diga MODERADA
    mockGet.mockResolvedValue({ data: { ...PRONTA, faixaEtaria: "CRIANCA" } });

    render(<TelaOcorrencia />, { wrapper });

    expect(await screen.findByLabelText("Urgência Emergência")).toBeTruthy();
    expect(screen.getByText("• Escorpião em criança")).toBeTruthy();
    // RN-G3: em EMERGENCIA, o 192 vem antes do selo
    expect(posicao("Ligar 192 (SAMU)")).toBeLessThan(posicao("Emergência"));
  });

  it("de outra pessoa (404): mostra o erro com 'Tentar novamente'", async () => {
    mockGet.mockRejectedValue(erroHttp(404, { mensagem: "Ocorrência não encontrada." }));

    render(<TelaOcorrencia />, { wrapper });

    expect(await screen.findByText("Ocorrência não encontrada.")).toBeTruthy();
    expect(screen.getByText("Tentar novamente")).toBeTruthy();
  });

  it("'Remover do histórico' pede confirmação, chama o DELETE e volta para a lista", async () => {
    const alerta = jest.spyOn(Alert, "alert");
    mockGet.mockResolvedValue({ data: PRONTA });
    mockDelete.mockResolvedValue({ status: 204 });

    render(<TelaOcorrencia />, { wrapper });
    fireEvent.press(await screen.findByText("Remover do histórico"));
    expect(mockDelete).not.toHaveBeenCalled();

    const botoes = alerta.mock.calls[0][2] as AlertButton[];
    botoes.find((botao) => botao.text === "Remover")?.onPress?.();

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/ocorrencias"));
    expect(mockDelete).toHaveBeenCalledWith("/api/ocorrencias/10");
  });
});
