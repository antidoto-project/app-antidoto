import { AvistamentoSchema } from "@/schemas/avistamento.schema";

const VALIDO = {
  tipoAnimal: "ESCORPIAO",
  local: "QUINTAL",
  localizacao: { latitude: -23.55, longitude: -46.63 },
  observacao: "Vi perto do ralo do banheiro",
};

/** A mensagem de erro de um campo. */
function erroDe(dados: unknown, campo: string) {
  const resultado = AvistamentoSchema.safeParse(dados);
  return resultado.error?.issues.find(({ path }) => path[0] === campo)?.message;
}

// MVP-02 §11: válido; sem localização; observação com mais de 500 caracteres
describe("AvistamentoSchema", () => {
  it("aceita um avistamento completo", () => {
    expect(AvistamentoSchema.safeParse(VALIDO).success).toBe(true);
  });

  it("a observação é opcional", () => {
    expect(AvistamentoSchema.safeParse({ ...VALIDO, observacao: "" }).success).toBe(true);
  });

  it("sem localização: pede para usar a localização", () => {
    expect(erroDe({ ...VALIDO, localizacao: undefined }, "localizacao")).toBe(
      "Toque em “Usar minha localização”"
    );
  });

  it("localização fora do Brasil (limites do contrato) não passa", () => {
    expect(
      erroDe({ ...VALIDO, localizacao: { latitude: 40.7, longitude: -74.0 } }, "localizacao")
    ).toBe("A localização precisa ser no Brasil");
  });

  it("observação com mais de 500 caracteres não passa", () => {
    expect(erroDe({ ...VALIDO, observacao: "a".repeat(501) }, "observacao")).toBe(
      "A observação pode ter até 500 caracteres"
    );
    expect(AvistamentoSchema.safeParse({ ...VALIDO, observacao: "a".repeat(500) }).success).toBe(
      true
    );
  });

  it("sem animal ou sem local: mensagens próprias", () => {
    expect(erroDe({ ...VALIDO, tipoAnimal: undefined }, "tipoAnimal")).toBe(
      "Escolha o animal (ou “Não sei”)"
    );
    expect(erroDe({ ...VALIDO, local: "PRAIA" }, "local")).toBe("Escolha onde você viu");
  });
});
