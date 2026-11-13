import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState, type ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  titulo: string;
  subtitulo?: string;
  /** Botão à direita do título (ex.: o lápis do Perfil). */
  acao?: ReactNode;
};

/**
 * Cabeçalho verde das abas (Início, Avistamentos, Ocorrências e Perfil). Enquanto
 * a aba está na tela, os ícones da barra de status ficam claros: os escuros do
 * tema claro quase somem no verde da marca. Ao sair da aba, o <StatusBar> some
 * e volta o do _layout.tsx raiz, que segue o tema.
 */
export function CabecalhoAba({ titulo, subtitulo, acao }: Props) {
  const [focada, setFocada] = useState(false);

  // Navegação só pelo expo-router: o foco da aba vem do useFocusEffect dele
  useFocusEffect(
    useCallback(() => {
      setFocada(true);
      return () => setFocada(false);
    }, [])
  );

  return (
    <View className="gap-1 bg-marca px-6 pb-6 pt-14">
      {focada && <StatusBar style="light" />}

      <View className="flex-row items-center justify-between gap-3">
        <Text accessibilityRole="header" className="flex-1 font-inter-bold text-2xl text-white">
          {titulo}
        </Text>
        {acao}
      </View>

      {subtitulo && <Text className="font-inter text-base text-white/90">{subtitulo}</Text>}
    </View>
  );
}
