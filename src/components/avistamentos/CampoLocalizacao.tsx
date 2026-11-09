import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from "react-native";

import { useLocalizacao } from "@/hooks/useLocalizacao";
import type { Coordenadas } from "@/types/unidade.types";

type Props = {
  value?: Coordenadas;
  onChange: (coordenadas: Coordenadas) => void;
  error?: string;
};

const MENSAGEM_DO_ESTADO = {
  negada: "Ative a localização para registrar onde você viu o animal.",
  indisponivel: "Não deu para achar a sua localização. Confira se o GPS está ligado.",
} as const;

/**
 * "Usar minha localização" (MVP-02 §3.3, obrigatório): o GPS só é usado quando
 * a pessoa toca no botão. Na edição, já vem com o lugar salvo e pode atualizar.
 */
export function CampoLocalizacao({ value, onChange, error }: Props) {
  const { estado, coordenadas, podePedirDeNovo, buscar } = useLocalizacao({ automatica: false });

  // Coordenadas novas do GPS vão para o formulário
  useEffect(() => {
    if (coordenadas) onChange(coordenadas);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só quando chega uma posição nova
  }, [coordenadas]);

  const buscando = estado === "buscando";
  const mensagem =
    estado === "negada" || estado === "indisponivel" ? MENSAGEM_DO_ESTADO[estado] : null;

  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Onde foi
      </Text>

      {value && (
        <View className="flex-row items-center gap-2">
          <Ionicons name="location" size={20} color="#0B6E4F" />
          <Text className="flex-1 font-inter text-base text-texto dark:text-texto-escuro">
            Localização registrada ({value.latitude.toFixed(4)}, {value.longitude.toFixed(4)})
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={buscar}
        disabled={buscando}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: buscando, busy: buscando }}
        className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl border border-marca px-4 dark:border-marca-claro"
      >
        {buscando ? (
          <ActivityIndicator color="#0B6E4F" />
        ) : (
          <Ionicons name="locate" size={20} color="#0B6E4F" />
        )}
        <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
          {buscando
            ? "Pegando a sua localização…"
            : value
              ? "Atualizar com a minha localização"
              : "Usar minha localização"}
        </Text>
      </TouchableOpacity>

      {mensagem && <Text className="font-inter text-sm text-red-600">{mensagem}</Text>}
      {estado === "negada" && !podePedirDeNovo && (
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="min-h-[48px] justify-center self-start"
        >
          <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
            Abrir as configurações
          </Text>
        </TouchableOpacity>
      )}
      {!mensagem && error && <Text className="font-inter text-sm text-red-600">{error}</Text>}
    </View>
  );
}
