import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import type { DadosOcorrencia, Ocorrencia } from "@/types/ocorrencia.types";

/** O histórico busca as 50 mais recentes, o máximo do contrato (`tamanho` até 50). */
export const TAMANHO_LISTA_OCORRENCIAS = 50;

export const ocorrenciaService = {
  /**
   * POST /api/ocorrencias → 201 na hora, com `statusResumo: PENDENTE`. O Java
   * calcula a urgência (RN-U) e gera o resumo por IA em segundo plano.
   */
  async criar(dados: DadosOcorrencia): Promise<Ocorrencia> {
    const { data } = await api.post<Ocorrencia>("/api/ocorrencias", dados);
    return data;
  },

  /** GET /api/ocorrencias/minhas (paginado, mais recentes primeiro). */
  async listarMinhas(): Promise<Ocorrencia[]> {
    const { data } = await api.get("/api/ocorrencias/minhas", {
      params: { pagina: 0, tamanho: TAMANHO_LISTA_OCORRENCIAS },
    });
    return extrairLista<Ocorrencia>(data);
  },

  /** GET /api/ocorrencias/{id}. De outra pessoa: 404, igual a um id que não existe. */
  async buscarPorId(id: number): Promise<Ocorrencia> {
    const { data } = await api.get<Ocorrencia>(`/api/ocorrencias/${id}`);
    return data;
  },

  /** DELETE /api/ocorrencias/{id} → 204 (remove do histórico). */
  async excluir(id: number): Promise<void> {
    await api.delete(`/api/ocorrencias/${id}`);
  },
};
