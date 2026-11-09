import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { ListaSintomas } from "@/components/sos/ListaSintomas";
import { SeletorAnimal } from "@/components/sos/SeletorAnimal";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { TOTAL_PASSOS_TRIAGEM, useTriagem } from "@/hooks/useTriagem";
import { OPCOES_HORA_PICADA } from "@/schemas/triagem.schema";
import { FAIXAS_ETARIAS } from "@/types/enums.types";
import { IDADE_FAIXA_ETARIA, LABEL_FAIXA_ETARIA, LABEL_HORA_PICADA } from "@/utils/rotulos";

const OPCOES_FAIXA = FAIXAS_ETARIAS.map((faixa) => ({
  value: faixa,
  label: LABEL_FAIXA_ETARIA[faixa],
  descricao: IDADE_FAIXA_ETARIA[faixa],
}));
const OPCOES_HORA = OPCOES_HORA_PICADA.map((opcao) => ({
  value: opcao,
  label: LABEL_HORA_PICADA[opcao],
}));

const TEXTOS_DO_PASSO = {
  1: { titulo: "Qual animal\npicou?", subtitulo: "Se não viu direito, escolha “Não sei”." },
  2: { titulo: "Quem foi picado\ne quando?", subtitulo: "Escolha a opção mais próxima." },
  3: {
    titulo: "O que a pessoa\nsente agora?",
    subtitulo: "Marque tudo o que aparecer. Pode não marcar nenhum.",
  },
} as const;

/** T3 — Triagem do SOS em 3 passos (MVP-02 §3.1). Pública: funciona sem login (RN-G1). */
export default function TelaTriagem() {
  const triagem = useTriagem();
  const { passo, erros } = triagem;
  const { titulo, subtitulo } = TEXTOS_DO_PASSO[passo as keyof typeof TEXTOS_DO_PASSO];

  function continuar() {
    if (!triagem.ultimoPasso) {
      triagem.avancar();
      return;
    }
    const params = triagem.concluir(new Date());
    if (params) router.push({ pathname: "/sos/resultado", params });
  }

  return (
    <TelaFormulario
      topo={<IndicadorPasso passo={passo} />}
      titulo={titulo}
      subtitulo={subtitulo}
      rodape={
        <BotaoEnviar
          enviando={false}
          onPress={continuar}
          texto={triagem.ultimoPasso ? "Ver resultado" : "Continuar"}
        />
      }
    >
      {passo === 1 && (
        <SeletorAnimal
          value={triagem.tipoAnimal}
          onChange={triagem.escolherAnimal}
          error={erros.tipoAnimal}
        />
      )}

      {passo === 2 && (
        <View className="gap-6">
          <CampoSelecao
            label="Quem foi picado?"
            opcoes={OPCOES_FAIXA}
            value={triagem.faixaEtaria}
            onChange={triagem.escolherFaixaEtaria}
            error={erros.faixaEtaria}
          />
          <CampoSelecao
            label="Quando foi a picada?"
            opcoes={OPCOES_HORA}
            value={triagem.opcaoHora}
            onChange={triagem.escolherHora}
            error={erros.opcaoHora}
            colunas={2}
          />
        </View>
      )}

      {passo === 3 && (
        <ListaSintomas marcados={triagem.sintomas} onAlternar={triagem.alternarSintoma} />
      )}

      {passo > 1 && (
        <TouchableOpacity
          onPress={triagem.voltar}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="min-h-[48px] justify-center self-center"
        >
          <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
            Voltar ao passo anterior
          </Text>
        </TouchableOpacity>
      )}
    </TelaFormulario>
  );
}

/** "Passo 2 de 3" com uma barra por passo (as já feitas na cor da marca). */
function IndicadorPasso({ passo }: { passo: number }) {
  return (
    <View
      accessible
      accessibilityLabel={`Passo ${passo} de ${TOTAL_PASSOS_TRIAGEM}`}
      className="gap-2"
    >
      <View className="flex-row gap-2">
        {Array.from({ length: TOTAL_PASSOS_TRIAGEM }, (_, indice) => (
          <View
            key={indice}
            className={`h-1.5 flex-1 rounded-full ${
              indice < passo ? "bg-marca dark:bg-marca-claro" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </View>
      <Text className="font-inter-semibold text-sm text-gray-600 dark:text-gray-300">
        Passo {passo} de {TOTAL_PASSOS_TRIAGEM}
      </Text>
    </View>
  );
}
