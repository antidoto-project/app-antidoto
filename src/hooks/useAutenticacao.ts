import { useMutation } from "@tanstack/react-query";

import type { CadastroInput } from "@/schemas/cadastro.schema";
import type { LoginInput } from "@/schemas/login.schema";
import { autenticacaoService } from "@/services/autenticacao.service";

/** Cache de GET /api/usuarios/me: quem é o dono do token (Perfil e revalidação no boot). */
export const CHAVE_USUARIO_LOGADO = ["usuario", "me"] as const;

// A tela chama `entrar()` do SessaoContext no onSuccess e navega: o hook não guarda
// sessão nem navega (CLAUDE.md §6).

export function useEntrar() {
  return useMutation({
    mutationFn: (dados: LoginInput) => autenticacaoService.entrar(dados),
  });
}

/** O cadastro já devolve o token: a conta é criada e a pessoa entra direto. */
export function useCadastrar() {
  return useMutation({
    mutationFn: (dados: CadastroInput) => autenticacaoService.cadastrar(dados),
  });
}
