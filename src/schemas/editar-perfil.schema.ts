import type { z } from "zod";

import { CadastroSchema } from "@/schemas/cadastro.schema";

/**
 * Editar o perfil (PUT /api/usuarios/me): o contrato só deixa mudar o nome e o
 * telefone (AtualizarUsuarioRequest), com as mesmas regras do cadastro. O e-mail
 * fica só para leitura.
 */
export const EditarPerfilSchema = CadastroSchema.pick({ nome: true, telefone: true });

export type EditarPerfilInput = z.infer<typeof EditarPerfilSchema>;

export const CAMPOS_EDITAR_PERFIL = ["nome", "telefone"] as const;
