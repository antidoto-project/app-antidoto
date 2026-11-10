import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

import { RotaProtegida } from "@/components/RotaProtegida";
import { opcoesCabecalhoNativo } from "@/utils/cabecalho";

/** Telas de quem está logado fora das abas, em Stack (como o (app) do Afetto). */
export default function LayoutApp() {
  // O cabeçalho nativo acompanha o tema do app
  const { colorScheme } = useColorScheme();

  return (
    <RotaProtegida>
      <Stack screenOptions={opcoesCabecalhoNativo(colorScheme === "dark")}>
        <Stack.Screen name="avistamentos/novo" options={{ title: "" }} />
        <Stack.Screen name="avistamentos/[id]" options={{ title: "" }} />
        <Stack.Screen name="ocorrencias/[id]" options={{ title: "" }} />
        <Stack.Screen name="sobre" options={{ title: "" }} />
      </Stack>
    </RotaProtegida>
  );
}
