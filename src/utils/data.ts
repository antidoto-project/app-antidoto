import type { OpcaoHoraPicada } from "@/schemas/triagem.schema";

/** Converte YYYY-MM-DD → DD/MM/AAAA (formato de exibição). */
export function converterDataParaBR(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

const MS_POR_MINUTO = 60_000;
const MS_POR_HORA = 3_600_000;

const HORAS_ATRAS: Record<OpcaoHoraPicada, number> = {
  AGORA: 0,
  HA_1_HORA: 1,
  HA_2_HORAS: 2,
  // "3 horas ou mais" conta como 3 h: já é o bastante para subir um nível (RN-U5)
  HA_3_HORAS_OU_MAIS: 3,
};

/** A hora da picada em ISO-8601 (UTC), a partir da opção da triagem (MVP-02 §3.1). */
export function horaPorOpcao(opcao: OpcaoHoraPicada, agora: Date): string {
  return new Date(agora.getTime() - HORAS_ATRAS[opcao] * MS_POR_HORA).toISOString();
}

/** Quanto tempo passou desde `iso`: "agora mesmo", "há 25 min", "há 2 horas", "há 3 dias". */
export function tempoDecorrido(iso: string, agora: Date): string {
  const minutos = Math.floor((agora.getTime() - new Date(iso).getTime()) / MS_POR_MINUTO);
  if (minutos < 1) return "agora mesmo";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return horas === 1 ? "há 1 hora" : `há ${horas} horas`;

  const dias = Math.floor(horas / 24);
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}
