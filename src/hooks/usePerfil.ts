import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSessao } from "@/context/SessaoContext";
import { CHAVE_USUARIO_LOGADO } from "@/hooks/useAutenticacao";
import { autenticacaoService } from "@/services/autenticacao.service";

/**
 * Dados de quem está logado (GET /api/usuarios/me). Ao entrar, o SessaoContext
 * já coloca o usuário da resposta do login neste cache: o Perfil abre sem esperar.
 */
export function useUsuarioLogado() {
  const { sessao } = useSessao();

  return useQuery({
    queryKey: CHAVE_USUARIO_LOGADO,
    queryFn: autenticacaoService.buscarUsuarioLogado,
    enabled: Boolean(sessao),
  });
}

/**
 * Salva o nome e o telefone (PUT /api/usuarios/me). A API devolve o usuário já
 * atualizado: ele vai direto para o cache do Perfil e para a sessão salva (o
 * Início cumprimenta pelo nome), sem uma segunda chamada.
 */
export function useAtualizarUsuario() {
  const queryClient = useQueryClient();
  const { atualizarPerfil } = useSessao();

  return useMutation({
    mutationFn: autenticacaoService.atualizarUsuario,
    onSuccess: async (usuario) => {
      queryClient.setQueryData(CHAVE_USUARIO_LOGADO, usuario);
      await atualizarPerfil(usuario);
    },
  });
}
