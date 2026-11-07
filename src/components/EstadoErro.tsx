import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  mensagem: string;
  onTentarNovamente: () => void;
};

/** Estado de erro padrão para telas com dados remotos (mesmo componente do Afetto). */
export function EstadoErro({ mensagem, onTentarNovamente }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-fundo px-8 dark:bg-fundo-escuro">
      <Ionicons name="cloud-offline-outline" size={48} color="#6B7280" />
      <Text className="text-center font-inter text-base text-texto dark:text-texto-escuro">
        {mensagem}
      </Text>
      <TouchableOpacity
        onPress={onTentarNovamente}
        activeOpacity={0.85}
        accessibilityRole="button"
        className="mt-1 min-h-[48px] flex-row items-center gap-2 rounded-2xl border border-marca px-6 py-3 dark:border-marca-claro"
      >
        <Ionicons name="refresh" size={18} color="#0B6E4F" />
        <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
          Tentar novamente
        </Text>
      </TouchableOpacity>
    </View>
  );
}
