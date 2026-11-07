import { mascararTelefone, somenteDigitos } from "@/utils/mascaras";
import { linkLigar, TELEFONES_UTEIS } from "@/utils/telefones";

describe("mascararTelefone", () => {
  it.each([
    ["", ""],
    ["1", "(1"],
    ["11", "(11"],
    ["119", "(11) 9"],
    ["1130000000", "(11) 3000-0000"],
    ["11999990000", "(11) 99999-0000"],
    ["(11) 99999-00001", "(11) 99999-0000"],
  ])("%s → %s", (digitado, esperado) => {
    expect(mascararTelefone(digitado)).toBe(esperado);
  });
});

describe("somenteDigitos", () => {
  it("tira a máscara (o que a API recebe)", () => {
    expect(somenteDigitos("(11) 99999-0000")).toBe("11999990000");
  });
});

describe("telefones úteis (RN-G8)", () => {
  it("SAMU 192, Bombeiros 193 e Disque-Intoxicação 0800 722 6001", () => {
    expect(TELEFONES_UTEIS.map(({ numero }) => numero)).toEqual(["192", "193", "0800 722 6001"]);
  });

  it("o link do discador leva só os dígitos", () => {
    expect(linkLigar("0800 722 6001")).toBe("tel:08007226001");
  });
});
