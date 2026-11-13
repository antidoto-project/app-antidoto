import { useQuery } from "@tanstack/react-query";

import { conteudoService } from "@/services/conteudo.service";
import type { TipoAnimal } from "@/types/enums.types";

/** Primeiros socorros do animal (da API): o texto não muda enquanto o app está aberto. */
export function usePrimeirosSocorros(tipoAnimal: TipoAnimal) {
  return useQuery({
    queryKey: ["conteudo", "primeiros-socorros", tipoAnimal] as const,
    queryFn: () => conteudoService.buscarPrimeirosSocorros(tipoAnimal),
    staleTime: Infinity,
  });
}
