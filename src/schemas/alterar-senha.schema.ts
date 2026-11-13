import { z } from "zod";

import { CadastroSchema } from "@/schemas/cadastro.schema";

/**
 * Alterar senha (Perfil → Segurança). A nova senha segue a regra do cadastro; a
 * API confere a senha atual.
 */
export const AlterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: CadastroSchema.shape.senha,
    confirmarSenha: z.string().min(1, "Repita a nova senha"),
  })
  .refine((dados) => dados.confirmarSenha === dados.novaSenha, {
    path: ["confirmarSenha"],
    message: "As senhas não coincidem",
  })
  .refine((dados) => dados.novaSenha !== dados.senhaAtual, {
    path: ["novaSenha"],
    message: "A nova senha precisa ser diferente da atual",
  });

export type AlterarSenhaInput = z.infer<typeof AlterarSenhaSchema>;

export const CAMPOS_ALTERAR_SENHA = ["senhaAtual", "novaSenha", "confirmarSenha"] as const;
