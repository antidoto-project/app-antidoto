import {
  FAIXAS_ETARIAS,
  LOCAIS_AVISTAMENTO,
  SINTOMAS,
  TIPOS_ANIMAL,
  TIPOS_SORO,
  TIPOS_UNIDADE,
  URGENCIAS,
  type Sintoma,
} from "@/types/enums.types";
import {
  ehSintomaDeAlerta,
  IDADE_FAIXA_ETARIA,
  LABEL_FAIXA_ETARIA,
  LABEL_LOCAL_AVISTAMENTO,
  LABEL_SINTOMA,
  LABEL_SORO,
  LABEL_TIPO_ANIMAL,
  LABEL_TIPO_UNIDADE,
  LABEL_URGENCIA,
} from "@/utils/rotulos";

// Tabela do MVP-00 §4.2: código → é sinal de alerta?
const SINAL_DE_ALERTA: [Sintoma, boolean][] = [
  ["DOR_LOCAL", false],
  ["INCHACO_LOCAL", false],
  ["VERMELHIDAO", false],
  ["DORMENCIA", false],
  ["FALTA_DE_AR", true],
  ["VISAO_TURVA", true],
  ["VOMITOS", true],
  ["SUOR_INTENSO", true],
  ["SONOLENCIA_DESMAIO", true],
  ["SANGRAMENTO", true],
  ["INCHACO_ROSTO", true],
  ["MUITAS_PICADAS_ALERGIA", true],
];

describe("ehSintomaDeAlerta — os 12 sintomas do MVP-00 §4.2", () => {
  it("a tabela do teste cobre todos os sintomas do contrato", () => {
    expect(SINAL_DE_ALERTA.map(([sintoma]) => sintoma)).toEqual([...SINTOMAS]);
  });

  it.each(SINAL_DE_ALERTA)("%s → alerta: %s", (sintoma, alerta) => {
    expect(ehSintomaDeAlerta(sintoma)).toBe(alerta);
  });
});

describe("rótulos dos enums", () => {
  it.each([
    ["tipo de animal", TIPOS_ANIMAL, LABEL_TIPO_ANIMAL],
    ["faixa etária", FAIXAS_ETARIAS, LABEL_FAIXA_ETARIA],
    ["idade da faixa etária", FAIXAS_ETARIAS, IDADE_FAIXA_ETARIA],
    ["urgência", URGENCIAS, LABEL_URGENCIA],
    ["soro", TIPOS_SORO, LABEL_SORO],
    ["tipo de unidade", TIPOS_UNIDADE, LABEL_TIPO_UNIDADE],
    ["local do avistamento", LOCAIS_AVISTAMENTO, LABEL_LOCAL_AVISTAMENTO],
    ["sintoma", SINTOMAS, LABEL_SINTOMA],
  ] as [string, readonly string[], Record<string, string>][])(
    "todo valor de %s tem um texto para a tela",
    (_nome, valores, rotulos) => {
      for (const valor of valores) {
        expect(rotulos[valor]?.trim()).toBeTruthy();
      }
      expect(Object.keys(rotulos).sort()).toEqual([...valores].sort());
    }
  );

  it("a urgência nunca vira 'baixa' ou 'sem urgência' (MVP-00 §4.1)", () => {
    for (const texto of Object.values(LABEL_URGENCIA)) {
      expect(texto.toLowerCase()).not.toMatch(/baixa|sem urg/);
    }
  });

  it("usa os textos do contrato na tela", () => {
    expect(LABEL_TIPO_ANIMAL.SERPENTE).toBe("Cobra");
    expect(LABEL_SINTOMA.FALTA_DE_AR).toBe("Dificuldade para respirar");
    expect(LABEL_SINTOMA.MUITAS_PICADAS_ALERGIA).toBe("Muitas picadas (10+) ou alergia conhecida");
  });
});
