import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaAtualizarOcorrencia from "@/app/(app)/ocorrencias/[id]/editar";
import TelaOcorrencia from "@/app/(app)/ocorrencias/[id]/index";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { Ocorrencia } from "@/types/ocorrencia.types";
import type { UnidadeProxima } from "@/types/unidade.types";

// Só o HTTP é simulado: service, hooks, schema e telas rodam de verdade
jest.mock("@/api/api", () => ({ api: { get: jest.fn(), put: jest.fn() } }));

const mockGet = api.get as jest.Mock;
const mockPut = api.put as jest.Mock;
const mockParams = useLocalSearchParams as jest.Mock;

const REGISTRADA: Ocorrencia = {
  id: 10,
  tipoAnimal: "SERPENTE",
  faixaEtaria: "ADULTO",
  sintomas: ["DOR_LOCAL"],
  horaPicada: "2026-11-09T22:00:00.000Z",
  latitude: -23.56,
  longitude: -46.65,
  urgencia: "ALTA",
  motivos: ["Animal com risco de agravamento"],
  ligar192: false,
  unidadeId: null,
  unidadeNome: null,
  statusResumo: "MODELO_PADRAO",
  resumo: "PRÉ-ATENDIMENTO — Antídoto\nAnimal: Cobra",
  avisoResumo: "Resumo gerado por IA. Não substitui avaliação profissional.",
  aviso: "Procure atendimento médico imediatamente.",
  criadoEm: "2026-11-09T22:20:00.000Z",
};

const HOSPITAL: UnidadeProxima = {
  id: 3,
  nome: "Hospital Exemplo Centro",
  tipo: "HOSPITAL",
  endereco: "Rua Exemplo, 100",
  telefone: "1130000000",
  latitude: -23.55,
  longitude: -46.64,
  atende24h: true,
  distanciaKm: 1.2,
  sorosCompativeis: ["ANTIBOTROPICO"],
};

const config = { headers: new AxiosHeaders() };
function erroHttp(status: number, data?: unknown) {
  const resposta = { status, statusText: "", headers: {}, config, data } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams.mockReturnValue({ id: "10" });
  mockGet.mockImplementation((url: string) =>
    Promise.resolve({ data: url === "/api/unidades/proximas" ? [HOSPITAL] : REGISTRADA })
  );
});

describe("TelaAtualizarOcorrencia (T12b)", () => {
  it("começa com o que está salvo e manda os sintomas e a unidade novos no PUT", async () => {
    mockPut.mockResolvedValue({
      data: { ...REGISTRADA, sintomas: ["DOR_LOCAL", "SANGRAMENTO"], statusResumo: "PENDENTE" },
    });

    render(<TelaAtualizarOcorrencia />, { wrapper });

    // As unidades são as do lugar da picada, para o animal da ocorrência
    expect(await screen.findByText("Hospital Exemplo Centro")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/unidades/proximas", {
      params: { latitude: -23.56, longitude: -46.65, tipoAnimal: "SERPENTE", limite: 5 },
    });
    expect(
      screen.getByRole("radio", { name: "Ainda não escolhi" }).props.accessibilityState
    ).toMatchObject({ checked: true });

    fireEvent.press(screen.getByText("Sangramento ou urina escura"));
    fireEvent.press(screen.getByText("Hospital Exemplo Centro"));
    fireEvent.press(screen.getByText("Salvar alterações"));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    // O que não está na tela vai como no registro
    expect(mockPut).toHaveBeenCalledWith("/api/ocorrencias/10", {
      tipoAnimal: "SERPENTE",
      faixaEtaria: "ADULTO",
      sintomas: ["DOR_LOCAL", "SANGRAMENTO"],
      horaPicada: "2026-11-09T22:00:00.000Z",
      latitude: -23.56,
      longitude: -46.65,
      unidadeId: 3,
    });
  });

  it("resumo ainda sendo gerado (409): mostra a mensagem da API e fica na tela", async () => {
    mockPut.mockRejectedValue(
      erroHttp(409, {
        status: 409,
        erro: "Conflict",
        mensagem: "O resumo ainda está sendo gerado. Tente de novo em alguns segundos.",
        campos: [],
      })
    );

    render(<TelaAtualizarOcorrencia />, { wrapper });
    await screen.findByText("Hospital Exemplo Centro");
    fireEvent.press(screen.getByText("Salvar alterações"));

    expect(
      await screen.findByText("O resumo ainda está sendo gerado. Tente de novo em alguns segundos.")
    ).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();
  });

  it("sem as unidades próximas, ainda dá para atualizar os sintomas", async () => {
    mockGet.mockImplementation((url: string) =>
      url === "/api/unidades/proximas"
        ? Promise.reject(new AxiosError("Network Error", "ERR_NETWORK"))
        : Promise.resolve({ data: { ...REGISTRADA, unidadeId: 3, unidadeNome: "UPA Exemplo" } })
    );

    render(<TelaAtualizarOcorrencia />, { wrapper });

    expect(await screen.findByText(/Não deu para buscar as unidades próximas/)).toBeTruthy();
    // A escolhida no registro continua como opção
    expect(screen.getByRole("radio", { name: "UPA Exemplo, Escolhida no registro" })).toBeTruthy();
  });
});

describe("TelaOcorrencia (T12): atualizar", () => {
  it("com o resumo pronto, 'Atualizar sintomas ou unidade' abre a atualização", async () => {
    render(<TelaOcorrencia />, { wrapper });

    fireEvent.press(await screen.findByText("Atualizar sintomas ou unidade"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/ocorrencias/[id]/editar",
      params: { id: "10" },
    });
  });

  it("com o resumo PENDENTE, o botão não aparece (a API responderia 409)", async () => {
    mockGet.mockResolvedValue({ data: { ...REGISTRADA, statusResumo: "PENDENTE", resumo: null } });

    render(<TelaOcorrencia />, { wrapper });

    expect(await screen.findByText("Gerando resumo para a unidade…")).toBeTruthy();
    expect(screen.queryByText("Atualizar sintomas ou unidade")).toBeNull();
  });
});
