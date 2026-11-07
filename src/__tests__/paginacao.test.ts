import { extrairLista, type Pagina } from "@/api/paginacao";

describe("extrairLista", () => {
  it("devolve o `conteudo` da página da API", () => {
    const pagina: Pagina<{ id: number }> = {
      conteudo: [{ id: 1 }, { id: 2 }],
      pagina: 0,
      tamanho: 20,
      totalElementos: 2,
      totalPaginas: 1,
    };

    expect(extrairLista(pagina)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("aceita um array puro", () => {
    expect(extrairLista([{ id: 3 }])).toEqual([{ id: 3 }]);
  });

  it("resposta vazia ou fora do formato vira lista vazia", () => {
    expect(extrairLista(null)).toEqual([]);
    expect(extrairLista(undefined)).toEqual([]);
    expect(extrairLista({ conteudo: "x" })).toEqual([]);
  });
});
