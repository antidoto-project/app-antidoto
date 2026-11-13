import { useState } from "react";

import {
  PassoAnimalSchema,
  PassoQuemQuandoSchema,
  type OpcaoHoraPicada,
} from "@/schemas/triagem.schema";
import type { FaixaEtaria, Sintoma, TipoAnimal } from "@/types/enums.types";
import { horaPorOpcao } from "@/utils/data";
import { alternarSintoma as alternarSintomaNaLista } from "@/utils/rotulos";

export const TOTAL_PASSOS_TRIAGEM = 3;

type CampoTriagem = "tipoAnimal" | "faixaEtaria" | "opcaoHora";

/** Os params de /sos/resultado: texto, porque vão na URL (MVP-02 §2). */
export type ParamsDoResultado = {
  tipoAnimal: TipoAnimal;
  faixaEtaria: FaixaEtaria;
  /** Separados por vírgula; "" quando nenhum foi marcado. */
  sintomas: string;
  /** ISO-8601 (UTC). */
  horaPicada: string;
};

/**
 * Hook de tela da triagem (T3): o passo atual, as respostas e a validação de
 * cada passo (schemas de triagem.schema.ts). Não navega: a tela leva os params
 * de `concluir()` para o resultado.
 */
export function useTriagem() {
  const [passo, setPasso] = useState(1);
  const [tipoAnimal, setTipoAnimal] = useState<TipoAnimal>();
  const [faixaEtaria, setFaixaEtaria] = useState<FaixaEtaria>();
  const [opcaoHora, setOpcaoHora] = useState<OpcaoHoraPicada>();
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [erros, setErros] = useState<Partial<Record<CampoTriagem, string>>>({});

  function limparErro(campo: CampoTriagem) {
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  function escolherAnimal(valor: TipoAnimal) {
    setTipoAnimal(valor);
    limparErro("tipoAnimal");
  }

  function escolherFaixaEtaria(valor: FaixaEtaria) {
    setFaixaEtaria(valor);
    limparErro("faixaEtaria");
  }

  function escolherHora(valor: OpcaoHoraPicada) {
    setOpcaoHora(valor);
    limparErro("opcaoHora");
  }

  function alternarSintoma(sintoma: Sintoma) {
    setSintomas((atuais) => alternarSintomaNaLista(atuais, sintoma));
  }

  /** Confere o passo atual; mostra os erros dele e devolve se está tudo certo. */
  function passoValido(): boolean {
    const conferencia =
      passo === 1
        ? PassoAnimalSchema.safeParse({ tipoAnimal })
        : passo === 2
          ? PassoQuemQuandoSchema.safeParse({ faixaEtaria, opcaoHora })
          : null; // passo 3: sintomas são opcionais

    if (!conferencia || conferencia.success) return true;

    const novosErros: Partial<Record<CampoTriagem, string>> = {};
    for (const { path, message } of conferencia.error.issues) {
      novosErros[path[0] as CampoTriagem] ??= message;
    }
    setErros(novosErros);
    return false;
  }

  function avancar() {
    if (passoValido()) setPasso((atual) => Math.min(atual + 1, TOTAL_PASSOS_TRIAGEM));
  }

  function voltar() {
    setPasso((atual) => Math.max(atual - 1, 1));
  }

  /** No último passo: os params do resultado, com a hora calculada agora; null se faltar algo. */
  function concluir(agora: Date): ParamsDoResultado | null {
    if (!tipoAnimal || !faixaEtaria || !opcaoHora) return null;
    return {
      tipoAnimal,
      faixaEtaria,
      sintomas: sintomas.join(","),
      horaPicada: horaPorOpcao(opcaoHora, agora),
    };
  }

  return {
    passo,
    ultimoPasso: passo === TOTAL_PASSOS_TRIAGEM,
    tipoAnimal,
    faixaEtaria,
    opcaoHora,
    sintomas,
    erros,
    escolherAnimal,
    escolherFaixaEtaria,
    escolherHora,
    alternarSintoma,
    avancar,
    voltar,
    concluir,
  };
}
