import { Ionicons } from "@expo/vector-icons";
import { Linking, Text, TouchableOpacity, View } from "react-native";

import { linkLigar } from "@/utils/links";
import { TELEFONES_UTEIS } from "@/utils/telefones";

/**
 * Telefones úteis (RN-G8): cada linha abre o discador. Fica no Início e nos
 * primeiros socorros (T5).
 */
export function TelefonesUteis() {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Telefones úteis
      </Text>

      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">
        {TELEFONES_UTEIS.map(({ nome, numero }, indice) => (
          <TouchableOpacity
            key={numero}
            onPress={() => Linking.openURL(linkLigar(numero))}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Ligar para ${nome}, ${numero}`}
            className={`min-h-[56px] flex-row items-center gap-3 py-3 ${
              indice > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""
            }`}
          >
            <Ionicons name="call-outline" size={22} color="#0B6E4F" />
            <Text className="flex-1 font-inter text-base text-texto dark:text-texto-escuro">
              {nome}
            </Text>
            <Text className="font-inter-bold text-base text-marca dark:text-marca-claro">
              {numero}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
