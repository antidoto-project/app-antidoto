import { z } from "zod";

import { LOCAIS_AVISTAMENTO, TIPOS_ANIMAL } from "@/types/enums.types";

/**
 * Formulário de avistamento (T10 e T11). A localização vem do GPS ("Usar minha
 * localização"), obrigatória; os limites são os do contrato (o Brasil). A
 * `dataHora` não está no formulário: no novo é "agora", na edição a original.
 */
export const AvistamentoSchema = z.object({
  tipoAnimal: z.enum(TIPOS_ANIMAL, { error: "Escolha o animal (ou “Não sei”)" }),
  local: z.enum(LOCAIS_AVISTAMENTO, { error: "Escolha onde você viu" }),
  // A mensagem fica no próprio campo `localizacao` (não em latitude/longitude),
  // para o CampoLocalizacao mostrar
  localizacao: z
    .object(
      { latitude: z.number(), longitude: z.number() },
      { error: "Toque em “Usar minha localização”" }
    )
    .refine(
      ({ latitude, longitude }) =>
        latitude >= -34 && latitude <= 6 && longitude >= -74 && longitude <= -34,
      "A localização precisa ser no Brasil"
    ),
  observacao: z.string().trim().max(500, "A observação pode ter até 500 caracteres"),
});

/** O que a tela edita; os valores começam vazios até a pessoa escolher. */
export type AvistamentoInput = z.infer<typeof AvistamentoSchema>;

export const CAMPOS_AVISTAMENTO = ["tipoAnimal", "local", "localizacao", "observacao"] as const;
