import { z } from "zod";

// Campos com os nomes do contrato (CadastroRequest): o erro da API cai no campo certo
export const CadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome (pelo menos 2 letras)")
    .max(120, "O nome pode ter até 120 caracteres"),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .max(160, "O e-mail pode ter até 160 caracteres"),
  // Regra do contrato: mínimo de 8, com letra e número
  senha: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres")
    .max(72, "A senha pode ter até 72 caracteres")
    .regex(/[A-Za-z]/, "A senha precisa ter pelo menos uma letra")
    .regex(/\d/, "A senha precisa ter pelo menos um número"),
  // Opcional; na tela vai com máscara, na API só os dígitos (10 ou 11, com DDD)
  telefone: z.string().refine((valor) => {
    const digitos = valor.replace(/\D/g, "").length;
    return digitos === 0 || digitos === 10 || digitos === 11;
  }, "Telefone inválido: use o DDD e o número"),
});

export type CadastroInput = z.infer<typeof CadastroSchema>;

export const CAMPOS_CADASTRO = ["nome", "email", "senha", "telefone"] as const;
