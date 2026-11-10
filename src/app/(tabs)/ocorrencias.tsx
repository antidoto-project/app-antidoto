import { router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { mensagemDaApi } from "@/api/erros";
import { CartaoOcorrencia } from "@/components/ocorrencias/CartaoOcorrencia";
import { EstadoErro } from "@/components/EstadoErro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { useMinhasOcorrencias } from "@/hooks/useOcorrencias";

/** T8 — Histórico de ocorrências (GET /api/ocorrencias/minhas). Tocar abre o resumo (T12). */
export default function TelaOcorrencias() {
  const { data: ocorrencias, isPending, isError, error, refetch } = useMinhasOcorrencias();

  return (
    <View className="flex-1 bg-fundo dark:bg-fundo-escuro">
      <View className="gap-1 bg-marca px-6 pb-6 pt-14">
        <Text accessibilityRole="header" className="font-inter-bold text-2xl text-white">
          Ocorrências
        </Text>
        <Text className="font-inter text-base text-white/90">
          As picadas que você registrou e os resumos para a recepção.
        </Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B6E4F" size="large" />
        </View>
      ) : isError ? (
        <EstadoErro mensagem={mensagemDaApi(error)} onTentarNovamente={() => refetch()} />
      ) : ocorrencias.length === 0 ? (
        <View className="flex-1 justify-center">
          <EstadoVazio
            icone="document-text-outline"
            titulo="Você ainda não registrou ocorrências"
            subtitulo="No resultado do SOS, toque em “Registrar ocorrência” para ter um resumo para a recepção."
          />
        </View>
      ) : (
        <FlatList
          data={ocorrencias}
          keyExtractor={(ocorrencia) => String(ocorrencia.id)}
          contentContainerClassName="gap-3 p-5 pb-10"
          renderItem={({ item }) => (
            <CartaoOcorrencia
              ocorrencia={item}
              onPress={() =>
                router.push({ pathname: "/ocorrencias/[id]", params: { id: String(item.id) } })
              }
            />
          )}
        />
      )}
    </View>
  );
}
