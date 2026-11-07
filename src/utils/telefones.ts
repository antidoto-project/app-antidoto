/** Telefones úteis (RN-G8, MVP-00 §4.5). */
export const TELEFONES_UTEIS = [
  { nome: "SAMU", numero: "192" },
  { nome: "Bombeiros", numero: "193" },
  { nome: "Disque-Intoxicação", numero: "0800 722 6001" },
] as const;

/** Link que abre o discador com o número (o `Linking` do React Native, sem biblioteca). */
export function linkLigar(telefone: string): string {
  return `tel:${telefone.replace(/\D/g, "")}`;
}
