import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  versao: string;
  onAbrir: () => void;
};

/** Entrada para a tela "Sobre o App" (versão e hash do commit), como no Afetto. */
export function SobreAppCard({ versao, onAbrir }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Aplicativo
      </Text>

      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">
        <TouchableOpacity
          onPress={onAbrir}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="min-h-[52px] flex-row items-center gap-3 py-3.5"
        >
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text className="flex-1 font-inter text-base text-texto dark:text-texto-escuro">
            Sobre o App
          </Text>
          <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">v{versao}</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
