import { useQuery } from "@tanstack/react-query";

import { unidadeService } from "@/services/unidade.service";
import type { TipoAnimal } from "@/types/enums.types";
import type { Coordenadas } from "@/types/unidade.types";

/**
 * Unidades mais próximas com soro compatível. Só busca depois que o GPS deu as
 * coordenadas (`null` enquanto não deu). Fica 5 min em cache (queryClient.ts).
 */
export function useUnidadesProximas(coordenadas: Coordenadas | null, tipoAnimal: TipoAnimal) {
  return useQuery({
    queryKey: [
      "unidades",
      "proximas",
      coordenadas?.latitude,
      coordenadas?.longitude,
      tipoAnimal,
    ] as const,
    queryFn: () => {
      // Não acontece: sem coordenadas a busca nem roda (enabled)
      if (!coordenadas) throw new Error("Sem a localização");
      return unidadeService.buscarProximas({ ...coordenadas, tipoAnimal });
    },
    enabled: coordenadas !== null,
  });
}
