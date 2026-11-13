import { api } from "@/api/api";
import type { AlterarSenhaInput } from "@/schemas/alterar-senha.schema";
import type { CadastroInput } from "@/schemas/cadastro.schema";
import type { EditarPerfilInput } from "@/schemas/editar-perfil.schema";
import type { LoginInput } from "@/schemas/login.schema";
import type { RespostaAutenticacao, Usuario } from "@/types/usuario.types";
import { mascararTelefone, somenteDigitos } from "@/utils/mascaras";

/**
 * Confere a resposta do login e do cadastro: sem token ou sem usuário, a sessão
 * ficaria quebrada (toda chamada logada daria 401). Melhor falhar aqui e a tela
 * mostrar o erro.
 */
function conferirResposta(data: RespostaAutenticacao | undefined): RespostaAutenticacao {
  if (!data?.token || !data.usuario) throw new Error("Resposta de autenticação sem token");
  return data;
}

export const autenticacaoService = {
  /**
   * POST /api/auth/login → { token, usuario }. E-mail ou senha errados: 401 —
   * a tela mostra "E-mail ou senha incorretos" (MVP-02 §3.4).
   */
  async entrar(dados: LoginInput): Promise<RespostaAutenticacao> {
    const { data } = await api.post<RespostaAutenticacao>("/api/auth/login", {
      email: dados.email.trim().toLowerCase(),
      senha: dados.senha,
    });
    return conferirResposta(data);
  },

  /**
   * POST /api/auth/cadastro → já devolve o token: a conta é criada e a pessoa
   * entra direto. E-mail já cadastrado: 409, com a mensagem da API.
   */
  async cadastrar(dados: CadastroInput): Promise<RespostaAutenticacao> {
    const telefone = somenteDigitos(dados.telefone);
    const { data } = await api.post<RespostaAutenticacao>("/api/auth/cadastro", {
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
      senha: dados.senha,
      telefone: telefone || null, // opcional: na API, só os dígitos
    });
    return conferirResposta(data);
  },

  /** GET /api/usuarios/me — quem é o dono do token. */
  async buscarUsuarioLogado(): Promise<Usuario> {
    const { data } = await api.get<Usuario>("/api/usuarios/me");
    return data;
  },

  /**
   * PUT /api/usuarios/me — o contrato só deixa mudar o nome e o telefone
   * (AtualizarUsuarioRequest). Devolve o usuário já atualizado.
   */
  async atualizarUsuario(dados: EditarPerfilInput): Promise<Usuario> {
    const telefone = somenteDigitos(dados.telefone);
    const { data } = await api.put<Usuario>("/api/usuarios/me", {
      nome: dados.nome.trim(),
      telefone: telefone || null, // vazio apaga o telefone; na API, só os dígitos
    });
    return data;
  },

  /**
   * PUT /api/usuarios/me/senha → 204. A senha atual errada volta como 400 no
   * campo `senhaAtual` (não 401: a sessão continua).
   */
  async alterarSenha({ senhaAtual, novaSenha }: AlterarSenhaInput): Promise<void> {
    await api.put("/api/usuarios/me/senha", { senhaAtual, novaSenha });
  },

  /** Usuário da API → valores do formulário do Perfil (telefone com máscara). */
  paraFormulario(usuario: Usuario): EditarPerfilInput {
    return {
      nome: usuario.nome,
      telefone: usuario.telefone ? mascararTelefone(usuario.telefone) : "",
    };
  },
};
