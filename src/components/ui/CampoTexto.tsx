import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View, type TextInputProps } from "react-native";

type CampoTextoProps<T extends FieldValues> = TextInputProps & {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  campoSenha?: boolean;
  iconeDireita?: ReactNode;
  /** Máscara de utils/mascaras.ts, aplicada enquanto a pessoa digita. */
  transformarTexto?: (valor: string) => string;
};

/** Campo de texto padrão, ligado ao react-hook-form (mesmo componente do Afetto). */
export default function CampoTexto<T extends FieldValues>({
  name,
  control,
  label,
  campoSenha = false,
  iconeDireita,
  transformarTexto,
  onFocus,
  onBlur: aoSairDoCampo,
  ...rest
}: CampoTextoProps<T>) {
  const [oculto, setOculto] = useState(campoSenha);
  // Borda da marca no campo em uso; o erro continua vencendo
  const [focado, setFocado] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="gap-1">
          {label && (
            <Text className="font-inter-semibold text-base text-texto dark:text-texto-escuro">
              {label}
            </Text>
          )}

          <View
            className={`flex-row items-center rounded-xl border bg-white px-4 dark:bg-gray-800 ${
              error
                ? "border-red-500"
                : focado
                  ? "border-marca dark:border-marca-claro"
                  : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <TextInput
              className="flex-1 py-3.5 font-inter text-base text-texto dark:text-texto-escuro"
              onFocus={(evento) => {
                setFocado(true);
                onFocus?.(evento);
              }}
              onBlur={(evento) => {
                setFocado(false);
                onBlur();
                aoSairDoCampo?.(evento);
              }}
              onChangeText={(texto) => onChange(transformarTexto ? transformarTexto(texto) : texto)}
              value={value}
              secureTextEntry={oculto}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#6B7280"
              underlineColorAndroid="transparent"
              accessibilityLabel={label}
              {...rest}
            />

            {campoSenha && (
              <TouchableOpacity
                onPress={() => setOculto((anterior) => !anterior)}
                hitSlop={12}
                accessibilityLabel={oculto ? "Mostrar senha" : "Ocultar senha"}
              >
                <Ionicons
                  name={oculto ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            )}

            {!campoSenha && iconeDireita}
          </View>

          {error && <Text className="font-inter text-sm text-red-600">{error.message}</Text>}
        </View>
      )}
    />
  );
}
