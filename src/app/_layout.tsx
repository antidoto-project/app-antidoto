import Ionicons from "@expo/vector-icons/Ionicons";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { AppState } from "react-native";
import "react-native-reanimated";
import "../global.css";

import { queryClient } from "@/api/queryClient";
import { SessaoProvider } from "@/context/SessaoContext";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

/*
 * Fontes do app, carregadas antes da primeira tela: os ícones (Ionicons) e a
 * Inter, a fonte da identidade visual. Os nomes são os do tailwind.config.js
 * (font-inter, font-inter-semibold, font-inter-bold).
 */
const FONTES = {
  ...Ionicons.font,
  Inter_400Regular: require("../../assets/fonts/Inter_400Regular.ttf"),
  Inter_600SemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  Inter_700Bold: require("../../assets/fonts/Inter_700Bold.ttf"),
};

SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [fontesCarregadas, erroFontes] = useFonts(FONTES);

  // AppState — refetch quando o app volta ao foco
  useEffect(() => {
    const inscricao = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => inscricao.remove();
  }, []);

  useEffect(() => {
    if (erroFontes) throw erroFontes;
  }, [erroFontes]);

  useEffect(() => {
    if (fontesCarregadas) SplashScreen.hideAsync();
  }, [fontesCarregadas]);

  if (!fontesCarregadas) return null;

  return <LayoutRaizNav />;
}

function LayoutRaizNav() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SessaoProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        {/* sos/ é pública (RN-G1); o grupo (app) entra no Passo 5 */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sos" />
        </Stack>
      </SessaoProvider>
    </QueryClientProvider>
  );
}
