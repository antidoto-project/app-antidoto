import { Controller, type Control } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";

import { mensagemDaApi } from "@/api/erros";
import { ListaSintomas } from "@/components/sos/ListaSintomas";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import { useUnidadesProximas } from "@/hooks/useUnidades";
import { SEM_UNIDADE, type EditarOcorrenciaInput } from "@/schemas/editar-ocorrencia.schema";
import type { Ocorrencia } from "@/types/ocorrencia.types";
import type { UnidadeProxima } from "@/types/unidade.types";
import { LABEL_TIPO_UNIDADE, alternarSintoma } from "@/utils/rotulos";
import { formatarDistancia } from "@/utils/unidade";

type Props = {
  control: Control<EditarOcorrenciaInput>;
  ocorrencia: Ocorrencia;
};

/**
 * As opções da unidade: as mais próximas do lugar da picada (as mesmas do resultado),
 * "Ainda não escolhi" e, se a escolhida antes não estiver mais na lista, ela também.
 */
function opcoesDeUnidade(unidades: UnidadeProxima[], ocorrencia: Ocorrencia) {
  const opcoes: { value: string; label: string; descricao?: string }[] = unidades.map(
    (unidade) => ({
      value: String(unidade.id),
      label: unidade.nome,
      descricao: `${formatarDistancia(unidade.distanciaKm)} · ${LABEL_TIPO_UNIDADE[unidade.tipo]}`,
    })
  );
  const escolhida = ocorrencia.unidadeId;
  if (escolhida !== null && !unidades.some((unidade) => unidade.id === escolhida)) {
    opcoes.unshift({
      value: String(escolhida),
      label: ocorrencia.unidadeNome ?? "A unidade escolhida",
      descricao: "Escolhida no registro",
    });
  }
  return [...opcoes, { value: SEM_UNIDADE, label: "Ainda não escolhi" }];
}

/**
 * Os campos da atualização da ocorrência (T12b): os sintomas de agora e a unidade
 * de destino. O envio (BotaoEnviar) fica na tela, como no FormAvistamento.
 */
export function FormOcorrencia({ control, ocorrencia }: Props) {
  const unidades = useUnidadesProximas(
    { latitude: ocorrencia.latitude, longitude: ocorrencia.longitude },
    ocorrencia.tipoAnimal
  );

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="font-inter-semibold text-base text-texto dark:text-texto-escuro">
          Sintomas de agora
        </Text>
        <Controller
          name="sintomas"
          control={control}
          render={({ field: { value, onChange } }) => (
            <ListaSintomas
              marcados={value}
              onAlternar={(sintoma) => onChange(alternarSintoma(value, sintoma))}
            />
          )}
        />
      </View>

      {unidades.isPending ? (
        <View className="flex-row items-center justify-center gap-3 rounded-2xl bg-white py-8 dark:bg-gray-800">
          <ActivityIndicator color="#0B6E4F" />
          <Text className="font-inter text-base text-texto dark:text-texto-escuro">
            Procurando unidades perto do local…
          </Text>
        </View>
      ) : (
        <Controller
          name="unidadeId"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View className="gap-2">
              <CampoSelecao
                label="Unidade de destino"
                opcoes={opcoesDeUnidade(unidades.data ?? [], ocorrencia)}
                value={value}
                onChange={onChange}
                error={error?.message}
                colunas={1}
              />
              {unidades.isError && (
                <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
                  Não deu para buscar as unidades próximas ({mensagemDaApi(unidades.error)}).
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
