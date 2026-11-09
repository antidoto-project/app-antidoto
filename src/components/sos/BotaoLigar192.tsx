import { Ionicons } from "@expo/vector-icons";
import { Linking, Text, TouchableOpacity } from "react-native";

import { linkLigar } from "@/utils/links";

/**
 * "Ligar 192 (SAMU)" — abre o discador. RN-G3: em EMERGENCIA fica no topo do
 * resultado, antes de tudo; nos outros níveis, no fim da tela.
 */
export function BotaoLigar192() {
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(linkLigar("192"))}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Ligar 192, SAMU"
      className="min-h-[56px] flex-row items-center justify-center gap-3 rounded-2xl bg-emergencia px-5 py-4"
    >
      <Ionicons name="call" size={24} color="#FFFFFF" />
      <Text className="font-inter-bold text-lg text-white">Ligar 192 (SAMU)</Text>
    </TouchableOpacity>
  );
}
