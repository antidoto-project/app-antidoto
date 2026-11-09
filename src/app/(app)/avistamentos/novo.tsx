import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

import { errosDaApiNoFormulario } from "@/api/erros";
import { FormAvistamento } from "@/components/avistamentos/FormAvistamento";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { useCriarAvistamento } from "@/hooks/useAvistamentos";
import {
  AvistamentoSchema,
  CAMPOS_AVISTAMENTO,
  type AvistamentoInput,
} from "@/schemas/avistamento.schema";

/** T10 — Novo avistamento (POST /api/avistamentos). A data e a hora são as de agora. */
export default function TelaNovoAvistamento() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AvistamentoInput>({
    defaultValues: { observacao: "" },
    resolver: zodResolver(AvistamentoSchema),
  });

  const { mutate: criar, isPending: salvando } = useCriarAvistamento();

  function salvar(dados: AvistamentoInput) {
    criar(dados, {
      // A lista já foi atualizada pelo hook (invalidação)
      onSuccess: () => router.back(),
      onError: (erro) => {
        const { porCampo, geral } = errosDaApiNoFormulario(erro, CAMPOS_AVISTAMENTO);
        porCampo.forEach(({ campo, mensagem }) => setError(campo, { message: mensagem }));
        if (geral) setError("root", { message: geral });
      },
    });
  }

  return (
    <TelaFormulario
      titulo={"Registrar\navistamento"}
      subtitulo="Qual animal você viu e onde. Isso ajuda a avisar o bairro."
      erro={errors.root?.message}
      rodape={
        <BotaoEnviar
          enviando={salvando}
          onPress={handleSubmit(salvar)}
          texto="Salvar avistamento"
          textoLoading="Salvando..."
        />
      }
    >
      <FormAvistamento control={control} />
    </TelaFormulario>
  );
}
