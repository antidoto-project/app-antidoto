/** Só os dígitos de um texto (o que a API espera em telefone). */
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Telefone com DDD: (11) 99999-0000 (celular) ou (11) 3000-0000 (fixo).
 * Serve para o campo (vai formatando enquanto digita) e para mostrar o número
 * que a API devolve só com dígitos.
 */
export function mascararTelefone(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : "";

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  // 9 dígitos depois do DDD (celular): 5 + 4; até 8 (fixo): 4 + 4
  const corte = numero.length > 8 ? 5 : 4;
  const fim = numero.slice(corte);
  return `(${ddd}) ${numero.slice(0, corte)}${fim ? `-${fim}` : ""}`;
}
