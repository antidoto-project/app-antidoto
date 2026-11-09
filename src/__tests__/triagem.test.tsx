import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import TelaTriagem from "@/app/sos/triagem";

const HORA = 3_600_000;

beforeEach(() => {
  jest.clearAllMocks();
});

/** Passo 1 → 2, com a aranha. findBy*: espera o Ionicons carregar a fonte (sem aviso de act). */
async function escolherAranhaEContinuar() {
  fireEvent.press(await screen.findByRole("radio", { name: "Aranha" }));
  fireEvent.press(screen.getByText("Continuar"));
}

describe("TelaTriagem (T3)", () => {
  it("leva os 3 passos para o resultado, com os params do contrato (MVP-02 §2)", async () => {
    render(<TelaTriagem />);

    await escolherAranhaEContinuar();

    // Passo 2
    expect(screen.getByLabelText("Passo 2 de 3")).toBeTruthy();
    fireEvent.press(screen.getByRole("radio", { name: "Adulto, 10 a 59 anos" }));
    fireEvent.press(screen.getByRole("radio", { name: "Há 2 horas" }));
    fireEvent.press(screen.getByText("Continuar"));

    // Passo 3: marca fora da ordem; os params seguem a ordem do MVP-00 §4.2
    fireEvent.press(screen.getByLabelText("Vômitos repetidos, sinal de alerta"));
    fireEvent.press(screen.getByLabelText("Dor no local"));
    fireEvent.press(screen.getByText("Ver resultado"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/sos/resultado",
      params: {
        tipoAnimal: "ARANHA",
        faixaEtaria: "ADULTO",
        sintomas: "DOR_LOCAL,VOMITOS",
        horaPicada: expect.any(String),
      },
    });
    const { horaPicada } = (router.push as jest.Mock).mock.calls[0][0].params;
    // "Há 2 horas" → 2 h antes de agora, em ISO
    expect(Math.abs(Date.now() - 2 * HORA - Date.parse(horaPicada))).toBeLessThan(5_000);
  });

  it("sem sintomas marcados também vai para o resultado (sintomas = '')", async () => {
    render(<TelaTriagem />);

    await escolherAranhaEContinuar();
    fireEvent.press(screen.getByRole("radio", { name: "Criança, 0 a 9 anos" }));
    fireEvent.press(screen.getByRole("radio", { name: "Agora" }));
    fireEvent.press(screen.getByText("Continuar"));
    fireEvent.press(screen.getByText("Ver resultado"));

    expect((router.push as jest.Mock).mock.calls[0][0].params.sintomas).toBe("");
  });

  it("não avança sem o animal", async () => {
    render(<TelaTriagem />);

    fireEvent.press(await screen.findByText("Continuar"));

    expect(screen.getByText("Escolha o animal (ou “Não sei”)")).toBeTruthy();
    expect(screen.getByLabelText("Passo 1 de 3")).toBeTruthy();
  });

  it("não avança sem quem foi picado e quando", async () => {
    render(<TelaTriagem />);

    await escolherAranhaEContinuar();
    fireEvent.press(screen.getByText("Continuar"));

    expect(screen.getByText("Escolha quem foi picado")).toBeTruthy();
    expect(screen.getByText("Escolha quando foi a picada")).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("'Voltar ao passo anterior' mantém o que já foi escolhido", async () => {
    render(<TelaTriagem />);

    await escolherAranhaEContinuar();
    fireEvent.press(screen.getByText("Voltar ao passo anterior"));

    expect(screen.getByLabelText("Passo 1 de 3")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Aranha", checked: true })).toBeTruthy();
  });
});
