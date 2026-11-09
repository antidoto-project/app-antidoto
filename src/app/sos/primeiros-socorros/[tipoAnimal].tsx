import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { EstadoErro } from "@/components/EstadoErro";
import { AvisoAtendimento } from "@/components/sos/AvisoAtendimento";
import { TelefonesUteis } from "@/components/sos/TelefonesUteis";
import { usePrimeirosSocorros } from "@/hooks/useConteudo";
import { ParamsPrimeirosSocorrosSchema } from "@/schemas/triagem.schema";
import type { TipoAnimal } from "@/types/enums.types";
import { ICONE_TIPO_ANIMAL, LABEL_TIPO_ANIMAL } from "@/utils/rotulos";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

/**
 * T5 — Primeiros socorros do animal (conteúdo local, MVP-02 §6): funciona sem
 * internet e sem login (RN-G1). Sempre com o aviso RN-G2 e os telefones úteis.
 */
export default function TelaPrimeirosSocorros() {
  const leitura = ParamsPrimeirosSocorrosSchema.safeParse(useLocalSearchParams());
  if (!leitura.success) return <Redirect href="/sos/triagem" />;

  return <PrimeirosSocorros tipoAnimal={leitura.data.tipoAnimal} />;
}

function PrimeirosSocorros({ tipoAnimal }: { tipoAnimal: TipoAnimal }) {
  const { data: conteudo, isPending, isError, refetch } = usePrimeirosSocorros(tipoAnimal);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-fundo dark:bg-fundo-escuro">
        <ActivityIndicator color="#0B6E4F" size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <EstadoErro
        mensagem="Não deu para abrir os primeiros socorros."
        onTentarNovamente={() => refetch()}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-fundo dark:bg-fundo-escuro"
      contentContainerClassName="gap-5 px-5 pb-10 pt-2"
    >
      <View className="gap-1">
        <Text className="text-4xl">{ICONE_TIPO_ANIMAL[tipoAnimal]}</Text>
        <Text
          accessibilityRole="header"
          className="font-inter-bold text-3xl text-texto dark:text-texto-escuro"
        >
          Primeiros socorros
        </Text>
        <Text className="font-inter text-base text-gray-600 dark:text-gray-300">
          {LABEL_TIPO_ANIMAL[tipoAnimal]}
        </Text>
      </View>

      {/* RN-G2 */}
      <AvisoAtendimento />

      <ListaOrientacoes
        titulo="Faça"
        icone="checkmark-circle"
        cor="#0B6E4F"
        itens={conteudo.faca}
      />
      <ListaOrientacoes
        titulo="NÃO faça"
        icone="close-circle"
        cor="#1E2A2F"
        itens={conteudo.naoFaca}
      />
      <ListaOrientacoes titulo="Atenção" icone="warning" cor="#EF6C00" itens={conteudo.atencao} />

      {/* RN-G8: 192, 193 e Disque-Intoxicação */}
      <TelefonesUteis />
    </ScrollView>
  );
}

/**
 * Uma lista de orientações com o ícone em cada item. Cores dos tokens: `marca`
 * no "Faça", grafite no "NÃO faça" (o vermelho é só do SOS e do 192) e `alta`
 * na atenção.
 */
function ListaOrientacoes({
  titulo,
  icone,
  cor,
  itens,
}: {
  titulo: string;
  icone: NomeIcone;
  cor: string;
  itens: string[];
}) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-bold text-lg text-texto dark:text-texto-escuro">
        {titulo}
      </Text>
      <View className="gap-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
        {itens.map((item) => (
          <View key={item} className="flex-row items-start gap-3">
            <Ionicons name={icone} size={22} color={cor} />
            <Text className="flex-1 font-inter text-base text-texto dark:text-texto-escuro">
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
