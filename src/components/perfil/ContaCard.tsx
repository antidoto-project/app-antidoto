import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  onSair: () => void;
};

// O vermelho fica só para o SOS, a EMERGENCIA e o 192 (MVP-02 §7): sair usa a cor da marca
export function ContaCard({ onSair }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Conta
      </Text>

      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">
        <TouchableOpacity
          onPress={onSair}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="min-h-[52px] flex-row items-center justify-center gap-2 py-3.5"
        >
          <Ionicons name="log-out-outline" size={20} color="#0B6E4F" />
          <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
            Sair da conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
