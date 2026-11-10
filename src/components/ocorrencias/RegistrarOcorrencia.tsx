import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  logado: boolean;
  /** O contrato exige latitude e longitude: sem o GPS, não dá para registrar. */
  temLocalizacao: boolean;
  registrando: boolean;
  erro: string | null;
  onRegistrar: () => void;
  /** Deslogado: login, levando as respostas para voltar ao resultado depois. */
  onEntrar: () => void;
};

/**
 * "Registrar ocorrência" no resultado (T4, MVP-02 §3.1). Logado, registra sem
 * unidade (com unidade, é o "Vou para esta unidade" dos cartões). Deslogado,
 * "Entre para salvar a ocorrência" leva ao login e volta para cá.
 */
export function RegistrarOcorrencia({
  logado,
  temLocalizacao,
  registrando,
  erro,
  onRegistrar,
  onEntrar,
}: Props) {
  if (!logado) {
    return (
      <View className="gap-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
        <Text className="font-inter text-base text-texto dark:text-texto-escuro">
          Com uma conta, você salva a ocorrência e recebe um resumo para mostrar na recepção.
        </Text>
        <TouchableOpacity
          onPress={onEntrar}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl border border-marca dark:border-marca-claro"
        >
          <Ionicons name="log-in-outline" size={20} color="#0B6E4F" />
          <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
            Entre para salvar a ocorrência
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const desabilitado = registrando || !temLocalizacao;

  return (
    <View className="gap-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
      <Text className="font-inter text-base text-texto dark:text-texto-escuro">
        Registre a ocorrência para receber um resumo de pré-atendimento e mostrar na recepção.
      </Text>
      <TouchableOpacity
        onPress={onRegistrar}
        disabled={desabilitado}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: desabilitado, busy: registrando }}
        className={`min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl ${
          desabilitado ? "bg-marca/50" : "bg-marca"
        }`}
      >
        {registrando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
        )}
        <Text className="font-inter-semibold text-base text-white">
          {registrando ? "Registrando..." : "Registrar ocorrência"}
        </Text>
      </TouchableOpacity>
      {!temLocalizacao && (
        <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
          Para registrar, o app precisa da sua localização (veja as unidades acima).
        </Text>
      )}
      {erro && (
        <Text accessibilityRole="alert" className="font-inter text-base text-red-600">
          {erro}
        </Text>
      )}
    </View>
  );
}
