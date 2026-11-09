import { api } from "@/api/api";
import type { BuscaUnidadesProximas, UnidadeProxima } from "@/types/unidade.types";

/** Quantas unidades o resultado mostra (o contrato aceita de 1 a 10; o padrão é 5). */
export const LIMITE_UNIDADES_PROXIMAS = 5;

export const unidadeService = {
  /**
   * GET /api/unidades/proximas (público, RN-S1 a RN-S4): as unidades com soro
   * compatível com o animal, da mais perto para a mais longe. A compatibilidade
   * e a ordem são do Java; o app só mostra. Lista vazia é resposta válida (RN-S4).
   */
  async buscarProximas({
    latitude,
    longitude,
    tipoAnimal,
  }: BuscaUnidadesProximas): Promise<UnidadeProxima[]> {
    const { data } = await api.get<UnidadeProxima[]>("/api/unidades/proximas", {
      params: { latitude, longitude, tipoAnimal, limite: LIMITE_UNIDADES_PROXIMAS },
    });
    // O contrato devolve um array; qualquer outra coisa vira "nenhuma unidade",
    // e a tela mostra o 192 (nunca quebra no meio de uma emergência)
    return Array.isArray(data) ? data : [];
  },
};
