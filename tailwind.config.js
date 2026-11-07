/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Identidade visual do MVP-02 §7. Use sempre a classe (bg-marca,
      // text-emergencia...), nunca o #hex no style.
      colors: {
        marca: "#1B5E20",
        "marca-claro": "#4C8C4A",
        // Só o botão SOS, o selo EMERGENCIA e o 192
        emergencia: "#C62828",
        alta: "#EF6C00",
        moderada: "#F9A825",
        fundo: "#FFF8E1",
        "fundo-escuro": "#121212",
        texto: "#263238",
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
