import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError } from "axios";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { Linking } from "react-native";

import { api } from "@/api/api";
import TelaResultado from "@/app/sos/resultado";
import { useSessao } from "@/context/SessaoContext";
import { useLocalizacao } from "@/hooks/useLocalizacao";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { UnidadeProxima } from "@/types/unidade.types";

// HTTP, sessão e GPS simulados; o registro (hook + service) roda de verdade
jest.mock("@/api/api", () => ({ api: { post: jest.fn() } }));
jest.mock("@/context/SessaoContext", () => ({ useSessao: jest.fn() }));
jest.mock("@/hooks/useLocalizacao", () => ({ useLocalizacao: jest.fn() }));

// As unidades (GPS + API) têm teste próprio (unidades.test.tsx): aqui, só o que a tela passa
const mockUnidades = jest.fn();
jest.mock("@/components/sos/UnidadesProximas", () => ({
  UnidadesProximas: (props: unknown) => {
    mockUnidades(props);
    return null;
  },
}));

const mockParams = useLocalSearchParams as jest.Mock;
const mockRedirect = Redirect as unknown as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockUseSessao = useSessao as jest.Mock;
const mockUseLocalizacao = useLocalizacao as jest.Mock;

const PAULISTA = { latitude: -23.5614, longitude: -46.6559 };
const LOGADA = { sessao: { token: "t", usuario: { id: 1, nome: "Ana Souza" } } };

function gps(coordenadas: typeof PAULISTA | null) {
  mockUseLocalizacao.mockReturnValue({
    estado: coordenadas ? "pronta" : "negada",
    coordenadas,
    podePedirDeNovo: true,
    buscar: jest.fn(),
  });
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

const MINUTO = 60_000;
const isoHa = (ms: number) => new Date(Date.now() - ms).toISOString();

/** Posição de um texto na árvore renderizada (para conferir o que vem antes). */
function posicao(texto: string) {
  return JSON.stringify(screen.toJSON()).indexOf(texto);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  mockUseSessao.mockReturnValue({ sessao: null });
  gps(PAULISTA);
});

describe("TelaResultado (T4)", () => {
  it("EMERGENCIA: 'Ligar 192' no topo, antes do selo (RN-G3), e os motivos", async () => {
    mockParams.mockReturnValue({
      tipoAnimal: "ARANHA",
      faixaEtaria: "ADULTO",
      sintomas: "FALTA_DE_AR",
      horaPicada: isoHa(10 * MINUTO),
    });

    render(<TelaResultado />, { wrapper });

    expect(await screen.findByLabelText("Urgência Emergência")).toBeTruthy();
    expect(screen.getAllByText("Ligar 192 (SAMU)")).toHaveLength(1);
    expect(posicao("Ligar 192 (SAMU)")).toBeLessThan(posicao("Emergência"));
    expect(screen.getByText("• Sinal de alerta")).toBeTruthy();
    expect(screen.getByText("• Animal com risco de agravamento")).toBeTruthy();
  });

  it("ALTA: o 192 fica no fim da tela", async () => {
    mockParams.mockReturnValue({
      tipoAnimal: "SERPENTE",
      faixaEtaria: "ADULTO",
      sintomas: "",
      horaPicada: isoHa(10 * MINUTO),
    });

    render(<TelaResultado />, { wrapper });

    expect(await screen.findByLabelText("Urgência Alta")).toBeTruthy();
    expect(posicao("Ligar 192 (SAMU)")).toBeGreaterThan(posicao("Suas respostas"));
  });

  it("MODERADA: 'Avaliação necessária' (nunca 'sem urgência') e o aviso fixo (RN-G2)", async () => {
    mockParams.mockReturnValue({
      tipoAnimal: "ESCORPIAO",
      faixaEtaria: "ADULTO",
      sintomas: "DOR_LOCAL",
      horaPicada: isoHa(10 * MINUTO),
    });

    render(<TelaResultado />, { wrapper });

    expect(await screen.findByLabelText("Urgência Moderada")).toBeTruthy();
    expect(screen.getByText("• Avaliação necessária")).toBeTruthy();
    expect(screen.getByText("Procure atendimento médico imediatamente.")).toBeTruthy();
    expect(screen.queryByText(/sem urgência|não é perigoso/i)).toBeNull();
  });

  it("mostra as respostas da triagem", async () => {
    mockParams.mockReturnValue({
      tipoAnimal: "ESCORPIAO",
      faixaEtaria: "CRIANCA",
      sintomas: "",
      horaPicada: isoHa(25 * MINUTO),
    });

    render(<TelaResultado />, { wrapper });

    expect(await screen.findByText("🦂 Escorpião")).toBeTruthy();
    expect(screen.getByText("Criança (0 a 9 anos)")).toBeTruthy();
    expect(screen.getByText("há 25 min")).toBeTruthy();
    expect(screen.getByText("Nenhum marcado")).toBeTruthy();
  });

  it("'Ligar 192 (SAMU)' abre o discador", async () => {
    const abrir = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    mockParams.mockReturnValue({
      tipoAnimal: "ABELHA",
      faixaEtaria: "ADULTO",
      sintomas: "MUITAS_PICADAS_ALERGIA",
      horaPicada: isoHa(MINUTO),
    });

    render(<TelaResultado />, { wrapper });
    fireEvent.press(await screen.findByLabelText("Ligar 192, SAMU"));

    expect(abrir).toHaveBeenCalledWith("tel:192");
  });

  it("mostra as unidades do animal e abre os primeiros socorros dele", async () => {
    mockParams.mockReturnValue({
      tipoAnimal: "LAGARTA",
      faixaEtaria: "ADULTO",
      sintomas: "",
      horaPicada: isoHa(MINUTO),
    });

    render(<TelaResultado />, { wrapper });
    fireEvent.press(await screen.findByText("O que fazer agora: primeiros socorros"));

    expect(mockUnidades).toHaveBeenCalledWith(
      expect.objectContaining({ tipoAnimal: "LAGARTA", onEscolherUnidade: undefined })
    );
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/sos/primeiros-socorros/[tipoAnimal]",
      params: { tipoAnimal: "LAGARTA" },
    });
  });

  it("params que faltam ou fora do contrato: volta para a triagem", () => {
    mockParams.mockReturnValue({ tipoAnimal: "TUBARAO" });

    render(<TelaResultado />, { wrapper });

    expect(mockRedirect.mock.calls.at(-1)?.[0].href).toBe("/sos/triagem");
  });
});

