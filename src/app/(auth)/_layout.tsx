import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

import { opcoesCabecalhoNativo } from "@/utils/cabecalho";

export default function LayoutAutenticacao() {
  // O cabeçalho nativo acompanha o tema do app
  const { colorScheme } = useColorScheme();

  return (
    <Stack screenOptions={opcoesCabecalhoNativo(colorScheme === "dark")}>
      {/* O login é a primeira tela de quem não tem sessão: sem seta de voltar */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: "" }} />
    </Stack>
  );
}
