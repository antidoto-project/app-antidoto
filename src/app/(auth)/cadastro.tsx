import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { errosDaApiNoFormulario } from "@/api/erros";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { useSessao } from "@/context/SessaoContext";
import { useCadastrar } from "@/hooks/useAutenticacao";
import { CadastroSchema, CAMPOS_CADASTRO, type CadastroInput } from "@/schemas/cadastro.schema";
import { mascararTelefone } from "@/utils/mascaras";

/** T2 — Cadastro. A API já devolve o token: a conta é criada e a pessoa entra direto. */
export default function TelaCadastro() {
  const { entrar } = useSessao();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CadastroInput>({
    defaultValues: { nome: "", email: "", senha: "", telefone: "" },
    resolver: zodResolver(CadastroSchema),
    mode: "onTouched",
  });

  const { mutate: enviarCadastro, isPending: enviando } = useCadastrar();

  function fazerCadastro(dados: CadastroInput) {
    enviarCadastro(dados, {
      onSuccess: async (resposta) => {
        await entrar(resposta);
        router.replace("/(tabs)");
      },
      // 400: cada campo recusado mostra a mensagem da API; 409 (e-mail já
      // cadastrado), sem conexão etc.: a mensagem vai embaixo do formulário
      onError: (erro) => {
        const { porCampo, geral } = errosDaApiNoFormulario(erro, CAMPOS_CADASTRO);
        porCampo.forEach(({ campo, mensagem }) => setError(campo, { message: mensagem }));
        if (geral) setError("root", { message: geral });
      },
    });
  }

  return (
    <TelaFormulario
      titulo={"Crie sua\nconta"}
      subtitulo="O SOS funciona sem conta. A conta serve para registrar ocorrências e avistamentos."
      erro={errors.root?.message}
      rodape={
        <BotaoEnviar
          enviando={enviando}
          onPress={handleSubmit(fazerCadastro)}
          texto="Criar conta"
          textoLoading="Criando..."
        />
      }
    >
      <View className="gap-5">
        <CampoTexto
          name="nome"
          control={control}
          label="Nome"
          placeholder="Seu nome"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
        />

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
          name="telefone"
          control={control}
          label="Telefone (opcional)"
          placeholder="(11) 99999-0000"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          transformarTexto={mascararTelefone}
        />

        <CampoTexto
          name="senha"
          control={control}
          label="Senha"
          placeholder="8 ou mais, com letra e número"
          campoSenha
          autoComplete="password-new"
          textContentType="newPassword"
        />
      </View>
    </TelaFormulario>
  );
}
