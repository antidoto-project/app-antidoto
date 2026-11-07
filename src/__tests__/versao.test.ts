import { buildDoApp, versaoDoApp } from "@/utils/versao";
import { infoDoCommit } from "../../app.config";

const HASH = "66df52342d36b01ebd359505967d0ddf5659559f";

describe("versaoDoApp — o que a tela Sobre vai mostrar", () => {
  it("versão do app.json, hash curto e completo e a data do commit em DD/MM/AAAA", () => {
    expect(
      versaoDoApp({
        version: "1.0.0",
        extra: { commitHash: HASH, commitData: "2026-11-07", commitComAlteracoes: false },
      })
    ).toEqual({
      versao: "1.0.0",
      commitCurto: "66df523",
      commitCompleto: HASH,
      dataCommit: "07/11/2026",
      comAlteracoes: false,
    });
  });

  it("sem hash válido não inventa valor (o Expo manda {} quando falta um campo)", () => {
    const versao = versaoDoApp({ version: "1.0.0", extra: { commitHash: {}, commitData: {} } });

    expect(versao.commitCurto).toBeNull();
    expect(versao.commitCompleto).toBeNull();
    expect(versao.dataCommit).toBeNull();
    expect(versaoDoApp(null).versao).toBe("—");
  });
});

describe("buildDoApp — número do build e ambiente", () => {
  it("no APK do Firebase: o número que o EAS deu ao build e o ambiente do perfil", () => {
    expect(buildDoApp({ numeroNativo: "3", noExpoGo: false, ambiente: "preview" })).toEqual({
      numero: "3",
      ambiente: "preview",
    });
  });

  it("no Expo Go não mostra o número (seria o do próprio Expo Go)", () => {
    expect(buildDoApp({ numeroNativo: "254", noExpoGo: true, ambiente: undefined })).toEqual({
      numero: null,
      ambiente: "desenvolvimento",
    });
  });
});

describe("app.config.ts — hash injetado na hora do build", () => {
  it("no EAS usa EAS_BUILD_GIT_COMMIT_HASH e não marca alterações locais", () => {
    const git = jest.fn((argumentos: string[]) =>
      argumentos[0] === "log" ? "2026-11-07" : " M arquivo.ts"
    );

    expect(infoDoCommit({ EAS_BUILD_GIT_COMMIT_HASH: HASH }, git)).toEqual({
      commitHash: HASH,
      commitData: "2026-11-07",
      commitComAlteracoes: false,
    });
  });

  it("no computador pergunta ao git e avisa quando há mudança fora do commit", () => {
    const git = jest.fn((argumentos: string[]) => {
      if (argumentos[0] === "rev-parse") return HASH;
      if (argumentos[0] === "log") return "2026-11-07";
      return " M src/app/index.tsx";
    });

    expect(infoDoCommit({}, git)).toEqual({
      commitHash: HASH,
      commitData: "2026-11-07",
      commitComAlteracoes: true,
    });
  });

  it("sem git, deixa o hash de fora (a tela mostra 'não informado')", () => {
    expect(infoDoCommit({}, () => undefined)).toEqual({ commitComAlteracoes: false });
  });
});
