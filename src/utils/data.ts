/** Converte YYYY-MM-DD → DD/MM/AAAA (formato de exibição). */
export function converterDataParaBR(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}
