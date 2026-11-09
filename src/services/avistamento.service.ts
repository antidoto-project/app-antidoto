import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import type { AvistamentoInput } from "@/schemas/avistamento.schema";
import type { Avistamento, DadosAvistamento } from "@/types/avistamento.types";

/**
 * Quantos avistamentos a lista busca de uma vez: o máximo do contrato
 * (`tamanho` até 50). O MVP não tem "carregar mais"; os mais recentes vêm primeiro.
 */
export const TAMANHO_LISTA_AVISTAMENTOS = 50;

/** Formulário → payload do contrato: localização "achatada" e observação vazia como null. */
function doFormulario(dados: AvistamentoInput, dataHora: string): DadosAvistamento {
  const observacao = dados.observacao.trim();
  return {
    tipoAnimal: dados.tipoAnimal,
    local: dados.local,
    latitude: dados.localizacao.latitude,
    longitude: dados.localizacao.longitude,
    dataHora,
    observacao: observacao || null,
  };
}

export const avistamentoService = {
  /** GET /api/avistamentos/meus (paginado): só os da pessoa logada (RN-G5). */
  async listarMeus(): Promise<Avistamento[]> {
    const { data } = await api.get("/api/avistamentos/meus", {
      params: { pagina: 0, tamanho: TAMANHO_LISTA_AVISTAMENTOS },
    });
    return extrairLista<Avistamento>(data);
  },

  /** GET /api/avistamentos/{id}. De outra pessoa: 404, igual a um id que não existe. */
  async buscarPorId(id: number): Promise<Avistamento> {
    const { data } = await api.get<Avistamento>(`/api/avistamentos/${id}`);
    return data;
  },

  /** POST /api/avistamentos — a `dataHora` é agora (MVP-02 §3.3). */
  async criar(dados: AvistamentoInput): Promise<Avistamento> {
    const corpo = doFormulario(dados, new Date().toISOString());
    const { data } = await api.post<Avistamento>("/api/avistamentos", corpo);
    return data;
  },

  /** PUT /api/avistamentos/{id} — mantém a `dataHora` original (MVP-02 §3.3). */
  async atualizar(id: number, dados: AvistamentoInput, dataHora: string): Promise<Avistamento> {
    const { data } = await api.put<Avistamento>(
      `/api/avistamentos/${id}`,
      doFormulario(dados, dataHora)
    );
    return data;
  },

  /** DELETE /api/avistamentos/{id} → 204. */
  async excluir(id: number): Promise<void> {
    await api.delete(`/api/avistamentos/${id}`);
  },

  /** O avistamento salvo → valores do formulário de edição (T11). */
  paraFormulario(avistamento: Avistamento): AvistamentoInput {
    return {
      tipoAnimal: avistamento.tipoAnimal,
      local: avistamento.local,
      localizacao: { latitude: avistamento.latitude, longitude: avistamento.longitude },
      observacao: avistamento.observacao ?? "",
    };
  },
};
