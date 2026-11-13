import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { EditarOcorrenciaInput } from "@/schemas/editar-ocorrencia.schema";
import { ocorrenciaService } from "@/services/ocorrencia.service";
import type { DadosOcorrencia, Ocorrencia } from "@/types/ocorrencia.types";

/** Chaves do MVP-02 §4: ["ocorrencias","minhas"] e ["ocorrencias", id]. */
const CHAVE_OCORRENCIAS = "ocorrencias";
const CHAVE_MINHAS_OCORRENCIAS = [CHAVE_OCORRENCIAS, "minhas"] as const;

/** De quanto em quanto tempo a tela consulta o resumo enquanto a IA trabalha (contrato). */
export const INTERVALO_RESUMO_MS = 3_000;

/** Consulta de novo só enquanto o resumo está PENDENTE; pronto (ou modelo padrão), para. */
export function intervaloDoResumo(ocorrencia: Ocorrencia | undefined): number | false {
  return ocorrencia?.statusResumo === "PENDENTE" ? INTERVALO_RESUMO_MS : false;
}

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useMinhasOcorrencias() {
  return useQuery({
    queryKey: CHAVE_MINHAS_OCORRENCIAS,
    queryFn: ocorrenciaService.listarMinhas,
  });
}

/** O detalhe (T12): refaz a consulta a cada 3 s até o resumo ficar pronto (MVP-02 §3.2). */
export function useOcorrencia(id: number) {
  return useQuery({
    queryKey: [CHAVE_OCORRENCIAS, id] as const,
    queryFn: () => ocorrenciaService.buscarPorId(id),
    enabled: Number.isInteger(id) && id > 0,
    refetchInterval: (query) => intervaloDoResumo(query.state.data),
  });
}

// ─── ESCRITA (a tela navega no onSuccess; o hook só cuida do cache) ──────────

export function useCriarOcorrencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosOcorrencia) => ocorrenciaService.criar(dados),
    onSuccess: (ocorrencia) => {
      // O detalhe abre na hora com o que o POST devolveu (PENDENTE)
      queryClient.setQueryData([CHAVE_OCORRENCIAS, ocorrencia.id], ocorrencia);
      return queryClient.invalidateQueries({ queryKey: CHAVE_MINHAS_OCORRENCIAS });
    },
  });
}

export function useAtualizarOcorrencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ocorrencia, dados }: { ocorrencia: Ocorrencia; dados: EditarOcorrenciaInput }) =>
      ocorrenciaService.atualizar(ocorrencia, dados),
    onSuccess: (ocorrencia) => {
      // O detalhe volta com a urgência nova e o resumo PENDENTE, e consulta até ficar pronto
      queryClient.setQueryData([CHAVE_OCORRENCIAS, ocorrencia.id], ocorrencia);
      return queryClient.invalidateQueries({ queryKey: CHAVE_MINHAS_OCORRENCIAS });
    },
  });
}

export function useExcluirOcorrencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ocorrenciaService.excluir(id),
    onSuccess: (_resultado, id) => {
      queryClient.removeQueries({ queryKey: [CHAVE_OCORRENCIAS, id] });
      return queryClient.invalidateQueries({ queryKey: CHAVE_MINHAS_OCORRENCIAS });
    },
  });
}
