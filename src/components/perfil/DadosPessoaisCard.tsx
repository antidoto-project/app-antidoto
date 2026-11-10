import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  nome: string;
  email: string;
  /** Já formatado; vazio quando não informado. */
  telefone: string;
};

function LinhaInfo({
  icone,
  label,
  valor,
  ultima = false,
}: {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  valor: string;
  ultima?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 py-3.5 ${
        ultima ? "" : "border-b border-gray-200 dark:border-gray-700"
      }`}
    >
      <Ionicons name={icone} size={20} color="#6B7280" />
      <View className="flex-1">
        <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">{label}</Text>
        <Text className="font-inter text-base text-texto dark:text-texto-escuro">{valor}</Text>
      </View>
    </View>
  );
}

/** Dados de quem está logado, só leitura. O lápis do cabeçalho troca pelo FormDadosPessoais. */
export function DadosPessoaisCard({ nome, email, telefone }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Dados pessoais
      </Text>

      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">
        <LinhaInfo icone="person-outline" label="Nome" valor={nome} />
        <LinhaInfo icone="mail-outline" label="E-mail" valor={email} />
        <LinhaInfo
          icone="call-outline"
          label="Telefone"
          valor={telefone || "Não informado"}
          ultima
        />
      </View>
    </View>
  );
}
