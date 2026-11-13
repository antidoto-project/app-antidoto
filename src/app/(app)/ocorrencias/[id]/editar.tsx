import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";

import { errosDaApiNoFormulario, mensagemDaApi } from "@/api/erros";
import { EstadoErro } from "@/components/EstadoErro";
import { FormOcorrencia } from "@/components/ocorrencias/FormOcorrencia";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { useAtualizarOcorrencia, useOcorrencia } from "@/hooks/useOcorrencias";
import {
  CAMPOS_EDITAR_OCORRENCIA,
  EditarOcorrenciaSchema,
  SEM_UNIDADE,
  type EditarOcorrenciaInput,
} from "@/schemas/editar-ocorrencia.schema";
import { ocorrenciaService } from "@/services/ocorrencia.service";
import { formatarDataHora } from "@/utils/data";
import { LABEL_FAIXA_ETARIA, LABEL_TIPO_ANIMAL } from "@/utils/rotulos";

/**
 * T12b — Atualizar a ocorrência (GET e PUT /api/ocorrencias/{id}): os sintomas de
 * agora e a unidade de destino. O Java recalcula a urgência e gera um resumo novo;
 * a tela volta para o detalhe, que mostra "Gerando resumo…" até ficar pronto.
 */
export default function TelaAtualizarOcorrencia() {
  const { id: idDaRota } = useLocalSearchParams<{ id: string }>();
  const id = Number(idDaRota);
  const idValido = Number.isInteger(id) && id > 0;

  const { data: ocorrencia, isPending, isError, error, refetch } = useOcorrencia(id);
  const { mutate: atualizar, isPending: salvando } = useAtualizarOcorrencia();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditarOcorrenciaInput>({
    defaultValues: { sintomas: [], unidadeId: SEM_UNIDADE },
    resolver: zodResolver(EditarOcorrenciaSchema),
  });

  // O formulário começa com o que está salvo
  useEffect(() => {
    if (ocorrencia) reset(ocorrenciaService.paraFormulario(ocorrencia));
  }, [ocorrencia, reset]);

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

  // Já carregada: o que não está no formulário vai como está no registro
  const registrada = ocorrencia;

  function salvar(dados: EditarOcorrenciaInput) {
    atualizar(
      { ocorrencia: registrada, dados },
      {
        onSuccess: () => router.back(),
        onError: (erro) => {
          const { porCampo, geral } = errosDaApiNoFormulario(erro, CAMPOS_EDITAR_OCORRENCIA);
          porCampo.forEach(({ campo, mensagem }) => setError(campo, { message: mensagem }));
          if (geral) setError("root", { message: geral });
        },
      }
    );
  }

  return (
    <TelaFormulario
      titulo={"Atualizar\nocorrência"}
      subtitulo={`${LABEL_TIPO_ANIMAL[ocorrencia.tipoAnimal]} · ${LABEL_FAIXA_ETARIA[ocorrencia.faixaEtaria]} · picada em ${formatarDataHora(ocorrencia.horaPicada)}. A urgência e o resumo são refeitos com o que você mudar.`}
      erro={errors.root?.message}
      rodape={
        <BotaoEnviar
          enviando={salvando}
          onPress={handleSubmit(salvar)}
          texto="Salvar alterações"
          textoLoading="Salvando..."
        />
      }
    >
      <FormOcorrencia control={control} ocorrencia={ocorrencia} />
    </TelaFormulario>
  );
}
