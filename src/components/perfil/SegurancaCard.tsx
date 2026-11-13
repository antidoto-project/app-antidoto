import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  onAlterarSenha: () => void;
};

/** Entrada para "Alterar senha" (o SegurancaCard do Afetto). */
export function SegurancaCard({ onAlterarSenha }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Segurança
      </Text>

      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">
        <TouchableOpacity
          onPress={onAlterarSenha}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="min-h-[52px] flex-row items-center gap-3 py-3.5"
        >
          <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
          <Text className="flex-1 font-inter text-base text-texto dark:text-texto-escuro">
            Alterar senha
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
