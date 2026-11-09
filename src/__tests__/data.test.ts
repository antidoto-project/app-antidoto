import { formatarDataHora, horaPorOpcao, tempoDecorrido } from "@/utils/data";

// jest.config.js fixa o fuso em America/Sao_Paulo (UTC-3), o do público do app
const AGORA = new Date("2026-11-09T21:00:00.000Z");
const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const isoHa = (ms: number) => new Date(AGORA.getTime() - ms).toISOString();

describe("formatarDataHora", () => {
  it("mostra no fuso do aparelho (a API manda em UTC)", () => {
    expect(formatarDataHora("2026-11-09T22:30:00.000Z")).toBe("09/11/2026 19:30");
  });

  it("completa com zero e vira o dia certo", () => {
    expect(formatarDataHora("2026-01-02T02:05:00Z")).toBe("01/01/2026 23:05");
  });
});

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
