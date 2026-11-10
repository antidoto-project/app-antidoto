import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  editando: boolean;
  /** Sem os dados carregados não há o que editar: o lápis não aparece. */
  podeEditar: boolean;
  onEditar: () => void;
  onCancelar: () => void;
};

/** Cabeçalho do Perfil (como o PerfilHeader do Afetto): título, lápis para editar e "Cancelar". */
export function PerfilHeader({ editando, podeEditar, onEditar, onCancelar }: Props) {
  return (
    <View className="flex-row items-center justify-between bg-marca px-6 pb-6 pt-14">
      <Text accessibilityRole="header" className="font-inter-bold text-2xl text-white">
        {editando ? "Editar perfil" : "Perfil"}
      </Text>

      {editando ? (
        <TouchableOpacity
          onPress={onCancelar}
          activeOpacity={0.7}
          hitSlop={8}
          accessibilityRole="button"
          className="h-10 justify-center"
        >
          <Text className="font-inter-semibold text-base text-white">Cancelar</Text>
        </TouchableOpacity>
      ) : (
        podeEditar && (
          <TouchableOpacity
            onPress={onEditar}
            activeOpacity={0.7}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Editar nome e telefone"
            className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )
      )}
    </View>
  );
}
