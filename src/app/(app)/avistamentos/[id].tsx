import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";

import { errosDaApiNoFormulario, mensagemDaApi } from "@/api/erros";
import { FormAvistamento } from "@/components/avistamentos/FormAvistamento";
import { EstadoErro } from "@/components/EstadoErro";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { useAtualizarAvistamento, useAvistamento } from "@/hooks/useAvistamentos";
import {
  AvistamentoSchema,
  CAMPOS_AVISTAMENTO,
  type AvistamentoInput,
} from "@/schemas/avistamento.schema";
import { avistamentoService } from "@/services/avistamento.service";
import { formatarDataHora } from "@/utils/data";

/**
 * T11 — Editar avistamento (GET e PUT /api/avistamentos/{id}). Mantém a data e a
 * hora originais. De outra pessoa, a API responde 404 (RN-G5): vira erro na tela.
 */
export default function TelaEditarAvistamento() {
  const { id: idDaRota } = useLocalSearchParams<{ id: string }>();
  const id = Number(idDaRota);
  const idValido = Number.isInteger(id) && id > 0;

  const { data: avistamento, isPending, isError, error, refetch } = useAvistamento(id);
  const { mutate: atualizar, isPending: salvando } = useAtualizarAvistamento();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AvistamentoInput>({
    defaultValues: { observacao: "" },
    resolver: zodResolver(AvistamentoSchema),
  });

  // O formulário começa com o que está salvo
  useEffect(() => {
    if (avistamento) reset(avistamentoService.paraFormulario(avistamento));
  }, [avistamento, reset]);

  if (!idValido) return <Redirect href="/avistamentos" />;

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

  // A original: editar não muda quando o animal foi visto (MVP-02 §3.3)
  const dataHora = avistamento.dataHora;

  function salvar(dados: AvistamentoInput) {
    atualizar(
      { id, dados, dataHora },
      {
        onSuccess: () => router.back(),
        onError: (erro) => {
          const { porCampo, geral } = errosDaApiNoFormulario(erro, CAMPOS_AVISTAMENTO);
          porCampo.forEach(({ campo, mensagem }) => setError(campo, { message: mensagem }));
          if (geral) setError("root", { message: geral });
        },
      }
    );
  }

  return (
    <TelaFormulario
      titulo={"Editar\navistamento"}
      subtitulo={`Visto em ${formatarDataHora(dataHora)}.`}
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
      <FormAvistamento control={control} />
    </TelaFormulario>
  );
}
