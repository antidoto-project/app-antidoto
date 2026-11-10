import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { Urgencia } from "@/types/enums.types";
import { LABEL_URGENCIA } from "@/utils/rotulos";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

/*
 * A urgência sempre com texto + ícone, nunca só a cor (MVP-02 §5.2). Texto
 * branco só no vermelho: no laranja e no amarelo, o branco fica sem contraste,
 * então vai o grafite (`text-texto`). As cores dos ícones são os mesmos tokens.
 */
const ESTILO: Record<Urgencia, { fundo: string; texto: string; icone: NomeIcone; cor: string }> = {
  EMERGENCIA: {
    fundo: "bg-emergencia",
    texto: "text-white",
    icone: "alert-circle",
    cor: "#FFFFFF",
  },
  ALTA: { fundo: "bg-alta", texto: "text-texto", icone: "warning", cor: "#1E2A2F" },
  MODERADA: {
    fundo: "bg-moderada",
    texto: "text-texto",
    icone: "information-circle",
    cor: "#1E2A2F",
  },
};

type Props = {
  urgencia: Urgencia;
  /** Versão pequena, para listas (histórico de ocorrências). */
  compacto?: boolean;
};

export function SeloUrgencia({ urgencia, compacto = false }: Props) {
  const { fundo, texto, icone, cor } = ESTILO[urgencia];

  if (compacto) {
    return (
      <View
        accessible
        accessibilityLabel={`Urgência ${LABEL_URGENCIA[urgencia]}`}
        className={`flex-row items-center gap-1 self-start rounded-full px-3 py-1 ${fundo}`}
      >
        <Ionicons name={icone} size={16} color={cor} />
        <Text className={`font-inter-semibold text-sm ${texto}`}>{LABEL_URGENCIA[urgencia]}</Text>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`Urgência ${LABEL_URGENCIA[urgencia]}`}
      className={`flex-row items-center gap-4 rounded-2xl px-5 py-5 ${fundo}`}
    >
      <Ionicons name={icone} size={44} color={cor} />
      <View className="flex-1">
        <Text className={`font-inter-semibold text-base ${texto}`}>Urgência</Text>
        <Text className={`font-inter-bold text-3xl ${texto}`}>{LABEL_URGENCIA[urgencia]}</Text>
      </View>
    </View>
  );
}
