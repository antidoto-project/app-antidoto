/**
 * Distância para a tela: 0,85 → "850 m"; 2,4 → "2,4 km" (como o
 * formatarDistancia do Afetto). Abaixo de 1 km, arredonda para dezenas de metros.
 */
export function formatarDistancia(km: number): string {
  if (km < 1) return `${Math.max(Math.round((km * 1000) / 10) * 10, 10)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}
