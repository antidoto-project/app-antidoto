import { api } from "@/api/api";
import type { PrimeirosSocorros } from "@/types/conteudo.types";
import type { TipoAnimal } from "@/types/enums.types";

export const conteudoService = {
  /**
   * GET /api/conteudo/primeiros-socorros/{tipoAnimal} (público, RN-G1): o que
   * fazer, o que não fazer e os cuidados do animal (MVP-02 §6). O texto fica na
   * API, que nunca escreve dose, remédio ou tratamento.
   */
  async buscarPrimeirosSocorros(tipoAnimal: TipoAnimal): Promise<PrimeirosSocorros> {
    const { data } = await api.get<PrimeirosSocorros>(
      `/api/conteudo/primeiros-socorros/${tipoAnimal}`
    );
    return data;
  },
};
