import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { mensagemDaApi } from "@/api/erros";
import { RegistrarOcorrencia } from "@/components/ocorrencias/RegistrarOcorrencia";
import { AvisoAtendimento } from "@/components/sos/AvisoAtendimento";
import { BotaoLigar192 } from "@/components/sos/BotaoLigar192";
import { ResumoTriagem } from "@/components/sos/ResumoTriagem";
import { SeloUrgencia } from "@/components/sos/SeloUrgencia";
import { UnidadesProximas } from "@/components/sos/UnidadesProximas";
import { useSessao } from "@/context/SessaoContext";
import { useLocalizacao } from "@/hooks/useLocalizacao";
import { useCriarOcorrencia } from "@/hooks/useOcorrencias";
import { criarParamsResultadoSchema } from "@/schemas/triagem.schema";
import { calcularUrgencia } from "@/utils/urgencia";

/**
 * T4 — Resultado do SOS. A urgência é calculada AQUI, no aparelho (RN-U):
 * aparece mesmo sem internet, assim como os primeiros socorros (conteúdo local).
 * As unidades e o registro da ocorrência dependem do GPS e da API.
 */
export default function TelaResultado() {
  const params = useLocalSearchParams();
  // A hora de "agora" fica fixa enquanto a tela está aberta
  const [agora] = useState(() => new Date());
  const { sessao } = useSessao();
  // O GPS fica aqui: as unidades e o registro usam as mesmas coordenadas
  const localizacao = useLocalizacao();
  const {
    mutate: criarOcorrencia,
    isPending: registrando,
    variables: registroEmAndamento,
  } = useCriarOcorrencia();
  const [erroRegistro, setErroRegistro] = useState<string | null>(null);

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

  /** POST /api/ocorrencias (MVP-02 §3.2): com a unidade escolhida ou sem nenhuma. */
  function registrar(unidadeId: number | null) {
    if (!localizacao.coordenadas) return;
    setErroRegistro(null);
    criarOcorrencia(
      { tipoAnimal, faixaEtaria, sintomas, horaPicada, ...localizacao.coordenadas, unidadeId },
      {
        onSuccess: (ocorrencia) =>
          router.replace({ pathname: "/ocorrencias/[id]", params: { id: String(ocorrencia.id) } }),
        onError: (erro) => setErroRegistro(mensagemDaApi(erro)),
      }
    );
  }

  /** Login levando as respostas: depois de entrar, o app volta para este resultado. */
  function entrarParaSalvar() {
    router.push({
      pathname: "/login",
      params: { tipoAnimal, faixaEtaria, sintomas: sintomas.join(","), horaPicada },
    });
  }

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

      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: "/sos/primeiros-socorros/[tipoAnimal]", params: { tipoAnimal } })
        }
        activeOpacity={0.85}
        accessibilityRole="button"
        className="min-h-[56px] flex-row items-center justify-center gap-3 rounded-2xl bg-marca px-5 py-4"
      >
        <Ionicons name="medkit-outline" size={22} color="#FFFFFF" />
        <Text className="font-inter-semibold text-base text-white">
          O que fazer agora: primeiros socorros
        </Text>
      </TouchableOpacity>

      <UnidadesProximas
        tipoAnimal={tipoAnimal}
        localizacao={localizacao}
        onEscolherUnidade={sessao ? (unidade) => registrar(unidade.id) : undefined}
        idEscolhendo={registrando ? registroEmAndamento?.unidadeId : null}
      />

      <RegistrarOcorrencia
        logado={Boolean(sessao)}
        temLocalizacao={localizacao.coordenadas !== null}
        registrando={registrando && registroEmAndamento?.unidadeId === null}
        erro={erroRegistro}
        onRegistrar={() => registrar(null)}
        onEntrar={entrarParaSalvar}
      />

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
