import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

/**
 * RN-G2: o texto fixo de toda tela de resultado (T4; no Passo 4 também os
 * primeiros socorros, T5; no Passo 6 a ocorrência, T12). Não mude o texto.
 */
export function AvisoAtendimento() {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border-2 border-marca bg-white px-4 py-4 dark:border-marca-claro dark:bg-gray-800">
      <Ionicons name="medkit" size={26} color="#0B6E4F" />
      <Text className="flex-1 font-inter-bold text-lg text-texto dark:text-texto-escuro">
        Procure atendimento médico imediatamente.
      </Text>
    </View>
  );
}
