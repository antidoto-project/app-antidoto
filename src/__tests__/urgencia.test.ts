import type { FaixaEtaria, Sintoma, TipoAnimal, Urgencia } from "@/types/enums.types";
import type { Ocorrencia } from "@/types/ocorrencia.types";
import { calcularUrgencia, maiorUrgencia, urgenciaDaOcorrencia } from "@/utils/urgencia";

const AGORA = new Date("2026-11-09T21:00:00.000Z");
const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const ha = (ms: number) => new Date(AGORA.getTime() - ms);

type Caso = [number, TipoAnimal, FaixaEtaria, Sintoma[], number, Urgencia];

// MVP-00 §4.3 — os MESMOS 10 casos do JUnit do Java (não mude sem combinar)
const CASOS_OBRIGATORIOS: Caso[] = [
  [1, "ESCORPIAO", "ADULTO", ["DOR_LOCAL"], 10 * MINUTO, "MODERADA"],
  [2, "ESCORPIAO", "CRIANCA", [], 10 * MINUTO, "EMERGENCIA"],
  [3, "ESCORPIAO", "IDOSO", [], 10 * MINUTO, "ALTA"],
  [4, "SERPENTE", "ADULTO", [], 10 * MINUTO, "ALTA"],
  [5, "ARANHA", "ADULTO", ["FALTA_DE_AR"], 10 * MINUTO, "EMERGENCIA"],
  [6, "NAO_SEI", "ADULTO", [], 10 * MINUTO, "ALTA"],
  [7, "ESCORPIAO", "ADULTO", [], 4 * HORA, "ALTA"],
  [8, "SERPENTE", "ADULTO", [], 4 * HORA, "EMERGENCIA"],
  [9, "ABELHA", "ADULTO", ["MUITAS_PICADAS_ALERGIA"], 10 * MINUTO, "EMERGENCIA"],
  [10, "ABELHA", "ADULTO", ["DOR_LOCAL"], 10 * MINUTO, "MODERADA"],
];

describe("calcularUrgencia — casos obrigatórios do MVP-00 §4.3", () => {
  it.each(CASOS_OBRIGATORIOS)(
    "caso %i: %s, %s, sintomas %j → %s",
    (_n, animal, faixa, sintomas, tempo, esperado) => {
      const resultado = calcularUrgencia(animal, faixa, sintomas, ha(tempo), AGORA);

      expect(resultado.urgencia).toBe(esperado);
      // ligar192 só em EMERGENCIA (RN-G3)
      expect(resultado.ligar192).toBe(esperado === "EMERGENCIA");
    }
  );
});

describe("calcularUrgencia — motivos", () => {
  it("RN-U6: sem nenhuma regra, o motivo é 'Avaliação necessária' (nunca 'sem urgência')", () => {
    const resultado = calcularUrgencia("ESCORPIAO", "ADULTO", ["DOR_LOCAL"], ha(MINUTO), AGORA);

    expect(resultado).toEqual({
      urgencia: "MODERADA",
      motivos: ["Avaliação necessária"],
      ligar192: false,
    });
  });

  it("junta os motivos na ordem das regras, sem repetir", () => {
    const resultado = calcularUrgencia(
      "ESCORPIAO",
      "CRIANCA",
      ["FALTA_DE_AR", "VOMITOS"],
      ha(MINUTO),
      AGORA
    );

    expect(resultado.motivos).toEqual([
      "Sinal de alerta",
      "Escorpião em criança",
      "Criança ou idoso",
    ]);
  });

  it("RN-U5: com 3 h exatas já sobe um nível (MODERADA → ALTA)", () => {
    const resultado = calcularUrgencia("ABELHA", "ADULTO", [], ha(3 * HORA), AGORA);

    expect(resultado.urgencia).toBe("ALTA");
    expect(resultado.motivos).toEqual(["Mais de 3 horas desde a picada"]);
  });

  it("RN-U5: com 2 h 59 min ainda não sobe", () => {
    const resultado = calcularUrgencia("ABELHA", "ADULTO", [], ha(3 * HORA - MINUTO), AGORA);

    expect(resultado.urgencia).toBe("MODERADA");
  });

  it("RN-U5: EMERGENCIA não sobe nem ganha o motivo das 3 horas", () => {
    const resultado = calcularUrgencia("ESCORPIAO", "CRIANCA", [], ha(5 * HORA), AGORA);

    expect(resultado.urgencia).toBe("EMERGENCIA");
    expect(resultado.motivos).not.toContain("Mais de 3 horas desde a picada");
  });
});

describe("maiorUrgencia (app × servidor: nunca rebaixar)", () => {
  it.each([
    ["MODERADA", "ALTA", "ALTA"],
    ["ALTA", "MODERADA", "ALTA"],
    ["EMERGENCIA", "ALTA", "EMERGENCIA"],
    ["MODERADA", "MODERADA", "MODERADA"],
  ] as [Urgencia, Urgencia, Urgencia][])("%s e %s → %s", (a, b, esperado) => {
    expect(maiorUrgencia(a, b)).toBe(esperado);
  });
});

describe("urgenciaDaOcorrencia (T12: a do servidor, nunca rebaixada)", () => {
  const OCORRENCIA: Ocorrencia = {
    id: 1,
    tipoAnimal: "ESCORPIAO",
    faixaEtaria: "ADULTO",
    sintomas: [],
    horaPicada: "2026-11-09T22:00:00.000Z",
    latitude: -23.56,
    longitude: -46.65,
    urgencia: "MODERADA",
    motivos: ["Avaliação necessária"],
    ligar192: false,
    unidadeId: null,
    unidadeNome: null,
    statusResumo: "PRONTO",
    resumo: "…",
    avisoResumo: null,
    aviso: null,
    criadoEm: "2026-11-09T22:20:00.000Z",
  };

  it("igual à do app: vale a do servidor, com os motivos dele", () => {
    expect(urgenciaDaOcorrencia(OCORRENCIA)).toEqual({
      urgencia: "MODERADA",
      motivos: ["Avaliação necessária"],
      ligar192: false,
    });
  });

  it("servidor acima (ex.: depois de uma atualização, com a hora dela): vale a do servidor", () => {
    const atualizada = { ...OCORRENCIA, urgencia: "ALTA" as const, motivos: ["Mais de 3 horas"] };

    expect(urgenciaDaOcorrencia(atualizada).urgencia).toBe("ALTA");
  });

  it("app acima: vale a do app, com os motivos do app e o 192 no topo (RN-G3)", () => {
    const comAlerta = { ...OCORRENCIA, sintomas: ["SANGRAMENTO" as const] };

    expect(urgenciaDaOcorrencia(comAlerta)).toEqual({
      urgencia: "EMERGENCIA",
      motivos: ["Sinal de alerta"],
      ligar192: true,
    });
  });
});
