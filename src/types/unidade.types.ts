import type { TipoAnimal, TipoSoro, TipoUnidade } from "@/types/enums.types";

/** Schema `UnidadeProxima` do contrato (GET /api/unidades/proximas). */
export type UnidadeProxima = {
  id: number;
  nome: string;
  tipo: TipoUnidade;
  endereco: string;
  /** Só os dígitos, com DDD. */
  telefone: string;
  latitude: number;
  longitude: number;
  atende24h: boolean;
  /** Arredondada para 1 casa decimal pela API. */
  distanciaKm: number;
  /** Só os soros da unidade que servem para o animal (RN-S3); vazia na abelha. */
  sorosCompativeis: TipoSoro[];
};

export type Coordenadas = { latitude: number; longitude: number };

export type BuscaUnidadesProximas = Coordenadas & { tipoAnimal: TipoAnimal };
