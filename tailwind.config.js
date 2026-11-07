/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Paleta da identidade visual do Antídoto; as cores de
      // urgência (alta, moderada) e os tons do tema escuro vêm do MVP-02 §7.
      // Use sempre a classe (bg-marca, text-emergencia...), nunca o #hex no style.
      colors: {
        // Verde escuro
        marca: "#0B6E4F",
        // Verde vivo: a marca sobre o fundo escuro
        "marca-claro": "#2BB673",
        // Vermelho SOS: só o botão SOS, o selo EMERGENCIA e o 192
        emergencia: "#C62828",
        alta: "#EF6C00",
        moderada: "#F9A825",
        // Creme
        fundo: "#FFF8E1",
        "fundo-escuro": "#121212",
        // Grafite
        texto: "#1E2A2F",
        "texto-escuro": "#ECEFF1",
      },
      // Inter, carregada no _layout.tsx raiz (useFonts). No Android o peso vem
      // do arquivo da fonte, não do fontWeight: use font-inter-semibold e
      // font-inter-bold em vez de font-semibold e font-bold.
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
