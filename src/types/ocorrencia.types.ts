import type { FaixaEtaria, Sintoma, StatusResumo, TipoAnimal, Urgencia } from "@/types/enums.types";

/** Schema `OcorrenciaRequest` do contrato (POST /api/ocorrencias). */
export type DadosOcorrencia = {
  tipoAnimal: TipoAnimal;
  faixaEtaria: FaixaEtaria;
  /** Pode ser vazia. */
  sintomas: Sintoma[];
  /** ISO-8601 (UTC); RN-G4: sem futuro (+5 min) e até 72 h. */
  horaPicada: string;
  latitude: number;
  longitude: number;
  /** A unidade escolhida no resultado ("Vou para esta unidade"), se houver. */
  unidadeId: number | null;
};

/** Schema `Ocorrencia` do contrato. Só o dono vê (outro usuário → 404). */
export type Ocorrencia = Omit<DadosOcorrencia, "unidadeId"> & {
  id: number;
  /** Calculada pelo Java com a mesma RN-U do app. */
  urgencia: Urgencia;
  motivos: string[];
  ligar192: boolean;
  unidadeId: number | null;
  unidadeNome: string | null;
  /** PENDENTE enquanto a IA gera o resumo (o app consulta a cada 3 s). */
  statusResumo: StatusResumo;
  /** Preenchido quando o status não é mais PENDENTE. */
  resumo: string | null;
  /** RN-G7: "Resumo gerado por IA. Não substitui avaliação profissional." */
  avisoResumo: string | null;
  /** RN-G2: "Procure atendimento médico imediatamente." */
  aviso: string | null;
  criadoEm: string;
};
