import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  titulo: string;
  subtitulo?: string;
};

/** Estado vazio padrão para listas sem itens (mesmo componente do Afetto). */
export function EstadoVazio({ icone, titulo, subtitulo }: Props) {
  return (
    <View className="items-center justify-center gap-2 px-8 py-4">
      <Ionicons name={icone} size={48} color="#6B7280" />
      <Text className="text-center font-inter-semibold text-base text-texto dark:text-texto-escuro">
        {titulo}
      </Text>
      {subtitulo && (
        <Text className="text-center font-inter text-base text-gray-600 dark:text-gray-300">
          {subtitulo}
        </Text>
      )}
    </View>
  );
}
