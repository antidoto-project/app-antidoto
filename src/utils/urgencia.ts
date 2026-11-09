import type { FaixaEtaria, Sintoma, TipoAnimal, Urgencia } from "@/types/enums.types";
import { ehSintomaDeAlerta } from "@/utils/rotulos";

/*
 * Regra de urgência RN-U (docs/MVP-00-LEIA-ME.md §4.3), calculada no próprio
 * app para funcionar sem internet. O Java implementa a MESMA regra, com os
 * mesmos 10 casos de teste (urgencia.test.ts): não mude nada aqui sem combinar.
 * Não existe "baixa" nem "sem urgência": o mínimo é MODERADA.
 */

const ORDEM: Urgencia[] = ["MODERADA", "ALTA", "EMERGENCIA"];

/** A maior das duas urgências (MODERADA < ALTA < EMERGENCIA). */
function maior(a: Urgencia, b: Urgencia): Urgencia {
  return ORDEM.indexOf(a) >= ORDEM.indexOf(b) ? a : b;
}

const ANIMAIS_COM_RISCO_DE_AGRAVAMENTO: TipoAnimal[] = ["SERPENTE", "ARANHA", "LAGARTA", "NAO_SEI"];

const HORAS_PARA_SUBIR_UM_NIVEL = 3;
const MS_POR_HORA = 3_600_000;

export type ResultadoUrgencia = {
  urgencia: Urgencia;
  /** Por que a urgência ficou nesse nível, na ordem das regras. */
  motivos: string[];
  /** RN-G3: em EMERGENCIA, o "Ligar 192" vai para o topo da tela. */
  ligar192: boolean;
};

export function calcularUrgencia(
  tipoAnimal: TipoAnimal,
  faixaEtaria: FaixaEtaria,
  sintomas: Sintoma[],
  horaPicada: Date,
  agora: Date
): ResultadoUrgencia {
  // Começa no mínimo, MODERADA (ORDEM[0]; com o literal, o TypeScript não
  // enxergaria as mudanças feitas dentro do subir)
  let urgencia: Urgencia = ORDEM[0];
  const motivos: string[] = [];

  function subir(nivel: Urgencia, motivo: string) {
    urgencia = maior(urgencia, nivel);
    if (!motivos.includes(motivo)) motivos.push(motivo);
  }

  // RN-U1
  if (sintomas.some(ehSintomaDeAlerta)) subir("EMERGENCIA", "Sinal de alerta");
  // RN-U2
  if (tipoAnimal === "ESCORPIAO" && faixaEtaria === "CRIANCA") {
    subir("EMERGENCIA", "Escorpião em criança");
  }
  // RN-U3
  if (ANIMAIS_COM_RISCO_DE_AGRAVAMENTO.includes(tipoAnimal)) {
    subir("ALTA", "Animal com risco de agravamento");
  }
  // RN-U4
  if (faixaEtaria === "CRIANCA" || faixaEtaria === "IDOSO") subir("ALTA", "Criança ou idoso");

  // RN-U5 (por último): 3 h ou mais desde a picada sobe um nível
  const horas = (agora.getTime() - horaPicada.getTime()) / MS_POR_HORA;
  if (horas >= HORAS_PARA_SUBIR_UM_NIVEL && urgencia !== "EMERGENCIA") {
    urgencia = ORDEM[ORDEM.indexOf(urgencia) + 1];
    motivos.push("Mais de 3 horas desde a picada");
  }

  // RN-U6
  if (motivos.length === 0) motivos.push("Avaliação necessária");

  return { urgencia, motivos, ligar192: urgencia === "EMERGENCIA" };
}
