/*
 * Links que o `Linking` do React Native abre, sem biblioteca (MVP-02 §4):
 * o discador do celular e a rota no Google Maps.
 */

/** Abre o discador com o número (só os dígitos: "(11) 3000-0000" → "tel:1130000000"). */
export function linkLigar(telefone: string): string {
  return `tel:${telefone.replace(/\D/g, "")}`;
}

/**
 * Rota até a unidade no Google Maps (app, se instalado, ou navegador), a partir
 * de onde a pessoa está. Usa as coordenadas: o endereço pode estar incompleto.
 */
export function linkRota(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
