import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { useSessao } from "@/context/SessaoContext";

/** Só mostra o conteúdo com sessão; sem sessão, manda para o login. */
export function RotaProtegida({ children }: { children: ReactNode }) {
  const { sessao, carregando } = useSessao();

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-fundo dark:bg-fundo-escuro">
        <ActivityIndicator color="#0B6E4F" size="large" />
      </View>
    );
  }

  if (!sessao) return <Redirect href="/login" />;

  return <>{children}</>;
}
