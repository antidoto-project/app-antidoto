import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

type Props = {
  /** Acima do título (ex.: o logo, no login). */
  topo?: ReactNode;
  /** Título grande da tela; use "\n" para quebrar a linha. */
  titulo: string;
  subtitulo?: string;
  /** Erro geral do formulário (ex.: `errors.root?.message`), mostrado depois dos campos. */
  erro?: string;
  /** Botão de envio (`BotaoEnviar`), que fica fixo no rodapé. */
  rodape: ReactNode;
  children: ReactNode;
};

/**
 * Estrutura das telas de formulário (login e cadastro): teclado sem cobrir os
 * campos, rolagem, título, erro geral e o botão fixo no rodapé. A tela só passa
 * os campos (mesmo componente do Afetto).
 */
export function TelaFormulario({ topo, titulo, subtitulo, erro, rodape, children }: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fundo dark:bg-fundo-escuro"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* pb-32: espaço para o botão fixo do rodapé não cobrir o último campo */}
        <View className="flex-1 gap-8 px-6 pb-32 pt-6">
          {topo}

          <View className="gap-2">
            <Text
              accessibilityRole="header"
              className="font-inter-bold text-3xl leading-tight text-texto dark:text-texto-escuro"
            >
              {titulo}
            </Text>
            {subtitulo && (
              <Text className="font-inter text-base text-gray-600 dark:text-gray-300">
                {subtitulo}
              </Text>
            )}
          </View>

          {children}

          {erro && (
            <Text
              accessibilityRole="alert"
              className="text-center font-inter text-base text-red-600"
            >
              {erro}
            </Text>
          )}

          <View className="flex-1" />

          {rodape}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
