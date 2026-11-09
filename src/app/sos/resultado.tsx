import { Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { AvisoAtendimento } from "@/components/sos/AvisoAtendimento";
import { BotaoLigar192 } from "@/components/sos/BotaoLigar192";
import { ResumoTriagem } from "@/components/sos/ResumoTriagem";
import { SeloUrgencia } from "@/components/sos/SeloUrgencia";
import { criarParamsResultadoSchema } from "@/schemas/triagem.schema";
import { calcularUrgencia } from "@/utils/urgencia";

/**
 * T4 — Resultado do SOS. A urgência é calculada AQUI, no aparelho (RN-U):
 * aparece mesmo sem internet. As unidades próximas, os primeiros socorros e o
 * "Registrar ocorrência" entram nos Passos 4 e 6.
 */
export default function TelaResultado() {
  const params = useLocalSearchParams();
  // A hora de "agora" fica fixa enquanto a tela está aberta
  const [agora] = useState(() => new Date());

  // Os params vêm da URL: sem eles (ou com valor fora do contrato), refaz a triagem
  const leitura = criarParamsResultadoSchema(agora).safeParse(params);
  if (!leitura.success) return <Redirect href="/sos/triagem" />;

  const { tipoAnimal, faixaEtaria, sintomas, horaPicada } = leitura.data;
  const { urgencia, motivos, ligar192 } = calcularUrgencia(
    tipoAnimal,
    faixaEtaria,
    sintomas,
    new Date(horaPicada),
    agora
  );

  return (
    <ScrollView
      className="flex-1 bg-fundo dark:bg-fundo-escuro"
      contentContainerClassName="gap-5 px-5 pb-10 pt-2"
    >
      {/* RN-G3: em EMERGENCIA, o 192 vem antes de qualquer outra informação */}
      {ligar192 && <BotaoLigar192 />}

      <SeloUrgencia urgencia={urgencia} />

      {/* RN-G2 */}
      <AvisoAtendimento />

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
        tipoAnimal={tipoAnimal}
        faixaEtaria={faixaEtaria}
        sintomas={sintomas}
        horaPicada={horaPicada}
        agora={agora}
      />

      {/* RN-G3: fora da EMERGENCIA, o 192 fica no fim da tela */}
      {!ligar192 && <BotaoLigar192 />}
    </ScrollView>
  );
}
