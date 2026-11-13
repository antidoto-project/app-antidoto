import { z } from "zod";

import { SINTOMAS } from "@/types/enums.types";

/** A opção "Ainda não escolhi" da unidade de destino (o CampoSelecao trabalha com texto). */
export const SEM_UNIDADE = "nenhuma";

/**
 * Atualizar a ocorrência (T12b): os sintomas de agora e a unidade de destino. O
 * animal, a faixa etária, a hora da picada e o lugar continuam os do registro.
 */
export const EditarOcorrenciaSchema = z.object({
  /** Pode ser vazia, como no registro. */
  sintomas: z.array(z.enum(SINTOMAS)),
  /** O id da unidade em texto, ou SEM_UNIDADE. */
  unidadeId: z.string().min(1, "Escolha a unidade (ou “Ainda não escolhi”)"),
});

export type EditarOcorrenciaInput = z.infer<typeof EditarOcorrenciaSchema>;

export const CAMPOS_EDITAR_OCORRENCIA = ["sintomas", "unidadeId"] as const;
