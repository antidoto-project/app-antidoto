import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { mensagemDaApi } from "@/api/erros";
import { EstadoErro } from "@/components/EstadoErro";
import { CartaoResumo } from "@/components/ocorrencias/CartaoResumo";
import { AvisoAtendimento } from "@/components/sos/AvisoAtendimento";
import { BotaoLigar192 } from "@/components/sos/BotaoLigar192";
import { ResumoTriagem } from "@/components/sos/ResumoTriagem";
import { SeloUrgencia } from "@/components/sos/SeloUrgencia";
import { useExcluirOcorrencia, useOcorrencia } from "@/hooks/useOcorrencias";
import { formatarDataHora } from "@/utils/data";
import { urgenciaDaOcorrencia } from "@/utils/urgencia";

/**
 * T12 — Ocorrência e resumo de pré-atendimento (GET /api/ocorrencias/{id}). O
 * hook consulta de novo a cada 3 s enquanto o resumo está PENDENTE.
 */
export default function TelaOcorrencia() {
  const { id: idDaRota } = useLocalSearchParams<{ id: string }>();
  const id = Number(idDaRota);
  const idValido = Number.isInteger(id) && id > 0;

  const { data: ocorrencia, isPending, isError, error, refetch } = useOcorrencia(id);
  const { mutate: excluir, isPending: excluindo } = useExcluirOcorrencia();
  const [agora] = useState(() => new Date());
  const rolagem = useRef<ScrollView>(null);

  // Voltando da atualização, a tela abre no topo: se a urgência virou EMERGENCIA,
  // o 192 aparece antes de tudo (RN-G3), e não escondido na rolagem de antes
  useFocusEffect(
    useCallback(() => {
      rolagem.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  if (!idValido) return <Redirect href="/ocorrencias" />;

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-fundo dark:bg-fundo-escuro">
        <ActivityIndicator color="#0B6E4F" size="large" />
      </View>
    );
  }

  if (isError) {
    return <EstadoErro mensagem={mensagemDaApi(error)} onTentarNovamente={() => refetch()} />;
  }

  const { urgencia, motivos, ligar192 } = urgenciaDaOcorrencia(ocorrencia);

  function confirmarExclusao() {
    Alert.alert(
      "Remover do histórico",
      "Remover esta ocorrência do seu histórico? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () =>
            excluir(id, {
              onSuccess: () => router.replace("/ocorrencias"),
              onError: (erro) => Alert.alert("Não deu para remover", mensagemDaApi(erro)),
            }),
        },
      ]
    );
  }

  return (
    <ScrollView
      ref={rolagem}
      className="flex-1 bg-fundo dark:bg-fundo-escuro"
      contentContainerClassName="gap-5 px-5 pb-10 pt-2"
    >
      {/* RN-G3: em EMERGENCIA, o 192 vem antes de qualquer outra informação */}
      {ligar192 && <BotaoLigar192 />}

      <SeloUrgencia urgencia={urgencia} />

      {/* RN-G2 */}
      <AvisoAtendimento />

      <Text className="px-1 font-inter text-sm text-gray-600 dark:text-gray-300">
        Registrada em {formatarDataHora(ocorrencia.criadoEm)}
        {ocorrencia.unidadeNome ? ` · Unidade: ${ocorrencia.unidadeNome}` : ""}
      </Text>

      <CartaoResumo
        statusResumo={ocorrencia.statusResumo}
        resumo={ocorrencia.resumo}
        avisoResumo={ocorrencia.avisoResumo}
      />

      <View className="gap-2">
        <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
          Por que esse nível
        </Text>
        <View className="gap-2 rounded-2xl bg-white p-4 dark:bg-gray-800">
          {motivos.map((motivo) => (
            <Text key={motivo} className="font-inter text-base text-texto dark:text-texto-escuro">
              • {motivo}
            </Text>
          ))}
        </View>
      </View>

      <ResumoTriagem
        tipoAnimal={ocorrencia.tipoAnimal}
        faixaEtaria={ocorrencia.faixaEtaria}
        sintomas={ocorrencia.sintomas}
        horaPicada={ocorrencia.horaPicada}
        agora={agora}
      />

      {/* Com o resumo ainda sendo gerado, a API recusaria a atualização (409) */}
      {ocorrencia.statusResumo !== "PENDENTE" && (
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/ocorrencias/[id]/editar", params: { id: String(id) } })
          }
          activeOpacity={0.85}
          accessibilityRole="button"
          className="min-h-[48px] flex-row items-center justify-center gap-2 rounded-2xl border border-marca px-6 py-3 dark:border-marca-claro"
        >
          <Ionicons name="create-outline" size={20} color="#0B6E4F" />
          <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
            Atualizar sintomas ou unidade
          </Text>
        </TouchableOpacity>
      )}

      {/* RN-G3: fora da EMERGENCIA, o 192 fica no fim da tela */}
      {!ligar192 && <BotaoLigar192 />}

      <TouchableOpacity
        onPress={confirmarExclusao}
        disabled={excluindo}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ disabled: excluindo, busy: excluindo }}
        className="min-h-[48px] justify-center self-center"
      >
        <Text className="font-inter-semibold text-base text-gray-600 dark:text-gray-300">
          {excluindo ? "Removendo..." : "Remover do histórico"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
