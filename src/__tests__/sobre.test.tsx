import { render, screen } from "@testing-library/react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

import TelaSobre from "@/app/(app)/sobre";

// O manifesto do app (Constants.expoConfig) é trocado em cada teste
jest.mock("expo-constants", () => ({
  __esModule: true,
  ExecutionEnvironment: { Bare: "bare", Standalone: "standalone", StoreClient: "storeClient" },
  default: { expoConfig: null, executionEnvironment: "standalone" },
}));

// Número do build lido do APK instalado (no aparelho vem do versionCode do EAS)
jest.mock("expo-application", () => ({ nativeBuildVersion: "3" }));

const HASH = "66df52342d36b01ebd359505967d0ddf5659559f";

const AMBIENTE_DO_ENV = process.env.EXPO_PUBLIC_APP_ENV;

function configCom(extra: Record<string, unknown>) {
  return { name: "Antídoto", slug: "antidoto-app", version: "1.0.0", extra };
}

afterEach(() => {
  jest.restoreAllMocks();
  process.env.EXPO_PUBLIC_APP_ENV = AMBIENTE_DO_ENV;
});

describe("TelaSobre (T13, MVP-02 §9)", () => {
  it("mostra a versão, o commit curto, a data e o hash completo", () => {
    jest.replaceProperty(
      Constants,
      "expoConfig",
      configCom({ commitHash: HASH, commitData: "2026-11-09", commitComAlteracoes: false })
    );

    render(<TelaSobre />);

    expect(screen.getByText("Sobre o App")).toBeTruthy();
    expect(screen.getByLabelText("Antídoto")).toBeTruthy();
    expect(screen.getByText("1.0.0")).toBeTruthy();
    expect(screen.getByText("66df523")).toBeTruthy();
    expect(screen.getByText("09/11/2026")).toBeTruthy();
    expect(screen.getByText(HASH)).toBeTruthy();
    expect(screen.queryByText(/ainda não estão em nenhum commit/)).toBeNull();
  });

  it("mostra os integrantes e o aviso de dados fictícios", () => {
    jest.replaceProperty(Constants, "expoConfig", configCom({ commitHash: HASH }));

    render(<TelaSobre />);

    expect(screen.getByText("Integrantes")).toBeTruthy();
    expect(screen.getByText("Gustavo Souto de Melo")).toBeTruthy();
    expect(screen.getByText("Leonardo Barbosa Santos")).toBeTruthy();
    expect(screen.getByText(/são fictícias, só para demonstração/)).toBeTruthy();
  });

  it("mostra o número do build lido do APK e o ambiente do perfil do EAS", () => {
    process.env.EXPO_PUBLIC_APP_ENV = "preview";
    jest.replaceProperty(Constants, "expoConfig", configCom({ commitHash: HASH }));

    render(<TelaSobre />);

    expect(screen.getByText("Build")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("preview")).toBeTruthy();
  });

  it("no Expo Go esconde o número do build e mostra o ambiente de desenvolvimento", () => {
    delete process.env.EXPO_PUBLIC_APP_ENV;
    jest.replaceProperty(Constants, "executionEnvironment", ExecutionEnvironment.StoreClient);
    jest.replaceProperty(Constants, "expoConfig", configCom({ commitHash: HASH }));

    render(<TelaSobre />);

    expect(screen.getByText("desenvolvimento")).toBeTruthy();
    expect(screen.queryByText("Build")).toBeNull();
  });

  it("avisa quando o app foi gerado com alterações fora do commit", () => {
    jest.replaceProperty(
      Constants,
      "expoConfig",
      configCom({ commitHash: HASH, commitComAlteracoes: true })
    );

    render(<TelaSobre />);

    expect(screen.getByText(/ainda não estão em nenhum commit/)).toBeTruthy();
  });

  it("sem hash no build, mostra 'não informado' em vez de um valor inventado", () => {
    jest.replaceProperty(Constants, "expoConfig", configCom({}));

    render(<TelaSobre />);

    expect(screen.getByText("não informado")).toBeTruthy();
    expect(screen.getByText(/lido do git na hora do build/)).toBeTruthy();
  });
});
