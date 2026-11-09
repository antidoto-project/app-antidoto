import { Text, TouchableOpacity, View } from "react-native";

import { TIPOS_ANIMAL, type TipoAnimal } from "@/types/enums.types";
import { ICONE_TIPO_ANIMAL, LABEL_TIPO_ANIMAL } from "@/utils/rotulos";

type Props = {
  /** Título acima dos cartões (no avistamento); a triagem já tem o título da tela. */
  label?: string;
  value?: TipoAnimal;
  onChange: (value: TipoAnimal) => void;
  error?: string;
};

/**
 * Cartões grandes com a figura de cada animal, dois por linha (alvo de toque
 * grande, para quem está nervoso): passo 1 da triagem e formulário de
 * avistamento. Mesmo desenho do SeletorEspecie do Afetto.
 */
export function SeletorAnimal({ label, value, onChange, error }: Props) {
  return (
    <View className="gap-2">
      {label && (
        <Text className="font-inter-semibold text-base text-texto dark:text-texto-escuro">
          {label}
        </Text>
      )}
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap justify-between gap-y-3">
        {TIPOS_ANIMAL.map((animal) => {
          const selecionado = value === animal;
          return (
            <TouchableOpacity
              key={animal}
              onPress={() => onChange(animal)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: selecionado }}
              accessibilityLabel={LABEL_TIPO_ANIMAL[animal]}
              className={`min-h-[104px] w-[48%] items-center justify-center gap-1 rounded-2xl px-2 py-4 ${
                selecionado
                  ? "border-2 border-marca bg-marca/10 dark:border-marca-claro dark:bg-marca/30"
                  : "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <Text className="text-4xl">{ICONE_TIPO_ANIMAL[animal]}</Text>
              <Text className="text-center font-inter-semibold text-base text-texto dark:text-texto-escuro">
                {LABEL_TIPO_ANIMAL[animal]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text className="font-inter text-sm text-red-600">{error}</Text>}
    </View>
  );
}
