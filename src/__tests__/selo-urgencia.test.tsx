import { render, screen } from "@testing-library/react-native";

import { SeloUrgencia } from "@/components/sos/SeloUrgencia";
import type { Urgencia } from "@/types/enums.types";

// MVP-02 §11: a urgência sempre com texto + ícone, nunca só a cor
describe("SeloUrgencia", () => {
  it.each([
    ["EMERGENCIA", "Emergência", "alert-circle"],
    ["ALTA", "Alta", "warning"],
    ["MODERADA", "Moderada", "information-circle"],
  ] as [Urgencia, string, string][])(
    "%s: texto '%s' e ícone '%s'",
    async (urgencia, texto, icone) => {
      render(<SeloUrgencia urgencia={urgencia} />);

      expect(await screen.findByText(texto)).toBeTruthy();
      expect(screen.getByLabelText(`Urgência ${texto}`)).toBeTruthy();
      expect(screen.UNSAFE_getByProps({ name: icone })).toBeTruthy();
    }
  );
});

describe("SeloUrgencia compacto (listas)", () => {
  it("também tem texto e ícone", async () => {
    render(<SeloUrgencia urgencia="ALTA" compacto />);

    expect(await screen.findByText("Alta")).toBeTruthy();
    expect(screen.getByLabelText("Urgência Alta")).toBeTruthy();
    expect(screen.UNSAFE_getByProps({ name: "warning" })).toBeTruthy();
  });
});
