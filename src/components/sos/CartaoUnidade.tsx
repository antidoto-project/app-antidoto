import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from "react-native";

import type { UnidadeProxima } from "@/types/unidade.types";
import { linkLigar, linkRota } from "@/utils/links";
import { mascararTelefone } from "@/utils/mascaras";
import { LABEL_SORO, LABEL_TIPO_UNIDADE } from "@/utils/rotulos";
import { formatarDistancia } from "@/utils/unidade";

type Props = {
  unidade: UnidadeProxima;
  /** Abelha: não existe soro; vale qualquer hospital ou UPA (MVP-00 §4.4). */
  semSoro: boolean;
  /** Logado: "Vou para esta unidade" registra a ocorrência com ela (MVP-02 §3.2). */
  onEscolher?: () => void;
  escolhendo?: boolean;
  bloqueado?: boolean;
};

/**
 * Uma unidade próxima no resultado (T4): distância, soros compatíveis, Ligar e
 * Rota. Se o aparelho não abrir o discador ou o mapa, o aviso mostra o telefone
 * ou o endereço.
 */
export function CartaoUnidade({
  unidade,
  semSoro,
  onEscolher,
  escolhendo = false,
  bloqueado = false,
}: Props) {
  const { nome, tipo, atende24h, distanciaKm, endereco, telefone, sorosCompativeis } = unidade;

  return (
    <View className="gap-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-0.5">
          <Text className="font-inter-bold text-lg text-texto dark:text-texto-escuro">{nome}</Text>
          <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
            {LABEL_TIPO_UNIDADE[tipo]}
            {atende24h ? " · 24 horas" : ""}
          </Text>
        </View>
        <Text className="font-inter-bold text-base text-marca dark:text-marca-claro">
          {formatarDistancia(distanciaKm)}
        </Text>
      </View>

      <Text className="font-inter text-base text-texto dark:text-texto-escuro">{endereco}</Text>

      {semSoro ? (
        <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
          Atendimento de urgência
        </Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {sorosCompativeis.map((soro) => (
            <View key={soro} className="rounded-full bg-marca/10 px-3 py-1 dark:bg-marca/30">
              <Text className="font-inter-semibold text-sm text-marca dark:text-marca-claro">
                Soro {LABEL_SORO[soro].toLowerCase()}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row gap-3">
        {Boolean(telefone) && (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(linkLigar(telefone)).catch(() =>
                Alert.alert(
                  "Não deu para abrir o telefone",
                  `Ligue ${mascararTelefone(telefone)} pelo discador do aparelho.`
                )
              )
            }
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Ligar para ${nome}`}
            className="min-h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-marca dark:border-marca-claro"
          >
            <Ionicons name="call-outline" size={20} color="#0B6E4F" />
            <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
              Ligar
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(linkRota(unidade.latitude, unidade.longitude)).catch(() =>
              Alert.alert("Não deu para abrir o mapa", `Endereço: ${endereco}`)
            )
          }
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Rota até ${nome}`}
          className="min-h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-marca"
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text className="font-inter-semibold text-base text-white">Rota</Text>
        </TouchableOpacity>
      </View>

      {onEscolher && (
        <TouchableOpacity
          onPress={onEscolher}
          disabled={bloqueado}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Vou para ${nome}`}
          accessibilityHint="Registra a ocorrência com esta unidade"
          accessibilityState={{ disabled: bloqueado, busy: escolhendo }}
          className={`min-h-[48px] flex-row items-center justify-center gap-2 rounded-2xl border border-marca dark:border-marca-claro ${
            bloqueado && !escolhendo ? "opacity-50" : ""
          }`}
        >
          {escolhendo ? (
            <ActivityIndicator color="#0B6E4F" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={20} color="#0B6E4F" />
          )}
          <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
            {escolhendo ? "Registrando..." : "Vou para esta unidade"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
