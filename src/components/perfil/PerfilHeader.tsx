import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

import { CabecalhoAba } from "@/components/ui/CabecalhoAba";

type Props = {
  editando: boolean;
  /** Sem os dados carregados não há o que editar: o lápis não aparece. */
  podeEditar: boolean;
  onEditar: () => void;
  onCancelar: () => void;
};

/** Cabeçalho do Perfil (como o PerfilHeader do Afetto): título, lápis para editar e "Cancelar". */
export function PerfilHeader({ editando, podeEditar, onEditar, onCancelar }: Props) {
  const acao = editando ? (
    <TouchableOpacity
      onPress={onCancelar}
      activeOpacity={0.7}
      hitSlop={8}
      accessibilityRole="button"
      className="h-10 justify-center"
    >
      <Text className="font-inter-semibold text-base text-white">Cancelar</Text>
    </TouchableOpacity>
  ) : podeEditar ? (
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
  ) : undefined;

  return <CabecalhoAba titulo={editando ? "Editar perfil" : "Perfil"} acao={acao} />;
}
