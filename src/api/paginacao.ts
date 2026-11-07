/** Lista paginada da API Java (schema `Pagina` do contrato; parâmetros `pagina` e `tamanho`). */
export type Pagina<T> = {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
};

/** Os itens de uma resposta paginada. Aceita também um array puro, como no Afetto. */
export function extrairLista<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const conteudo = (data as Partial<Pagina<T>> | null | undefined)?.conteudo;
  return Array.isArray(conteudo) ? conteudo : [];
}
