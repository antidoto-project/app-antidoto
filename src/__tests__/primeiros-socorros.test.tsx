import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";

import TelaPrimeirosSocorros from "@/app/sos/primeiros-socorros/[tipoAnimal]";
import { conteudoService } from "@/services/conteudo.service";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import { TIPOS_ANIMAL } from "@/types/enums.types";

const mockParams = useLocalSearchParams as jest.Mock;
const mockRedirect = Redirect as unknown as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={criarClienteDeTeste()}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TelaPrimeirosSocorros (T5)", () => {
  it("mostra Faça, NÃO faça e a atenção do animal, com o aviso fixo (RN-G2)", async () => {
    mockParams.mockReturnValue({ tipoAnimal: "SERPENTE" });

    render(<TelaPrimeirosSocorros />, { wrapper });

    expect(await screen.findByText("Primeiros socorros")).toBeTruthy();
    expect(screen.getByText("Cobra")).toBeTruthy();
    expect(screen.getByText("Procure atendimento médico imediatamente.")).toBeTruthy();
    expect(screen.getByText("Lave o local com água e sabão.")).toBeTruthy();
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

  it("animal fora do contrato: volta para a triagem", () => {
    mockParams.mockReturnValue({ tipoAnimal: "TUBARAO" });

    render(<TelaPrimeirosSocorros />, { wrapper });

    expect(mockRedirect.mock.calls.at(-1)?.[0].href).toBe("/sos/triagem");
  });
});

describe("conteúdo de primeiros socorros (MVP-02 §6)", () => {
  it.each(TIPOS_ANIMAL)(
    "%s: tem Faça, NÃO faça e atenção, e nunca fala de dose",
    async (animal) => {
      const conteudo = await conteudoService.buscarPrimeirosSocorros(animal);

      expect(conteudo.faca.length).toBeGreaterThan(0);
      expect(conteudo.naoFaca.length).toBeGreaterThan(0);
      expect(conteudo.atencao).toContain(
        "Não tente capturar o animal. Se for seguro, tire uma foto de longe."
      );
      // CLAUDE.md §1: nunca dose, remédio ou tratamento ("remédio caseiro" só no NÃO faça)
      const orientacoes = [...conteudo.faca, ...conteudo.atencao].join(" ");
      expect(orientacoes).not.toMatch(/dose|\bmg\b|\bml\b|remédio|medicamento|comprimido/i);
    }
  );
});
