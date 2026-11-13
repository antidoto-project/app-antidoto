import { render, screen } from "@testing-library/react-native";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

import { CabecalhoAba } from "@/components/ui/CabecalhoAba";

// A barra de status é nativa: aqui só conferimos o que o cabeçalho pede para ela
jest.mock("expo-status-bar", () => ({ StatusBar: jest.fn(() => null) }));

const mockStatusBar = StatusBar as unknown as jest.Mock;
const mockFocusEffect = useFocusEffect as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CabecalhoAba", () => {
  it("mostra o título como cabeçalho, o subtítulo e a ação", () => {
    render(
      <CabecalhoAba titulo="Avistamentos" subtitulo="Os que você viu" acao={<Text>Ação</Text>} />
    );

    expect(screen.getByRole("header", { name: "Avistamentos" })).toBeTruthy();
    expect(screen.getByText("Os que você viu")).toBeTruthy();
    expect(screen.getByText("Ação")).toBeTruthy();
  });

  it("na aba aberta, a barra de status fica clara (ícones escuros somem no verde)", () => {
    render(<CabecalhoAba titulo="Início" />);

    expect(mockStatusBar).toHaveBeenCalled();
    expect(mockStatusBar.mock.calls.at(-1)[0]).toEqual({ style: "light" });
  });

  it("fora de foco (outra tela por cima), devolve a barra para o _layout raiz", () => {
    // Sem foco, o efeito do useFocusEffect não roda
    mockFocusEffect.mockImplementationOnce(() => {});

    render(<CabecalhoAba titulo="Início" />);

    expect(mockStatusBar).not.toHaveBeenCalled();
  });
});
