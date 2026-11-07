import { isAxiosError } from "axios";

/**
 * Corpo dos erros da API Java (schema `Erro` do contrato). Em todos os erros
 * vem a `mensagem`; os `campos` só vêm no 400 de validação.
 */
export type ErroDaApi = {
  status?: number;
  erro?: string;
  mensagem?: string;
  campos?: { campo: string; mensagem: string }[];
  caminho?: string;
  timestamp?: string;
};

/** Classificação padronizada dos erros de API usados em todo o app. */
export type TipoErroApi =
  "rede" | "tempo_esgotado" | "nao_autenticado" | "nao_encontrado" | "servidor" | "desconhecido";

export function classificarErro(error: unknown): TipoErroApi {
  if (!isAxiosError(error)) return "desconhecido";
  if (error.code === "ECONNABORTED") return "tempo_esgotado";
  if (!error.response) return "rede";

  const status = error.response.status;
  if (status === 401) return "nao_autenticado";
  if (status === 404) return "nao_encontrado";
  if (status >= 500) return "servidor";
  return "desconhecido";
}

export function mensagemPorTipo(tipo: TipoErroApi): string {
  switch (tipo) {
    case "rede":
      // Texto do MVP-02 §5.1
      return "Sem conexão. Tente novamente.";
    case "tempo_esgotado":
      return "O servidor demorou para responder. Tente novamente.";
    case "nao_autenticado":
      return "Sua sessão expirou. Faça login novamente.";
    case "nao_encontrado":
      return "Não encontrado.";
    case "servidor":
      return "Erro no servidor. Tente novamente em instantes.";
    default:
      return "Algo deu errado. Tente novamente.";
  }
}

export function mensagemErroApi(error: unknown): string {
  return mensagemPorTipo(classificarErro(error));
}

function corpoDoErro(error: unknown): ErroDaApi | null {
  if (!isAxiosError(error)) return null;
  const corpo = error.response?.data;
  return corpo && typeof corpo === "object" ? (corpo as ErroDaApi) : null;
}

/**
 * A mensagem que a própria API manda no erro (`mensagem`), pronta para a tela.
 * Sem ela (ex.: sem conexão), cai na mensagem padrão do tipo de erro.
 */
export function mensagemDaApi(error: unknown): string {
  const mensagem = corpoDoErro(error)?.mensagem;
  if (typeof mensagem === "string" && mensagem.trim()) return mensagem.trim();
  return mensagemErroApi(error);
}

/**
 * Erros por campo do 400 de validação (`campos[]`), no formato campo → mensagem,
 * para a tela passar ao `setError` do react-hook-form. O que não for de um campo
 * do formulário vai para `setError("root")` com a `mensagemDaApi`. Fora do 400,
 * devolve vazio.
 */
export function errosDeCampoDaApi(error: unknown): Record<string, string> {
  if (!isAxiosError(error) || error.response?.status !== 400) return {};

  const campos = corpoDoErro(error)?.campos;
  if (!Array.isArray(campos)) return {};

  const erros: Record<string, string> = {};
  for (const item of campos) {
    const valido = item && typeof item.campo === "string" && typeof item.mensagem === "string";
    // Mais de uma mensagem para o mesmo campo: fica a primeira
    if (valido && !(item.campo in erros)) erros[item.campo] = item.mensagem;
  }
  return erros;
}

/** O que a tela faz com um erro da API num formulário (MVP-02 §5.1). */
export type ErrosNoFormulario<Campo extends string> = {
  /** Vai para o `setError` de cada campo. */
  porCampo: { campo: Campo; mensagem: string }[];
  /** Vai para o `setError("root")`; `null` quando todos os erros caíram em campos. */
  geral: string | null;
};

/**
 * Divide o erro da API entre os campos do formulário e a mensagem geral: no 400,
 * cada item de `campos[]` com um campo que existe na tela vai para o campo; o
 * resto (campo que a tela não tem, 409, 500, sem conexão...) vira a mensagem geral.
 */
export function errosDaApiNoFormulario<Campo extends string>(
  error: unknown,
  camposDaTela: readonly Campo[]
): ErrosNoFormulario<Campo> {
  const porCampo: { campo: Campo; mensagem: string }[] = [];
  let semCampoNaTela: string | null = null;

  for (const [campo, mensagem] of Object.entries(errosDeCampoDaApi(error))) {
    const daTela = camposDaTela.find((nome) => nome === campo);
    if (daTela) porCampo.push({ campo: daTela, mensagem });
    else semCampoNaTela ??= mensagem;
  }

  const geral = semCampoNaTela ?? (porCampo.length === 0 ? mensagemDaApi(error) : null);
  return { porCampo, geral };
}
