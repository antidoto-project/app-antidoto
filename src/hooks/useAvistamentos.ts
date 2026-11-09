import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AvistamentoInput } from "@/schemas/avistamento.schema";
import { avistamentoService } from "@/services/avistamento.service";

/** Chaves do MVP-02 §4: ["avistamentos","meus"] e ["avistamentos", id]. */
const CHAVE_AVISTAMENTOS = "avistamentos";
const CHAVE_MEUS_AVISTAMENTOS = [CHAVE_AVISTAMENTOS, "meus"] as const;

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useMeusAvistamentos() {
  return useQuery({
    queryKey: CHAVE_MEUS_AVISTAMENTOS,
    queryFn: avistamentoService.listarMeus,
  });
}

export function useAvistamento(id: number) {
  return useQuery({
    queryKey: [CHAVE_AVISTAMENTOS, id] as const,
    queryFn: () => avistamentoService.buscarPorId(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

// ─── ESCRITA (a tela navega no onSuccess; o hook só cuida do cache) ──────────

export function useCriarAvistamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: AvistamentoInput) => avistamentoService.criar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_MEUS_AVISTAMENTOS }),
  });
}

export function useAtualizarAvistamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dados,
      dataHora,
    }: {
      id: number;
      dados: AvistamentoInput;
      /** A original: editar não muda quando o animal foi visto. */
      dataHora: string;
    }) => avistamentoService.atualizar(id, dados, dataHora),
    onSuccess: (avistamento) => {
      queryClient.setQueryData([CHAVE_AVISTAMENTOS, avistamento.id], avistamento);
      return queryClient.invalidateQueries({ queryKey: CHAVE_MEUS_AVISTAMENTOS });
    },
  });
}

export function useExcluirAvistamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => avistamentoService.excluir(id),
    onSuccess: (_resultado, id) => {
      queryClient.removeQueries({ queryKey: [CHAVE_AVISTAMENTOS, id] });
      return queryClient.invalidateQueries({ queryKey: CHAVE_MEUS_AVISTAMENTOS });
    },
  });
}
