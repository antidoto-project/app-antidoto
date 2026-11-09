import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

import { mensagemDaApi } from "@/api/erros";
import { CartaoAvistamento } from "@/components/avistamentos/CartaoAvistamento";
import { EstadoErro } from "@/components/EstadoErro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { useExcluirAvistamento, useMeusAvistamentos } from "@/hooks/useAvistamentos";
import type { Avistamento } from "@/types/avistamento.types";
import { formatarDataHora } from "@/utils/data";
import { LABEL_TIPO_ANIMAL } from "@/utils/rotulos";

/** T7 — Meus avistamentos (GET /api/avistamentos/meus): lista, editar e excluir. */
export default function TelaAvistamentos() {
  const { data: avistamentos, isPending, isError, error, refetch } = useMeusAvistamentos();
  const { mutate: excluir, isPending: excluindo, variables: idExcluindo } = useExcluirAvistamento();

  function confirmarExclusao(avistamento: Avistamento) {
    const descricao = `${LABEL_TIPO_ANIMAL[avistamento.tipoAnimal]} em ${formatarDataHora(avistamento.dataHora)}`;

    Alert.alert(
      "Excluir avistamento",
      `Excluir o avistamento (${descricao})? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            excluir(avistamento.id, {
              onError: (erro) => Alert.alert("Não deu para excluir", mensagemDaApi(erro)),
            }),
        },
      ]
    );
  }

  return (
    <View className="flex-1 bg-fundo dark:bg-fundo-escuro">
      <View className="gap-1 bg-marca px-6 pb-6 pt-14">
        <Text accessibilityRole="header" className="font-inter-bold text-2xl text-white">
          Avistamentos
        </Text>
        <Text className="font-inter text-base text-white/90">
          Os animais peçonhentos que você viu por perto.
        </Text>
      </View>

      <ConteudoLista
        avistamentos={avistamentos}
        carregando={isPending}
        mensagemDeErro={isError ? mensagemDaApi(error) : null}
        onTentarNovamente={() => refetch()}
        onExcluir={confirmarExclusao}
        idExcluindo={excluindo ? idExcluindo : undefined}
      />

      {/* Rodapé fixo, como o "Adicionar novo pet" do Afetto */}
      <View className="absolute bottom-0 left-0 right-0 bg-fundo/95 px-5 pb-6 pt-3 dark:bg-fundo-escuro/95">
        <TouchableOpacity
          onPress={() => router.push("/avistamentos/novo")}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl bg-marca py-4"
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text className="font-inter-semibold text-base text-white">Registrar avistamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ConteudoLista({
  avistamentos,
  carregando,
  mensagemDeErro,
  onTentarNovamente,
  onExcluir,
  idExcluindo,
}: {
  avistamentos: Avistamento[] | undefined;
  carregando: boolean;
  mensagemDeErro: string | null;
  onTentarNovamente: () => void;
  onExcluir: (avistamento: Avistamento) => void;
  idExcluindo: number | undefined;
}) {
  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#0B6E4F" size="large" />
      </View>
    );
  }

  if (mensagemDeErro) {
    return <EstadoErro mensagem={mensagemDeErro} onTentarNovamente={onTentarNovamente} />;
  }

  if (!avistamentos?.length) {
    return (
      <View className="flex-1 justify-center pb-24">
        <EstadoVazio
          icone="eye-outline"
          titulo="Você ainda não registrou avistamentos"
          subtitulo="Viu um escorpião, uma cobra ou uma aranha por perto? Registre aqui."
        />
      </View>
    );
  }

  return (
    <FlatList
      data={avistamentos}
      keyExtractor={(avistamento) => String(avistamento.id)}
      contentContainerClassName="gap-3 p-5 pb-32"
      renderItem={({ item }) => (
        <CartaoAvistamento
          avistamento={item}
          onPress={() =>
            router.push({ pathname: "/avistamentos/[id]", params: { id: String(item.id) } })
          }
          onExcluir={() => onExcluir(item)}
          excluindo={idExcluindo === item.id}
        />
      )}
    />
  );
}
