import Constants from "expo-constants";
import { Platform } from "react-native";

import { api, definirUrlDaApi, TEMPO_LIMITE_API_MS } from "@/api/api";

// O Expo informa o endereço do computador que roda o Metro (hostUri)
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: "192.168.0.10:8081" } },
}));

const URL_DO_ENV = process.env.EXPO_PUBLIC_API_URL;

afterEach(() => {
  process.env.EXPO_PUBLIC_API_URL = URL_DO_ENV;
  jest.restoreAllMocks();
});

describe("definirUrlDaApi", () => {
  it("sem .env, usa a API Java no computador que roda o Expo, na porta 8080", () => {
    delete process.env.EXPO_PUBLIC_API_URL;

    expect(definirUrlDaApi()).toBe("http://192.168.0.10:8080");
  });

  it("sem o endereço do Expo, usa localhost:8080", () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.replaceProperty(Constants, "expoConfig", null);

    expect(definirUrlDaApi()).toBe("http://localhost:8080");
  });

  it("no navegador, usa o mesmo endereço da página", () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.replaceProperty(Platform, "OS", "web");
    const locationOriginal = Object.getOwnPropertyDescriptor(globalThis, "location");
    Object.defineProperty(globalThis, "location", {
      value: { hostname: "127.0.0.1" },
      configurable: true,
    });

    try {
      expect(definirUrlDaApi()).toBe("http://127.0.0.1:8080");
    } finally {
      if (locationOriginal) Object.defineProperty(globalThis, "location", locationOriginal);
      else delete (globalThis as { location?: unknown }).location;
    }
  });

  it("EXPO_PUBLIC_API_URL do .env tem prioridade (ex.: o mock Prism na porta 4010)", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://192.168.0.10:4010";

    expect(definirUrlDaApi()).toBe("http://192.168.0.10:4010");
  });
});

describe("cliente da API", () => {
  it("usa o endereço do .env e espera no máximo 10 s (MVP-02 §5.1)", () => {
    // jest.setup.js define EXPO_PUBLIC_API_URL=https://api.test.local
    expect(api.defaults.baseURL).toBe("https://api.test.local");
    expect(api.defaults.timeout).toBe(10_000);
    expect(TEMPO_LIMITE_API_MS).toBe(10_000);
  });
});
