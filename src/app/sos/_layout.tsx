import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

import { opcoesCabecalhoNativo } from "@/utils/cabecalho";

/**
 * SOS: PÚBLICO, funciona logado ou não (RN-G1). Fica fora dos grupos (auth) e
 * (tabs) e sem <RotaProtegida>; por isso a pasta aparece na URL (/sos/triagem).
 */
export default function LayoutSos() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack screenOptions={opcoesCabecalhoNativo(colorScheme === "dark")}>
      <Stack.Screen name="triagem" options={{ title: "" }} />
      <Stack.Screen name="resultado" options={{ title: "" }} />
    </Stack>
  );
}
