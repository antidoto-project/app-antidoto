import { z } from "zod";

import { FAIXAS_ETARIAS, SINTOMAS, TIPOS_ANIMAL } from "@/types/enums.types";

/** "Quando foi a picada?" em opções fixas, sem date picker (MVP-02 §3.1). */
export const OPCOES_HORA_PICADA = [
  "AGORA",
  "HA_1_HORA",
  "HA_2_HORAS",
  "HA_3_HORAS_OU_MAIS",
] as const;
export type OpcaoHoraPicada = (typeof OPCOES_HORA_PICADA)[number];

// A triagem confere um passo de cada vez (useTriagem): só avança com o passo válido

/** Passo 1 — o animal. "Não sei" é uma resposta válida. */
export const PassoAnimalSchema = z.object({
  tipoAnimal: z.enum(TIPOS_ANIMAL, { error: "Escolha o animal (ou “Não sei”)" }),
});

/** Passo 2 — quem foi picado e quando. */
export const PassoQuemQuandoSchema = z.object({
  faixaEtaria: z.enum(FAIXAS_ETARIAS, { error: "Escolha quem foi picado" }),
  opcaoHora: z.enum(OPCOES_HORA_PICADA, { error: "Escolha quando foi a picada" }),
});

/** Passo 3 — sintomas. Pode não marcar nenhum. */
export const PassoSintomasSchema = z.object({
  sintomas: z.array(z.enum(SINTOMAS)),
});

export type TriagemInput = z.infer<typeof PassoAnimalSchema> &
  z.infer<typeof PassoQuemQuandoSchema> &
  z.infer<typeof PassoSintomasSchema>;

/** RN-G4: a hora da picada não pode estar no futuro (tolerância de 5 min) nem passar de 72 h. */
const TOLERANCIA_FUTURO_MS = 5 * 60_000;
const LIMITE_PASSADO_MS = 72 * 3_600_000;

/**
 * Os params que a triagem manda para o resultado (T4). Vêm da URL, então tudo é
 * texto: os sintomas vão separados por vírgula ("" = nenhum) e a hora em ISO.
 * Recebe o "agora" para conferir a RN-G4.
 */
export function criarParamsResultadoSchema(agora: Date) {
  return z.object({
    tipoAnimal: z.enum(TIPOS_ANIMAL),
    faixaEtaria: z.enum(FAIXAS_ETARIAS),
    sintomas: z
      .string()
      .default("")
      .transform((lista) => (lista ? lista.split(",") : []))
      .pipe(z.array(z.enum(SINTOMAS))),
    horaPicada: z.iso.datetime().refine((iso) => {
      const diferenca = agora.getTime() - new Date(iso).getTime();
      return diferenca >= -TOLERANCIA_FUTURO_MS && diferenca <= LIMITE_PASSADO_MS;
    }, "A hora da picada precisa estar entre agora e 72 horas atrás"),
  });
}

export type ParamsResultado = z.infer<ReturnType<typeof criarParamsResultadoSchema>>;

/** O param da tela de primeiros socorros (T5): o animal, como na triagem. */
export const ParamsPrimeirosSocorrosSchema = z.object({
  tipoAnimal: z.enum(TIPOS_ANIMAL),
});

/**
 * As respostas da triagem que passam pelo login e pelo cadastro quando a pessoa
 * toca em "Entre para salvar a ocorrência": depois de entrar, o app volta para o
 * resultado com elas (decisão de 09/11). Ficam como texto, iguais aos params do
 * resultado, que confere tudo de novo ao abrir.
 */
export const RetornoAoResultadoSchema = z.object({
  tipoAnimal: z.enum(TIPOS_ANIMAL),
  faixaEtaria: z.enum(FAIXAS_ETARIAS),
  sintomas: z.string().default(""),
  horaPicada: z.string().min(1),
});

export type RetornoAoResultado = z.infer<typeof RetornoAoResultadoSchema>;
