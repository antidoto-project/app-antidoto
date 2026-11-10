import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

import type { StatusResumo } from "@/types/enums.types";

/** RN-G7: o texto que acompanha o resumo, quando a API não manda o `avisoResumo`. */
export const AVISO_RESUMO_IA = "Resumo gerado por IA. Não substitui avaliação profissional.";

type Props = {
  statusResumo: StatusResumo;
  resumo: string | null;
  avisoResumo: string | null;
};

/**
 * O resumo de pré-atendimento (T12, MVP-02 §3.2). PENDENTE: a IA ainda está
 * gerando (a tela consulta a cada 3 s). PRONTO ou MODELO_PADRAO (a IA falhou e o
 * Java montou por modelo, RN-G6): o cartão grande para mostrar na recepção.
 */
export function CartaoResumo({ statusResumo, resumo, avisoResumo }: Props) {
  if (statusResumo === "PENDENTE") {
    return (
      <View
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-3 rounded-2xl bg-white p-5 dark:bg-gray-800"
      >
        <ActivityIndicator color="#0B6E4F" />
        <Text className="flex-1 font-inter text-base text-texto dark:text-texto-escuro">
          Gerando resumo para a unidade…
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      className="gap-3 rounded-2xl border-2 border-marca bg-white p-5 dark:border-marca-claro dark:bg-gray-800"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name="clipboard-outline" size={22} color="#0B6E4F" />
        <Text className="flex-1 font-inter-bold text-lg text-texto dark:text-texto-escuro">
          Mostre este resumo na recepção
        </Text>
      </View>
      <Text className="font-inter text-lg leading-7 text-texto dark:text-texto-escuro">
        {resumo?.trim() || "O resumo não veio. Mostre as respostas abaixo na recepção."}
      </Text>
      {/* RN-G7 */}
      <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
        {avisoResumo?.trim() || AVISO_RESUMO_IA}
      </Text>
    </View>
  );
}
