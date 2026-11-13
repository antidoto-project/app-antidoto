import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

/** Quanto tempo o "Salvo com sucesso!" fica na tela (o mesmo do Afetto). */
export const TEMPO_DO_AVISO_MS = 2500;

/**
 * Aviso de "salvo" no topo da tela (o ToastSucesso do Afetto). A tela decide
 * quando mostrar e por quanto tempo. Fica fora da árvore quando escondido: com
 * a opacidade zerada, o leitor de tela ainda o leria. Grafite, e não verde,
 * para aparecer em cima do cabeçalho da marca.
 */
export function ToastSucesso() {
  return (
    <View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      className="absolute left-5 right-5 top-14 flex-row items-center gap-2 rounded-xl bg-texto px-4 py-3"
    >
      <Ionicons name="checkmark-circle" size={20} color="#2BB673" />
      <Text className="flex-1 font-inter-semibold text-base text-white">Salvo com sucesso!</Text>
    </View>
  );
}
