import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { Linking } from "react-native";

import TelaInicio from "@/app/(tabs)/index";

jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({ sessao: { token: "t", usuario: { id: 1, nome: "Ana Souza" } } }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("TelaInicio (T6)", () => {
  // findBy*: espera o Ionicons terminar de carregar a fonte (evita o aviso de act)
  it("cumprimenta pelo primeiro nome", async () => {
    render(<TelaInicio />);

    expect(await screen.findByText("Olá, Ana!")).toBeTruthy();
  });

  it("o SOS abre a triagem", async () => {
    render(<TelaInicio />);

    fireEvent.press(await screen.findByLabelText("SOS, fui picado"));

    expect(router.push).toHaveBeenCalledWith("/sos/triagem");
  });

  it("o atalho 'Registrar avistamento' abre o formulário", async () => {
    render(<TelaInicio />);

    fireEvent.press(await screen.findByText("Registrar avistamento"));

    expect(router.push).toHaveBeenCalledWith("/avistamentos/novo");
  });

  it("telefones úteis (RN-G8) abrem o discador", async () => {
    const abrir = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    render(<TelaInicio />);

    fireEvent.press(await screen.findByLabelText("Ligar para SAMU, 192"));
    fireEvent.press(screen.getByLabelText("Ligar para Bombeiros, 193"));
    fireEvent.press(screen.getByLabelText("Ligar para Disque-Intoxicação, 0800 722 6001"));

    expect(abrir.mock.calls).toEqual([["tel:192"], ["tel:193"], ["tel:08007226001"]]);
  });
});
