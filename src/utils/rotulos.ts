import type { OpcaoHoraPicada } from "@/schemas/triagem.schema";
import {
  SINTOMAS,
  type FaixaEtaria,
  type LocalAvistamento,
  type Sintoma,
  type TipoAnimal,
  type TipoSoro,
  type TipoUnidade,
  type Urgencia,
} from "@/types/enums.types";

/*
 * Rótulos dos enums para a tela: a API manda só os códigos em MAIÚSCULAS
 * (MVP-02 §5.1). Mesmo padrão do LABEL_ESPECIE do Afetto.
 */

/** Os nomes que o SeletorAnimal mostra (MVP-02 §3.1). */
export const LABEL_TIPO_ANIMAL: Record<TipoAnimal, string> = {
  ESCORPIAO: "Escorpião",
  SERPENTE: "Cobra",
  ARANHA: "Aranha",
  LAGARTA: "Lagarta/Taturana",
  ABELHA: "Abelha/Vespa",
  NAO_SEI: "Não sei",
};

/** Figura de cada animal no SeletorAnimal (emoji, como o ICONE_ESPECIE do Afetto). */
export const ICONE_TIPO_ANIMAL: Record<TipoAnimal, string> = {
  ESCORPIAO: "🦂",
  SERPENTE: "🐍",
  ARANHA: "🕷️",
  LAGARTA: "🐛",
  ABELHA: "🐝",
  NAO_SEI: "❓",
};

export const LABEL_FAIXA_ETARIA: Record<FaixaEtaria, string> = {
  CRIANCA: "Criança",
  ADULTO: "Adulto",
  IDOSO: "Idoso",
};

/** A idade de cada faixa (MVP-00 §4.1), embaixo do nome no seletor e no resumo. */
export const IDADE_FAIXA_ETARIA: Record<FaixaEtaria, string> = {
  CRIANCA: "0 a 9 anos",
  ADULTO: "10 a 59 anos",
  IDOSO: "60 anos ou mais",
};

/** Textos do MVP-02 §3.1 para "quando foi a picada". */
export const LABEL_HORA_PICADA: Record<OpcaoHoraPicada, string> = {
  AGORA: "Agora",
  HA_1_HORA: "Há 1 hora",
  HA_2_HORAS: "Há 2 horas",
  HA_3_HORAS_OU_MAIS: "Há 3 horas ou mais",
};

export const LABEL_URGENCIA: Record<Urgencia, string> = {
  EMERGENCIA: "Emergência",
  ALTA: "Alta",
  MODERADA: "Moderada",
};

export const LABEL_SORO: Record<TipoSoro, string> = {
  ANTIESCORPIONICO: "Antiescorpiônico",
  ANTIARACNIDICO: "Antiaracnídico",
  ANTIBOTROPICO: "Antibotrópico",
  ANTICROTALICO: "Anticrotálico",
  ANTIELAPIDICO: "Antielapídico",
  ANTILAQUETICO: "Antilaquético",
  ANTILOXOSCELICO: "Antiloxoscélico",
  ANTILONOMICO: "Antilonômico",
};

export const LABEL_TIPO_UNIDADE: Record<TipoUnidade, string> = {
  HOSPITAL: "Hospital",
  UPA: "UPA",
  UBS: "UBS",
};

export const LABEL_LOCAL_AVISTAMENTO: Record<LocalAvistamento, string> = {
  CASA: "Casa",
  QUINTAL: "Quintal",
  ESCOLA: "Escola",
  TRABALHO_RURAL: "Trabalho rural",
  VIA_PUBLICA: "Via pública",
  OUTRO: "Outro",
};

/** Textos do MVP-00 §4.2. */
export const LABEL_SINTOMA: Record<Sintoma, string> = {
  DOR_LOCAL: "Dor no local",
  INCHACO_LOCAL: "Inchaço no local",
  VERMELHIDAO: "Vermelhidão ou mancha roxa",
  DORMENCIA: "Formigamento ou dormência",
  FALTA_DE_AR: "Dificuldade para respirar",
  VISAO_TURVA: "Visão turva ou pálpebras caídas",
  VOMITOS: "Vômitos repetidos",
  SUOR_INTENSO: "Suor intenso pelo corpo",
  SONOLENCIA_DESMAIO: "Sonolência, agitação forte ou desmaio",
  SANGRAMENTO: "Sangramento ou urina escura",
  INCHACO_ROSTO: "Inchaço no rosto, lábios ou garganta",
  MUITAS_PICADAS_ALERGIA: "Muitas picadas (10+) ou alergia conhecida",
};

/** Sinais de alerta (MVP-00 §4.2): qualquer um deixa a urgência em EMERGENCIA (RN-U1). */
export const SINTOMAS_DE_ALERTA: ReadonlySet<Sintoma> = new Set<Sintoma>([
  "FALTA_DE_AR",
  "VISAO_TURVA",
  "VOMITOS",
  "SUOR_INTENSO",
  "SONOLENCIA_DESMAIO",
  "SANGRAMENTO",
  "INCHACO_ROSTO",
  "MUITAS_PICADAS_ALERGIA",
]);

/**
 * Marca ou desmarca um sintoma, mantendo a ordem do MVP-00 §4.2 seja qual for a
 * ordem dos toques (triagem e atualização da ocorrência).
 */
export function alternarSintoma(marcados: Sintoma[], sintoma: Sintoma): Sintoma[] {
  const marcado = marcados.includes(sintoma);
  return SINTOMAS.filter((item) => (item === sintoma ? !marcado : marcados.includes(item)));
}

export function ehSintomaDeAlerta(sintoma: Sintoma): boolean {
  return SINTOMAS_DE_ALERTA.has(sintoma);
}
