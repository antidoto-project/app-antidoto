import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

import { classificarErro, errosDaApiNoFormulario } from "@/api/erros";
import { LogoAntidoto } from "@/components/LogoAntidoto";
import { BotaoSos } from "@/components/sos/BotaoSos";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { useSessao } from "@/context/SessaoContext";
import { useEntrar } from "@/hooks/useAutenticacao";
import { CAMPOS_LOGIN, LoginSchema, type LoginInput } from "@/schemas/login.schema";
import { RetornoAoResultadoSchema } from "@/schemas/triagem.schema";

/**
 * T1 — Login, com o botão "SOS — Fui picado" no topo: a triagem não precisa de
 * conta (RN-G1). Quem chega pelo "Entre para salvar a ocorrência" traz as
 * respostas da triagem e, depois de entrar, volta para o resultado.
 */
export default function TelaLogin() {
  const { entrar } = useSessao();
  const leituraRetorno = RetornoAoResultadoSchema.safeParse(useLocalSearchParams());
  const retorno = leituraRetorno.success ? leituraRetorno.data : null;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    defaultValues: { email: "", senha: "" },
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  const { mutate: enviarLogin, isPending: enviando } = useEntrar();

  function fazerLogin(dados: LoginInput) {
    enviarLogin(dados, {
      onSuccess: async (resposta) => {
        await entrar(resposta);
        // Volta ao resultado que já estava aberto (sem empilhar outro igual)
        if (retorno) router.dismissTo({ pathname: "/sos/resultado", params: retorno });
        else router.replace("/(tabs)");
      },
      onError: (erro) => {
        // MVP-02 §3.4: no login, o 401 é só a mensagem de credenciais
        if (classificarErro(erro) === "nao_autenticado") {
          setError("root", { message: "E-mail ou senha incorretos" });
          return;
        }
        const { porCampo, geral } = errosDaApiNoFormulario(erro, CAMPOS_LOGIN);
        porCampo.forEach(({ campo, mensagem }) => setError(campo, { message: mensagem }));
        if (geral) setError("root", { message: geral });
      },
    });
  }

  return (
    <TelaFormulario
      topo={
        <View className="gap-6">
          <LogoAntidoto />
          {/* Quem veio do resultado já está no SOS: o botão só confundiria */}
          {!retorno && (
            <View className="items-center gap-3 rounded-3xl bg-white px-5 py-6 dark:bg-gray-800">
              <BotaoSos />
              <Text className="text-center font-inter text-base text-texto dark:text-texto-escuro">
                Foi picado agora? Toque no SOS.{"\n"}Não precisa de conta.
              </Text>
            </View>
          )}
        </View>
      }
      titulo={"Entre na sua\nconta"}
      subtitulo={
        retorno
          ? "Depois de entrar, você volta para o resultado e salva a ocorrência."
          : "Para registrar ocorrências e avistamentos."
      }
      erro={errors.root?.message}
      rodape={
        <BotaoEnviar
          enviando={enviando}
          onPress={handleSubmit(fazerLogin)}
          texto="Entrar"
          textoLoading="Entrando..."
        />
      }
    >
      <View className="gap-5">
        <CampoTexto
          name="email"
          control={control}
          label="E-mail"
          placeholder="exemplo@email.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <CampoTexto
          name="senha"
          control={control}
          label="Senha"
          placeholder="Sua senha"
          campoSenha
          autoComplete="password"
          textContentType="password"
        />
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push(retorno ? { pathname: "/cadastro", params: retorno } : "/cadastro")
        }
        activeOpacity={0.7}
        accessibilityRole="link"
        className="min-h-[48px] justify-center self-center"
      >
        <Text className="font-inter text-base text-texto dark:text-texto-escuro">
          Ainda não tem conta?{" "}
          <Text className="font-inter-bold text-marca dark:text-marca-claro">Criar conta</Text>
        </Text>
      </TouchableOpacity>
    </TelaFormulario>
  );
}
