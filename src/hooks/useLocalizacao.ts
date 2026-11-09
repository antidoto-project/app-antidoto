import * as Location from "expo-location";
import { useEffect, useState } from "react";

import type { Coordenadas } from "@/types/unidade.types";

/**
 * - `buscando`: pedindo a permissão ou esperando o GPS;
 * - `negada`: a pessoa não deixou usar a localização;
 * - `indisponivel`: GPS desligado ou sem sinal a tempo;
 * - `pronta`: as coordenadas chegaram.
 */
export type EstadoLocalizacao = "buscando" | "negada" | "indisponivel" | "pronta";

/** Uma posição de até 5 min atrás serve: na emergência, rapidez vale mais que precisão. */
const IDADE_MAXIMA_POSICAO_MS = 5 * 60_000;
/** Sem sinal nesse tempo, a tela mostra o erro com "Tentar novamente" em vez de girar para sempre. */
const TEMPO_MAXIMO_GPS_MS = 15_000;

function comTempoLimite<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promessa,
    new Promise<T>((_, rejeitar) =>
      setTimeout(() => rejeitar(new Error("O GPS demorou para responder")), ms)
    ),
  ]);
}

async function ultimaPosicaoRecente() {
  try {
    return await Location.getLastKnownPositionAsync({ maxAge: IDADE_MAXIMA_POSICAO_MS });
  } catch {
    return null; // nem todo aparelho guarda a última posição: pede uma nova
  }
}

/**
 * Hook de tela: a localização para as unidades próximas (expo-location). Pede a
 * permissão só quando o resultado abre, não na abertura do app.
 */
export function useLocalizacao() {
  const [estado, setEstado] = useState<EstadoLocalizacao>("buscando");
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  // Negada de vez (Android "não perguntar de novo"): só pelas configurações do aparelho
  const [podePedirDeNovo, setPodePedirDeNovo] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function localizar() {
      try {
        const permissao = await Location.requestForegroundPermissionsAsync();
        if (!ativo) return;
        if (!permissao.granted) {
          setPodePedirDeNovo(permissao.canAskAgain);
          setEstado("negada");
          return;
        }

        const posicao =
          (await ultimaPosicaoRecente()) ??
          (await comTempoLimite(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            TEMPO_MAXIMO_GPS_MS
          ));
        if (!ativo) return;
        setCoordenadas({ latitude: posicao.coords.latitude, longitude: posicao.coords.longitude });
        setEstado("pronta");
      } catch {
        if (ativo) setEstado("indisponivel");
      }
    }

    localizar();
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  function tentarNovamente() {
    setEstado("buscando");
    setTentativa((atual) => atual + 1);
  }

  return { estado, coordenadas, podePedirDeNovo, tentarNovamente };
}
