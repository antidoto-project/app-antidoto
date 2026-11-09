import { Text, TouchableOpacity, View } from "react-native";

type OpcaoSelecao<T extends string> = {
  label: string;
  value: T;
  /** Segunda linha, menor (ex.: a idade embaixo de "Criança"). */
  descricao?: string;
};

type Props<T extends string> = {
  label: string;
  opcoes: OpcaoSelecao<T>[];
  value?: T;
  onChange: (value: T) => void;
  error?: string;
  /** Quebra as opções em linhas de 2 ou 3; sem isso, todas ficam numa linha só. */
  colunas?: 2 | 3;
};

const LARGURA_POR_COLUNAS = { 2: "w-[48%]", 3: "w-[31%]" } as const;

/**
 * Escolha de uma opção entre poucas, em botões (mesmo componente do Afetto,
 * com o `tresPorLinha` virando `colunas`). Não depende do react-hook-form.
 */
export function CampoSelecao<T extends string>({
  label,
  opcoes,
  value,
  onChange,
  error,
  colunas,
}: Props<T>) {
  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-base text-texto dark:text-texto-escuro">
        {label}
      </Text>
      <View
        accessibilityRole="radiogroup"
        className={`flex-row flex-wrap ${colunas ? "justify-between gap-y-2" : "gap-2"}`}
      >
        {opcoes.map((opcao) => {
          const selecionado = value === opcao.value;
          return (
            <TouchableOpacity
              key={opcao.value}
              onPress={() => onChange(opcao.value)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: selecionado }}
              accessibilityLabel={
                opcao.descricao ? `${opcao.label}, ${opcao.descricao}` : opcao.label
              }
              className={`${colunas ? LARGURA_POR_COLUNAS[colunas] : "flex-1"} min-h-[56px] items-center justify-center rounded-2xl border px-2 py-3 ${
                selecionado
                  ? "border-marca bg-marca"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <Text
                className={`text-center font-inter-semibold text-base ${
                  selecionado ? "text-white" : "text-texto dark:text-texto-escuro"
                }`}
              >
                {opcao.label}
              </Text>
              {opcao.descricao && (
                <Text
                  className={`text-center font-inter text-sm ${
                    selecionado ? "text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {opcao.descricao}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text className="font-inter text-sm text-red-600">{error}</Text>}
    </View>
  );
}
