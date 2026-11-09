import { existsSync } from "fs";
import { join } from "path";

// Configuração que a publicação (Passo 8) e o Firebase App Distribution usam
const appJson = require("../../app.json");
// O tailwind.config.js é CommonJS (o NativeWind lê com require)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const configTailwind = require("../../tailwind.config.js");

describe("app.json", () => {
  it("nome Antídoto e pacote Android no padrão do professor (br.fiap.mad.<nome>)", () => {
    expect(appJson.expo.name).toBe("Antídoto");
    expect(appJson.expo.android.package).toBe("br.fiap.mad.antidoto");
  });

  it("rotas tipadas ligadas (o tsc confere cada router.push)", () => {
    expect(appJson.expo.experiments.typedRoutes).toBe(true);
  });
});

describe("identidade visual no app.json", () => {
  const { icon, splash, android, web } = appJson.expo;

  it("ícone, ícone adaptativo, splash e favicon apontam para arquivos que existem", () => {
    const arquivos = [icon, splash.image, android.adaptiveIcon.foregroundImage, web.favicon];

    arquivos.forEach((arquivo: string) => {
      expect(existsSync(join(__dirname, "../..", arquivo))).toBe(true);
    });
  });

  it("splash no creme e fundo do ícone no verde escuro da paleta", () => {
    const cores = configTailwind.theme.extend.colors;

    expect(splash.backgroundColor).toBe(cores.fundo);
    expect(android.adaptiveIcon.backgroundColor).toBe(cores.marca);
  });
});

describe("localização (Passo 4)", () => {
  it("o plugin do expo-location explica por que o app pede a localização", () => {
    const plugin = appJson.expo.plugins.find(
      (item: unknown) => Array.isArray(item) && item[0] === "expo-location"
    );

    expect(plugin?.[1].locationWhenInUsePermission).toMatch(/unidades de saúde/);
  });
});
