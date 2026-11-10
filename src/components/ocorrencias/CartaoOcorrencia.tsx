import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { SeloUrgencia } from "@/components/sos/SeloUrgencia";
import type { Ocorrencia } from "@/types/ocorrencia.types";
import { formatarDataHora } from "@/utils/data";
import { ICONE_TIPO_ANIMAL, LABEL_TIPO_ANIMAL } from "@/utils/rotulos";

type Props = {
  ocorrencia: Ocorrencia;
  onPress: () => void;
};

/** Uma ocorrência no histórico (T8): animal, urgência, quando, unidade e o resumo. */
export function CartaoOcorrencia({ ocorrencia, onPress }: Props) {
  const { tipoAnimal, urgencia, criadoEm, unidadeNome, statusResumo } = ocorrencia;
  const animal = LABEL_TIPO_ANIMAL[tipoAnimal];
  const quando = formatarDataHora(criadoEm);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Ocorrência: ${animal}, ${quando}`}
      className="flex-row items-center gap-3 rounded-2xl bg-white p-4 dark:bg-gray-800"
    >
      <Text className="text-3xl">{ICONE_TIPO_ANIMAL[tipoAnimal]}</Text>
      <View className="flex-1 gap-1">
        <Text className="font-inter-bold text-lg text-texto dark:text-texto-escuro">{animal}</Text>
        <SeloUrgencia urgencia={urgencia} compacto />
        <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
          {quando}
          {unidadeNome ? ` · ${unidadeNome}` : ""}
        </Text>
        <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
          {statusResumo === "PENDENTE" ? "Gerando resumo…" : "Resumo pronto"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );
}
