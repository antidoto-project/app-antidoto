import { useColorScheme } from "nativewind";
import { Image } from "react-native";

// Tamanho no style, não no className: no navegador, o react-native-web põe no
// <Image> o tamanho original do PNG (729 × 176) e ele ganha da classe. A
// proporção é a do arquivo.
const TAMANHO_LOGO = { width: 199, height: 48 };

/**
 * Logo horizontal do Antídoto (identidade visual). No tema escuro, a
 * versão com o texto branco — a mesma dos PNGs "fundo-preto" e "fundo-grafite"
 * da identidade. O tema vem do `useColorScheme` do nativewind (o que vale para
 * o `dark:` das classes), não do react-native.
 */
export function LogoAntidoto() {
  const { colorScheme } = useColorScheme();
  const fonte =
    colorScheme === "dark"
      ? require("../../assets/images/antidoto-logo-horizontal-escuro.png")
      : require("../../assets/images/antidoto-logo-horizontal.png");

  return (
    <Image
      source={fonte}
      style={TAMANHO_LOGO}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Antídoto"
    />
  );
}
