import { Ionicons } from "@expo/vector-icons";
import type { Control } from "react-hook-form";
import { Text, View } from "react-native";

import CampoTexto from "@/components/ui/CampoTexto";
import type { EditarPerfilInput } from "@/schemas/editar-perfil.schema";
import { mascararTelefone } from "@/utils/mascaras";

type Props = {
  control: Control<EditarPerfilInput>;
  email: string;
};

/**
 * Dados pessoais em edição (como o FormDadosPessoais do Afetto). Nome e telefone
 * com os mesmos campos do cadastro; o e-mail só aparece, porque o contrato não
 * deixa mudar.
 */
export function FormDadosPessoais({ control, email }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Dados pessoais
      </Text>

      <View className="gap-4 rounded-2xl bg-white p-4 dark:bg-gray-800">
        <CampoTexto
          name="nome"
          control={control}
          label="Nome"
          placeholder="Seu nome"
          autoComplete="name"
          autoCapitalize="words"
        />

        <CampoTexto
          name="telefone"
          control={control}
          label="Telefone (opcional)"
          placeholder="(11) 99999-0000"
          keyboardType="phone-pad"
          autoComplete="tel"
          transformarTexto={mascararTelefone}
        />

        <View className="flex-row items-center gap-3 rounded-xl border border-gray-300 px-4 py-3.5 dark:border-gray-700">
          <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
          <View className="flex-1">
            <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
              O e-mail não pode ser alterado
            </Text>
            <Text className="font-inter text-base text-texto dark:text-texto-escuro">{email}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
