import { Text, View } from "react-native";

import type { FaixaEtaria, Sintoma, TipoAnimal } from "@/types/enums.types";
import { tempoDecorrido } from "@/utils/data";
import {
  ICONE_TIPO_ANIMAL,
  IDADE_FAIXA_ETARIA,
  LABEL_FAIXA_ETARIA,
  LABEL_SINTOMA,
  LABEL_TIPO_ANIMAL,
} from "@/utils/rotulos";

type Props = {
  tipoAnimal: TipoAnimal;
  faixaEtaria: FaixaEtaria;
  sintomas: Sintoma[];
  /** ISO-8601. */
  horaPicada: string;
  agora: Date;
};

/** As respostas da triagem no resultado (T4), para a pessoa conferir ou mostrar na recepção. */
export function ResumoTriagem({ tipoAnimal, faixaEtaria, sintomas, horaPicada, agora }: Props) {
  const linhas = [
    {
      rotulo: "Animal",
      valor: `${ICONE_TIPO_ANIMAL[tipoAnimal]} ${LABEL_TIPO_ANIMAL[tipoAnimal]}`,
    },
    {
      rotulo: "Quem foi picado",
      valor: `${LABEL_FAIXA_ETARIA[faixaEtaria]} (${IDADE_FAIXA_ETARIA[faixaEtaria]})`,
    },
    { rotulo: "Picada", valor: tempoDecorrido(horaPicada, agora) },
    {
      rotulo: "Sintomas",
      valor: sintomas.length
        ? sintomas.map((sintoma) => LABEL_SINTOMA[sintoma]).join("; ")
        : "Nenhum marcado",
    },
  ];

  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        Suas respostas
      </Text>
      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">
        {linhas.map(({ rotulo, valor }, indice) => (
          <View
            key={rotulo}
            className={`gap-0.5 py-3 ${indice > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""}`}
          >
            <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">{rotulo}</Text>
            <Text className="font-inter text-base text-texto dark:text-texto-escuro">{valor}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
