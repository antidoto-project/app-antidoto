import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { BotaoSos } from "@/components/sos/BotaoSos";
import { TelefonesUteis } from "@/components/sos/TelefonesUteis";
import { useSessao } from "@/context/SessaoContext";

/** T6 — Início: o botão SOS, o atalho para registrar um avistamento e os telefones úteis. */
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
        <View className="items-center gap-3 rounded-3xl bg-white px-5 py-6 dark:bg-gray-800">
          <BotaoSos />
          <Text className="text-center font-inter text-base text-texto dark:text-texto-escuro">
            Você ou alguém foi picado? Toque no SOS.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/avistamentos/novo")}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="min-h-[64px] flex-row items-center gap-3 rounded-2xl bg-white px-4 py-4 dark:bg-gray-800"
        >
          <Ionicons name="eye-outline" size={26} color="#0B6E4F" />
          <View className="flex-1">
            <Text className="font-inter-semibold text-base text-texto dark:text-texto-escuro">
              Registrar avistamento
            </Text>
            <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
              Viu um animal peçonhento perto de casa?
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TelefonesUteis />
      </View>
    </ScrollView>
  );
}
