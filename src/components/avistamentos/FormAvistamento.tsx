import { Controller, type Control } from "react-hook-form";
import { View } from "react-native";

import { CampoLocalizacao } from "@/components/avistamentos/CampoLocalizacao";
import { SeletorAnimal } from "@/components/sos/SeletorAnimal";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import type { AvistamentoInput } from "@/schemas/avistamento.schema";
import { LOCAIS_AVISTAMENTO } from "@/types/enums.types";
import { LABEL_LOCAL_AVISTAMENTO } from "@/utils/rotulos";

const OPCOES_LOCAL = LOCAIS_AVISTAMENTO.map((local) => ({
  value: local,
  label: LABEL_LOCAL_AVISTAMENTO[local],
}));

/**
 * Os campos do avistamento — os mesmos no novo (T10) e na edição (T11), como o
 * FormPet do Afetto. O envio (BotaoEnviar) fica na tela.
 */
export function FormAvistamento({ control }: { control: Control<AvistamentoInput> }) {
  return (
    <View className="gap-6">
      <Controller
        name="tipoAnimal"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <SeletorAnimal label="Animal" value={value} onChange={onChange} error={error?.message} />
        )}
      />

      <Controller
        name="local"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <CampoSelecao
            label="Local"
            opcoes={OPCOES_LOCAL}
            value={value}
            onChange={onChange}
            error={error?.message}
            colunas={3}
          />
        )}
      />

      <Controller
        name="localizacao"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <CampoLocalizacao value={value} onChange={onChange} error={error?.message} />
        )}
      />

      <CampoTexto
        name="observacao"
        control={control}
        label="Observação (opcional)"
        placeholder="Ex.: vi perto do ralo do banheiro"
        multiline
        maxLength={500}
        autoCapitalize="sentences"
        autoCorrect
        textAlignVertical="top"
        className="min-h-[96px] flex-1 py-3.5 font-inter text-base text-texto dark:text-texto-escuro"
      />
    </View>
  );
}
