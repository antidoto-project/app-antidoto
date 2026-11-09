import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from "react-native";

import { mensagemDaApi } from "@/api/erros";
import { EstadoErro } from "@/components/EstadoErro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { CartaoUnidade } from "@/components/sos/CartaoUnidade";
import { useLocalizacao } from "@/hooks/useLocalizacao";
import { useUnidadesProximas } from "@/hooks/useUnidades";
import type { TipoAnimal } from "@/types/enums.types";

type Props = { tipoAnimal: TipoAnimal };

/**
 * As unidades mais próximas no resultado (T4, MVP-02 §3.1): pega o GPS e busca
 * na API. Se o GPS ou a API falharem, o resto do resultado (urgência, 192,
 * primeiros socorros) continua na tela.
 */
export function UnidadesProximas({ tipoAnimal }: Props) {
  const localizacao = useLocalizacao();
  const unidades = useUnidadesProximas(localizacao.coordenadas, tipoAnimal);
  // Abelha: não existe soro; a API devolve hospitais e UPAs (MVP-00 §4.4)
  const semSoro = tipoAnimal === "ABELHA";

  return (
    <View className="gap-2">
      <View className="gap-0.5 px-1">
        <Text className="font-inter-semibold text-base text-texto dark:text-texto-escuro">
          {semSoro ? "Atendimento de urgência perto de você" : "Unidades com o soro certo"}
        </Text>
        {semSoro && (
          <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
            Não existe soro para picada de abelha ou vespa: vá a um hospital ou UPA.
          </Text>
        )}
      </View>

      <ConteudoUnidades localizacao={localizacao} unidades={unidades} semSoro={semSoro} />
    </View>
  );
}

function ConteudoUnidades({
  localizacao,
  unidades,
  semSoro,
}: {
  localizacao: ReturnType<typeof useLocalizacao>;
  unidades: ReturnType<typeof useUnidadesProximas>;
  semSoro: boolean;
}) {
  if (localizacao.estado === "negada") {
    return (
      <View className="gap-2 py-4">
        <EstadoErro
          icone="location-outline"
          mensagem="Ative a localização para ver as unidades próximas"
          onTentarNovamente={localizacao.tentarNovamente}
        />
        {/* Negada de vez: o aparelho não pergunta de novo, só pelas configurações */}
        {!localizacao.podePedirDeNovo && (
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            activeOpacity={0.7}
            accessibilityRole="button"
            className="min-h-[48px] justify-center self-center"
          >
            <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
              Abrir as configurações
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (localizacao.estado === "indisponivel") {
    return (
      <View className="py-4">
        <EstadoErro
          icone="location-outline"
          mensagem="Não deu para achar a sua localização. Confira se o GPS está ligado."
          onTentarNovamente={localizacao.tentarNovamente}
        />
      </View>
    );
  }

  if (localizacao.estado === "buscando" || unidades.isPending) {
    return (
      <View className="flex-row items-center justify-center gap-3 rounded-2xl bg-white py-8 dark:bg-gray-800">
        <ActivityIndicator color="#0B6E4F" />
        <Text className="font-inter text-base text-texto dark:text-texto-escuro">
          Procurando unidades perto de você…
        </Text>
      </View>
    );
  }

  if (unidades.isError) {
    return (
      <View className="py-4">
        <EstadoErro
          mensagem={mensagemDaApi(unidades.error)}
          onTentarNovamente={() => unidades.refetch()}
        />
      </View>
    );
  }

  if (unidades.data.length === 0) {
    return (
      <View className="rounded-2xl bg-white dark:bg-gray-800">
        {/* RN-S4 (na abelha, o texto fala de hospital ou UPA: não existe soro) */}
        <EstadoVazio
          icone="medkit-outline"
          titulo={
            semSoro
              ? "Nenhum hospital ou UPA encontrado perto de você. Ligue 192."
              : "Nenhuma unidade com soro encontrada. Ligue 192."
          }
        />
      </View>
    );
  }

  return (
    <View className="gap-3">
      {unidades.data.map((unidade) => (
        <CartaoUnidade key={unidade.id} unidade={unidade} semSoro={semSoro} />
      ))}
    </View>
  );
}
