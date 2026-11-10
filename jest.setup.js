// Variável normalmente injetada pelo Expo a partir do .env — definida aqui para o runtime de teste.
process.env.EXPO_PUBLIC_API_URL = "https://api.test.local";

// react-native-reanimated: mock leve e manual (evita o runtime de worklets nos testes).
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (c) => c },
    View,
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withSpring: (toValue) => toValue,
    withTiming: (toValue) => toValue,
  };
});

// expo-router: stub da API imperativa de navegação. O <Redirect> não renderiza
// nada; o teste confere para onde ele mandaria (props do mock). Os params da
// rota vêm do useLocalSearchParams, que cada teste define.
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    dismissTo: jest.fn(),
  },
  Redirect: jest.fn(() => null),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Fora de um navegador de verdade, a tela conta como em foco (o CabecalhoAba usa
// o useIsFocused para clarear a barra de status só na aba aberta).
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useIsFocused: jest.fn(() => true),
}));

// AsyncStorage em memória (mock oficial da biblioteca), para a sessão nos testes.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// expo-font: nos testes, toda fonte já conta como carregada. Sem isso, cada ícone
// (Ionicons) que aparece depois do primeiro render carrega a fonte sozinho e o
// React avisa "An update to Icon inside a test was not wrapped in act(...)".
jest.mock("expo-font", () => ({
  ...jest.requireActual("expo-font"),
  isLoaded: jest.fn(() => true),
}));
