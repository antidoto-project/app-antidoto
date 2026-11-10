import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { AxiosError } from "axios";
import * as Location from "expo-location";
import type { ReactNode } from "react";
import { Linking } from "react-native";

import { api } from "@/api/api";
import { UnidadesProximas } from "@/components/sos/UnidadesProximas";
import { useLocalizacao } from "@/hooks/useLocalizacao";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { TipoAnimal } from "@/types/enums.types";
import type { UnidadeProxima } from "@/types/unidade.types";

// Só o HTTP e o GPS são simulados: service, hook e componentes rodam de verdade
jest.mock("@/api/api", () => ({ api: { get: jest.fn() } }));
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mockGet = api.get as jest.Mock;
const mockPermissao = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockUltimaPosicao = Location.getLastKnownPositionAsync as jest.Mock;
const mockPosicaoAtual = Location.getCurrentPositionAsync as jest.Mock;

const AQUI = { coords: { latitude: -23.55, longitude: -46.63 } };

const HOSPITAL: UnidadeProxima = {
  id: 1,
  nome: "Hospital Exemplo Centro",
  tipo: "HOSPITAL",
  endereco: "Rua Exemplo, 100 - Centro, São Paulo/SP",
  telefone: "1130000000",
  latitude: -23.5505,
  longitude: -46.6333,
  atende24h: true,
  distanciaKm: 2.4,
  sorosCompativeis: ["ANTIESCORPIONICO", "ANTIARACNIDICO"],
};

/** Como no resultado: o GPS fica na tela e vai para as unidades. */
function UnidadesComGps({
  tipoAnimal,
  onEscolherUnidade,
}: {
  tipoAnimal: TipoAnimal;
  onEscolherUnidade?: (unidade: UnidadeProxima) => void;
}) {
  const localizacao = useLocalizacao();
  return (
    <UnidadesProximas
      tipoAnimal={tipoAnimal}
      localizacao={localizacao}
      onEscolherUnidade={onEscolherUnidade}
    />
  );
}

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

function gpsLiberado() {
  mockPermissao.mockResolvedValue({ granted: true, canAskAgain: true });
  mockUltimaPosicao.mockResolvedValue(null);
  mockPosicaoAtual.mockResolvedValue(AQUI);
}

beforeEach(() => {
  // Só estes: resetAllMocks apagaria também o mock das fontes do jest.setup.js
  [mockGet, mockPermissao, mockUltimaPosicao, mockPosicaoAtual].forEach((mock) => mock.mockReset());
  jest.restoreAllMocks();
});

