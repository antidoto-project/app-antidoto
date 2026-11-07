/*
 * Enums do contrato (docs/MVP-00-LEIA-ME.md §4.1 e docs/api/openapi-mvp.yaml).
 * Os valores trafegam exatamente assim no JSON; a tela mostra os rótulos de
 * utils/rotulos.ts. As listas `as const` servem para os seletores e o z.enum.
 */

export const TIPOS_ANIMAL = [
  "ESCORPIAO",
  "SERPENTE",
  "ARANHA",
  "LAGARTA",
  "ABELHA",
  "NAO_SEI",
] as const;
export type TipoAnimal = (typeof TIPOS_ANIMAL)[number];

/** CRIANCA = 0 a 9 anos · ADULTO = 10 a 59 · IDOSO = 60 ou mais. */
export const FAIXAS_ETARIAS = ["CRIANCA", "ADULTO", "IDOSO"] as const;
export type FaixaEtaria = (typeof FAIXAS_ETARIAS)[number];

/** Não existe "baixa" nem "sem urgência" (MVP-00 §4.1). */
export const URGENCIAS = ["EMERGENCIA", "ALTA", "MODERADA"] as const;
export type Urgencia = (typeof URGENCIAS)[number];

export const TIPOS_SORO = [
  "ANTIESCORPIONICO",
  "ANTIARACNIDICO",
  "ANTIBOTROPICO",
  "ANTICROTALICO",
  "ANTIELAPIDICO",
  "ANTILAQUETICO",
  "ANTILOXOSCELICO",
  "ANTILONOMICO",
] as const;
export type TipoSoro = (typeof TIPOS_SORO)[number];

export const TIPOS_UNIDADE = ["HOSPITAL", "UPA", "UBS"] as const;
export type TipoUnidade = (typeof TIPOS_UNIDADE)[number];

export const LOCAIS_AVISTAMENTO = [
  "CASA",
  "QUINTAL",
  "ESCOLA",
  "TRABALHO_RURAL",
  "VIA_PUBLICA",
  "OUTRO",
] as const;
export type LocalAvistamento = (typeof LOCAIS_AVISTAMENTO)[number];

export const STATUS_RESUMO = ["PENDENTE", "PRONTO", "MODELO_PADRAO"] as const;
export type StatusResumo = (typeof STATUS_RESUMO)[number];

export const PERFIS = ["CIDADAO", "GESTOR"] as const;
export type Perfil = (typeof PERFIS)[number];

/** Na ordem do MVP-00 §4.2: primeiro os comuns, depois os sinais de alerta. */
export const SINTOMAS = [
  "DOR_LOCAL",
  "INCHACO_LOCAL",
  "VERMELHIDAO",
  "DORMENCIA",
  "FALTA_DE_AR",
  "VISAO_TURVA",
  "VOMITOS",
  "SUOR_INTENSO",
  "SONOLENCIA_DESMAIO",
  "SANGRAMENTO",
  "INCHACO_ROSTO",
  "MUITAS_PICADAS_ALERGIA",
] as const;
export type Sintoma = (typeof SINTOMAS)[number];
