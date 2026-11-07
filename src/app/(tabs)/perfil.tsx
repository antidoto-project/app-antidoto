import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { mensagemDaApi } from "@/api/erros";
import { EstadoErro } from "@/components/EstadoErro";
import { ContaCard } from "@/components/perfil/ContaCard";
import { DadosPessoaisCard } from "@/components/perfil/DadosPessoaisCard";
import { useSessao } from "@/context/SessaoContext";
import { useUsuarioLogado } from "@/hooks/usePerfil";
import { mascararTelefone } from "@/utils/mascaras";

/** T9 — Perfil: dados e sair. Editar nome e telefone e o "Sobre o App" entram no Passo 7. */
export default function TelaPerfil() {
  const { sair } = useSessao();
  const { data: usuario, isLoading, isError, error, refetch } = useUsuarioLogado();

  async function sairDaConta() {
    await sair();
    router.replace("/login");
  }

  return (
    <View className="flex-1 bg-fundo dark:bg-fundo-escuro">
      <View className="bg-marca px-6 pb-6 pt-14">
        <Text accessibilityRole="header" className="font-inter-bold text-2xl text-white">
          Perfil
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B6E4F" size="large" />
        </View>
      ) : isError || !usuario ? (
        <EstadoErro mensagem={mensagemDaApi(error)} onTentarNovamente={() => refetch()} />
      ) : (
        <ScrollView contentContainerClassName="gap-6 p-5">
          <DadosPessoaisCard
            nome={usuario.nome}
            email={usuario.email}
            telefone={usuario.telefone ? mascararTelefone(usuario.telefone) : ""}
          />
          <ContaCard onSair={sairDaConta} />
        </ScrollView>
      )}
    </View>
  );
}
