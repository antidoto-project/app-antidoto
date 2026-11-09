import { fireEvent, render, screen } from "@testing-library/react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";

import TelaResultado from "@/app/sos/resultado";

const mockParams = useLocalSearchParams as jest.Mock;
const mockRedirect = Redirect as unknown as jest.Mock;

const MINUTO = 60_000;
const isoHa = (ms: number) => new Date(Date.now() - ms).toISOString();

/** Posição de um texto na árvore renderizada (para conferir o que vem antes). */
function posicao(texto: string) {
  return JSON.stringify(screen.toJSON()).indexOf(texto);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("TelaResultado (T4)", () => {
  it("EMERGENCIA: 'Ligar 192' no topo, antes do selo (RN-G3), e os motivos", async () => {
    mockParams.mockReturnValue({
      tipoAnimal: "ARANHA",
      faixaEtaria: "ADULTO",
      sintomas: "FALTA_DE_AR",
      horaPicada: isoHa(10 * MINUTO),
    });

    render(<TelaResultado />);

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

    render(<TelaResultado />);

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

    render(<TelaResultado />);

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

    render(<TelaResultado />);

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

    render(<TelaResultado />);
    fireEvent.press(await screen.findByLabelText("Ligar 192, SAMU"));

    expect(abrir).toHaveBeenCalledWith("tel:192");
  });

  it("params que faltam ou fora do contrato: volta para a triagem", () => {
    mockParams.mockReturnValue({ tipoAnimal: "TUBARAO" });

    render(<TelaResultado />);

    expect(mockRedirect.mock.calls.at(-1)?.[0].href).toBe("/sos/triagem");
  });
});
