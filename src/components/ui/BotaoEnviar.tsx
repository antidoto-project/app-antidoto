import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  /** O `isPending` do useMutation. */
  enviando: boolean;
  onPress: () => void;
  texto?: string;
  textoLoading?: string;
};

/** Botão de envio fixo no rodapé dos formulários (mesmo componente do Afetto). */
export function BotaoEnviar({
  enviando,
  onPress,
  texto = "Entrar",
  textoLoading = "Enviando...",
}: Props) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-fundo/95 px-5 pb-[34px] pt-3 dark:bg-fundo-escuro/95">
      <TouchableOpacity
        onPress={onPress}
        disabled={enviando}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: enviando, busy: enviando }}
        className={`min-h-[52px] items-center justify-center rounded-2xl py-4 ${
          enviando ? "bg-marca/70" : "bg-marca"
        }`}
      >
        {enviando ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text className="font-inter-semibold text-base text-white">{textoLoading}</Text>
          </View>
        ) : (
          <Text className="font-inter-semibold text-base text-white">{texto}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
