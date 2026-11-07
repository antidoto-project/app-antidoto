import { render, screen } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { Text } from "react-native";

import TelaEntrada from "@/app/index";
import { RotaProtegida } from "@/components/RotaProtegida";
import { useSessao } from "@/context/SessaoContext";

jest.mock("@/context/SessaoContext", () => ({ useSessao: jest.fn() }));

const mockUseSessao = useSessao as jest.Mock;
const mockRedirect = Redirect as unknown as jest.Mock;

const COM_SESSAO = { sessao: { token: "t", usuario: { id: 1, nome: "Ana" } }, carregando: false };
const SEM_SESSAO = { sessao: null, carregando: false };

/** Para onde o último <Redirect> mandaria. */
function destino() {
  return mockRedirect.mock.calls.at(-1)?.[0]?.href;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Porta de entrada (index)", () => {
  it("com sessão vai para o Início", () => {
    mockUseSessao.mockReturnValue(COM_SESSAO);
    render(<TelaEntrada />);
    expect(destino()).toBe("/(tabs)");
  });

  it("sem sessão vai para o login", () => {
    mockUseSessao.mockReturnValue(SEM_SESSAO);
    render(<TelaEntrada />);
    expect(destino()).toBe("/login");
  });

  it("lendo a sessão do aparelho: espera, sem redirecionar", () => {
    mockUseSessao.mockReturnValue({ sessao: null, carregando: true });
    render(<TelaEntrada />);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe("RotaProtegida", () => {
  it("com sessão mostra a tela", () => {
    mockUseSessao.mockReturnValue(COM_SESSAO);
    render(
      <RotaProtegida>
        <Text>área logada</Text>
      </RotaProtegida>
    );
    expect(screen.getByText("área logada")).toBeTruthy();
  });

  it("sem sessão manda para o login e não mostra a tela", () => {
    mockUseSessao.mockReturnValue(SEM_SESSAO);
    render(
      <RotaProtegida>
        <Text>área logada</Text>
      </RotaProtegida>
    );
    expect(destino()).toBe("/login");
    expect(screen.queryByText("área logada")).toBeNull();
  });
});
