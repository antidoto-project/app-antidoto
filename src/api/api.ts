import { create, isAxiosError } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

/*
 * Cliente HTTP da API Java do Antídoto (contrato: docs/api/openapi-mvp.yaml).
 * A autenticação é por JWT, no cabeçalho `Authorization: Bearer` (interceptors
 * no fim do arquivo). Quem guarda o token é o SessaoContext.
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

// No desenvolvimento, o terminal do Expo mostra para onde o app manda as chamadas
// (o primeiro passo quando a tela diz "Sem conexão"). Nos testes, fica quieto.
if (__DEV__ && process.env.NODE_ENV !== "test") {
  const origem = process.env.EXPO_PUBLIC_API_URL
    ? "EXPO_PUBLIC_API_URL do .env"
    : "sem .env: API Java local, porta 8080";
  console.log(`[api] Endereço da API: ${urlBase} (${origem})`);
}

export const api = create({
  baseURL: urlBase,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: TEMPO_LIMITE_API_MS,
});

// ─── Sessão (JWT) ────────────────────────────────────────────────────────────

// Token da sessão atual. Só o SessaoContext muda (ao entrar, sair, abrir o app).
let tokenDeAcesso: string | null = null;

export function definirTokenDeAcesso(token: string | null) {
  tokenDeAcesso = token;
}

// Quem cuida da sessão expirada: o SessaoContext registra um tratador que limpa
// a sessão local; o <RotaProtegida> reage sozinho e manda para o login.
type TratadorSessaoExpirada = () => void;
let tratadorSessaoExpirada: TratadorSessaoExpirada | null = null;

export function definirTratadorSessaoExpirada(tratador: TratadorSessaoExpirada | null) {
  tratadorSessaoExpirada = tratador;
}

api.interceptors.request.use((config) => {
  if (tokenDeAcesso) config.headers.set("Authorization", `Bearer ${tokenDeAcesso}`);
  return config;
});

// 401 numa chamada que levou o token = sessão inválida ou expirada (o JWT do MVP
// dura 24 h): sai e volta ao login (MVP-02 §5.1). Sem token — o próprio login —
// o 401 é só "E-mail ou senha incorretos", e quem trata é a tela.
// Não há tratamento global para 403: é "sem permissão", não sessão inválida.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const levouToken = isAxiosError(erro) && Boolean(erro.config?.headers?.Authorization);
    if (levouToken && erro.response?.status === 401) tratadorSessaoExpirada?.();

    // Chamada sem resposta (servidor fora, endereço errado, rede bloqueada) é o que
    // a tela mostra como "Sem conexão": no desenvolvimento, o terminal mostra o
    // endereço completo e o motivo
    if (__DEV__ && isAxiosError(erro) && !erro.response) {
      const endereco = `${erro.config?.baseURL ?? ""}${erro.config?.url ?? ""}`;
      console.warn(
        `[api] Sem resposta de ${endereco}: ${erro.message} (${erro.code ?? "sem código"})`
      );
    }

    return Promise.reject(erro);
  }
);
