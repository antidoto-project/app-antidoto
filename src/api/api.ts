import { create } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

/*
 * Cliente HTTP da API Java do Antídoto (contrato: docs/api/openapi-mvp.yaml).
 * A autenticação é por JWT, no cabeçalho `Authorization: Bearer`. O interceptor
 * que coloca o token e trata o 401 entra no Passo 2, junto com o SessaoContext.
 * Nenhuma chave de API fica no app: só o endereço, que vem do .env.
 */

/** Porta da API Java no computador de desenvolvimento (`server.port` do Spring). */
export const PORTA_API_LOCAL = 8080;

/** Tempo máximo de espera por uma resposta (MVP-02 §5.1). */
export const TEMPO_LIMITE_API_MS = 10_000;

/**
 * Endereço da API:
 * 1. `EXPO_PUBLIC_API_URL`, quando definida: o mock do contrato (Prism, porta
 *    4010) ou a API na Azure (https). No build que vai para o celular ela é
 *    obrigatória (ver app.config.ts).
 * 2. Senão, a API Java no mesmo computador que roda o Expo. O endereço desse
 *    computador vem do próprio Expo (`hostUri`, ex.: "192.168.0.10:8081"). Não
 *    dá para fixar "localhost": no celular, localhost é o próprio celular. No
 *    navegador, usa o mesmo endereço da página.
 * 3. Sem esse dado, localhost.
 */
export function definirUrlDaApi(): string {
  const configurada = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configurada) return configurada;

  const computador =
    Platform.OS === "web"
      ? globalThis.location?.hostname
      : Constants.expoConfig?.hostUri?.split(":")[0];

  return `http://${computador || "localhost"}:${PORTA_API_LOCAL}`;
}

const urlBase = definirUrlDaApi();

if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
  console.log(`[api] Usando a API local em ${urlBase}`);
}

export const api = create({
  baseURL: urlBase,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: TEMPO_LIMITE_API_MS,
});