describe("TelaResultado (T4) — registrar a ocorrência", () => {
  const TRIAGEM = {
    tipoAnimal: "ESCORPIAO",
    faixaEtaria: "CRIANCA",
    sintomas: "DOR_LOCAL,VOMITOS",
    horaPicada: isoHa(20 * MINUTO),
  };

  beforeEach(() => {
    mockParams.mockReturnValue(TRIAGEM);
  });

  it("deslogado: 'Entre para salvar a ocorrência' leva ao login com as respostas", async () => {
    render(<TelaResultado />, { wrapper });

    fireEvent.press(await screen.findByText("Entre para salvar a ocorrência"));

    expect(router.push).toHaveBeenCalledWith({ pathname: "/login", params: TRIAGEM });
    expect(screen.queryByText("Registrar ocorrência")).toBeNull();
  });

  it("logado: registra sem unidade (POST do contrato) e abre a ocorrência", async () => {
    mockUseSessao.mockReturnValue(LOGADA);
    mockPost.mockResolvedValue({ data: { id: 10, statusResumo: "PENDENTE" } });

    render(<TelaResultado />, { wrapper });
    fireEvent.press(await screen.findByText("Registrar ocorrência"));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/ocorrencias/[id]",
        params: { id: "10" },
      })
    );
    expect(mockPost).toHaveBeenCalledWith("/api/ocorrencias", {
      tipoAnimal: "ESCORPIAO",
      faixaEtaria: "CRIANCA",
      sintomas: ["DOR_LOCAL", "VOMITOS"],
      horaPicada: TRIAGEM.horaPicada,
      latitude: -23.5614,
      longitude: -46.6559,
      unidadeId: null,
    });
  });

  it("logado: 'Vou para esta unidade' registra com a unidade escolhida", async () => {
    mockUseSessao.mockReturnValue(LOGADA);
    mockPost.mockResolvedValue({ data: { id: 11, statusResumo: "PENDENTE" } });

    render(<TelaResultado />, { wrapper });
    await screen.findByText("Registrar ocorrência");
    const { onEscolherUnidade } = mockUnidades.mock.calls.at(-1)[0];
    onEscolherUnidade({ id: 3 } as UnidadeProxima);

    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockPost.mock.calls[0][1].unidadeId).toBe(3);
  });

  it("sem localização: não dá para registrar (o contrato exige as coordenadas)", async () => {
    mockUseSessao.mockReturnValue(LOGADA);
    gps(null);

    render(<TelaResultado />, { wrapper });
    fireEvent.press(await screen.findByText("Registrar ocorrência"));

    expect(
      screen.getByText("Para registrar, o app precisa da sua localização (veja as unidades acima).")
    ).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("erro da API: mostra a mensagem e continua no resultado", async () => {
    mockUseSessao.mockReturnValue(LOGADA);
    mockPost.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

    render(<TelaResultado />, { wrapper });
    fireEvent.press(await screen.findByText("Registrar ocorrência"));

    expect(await screen.findByText("Sem conexão. Tente novamente.")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
