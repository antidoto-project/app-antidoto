import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaEditarAvistamento from "@/app/(app)/avistamentos/[id]";
import TelaNovoAvistamento from "@/app/(app)/avistamentos/novo";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { Avistamento } from "@/types/avistamento.types";

// Só o HTTP e o GPS são simulados: schema, react-hook-form, hooks e service rodam de verdade
jest.mock("@/api/api", () => ({ api: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;
const mockParams = useLocalSearchParams as jest.Mock;
const mockPermissao = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockUltimaPosicao = Location.getLastKnownPositionAsync as jest.Mock;
const mockPosicaoAtual = Location.getCurrentPositionAsync as jest.Mock;

const SALVO: Avistamento = {
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

const config = { headers: new AxiosHeaders() };
function erroHttp(status: number, data?: unknown) {
  const resposta = { status, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

function gpsLiberado() {
  mockPermissao.mockResolvedValue({ granted: true, canAskAgain: true });
  mockUltimaPosicao.mockResolvedValue(null);
  mockPosicaoAtual.mockResolvedValue({ coords: { latitude: -22.9068, longitude: -43.1729 } });
}

/** Animal, local e localização: o mínimo para salvar. */
async function preencherNovo() {
  fireEvent.press(await screen.findByRole("radio", { name: "Escorpião" }));
  fireEvent.press(screen.getByRole("radio", { name: "Quintal" }));
  fireEvent.press(screen.getByText("Usar minha localização"));
  await screen.findByText("Localização registrada (-22.9068, -43.1729)");
}

beforeEach(() => {
  // Só estes: resetAllMocks apagaria também o mock das fontes do jest.setup.js
  [mockGet, mockPost, mockPut, mockPermissao, mockUltimaPosicao, mockPosicaoAtual].forEach((mock) =>
    mock.mockReset()
  );
  jest.clearAllMocks();
});

describe("TelaNovoAvistamento (T10)", () => {
  it("sem animal, local e localização: mostra o que falta e não chama a API", async () => {
    render(<TelaNovoAvistamento />, { wrapper });

    fireEvent.press(await screen.findByText("Salvar avistamento"));

    expect(await screen.findByText("Escolha o animal (ou “Não sei”)")).toBeTruthy();
    expect(screen.getByText("Escolha onde você viu")).toBeTruthy();
    expect(screen.getByText("Toque em “Usar minha localização”")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("salva com o payload do contrato, a data de agora, e volta para a lista", async () => {
    gpsLiberado();
    mockPost.mockResolvedValue({ data: { ...SALVO, id: 8 } });

    render(<TelaNovoAvistamento />, { wrapper });
    await preencherNovo();
    fireEvent.changeText(screen.getByLabelText("Observação (opcional)"), "  Perto do ralo  ");
    fireEvent.press(screen.getByText("Salvar avistamento"));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    const [rota, corpo] = mockPost.mock.calls[0];
    expect(rota).toBe("/api/avistamentos");
    expect(corpo).toEqual({
      tipoAnimal: "ESCORPIAO",
      local: "QUINTAL",
      latitude: -22.9068,
      longitude: -43.1729,
      dataHora: expect.any(String),
      observacao: "Perto do ralo",
    });
    expect(Math.abs(Date.now() - Date.parse(corpo.dataHora))).toBeLessThan(5_000);
  });

  it("sem observação: manda null", async () => {
    gpsLiberado();
    mockPost.mockResolvedValue({ data: SALVO });

    render(<TelaNovoAvistamento />, { wrapper });
    await preencherNovo();
    fireEvent.press(screen.getByText("Salvar avistamento"));

    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockPost.mock.calls[0][1].observacao).toBeNull();
  });

  it("localização negada: avisa e não salva", async () => {
    mockPermissao.mockResolvedValue({ granted: false, canAskAgain: true });

    render(<TelaNovoAvistamento />, { wrapper });
    fireEvent.press(await screen.findByText("Usar minha localização"));

    expect(
      await screen.findByText("Ative a localização para registrar onde você viu o animal.")
    ).toBeTruthy();
  });

  it("400 com campos: a mensagem da API aparece no campo", async () => {
    gpsLiberado();
    mockPost.mockRejectedValue(
      erroHttp(400, { campos: [{ campo: "observacao", mensagem: "Texto não permitido" }] })
    );

    render(<TelaNovoAvistamento />, { wrapper });
    await preencherNovo();
    fireEvent.press(screen.getByText("Salvar avistamento"));

    expect(await screen.findByText("Texto não permitido")).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();
  });

  it("data no futuro recusada pela API (campo que a tela não tem): mensagem geral", async () => {
    gpsLiberado();
    mockPost.mockRejectedValue(
      erroHttp(400, {
        campos: [{ campo: "dataHora", mensagem: "A data não pode estar no futuro" }],
      })
    );

    render(<TelaNovoAvistamento />, { wrapper });
    await preencherNovo();
    fireEvent.press(screen.getByText("Salvar avistamento"));

    expect(await screen.findByText("A data não pode estar no futuro")).toBeTruthy();
  });
});

describe("TelaEditarAvistamento (T11)", () => {
  it("vem preenchido e salva com PUT, mantendo a data original", async () => {
    mockParams.mockReturnValue({ id: "7" });
    mockGet.mockResolvedValue({ data: SALVO });
    mockPut.mockResolvedValue({ data: { ...SALVO, local: "CASA" } });

    render(<TelaEditarAvistamento />, { wrapper });

    expect(await screen.findByText("Visto em 09/11/2026 19:30.")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/avistamentos/7");
    expect(screen.getByRole("radio", { name: "Escorpião", checked: true })).toBeTruthy();
    expect(screen.getByText("Localização registrada (-23.5500, -46.6300)")).toBeTruthy();
    expect(screen.getByDisplayValue("Perto do ralo")).toBeTruthy();

    fireEvent.press(screen.getByRole("radio", { name: "Casa" }));
    fireEvent.press(screen.getByText("Salvar alterações"));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    expect(mockPut).toHaveBeenCalledWith("/api/avistamentos/7", {
      tipoAnimal: "ESCORPIAO",
      local: "CASA",
      latitude: -23.55,
      longitude: -46.63,
      dataHora: "2026-11-09T22:30:00.000Z",
      observacao: "Perto do ralo",
    });
  });

  it("de outra pessoa ou apagado (404, RN-G5): mostra o erro com 'Tentar novamente'", async () => {
    mockParams.mockReturnValue({ id: "99" });
    mockGet.mockRejectedValue(erroHttp(404, { mensagem: "Avistamento não encontrado." }));

    render(<TelaEditarAvistamento />, { wrapper });

    expect(await screen.findByText("Avistamento não encontrado.")).toBeTruthy();
    expect(screen.getByText("Tentar novamente")).toBeTruthy();
  });
});
