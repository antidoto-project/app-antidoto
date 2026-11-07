import { z } from "zod";

// Campos com os nomes do contrato (LoginRequest): o erro da API cai no campo certo
export const LoginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const CAMPOS_LOGIN = ["email", "senha"] as const;
