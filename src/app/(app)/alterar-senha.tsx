import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { errosDaApiNoFormulario } from "@/api/erros";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { TEMPO_DO_AVISO_MS, ToastSucesso } from "@/components/ui/ToastSucesso";
import { useAlterarSenha } from "@/hooks/usePerfil";
import {
  AlterarSenhaSchema,
  CAMPOS_ALTERAR_SENHA,
  type AlterarSenhaInput,
} from "@/schemas/alterar-senha.schema";

/**
 * Alterar senha (PUT /api/usuarios/me/senha), pelo cartão "Segurança" do Perfil.
 * A API confere a senha atual: errada, a mensagem aparece embaixo do campo.
 * Salvou → o aviso aparece e a tela volta para o Perfil.
 */
export default function TelaAlterarSenha() {
  const { mutate: alterar, isPending: salvando } = useAlterarSenha();
  const [salva, setSalva] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AlterarSenhaInput>({
    resolver: zodResolver(AlterarSenhaSchema),
    mode: "onTouched",
    defaultValues: { senhaAtual: "", novaSenha: "", confirmarSenha: "" },
  });

  useEffect(() => {
    if (!salva) return;
    const temporizador = setTimeout(() => router.back(), TEMPO_DO_AVISO_MS);
    return () => clearTimeout(temporizador);
  }, [salva]);

  function salvar(dados: AlterarSenhaInput) {
    alterar(dados, {
      onSuccess: () => setSalva(true),
      onError: (erro) => {
        const { porCampo, geral } = errosDaApiNoFormulario(erro, CAMPOS_ALTERAR_SENHA);
        porCampo.forEach(({ campo, mensagem }) => setError(campo, { message: mensagem }));
        if (geral) setError("root", { message: geral });
      },
    });
  }

  return (
    <View className="flex-1">
      <TelaFormulario
        titulo={"Alterar\nsenha"}
        subtitulo="A nova senha precisa ter pelo menos 8 caracteres, com letra e número."
        erro={errors.root?.message}
        rodape={
          <BotaoEnviar
            enviando={salvando || salva}
            onPress={handleSubmit(salvar)}
            texto="Salvar nova senha"
            textoLoading="Salvando..."
          />
        }
      >
        <View className="gap-4">
          <CampoTexto
            name="senhaAtual"
            control={control}
            label="Senha atual"
            placeholder="Sua senha de agora"
            campoSenha
            autoComplete="password"
            textContentType="password"
          />
          <CampoTexto
            name="novaSenha"
            control={control}
            label="Nova senha"
            placeholder="8 ou mais, com letra e número"
            campoSenha
            autoComplete="password-new"
            textContentType="newPassword"
          />
          <CampoTexto
            name="confirmarSenha"
            control={control}
            label="Repita a nova senha"
            placeholder="A mesma nova senha"
            campoSenha
            autoComplete="password-new"
            textContentType="newPassword"
          />
        </View>
      </TelaFormulario>

      {salva && <ToastSucesso />}
    </View>
  );
}
