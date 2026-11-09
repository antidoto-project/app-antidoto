import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import type { Avistamento } from "@/types/avistamento.types";
import { formatarDataHora } from "@/utils/data";
import { ICONE_TIPO_ANIMAL, LABEL_LOCAL_AVISTAMENTO, LABEL_TIPO_ANIMAL } from "@/utils/rotulos";

type Props = {
  avistamento: Avistamento;
  /** Abre a edição (T11). */
  onPress: () => void;
  onExcluir: () => void;
  excluindo: boolean;
};

/** Um avistamento na lista (T7): animal, local, data e observação; tocar edita. */
export function CartaoAvistamento({ avistamento, onPress, onExcluir, excluindo }: Props) {
  const { tipoAnimal, local, dataHora, observacao } = avistamento;
  const animal = LABEL_TIPO_ANIMAL[tipoAnimal];
  const quando = formatarDataHora(dataHora);

  return (
    <View className="flex-row items-center gap-1 rounded-2xl bg-white dark:bg-gray-800">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Editar avistamento: ${animal}, ${quando}`}
        className="flex-1 flex-row items-start gap-3 p-4"
      >
        <Text className="text-3xl">{ICONE_TIPO_ANIMAL[tipoAnimal]}</Text>
        <View className="flex-1 gap-0.5">
          <Text className="font-inter-bold text-lg text-texto dark:text-texto-escuro">
            {animal}
          </Text>
          <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
            {LABEL_LOCAL_AVISTAMENTO[local]} · {quando}
          </Text>
          {observacao && (
            <Text
              numberOfLines={2}
              className="mt-1 font-inter text-base text-texto dark:text-texto-escuro"
            >
              {observacao}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onExcluir}
        disabled={excluindo}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Excluir avistamento: ${animal}, ${quando}`}
        accessibilityState={{ disabled: excluindo, busy: excluindo }}
        className={`h-12 w-12 items-center justify-center ${excluindo ? "opacity-40" : ""}`}
      >
        <Ionicons name="trash-outline" size={22} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}
