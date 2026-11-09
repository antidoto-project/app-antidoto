import type { PrimeirosSocorros } from "@/types/conteudo.types";
import type { TipoAnimal } from "@/types/enums.types";

/*
 * Conteúdo de primeiros socorros do MVP-02 §6. É LOCAL (não vem da API): o SOS
 * não pode depender da internet. Fica num service que devolve uma Promise para
 * o hook seguir o padrão useQuery e a origem poder virar API depois sem mexer
 * na tela.
 *
 * ⚠️ Revisar com o material do Ministério da Saúde antes da apresentação.
 * NUNCA escrever dose, remédio ou tratamento aqui (CLAUDE.md §1).
 */

const FACA = [
  "Afaste-se do animal.",
  "Lave o local com água e sabão.",
  "Mantenha a vítima em repouso.",
  "Tire anéis, pulseiras e calçados apertados.",
  "Vá já para a unidade de saúde indicada.",
];

const NAO_FACA = [
  "Amarrar o local ou fazer torniquete.",
  "Cortar, furar ou espremer o local.",
  "Sugar o veneno.",
  "Colocar folhas, pó de café, terra, álcool ou qualquer outra coisa.",
  "Dar bebida alcoólica ou remédio caseiro.",
  "Esperar os sintomas aparecerem.",
];

const NAO_CAPTURAR = "Não tente capturar o animal. Se for seguro, tire uma foto de longe.";

const ATENCAO: Record<TipoAnimal, string[]> = {
  ESCORPIAO: [
    "Compressa morna pode aliviar a dor no caminho.",
    "Crianças e idosos podem piorar rápido.",
    "Prevenção: sacuda roupas, toalhas e calçados; vede os ralos; não acumule entulho.",
  ],
  SERPENTE: [
    "Mantenha o membro picado parado e a vítima deitada, se possível.",
    "Pálpebras caídas, visão turva ou sangramento: é emergência, ligue 192.",
    "Prevenção: use botas e luvas no trabalho rural; não ponha a mão em buracos.",
  ],
  ARANHA: [
    "A aranha-marrom quase não dói, mas a lesão aparece horas depois: vá mesmo sem dor.",
    "A armadeira causa dor forte na hora.",
  ],
  LAGARTA: [
    "Lave com água fria e faça compressas frias.",
    "A taturana pode causar sangramento horas depois: procure atendimento.",
  ],
  ABELHA: [
    "Tire os ferrões raspando com um cartão, sem pinça.",
    "Muitas picadas, inchaço no rosto ou na garganta ou alergia conhecida: ligue 192.",
  ],
  NAO_SEI: ["Siga as orientações gerais e vá à unidade de saúde indicada."],
};

export const conteudoService = {
  async buscarPrimeirosSocorros(tipoAnimal: TipoAnimal): Promise<PrimeirosSocorros> {
    return {
      tipoAnimal,
      faca: FACA,
      naoFaca: NAO_FACA,
      atencao: [...ATENCAO[tipoAnimal], NAO_CAPTURAR],
    };
  },
};
