import { ScrollView, Text, View } from "react-native";

import { TelefonesUteis } from "@/components/sos/TelefonesUteis";
import { useSessao } from "@/context/SessaoContext";

/** T6 — Início. O botão SOS e os atalhos entram nos próximos passos. */
export default function TelaInicio() {
  const { sessao } = useSessao();
  const primeiroNome = sessao?.usuario.nome.trim().split(/\s+/)[0] ?? "";

  return (
    <ScrollView
      className="flex-1 bg-fundo dark:bg-fundo-escuro"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="gap-1 bg-marca px-6 pb-6 pt-14">
        <Text accessibilityRole="header" className="font-inter-bold text-2xl text-white">
          Olá{primeiroNome ? `, ${primeiroNome}` : ""}!
        </Text>
        <Text className="font-inter text-base text-white/90">
          Em caso de picada, ligue 192 e procure atendimento.
        </Text>
      </View>

      <View className="gap-6 px-5 py-6">
        <TelefonesUteis />
      </View>
    </ScrollView>
  );
}
