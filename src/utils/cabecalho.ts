/** Fundo das telas: `bg-fundo` no claro e `dark:bg-fundo-escuro` no escuro. */
const FUNDO_CLARO = "#FFF8E1";
const FUNDO_ESCURO = "#121212";
/** Texto: `text-texto` no claro e `dark:text-texto-escuro` no escuro. */
const TEXTO_CLARO = "#1E2A2F";
const TEXTO_ESCURO = "#ECEFF1";

/**
 * Cores do cabeçalho nativo do Stack (a barra com a seta de voltar do cadastro).
 * O className não chega nele: sem isso, no tema escuro a barra ficava branca. Usa
 * a mesma cor do fundo da tela e tira a linha de sombra, como no Afetto.
 */
export function opcoesCabecalhoNativo(escuro: boolean) {
  return {
    headerStyle: { backgroundColor: escuro ? FUNDO_ESCURO : FUNDO_CLARO },
    headerTintColor: escuro ? TEXTO_ESCURO : TEXTO_CLARO,
    headerShadowVisible: false,
  };
}
