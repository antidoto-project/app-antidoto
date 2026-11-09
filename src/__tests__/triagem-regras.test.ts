import {
  criarParamsResultadoSchema,
  PassoAnimalSchema,
  PassoQuemQuandoSchema,
} from "@/schemas/triagem.schema";

const AGORA = new Date("2026-11-09T21:00:00.000Z");
const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const isoHa = (ms: number) => new Date(AGORA.getTime() - ms).toISOString();

describe("passos da triagem", () => {
  it("passo 1: precisa do animal ('Não sei' vale)", () => {
    expect(PassoAnimalSchema.safeParse({ tipoAnimal: "NAO_SEI" }).success).toBe(true);

    const vazio = PassoAnimalSchema.safeParse({ tipoAnimal: undefined });
    expect(vazio.error?.issues[0].message).toBe("Escolha o animal (ou “Não sei”)");
  });

  it("passo 2: precisa de quem foi picado e de quando", () => {
    const vazio = PassoQuemQuandoSchema.safeParse({});
    expect(vazio.error?.issues.map(({ message }) => message)).toEqual([
      "Escolha quem foi picado",
      "Escolha quando foi a picada",
    ]);
  });
});

describe("params do resultado (T4)", () => {
  const schema = criarParamsResultadoSchema(AGORA);
  const validos = {
    tipoAnimal: "ARANHA",
    faixaEtaria: "ADULTO",
    sintomas: "FALTA_DE_AR,DOR_LOCAL",
    horaPicada: isoHa(HORA),
  };

  it("lê os sintomas separados por vírgula", () => {
    expect(schema.parse(validos).sintomas).toEqual(["FALTA_DE_AR", "DOR_LOCAL"]);
  });

  it("sem sintomas: lista vazia", () => {
    expect(schema.parse({ ...validos, sintomas: "" }).sintomas).toEqual([]);
    expect(schema.parse({ ...validos, sintomas: undefined }).sintomas).toEqual([]);
  });

  it("recusa animal, faixa ou sintoma fora do contrato", () => {
    expect(schema.safeParse({ ...validos, tipoAnimal: "TUBARAO" }).success).toBe(false);
    expect(schema.safeParse({ ...validos, faixaEtaria: "BEBE" }).success).toBe(false);
    expect(schema.safeParse({ ...validos, sintomas: "FEBRE" }).success).toBe(false);
  });

  it("RN-G4: aceita até 5 min no futuro e até 72 h atrás", () => {
    expect(schema.safeParse({ ...validos, horaPicada: isoHa(-5 * MINUTO) }).success).toBe(true);
    expect(schema.safeParse({ ...validos, horaPicada: isoHa(72 * HORA) }).success).toBe(true);
  });

  it("RN-G4: recusa a hora no futuro (mais de 5 min) ou com mais de 72 h", () => {
    expect(schema.safeParse({ ...validos, horaPicada: isoHa(-6 * MINUTO) }).success).toBe(false);
    expect(schema.safeParse({ ...validos, horaPicada: isoHa(73 * HORA) }).success).toBe(false);
    expect(schema.safeParse({ ...validos, horaPicada: "ontem" }).success).toBe(false);
  });
});
