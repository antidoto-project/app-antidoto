import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

/**
 * "SOS — Fui picado" (MVP-02 §3.1): redondo, com mais de 120 dp, no vermelho
 * `emergencia`. Abre a triagem, que funciona sem login (RN-G1). Fica no login
 * (T1) e no Início (T6).
 */
export function BotaoSos() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/sos/triagem")}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="SOS, fui picado"
      accessibilityHint="Abre a triagem, que funciona sem login"
      className="h-36 w-36 items-center justify-center self-center rounded-full bg-emergencia shadow-lg"
    >
      <Ionicons name="alert-circle" size={40} color="#FFFFFF" />
      <Text className="font-inter-bold text-3xl text-white">SOS</Text>
      <Text className="font-inter-semibold text-base text-white">Fui picado</Text>
    </TouchableOpacity>
  );
}
