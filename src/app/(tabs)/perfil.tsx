import { zodResolver } from "@hookform/resolvers/zod";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { errosDaApiNoFormulario, mensagemDaApi } from "@/api/erros";
import { EstadoErro } from "@/components/EstadoErro";
import { ContaCard } from "@/components/perfil/ContaCard";
import { DadosPessoaisCard } from "@/components/perfil/DadosPessoaisCard";
import { FormDadosPessoais } from "@/components/perfil/FormDadosPessoais";
import { PerfilHeader } from "@/components/perfil/PerfilHeader";
import { SegurancaCard } from "@/components/perfil/SegurancaCard";
import { SobreAppCard } from "@/components/perfil/SobreAppCard";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { TEMPO_DO_AVISO_MS, ToastSucesso } from "@/components/ui/ToastSucesso";
import { useSessao } from "@/context/SessaoContext";
import { useAtualizarUsuario, useUsuarioLogado } from "@/hooks/usePerfil";
import {
  CAMPOS_EDITAR_PERFIL,
  EditarPerfilSchema,
  type EditarPerfilInput,
} from "@/schemas/editar-perfil.schema";
import { autenticacaoService } from "@/services/autenticacao.service";
import { mascararTelefone } from "@/utils/mascaras";
import { versaoDoApp } from "@/utils/versao";

/**
 * T9 — Perfil: dados de quem está logado, editar nome e telefone (PUT
 * /api/usuarios/me), alterar a senha, "Sobre o App" e sair. Edita na própria
 * tela, como no Afetto.
 */
export default function TelaPerfil() {
  const { sair } = useSessao();
  const { data: usuario, isLoading, isError, error, refetch } = useUsuarioLogado();
  const { mutate: atualizar, isPending: salvando } = useAtualizarUsuario();

  const [editando, setEditando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditarPerfilInput>({
    resolver: zodResolver(EditarPerfilSchema),
    mode: "onTouched",
    defaultValues: { nome: "", telefone: "" },
  });

  // Fora da edição, o formulário acompanha o que está salvo. Durante a edição,
  // uma conferência com a API que chegue no meio não apaga o que foi digitado.
  // Ao cancelar ou salvar, volta para o que está salvo (já com a resposta do PUT).
  useEffect(() => {
    if (usuario && !editando) reset(autenticacaoService.paraFormulario(usuario));
  }, [usuario, editando, reset]);

  // O aviso some sozinho
  useEffect(() => {
    if (!salvo) return;
    const temporizador = setTimeout(() => setSalvo(false), TEMPO_DO_AVISO_MS);
    return () => clearTimeout(temporizador);
  }, [salvo]);

  function salvar(dados: EditarPerfilInput) {
    atualizar(dados, {
      onSuccess: () => {
        setEditando(false);
        setSalvo(true);
      },
      onError: (erro) => {
        const { porCampo, geral } = errosDaApiNoFormulario(erro, CAMPOS_EDITAR_PERFIL);
        porCampo.forEach(({ campo, mensagem }) => setError(campo, { message: mensagem }));
        if (geral) setError("root", { message: geral });
      },
    });
  }

  async function sairDaConta() {
    await sair();
    router.replace("/login");
  }

  return (
    <View className="flex-1 bg-fundo dark:bg-fundo-escuro">
      <PerfilHeader
        editando={editando}
        podeEditar={Boolean(usuario)}
        onEditar={() => setEditando(true)}
        onCancelar={() => setEditando(false)}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B6E4F" size="large" />
        </View>
      ) : isError || !usuario ? (
        <EstadoErro mensagem={mensagemDaApi(error)} onTentarNovamente={() => refetch()} />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* pb-32 na edição: o botão fixo do rodapé não cobre o fim da tela */}
          <ScrollView
            contentContainerClassName={`gap-6 p-5 ${editando ? "pb-32" : ""}`}
            keyboardShouldPersistTaps="handled"
          >
            {editando ? (
              <FormDadosPessoais control={control} email={usuario.email} />
            ) : (
              <DadosPessoaisCard
                nome={usuario.nome}
                email={usuario.email}
                telefone={usuario.telefone ? mascararTelefone(usuario.telefone) : ""}
              />
            )}

            {errors.root && (
              <Text
                accessibilityRole="alert"
                className="text-center font-inter text-base text-red-600"
              >
                {errors.root.message}
              </Text>
            )}

            <SegurancaCard onAlterarSenha={() => router.push("/alterar-senha")} />
            <SobreAppCard
              versao={versaoDoApp(Constants.expoConfig).versao}
              onAbrir={() => router.push("/sobre")}
            />
            <ContaCard onSair={sairDaConta} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {editando && (
        <BotaoEnviar
          enviando={salvando}
          onPress={handleSubmit(salvar)}
          texto="Salvar alterações"
          textoLoading="Salvando..."
        />
      )}

      {salvo && <ToastSucesso />}
    </View>
  );
}
