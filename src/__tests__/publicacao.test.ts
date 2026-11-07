// Configuração que a publicação (Passo 8) e o Firebase App Distribution usam
const appJson = require("../../app.json");

describe("app.json", () => {
  it("nome Antídoto e pacote Android no padrão do professor (br.fiap.mad.<nome>)", () => {
    expect(appJson.expo.name).toBe("Antídoto");
    expect(appJson.expo.android.package).toBe("br.fiap.mad.antidoto");
  });

  it("rotas tipadas ligadas (o tsc confere cada router.push)", () => {
    expect(appJson.expo.experiments.typedRoutes).toBe(true);
  });
});
