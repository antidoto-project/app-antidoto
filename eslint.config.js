// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierRecomendado = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  // Formatação pelo Prettier (.prettierrc): fora do padrão vira erro no `npm run lint`
  prettierRecomendado,
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
]);