describe("UnidadesProximas (T4)", () => {
  it("com o GPS, busca as unidades do animal e mostra distância e soros", async () => {
    gpsLiberado();
    mockGet.mockResolvedValue({ data: [HOSPITAL] });

    render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });

    expect(await screen.findByText("Hospital Exemplo Centro")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/unidades/proximas", {
      params: { latitude: -23.55, longitude: -46.63, tipoAnimal: "ESCORPIAO", limite: 5 },
    });
    expect(screen.getByText("Unidades com o soro certo")).toBeTruthy();
    expect(screen.getByText("2,4 km")).toBeTruthy();
    expect(screen.getByText("Hospital · 24 horas")).toBeTruthy();
    expect(screen.getByText("Soro antiescorpiônico")).toBeTruthy();
    expect(screen.getByText("Soro antiaracnídico")).toBeTruthy();
  });

  it("'Ligar' abre o discador e 'Rota' abre o Google Maps", async () => {
    gpsLiberado();
    mockGet.mockResolvedValue({ data: [HOSPITAL] });
    const abrir = jest.spyOn(Linking, "openURL").mockResolvedValue(true);

    render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });
    fireEvent.press(await screen.findByLabelText("Ligar para Hospital Exemplo Centro"));
    fireEvent.press(screen.getByLabelText("Rota até Hospital Exemplo Centro"));

    expect(abrir.mock.calls).toEqual([
      ["tel:1130000000"],
      ["https://www.google.com/maps/dir/?api=1&destination=-23.5505,-46.6333"],
    ]);
  });

  it("usa a última posição conhecida, se for recente, sem esperar o GPS", async () => {
    mockPermissao.mockResolvedValue({ granted: true, canAskAgain: true });
    mockUltimaPosicao.mockResolvedValue(AQUI);
    mockGet.mockResolvedValue({ data: [HOSPITAL] });

    render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });

    expect(await screen.findByText("Hospital Exemplo Centro")).toBeTruthy();
    expect(mockPosicaoAtual).not.toHaveBeenCalled();
  });

  it("localização negada: mensagem do MVP-02 e 'Tentar novamente' pede de novo", async () => {
    mockPermissao.mockResolvedValueOnce({ granted: false, canAskAgain: true });
    gpsLiberado();
    mockGet.mockResolvedValue({ data: [HOSPITAL] });

    render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });

    expect(
      await screen.findByText("Ative a localização para ver as unidades próximas")
    ).toBeTruthy();
    expect(screen.queryByText("Abrir as configurações")).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Tentar novamente"));

    expect(await screen.findByText("Hospital Exemplo Centro")).toBeTruthy();
    expect(mockPermissao).toHaveBeenCalledTimes(2);
  });

  it("negada de vez: oferece abrir as configurações do aparelho", async () => {
    mockPermissao.mockResolvedValue({ granted: false, canAskAgain: false });
    const abrirConfiguracoes = jest.spyOn(Linking, "openSettings").mockResolvedValue();

    render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });
    fireEvent.press(await screen.findByText("Abrir as configurações"));

    expect(abrirConfiguracoes).toHaveBeenCalled();
  });

  it("GPS desligado ou sem sinal: pede para conferir o GPS", async () => {
    mockPermissao.mockResolvedValue({ granted: true, canAskAgain: true });
    mockUltimaPosicao.mockResolvedValue(null);
    mockPosicaoAtual.mockRejectedValue(new Error("Location services are disabled"));

    render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });

    expect(
      await screen.findByText("Não deu para achar a sua localização. Confira se o GPS está ligado.")
    ).toBeTruthy();
  });

  it("erro da API: mensagem e 'Tentar novamente' busca de novo", async () => {
    gpsLiberado();
    mockGet.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
    mockGet.mockResolvedValueOnce({ data: [HOSPITAL] });

    render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });

    expect(await screen.findByText("Sem conexão. Tente novamente.")).toBeTruthy();
    fireEvent.press(screen.getByText("Tentar novamente"));

    expect(await screen.findByText("Hospital Exemplo Centro")).toBeTruthy();
  });

  it("RN-S4: lista vazia mostra o texto do contrato", async () => {
    gpsLiberado();
    mockGet.mockResolvedValue({ data: [] });

    render(<UnidadesComGps tipoAnimal="SERPENTE" />, { wrapper });

    expect(await screen.findByText("Nenhuma unidade com soro encontrada. Ligue 192.")).toBeTruthy();
  });

  it("abelha: não existe soro; mostra hospital ou UPA como atendimento de urgência", async () => {
    gpsLiberado();
    mockGet.mockResolvedValue({ data: [{ ...HOSPITAL, tipo: "UPA", sorosCompativeis: [] }] });

    render(<UnidadesComGps tipoAnimal="ABELHA" />, { wrapper });

    expect(await screen.findByText("Atendimento de urgência")).toBeTruthy();
    expect(screen.getByText("Atendimento de urgência perto de você")).toBeTruthy();
    expect(screen.queryByText(/^Soro /)).toBeNull();
  });

  it("deslogado: sem 'Vou para esta unidade'; logado: o botão escolhe a unidade", async () => {
    gpsLiberado();
    mockGet.mockResolvedValue({ data: [HOSPITAL] });
    const escolher = jest.fn();

    const { rerender } = render(<UnidadesComGps tipoAnimal="ESCORPIAO" />, { wrapper });
    expect(await screen.findByText("Hospital Exemplo Centro")).toBeTruthy();
    expect(screen.queryByText("Vou para esta unidade")).toBeNull();

    rerender(<UnidadesComGps tipoAnimal="ESCORPIAO" onEscolherUnidade={escolher} />);
    fireEvent.press(await screen.findByLabelText("Vou para Hospital Exemplo Centro"));

    expect(escolher).toHaveBeenCalledWith(HOSPITAL);
  });
});
