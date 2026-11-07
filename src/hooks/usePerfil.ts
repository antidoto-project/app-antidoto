import { useQuery } from "@tanstack/react-query";

import { useSessao } from "@/context/SessaoContext";
import { CHAVE_USUARIO_LOGADO } from "@/hooks/useAutenticacao";
import { autenticacaoService } from "@/services/autenticacao.service";

/**
 * Dados de quem está logado (GET /api/usuarios/me). Ao entrar, o SessaoContext
 * já coloca o usuário da resposta do login neste cache: o Perfil abre sem esperar.
 * Editar nome e telefone (useAtualizarUsuario) entra no Passo 7.
 */
export function useUsuarioLogado() {
  const { sessao } = useSessao();

  return useQuery({
    queryKey: CHAVE_USUARIO_LOGADO,
    queryFn: autenticacaoService.buscarUsuarioLogado,
    enabled: Boolean(sessao),
  });
}
