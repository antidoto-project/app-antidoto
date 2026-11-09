import {
  criarParamsResultadoSchema,
  PassoAnimalSchema,
  PassoQuemQuandoSchema,
} from "@/schemas/triagem.schema";
import { horaPorOpcao, tempoDecorrido } from "@/utils/data";

const AGORA = new Date("2026-11-09T21:00:00.000Z");
const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const isoHa = (ms: number) => new Date(AGORA.getTime() - ms).toISOString();

describe("horaPorOpcao (MVP-02 §3.1)", () => {
  it.each([
    ["AGORA", "2026-11-09T21:00:00.000Z"],
    ["HA_1_HORA", "2026-11-09T20:00:00.000Z"],
    ["HA_2_HORAS", "2026-11-09T19:00:00.000Z"],
    ["HA_3_HORAS_OU_MAIS", "2026-11-09T18:00:00.000Z"],
  ] as const)("%s → %s", (opcao, esperado) => {
    expect(horaPorOpcao(opcao, AGORA)).toBe(esperado);
  });
});

describe("tempoDecorrido", () => {
  it.each([
    [30_000, "agora mesmo"],
    [25 * MINUTO, "há 25 min"],
    [HORA, "há 1 hora"],
    [3 * HORA + 20 * MINUTO, "há 3 horas"],
    [26 * HORA, "há 1 dia"],
    [50 * HORA, "há 2 dias"],
  ])("%i ms → %s", (ms, esperado) => {
    expect(tempoDecorrido(isoHa(ms), AGORA)).toBe(esperado);
  });
});

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
