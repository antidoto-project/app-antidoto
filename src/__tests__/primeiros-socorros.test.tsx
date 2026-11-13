import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { AxiosError } from "axios";
import { Redirect, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaPrimeirosSocorros from "@/app/sos/primeiros-socorros/[tipoAnimal]";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { PrimeirosSocorros } from "@/types/conteudo.types";

jest.mock("@/api/api", () => ({ api: { get: jest.fn() } }));

const mockGet = api.get as jest.Mock;
const mockParams = useLocalSearchParams as jest.Mock;
const mockRedirect = Redirect as unknown as jest.Mock;

/** O que a API devolve para a cobra (GET /api/conteudo/primeiros-socorros/SERPENTE). */
const DA_COBRA: PrimeirosSocorros = {
  tipoAnimal: "SERPENTE",
  faca: ["Afaste-se do animal.", "Lave o local com água e sabão."],
  naoFaca: ["Amarrar o local ou fazer torniquete.", "Sugar o veneno."],
  atencao: ["Mantenha o membro picado parado e a vítima deitada, se possível."],
};

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: DA_COBRA });
});

describe("TelaPrimeirosSocorros (T5)", () => {
  it("mostra o Faça, o NÃO faça e a atenção que vêm da API, com o aviso fixo (RN-G2)", async () => {
    mockParams.mockReturnValue({ tipoAnimal: "SERPENTE" });

    render(<TelaPrimeirosSocorros />, { wrapper });

    expect(await screen.findByText("Lave o local com água e sabão.")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/api/conteudo/primeiros-socorros/SERPENTE");
    expect(screen.getByText("Primeiros socorros")).toBeTruthy();
    expect(screen.getByText("Cobra")).toBeTruthy();
    expect(screen.getByText("Procure atendimento médico imediatamente.")).toBeTruthy();
    expect(screen.getByText("Amarrar o local ou fazer torniquete.")).toBeTruthy();
    expect(
      screen.getByText("Mantenha o membro picado parado e a vítima deitada, se possível.")
    ).toBeTruthy();
  });

  it("sempre com o 192, o 193 e o Disque-Intoxicação (RN-G8)", async () => {
    mockParams.mockReturnValue({ tipoAnimal: "NAO_SEI" });

    render(<TelaPrimeirosSocorros />, { wrapper });

    expect(await screen.findByLabelText("Ligar para SAMU, 192")).toBeTruthy();
    expect(screen.getByLabelText("Ligar para Bombeiros, 193")).toBeTruthy();
    expect(screen.getByLabelText("Ligar para Disque-Intoxicação, 0800 722 6001")).toBeTruthy();
  });

  it("sem internet: o erro com Tentar novamente, e o aviso e o 192 continuam na tela", async () => {
    mockParams.mockReturnValue({ tipoAnimal: "ESCORPIAO" });
    mockGet.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));

    render(<TelaPrimeirosSocorros />, { wrapper });

    expect(await screen.findByText("Tentar novamente")).toBeTruthy();
    expect(screen.getByText("Procure atendimento médico imediatamente.")).toBeTruthy();
    expect(screen.getByLabelText("Ligar para SAMU, 192")).toBeTruthy();

    fireEvent.press(screen.getByText("Tentar novamente"));
    expect(await screen.findByText("Lave o local com água e sabão.")).toBeTruthy();
  });

  it("animal fora do contrato: volta para a triagem", () => {
    mockParams.mockReturnValue({ tipoAnimal: "TUBARAO" });

    render(<TelaPrimeirosSocorros />, { wrapper });

    expect(mockRedirect.mock.calls.at(-1)?.[0].href).toBe("/sos/triagem");
  });
});
