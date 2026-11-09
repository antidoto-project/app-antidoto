import type { LocalAvistamento, TipoAnimal } from "@/types/enums.types";

/** Schema `AvistamentoRequest` do contrato (POST e PUT /api/avistamentos). */
export type DadosAvistamento = {
  tipoAnimal: TipoAnimal;
  local: LocalAvistamento;
  latitude: number;
  longitude: number;
  /** ISO-8601 (UTC); não pode estar no futuro. */
  dataHora: string;
  /** Até 500 caracteres. */
  observacao: string | null;
};

/** Schema `Avistamento` do contrato. Só o dono vê, edita e exclui (RN-G5). */
export type Avistamento = DadosAvistamento & {
  id: number;
  criadoEm: string;
  atualizadoEm: string | null;
};
