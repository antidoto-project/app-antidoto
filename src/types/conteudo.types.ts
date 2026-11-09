import type { TipoAnimal } from "@/types/enums.types";

/** Primeiros socorros de um animal (conteúdo local do MVP-02 §6). */
export type PrimeirosSocorros = {
  tipoAnimal: TipoAnimal;
  faca: string[];
  naoFaca: string[];
  /** Os cuidados específicos daquele animal. */
  atencao: string[];
};
