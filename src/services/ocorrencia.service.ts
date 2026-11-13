import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import { SEM_UNIDADE, type EditarOcorrenciaInput } from "@/schemas/editar-ocorrencia.schema";
import type { DadosOcorrencia, Ocorrencia } from "@/types/ocorrencia.types";

/** O histórico busca as 50 mais recentes, o máximo do contrato (`tamanho` até 50). */
export const TAMANHO_LISTA_OCORRENCIAS = 50;

/** Formulário da atualização → payload do contrato: o que não está na tela vem do registro. */
function paraAtualizacao(ocorrencia: Ocorrencia, dados: EditarOcorrenciaInput): DadosOcorrencia {
  return {
    tipoAnimal: ocorrencia.tipoAnimal,
    faixaEtaria: ocorrencia.faixaEtaria,
    sintomas: dados.sintomas,
    horaPicada: ocorrencia.horaPicada,
    latitude: ocorrencia.latitude,
    longitude: ocorrencia.longitude,
    unidadeId: dados.unidadeId === SEM_UNIDADE ? null : Number(dados.unidadeId),
  };
}

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

  /**
   * PUT /api/ocorrencias/{id}: os sintomas de agora e a unidade de destino. O Java
   * recalcula a urgência (RN-U) e gera um resumo novo (volta `PENDENTE`). Com o
   * resumo anterior ainda sendo gerado, responde 409.
   */
  async atualizar(ocorrencia: Ocorrencia, dados: EditarOcorrenciaInput): Promise<Ocorrencia> {
    const { data } = await api.put<Ocorrencia>(
      `/api/ocorrencias/${ocorrencia.id}`,
      paraAtualizacao(ocorrencia, dados)
    );
    return data;
  },

  /** Ocorrência → valores iniciais do formulário de atualização. */
  paraFormulario(ocorrencia: Ocorrencia): EditarOcorrenciaInput {
    return {
      sintomas: ocorrencia.sintomas,
      unidadeId: ocorrencia.unidadeId === null ? SEM_UNIDADE : String(ocorrencia.unidadeId),
    };
  },

  /** DELETE /api/ocorrencias/{id} → 204 (remove do histórico). */
  async excluir(id: number): Promise<void> {
    await api.delete(`/api/ocorrencias/${id}`);
  },
};
