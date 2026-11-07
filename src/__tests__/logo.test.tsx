import { render, screen } from "@testing-library/react-native";

import { LogoAntidoto } from "@/components/LogoAntidoto";

const mockTema = { colorScheme: "light" as "light" | "dark" };
jest.mock("nativewind", () => ({ useColorScheme: () => mockTema }));

/** O arquivo do PNG que o <Image> recebeu (o jest-expo troca o require por { testUri }). */
function arquivoDoLogo() {
  return screen.getByLabelText("Antídoto").props.source.testUri as string;
}

describe("LogoAntidoto", () => {
  it("no tema claro usa o logo com o texto grafite", () => {
    mockTema.colorScheme = "light";
    render(<LogoAntidoto />);

    expect(arquivoDoLogo()).toMatch(/antidoto-logo-horizontal\.png$/);
  });

  it("no tema escuro usa o logo com o texto branco", () => {
    mockTema.colorScheme = "dark";
    render(<LogoAntidoto />);

    expect(arquivoDoLogo()).toMatch(/antidoto-logo-horizontal-escuro\.png$/);
  });
});
