import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useSessao } from "@/context/SessaoContext";

/**
 * Porta de entrada do app: com sessão salva vai para o Início; sem sessão, para
 * o login (onde também fica o SOS, a partir do Passo 3). A leitura é só do
 * aparelho, sem esperar a rede.
 */
export default function TelaEntrada() {
  const { sessao, carregando } = useSessao();

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-fundo dark:bg-fundo-escuro">
        <ActivityIndicator color="#0B6E4F" size="large" />
      </View>
    );
  }

  return <Redirect href={sessao ? "/(tabs)" : "/login"} />;
}
