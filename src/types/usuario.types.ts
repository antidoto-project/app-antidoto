import type { Perfil } from "@/types/enums.types";

/** Usuário como a API devolve (schema `Usuario` do contrato). */
export type Usuario = {
  id: number;
  nome: string;
  email: string;
  /** Só dígitos (DDD + número); `null` quando não informado. */
  telefone: string | null;
  perfil: Perfil;
  criadoEm: string;
};

/** Resposta do login e do cadastro (schema `AuthResponse` do contrato). */
export type RespostaAutenticacao = {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  usuario: Usuario;
};
