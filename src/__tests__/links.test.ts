import { linkLigar, linkRota } from "@/utils/links";
import { formatarDistancia } from "@/utils/unidade";

describe("linkLigar", () => {
  it("abre o discador só com os dígitos", () => {
    expect(linkLigar("0800 722 6001")).toBe("tel:08007226001");
    expect(linkLigar("(11) 3000-0000")).toBe("tel:1130000000");
  });
});

describe("linkRota", () => {
  it("abre a rota no Google Maps até as coordenadas da unidade", () => {
    expect(linkRota(-23.5505, -46.6333)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=-23.5505,-46.6333"
    );
  });
});

describe("formatarDistancia", () => {
  it.each([
    [0.004, "10 m"],
    [0.85, "850 m"],
    [0.996, "1000 m"],
    [1, "1,0 km"],
    [2.4, "2,4 km"],
    [12.36, "12,4 km"],
  ])("%d km → %s", (km, esperado) => {
    expect(formatarDistancia(km)).toBe(esperado);
  });
});
