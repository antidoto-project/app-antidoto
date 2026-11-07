import Constants from "expo-constants";
import { Text, View } from "react-native";

import { versaoDoApp } from "@/utils/versao";

/*
 * Tela de entrada provisória do Passo 1: confirma no celular que a base está
 * de pé — a fonte Inter, as cores da marca e o hash do commit lido pelo
 * app.config.ts. No Passo 2 ela vira a porta de entrada do app: com sessão
 * vai para o Início; sem sessão, para o login.
 */
export default function TelaEntrada() {
  const nome = Constants.expoConfig?.name ?? "Antídoto";
  const { versao, commitCurto, comAlteracoes } = versaoDoApp(Constants.expoConfig);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-fundo px-8 dark:bg-fundo-escuro">
      <Text className="font-inter-bold text-3xl text-marca dark:text-marca-claro">{nome}</Text>
      <Text className="text-center font-inter text-base text-texto dark:text-texto-escuro">
        Base do app pronta. As telas chegam a partir do Passo 2.
      </Text>
      <Text className="text-center font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Versão {versao} · commit {commitCurto ?? "não informado"}
        {comAlteracoes ? " (com alterações fora do commit)" : ""}
      </Text>
    </View>
  );
}
