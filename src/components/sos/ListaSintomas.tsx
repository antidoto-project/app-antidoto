import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { SINTOMAS, type Sintoma } from "@/types/enums.types";
import { ehSintomaDeAlerta, LABEL_SINTOMA } from "@/utils/rotulos";

type Props = {
  marcados: Sintoma[];
  onAlternar: (sintoma: Sintoma) => void;
};

/** Ícone dos sinais de alerta: a cor do token `alta` (o vermelho é só do SOS e do 192). */
const COR_ALERTA = "#EF6C00";
/** Caixa marcada na cor do token `marca`; desmarcada em cinza. */
const COR_MARCADO = "#0B6E4F";
const COR_DESMARCADO = "#6B7280";

/**
 * Passo 3 da triagem: os 12 sintomas do MVP-00 §4.2. Os sinais de alerta levam
 * o ícone de aviso (com texto para o leitor de tela). Pode não marcar nenhum.
 */
export function ListaSintomas({ marcados, onAlternar }: Props) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2 px-1">
        <Ionicons name="warning" size={18} color={COR_ALERTA} />
        <Text className="font-inter text-base text-gray-600 dark:text-gray-300">
          Sinal de alerta
        </Text>
      </View>

      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">
        {SINTOMAS.map((sintoma, indice) => {
          const marcado = marcados.includes(sintoma);
          const alerta = ehSintomaDeAlerta(sintoma);
          return (
            <TouchableOpacity
              key={sintoma}
              onPress={() => onAlternar(sintoma)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: marcado }}
              accessibilityLabel={`${LABEL_SINTOMA[sintoma]}${alerta ? ", sinal de alerta" : ""}`}
              className={`min-h-[56px] flex-row items-center gap-3 py-3 ${
                indice > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""
              }`}
            >
              <Ionicons
                name={marcado ? "checkbox" : "square-outline"}
                size={26}
                color={marcado ? COR_MARCADO : COR_DESMARCADO}
              />
              <Text className="flex-1 font-inter text-base text-texto dark:text-texto-escuro">
                {LABEL_SINTOMA[sintoma]}
              </Text>
              {alerta && <Ionicons name="warning" size={20} color={COR_ALERTA} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
