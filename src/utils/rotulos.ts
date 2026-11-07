import type {
  FaixaEtaria,
  LocalAvistamento,
  Sintoma,
  TipoAnimal,
  TipoSoro,
  TipoUnidade,
  Urgencia,
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

export const LABEL_FAIXA_ETARIA: Record<FaixaEtaria, string> = {
  CRIANCA: "Criança (0–9)",
  ADULTO: "Adulto (10–59)",
  IDOSO: "Idoso (60+)",
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

export function ehSintomaDeAlerta(sintoma: Sintoma): boolean {
  return SINTOMAS_DE_ALERTA.has(sintoma);
}
