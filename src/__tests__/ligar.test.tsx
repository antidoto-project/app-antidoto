import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

import { BotaoLigar192 } from "@/components/sos/BotaoLigar192";
import { CartaoUnidade } from "@/components/sos/CartaoUnidade";
import { TelefonesUteis } from "@/components/sos/TelefonesUteis";
import type { UnidadeProxima } from "@/types/unidade.types";

const HOSPITAL: UnidadeProxima = {
  id: 1,
  nome: "Hospital Exemplo Centro",
  tipo: "HOSPITAL",
  endereco: "Rua Exemplo, 100 - Centro, São Paulo/SP",
  telefone: "1130000000",
  latitude: -23.5505,
  longitude: -46.6333,
  atende24h: true,
  distanciaKm: 2.4,
  sorosCompativeis: ["ANTIESCORPIONICO"],
};

let alerta: jest.SpyInstance;

beforeEach(() => {
  jest.restoreAllMocks();
  // O aparelho não abre o link (ex.: tablet sem chip, sem app de mapas)
  jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("sem app para abrir"));
  alerta = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
});

describe("Ligar e Rota quando o aparelho não abre o link", () => {
  it("'Ligar 192': o aviso repete o número", async () => {
    render(<BotaoLigar192 />);
    fireEvent.press(screen.getByLabelText("Ligar 192, SAMU"));

    await waitFor(() =>
      expect(alerta).toHaveBeenCalledWith(
        "Não deu para abrir o telefone",
        "Ligue 192 pelo discador do aparelho."
      )
    );
  });

  it("telefones úteis (RN-G8): o aviso mostra o número tocado", async () => {
    render(<TelefonesUteis />);
    fireEvent.press(screen.getByLabelText("Ligar para Bombeiros, 193"));

    await waitFor(() =>
      expect(alerta).toHaveBeenCalledWith(
        "Não deu para abrir o telefone",
        "Ligue 193 pelo discador do aparelho."
      )
    );
  });

  it("unidade: 'Ligar' mostra o telefone formatado e 'Rota' mostra o endereço", async () => {
    render(<CartaoUnidade unidade={HOSPITAL} semSoro={false} />);

    fireEvent.press(screen.getByLabelText("Ligar para Hospital Exemplo Centro"));
    await waitFor(() =>
      expect(alerta).toHaveBeenCalledWith(
        "Não deu para abrir o telefone",
        "Ligue (11) 3000-0000 pelo discador do aparelho."
      )
    );

    fireEvent.press(screen.getByLabelText("Rota até Hospital Exemplo Centro"));
    await waitFor(() =>
      expect(alerta).toHaveBeenCalledWith(
        "Não deu para abrir o mapa",
        "Endereço: Rua Exemplo, 100 - Centro, São Paulo/SP"
      )
    );
  });
});
